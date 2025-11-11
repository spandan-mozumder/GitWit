"use client";
import { UploadButton } from "@/lib/uploadthing";
import { toast } from "sonner";
import { Paperclip, File, Image, FileText, Video, Music } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
interface ChatFileUploadProps {
  onUploadComplete: (
    files: Array<{
      fileName: string;
      fileUrl: string;
      fileType: string;
      fileSize: number;
    }>,
  ) => void;
  disabled?: boolean;
}
export function ChatFileUpload({
  onUploadComplete,
  disabled,
}: ChatFileUploadProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-block">
            <UploadButton
              endpoint="chatAttachment"
              onClientUploadComplete={(res) => {
                if (res) {
                  const files = res.map((file) => ({
                    fileName: file.name,
                    fileUrl: file.url,
                    fileType: file.type,
                    fileSize: file.size,
                  }));
                  onUploadComplete(files);
                  toast.success(
                    `${files.length} file(s) uploaded successfully`,
                  );
                }
              }}
              onUploadError={(error: Error) => {
                toast.error(`Upload failed: ${error.message}`);
              }}
              appearance={{
                button:
                  "text-sm px-3 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground",
                allowedContent: "hidden",
              }}
              content={{
                button({ ready }) {
                  if (ready) return <Paperclip className="h-4 w-4" />;
                  return <Paperclip className="h-4 w-4 animate-pulse" />;
                },
              }}
              disabled={disabled}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Attach files (images, PDFs, videos, audio)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
interface FilePreviewProps {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  onRemove?: () => void;
}
export function FilePreview({
  fileName,
  fileType,
  fileSize,
  onRemove,
}: FilePreviewProps) {
  const getFileIcon = () => {
    if (fileType.startsWith("image/")) return <Image className="h-4 w-4" />;
    if (fileType.startsWith("video/")) return <Video className="h-4 w-4" />;
    if (fileType.startsWith("audio/")) return <Music className="h-4 w-4" />;
    if (fileType === "application/pdf") return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };
  return (
    <div className="flex items-center gap-2 p-2 bg-secondary rounded-md text-sm">
      {getFileIcon()}
      <div className="flex-1 truncate">
        <p className="truncate font-medium">{fileName}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(fileSize)}
        </p>
      </div>
      {onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-6 w-6 p-0"
        >
          ×
        </Button>
      )}
    </div>
  );
}
interface AttachmentDisplayProps {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}
export function AttachmentDisplay({
  fileName,
  fileUrl,
  fileType,
  fileSize,
}: AttachmentDisplayProps) {
  const getFileIcon = () => {
    if (fileType.startsWith("image/")) return <Image className="h-5 w-5" />;
    if (fileType.startsWith("video/")) return <Video className="h-5 w-5" />;
    if (fileType.startsWith("audio/")) return <Music className="h-5 w-5" />;
    if (fileType === "application/pdf") return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (fileType.startsWith("image/")) {
    return (
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block max-w-sm rounded-lg overflow-hidden border hover:opacity-90 transition-opacity"
      >
        <img src={fileUrl} alt={fileName} className="w-full h-auto" />
        <div className="p-2 bg-secondary text-xs">
          <p className="truncate font-medium">{fileName}</p>
          <p className="text-muted-foreground">{formatFileSize(fileSize)}</p>
        </div>
      </a>
    );
  }

  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      download={fileName}
      className="flex items-center gap-3 p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors max-w-sm"
    >
      {getFileIcon()}
      <div className="flex-1 min-w-0">
        <p className="truncate font-medium text-sm">{fileName}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(fileSize)}
        </p>
      </div>
    </a>
  );
}
