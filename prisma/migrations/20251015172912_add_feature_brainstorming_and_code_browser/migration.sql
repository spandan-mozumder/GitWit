-- CreateEnum
CREATE TYPE "FeatureComplexity" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'VERY_HARD');

-- CreateEnum
CREATE TYPE "FeatureStatus" AS ENUM ('IDEA', 'PLANNED', 'IN_PROGRESS', 'DONE', 'REJECTED');

-- CreateEnum
CREATE TYPE "FeatureCategory" AS ENUM ('NEW_FEATURE', 'ENHANCEMENT', 'BUG_FIX', 'PERFORMANCE', 'SECURITY', 'UI_UX', 'REFACTOR', 'TESTING', 'DOCUMENTATION');

-- CreateEnum
CREATE TYPE "PRStatus" AS ENUM ('OPEN', 'CLOSED', 'MERGED', 'DRAFT');

-- CreateEnum
CREATE TYPE "PRRiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "FileChangeStatus" AS ENUM ('ADDED', 'MODIFIED', 'DELETED', 'RENAMED');

-- CreateTable
CREATE TABLE "FeatureIdea" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "implementation" TEXT,
    "complexity" "FeatureComplexity" NOT NULL DEFAULT 'MEDIUM',
    "estimatedHours" INTEGER,
    "techStack" TEXT[],
    "userStories" TEXT[],
    "priority" INTEGER NOT NULL DEFAULT 3,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "status" "FeatureStatus" NOT NULL DEFAULT 'IDEA',
    "category" "FeatureCategory",
    "tags" TEXT[],
    "githubIssueUrl" TEXT,
    "jiraTicketId" TEXT,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "FeatureIdea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureVote" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,

    CONSTRAINT "FeatureVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PullRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "prNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "PRStatus" NOT NULL DEFAULT 'OPEN',
    "author" TEXT NOT NULL,
    "authorAvatar" TEXT,
    "branch" TEXT NOT NULL,
    "baseBranch" TEXT NOT NULL DEFAULT 'main',
    "filesChanged" INTEGER NOT NULL DEFAULT 0,
    "additions" INTEGER NOT NULL DEFAULT 0,
    "deletions" INTEGER NOT NULL DEFAULT 0,
    "commits" INTEGER NOT NULL DEFAULT 0,
    "aiSummary" TEXT,
    "qualityScore" INTEGER,
    "riskLevel" "PRRiskLevel",
    "hasBreakingChanges" BOOLEAN NOT NULL DEFAULT false,
    "breakingChangesDesc" TEXT,
    "testCoverageImpact" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "mergedAt" TIMESTAMP(3),
    "projectId" TEXT NOT NULL,

    CONSTRAINT "PullRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PRFile" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "status" "FileChangeStatus" NOT NULL,
    "additions" INTEGER NOT NULL DEFAULT 0,
    "deletions" INTEGER NOT NULL DEFAULT 0,
    "changes" INTEGER NOT NULL DEFAULT 0,
    "patch" TEXT,
    "aiSummary" TEXT,
    "riskScore" INTEGER,
    "pullRequestId" TEXT NOT NULL,

    CONSTRAINT "PRFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeatureVote_userId_featureId_key" ON "FeatureVote"("userId", "featureId");

-- CreateIndex
CREATE UNIQUE INDEX "PullRequest_projectId_prNumber_key" ON "PullRequest"("projectId", "prNumber");

-- AddForeignKey
ALTER TABLE "FeatureIdea" ADD CONSTRAINT "FeatureIdea_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureVote" ADD CONSTRAINT "FeatureVote_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "FeatureIdea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PullRequest" ADD CONSTRAINT "PullRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PRFile" ADD CONSTRAINT "PRFile_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "PullRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
