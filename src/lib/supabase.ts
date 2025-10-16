import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRoleKey= process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string;
export const supabase = createClient(supabaseUrl , serviceRoleKey);
export const uploadFile = async (file: File) => {
    let safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    let filePath = `uploads/${safeFileName}`;
    let counter = 1;
    const { data: existingFiles } = await supabase.storage.from('audio-files').list('uploads/');
    const existingFileNames = existingFiles?.map(file => file.name);
    while (existingFileNames?.includes(safeFileName)) {
        const nameParts = safeFileName.split('.');
        const extension = nameParts.pop(); 
        const baseName = nameParts.join('.'); 
        safeFileName = `${baseName}-${counter}.${extension}`; 
        filePath = `uploads/${safeFileName}`;
        counter++;
    }
    const { data, error } = await supabase.storage
        .from('audio-files')
        .upload(filePath, file,{
            contentType: 'audio/*',
        });
    if (error) {
        console.error('Error uploading file:', error);
        return { success: false}; 
    }
    const { data: { publicUrl: publicURL } } = await supabase.storage
        .from('audio-files')
        .getPublicUrl(filePath);
    if (!publicURL) {
        console.error('Error getting public URL:', publicURL);
        return { success: false, message: 'Error getting public URL' }; 
    }
    console.log('File uploaded successfully:', publicURL);
    return { success: true, url: publicURL,data }; 
};