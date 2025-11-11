import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";
import {
  validateFileSize,
  validateFileType,
  sanitizeFilename,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZES,
} from "@/lib/validation";
import { checkRateLimitForEndpoint, RATE_LIMITS } from "@/lib/rate-limit";

const f = createUploadthing();

export const ourFileRouter = {
  chatAttachment: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    pdf: { maxFileSize: "16MB", maxFileCount: 3 },
    video: { maxFileSize: "64MB", maxFileCount: 1 },
    text: { maxFileSize: "1MB", maxFileCount: 5 },
    audio: { maxFileSize: "32MB", maxFileCount: 1 },
  })
    .middleware(async ({ files }) => {
      const user = await auth();
      if (!user.userId) throw new Error("Unauthorized");

      const { success } = await checkRateLimitForEndpoint(
        user.userId,
        "file_upload",
        RATE_LIMITS.FILE_UPLOAD,
      );

      if (!success) {
        throw new Error("Rate limit exceeded for file uploads");
      }

      for (const file of files) {
        const sanitizedName = sanitizeFilename(file.name);

        const allowedTypes = [
          ...ALLOWED_FILE_TYPES.DOCUMENTS,
          ...ALLOWED_FILE_TYPES.IMAGES,
          ...ALLOWED_FILE_TYPES.AUDIO,
        ];

        if (!validateFileType(file.type, allowedTypes)) {
          throw new Error(`File type ${file.type} is not allowed`);
        }

        if (file.name !== sanitizedName) {
        }
      }

      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url, name: sanitizeFilename(file.name) };
    }),

  meetingRecording: f({
    audio: { maxFileSize: "128MB", maxFileCount: 1 },
  })
    .middleware(async ({ files }) => {
      const user = await auth();
      if (!user.userId) throw new Error("Unauthorized");

      const { success } = await checkRateLimitForEndpoint(
        user.userId,
        "meeting_recording",
        RATE_LIMITS.FILE_UPLOAD,
      );

      if (!success) {
        throw new Error("Rate limit exceeded for meeting recordings");
      }

      for (const file of files) {
        if (!validateFileType(file.type, ALLOWED_FILE_TYPES.AUDIO)) {
          throw new Error(
            `Only audio files are allowed for meeting recordings`,
          );
        }

        if (!validateFileSize(file.size, MAX_FILE_SIZES.AUDIO)) {
          throw new Error(
            `File size exceeds maximum of ${MAX_FILE_SIZES.AUDIO}MB`,
          );
        }
      }

      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url, name: sanitizeFilename(file.name) };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
