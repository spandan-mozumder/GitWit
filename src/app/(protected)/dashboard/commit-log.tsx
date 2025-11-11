"use client";
import { ExternalLink, GitCommit, Clock } from "lucide-react";
import Link from "next/link";
import React from "react";
import useProject from "~/hooks/use-project";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Spinner } from "~/components/ui/spinner";
const CommitLog = () => {
  const { projectId, project } = useProject();
  const {
    data: commits,
    error,
    isLoading,
  } = api.project.getCommits.useQuery(
    { projectId },
    {
      enabled: !!project?.repoUrl,
    },
  );
  if (!project?.repoUrl) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="pt-6 text-center text-muted-foreground">
          No project selected.
        </CardContent>
      </Card>
    );
  }
  if (error) {
    return (
      <Card className="animate-fade-in border-destructive/50">
        <CardContent className="pt-6 text-center text-destructive">
          Error loading commits: {error.message}
        </CardContent>
      </Card>
    );
  }
  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCommit className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Spinner className="size-6" />
        </CardContent>
      </Card>
    );
  }
  if (!commits?.length) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="pt-6 text-center text-muted-foreground">
          No commits found for this repository.
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="animate-fade-in overflow-hidden border border-border/70 bg-card/70 shadow-lg shadow-primary/5">
      <CardHeader className="border-b border-border/60 bg-background/70">
        <CardTitle className="flex items-center gap-3 text-base font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
            <GitCommit className="h-4 w-4" />
          </span>
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <ul className="space-y-6">
          {commits
            .sort(
              (a: { commitDate: Date }, b: { commitDate: Date }) =>
                new Date(b.commitDate).getTime() -
                new Date(a.commitDate).getTime(),
            )
            .map(
              (
                commit: {
                  id: string;
                  commitDate: Date;
                  commitAuthorAvatar: string;
                  commitAuthorName: string;
                  commitMessage: string;
                  commitHash: string;
                  summary: string;
                },
                commitIdx: number,
              ) => (
                <li key={commit.id} className="relative flex gap-x-4 group">
                  <div
                    className={cn(
                      commitIdx === commits.length - 1 ? "h-6" : "-bottom-6",
                      "absolute left-0 top-0 flex w-10 justify-center",
                    )}
                  >
                    <div className="w-px bg-border"></div>
                  </div>
                  <div className="relative flex-shrink-0">
                    {commit.commitAuthorAvatar ? (
                      <img
                        src={commit.commitAuthorAvatar}
                        alt={commit.commitAuthorName}
                        className="relative mt-3 size-10 rounded-full ring-2 ring-background border-2 border-border"
                      />
                    ) : (
                      <div className="relative mt-3 size-10 rounded-full ring-2 ring-background border-2 border-border bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary/80">
                          {commit.commitAuthorName?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-auto rounded-xl border border-border/60 bg-background/80 p-4 transition-all hover:border-primary/40">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                      <Link
                        href={`${project?.repoUrl}/commit/${commit.commitHash}`}
                        target="_blank"
                        className="group/link flex items-center gap-2 text-sm"
                      >
                        <span className="font-medium text-foreground group-hover/link:text-primary transition-colors">
                          {commit.commitAuthorName}
                        </span>
                        <ExternalLink className="h-3 w-3 text-muted-foreground group-hover/link:text-primary transition-colors" />
                      </Link>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(commit.commitDate).toLocaleDateString(
                          undefined,
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-foreground text-sm">
                        {commit.commitMessage}
                      </p>
                      <div
                        className="text-sm text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: commit.summary
                            .replace(
                              /(\*{2})(.*?)\1/g,
                              '<strong class="text-foreground">$2</strong>',
                            )
                            .replace(
                              /(['"`])(.*?)\1/g,
                              '<code class="text-primary bg-primary/10 px-1 rounded">$2</code>',
                            ),
                        }}
                      />
                    </div>
                  </div>
                </li>
              ),
            )}
        </ul>
      </CardContent>
    </Card>
  );
};
export default CommitLog;
