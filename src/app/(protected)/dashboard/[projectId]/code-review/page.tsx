"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Trash2,
  Lightbulb,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
export default function CodeReviewPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedCommit, setSelectedCommit] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const {
    data: reviews,
    isLoading,
    refetch,
  } = api.codeReview.getProjectReviews.useQuery({
    projectId: params.projectId,
    limit: 20,
  });
  const { data: stats } = api.codeReview.getReviewStats.useQuery({
    projectId: params.projectId,
  });
  const { data: branches, isLoading: loadingBranches } =
    api.codeBrowser.getBranches.useQuery(
      {
        projectId: params.projectId,
      },
      { enabled: isCreateOpen },
    );
  const { data: commits, isLoading: loadingCommits } =
    api.codeBrowser.getCommits.useQuery(
      {
        projectId: params.projectId,
        branch: selectedBranch || undefined,
      },
      { enabled: isCreateOpen && !!selectedBranch },
    );
  useEffect(() => {
    if (branches && branches.length > 0 && !selectedBranch) {
      const defaultBranch =
        branches.find((b) => b.name === "main") || branches[0];
      if (defaultBranch) {
        setSelectedBranch(defaultBranch.name);
      }
    }
  }, [branches, selectedBranch]);
  const createReview = api.codeReview.createReview.useMutation({
    onSuccess: (data) => {
      toast.success("Code review created successfully!");
      refetch();
      setIsCreateOpen(false);
      setSelectedBranch("");
      setSelectedCommit("");
      // Navigate to the review detail page
      if (data?.id) {
        router.push(`/dashboard/${params.projectId}/code-review/${data.id}`);
      }
    },
    onError: (error) => {
      toast.error(`Failed to create review: ${error.message}`);
      console.error("Code review creation error:", error);
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

  const deleteReview = api.codeReview.deleteReview.useMutation({
    onSuccess: () => {
      toast.success("Review deleted successfully");
      refetch();
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
    },
    onError: (error) => {
      toast.error("Failed to delete review: " + error.message);
    },
  });

  const handleDeleteReview = (e: React.MouseEvent, reviewId: string) => {
    e.stopPropagation();
    setReviewToDelete(reviewId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (reviewToDelete) {
      deleteReview.mutate({ reviewId: reviewToDelete });
    }
  };

  const filteredCommits = commits?.filter(
    (commit) =>
      commit.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commit.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commit.sha.toLowerCase().includes(searchTerm.toLowerCase()),
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
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  return (
    <div className="container mx-auto p-6 space-y-8 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <ProjectBreadcrumb />
        <QuickNav />
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/10 text-purple-500 shadow-sm">
              <Code2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                AI Code Review
              </h1>
              <p className="text-muted-foreground text-sm">
                Automated code analysis with AI-powered insights
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 pl-1">
            <Badge
              variant="secondary"
              className="bg-purple-500/10 text-purple-600 border-purple-500/20 px-2.5 py-0.5"
            >
              <Sparkles className="size-3 mr-1.5" />
              AI-Powered Analysis
            </Badge>
            <Badge variant="outline" className="text-muted-foreground">Security Scanning</Badge>
            <Badge variant="outline" className="text-muted-foreground">Performance</Badge>
          </div>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
              <Play className="h-4 w-4 fill-current" />
              Start New Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden border-border/50 shadow-2xl">
            <div className="p-6 border-b border-border/50 bg-muted/30">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Code2 className="h-5 w-5" />
                  </div>
                  Create Code Review
                </DialogTitle>
                <DialogDescription className="text-base">
                  Select a branch and commit to analyze. AI will scan for
                  security, performance, and best practices.
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <Label htmlFor="branch" className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  Branch
                </Label>
                {loadingBranches ? (
                  <div className="flex items-center justify-center h-10 rounded-md border border-input bg-background">
                    <Spinner className="h-4 w-4" />
                  </div>
                ) : (
                  <Select
                    value={selectedBranch}
                    onValueChange={setSelectedBranch}
                  >
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
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs"
                              >
                                Protected
                              </Badge>
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
                    <div className="flex items-center justify-center h-[300px]">
                      <Spinner className="h-6 w-6" />
                    </div>
                  ) : (
                    <ScrollArea className="h-[300px] rounded-md border">
                      <div className="p-4 space-y-2">
                        {filteredCommits && filteredCommits.length > 0 ? (
                          filteredCommits.map((commit) => (
                            <Card
                              key={commit.sha}
                              className={`cursor-pointer transition-all hover:border-primary/50 ${
                                selectedCommit === commit.sha
                                  ? "ring-2 ring-primary border-primary"
                                  : ""
                              }`}
                              onClick={() => setSelectedCommit(commit.sha)}
                            >
                              <CardContent className="p-4">
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between gap-4">
                                    <p className="text-sm font-medium line-clamp-2">
                                      {commit.message?.split("\n")[0] ||
                                        "No message"}
                                    </p>
                                    {selectedCommit === commit.sha && (
                                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      {commit.author || "Unknown"}
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
                            {searchTerm
                              ? "No commits found matching your search"
                              : "No commits available"}
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              )}
              <Button
                onClick={handleCreateReview}
                loading={createReview.isPending}
                disabled={!selectedBranch || !selectedCommit}
                className="w-full"
                size="lg"
              >
                {createReview.isPending ? "Analyzing Code..." : "Start AI Review"}
              </Button>
              {createReview.isPending && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  This may take a few moments while we analyze your code...
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              code review and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteReview.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteReview.isPending ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Reviews"
          value={stats?.totalReviews || 0}
          icon={<FileCode className="h-5 w-5" />}
          description="All time reviews"
          trend="+12% from last month"
        />
        <StatCard
          title="Avg Overall Score"
          value={`${Math.round(stats?.averageScores.overallScore || 0)}`}
          suffix="/100"
          icon={<TrendingUp className="h-5 w-5" />}
          valueClassName={getScoreColor(stats?.averageScores.overallScore || 0)}
          description="Code quality metric"
        />
        <StatCard
          title="Security Score"
          value={`${Math.round(stats?.averageScores.securityScore || 0)}`}
          suffix="/100"
          icon={<Shield className="h-5 w-5" />}
          valueClassName={getScoreColor(
            stats?.averageScores.securityScore || 0,
          )}
          description="Vulnerability status"
        />
        <StatCard
          title="Performance Score"
          value={`${Math.round(stats?.averageScores.performanceScore || 0)}`}
          suffix="/100"
          icon={<Zap className="h-5 w-5" />}
          valueClassName={getScoreColor(
            stats?.averageScores.performanceScore || 0,
          )}
          description="Optimization level"
        />
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Recent Reviews</h2>
            <p className="text-sm text-muted-foreground">View and manage your code analysis history</p>
          </div>
        </div>
        
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Spinner className="h-8 w-8" />
              </div>
            ) : reviews?.reviews.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <Code className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No code reviews yet</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                  Start your first AI-powered code review to get insights on security, performance, and quality.
                </p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  Create your first review
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {reviews?.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-muted/30 transition-colors cursor-pointer gap-4"
                    onClick={() =>
                      router.push(
                        `/dashboard/${params.projectId}/code-review/${review.id}`,
                      )
                    }
                  >
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 p-2 rounded-lg ${
                        review.status === "COMPLETED" ? "bg-green-500/10 text-green-600" :
                        review.status === "FAILED" ? "bg-red-500/10 text-red-600" :
                        "bg-blue-500/10 text-blue-600"
                      }`}>
                        {review.status === "COMPLETED" ? <CheckCircle2 className="h-5 w-5" /> :
                         review.status === "FAILED" ? <AlertTriangle className="h-5 w-5" /> :
                         <Spinner className="h-5 w-5" />}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                            {review.prTitle || `Review #${review.id.slice(0, 8)}`}
                          </h3>
                          <Badge
                            variant={
                              review.status === "COMPLETED"
                                ? "success"
                                : review.status === "IN_PROGRESS"
                                  ? "default"
                                  : "destructive"
                            }
                            className="text-[10px] px-2 py-0.5 h-5"
                          >
                            {review.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <GitBranch className="h-3.5 w-3.5" />
                            <span className="font-mono text-xs">{review.branch}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <GitCommit className="h-3.5 w-3.5" />
                            <span className="font-mono text-xs">{review.commitHash.substring(0, 7)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(review.createdAt.toString())}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 pl-14 sm:pl-0">
                      {review.status === "COMPLETED" && (
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className={`text-xl font-bold ${getScoreColor(review.overallScore)}`}>
                              {review.overallScore}
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Score</div>
                          </div>
                          <div className="h-8 w-px bg-border/50 hidden sm:block" />
                          <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="flex items-center gap-1 text-sm font-medium">
                                <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                                {review._count.findings}
                              </div>
                              <span className="text-[10px] text-muted-foreground">Issues</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className="flex items-center gap-1 text-sm font-medium">
                                <Lightbulb className="h-3.5 w-3.5 text-yellow-500" />
                                {review._count.suggestions}
                              </div>
                              <span className="text-[10px] text-muted-foreground">Ideas</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={(e) => handleDeleteReview(e, review.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
          <CardDescription>View and manage your code reviews</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner className="h-8 w-8" />
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
                      `/dashboard/${params.projectId}/code-review/${review.id}`,
                    )
                  }
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">
                              {review.prTitle ||
                                `Review #${review.id.slice(0, 8)}`}
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => handleDeleteReview(e, review.id)}
                            loading={
                              deleteReview.isPending &&
                              deleteReview.variables?.reviewId === review.id
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Branch: {review.branch} • Commit:{" "}
                          {review.commitHash.slice(0, 7)}
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
                                  (f) =>
                                    f.severity === "CRITICAL" ||
                                    f.severity === "HIGH",
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
  description,
  trend,
  suffix,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  valueClassName?: string;
  description?: string;
  trend?: string;
  suffix?: string;
}) {
  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        <div className="text-muted-foreground group-hover:text-primary transition-colors bg-muted/50 p-2 rounded-lg group-hover:bg-primary/10">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <div className={`text-3xl font-bold tracking-tight ${valueClassName}`}>
            {value}
          </div>
          {suffix && <span className="text-sm text-muted-foreground font-medium">{suffix}</span>}
        </div>
        {(description || trend) && (
          <div className="mt-1 flex items-center gap-2 text-xs">
            {trend && (
              <span className="text-green-600 font-medium flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" />
                {trend}
              </span>
            )}
            {description && (
              <span className="text-muted-foreground truncate">
                {description}
              </span>
            )}
          </div>
        )}
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
