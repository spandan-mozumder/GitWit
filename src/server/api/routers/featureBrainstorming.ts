import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
const geminiFlashModel = google("gemini-1.5-flash-latest");
export const featureBrainstormingRouter = createTRPCRouter({
  generateFeatureIdeas: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      userInput: z.string(),
      count: z.number().default(5),
    }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
        include: {
          Commit: {
            take: 10,
            orderBy: { commitDate: 'desc' }
          },
          sourceCodeEmbedding: {
            take: 20
          }
        }
      });
      if (!project) {
        throw new Error("Project not found");
      }
      const recentCommits = project.Commit.map((c: { commitMessage: string }) => c.commitMessage).join('\n');
      const codeContext = project.sourceCodeEmbedding
        .map((e: { fileName: string; summary: string | null }) => `${e.fileName}: ${e.summary}`)
        .slice(0, 10)
        .join('\n');
      const { object: ideas } = await generateObject({
        model: geminiFlashModel,
        schema: z.object({
          features: z.array(z.object({
            title: z.string(),
            description: z.string(),
            implementation: z.string(),
            complexity: z.enum(['EASY', 'MEDIUM', 'HARD', 'VERY_HARD']),
            estimatedHours: z.number(),
            techStack: z.array(z.string()),
            userStories: z.array(z.string()),
            category: z.enum([
              'NEW_FEATURE', 'ENHANCEMENT', 'BUG_FIX', 'PERFORMANCE', 
              'SECURITY', 'UI_UX', 'REFACTOR', 'TESTING', 'DOCUMENTATION'
            ]),
            tags: z.array(z.string()),
          }))
        }),
        prompt: `You are a senior product manager and software architect. Analyze this project and generate ${input.count} innovative, practical feature ideas.
Project: ${project.name}
Repository: ${project.repoUrl}
User Request: "${input.userInput}"
Recent Activity:
${recentCommits}
Codebase Overview:
${codeContext}
Generate ${input.count} feature ideas that:
1. Align with the user's request
2. Build upon the existing codebase
3. Are technically feasible
4. Provide clear user value
5. Include implementation details
For each feature, provide:
- Clear, concise title
- Detailed description (2-3 sentences)
- Step-by-step implementation guide
- Realistic complexity rating
- Time estimate in hours
- Required tech stack/libraries
- 2-3 user stories in "As a [user], I want [goal] so that [benefit]" format
- Category classification
- Relevant tags
Make the ideas creative but grounded in reality.`,
      });
      const createdIdeas = await Promise.all(
        ideas.features.map(async (idea) => {
          return await ctx.db.featureIdea.create({
            data: {
              projectId: input.projectId,
              title: idea.title,
              description: idea.description,
              implementation: idea.implementation,
              complexity: idea.complexity,
              estimatedHours: idea.estimatedHours,
              techStack: idea.techStack,
              userStories: idea.userStories,
              category: idea.category,
              tags: idea.tags,
              priority: 3,
            }
          });
        })
      );
      return createdIdeas;
    }),
  getFeatureIdeas: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      status: z.enum(['IDEA', 'PLANNED', 'IN_PROGRESS', 'DONE', 'REJECTED']).optional(),
      category: z.enum([
        'NEW_FEATURE', 'ENHANCEMENT', 'BUG_FIX', 'PERFORMANCE', 
        'SECURITY', 'UI_UX', 'REFACTOR', 'TESTING', 'DOCUMENTATION'
      ]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.featureIdea.findMany({
        where: {
          projectId: input.projectId,
          ...(input.status && { status: input.status }),
          ...(input.category && { category: input.category }),
        },
        include: {
          votes: true,
        },
        orderBy: [
          { priority: 'desc' },
          { voteCount: 'desc' },
          { createdAt: 'desc' }
        ]
      });
    }),
  voteFeature: protectedProcedure
    .input(z.object({
      featureId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const existingVote = await ctx.db.featureVote.findUnique({
        where: {
          userId_featureId: {
            userId: ctx.user.userId!,
            featureId: input.featureId,
          }
        }
      });
      if (existingVote) {
        await ctx.db.featureVote.delete({
          where: { id: existingVote.id }
        });
        await ctx.db.featureIdea.update({
          where: { id: input.featureId },
          data: { voteCount: { decrement: 1 } }
        });
        return { voted: false };
      } else {
        await ctx.db.featureVote.create({
          data: {
            userId: ctx.user.userId!,
            featureId: input.featureId,
          }
        });
        await ctx.db.featureIdea.update({
          where: { id: input.featureId },
          data: { voteCount: { increment: 1 } }
        });
        return { voted: true };
      }
    }),
  updateFeatureStatus: protectedProcedure
    .input(z.object({
      featureId: z.string(),
      status: z.enum(['IDEA', 'PLANNED', 'IN_PROGRESS', 'DONE', 'REJECTED']),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.featureIdea.update({
        where: { id: input.featureId },
        data: { status: input.status }
      });
    }),
  updateFeaturePriority: protectedProcedure
    .input(z.object({
      featureId: z.string(),
      priority: z.number().min(1).max(5),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.featureIdea.update({
        where: { id: input.featureId },
        data: { priority: input.priority }
      });
    }),
  deleteFeature: protectedProcedure
    .input(z.object({
      featureId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.featureIdea.delete({
        where: { id: input.featureId }
      });
    }),
  createGitHubIssue: protectedProcedure
    .input(z.object({
      featureId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const feature = await ctx.db.featureIdea.findUnique({
        where: { id: input.featureId },
        include: { project: true }
      });
      if (!feature) {
        throw new Error("Feature not found");
      }
      const [owner, repo] = feature.project.repoUrl
        .replace('https://github.com/', '')
        .replace('.git', '')
        .split('/');
      const { Octokit } = await import('octokit');
      const octokit = new Octokit({ 
        auth: process.env.GITHUB_ACCESS_TOKEN
      });
      const issueBody = `## Description
${feature.description}
## Implementation Steps
${feature.implementation}
## Technical Details
- **Complexity:** ${feature.complexity}
- **Estimated Hours:** ${feature.estimatedHours}
- **Tech Stack:** ${feature.techStack.join(', ')}
## User Stories
${feature.userStories.map((story: string, idx: number) => `${idx + 1}. ${story}`).join('\n')}
---
*Generated by GitWit Feature Brainstorming*`;
      const issue = await octokit.rest.issues.create({
        owner,
        repo,
        title: feature.title,
        body: issueBody,
        labels: feature.tags,
      });
      await ctx.db.featureIdea.update({
        where: { id: input.featureId },
        data: { 
          githubIssueUrl: issue.data.html_url,
          status: 'PLANNED'
        }
      });
      return { issueUrl: issue.data.html_url };
    }),
});
