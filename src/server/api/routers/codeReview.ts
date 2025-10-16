import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { analyzeRepositoryCode } from "@/lib/code-analyzer";
export const codeReviewRouter = createTRPCRouter({
  createReview: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        branch: z.string().default("main"),
        commitHash: z.string().optional(),
        prNumber: z.number().optional(),
        prTitle: z.string().optional(),
        prUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
        select: { repoUrl: true },
      });
      if (!project?.repoUrl) {
        throw new Error("Project has no repository URL");
      }
      const review = await ctx.db.codeReview.create({
        data: {
          projectId: input.projectId,
          branch: input.branch,
          commitHash: input.commitHash || "HEAD",
          prNumber: input.prNumber,
          prTitle: input.prTitle,
          prUrl: input.prUrl,
          overallScore: 0,
          securityScore: 0,
          performanceScore: 0,
          maintainabilityScore: 0,
          status: "IN_PROGRESS",
        },
      });
      try {
        const analysis = await analyzeRepositoryCode(
          project.repoUrl,
          input.branch,
          input.commitHash
        );
        await ctx.db.codeReview.update({
          where: { id: review.id },
          data: {
            overallScore: analysis.overallScore,
            securityScore: analysis.securityScore,
            performanceScore: analysis.performanceScore,
            maintainabilityScore: analysis.maintainabilityScore,
            status: "COMPLETED",
          },
        });
        await ctx.db.codeReviewFinding.createMany({
          data: analysis.findings.map(finding => ({
            reviewId: review.id,
            severity: finding.severity,
            category: finding.category,
            title: finding.title,
            description: finding.description,
            filePath: finding.filePath,
            lineNumber: finding.lineNumber,
            codeSnippet: finding.suggestion,
            recommendation: finding.suggestion || "Review and fix this issue",
          })),
        });
        await ctx.db.codeReviewSuggestion.createMany({
          data: analysis.suggestions.map(suggestion => ({
            reviewId: review.id,
            title: suggestion.title,
            description: suggestion.description,
            filePath: "general",
            reasoning: suggestion.impact,
            impact: suggestion.impact,
            effort: suggestion.effort,
            suggestedCode: suggestion.code || "",
          })),
        });
        return await ctx.db.codeReview.findUnique({
          where: { id: review.id },
          include: {
            findings: true,
            suggestions: true,
          },
        });
      } catch (error) {
        await ctx.db.codeReview.update({
          where: { id: review.id },
          data: {
            status: "FAILED",
          },
        });
        throw new Error(`Code analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),
  getReview: protectedProcedure
    .input(z.object({ reviewId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.codeReview.findUnique({
        where: { id: input.reviewId },
        include: {
          findings: {
            orderBy: [
              { severity: "asc" },
              { createdAt: "desc" },
            ],
          },
          suggestions: {
            orderBy: { createdAt: "desc" },
          },
          project: {
            select: {
              id: true,
              name: true,
              repoUrl: true,
            },
          },
        },
      });
    }),
  getProjectReviews: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const reviews = await ctx.db.codeReview.findMany({
        where: { projectId: input.projectId },
        include: {
          findings: {
            select: {
              severity: true,
              category: true,
            },
          },
          _count: {
            select: {
              findings: true,
              suggestions: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });
      let nextCursor: string | undefined = undefined;
      if (reviews.length > input.limit) {
        const nextItem = reviews.pop();
        nextCursor = nextItem!.id;
      }
      return {
        reviews,
        nextCursor,
      };
    }),
  applySuggestion: protectedProcedure
    .input(z.object({ suggestionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.codeReviewSuggestion.update({
        where: { id: input.suggestionId },
        data: {
          applied: true,
          appliedAt: new Date(),
        },
      });
    }),
  getReviewStats: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [totalReviews, avgScores, findingsBySeverity] = await Promise.all([
        ctx.db.codeReview.count({
          where: { projectId: input.projectId },
        }),
        ctx.db.codeReview.aggregate({
          where: { projectId: input.projectId },
          _avg: {
            overallScore: true,
            securityScore: true,
            performanceScore: true,
            maintainabilityScore: true,
          },
        }),
        ctx.db.codeReviewFinding.groupBy({
          by: ["severity"],
          where: {
            review: {
              projectId: input.projectId,
            },
          },
          _count: true,
        }),
      ]);
      return {
        totalReviews,
        averageScores: avgScores._avg,
        findingsBySeverity,
      };
    }),
});
async function analyzeCode(reviewId: string, db: typeof import("~/server/db").db) {
  try {
    await db.codeReview.update({
      where: { id: reviewId },
      data: { status: "IN_PROGRESS" },
    });
    const review = await db.codeReview.findUnique({
      where: { id: reviewId },
      include: {
        project: {
          include: {
            sourceCodeEmbedding: true,
          },
        },
      },
    });
    if (!review) return;
    const findings = await generateFindings(review);
    const suggestions = await generateSuggestions(review);
    const scores = calculateScores(findings);
    await db.codeReviewFinding.createMany({
      data: findings.map((f) => ({ ...f, reviewId })),
    });
    await db.codeReviewSuggestion.createMany({
      data: suggestions.map((s) => ({ ...s, reviewId })),
    });
    await db.codeReview.update({
      where: { id: reviewId },
      data: {
        ...scores,
        status: "COMPLETED",
      },
    });
  } catch (error) {
    console.error("Error analyzing code:", error);
    await db.codeReview.update({
      where: { id: reviewId },
      data: { status: "FAILED" },
    });
  }
}
type FindingSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
type FindingCategory = "SECURITY" | "PERFORMANCE" | "BUG" | "CODE_SMELL" | "BEST_PRACTICE" | "DOCUMENTATION" | "TESTING";
interface Finding {
  severity: FindingSeverity;
  category: FindingCategory;
  title: string;
  description: string;
  filePath: string;
  lineNumber: number;
  codeSnippet: string;
  recommendation: string;
  estimatedImpact: string;
}
function generateFindings(_review: unknown): Promise<Finding[]> {
  return Promise.resolve([
    {
      severity: "HIGH" as const,
      category: "SECURITY" as const,
      title: "Potential SQL Injection",
      description: "User input is not properly sanitized before database query",
      filePath: "src/api/users.ts",
      lineNumber: 45,
      codeSnippet: 'db.query(`SELECT * FROM users WHERE id = ${userId}`)',
      recommendation: "Use parameterized queries or an ORM",
      estimatedImpact: "High - Could allow unauthorized data access",
    },
  ]);
}
function generateSuggestions(_review: unknown) {
  return Promise.resolve([
    {
      title: "Use Prepared Statements",
      description: "Replace raw SQL with parameterized query",
      filePath: "src/api/users.ts",
      lineNumber: 45,
      originalCode: 'db.query(`SELECT * FROM users WHERE id = ${userId}`)',
      suggestedCode:
        "db.query('SELECT * FROM users WHERE id = ?', [userId])",
      reasoning:
        "Prepared statements prevent SQL injection by separating SQL logic from data",
    },
  ]);
}
function calculateScores(findings: Finding[]) {
  const severityWeights: Record<string, number> = {
    CRITICAL: 25,
    HIGH: 15,
    MEDIUM: 5,
    LOW: 2,
    INFO: 0,
  };
  let totalDeduction = 0;
  findings.forEach((f) => {
    totalDeduction += severityWeights[f.severity as keyof typeof severityWeights] || 0;
  });
  const overallScore = Math.max(0, 100 - totalDeduction);
  const securityFindings = findings.filter((f) => f.category === "SECURITY");
  const securityDeduction = securityFindings.reduce(
    (acc, f) => acc + (severityWeights[f.severity as keyof typeof severityWeights] || 0),
    0
  );
  return {
    overallScore,
    securityScore: Math.max(0, 100 - securityDeduction),
    performanceScore: 85,
    maintainabilityScore: 90,
  };
}
