import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { pollCommits } from "@/lib/github";
import { generateEmbedding } from "@/lib/gemini";

export const codeReviewRouter = createTRPCRouter({
  // Create a new code review
  createReview: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        branch: z.string(),
        commitHash: z.string(),
        prNumber: z.number().optional(),
        prTitle: z.string().optional(),
        prUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const review = await ctx.db.codeReview.create({
        data: {
          projectId: input.projectId,
          branch: input.branch,
          commitHash: input.commitHash,
          prNumber: input.prNumber,
          prTitle: input.prTitle,
          prUrl: input.prUrl,
          overallScore: 0,
          securityScore: 0,
          performanceScore: 0,
          maintainabilityScore: 0,
          status: "PENDING",
        },
      });

      // Trigger async analysis
      analyzeCode(review.id, ctx.db).catch(console.error);

      return review;
    }),

  // Get review by ID
  getReview: protectedProcedure
    .input(z.object({ reviewId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.codeReview.findUnique({
        where: { id: input.reviewId },
        include: {
          findings: true,
          suggestions: true,
          project: {
            select: {
              name: true,
              repoUrl: true,
            },
          },
        },
      });
    }),

  // Get all reviews for a project
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

  // Apply a suggestion
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

  // Get review statistics
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

// Async function to analyze code using AI
async function analyzeCode(reviewId: string, db: any) {
  try {
    // Update status to in progress
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

    // AI Analysis would go here - for now, generate mock data
    const findings = await generateFindings(review);
    const suggestions = await generateSuggestions(review);
    const scores = calculateScores(findings);

    // Save findings
    await db.codeReviewFinding.createMany({
      data: findings.map((f: any) => ({ ...f, reviewId })),
    });

    // Save suggestions
    await db.codeReviewSuggestion.createMany({
      data: suggestions.map((s: any) => ({ ...s, reviewId })),
    });

    // Update review with scores
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

// Mock AI functions - replace with actual AI integration
function generateFindings(review: any) {
  // This would use Gemini/GPT to analyze code
  return Promise.resolve([
    {
      severity: "HIGH",
      category: "SECURITY",
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

function generateSuggestions(review: any) {
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

function calculateScores(findings: any[]) {
  // Calculate scores based on findings
  const severityWeights = {
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
    performanceScore: 85, // Mock
    maintainabilityScore: 90, // Mock
  };
}
