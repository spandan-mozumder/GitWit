"use server"
import { streamText } from "ai"
import {createGoogleGenerativeAI} from "@ai-sdk/google"
import { generateEmbedding } from "~/lib/gemini"
import { db } from "~/server/db"
const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
})
export async function askQuestion(question: string, projectId: string) {
    const queryVector = await generateEmbedding(question)
    const vectorQuery = `[${queryVector.join(",")}]`
    const result = await db.$queryRaw`
    SELECT "fileName", "sourceCode", "summary",
    1-("summaryEmbedding" <=> ${vectorQuery}::vector) AS "similarity"
    FROM "SourceCodeEmbedding"
    WHERE 1-("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.5
    AND "projectId" = ${projectId}
    ORDER BY "similarity" DESC 
    LIMIT 10
    ` as {
        fileName: string 
        sourceCode: string
        summary: string
    }[]
    let context = ""
    for (const doc of result){
        context += `File: ${doc.fileName}\n\nContent:\n${doc.sourceCode}\n\nSummary: ${doc.summary}\n${'---'}\n\n`
    }
    const {textStream} = await streamText({
        model:google("gemini-2.5-flash-lite"),
        prompt: `You are an expert code assistant helping developers understand their codebase. Your audience includes new team members and experienced developers.

Instructions:
1. Analyze the provided code context and answer the question accurately and thoroughly
2. When referencing code, include specific file names and line numbers when possible
3. Use markdown formatting for better readability - use code blocks when showing code snippets
4. Structure your answer with clear sections and bullet points where appropriate
5. Be concise but comprehensive
6. If the exact answer isn't in the provided context, say so clearly
7. Suggest related files or patterns that might be relevant

CONTEXT BLOCK START
${context}
CONTEXT BLOCK END

QUESTION:
${question}

Please provide a detailed, well-structured answer based on the context provided.`,
        temperature: 0.7,
    })
    return {
        output: textStream,
        filesRefrences: result
    }
}