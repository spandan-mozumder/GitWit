import { Octokit } from "octokit";

export const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
});

interface GitHubRepoStats {
  owner: string;
  repo: string;
  totalCommits: number;
  totalPRs: number;
  openIssues: number;
  closedIssues: number;
  contributors: number;
  stars: number;
  forks: number;
  watchers: number;
  languages: Record<string, number>;
  recentActivity: {
    commits: number;
    prs: number;
    issues: number;
  };
}

interface GitHubCommitStats {
  sha: string;
  message: string;
  author: string;
  authorAvatar: string;
  date: string;
  additions: number;
  deletions: number;
  filesChanged: number;
}

interface GitHubPullRequest {
  number: number;
  title: string;
  state: string;
  author: string;
  createdAt: string;
  closedAt: string | null;
  mergedAt: string | null;
  additions: number;
  deletions: number;
  changedFiles: number;
  reviewTime?: number; 
}

interface GitHubContributor {
  login: string;
  name: string | null;
  avatar: string;
  contributions: number;
  commits: number;
  additions: number;
  deletions: number;
}

export async function getRepoStats(githubUrl: string, daysBack = 30): Promise<GitHubRepoStats> {
  const [owner, repo] = parseGitHubUrl(githubUrl);
  
  const [repoData, commits, pullRequests, issues, contributors, languages] = await Promise.all([
    octokit.rest.repos.get({ owner, repo }),
    getRecentCommits(owner, repo, daysBack),
    getRecentPullRequests(owner, repo, daysBack),
    getRecentIssues(owner, repo, daysBack),
    octokit.rest.repos.listContributors({ owner, repo, per_page: 100 }),
    octokit.rest.repos.listLanguages({ owner, repo }),
  ]);

  return {
    owner,
    repo,
    totalCommits: commits.length,
    totalPRs: pullRequests.filter(pr => pr.state === 'closed').length,
    openIssues: repoData.data.open_issues_count,
    closedIssues: issues.filter(i => i.state === 'closed').length,
    contributors: contributors.data.length,
    stars: repoData.data.stargazers_count,
    forks: repoData.data.forks_count,
    watchers: repoData.data.watchers_count,
    languages: languages.data,
    recentActivity: {
      commits: commits.length,
      prs: pullRequests.length,
      issues: issues.length,
    },
  };
}

export async function getCommitStats(githubUrl: string, daysBack = 30): Promise<GitHubCommitStats[]> {
  const [owner, repo] = parseGitHubUrl(githubUrl);
  const since = new Date();
  since.setDate(since.getDate() - daysBack);

  const { data: commits } = await octokit.rest.repos.listCommits({
    owner,
    repo,
    since: since.toISOString(),
    per_page: 100,
  });

  const commitStats: GitHubCommitStats[] = [];

  for (const commit of commits) {
    try {
      const { data: commitDetail } = await octokit.rest.repos.getCommit({
        owner,
        repo,
        ref: commit.sha,
      });

      commitStats.push({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author?.name || 'Unknown',
        authorAvatar: commit.author?.avatar_url || '',
        date: commit.commit.author?.date || new Date().toISOString(),
        additions: commitDetail.stats?.additions || 0,
        deletions: commitDetail.stats?.deletions || 0,
        filesChanged: commitDetail.files?.length || 0,
      });
    } catch (error) {
      console.error(`Error fetching commit ${commit.sha}:`, error);
    }
  }

  return commitStats;
}

export async function getPullRequestStats(githubUrl: string, daysBack = 30): Promise<GitHubPullRequest[]> {
  const [owner, repo] = parseGitHubUrl(githubUrl);
  
  const { data: prs } = await octokit.rest.pulls.list({
    owner,
    repo,
    state: 'all',
    per_page: 100,
    sort: 'updated',
    direction: 'desc',
  });

  const since = new Date();
  since.setDate(since.getDate() - daysBack);

  const recentPRs = prs.filter(pr => 
    new Date(pr.created_at) >= since
  );

  const prStats: GitHubPullRequest[] = [];

  for (const pr of recentPRs) {
    const reviewTime = pr.merged_at 
      ? Math.abs(new Date(pr.merged_at).getTime() - new Date(pr.created_at).getTime()) / (1000 * 60 * 60)
      : pr.closed_at
      ? Math.abs(new Date(pr.closed_at).getTime() - new Date(pr.created_at).getTime()) / (1000 * 60 * 60)
      : undefined;

    prStats.push({
      number: pr.number,
      title: pr.title,
      state: pr.state,
      author: pr.user?.login || 'Unknown',
      createdAt: pr.created_at,
      closedAt: pr.closed_at,
      mergedAt: pr.merged_at,
      additions: 0, 
      deletions: 0,
      changedFiles: 0,
      reviewTime,
    });
  }

  await Promise.all(
    prStats.map(async (prStat, index) => {
      try {
        const { data: prDetail } = await octokit.rest.pulls.get({
          owner,
          repo,
          pull_number: prStat.number,
        });

        prStats[index] = {
          ...prStat,
          additions: prDetail.additions,
          deletions: prDetail.deletions,
          changedFiles: prDetail.changed_files,
        };
      } catch (error) {
        console.error(`Error fetching PR ${prStat.number}:`, error);
      }
    })
  );

  return prStats;
}

export async function getContributorStats(githubUrl: string): Promise<GitHubContributor[]> {
  const [owner, repo] = parseGitHubUrl(githubUrl);
  
  const { data: contributors } = await octokit.rest.repos.listContributors({
    owner,
    repo,
    per_page: 100,
  });

  const contributorStats: GitHubContributor[] = [];

  for (const contributor of contributors.slice(0, 20)) { 
    try {
      const { data: userCommits } = await octokit.rest.repos.listCommits({
        owner,
        repo,
        author: contributor.login,
        per_page: 100,
      });

      let totalAdditions = 0;
      let totalDeletions = 0;

      for (const commit of userCommits.slice(0, 10)) {
        try {
          const { data: commitDetail } = await octokit.rest.repos.getCommit({
            owner,
            repo,
            ref: commit.sha,
          });
          totalAdditions += commitDetail.stats?.additions || 0;
          totalDeletions += commitDetail.stats?.deletions || 0;
        } catch (error) {
          console.error(`Error fetching commit details:`, error);
        }
      }

      contributorStats.push({
        login: contributor.login!,
        name: contributor.name || null,
        avatar: contributor.avatar_url!,
        contributions: contributor.contributions!,
        commits: userCommits.length,
        additions: totalAdditions,
        deletions: totalDeletions,
      });
    } catch (error) {
      console.error(`Error fetching stats for ${contributor.login}:`, error);
    }
  }

  return contributorStats.sort((a, b) => b.contributions - a.contributions);
}

export async function getCodeHotspots(githubUrl: string, daysBack = 90): Promise<Array<{
  path: string;
  changes: number;
  additions: number;
  deletions: number;
  contributors: Set<string>;
}>> {
  const [owner, repo] = parseGitHubUrl(githubUrl);
  const since = new Date();
  since.setDate(since.getDate() - daysBack);

  const { data: commits } = await octokit.rest.repos.listCommits({
    owner,
    repo,
    since: since.toISOString(),
    per_page: 100,
  });

  const fileStats = new Map<string, {
    changes: number;
    additions: number;
    deletions: number;
    contributors: Set<string>;
  }>();

  for (const commit of commits) {
    try {
      const { data: commitDetail } = await octokit.rest.repos.getCommit({
        owner,
        repo,
        ref: commit.sha,
      });

      for (const file of commitDetail.files || []) {
        const existing = fileStats.get(file.filename) || {
          changes: 0,
          additions: 0,
          deletions: 0,
          contributors: new Set<string>(),
        };

        existing.changes += file.changes;
        existing.additions += file.additions;
        existing.deletions += file.deletions;
        existing.contributors.add(commit.commit.author?.name || 'Unknown');

        fileStats.set(file.filename, existing);
      }
    } catch (error) {
      console.error(`Error processing commit ${commit.sha}:`, error);
    }
  }

  return Array.from(fileStats.entries())
    .map(([path, stats]) => ({
      path,
      ...stats,
    }))
    .sort((a, b) => b.changes - a.changes)
    .slice(0, 20); 
}

export async function getRepoFiles(githubUrl: string, path = ''): Promise<Array<{
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  content?: string;
}>> {
  const [owner, repo] = parseGitHubUrl(githubUrl);

  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    if (Array.isArray(data)) {
      return data.map(item => ({
        name: item.name,
        path: item.path,
        type: item.type as 'file' | 'dir',
        size: item.size,
      }));
    } else {
      
      return [{
        name: data.name,
        path: data.path,
        type: data.type as 'file' | 'dir',
        size: data.size,
        content: 'content' in data ? Buffer.from(data.content, 'base64').toString('utf-8') : undefined,
      }];
    }
  } catch (error) {
    console.error('Error fetching repo files:', error);
    return [];
  }
}

function parseGitHubUrl(githubUrl: string): [string, string] {
  const url = githubUrl.replace('https://github.com/', '').replace('.git', '');
  const [owner, repo] = url.split('/');
  
  if (!owner || !repo) {
    throw new Error('Invalid GitHub URL');
  }
  
  return [owner, repo];
}

async function getRecentCommits(owner: string, repo: string, daysBack: number) {
  const since = new Date();
  since.setDate(since.getDate() - daysBack);

  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
    since: since.toISOString(),
    per_page: 100,
  });

  return data;
}

async function getRecentPullRequests(owner: string, repo: string, daysBack: number) {
  const { data } = await octokit.rest.pulls.list({
    owner,
    repo,
    state: 'all',
    per_page: 100,
    sort: 'updated',
    direction: 'desc',
  });

  const since = new Date();
  since.setDate(since.getDate() - daysBack);

  return data.filter(pr => new Date(pr.created_at) >= since);
}

async function getRecentIssues(owner: string, repo: string, daysBack: number) {
  const { data } = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    state: 'all',
    per_page: 100,
    sort: 'updated',
    direction: 'desc',
  });

  const since = new Date();
  since.setDate(since.getDate() - daysBack);

  return data.filter(issue => new Date(issue.created_at) >= since);
}
