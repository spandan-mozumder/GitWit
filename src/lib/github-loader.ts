import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { generateEmbedding, summariseCode } from "./gemini";
import { db } from "@/server/db";
import { fetchWithTimeout, withTimeout } from "./fetch-utils";

const getDefaultBranch = async (repoUrl: string, githubToken?: string): Promise<string> => {
  try {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return "main";
    
    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, '');
    
    const response = await fetchWithTimeout(
      `https://api.github.com/repos/${owner}/${cleanRepo}`,
      {
        headers: {
          Authorization: `Bearer ${githubToken || process.env.GITHUB_ACCESS_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      },
      10000
    );
    
    if (!response.ok) {
      console.warn('Failed to fetch repo info, defaulting to main branch');
      return "main";
    }
    
    const data = await response.json() as { default_branch: string };
    return data.default_branch || "main";
  } catch (error) {
    console.warn('Error detecting default branch, using main:', error);
    return "main";
  }
};

export const loadGithubRepo = async (repoUrl: string, githubToken?: string) => {
  const defaultBranch = await getDefaultBranch(repoUrl, githubToken);
  console.log(`Loading repository from branch: ${defaultBranch}`);
  
  const loader = new GithubRepoLoader(repoUrl, {
    accessToken: githubToken || process.env.GITHUB_ACCESS_TOKEN as string,
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
  console.log("generating embeddings-------------------");
  return Promise.all(
    docs.map(async (doc) => {
      const summary = await summariseCode(doc);
      const embedding = await generateEmbedding(summary);
      return {
        summary,
        embedding,
        sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
        fileName: doc.metadata.source,
      };
    })
  );
};
export const indexGithubRepo = async (
  projectId: string,
  repoUrl: string,
  githubToken?: string
) => {
  const docs = await loadGithubRepo(repoUrl, githubToken);
  const allEmbeddings = await generateEmbeddings(docs);
  await Promise.allSettled(
    allEmbeddings.map(async (embedding, index) => {
      console.log(`processing ${index + 1} of ${allEmbeddings.length}`);
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
    })
  );
};
export const checkCredits = async (repoUrl: string, githubToken?: string) => {
  const docs = await loadGithubRepo(repoUrl, githubToken);
  return docs.length; 
};