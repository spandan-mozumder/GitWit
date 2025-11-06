import { db } from "~/server/db";

/**
 * Diagnostic function to check the state of embeddings and code indexing
 * This helps debug why questions aren't being answered correctly
 */
export async function checkProjectIndexing(projectId: string) {
  try {
    // Check if project exists
    const project = await db.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return {
        success: false,
        error: "Project not found",
      };
    }

    // Get total count of embeddings
    const totalEmbeddings = await db.sourceCodeEmbedding.count({
      where: { projectId },
    });

    // Get sample embeddings
    const sampleEmbeddings = await db.sourceCodeEmbedding.findMany({
      where: { projectId },
      select: {
        fileName: true,
        summary: true,
      },
      take: 5,
    });

    return {
      success: true,
      projectId,
      projectName: project.name,
      totalEmbeddings,
      sampleFiles: sampleEmbeddings.map((e: { fileName: string; summary: string | null }) => ({
        fileName: e.fileName,
        summaryPreview: e.summary?.slice(0, 100) || "No summary",
      })),
      message: totalEmbeddings === 0 
        ? "No embeddings found. The repository needs to be indexed." 
        : `Found ${totalEmbeddings} embeddings ready for Q&A.`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Test the question answering system with a diagnostic query
 */
export async function testQuestionAnswering(projectId: string, testQuestion: string) {
  try {
    const { generateEmbedding } = await import("~/lib/gemini");

    // Generate embedding for test question
    const queryVector = await generateEmbedding(testQuestion);
    const vectorQuery = `[${queryVector.join(",")}]`;

    // Search for relevant code
    const searchResults = await db.$queryRaw`
      SELECT "fileName", "summary",
      1-("summaryEmbedding" <=> ${vectorQuery}::vector) AS "similarity"
      FROM "SourceCodeEmbedding"
      WHERE "projectId" = ${projectId}
      ORDER BY "similarity" DESC 
      LIMIT 5
    ` as Array<{
      fileName: string;
      summary: string;
      similarity: number;
    }>;

    return {
      success: true,
      testQuestion,
      foundRelevantFiles: searchResults.length,
      results: searchResults.map((r) => ({
        fileName: r.fileName,
        similarity: Number((r.similarity * 100).toFixed(2)) + "%",
        summaryPreview: r.summary?.slice(0, 150),
      })),
      message:
        searchResults.length === 0
          ? "No relevant files found. The repository may not be indexed."
          : `Found ${searchResults.length} relevant files.`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
