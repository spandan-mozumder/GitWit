import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const analyticsRouter = createTRPCRouter({
  // Get developer metrics for a date range
  getDeveloperMetrics: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        userId: z.string().optional(),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = input.userId || ctx.user.userId!;

      const metrics = await ctx.db.developerMetric.findMany({
        where: {
          projectId: input.projectId,
          userId,
          date: {
            gte: input.startDate,
            lte: input.endDate,
          },
        },
        orderBy: {
          date: "asc",
        },
      });

      return metrics;
    }),

  // Get team metrics
  getTeamMetrics: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const metrics = await ctx.db.teamMetric.findMany({
        where: {
          projectId: input.projectId,
          date: {
            gte: input.startDate,
            lte: input.endDate,
          },
        },
        orderBy: {
          date: "asc",
        },
      });

      return metrics;
    }),

  // Get productivity summary
  getProductivitySummary: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        period: z.enum(["week", "month", "quarter"]).default("week"),
      })
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const startDate = getStartDate(input.period, now);

      const [developerMetrics, teamMetrics] = await Promise.all([
        ctx.db.developerMetric.aggregate({
          where: {
            projectId: input.projectId,
            date: {
              gte: startDate,
              lte: now,
            },
          },
          _sum: {
            commitsCount: true,
            linesAdded: true,
            linesDeleted: true,
            prsCreated: true,
            prsReviewed: true,
            issuesClosed: true,
          },
          _avg: {
            averageReviewTime: true,
            activeHours: true,
            focusTimeHours: true,
          },
        }),
        ctx.db.teamMetric.findMany({
          where: {
            projectId: input.projectId,
            date: {
              gte: startDate,
              lte: now,
            },
          },
          orderBy: {
            date: "desc",
          },
          take: 1,
        }),
      ]);

      return {
        developer: developerMetrics,
        team: teamMetrics[0],
        period: input.period,
      };
    }),

  // Get code hotspots
  getCodeHotspots: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const hotspots = await ctx.db.codeHotspot.findMany({
        where: {
          projectId: input.projectId,
        },
        orderBy: {
          riskScore: "desc",
        },
        take: input.limit,
      });

      return hotspots;
    }),

  // Get developer leaderboard
  getDeveloperLeaderboard: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        metric: z
          .enum([
            "commitsCount",
            "prsCreated",
            "prsReviewed",
            "issuesClosed",
            "linesAdded",
          ])
          .default("commitsCount"),
        period: z.enum(["week", "month", "all"]).default("week"),
      })
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const startDate =
        input.period === "all" ? new Date(0) : getStartDate(input.period, now);

      const leaderboard = await ctx.db.developerMetric.groupBy({
        by: ["userId"],
        where: {
          projectId: input.projectId,
          date: {
            gte: startDate,
            lte: now,
          },
        },
        _sum: {
          commitsCount: true,
          prsCreated: true,
          prsReviewed: true,
          issuesClosed: true,
          linesAdded: true,
        },
        orderBy: {
          _sum: {
            [input.metric]: "desc",
          },
        },
      });

      // Fetch user details
      const userIds = leaderboard.map((entry) => entry.userId);
      const users = await ctx.db.user.findMany({
        where: {
          id: {
            in: userIds,
          },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
        },
      });

      return leaderboard.map((entry) => ({
        ...entry,
        user: users.find((u) => u.id === entry.userId),
      }));
    }),

  // Get velocity trends
  getVelocityTrends: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        days: z.number().min(7).max(90).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const metrics = await ctx.db.teamMetric.findMany({
        where: {
          projectId: input.projectId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          date: "asc",
        },
      });

      return metrics;
    }),

  // Update metrics (called by background job)
  updateMetrics: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        date: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const date = input.date || new Date();
      await calculateAndSaveMetrics(input.projectId, date, ctx.db);
      return { success: true };
    }),

  // Get DORA metrics (DevOps Research and Assessment)
  getDoraMetrics: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        period: z.enum(["week", "month", "quarter"]).default("month"),
      })
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const startDate = getStartDate(input.period, now);

      const metrics = await ctx.db.teamMetric.findMany({
        where: {
          projectId: input.projectId,
          date: {
            gte: startDate,
            lte: now,
          },
        },
      });

      if (metrics.length === 0) {
        return null;
      }

      // Calculate DORA metrics
      const avgDeploymentFrequency =
        metrics.reduce((sum, m) => sum + m.deploymentFrequency, 0) /
        metrics.length;
      const avgLeadTime =
        metrics.reduce((sum, m) => sum + m.leadTime, 0) / metrics.length;
      const avgMTTR =
        metrics.reduce((sum, m) => sum + m.mttr, 0) / metrics.length;
      const avgChangeFailureRate =
        metrics.reduce((sum, m) => sum + m.changeFailureRate, 0) /
        metrics.length;

      return {
        deploymentFrequency: avgDeploymentFrequency,
        leadTime: avgLeadTime,
        mttr: avgMTTR,
        changeFailureRate: avgChangeFailureRate,
        rating: calculateDORArating({
          deploymentFrequency: avgDeploymentFrequency,
          leadTime: avgLeadTime,
          mttr: avgMTTR,
          changeFailureRate: avgChangeFailureRate,
        }),
      };
    }),
});

// Helper functions
function getStartDate(period: string, now: Date): Date {
  const date = new Date(now);
  switch (period) {
    case "week":
      date.setDate(date.getDate() - 7);
      break;
    case "month":
      date.setMonth(date.getMonth() - 1);
      break;
    case "quarter":
      date.setMonth(date.getMonth() - 3);
      break;
  }
  return date;
}

async function calculateAndSaveMetrics(
  projectId: string,
  date: Date,
  db: any
) {
  // This would calculate metrics from commits, PRs, etc.
  // For now, just a placeholder
  const dateOnly = new Date(date.toDateString());

  // Get all team members
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      userToProjects: {
        include: {
          user: true,
        },
      },
    },
  });

  // Calculate per-developer metrics
  for (const { user } of project.userToProjects) {
    await db.developerMetric.upsert({
      where: {
        userId_projectId_date: {
          userId: user.id,
          projectId,
          date: dateOnly,
        },
      },
      create: {
        userId: user.id,
        projectId,
        date: dateOnly,
        commitsCount: 0, // Calculate from actual commits
        linesAdded: 0,
        linesDeleted: 0,
        prsCreated: 0,
        prsReviewed: 0,
        issuesClosed: 0,
        bugIntroduced: 0,
        codeChurn: 0,
        averageReviewTime: 0,
        activeHours: 0,
        focusTimeHours: 0,
        meetingHours: 0,
      },
      update: {},
    });
  }

  // Calculate team metrics
  await db.teamMetric.upsert({
    where: {
      projectId_date: {
        projectId,
        date: dateOnly,
      },
    },
    create: {
      projectId,
      date: dateOnly,
      totalCommits: 0,
      totalPRs: 0,
      averagePRSize: 0,
      deploymentFrequency: 0,
      bugRate: 0,
      technicalDebtScore: 50,
      codeReviewCoverage: 0,
      testCoverage: 0,
      mttr: 0,
      leadTime: 0,
      changeFailureRate: 0,
    },
    update: {},
  });
}

function calculateDORArating(metrics: {
  deploymentFrequency: number;
  leadTime: number;
  mttr: number;
  changeFailureRate: number;
}): "Elite" | "High" | "Medium" | "Low" {
  // Simplified DORA rating
  let score = 0;

  // Deployment frequency (deploys per day)
  if (metrics.deploymentFrequency >= 1) score += 3;
  else if (metrics.deploymentFrequency >= 0.2) score += 2;
  else if (metrics.deploymentFrequency >= 0.03) score += 1;

  // Lead time (hours)
  if (metrics.leadTime < 24) score += 3;
  else if (metrics.leadTime < 168) score += 2;
  else if (metrics.leadTime < 720) score += 1;

  // MTTR (hours)
  if (metrics.mttr < 1) score += 3;
  else if (metrics.mttr < 24) score += 2;
  else if (metrics.mttr < 168) score += 1;

  // Change failure rate (percentage)
  if (metrics.changeFailureRate < 5) score += 3;
  else if (metrics.changeFailureRate < 10) score += 2;
  else if (metrics.changeFailureRate < 15) score += 1;

  if (score >= 10) return "Elite";
  if (score >= 7) return "High";
  if (score >= 4) return "Medium";
  return "Low";
}
