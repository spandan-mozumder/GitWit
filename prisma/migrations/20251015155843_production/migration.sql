-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('PROCESSING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "FindingSeverity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO');

-- CreateEnum
CREATE TYPE "FindingCategory" AS ENUM ('SECURITY', 'PERFORMANCE', 'BUG', 'CODE_SMELL', 'BEST_PRACTICE', 'DOCUMENTATION', 'TESTING', 'ACCESSIBILITY');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'CODE', 'FILE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "DocumentationType" AS ENUM ('API_REFERENCE', 'ARCHITECTURE', 'ONBOARDING', 'CHANGELOG', 'TECHNICAL_SPEC', 'USER_GUIDE');

-- CreateEnum
CREATE TYPE "DocStatus" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "HTTPMethod" AS ENUM ('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD');

-- CreateEnum
CREATE TYPE "DiagramType" AS ENUM ('ARCHITECTURE', 'SEQUENCE', 'CLASS', 'ER_DIAGRAM', 'FLOW_CHART', 'COMPONENT');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imageUrl" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "EmailAddress" TEXT NOT NULL,
    "credits" INTEGER NOT NULL DEFAULT 150,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "repoUrl" TEXT NOT NULL,
    "gitHubToken" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserToProject" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "UserToProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commit" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "commitMessage" TEXT NOT NULL,
    "commitHash" TEXT NOT NULL,
    "commitAuthorName" TEXT NOT NULL,
    "commitAuthorAvatar" TEXT NOT NULL,
    "commitDate" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "Commit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "filesRefrences" JSONB,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "meetingUrl" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "MeetingStatus" NOT NULL DEFAULT 'PROCESSING',
    "projectId" TEXT NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "start" TEXT NOT NULL,
    "end" TEXT NOT NULL,
    "gist" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceCodeEmbedding" (
    "id" TEXT NOT NULL,
    "summaryEmbedding" Vector(768),
    "sourceCode" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "SourceCodeEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeReview" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "prNumber" INTEGER,
    "prTitle" TEXT,
    "prUrl" TEXT,
    "branch" TEXT NOT NULL,
    "commitHash" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "securityScore" INTEGER NOT NULL,
    "performanceScore" INTEGER NOT NULL,
    "maintainabilityScore" INTEGER NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "projectId" TEXT NOT NULL,

    CONSTRAINT "CodeReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeReviewFinding" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "severity" "FindingSeverity" NOT NULL,
    "category" "FindingCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "lineNumber" INTEGER,
    "codeSnippet" TEXT,
    "recommendation" TEXT NOT NULL,
    "cveId" TEXT,
    "estimatedImpact" TEXT,
    "reviewId" TEXT NOT NULL,

    CONSTRAINT "CodeReviewFinding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeReviewSuggestion" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "lineNumber" INTEGER,
    "originalCode" TEXT,
    "suggestedCode" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "applied" BOOLEAN NOT NULL DEFAULT false,
    "appliedAt" TIMESTAMP(3),
    "reviewId" TEXT NOT NULL,

    CONSTRAINT "CodeReviewSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamChat" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "TeamChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "messageType" "MessageType" NOT NULL DEFAULT 'TEXT',
    "attachmentUrl" TEXT,
    "attachmentName" TEXT,
    "attachmentSize" INTEGER,
    "attachmentType" TEXT,
    "filePath" TEXT,
    "lineNumber" INTEGER,
    "codeSnippet" TEXT,
    "codeLanguage" TEXT,
    "commitHash" TEXT,
    "aiContext" TEXT,
    "userId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "parentMessageId" TEXT,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatParticipant" (
    "id" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReadAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,

    CONSTRAINT "ChatParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMention" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,

    CONSTRAINT "UserMention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageReaction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emoji" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,

    CONSTRAINT "MessageReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeAnnotation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "filePath" TEXT NOT NULL,
    "lineStart" INTEGER NOT NULL,
    "lineEnd" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "CodeAnnotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnotationReply" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "annotationId" TEXT NOT NULL,

    CONSTRAINT "AnnotationReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeveloperMetric" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "commitsCount" INTEGER NOT NULL DEFAULT 0,
    "linesAdded" INTEGER NOT NULL DEFAULT 0,
    "linesDeleted" INTEGER NOT NULL DEFAULT 0,
    "prsCreated" INTEGER NOT NULL DEFAULT 0,
    "prsReviewed" INTEGER NOT NULL DEFAULT 0,
    "issuesClosed" INTEGER NOT NULL DEFAULT 0,
    "bugIntroduced" INTEGER NOT NULL DEFAULT 0,
    "codeChurn" INTEGER NOT NULL DEFAULT 0,
    "averageReviewTime" INTEGER NOT NULL DEFAULT 0,
    "activeHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "focusTimeHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "meetingHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "DeveloperMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMetric" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "totalCommits" INTEGER NOT NULL DEFAULT 0,
    "totalPRs" INTEGER NOT NULL DEFAULT 0,
    "averagePRSize" INTEGER NOT NULL DEFAULT 0,
    "deploymentFrequency" INTEGER NOT NULL DEFAULT 0,
    "bugRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "technicalDebtScore" INTEGER NOT NULL DEFAULT 0,
    "codeReviewCoverage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "testCoverage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mttr" INTEGER NOT NULL DEFAULT 0,
    "leadTime" INTEGER NOT NULL DEFAULT 0,
    "changeFailureRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "TeamMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeHotspot" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "filePath" TEXT NOT NULL,
    "changeFrequency" INTEGER NOT NULL,
    "bugCount" INTEGER NOT NULL,
    "complexity" INTEGER NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "CodeHotspot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documentation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "docType" "DocumentationType" NOT NULL,
    "filePath" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "status" "DocStatus" NOT NULL DEFAULT 'DRAFT',
    "tags" TEXT[],
    "estimatedReadTime" INTEGER NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "Documentation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentationSection" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "heading" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "codeExamples" JSONB,
    "documentationId" TEXT NOT NULL,

    CONSTRAINT "DocumentationSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APIEndpoint" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "method" "HTTPMethod" NOT NULL,
    "path" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "lineNumber" INTEGER NOT NULL,
    "requestSchema" JSONB,
    "responseSchema" JSONB,
    "exampleRequest" TEXT,
    "exampleResponse" TEXT,
    "authenticated" BOOLEAN NOT NULL DEFAULT false,
    "rateLimit" TEXT,
    "deprecated" BOOLEAN NOT NULL DEFAULT false,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "APIEndpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchitectureDiagram" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "diagramType" "DiagramType" NOT NULL,
    "diagramCode" TEXT NOT NULL,
    "renderedUrl" TEXT,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ArchitectureDiagram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionItem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "filePath" TEXT,
    "lineNumber" INTEGER,
    "jiraId" TEXT,
    "linearId" TEXT,
    "asanaId" TEXT,
    "assigneeId" TEXT,
    "meetingId" TEXT NOT NULL,

    CONSTRAINT "ActionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "actionItemId" TEXT NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_EmailAddress_key" ON "User"("EmailAddress");

-- CreateIndex
CREATE UNIQUE INDEX "UserToProject_userId_projectId_key" ON "UserToProject"("userId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Commit_commitHash_key" ON "Commit"("commitHash");

-- CreateIndex
CREATE UNIQUE INDEX "ChatParticipant_userId_chatId_key" ON "ChatParticipant"("userId", "chatId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageReaction_userId_messageId_emoji_key" ON "MessageReaction"("userId", "messageId", "emoji");

-- CreateIndex
CREATE UNIQUE INDEX "DeveloperMetric_userId_projectId_date_key" ON "DeveloperMetric"("userId", "projectId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMetric_projectId_date_key" ON "TeamMetric"("projectId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "CodeHotspot_projectId_filePath_key" ON "CodeHotspot"("projectId", "filePath");

-- AddForeignKey
ALTER TABLE "UserToProject" ADD CONSTRAINT "UserToProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToProject" ADD CONSTRAINT "UserToProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commit" ADD CONSTRAINT "Commit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceCodeEmbedding" ADD CONSTRAINT "SourceCodeEmbedding_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeReview" ADD CONSTRAINT "CodeReview_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeReviewFinding" ADD CONSTRAINT "CodeReviewFinding_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "CodeReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeReviewSuggestion" ADD CONSTRAINT "CodeReviewSuggestion_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "CodeReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamChat" ADD CONSTRAINT "TeamChat_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "TeamChat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_parentMessageId_fkey" FOREIGN KEY ("parentMessageId") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "TeamChat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMention" ADD CONSTRAINT "UserMention_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMention" ADD CONSTRAINT "UserMention_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageReaction" ADD CONSTRAINT "MessageReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageReaction" ADD CONSTRAINT "MessageReaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeAnnotation" ADD CONSTRAINT "CodeAnnotation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeAnnotation" ADD CONSTRAINT "CodeAnnotation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnotationReply" ADD CONSTRAINT "AnnotationReply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnotationReply" ADD CONSTRAINT "AnnotationReply_annotationId_fkey" FOREIGN KEY ("annotationId") REFERENCES "CodeAnnotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeveloperMetric" ADD CONSTRAINT "DeveloperMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeveloperMetric" ADD CONSTRAINT "DeveloperMetric_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMetric" ADD CONSTRAINT "TeamMetric_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeHotspot" ADD CONSTRAINT "CodeHotspot_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documentation" ADD CONSTRAINT "Documentation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentationSection" ADD CONSTRAINT "DocumentationSection_documentationId_fkey" FOREIGN KEY ("documentationId") REFERENCES "Documentation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APIEndpoint" ADD CONSTRAINT "APIEndpoint_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchitectureDiagram" ADD CONSTRAINT "ArchitectureDiagram_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionItem" ADD CONSTRAINT "ActionItem_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionItem" ADD CONSTRAINT "ActionItem_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_actionItemId_fkey" FOREIGN KEY ("actionItemId") REFERENCES "ActionItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
