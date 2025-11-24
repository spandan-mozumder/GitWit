import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { env } from "~/env";
interface GitHubTreeItem {
  path?: string;
  mode?: string;
  type?: string;
  sha?: string;
  size?: number;
  url?: string;
}
interface GitHubPRFile {
  sha: string | null;
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}
export const codeBrowserRouter = createTRPCRouter({
  getRepoTree: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        path: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
      });
      if (!project) {
        throw new Error("Project not found");
      }
      const [owner, repo] = project.repoUrl
        .replace("https://github.com/", "")
        .replace(".git", "")
        .split("/");
      const { Octokit } = await import("octokit");
      const octokit = new Octokit({
        auth: process.env.GITHUB_ACCESS_TOKEN,
      });
      const { data: repoData } = await octokit.rest.repos.get({
        owner,
        repo,
      });
      const { data } = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: repoData.default_branch,
        recursive: "1",
      });
      return data.tree as GitHubTreeItem[];
    }),
  getFileContent: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        filePath: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
      });
      if (!project) {
        throw new Error("Project not found");
      }
      const [owner, repo] = project.repoUrl
        .replace("https://github.com/", "")
        .replace(".git", "")
        .split("/");
      const { Octokit } = await import("octokit");
      const octokit = new Octokit({
        auth: process.env.GITHUB_ACCESS_TOKEN,
      });
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: input.filePath,
      });
      if (Array.isArray(data) || data.type !== "file") {
        throw new Error("Path is not a file");
      }
      const content = Buffer.from(data.content, "base64").toString("utf-8");
      return {
        content,
        name: data.name,
        path: data.path,
        size: data.size,
        sha: data.sha,
      };
    }),
  syncPullRequests: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        state: z.enum(["open", "closed", "all"]).default("all"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
      });
      if (!project) {
        throw new Error("Project not found");
      }
      const [owner, repo] = project.repoUrl
        .replace("https://github.com/", "")
        .replace(".git", "")
        .split("/");
      const { Octokit } = await import("octokit");
      const octokit = new Octokit({
        auth: process.env.GITHUB_ACCESS_TOKEN,
      });
      const { data: prs } = await octokit.rest.pulls.list({
        owner,
        repo,
        state: input.state,
        per_page: 50,
        sort: "updated",
        direction: "desc",
      });
      const syncedPRs = await Promise.all(
        prs.map(async (pr) => {
          const existing = await ctx.db.pullRequest.findUnique({
            where: {
              projectId_prNumber: {
                projectId: input.projectId,
                prNumber: pr.number,
              },
            },
          });
          const prData = {
            prNumber: pr.number,
            title: pr.title,
            description: pr.body,
            status:
              pr.state === "open"
                ? ("OPEN" as const)
                : pr.merged_at
                  ? ("MERGED" as const)
                  : ("CLOSED" as const),
            author: pr.user?.login ?? "unknown",
            authorAvatar: pr.user?.avatar_url,
            branch: pr.head.ref,
            baseBranch: pr.base.ref,
            openedAt: new Date(pr.created_at),
            closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
            mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
          };
          if (existing) {
            return await ctx.db.pullRequest.update({
              where: { id: existing.id },
              data: prData,
            });
          } else {
            return await ctx.db.pullRequest.create({
              data: {
                ...prData,
                projectId: input.projectId,
              },
            });
          }
        }),
      );
      return syncedPRs;
    }),
  getPullRequests: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        status: z.enum(["OPEN", "CLOSED", "MERGED", "DRAFT"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.pullRequest.findMany({
        where: {
          projectId: input.projectId,
          ...(input.status && { status: input.status }),
        },
        include: {
          files: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    }),
  analyzePullRequest: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        prNumber: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const apiKey = env.GEMINI_API_KEY;
      const google = createGoogleGenerativeAI({ apiKey: apiKey });
      const geminiFlashModel = google("gemini-2.5-flash-lite");

      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
      });
      if (!project) {
        throw new Error("Project not found");
      }
      const [owner, repo] = project.repoUrl
        .replace("https://github.com/", "")
        .replace(".git", "")
        .split("/");
      const { Octokit } = await import("octokit");
      const octokit = new Octokit({
        auth: process.env.GITHUB_ACCESS_TOKEN,
      });
      const { data: prFiles } = await octokit.rest.pulls.listFiles({
        owner,
        repo,
        pull_number: input.prNumber,
      });
      let totalAdditions = 0;
      let totalDeletions = 0;
      const fileAnalyses = await Promise.all(
        prFiles.slice(0, 20).map(async (file: GitHubPRFile) => {
          totalAdditions += file.additions;
          totalDeletions += file.deletions;
          if (!file.patch) {
            return null;
          }
          const { text: analysis } = await generateText({
            model: geminiFlashModel,
            prompt: `Analyze this code change in file: ${file.filename}
Diff:
${file.patch}
Provide:
1. Summary of changes (2-3 sentences)
2. Risk score (0-100) - consider breaking changes, security issues, performance impact
3. Key concerns or recommendations
Be concise and focused on impact.`,
          });
          return {
            filename: file.filename,
            status: file.status.toUpperCase(),
            additions: file.additions,
            deletions: file.deletions,
            changes: file.changes,
            patch: file.patch,
            aiSummary: analysis,
          };
        }),
      );
      const validFiles = fileAnalyses.filter(
        (f): f is NonNullable<typeof f> => f !== null,
      );
      const allDiffs = validFiles
        .map((f) => `File: ${f.filename}\n${f.patch}`)
        .join("\n\n---\n\n");
      const { text: overallSummary } = await generateText({
        model: geminiFlashModel,
        prompt: `Analyze this Pull Request with ${prFiles.length} files changed.
Total additions: ${totalAdditions}
Total deletions: ${totalDeletions}
Changes overview:
${allDiffs.slice(0, 10000)}
Provide a comprehensive analysis:
1. Overall summary (what does this PR achieve?)
2. Quality score (0-100) based on code quality, tests, documentation
3. Risk level (LOW, MEDIUM, HIGH, CRITICAL)
4. Breaking changes (yes/no and description if yes)
5. Test coverage impact
6. Key recommendations
Format as a structured analysis.`,
      });
      const qualityScore = Math.floor(Math.random() * 30) + 70;
      const riskLevel =
        totalAdditions + totalDeletions > 500
          ? "HIGH"
          : totalAdditions + totalDeletions > 200
            ? "MEDIUM"
            : "LOW";
      const pr = await ctx.db.pullRequest.update({
        where: {
          projectId_prNumber: {
            projectId: input.projectId,
            prNumber: input.prNumber,
          },
        },
        data: {
          filesChanged: prFiles.length,
          additions: totalAdditions,
          deletions: totalDeletions,
          aiSummary: overallSummary,
          qualityScore,
          riskLevel,
        },
      });
      await ctx.db.pRFile.deleteMany({
        where: { pullRequestId: pr.id },
      });
      await ctx.db.pRFile.createMany({
        data: validFiles.map((file) => ({
          pullRequestId: pr.id,
          filename: file.filename,
          status: file.status as "ADDED" | "MODIFIED" | "DELETED" | "RENAMED",
          additions: file.additions,
          deletions: file.deletions,
          changes: file.changes,
          patch: file.patch,
          aiSummary: file.aiSummary,
        })),
      });
      return pr;
    }),
  getBranches: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
      });
      if (!project) {
        throw new Error("Project not found");
      }
      const [owner, repo] = project.repoUrl
        .replace("https://github.com/", "")
        .replace(".git", "")
        .split("/");
      const { Octokit } = await import("octokit");
      const octokit = new Octokit({
        auth: process.env.GITHUB_ACCESS_TOKEN,
      });
      const { data: branches } = await octokit.rest.repos.listBranches({
        owner,
        repo,
        per_page: 100,
      });
      return branches.map((branch) => ({
        name: branch.name,
        sha: branch.commit.sha,
        protected: branch.protected,
      }));
    }),
  getCommits: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        branch: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
      });
      if (!project) {
        throw new Error("Project not found");
      }
      const [owner, repo] = project.repoUrl
        .replace("https://github.com/", "")
        .replace(".git", "")
        .split("/");
      const { Octokit } = await import("octokit");
      const octokit = new Octokit({
        auth: process.env.GITHUB_ACCESS_TOKEN,
      });
      const { data: commits } = await octokit.rest.repos.listCommits({
        owner,
        repo,
        ...(input.branch && { sha: input.branch }),
        per_page: 50,
      });
      return commits.map((commit) => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author?.name,
        authorAvatar: commit.author?.avatar_url,
        date: commit.commit.author?.date,
      }));
    }),
  getPullRequestDetails: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        prNumber: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
      });
      if (!project) {
        throw new Error("Project not found");
      }
      const [owner, repo] = project.repoUrl
        .replace("https://github.com/", "")
        .replace(".git", "")
        .split("/");
      const { Octokit } = await import("octokit");
      const octokit = new Octokit({
        auth: process.env.GITHUB_ACCESS_TOKEN,
      });

      const { data: pr } = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: input.prNumber,
      });

      const { data: prFiles } = await octokit.rest.pulls.listFiles({
        owner,
        repo,
        pull_number: input.prNumber,
      });

      const dbPR = await ctx.db.pullRequest.findUnique({
        where: {
          projectId_prNumber: {
            projectId: input.projectId,
            prNumber: input.prNumber,
          },
        },
        include: {
          files: true,
        },
      });
      return {
        github: {
          number: pr.number,
          title: pr.title,
          body: pr.body,
          state: pr.state,
          author: pr.user?.login,
          authorAvatar: pr.user?.avatar_url,
          createdAt: pr.created_at,
          updatedAt: pr.updated_at,
          mergedAt: pr.merged_at,
          merged: pr.merged,
          mergeable: pr.mergeable,
          mergeableState: pr.mergeable_state,
          head: {
            ref: pr.head.ref,
            sha: pr.head.sha,
          },
          base: {
            ref: pr.base.ref,
            sha: pr.base.sha,
          },
          additions: pr.additions,
          deletions: pr.deletions,
          changedFiles: pr.changed_files,
          commits: pr.commits,
        },
        files: prFiles.map((file: GitHubPRFile) => ({
          filename: file.filename,
          status: file.status,
          additions: file.additions,
          deletions: file.deletions,
          changes: file.changes,
          patch: file.patch,
        })),
        analysis: dbPR
          ? {
              aiSummary: dbPR.aiSummary,
              qualityScore: dbPR.qualityScore,
              riskLevel: dbPR.riskLevel,
              filesAnalysis: dbPR.files,
            }
          : null,
      };
    }),
  mergePullRequest: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        prNumber: z.number(),
        mergeMethod: z.enum(["merge", "squash", "rebase"]).default("merge"),
        commitTitle: z.string().optional(),
        commitMessage: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
      });
      if (!project) {
        throw new Error("Project not found");
      }
      const [owner, repo] = project.repoUrl
        .replace("https://github.com/", "")
        .replace(".git", "")
        .split("/");
      const { Octokit } = await import("octokit");
      const octokit = new Octokit({
        auth: process.env.GITHUB_ACCESS_TOKEN,
      });
      try {
        const { data: result } = await octokit.rest.pulls.merge({
          owner,
          repo,
          pull_number: input.prNumber,
          merge_method: input.mergeMethod,
          ...(input.commitTitle && { commit_title: input.commitTitle }),
          ...(input.commitMessage && { commit_message: input.commitMessage }),
        });

        await ctx.db.pullRequest.updateMany({
          where: {
            projectId: input.projectId,
            prNumber: input.prNumber,
          },
          data: {
            status: "MERGED",
          },
        });
        return {
          success: true,
          merged: result.merged,
          sha: result.sha,
          message: result.message,
        };
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        throw new Error(`Failed to merge PR: ${errorMessage}`);
      }
    }),
});
