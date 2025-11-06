-- CreateEnum
CREATE TYPE "TranscriptionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ParticipantRole" AS ENUM ('HOST', 'CO_HOST', 'PARTICIPANT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MeetingStatus" ADD VALUE 'SCHEDULED';
ALTER TYPE "MeetingStatus" ADD VALUE 'IN_PROGRESS';
ALTER TYPE "MeetingStatus" ADD VALUE 'ENDED';
ALTER TYPE "MeetingStatus" ADD VALUE 'SUMMARIZED';

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "roomId" TEXT;

-- CreateTable
CREATE TABLE "ChatRoom" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "projectId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ChatRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomMembership" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "addedBy" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatAttachment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "messageId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedBy" TEXT NOT NULL,

    CONSTRAINT "ChatAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveMeeting" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "hostId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "status" "MeetingStatus" NOT NULL DEFAULT 'PROCESSING',
    "recordingUrl" TEXT,
    "audioFileUrl" TEXT,
    "transcriptId" TEXT,
    "transcript" TEXT,
    "transcriptionStatus" "TranscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "summaryRequested" BOOLEAN NOT NULL DEFAULT false,
    "summaryRequestedBy" TEXT,
    "summaryRequestedAt" TIMESTAMP(3),
    "summary" TEXT,
    "meetingId" TEXT,

    CONSTRAINT "LiveMeeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveMeetingParticipant" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ParticipantRole" NOT NULL DEFAULT 'PARTICIPANT',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "LiveMeetingParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoomMembership_roomId_userId_key" ON "RoomMembership"("roomId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "LiveMeetingParticipant_meetingId_userId_key" ON "LiveMeetingParticipant"("meetingId", "userId");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomMembership" ADD CONSTRAINT "RoomMembership_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatAttachment" ADD CONSTRAINT "ChatAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveMeetingParticipant" ADD CONSTRAINT "LiveMeetingParticipant_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "LiveMeeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
