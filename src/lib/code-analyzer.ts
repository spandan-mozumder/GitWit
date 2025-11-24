import { Octokit } from "octokit";

export const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
});

// Retry logic for GitHub API calls
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000,
): Promise<T> {
  let lastError: Error | undefined;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      // Don't retry on 404 or authentication errors
      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        (error.status === 404 || error.status === 401 || error.status === 403)
      ) {
        throw error;
      }
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}
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
  commitHash?: string,
): Promise<CodeReviewResult> {
  if (!githubUrl) {
    throw new Error("Repository URL is required");
  }

  const [owner, repo] = parseGitHubUrl(githubUrl);
  const ref = commitHash || branch;

  try {
    // Verify repository exists and is accessible
    await retryWithBackoff(async () => {
      return await octokit.rest.repos.get({ owner, repo });
    });

    // Get repository content with retry
    const { data: repoContent } = await retryWithBackoff(async () => {
      return await octokit.rest.repos.getContent({
        owner,
        repo,
        path: "",
        ref,
      });
    });

    if (!Array.isArray(repoContent)) {
      throw new Error("Invalid repository content - expected directory");
    }

    if (repoContent.length === 0) {
      console.warn("Repository is empty, returning default scores");
      return {
        overallScore: 100,
        securityScore: 100,
        performanceScore: 100,
        maintainabilityScore: 100,
        findings: [],
        suggestions: [],
      };
    }

    const codeFiles = await collectCodeFiles(
      owner,
      repo,
      ref,
      repoContent,
      30,
    );

    if (codeFiles.length === 0) {
      console.warn("No code files found, returning default scores");
      return {
        overallScore: 100,
        securityScore: 100,
        performanceScore: 100,
        maintainabilityScore: 100,
        findings: [],
        suggestions: [],
      };
    }

    const allFindings: CodeReviewResult["findings"] = [];
    const allSuggestions: CodeReviewResult["suggestions"] = [];

    // Analyze files with error handling for individual files
    for (const file of codeFiles) {
      try {
        const analysis = await analyzeFile(file);
        allFindings.push(...analysis.findings);
        allSuggestions.push(...analysis.suggestions);
      } catch (fileError) {
        console.error(`Error analyzing file ${file.path}:`, fileError);
        // Continue with other files
      }
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
      suggestions: allSuggestions.slice(0, 15),
    };
  } catch (error) {
    console.error("Code analysis failed:", error);
    if (error && typeof error === "object" && "status" in error) {
      if (error.status === 404) {
        throw new Error(
          `Repository not found or branch '${ref}' does not exist`,
        );
      }
      if (error.status === 403) {
        throw new Error(
          "GitHub API rate limit exceeded or insufficient permissions",
        );
      }
      if (error.status === 401) {
        throw new Error("GitHub authentication failed - check access token");
      }
    }
    throw new Error(
      `Failed to analyze repository: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
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
        const { data: fileData } = await retryWithBackoff(async () => {
          return await octokit.rest.repos.getContent({
            owner,
            repo,
            path: item.path,
            ref: branch,
          });
        });

        if ("content" in fileData && fileData.content) {
          const content = Buffer.from(fileData.content, "base64").toString(
            "utf-8",
          );
          // Skip very large files (> 1MB)
          if (content.length < 1000000) {
            collected.push({
              path: item.path,
              content,
            });
          }
        }
      } catch (error) {
        console.error(`Failed to fetch file ${item.path}:`, error);
        // Continue with other files
      }
    } else if (
      item.type === "dir" &&
      item.name &&
      item.path &&
      !isIgnoredDir(item.name)
    ) {
      try {
        const { data: dirContent } = await retryWithBackoff(async () => {
          return await octokit.rest.repos.getContent({
            owner,
            repo,
            path: item.path,
            ref: branch,
          });
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
      } catch (error) {
        console.error(`Failed to fetch directory ${item.path}:`, error);
        // Continue with other directories
      }
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
  // Find eval usage with line numbers
  const evalPattern = /eval\(|Function\(/g;
  let evalMatch;
  while ((evalMatch = evalPattern.exec(file.content)) !== null) {
    const lineNumber = file.content.substring(0, evalMatch.index).split("\n").length;
    const lineContent = lines[lineNumber - 1] || "";
    findings.push({
      severity: "CRITICAL",
      category: "SECURITY",
      title: "Dangerous use of eval() or Function()",
      description:
        "Using eval() or Function() can execute arbitrary code and is a security risk",
      filePath: file.path,
      lineNumber: lineNumber,
      suggestion:
        "Use safer alternatives like JSON.parse() or proper function calls",
    });
  }
  // Find hardcoded passwords with line numbers
  lines.forEach((line, index) => {
    if (/password\s*=\s*["'][^"']+["']/i.test(line)) {
      findings.push({
        severity: "CRITICAL",
        category: "SECURITY",
        title: "Hardcoded credentials detected",
        description: "Password appears to be hardcoded in the source code",
        filePath: file.path,
        lineNumber: index + 1,
        suggestion: "Move credentials to environment variables or secure vault",
      });
    }
  });
  // Find hardcoded API keys with line numbers
  lines.forEach((line, index) => {
    if (/api[_-]?key\s*=\s*["'][^"']+["']/i.test(line)) {
      findings.push({
        severity: "HIGH",
        category: "SECURITY",
        title: "Hardcoded API key detected",
        description: "API key appears to be hardcoded in the source code",
        filePath: file.path,
        lineNumber: index + 1,
        suggestion: "Move API keys to environment variables",
      });
    }
  });
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
  // SQL Injection patterns
  const sqlPattern = /query\s*\(\s*[`"'].*\$\{.*\}.*[`"']/g;
  let sqlMatch;
  while ((sqlMatch = sqlPattern.exec(file.content)) !== null) {
    const lineNumber = file.content.substring(0, sqlMatch.index).split("\n").length;
    findings.push({
      severity: "CRITICAL",
      category: "SECURITY",
      title: "Potential SQL Injection vulnerability",
      description: "String interpolation in SQL queries can lead to SQL injection attacks",
      filePath: file.path,
      lineNumber: lineNumber,
      suggestion: "Use parameterized queries or an ORM with prepared statements",
    });
  }

  // Detect missing input validation
  if (file.content.includes("req.body") || file.content.includes("req.query") || file.content.includes("req.params")) {
    if (!file.content.includes("validate") && !file.content.includes("schema") && !file.content.includes("zod")) {
      findings.push({
        severity: "HIGH",
        category: "SECURITY",
        title: "Missing input validation",
        description: "API endpoints should validate user input",
        filePath: file.path,
        suggestion: "Add input validation using a library like Zod, Joi, or express-validator",
      });
    }
  }

  // TypeScript improvements
  if (file.path.endsWith(".ts") || file.path.endsWith(".tsx")) {
    // Check for any type
    const anyPattern = /:\s*any\b/g;
    const anyCount = (file.content.match(anyPattern) || []).length;
    if (anyCount > 0) {
      findings.push({
        severity: "LOW",
        category: "BEST_PRACTICE",
        title: `${anyCount} use(s) of 'any' type found`,
        description: "Using 'any' type bypasses TypeScript's type checking",
        filePath: file.path,
        suggestion: "Replace 'any' with specific types or use 'unknown' if type is truly unknown",
      });
    }

    // Suggest type definitions
    if (
      !file.content.includes("interface") &&
      !file.content.includes("type ") &&
      file.content.length > 100
    ) {
      suggestions.push({
        title: "Add type definitions",
        description: `Consider adding TypeScript interfaces/types to ${file.path}`,
        impact: "Improves type safety and code documentation",
        effort: "LOW" as const,
      });
    }
  }

  // React-specific checks
  if (file.path.endsWith(".tsx") || file.path.endsWith(".jsx")) {
    // Check for missing key prop in lists
    if (file.content.includes(".map(") && !file.content.includes("key=")) {
      findings.push({
        severity: "MEDIUM",
        category: "BUG",
        title: "Missing key prop in list rendering",
        description: "React list items should have a unique key prop",
        filePath: file.path,
        suggestion: "Add a unique 'key' prop to each element in the list",
      });
    }

    // Check for useEffect without dependencies
    if (file.content.includes("useEffect(") && !file.content.includes("], [")) {
      suggestions.push({
        title: "Review useEffect dependencies",
        description: `Check that all useEffect hooks in ${file.path} have correct dependency arrays`,
        impact: "Prevents bugs and unnecessary re-renders",
        effort: "LOW" as const,
      });
    }
  }

  // Performance suggestions
  if (file.content.includes("for (") || file.content.includes("while (")) {
    const nestedLoops = file.content.match(/for\s*\([^)]*\)\s*{[^}]*for\s*\(/g);
    if (nestedLoops && nestedLoops.length > 0) {
      findings.push({
        severity: "MEDIUM",
        category: "PERFORMANCE",
        title: "Nested loops detected",
        description: "Nested loops can have O(n²) or worse time complexity",
        filePath: file.path,
        suggestion: "Consider using more efficient algorithms or data structures",
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
  try {
    const url = new URL(githubUrl);
    const pathParts = url.pathname.split("/").filter(Boolean);
    if (pathParts.length < 2) {
      throw new Error("Invalid GitHub URL");
    }
    return [pathParts[0], pathParts[1]];
  } catch (e) {
    // Fallback for non-URL strings or other formats
    const cleanUrl = githubUrl
      .replace("https://github.com/", "")
      .replace("http://github.com/", "")
      .replace("git@github.com:", "")
      .replace(".git", "");
    const [owner, repo] = cleanUrl.split("/").filter(Boolean);
    if (!owner || !repo) {
      throw new Error("Invalid GitHub URL");
    }
    return [owner, repo];
  }
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
