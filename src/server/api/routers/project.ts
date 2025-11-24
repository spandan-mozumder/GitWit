import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { pollCommits } from "~/lib/github";
import { indexGithubRepo } from "~/lib/github-loader";

function getPeriodDays(period: string | undefined): number | undefined {
  if (period === "week") return 7;
  if (period === "month") return 30;
  if (period === "quarter") return 90;
  return undefined;
}

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        repoUrl: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, repoUrl } = input;
      const existingProjectWithName = await ctx.db.project.findFirst({
        where: {
          name,
          userToProjects: {
            some: {
              userId: ctx.user.userId!,
            },
          },
          deletedAt: null,
        },
      });
      if (existingProjectWithName) {
        throw new Error(
          `A project with the name "${name}" already exists. Please choose a different name.`,
        );
      }
      const existingProjectWithRepo = await ctx.db.project.findFirst({
        where: {
          repoUrl,
          userToProjects: {
            some: {
              userId: ctx.user.userId!,
            },
          },
          deletedAt: null,
        },
      });
      if (existingProjectWithRepo) {
        throw new Error(
          `A project accessing this repository already exists. Repository: ${repoUrl}`,
        );
      }
      const project = await ctx.db.project.create({
        data: {
          name,
          repoUrl,
          userToProjects: {
            create: {
              userId: ctx.user.userId!,
            },
          },
        },
      });
      await ctx.db.projectMember.create({
        data: {
          projectId: project.id,
          userId: ctx.user.userId!,
          role: "ADMIN",
          invitedBy: ctx.user.userId!,
        },
      });
      await pollCommits(project.id);
      await indexGithubRepo(project.id, repoUrl);
      return project;
    }),
  getProjects: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.project.findMany({
      where: {
        userToProjects: { some: { userId: ctx.user.userId! } },
        deletedAt: null,
      },
    });
  }),
  getCommits: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        period: z.enum(["week", "month", "quarter"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { projectId, period } = input;
      pollCommits(projectId).catch((error) => {
        console.error("Failed to poll commits:", error);
      });

      const daysBack = getPeriodDays(period);
      const dateFrom = daysBack ? new Date() : undefined;
      if (dateFrom) {
        dateFrom.setDate(dateFrom.getDate() - daysBack!);
      }

      return await ctx.db.commit.findMany({
        where: {
          projectId,
          ...(dateFrom && {
            createdAt: {
              gte: dateFrom,
            },
          }),
        },
        orderBy: {
          commitDate: "desc",
        },
      });
    }),
  saveAnswer: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        question: z.string(),
        answer: z.string(),
        filesRefrences: z.any(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.question.create({
        data: {
          answer: input.answer,
          filesRefrences: input.filesRefrences,
          projectId: input.projectId,
          question: input.question,
          userId: ctx.user.userId!,
        },
      });
    }),
  getQuestions: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.question.findMany({
        where: { projectId: input.projectId },
        include: {
          user: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }),
  uploadMeeting: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        meetingUrl: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const meeting = await ctx.db.meeting.create({
        data: {
          meetingUrl: input.meetingUrl,
          name: input.name,
          projectId: input.projectId,
          status: "PROCESSING",
        },
      });
      return meeting;
    }),
  getMeetings: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.meeting.findMany({
        where: { projectId: input.projectId },
        include: {
          issues: true,
        },
      });
    }),
  deleteMeeting: protectedProcedure
    .input(
      z.object({
        meetingId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.meeting.delete({
        where: { id: input.meetingId },
      });
    }),
  getMeetingById: protectedProcedure
    .input(
      z.object({
        meetingId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.meeting.findUnique({
        where: { id: input.meetingId },
        include: {
          issues: true,
        },
      });
    }),
  deleteProject: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.project.delete({
        where: { id: input.projectId },
      });
    }),
  reindexProject: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      // Delete existing embeddings
      await ctx.db.sourceCodeEmbedding.deleteMany({
        where: { projectId: input.projectId },
      });

      // Reindex the repository
      await indexGithubRepo(project.id, project.repoUrl);

      return { success: true };
    }),
  getIndexStatus: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const count = await ctx.db.sourceCodeEmbedding.count({
        where: { projectId: input.projectId },
      });
      return {
        indexedFiles: count,
        isIndexed: count > 0,
      };
    }),
  getTeamMembers: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.userToProject.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          user: true,
        },
      });
    }),
});
