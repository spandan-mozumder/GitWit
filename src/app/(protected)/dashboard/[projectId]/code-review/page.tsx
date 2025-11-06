"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { ProjectBreadcrumb } from "@/components/project-breadcrumb";
import { QuickNav } from "@/components/quick-nav";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield,
  Zap,
  Code,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  FileCode,
  TrendingUp,
  Code2,
  Sparkles,
  Play,
  GitBranch,
  GitCommit,
  Calendar,
  User,
} from "lucide-react";
export default function CodeReviewPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedCommit, setSelectedCommit] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const { data: reviews, isLoading, refetch } = api.codeReview.getProjectReviews.useQuery({
    projectId: params.projectId,
    limit: 20,
  });
  const { data: stats } = api.codeReview.getReviewStats.useQuery({
    projectId: params.projectId,
  });
  const { data: branches, isLoading: loadingBranches } = api.codeBrowser.getBranches.useQuery({
    projectId: params.projectId,
  }, { enabled: isCreateOpen });
  const { data: commits, isLoading: loadingCommits } = api.codeBrowser.getCommits.useQuery({
    projectId: params.projectId,
    branch: selectedBranch || undefined,
  }, { enabled: isCreateOpen && !!selectedBranch });
  useEffect(() => {
    if (branches && branches.length > 0 && !selectedBranch) {
      const defaultBranch = branches.find(b => b.name === 'main') || branches[0];
      if (defaultBranch) {
        setSelectedBranch(defaultBranch.name);
      }
    }
  }, [branches, selectedBranch]);
  const createReview = api.codeReview.createReview.useMutation({
    onSuccess: () => {
      refetch();
      setIsCreateOpen(false);
      setSelectedBranch("");
      setSelectedCommit("");
    },
  });
  const handleCreateReview = () => {
    if (!selectedBranch || !selectedCommit) return;
    createReview.mutate({
      projectId: params.projectId,
      branch: selectedBranch,
      commitHash: selectedCommit,
    });
  };
  const filteredCommits = commits?.filter(commit =>
    commit.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    commit.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    commit.sha.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!params.projectId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    if (score >= 50) return "text-orange-600";
    return "text-red-600";
  };
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <ProjectBreadcrumb />
        <QuickNav />
      </div>
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 text-purple-500">
              <Code2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                AI Code Review
              </h1>
              <p className="text-muted-foreground mt-1">
                Automated code analysis with AI-powered insights
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
              <Sparkles className="size-3 mr-1" />
              AI-Powered Analysis
            </Badge>
            <Badge variant="outline">Security Scanning</Badge>
          </div>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
              <Play className="h-4 w-4" />
              Start New Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Code2 className="h-5 w-5" />
                Create Code Review
              </DialogTitle>
              <DialogDescription>
                Select a branch and commit to analyze. AI will scan for security, performance, and best practices.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="branch" className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  Branch
                </Label>
                {loadingBranches ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches?.map((branch) => (
                        <SelectItem key={branch.name} value={branch.name}>
                          <div className="flex items-center gap-2">
                            <GitBranch className="h-3 w-3" />
                            {branch.name}
                            {branch.protected && (
                              <Badge variant="secondary" className="ml-2 text-xs">Protected</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              {selectedBranch && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <GitCommit className="h-4 w-4" />
                      Commits on {selectedBranch}
                    </Label>
                    <Input
                      placeholder="Search commits..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-xs"
                    />
                  </div>
                  {loadingCommits ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : (
                    <ScrollArea className="h-[300px] rounded-md border">
                      <div className="p-4 space-y-2">
                        {filteredCommits && filteredCommits.length > 0 ? (
                          filteredCommits.map((commit) => (
                            <Card
                              key={commit.sha}
                              className={`cursor-pointer transition-all hover:border-primary/50 ${
                                selectedCommit === commit.sha ? 'ring-2 ring-primary border-primary' : ''
                              }`}
                              onClick={() => setSelectedCommit(commit.sha)}
                            >
                              <CardContent className="p-4">
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between gap-4">
                                    <p className="text-sm font-medium line-clamp-2">
                                      {commit.message?.split('\n')[0] || 'No message'}
                                    </p>
                                    {selectedCommit === commit.sha && (
                                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      {commit.author || 'Unknown'}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {formatDate(commit.date)}
                                    </div>
                                  </div>
                                  <code className="text-xs text-muted-foreground font-mono">
                                    {commit.sha.substring(0, 8)}
                                  </code>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            {searchTerm ? 'No commits found matching your search' : 'No commits available'}
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              )}
              <Button
                onClick={handleCreateReview}
                disabled={createReview.isPending || !selectedBranch || !selectedCommit}
                className="w-full"
                size="lg"
              >
                {createReview.isPending ? "Creating Review..." : "Start AI Review"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Reviews"
          value={stats?.totalReviews || 0}
          icon={<FileCode className="h-5 w-5" />}
        />
        <StatCard
          title="Avg Overall Score"
          value={`${Math.round(stats?.averageScores.overallScore || 0)}/100`}
          icon={<TrendingUp className="h-5 w-5" />}
          valueClassName={getScoreColor(stats?.averageScores.overallScore || 0)}
        />
        <StatCard
          title="Security Score"
          value={`${Math.round(stats?.averageScores.securityScore || 0)}/100`}
          icon={<Shield className="h-5 w-5" />}
          valueClassName={getScoreColor(stats?.averageScores.securityScore || 0)}
        />
        <StatCard
          title="Performance Score"
          value={`${Math.round(stats?.averageScores.performanceScore || 0)}/100`}
          icon={<Zap className="h-5 w-5" />}
          valueClassName={getScoreColor(stats?.averageScores.performanceScore || 0)}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
          <CardDescription>View and manage your code reviews</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : reviews?.reviews.length === 0 ? (
            <div className="text-center py-12">
              <Code className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No code reviews yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first review to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews?.reviews.map((review) => (
                <Card
                  key={review.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/dashboard/${params.projectId}/code-review/${review.id}`
                    )
                  }
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            {review.prTitle || `Review #${review.id.slice(0, 8)}`}
                          </h3>
                          <Badge
                            variant={
                              review.status === "COMPLETED"
                                ? "success"
                                : review.status === "IN_PROGRESS"
                                ? "default"
                                : review.status === "FAILED"
                                ? "destructive"
                                : "default"
                            }
                          >
                            {review.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Branch: {review.branch} • Commit: {review.commitHash.slice(0, 7)}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    {review.status === "COMPLETED" && (
                      <>
                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <ScoreDisplay
                            label="Overall"
                            score={review.overallScore}
                          />
                          <ScoreDisplay
                            label="Security"
                            score={review.securityScore}
                          />
                          <ScoreDisplay
                            label="Performance"
                            score={review.performanceScore}
                          />
                          <ScoreDisplay
                            label="Maintainability"
                            score={review.maintainabilityScore}
                          />
                        </div>
                        <div className="flex gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            <span>
                              {
                                review.findings.filter(
                                  (f) => f.severity === "CRITICAL" || f.severity === "HIGH"
                                ).length
                              }{" "}
                              critical/high issues
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Code className="h-4 w-4 text-muted-foreground" />
                            <span>{review._count.suggestions} suggestions</span>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
function StatCard({
  title,
  value,
  icon,
  valueClassName = "",
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueClassName}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
function ScoreDisplay({ label, score }: { label: string; score: number }) {
  const getColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 70) return "bg-yellow-500";
    if (score >= 50) return "bg-orange-500";
    return "bg-red-500";
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium">{label}</span>
        <span className="text-xs font-bold">{score}</span>
      </div>
      <div className="w-full bg-accent rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${getColor(score)} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
