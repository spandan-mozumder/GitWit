export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const validateGithubUrl = (url: string): boolean => {
  const pattern = /^https:\/\/github\.com\/[\w-]+\/[\w-]+\/?$/;
  return pattern.test(url);
};

export const validateFileType = (mimetype: string, allowed: string[]): boolean => {
  return allowed.includes(mimetype);
};

export const validateFileSize = (size: number, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return size <= maxSizeInBytes;
};

export const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateProjectName = (name: string): boolean => {
  return name.length >= 3 && name.length <= 100 && /^[a-zA-Z0-9\s-_]+$/.test(name);
};

export const sanitizeHtml = (html: string): string => {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const validateUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

export const ALLOWED_FILE_TYPES = {
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
  IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  ARCHIVES: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
  CODE: ['text/plain', 'application/json', 'text/javascript', 'text/typescript'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg'],
};

export const MAX_FILE_SIZES = {
  DOCUMENT: 10,
  IMAGE: 5,
  ARCHIVE: 50,
  AUDIO: 100,
};
