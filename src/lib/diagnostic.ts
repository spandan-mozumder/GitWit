import { db } from "~/server/db";

export async function checkProjectIndexing(projectId: string) {
  try {
    const project = await db.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return {
        success: false,
        error: "Project not found",
      };
    }

    const totalEmbeddings = await db.sourceCodeEmbedding.count({
      where: { projectId },
    });

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
      sampleFiles: sampleEmbeddings.map(
        (e: { fileName: string; summary: string | null }) => ({
          fileName: e.fileName,
          summaryPreview: e.summary?.slice(0, 100) || "No summary",
        }),
      ),
      message:
        totalEmbeddings === 0
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

export async function testQuestionAnswering(
  projectId: string,
  testQuestion: string,
) {
  try {
    const { generateEmbedding } = await import("~/lib/gemini");

    const queryVector = await generateEmbedding(testQuestion);
    const vectorQuery = `[${queryVector.join(",")}]`;

    const searchResults = (await db.$queryRaw`
      SELECT "fileName", "summary",
      1-("summaryEmbedding" <=> ${vectorQuery}::vector) AS "similarity"
      FROM "SourceCodeEmbedding"
      WHERE "projectId" = ${projectId}
      ORDER BY "similarity" DESC 
      LIMIT 5
    `) as Array<{
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
