"use client"
import React, { useState } from 'react'
import { Card } from '~/components/ui/card';
import { useDropzone } from 'react-dropzone';
import { uploadFile } from '~/lib/supabase';
import { Presentation, Upload, Sparkles, FileAudio, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { toast } from 'sonner';
import { api } from '~/trpc/react';
import useProject from '~/hooks/use-project';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Spinner } from '~/components/ui/spinner';
const MeetingCard = () => {
    const project= useProject()
    const router = useRouter();
    const processMeeting= useMutation({
        mutationFn: async ( data:{meetingUrl: string, meetingId: string, projectId: string}) =>{
            const {meetingUrl, meetingId, projectId} = data;
            console.log("Processing meeting", data)
            const response =  await axios.post('/api/process-meeting',{
                meetingUrl,
                meetingId,
                projectId
            })
            return response.data
        }
    })
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string>('');
    const uploadMeeting = api.project.uploadMeeting.useMutation()
    const MAX_FILE_SIZE = 50 * 1024 * 1024; 
    const {getInputProps, getRootProps, isDragActive}= useDropzone({
        accept:{
            'audio/*':[],
        },
        multiple: false,
        maxSize: MAX_FILE_SIZE,
        onDrop: async(acceptedFiles, rejectedFiles)=> {
            if (rejectedFiles.length > 0) {
                const rejection = rejectedFiles[0];
                if (rejection?.errors[0]?.code === 'file-too-large') {
                    toast.error("File too large", {
                        description: "Maximum file size is 50MB. Please upload a smaller file.",
                        icon: <AlertCircle className="h-4 w-4" />
                    });
                } else {
                    toast.error("Invalid file", {
                        description: "Please upload an audio file (MP3, WAV, M4A)",
                        icon: <AlertCircle className="h-4 w-4" />
                    });
                }
                return;
            }
            const file = acceptedFiles[0];
            console.log("File drop:",file)
            if (!file) {
                toast.error("No file selected", {
                    description: "Please select an audio file to upload"
                });
                return
            }
            setIsUploading(true)
            setUploadProgress('Uploading file...');
            const uploadToast = toast.loading("Uploading meeting recording...", {
                description: "Please wait while we process your file"
            });
            try {
                const {  url } = await uploadFile(file as File)
                setUploadProgress('Creating meeting record...');
                uploadMeeting.mutate({
                    projectId: project.projectId,
                    meetingUrl: url as string,
                    name: file.name,
                },{
                    onSuccess: (meeting) => {
                        setUploadProgress('Processing audio...');
                        toast.dismiss(uploadToast);
                        toast.success("Meeting uploaded successfully", {
                            description: "Processing audio for insights...",
                            icon: <CheckCircle2 className="h-4 w-4" />
                        });
                        router.push('/meetings')
                        processMeeting.mutateAsync({
                            meetingUrl: url as string,
                            meetingId: meeting.id,
                            projectId: project.projectId
                        }).catch((error) => {
                            console.error("Meeting processing error:", error);
                            toast.error("Processing incomplete", {
                                description: "Meeting uploaded but analysis failed. We'll retry automatically.",
                                icon: <AlertCircle className="h-4 w-4" />
                            });
                        });
                    },
                    onError: (error) => {
                        toast.dismiss(uploadToast);
                        console.error("Upload meeting error:", error);
                        toast.error("Upload failed", {
                            description: error.message || "Unable to upload meeting. Please try again.",
                            icon: <AlertCircle className="h-4 w-4" />,
                            duration: 5000
                        });
                    }
                })
            } catch (error) {
                toast.dismiss(uploadToast);
                console.error("File upload error:", error);
                toast.error("Upload failed", {
                    description: "Network error. Please check your connection and try again.",
                    icon: <AlertCircle className="h-4 w-4" />,
                    duration: 5000
                });
            } finally {
                setIsUploading(false);
                setUploadProgress('');
            }
        },
    })
  return (
        <Card 
            className={`col-span-2 relative overflow-hidden border border-border/70 bg-card/70 transition-colors ${
                isDragActive ? 'border-primary/60 bg-primary/5' : ''
            }`} 
            {...getRootProps()}
        >
            <div className="absolute inset-x-10 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="relative flex flex-col items-center justify-center p-10 min-h-[300px]">
                {!isUploading && (
                    <div className="flex flex-col items-center text-center space-y-4 animate-fade-in">
                        <div className="rounded-full border border-primary/40 bg-primary/15 p-5">
                            <Presentation className='h-10 w-10 text-primary' />
                        </div>
                        <div className="space-y-2">
                            <h3 className='flex items-center justify-center gap-2 text-lg font-semibold'>
                                <Sparkles className="h-4 w-4 text-primary" />
                                Drop in a meeting to brief the room
                            </h3>
                            <p className='text-sm text-muted-foreground max-w-sm'>
                                Drag in a recording or select an audio file. GitWit will produce summaries, follow-ups, and
                                action items in minutes.
                            </p>
                            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                                <FileAudio className="h-3 w-3" />
                                <span>Max 50MB • MP3, WAV, M4A</span>
                            </div>
                        </div>
                        <Button 
                            disabled={isUploading}
                            size="lg"
                            className="mt-4 gap-2 rounded-full"
                        >
                            <Upload className='h-4 w-4' />
                            Choose File
                            <input className='hidden' {...getInputProps()}/>
                        </Button>
                        <div className="flex items-center gap-2 pt-2 text-xs font-medium text-primary">
                            <Sparkles className="h-3 w-3" />
                            <span>Summaries, sentiment, accountability</span>
                        </div>
                    </div>
                )}
                {isUploading && (
                    <div className='flex flex-col items-center justify-center space-y-4 animate-fade-in'>
                        <div className="relative">
                            <div className="absolute inset-0 animate-gradient-shift">
                                <Presentation className='h-16 w-16 text-primary/25'/>
                            </div>
                            <Presentation className='relative h-16 w-16 text-primary animate-pulse'/>
                        </div>
                        <div className="space-y-2 text-center">
                            <p className='text-sm font-medium flex items-center gap-2 justify-center'>
                                <Spinner className="h-4 w-4 animate-spin-slow" />
                                {uploadProgress || 'Processing your meeting…'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                This may take a few moments
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </Card>
  )
}
export default MeetingCard