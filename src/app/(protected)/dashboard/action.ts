"use server";
import { streamText, generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateEmbedding } from "~/lib/gemini";
import { db } from "~/server/db";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function askQuestion(question: string, projectId: string) {
  console.log("askQuestion called with:", { question, projectId });
  
  try {
    const queryVector = await generateEmbedding(question);
    const vectorQuery = `[${queryVector.join(",")}]`;
    
    // First, check if there are any embeddings for this project
    const totalEmbeddings = (await db.$queryRaw`
      SELECT COUNT(*)::int as count
      FROM "SourceCodeEmbedding"
      WHERE "projectId" = ${projectId}
    `) as { count: number }[];
    
    const embeddingsCount = totalEmbeddings[0]?.count ?? 0;
    console.log("Embeddings count:", embeddingsCount);
    
    // Lower the similarity threshold to 0.3 for better recall
    const result = (await db.$queryRaw`
      SELECT "fileName", "sourceCode", "summary",
      1-("summaryEmbedding" <=> ${vectorQuery}::vector) AS "similarity"
      FROM "SourceCodeEmbedding"
      WHERE 1-("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.3
      AND "projectId" = ${projectId}
      ORDER BY "similarity" DESC 
      LIMIT 15
      `) as {
      fileName: string;
      sourceCode: string;
      summary: string;
      similarity: number;
    }[];
    
    console.log("Found relevant files:", result.length);
    
    let context = "";
    
    if (result.length === 0) {
      // Provide helpful context about why there's no data
      if (embeddingsCount === 0) {
        context = `No code embeddings found for this project. The project may still be indexing, or the indexing process may have failed.`;
      } else {
        context = `Found ${embeddingsCount} code files in the project, but none matched the query closely enough. Try rephrasing your question or asking about more general concepts.`;
      }
    } else {
      for (const doc of result) {
        context += `File: ${doc.fileName}\n\nContent:\n${doc.sourceCode}\n\nSummary: ${doc.summary}\n${"---"}\n\n`;
      }
    }
    
    console.log("Calling generateText with gemini-2.5-flash-lite");
    const { text } = await generateText({
      model: google("gemini-2.5-flash-lite"),
      prompt: `You are an expert code assistant helping developers understand their codebase. Your audience includes new team members and experienced developers.

Instructions:
1. Analyze the provided code context and answer the question accurately and thoroughly
2. When referencing code, include specific file names and line numbers when possible
3. Use markdown formatting for better readability - use code blocks when showing code snippets
4. Structure your answer with clear sections and bullet points where appropriate
5. Be concise but comprehensive
6. If the context indicates no embeddings or no matches, explain this clearly and provide helpful guidance
7. If the exact answer isn't in the provided context, say so clearly and suggest what to check
8. Suggest related files or patterns that might be relevant
9. ALWAYS provide a response - never return empty content

CONTEXT BLOCK START
${context}
CONTEXT BLOCK END

Project has ${embeddingsCount} indexed files.
Retrieved ${result.length} relevant code snippets.

QUESTION:
${question}

Please provide a detailed, well-structured answer based on the context provided. Start your response immediately without any preamble.`,
    });
    
    // Create a simple async iterable from the text
    const output = (async function*() {
      yield text;
    })();
    
    return {
      output,
      filesRefrences: result,
    };
  } catch (error) {
    console.error("Error in askQuestion:", error);
    throw new Error(
      `Failed to generate response: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
