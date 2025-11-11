import { Octokit } from "octokit";
export const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
});
interface CodeReviewResult {
  overallScore: number;
  securityScore: number;
  performanceScore: number;
  maintainabilityScore: number;
  findings: Array<{
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
    category:
      | "SECURITY"
      | "PERFORMANCE"
      | "BUG"
      | "CODE_SMELL"
      | "BEST_PRACTICE";
    title: string;
    description: string;
    filePath: string;
    lineNumber?: number;
    suggestion?: string;
  }>;
  suggestions: Array<{
    title: string;
    description: string;
    impact: string;
    effort: "LOW" | "MEDIUM" | "HIGH";
    code?: string;
  }>;
}
export async function analyzeRepositoryCode(
  githubUrl: string,
  branch = "main",
  _commitHash?: string,
): Promise<CodeReviewResult> {
  const [owner, repo] = parseGitHubUrl(githubUrl);
  try {
    const { data: repoContent } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: "",
      ref: branch,
    });
    if (!Array.isArray(repoContent)) {
      throw new Error("Invalid repository content");
    }
    const codeFiles = await collectCodeFiles(
      owner,
      repo,
      branch,
      repoContent,
      20,
    );
    const allFindings: CodeReviewResult["findings"] = [];
    const allSuggestions: CodeReviewResult["suggestions"] = [];
    for (const file of codeFiles) {
      const analysis = await analyzeFile(file);
      allFindings.push(...analysis.findings);
      allSuggestions.push(...analysis.suggestions);
    }
    const scores = calculateScores(allFindings);
    return {
      ...scores,
      findings: allFindings.sort((a, b) => {
        const severityOrder = {
          CRITICAL: 0,
          HIGH: 1,
          MEDIUM: 2,
          LOW: 3,
          INFO: 4,
        };
        return severityOrder[a.severity] - severityOrder[b.severity];
      }),
      suggestions: allSuggestions.slice(0, 10),
    };
  } catch (error) {
    throw error;
  }
}
interface GitHubTreeItem {
  path?: string;
  name?: string;
  type?: string;
  sha?: string;
}
async function collectCodeFiles(
  owner: string,
  repo: string,
  branch: string,
  items: GitHubTreeItem[],
  limit: number,
  collected: { path: string; content: string }[] = [],
): Promise<{ path: string; content: string }[]> {
  if (collected.length >= limit) {
    return collected;
  }
  for (const item of items) {
    if (collected.length >= limit) break;
    if (
      item.type === "file" &&
      item.name &&
      item.path &&
      isCodeFile(item.name)
    ) {
      try {
        const { data: fileData } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: item.path,
          ref: branch,
        });
        if ("content" in fileData) {
          const content = Buffer.from(fileData.content, "base64").toString(
            "utf-8",
          );
          collected.push({
            path: item.path,
            content,
          });
        }
      } catch (error) {}
    } else if (
      item.type === "dir" &&
      item.name &&
      item.path &&
      !isIgnoredDir(item.name)
    ) {
      try {
        const { data: dirContent } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: item.path,
          ref: branch,
        });
        if (Array.isArray(dirContent)) {
          await collectCodeFiles(
            owner,
            repo,
            branch,
            dirContent,
            limit,
            collected,
          );
        }
      } catch (error) {}
    }
  }
  return collected;
}
async function analyzeFile(file: { path: string; content: string }): Promise<{
  findings: CodeReviewResult["findings"];
  suggestions: CodeReviewResult["suggestions"];
}> {
  const findings: CodeReviewResult["findings"] = [];
  const suggestions: CodeReviewResult["suggestions"] = [];
  const lines = file.content.split("\n");
  if (file.content.includes("eval(") || file.content.includes("Function(")) {
    findings.push({
      severity: "CRITICAL",
      category: "SECURITY",
      title: "Dangerous use of eval()",
      description:
        "Using eval() can execute arbitrary code and is a security risk",
      filePath: file.path,
      suggestion:
        "Use safer alternatives like JSON.parse() or proper function calls",
    });
  }
  if (file.content.match(/password\s*=\s*["'][^"']+["']/i)) {
    findings.push({
      severity: "CRITICAL",
      category: "SECURITY",
      title: "Hardcoded credentials detected",
      description: "Password appears to be hardcoded in the source code",
      filePath: file.path,
      suggestion: "Move credentials to environment variables or secure vault",
    });
  }
  if (file.content.match(/api[_-]?key\s*=\s*["'][^"']+["']/i)) {
    findings.push({
      severity: "HIGH",
      category: "SECURITY",
      title: "Hardcoded API key detected",
      description: "API key appears to be hardcoded in the source code",
      filePath: file.path,
      suggestion: "Move API keys to environment variables",
    });
  }
  const consoleLogCount = (file.content.match(/console\.log/g) || []).length;
  if (consoleLogCount > 0 && !file.path.includes("test")) {
    findings.push({
      severity: "LOW",
      category: "CODE_SMELL",
      title: `${consoleLogCount} console.log statements found`,
      description: "Console statements should be removed in production code",
      filePath: file.path,
      suggestion: "Use a proper logging library or remove console statements",
    });
  }
  const todoCount = (file.content.match(/\/\/\s*(TODO|FIXME|HACK)/gi) || [])
    .length;
  if (todoCount > 0) {
    findings.push({
      severity: "INFO",
      category: "CODE_SMELL",
      title: `${todoCount} TODO/FIXME comments found`,
      description: "Unresolved TODO/FIXME comments indicate incomplete work",
      filePath: file.path,
      suggestion: "Address or track these comments in your issue tracker",
    });
  }
  const functionMatches =
    file.content.match(/function\s+\w+\s*\([^)]*\)\s*{/g) || [];
  if (functionMatches.length > 0) {
    const avgFunctionLength = lines.length / functionMatches.length;
    if (avgFunctionLength > 50) {
      findings.push({
        severity: "MEDIUM",
        category: "CODE_SMELL",
        title: "Large functions detected",
        description: "Functions should be kept small and focused",
        filePath: file.path,
        suggestion:
          "Break large functions into smaller, more manageable pieces",
      });
    }
  }
  if (
    file.content.includes("async ") &&
    !file.content.includes("try") &&
    !file.content.includes("catch")
  ) {
    findings.push({
      severity: "MEDIUM",
      category: "BUG",
      title: "Async code without error handling",
      description: "Async operations should have proper error handling",
      filePath: file.path,
      suggestion: "Wrap async code in try-catch blocks or use .catch()",
    });
  }
  if (file.path.endsWith(".ts") || file.path.endsWith(".tsx")) {
    if (
      !file.content.includes("interface") &&
      !file.content.includes("type ")
    ) {
      suggestions.push({
        title: "Add type definitions",
        description: `Consider adding TypeScript interfaces/types to ${file.path}`,
        impact: "Improves type safety and code documentation",
        effort: "LOW",
      });
    }
  }
  return { findings, suggestions };
}
function calculateScores(findings: CodeReviewResult["findings"]): {
  overallScore: number;
  securityScore: number;
  performanceScore: number;
  maintainabilityScore: number;
} {
  const severityWeights = {
    CRITICAL: 20,
    HIGH: 10,
    MEDIUM: 5,
    LOW: 2,
    INFO: 1,
  };
  let securityDeductions = 0;
  let performanceDeductions = 0;
  let maintainabilityDeductions = 0;
  findings.forEach((finding) => {
    const deduction = severityWeights[finding.severity];
    switch (finding.category) {
      case "SECURITY":
        securityDeductions += deduction;
        break;
      case "PERFORMANCE":
        performanceDeductions += deduction;
        break;
      case "CODE_SMELL":
      case "BEST_PRACTICE":
        maintainabilityDeductions += deduction;
        break;
      case "BUG":
        securityDeductions += deduction / 2;
        maintainabilityDeductions += deduction / 2;
        break;
    }
  });
  const securityScore = Math.max(0, 100 - securityDeductions);
  const performanceScore = Math.max(0, 100 - performanceDeductions);
  const maintainabilityScore = Math.max(0, 100 - maintainabilityDeductions);
  const overallScore = Math.round(
    (securityScore + performanceScore + maintainabilityScore) / 3,
  );
  return {
    overallScore,
    securityScore,
    performanceScore,
    maintainabilityScore,
  };
}
function parseGitHubUrl(githubUrl: string): [string, string] {
  const url = githubUrl.replace("https://github.com/", "").replace(".git", "");
  const [owner, repo] = url.split("/");
  if (!owner || !repo) {
    throw new Error("Invalid GitHub URL");
  }
  return [owner, repo];
}
function isCodeFile(filename: string): boolean {
  const codeExtensions = [
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".py",
    ".java",
    ".go",
    ".rs",
    ".c",
    ".cpp",
    ".h",
    ".hpp",
    ".rb",
    ".php",
    ".swift",
    ".kt",
    ".vue",
    ".svelte",
  ];
  return codeExtensions.some((ext) => filename.endsWith(ext));
}
function isIgnoredDir(dirname: string): boolean {
  const ignoredDirs = [
    "node_modules",
    ".git",
    "dist",
    "build",
    "coverage",
    ".next",
    "out",
    "vendor",
    "__pycache__",
  ];
  return ignoredDirs.includes(dirname);
}
