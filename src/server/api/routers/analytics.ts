import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  getCommitStats,
  getPullRequestStats,
  getContributorStats,
  getCodeHotspots,
} from "@/lib/github-analytics";

function getDaysFromPeriod(period: string): number {
  if (period === "week") return 7;
  if (period === "month") return 30;
  if (period === "quarter") return 90;
  return 7;
}

export const analyticsRouter = createTRPCRouter({
  getDeveloperMetrics: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        userId: z.string().optional(),
        startDate: z.date(),
        endDate: z.date(),
      }),
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
      }),
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
      }),
    )
    .query(async ({ ctx, input }) => {
      const daysBack = getDaysFromPeriod(input.period);
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - daysBack);

      try {
        const commits = await ctx.db.commit.findMany({
          where: {
            projectId: input.projectId,
            createdAt: {
              gte: dateFrom,
            },
          },
        });

        const totalCommits = commits.length;
        const totalLinesAdded = 0;
        const totalLinesDeleted = 0;

        const uniqueAuthors = new Set(commits.map((c) => c.commitAuthorName))
          .size;

        return {
          developer: {
            _sum: {
              commitsCount: totalCommits,
              linesAdded: totalLinesAdded,
              linesDeleted: totalLinesDeleted,
              prsCreated: 0,
              prsReviewed: 0,
              issuesClosed: 0,
            },
            _avg: {
              averageReviewTime: 0,
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
        return {
          developer: {
            _sum: {
              commitsCount: 0,
              linesAdded: 0,
              linesDeleted: 0,
              prsCreated: 0,
              prsReviewed: 0,
              issuesClosed: 0,
            },
            _avg: {
              averageReviewTime: 0,
              activeHours: 0,
              focusTimeHours: 0,
            },
          },
          team: null,
          period: input.period,
          realTimeData: false,
          lastUpdated: new Date(),
        };
      }
    }),
  getCodeHotspots: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        limit: z.number().min(1).max(50).default(10),
      }),
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
        return hotspots.slice(0, input.limit).map((hotspot) => ({
          id: `hotspot-${hotspot.path}`,
          projectId: input.projectId,
          filePath: hotspot.path,
          changeFrequency: hotspot.changes,
          linesChanged: hotspot.additions + hotspot.deletions,
          contributorsCount: hotspot.contributors.size,
          lastModified: new Date(),
          riskScore: calculateRiskScore(
            hotspot.changes,
            hotspot.contributors.size,
          ),
          createdAt: new Date(),
        }));
      } catch (error) {
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
      }),
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
            firstName: contributor.name?.split(" ")[0] || contributor.login,
            lastName: contributor.name?.split(" ").slice(1).join(" ") || "",
            imageUrl: contributor.avatar,
          },
          rank: index + 1,
          score: contributor.contributions,
        }));
      } catch (error) {
        return [];
      }
    }),
  getVelocityTrends: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        days: z.number().min(7).max(90).default(30),
      }),
    )
    .query(async ({ ctx, input }) => {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - input.days);

      try {
        const commits = await ctx.db.commit.findMany({
          where: {
            projectId: input.projectId,
            createdAt: {
              gte: dateFrom,
            },
          },
          orderBy: {
            commitDate: "asc",
          },
        });

        const dailyMetrics = new Map<
          string,
          {
            commits: number;
          }
        >();

        commits.forEach((commit) => {
          const date = new Date(commit.commitDate).toISOString().split("T")[0]!;
          const existing = dailyMetrics.get(date) || {
            commits: 0,
          };
          existing.commits += 1;
          dailyMetrics.set(date, existing);
        });

        return Array.from(dailyMetrics.entries())
          .map(([date, metrics]) => ({
            projectId: input.projectId,
            date: new Date(date),
            totalCommits: metrics.commits,
            totalPRs: 0,
            averagePRSize: 0,
            linesChanged: 0,
            velocity: metrics.commits,
          }))
          .sort((a, b) => a.date.getTime() - b.date.getTime());
      } catch (error) {
        return [];
      }
    }),
  updateMetrics: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        date: z.date().optional(),
      }),
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
      }),
    )
    .query(async ({ ctx, input }) => {
      const daysBack = getDaysFromPeriod(input.period);
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - daysBack);

      try {
        const commits = await ctx.db.commit.findMany({
          where: {
            projectId: input.projectId,
            createdAt: {
              gte: dateFrom,
            },
          },
          orderBy: {
            commitDate: "asc",
          },
        });

        const deploymentFrequency = commits.length / daysBack;

        let leadTime = 0;
        if (commits.length > 1) {
          let totalTimeGaps = 0;
          for (let i = 1; i < commits.length; i++) {
            const prevDate = new Date(commits[i - 1]!.commitDate).getTime();
            const currDate = new Date(commits[i]!.commitDate).getTime();
            totalTimeGaps += (currDate - prevDate) / (1000 * 60 * 60); // Convert to hours
          }
          leadTime = totalTimeGaps / (commits.length - 1);
        }

        let mttr = 24;
        const commitsByDay = new Map<string, Date[]>();
        commits.forEach((commit) => {
          const day = new Date(commit.commitDate).toISOString().split("T")[0]!;
          if (!commitsByDay.has(day)) {
            commitsByDay.set(day, []);
          }
          commitsByDay.get(day)!.push(new Date(commit.commitDate));
        });

        let totalRecoveryTimes = 0;
        let recoveryCount = 0;
        commitsByDay.forEach((dayCommits) => {
          if (dayCommits.length > 1) {
            dayCommits.sort((a, b) => a.getTime() - b.getTime());
            for (let i = 1; i < dayCommits.length; i++) {
              const timeDiff =
                (dayCommits[i]!.getTime() - dayCommits[i - 1]!.getTime()) /
                (1000 * 60 * 60);
              totalRecoveryTimes += timeDiff;
              recoveryCount++;
            }
          }
        });

        if (recoveryCount > 0) {
          mttr = totalRecoveryTimes / recoveryCount;
        }

        let changeFailureRate = 5;
        if (commits.length > 0) {
          const commitsPerDay = commits.length / daysBack;
          const dailyCounts = new Map<string, number>();
          commits.forEach((commit) => {
            const day = new Date(commit.commitDate)
              .toISOString()
              .split("T")[0]!;
            dailyCounts.set(day, (dailyCounts.get(day) || 0) + 1);
          });

          const counts = Array.from(dailyCounts.values());
          if (counts.length > 1) {
            const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
            const variance =
              counts.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) /
              counts.length;
            const stdDev = Math.sqrt(variance);
            changeFailureRate = Math.min(15, 5 + (stdDev / avg) * 10);
          }
        }

        return {
          deploymentFrequency: Math.max(0, deploymentFrequency),
          leadTime: Math.max(0, leadTime),
          mttr: Math.max(0, mttr),
          changeFailureRate: Math.max(0, changeFailureRate),
          rating: calculateDORArating({
            deploymentFrequency: Math.max(0, deploymentFrequency),
            leadTime: Math.max(0, leadTime),
            mttr: Math.max(0, mttr),
            changeFailureRate: Math.max(0, changeFailureRate),
          }),
          period: input.period,
          realTimeData: true,
        };
      } catch (error) {
        console.error("Error calculating DORA metrics:", error);
        return {
          deploymentFrequency: 0,
          leadTime: 0,
          mttr: 0,
          changeFailureRate: 0,
          rating: "Low",
          period: input.period,
          realTimeData: false,
        };
      }
    }),
});
async function calculateAndSaveMetrics(
  projectId: string,
  date: Date,
  db: typeof import("~/server/db").db,
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
