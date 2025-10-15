import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { 
  getRepoStats, 
  getCommitStats, 
  getPullRequestStats, 
  getContributorStats,
  getCodeHotspots 
} from "@/lib/github-analytics";

export const analyticsRouter = createTRPCRouter({
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

  getProductivitySummary: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        period: z.enum(["week", "month", "quarter"]).default("week"),
      })
    )
    .query(async ({ ctx, input }) => {
      
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
        select: { repoUrl: true },
      });

      if (!project?.repoUrl) {
        throw new Error("Project has no repository URL");
      }

      const daysBack = input.period === "week" ? 7 : input.period === "month" ? 30 : 90;

      try {
        const [commitStats, prStats] = await Promise.all([
          getCommitStats(project.repoUrl, daysBack),
          getPullRequestStats(project.repoUrl, daysBack),
        ]);

        const totalCommits = commitStats.length;
        const totalLinesAdded = commitStats.reduce((sum, c) => sum + c.additions, 0);
        const totalLinesDeleted = commitStats.reduce((sum, c) => sum + c.deletions, 0);
        const totalPRs = prStats.length;
        const mergedPRs = prStats.filter(pr => pr.mergedAt).length;
        
        const reviewTimes = prStats
          .filter(pr => pr.reviewTime !== undefined)
          .map(pr => pr.reviewTime!);
        const avgReviewTime = reviewTimes.length > 0
          ? reviewTimes.reduce((sum, time) => sum + time, 0) / reviewTimes.length
          : 0;

        return {
          developer: {
            _sum: {
              commitsCount: totalCommits,
              linesAdded: totalLinesAdded,
              linesDeleted: totalLinesDeleted,
              prsCreated: totalPRs,
              prsReviewed: mergedPRs,
              issuesClosed: 0, 
            },
            _avg: {
              averageReviewTime: avgReviewTime,
              activeHours: Math.floor(totalCommits / (daysBack / 7)) * 8, 
              focusTimeHours: Math.floor(totalCommits / (daysBack / 7)) * 6, 
            },
          },
          team: null, 
          period: input.period,
          realTimeData: true,
          lastUpdated: new Date(),
        };
      } catch (error) {
        console.error("Error fetching GitHub data:", error);
        throw new Error("Failed to fetch repository analytics");
      }
    }),

  getCodeHotspots: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
        select: { repoUrl: true },
      });

      if (!project?.repoUrl) {
        throw new Error("Project has no repository URL");
      }

      try {
        
        const hotspots = await getCodeHotspots(project.repoUrl, 90);

        return hotspots.slice(0, input.limit).map(hotspot => ({
          id: `hotspot-${hotspot.path}`,
          projectId: input.projectId,
          filePath: hotspot.path,
          changeFrequency: hotspot.changes,
          linesChanged: hotspot.additions + hotspot.deletions,
          contributorsCount: hotspot.contributors.size,
          lastModified: new Date(),
          riskScore: calculateRiskScore(hotspot.changes, hotspot.contributors.size),
          createdAt: new Date(),
        }));
      } catch (error) {
        console.error("Error fetching code hotspots:", error);
        return [];
      }
    }),

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
      
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
        select: { repoUrl: true },
      });

      if (!project?.repoUrl) {
        throw new Error("Project has no repository URL");
      }

      try {
        
        const contributors = await getContributorStats(project.repoUrl);

        return contributors.slice(0, 10).map((contributor, index) => ({
          userId: contributor.login,
          _sum: {
            commitsCount: contributor.commits,
            prsCreated: 0, 
            prsReviewed: 0, 
            issuesClosed: 0, 
            linesAdded: contributor.additions,
          },
          user: {
            id: contributor.login,
            firstName: contributor.name?.split(' ')[0] || contributor.login,
            lastName: contributor.name?.split(' ').slice(1).join(' ') || '',
            imageUrl: contributor.avatar,
          },
          rank: index + 1,
          score: contributor.contributions,
        }));
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return [];
      }
    }),

  getVelocityTrends: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        days: z.number().min(7).max(90).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
        select: { repoUrl: true },
      });

      if (!project?.repoUrl) {
        throw new Error("Project has no repository URL");
      }

      try {
        
        const commitStats = await getCommitStats(project.repoUrl, input.days);

        const dailyMetrics = new Map<string, {
          commits: number;
          additions: number;
          deletions: number;
        }>();

        commitStats.forEach(commit => {
          const date = new Date(commit.date).toISOString().split('T')[0]!;
          const existing = dailyMetrics.get(date) || {
            commits: 0,
            additions: 0,
            deletions: 0,
          };
          
          existing.commits += 1;
          existing.additions += commit.additions;
          existing.deletions += commit.deletions;
          
          dailyMetrics.set(date, existing);
        });

        return Array.from(dailyMetrics.entries())
          .map(([date, metrics]) => ({
            projectId: input.projectId,
            date: new Date(date),
            totalCommits: metrics.commits,
            totalPRs: 0, 
            averagePRSize: (metrics.additions + metrics.deletions) / metrics.commits,
            linesChanged: metrics.additions + metrics.deletions,
            velocity: metrics.commits, 
          }))
          .sort((a, b) => a.date.getTime() - b.date.getTime());
      } catch (error) {
        console.error("Error fetching velocity trends:", error);
        return [];
      }
    }),

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

  getDoraMetrics: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        period: z.enum(["week", "month", "quarter"]).default("month"),
      })
    )
    .query(async ({ ctx, input }) => {
      
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
        select: { repoUrl: true },
      });

      if (!project?.repoUrl) {
        throw new Error("Project has no repository URL");
      }

      const daysBack = input.period === "week" ? 7 : input.period === "month" ? 30 : 90;

      try {
        
        const [prStats, commitStats] = await Promise.all([
          getPullRequestStats(project.repoUrl, daysBack),
          getCommitStats(project.repoUrl, daysBack),
        ]);

        const mergedPRs = prStats.filter(pr => pr.mergedAt).length;
        const deploymentFrequency = mergedPRs / daysBack;

        const leadTimes = prStats
          .filter(pr => pr.mergedAt)
          .map(pr => {
            const created = new Date(pr.createdAt).getTime();
            const merged = new Date(pr.mergedAt!).getTime();
            return (merged - created) / (1000 * 60 * 60); 
          });
        const avgLeadTime = leadTimes.length > 0
          ? leadTimes.reduce((sum, time) => sum + time, 0) / leadTimes.length
          : 0;

        const reviewTimes = prStats
          .filter(pr => pr.reviewTime)
          .map(pr => pr.reviewTime!);
        const avgMTTR = reviewTimes.length > 0
          ? reviewTimes.reduce((sum, time) => sum + time, 0) / reviewTimes.length
          : 0;

        const closedWithoutMerge = prStats.filter(pr => pr.closedAt && !pr.mergedAt).length;
        const avgChangeFailureRate = prStats.length > 0
          ? (closedWithoutMerge / prStats.length) * 100
          : 0;

        return {
          deploymentFrequency: deploymentFrequency,
          leadTime: avgLeadTime,
          mttr: avgMTTR,
          changeFailureRate: avgChangeFailureRate,
          rating: calculateDORArating({
            deploymentFrequency: deploymentFrequency,
            leadTime: avgLeadTime,
            mttr: avgMTTR,
            changeFailureRate: avgChangeFailureRate,
          }),
          period: input.period,
          realTimeData: true,
        };
      } catch (error) {
        console.error("Error fetching DORA metrics:", error);
        return null;
      }
    }),
});

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
  
  db: typeof import("~/server/db").db
) {
  
  const dateOnly = new Date(date.toDateString());

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

  if (!project) return;

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
        commitsCount: 0, 
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
  
  let score = 0;

  if (metrics.deploymentFrequency >= 1) score += 3;
  else if (metrics.deploymentFrequency >= 0.2) score += 2;
  else if (metrics.deploymentFrequency >= 0.03) score += 1;

  if (metrics.leadTime < 24) score += 3;
  else if (metrics.leadTime < 168) score += 2;
  else if (metrics.leadTime < 720) score += 1;

  if (metrics.mttr < 1) score += 3;
  else if (metrics.mttr < 24) score += 2;
  else if (metrics.mttr < 168) score += 1;

  if (metrics.changeFailureRate < 5) score += 3;
  else if (metrics.changeFailureRate < 10) score += 2;
  else if (metrics.changeFailureRate < 15) score += 1;

  if (score >= 10) return "Elite";
  if (score >= 7) return "High";
  if (score >= 4) return "Medium";
  return "Low";
}

function calculateRiskScore(changes: number, contributors: number): number {
  
  const changeScore = Math.min(changes / 10, 100); 
  const contributorScore = contributors > 0 ? 100 / contributors : 100;
  return Math.min(Math.round((changeScore + contributorScore) / 2), 100);
}
