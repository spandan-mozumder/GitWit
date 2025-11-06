import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { generateEmbedding, summariseCode } from "./gemini";
import { db } from "~/server/db";
import { fetchWithTimeout, withTimeout } from "./fetch-utils";

const getDefaultBranch = async (repoUrl: string): Promise<string> => {
  try {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return "main";
    
    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, '');
    
    const response = await fetchWithTimeout(
      `https://api.github.com/repos/${owner}/${cleanRepo}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      },
      10000
    );
    
    if (!response.ok) {
      return "main";
    }
    
    const data = await response.json() as { default_branch: string };
    return data.default_branch || "main";
  } catch (error) {
    return "main";
  }
};

export const loadGithubRepo = async (repoUrl: string) => {
  const defaultBranch = await getDefaultBranch(repoUrl);
  
  const loader = new GithubRepoLoader(repoUrl, {
    accessToken: process.env.GITHUB_ACCESS_TOKEN as string,
    branch: defaultBranch,
    ignoreFiles: [
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "bun.lockb",
    ],
    recursive: true,
    unknown: "warn",
    maxConcurrency: 5,
  });
  
  return withTimeout(
    loader.load(),
    120000,
    "GitHub repository loading timeout"
  );
};
export const generateEmbeddings = async (docs: Document[]) => {
  return Promise.allSettled(
    docs.map(async (doc) => {
      try {
        const summary = await summariseCode(doc);
        
        if (!summary || summary.trim() === "") {
          return null;
        }
        
        const embedding = await generateEmbedding(summary);
        
        return {
          summary,
          embedding,
          sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
          fileName: doc.metadata.source,
        };
      } catch (error) {
        return null;
      }
    })
  );
};
export const indexGithubRepo = async (
  projectId: string,
  repoUrl: string
) => {
  try {
    const docs = await loadGithubRepo(repoUrl);
    
    const allEmbeddingsResults = await generateEmbeddings(docs);
    
    // Filter out failed embeddings
    const successfulEmbeddings = allEmbeddingsResults
      .map((result, index) => result.status === 'fulfilled' ? result.value : null)
      .filter((embedding) => embedding !== null);
    
    
    // Create source code embeddings in database
    await Promise.allSettled(
      successfulEmbeddings.map(async (embedding, index) => {
        try {
          if (!embedding) return;
          
          const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
            data: {
              summary: embedding.summary,
              sourceCode: embedding.sourceCode,
              fileName: embedding.fileName,
              projectId,
            },
          });
          
          const vectorString = `[${embedding.embedding.join(",")}]`;
          await db.$executeRaw`
            UPDATE "SourceCodeEmbedding"
            SET "summaryEmbedding" = ${vectorString}::vector
            WHERE "id" = ${sourceCodeEmbedding.id}
          `;
        } catch (error) {
        }
      })
    );
    
  } catch (error) {
    throw error;
  }
};
export const checkCredits = async (repoUrl: string) => {
  const docs = await loadGithubRepo(repoUrl);
  return docs.length; 
};