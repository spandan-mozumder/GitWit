"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  Shield,
  Zap,
  Code,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  FileCode,
  TrendingUp,
  Code2,
  Sparkles,
  Play,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function CodeReviewPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [branch, setBranch] = useState("");
  const [commitHash, setCommitHash] = useState("");

  const { data: reviews, isLoading, refetch } = api.codeReview.getProjectReviews.useQuery({
    projectId: params.projectId,
    limit: 20,
  });

  const { data: stats } = api.codeReview.getReviewStats.useQuery({
    projectId: params.projectId,
  });

  const createReview = api.codeReview.createReview.useMutation({
    onSuccess: () => {
      refetch();
      setIsCreateOpen(false);
      setBranch("");
      setCommitHash("");
    },
  });

  const handleCreateReview = () => {
    if (!branch || !commitHash) return;

    createReview.mutate({
      projectId: params.projectId,
      branch,
      commitHash,
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "destructive";
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "warning";
      case "LOW":
        return "default";
      default:
        return "default";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    if (score >= 50) return "text-orange-600";
    return "text-red-600";
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Code Review</DialogTitle>
              <DialogDescription>
                AI will analyze your code for security, performance, and best practices
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="branch">Branch</Label>
                <Input
                  id="branch"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                />
              </div>
              <div>
                <Label htmlFor="commitHash">Commit Hash</Label>
                <Input
                  id="commitHash"
                  value={commitHash}
                  onChange={(e) => setCommitHash(e.target.value)}
                  placeholder="abc123def456..."
                />
              </div>
              <Button
                onClick={handleCreateReview}
                disabled={createReview.isPending || !branch || !commitHash}
                className="w-full"
              >
                {createReview.isPending ? "Creating..." : "Start Review"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
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

      {/* Reviews List */}
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
