"use client";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { ProjectBreadcrumb } from "@/components/project-breadcrumb";
import { QuickNav } from "@/components/quick-nav";
import {
  Shield,
  Zap,
  Code,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  ArrowLeft,
  Lightbulb,
  TrendingUp,
  ListChecks,
  Search,
  Bug,
  FileText,
  GitBranch,
  GitCommit,
  Calendar,
  Code2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ReactMarkdown from "react-markdown";
export default function ReviewDetailPage() {
  const params = useParams<{ projectId: string; reviewId: string }>();
  const router = useRouter();
  const { data: review, isLoading } = api.codeReview.getReview.useQuery({
    reviewId: params.reviewId,
  });
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
      case "HIGH":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "MEDIUM":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "LOW":
        return <AlertTriangle className="h-5 w-5 text-blue-500" />;
      case "INFO":
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "text-red-600 bg-red-100 border-red-200";
      case "HIGH":
        return "text-orange-600 bg-orange-100 border-orange-200";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "LOW":
        return "text-blue-600 bg-blue-100 border-blue-200";
      case "INFO":
        return "text-gray-600 bg-gray-100 border-gray-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    if (score >= 50) return "text-orange-500";
    return "text-red-500";
  };
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }
  if (!review) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/dashboard/${params.projectId}/code-review`)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reviews
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Review Not Found</CardTitle>
            <CardDescription>
              The code review you're looking for doesn't exist or has been deleted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push(`/dashboard/${params.projectId}/code-review`)}
            >
              View All Reviews
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle failed review status
  if (review.status === "FAILED") {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <ProjectBreadcrumb />
          <QuickNav />
        </div>
        <Button
          variant="ghost"
          onClick={() => router.push(`/dashboard/${params.projectId}/code-review`)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reviews
        </Button>
        <Card className="border-red-500/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <CardTitle className="text-red-600">Review Failed</CardTitle>
            </div>
            <CardDescription>
              Branch: <code className="text-xs">{review.branch}</code> • Commit: <code className="text-xs">{review.commitHash}</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              The code review analysis encountered an error. This may be due to:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mb-4">
              <li>Invalid branch or commit reference</li>
              <li>Repository access issues</li>
              <li>GitHub API rate limits</li>
              <li>Empty or inaccessible repository</li>
            </ul>
            <Button
              onClick={() => router.push(`/dashboard/${params.projectId}/code-review`)}
            >
              Create New Review
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle in-progress review status
  if (review.status === "IN_PROGRESS") {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <ProjectBreadcrumb />
          <QuickNav />
        </div>
        <Button
          variant="ghost"
          onClick={() => router.push(`/dashboard/${params.projectId}/code-review`)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reviews
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Spinner className="h-5 w-5" />
              Analysis In Progress
            </CardTitle>
            <CardDescription>
              Branch: <code className="text-xs">{review.branch}</code> • Commit: <code className="text-xs">{review.commitHash}</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12">
              <Spinner className="h-12 w-12 mb-4" />
              <p className="text-sm text-muted-foreground">
                Analyzing your code... This may take a few minutes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  const findingsBySeverity = {
    CRITICAL: review.findings?.filter((f) => f.severity === "CRITICAL") || [],
    HIGH: review.findings?.filter((f) => f.severity === "HIGH") || [],
    MEDIUM: review.findings?.filter((f) => f.severity === "MEDIUM") || [],
    LOW: review.findings?.filter((f) => f.severity === "LOW") || [],
    INFO: review.findings?.filter((f) => f.severity === "INFO") || [],
  };
  return (
    <div className="container mx-auto p-6 space-y-8 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <ProjectBreadcrumb />
        <QuickNav />
      </div>
      
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            router.push(`/dashboard/${params.projectId}/code-review`)
          }
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reviews
        </Button>
      </div>

      <Card className="border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-sm shadow-sm overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
        <CardHeader className="pb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <Code2 className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">Code Review Analysis</CardTitle>
                  <p className="text-muted-foreground text-sm mt-1">
                    AI-powered insights for your codebase
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 border border-border/50">
                  <GitBranch className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-xs">{review.branch}</span>
                </div>
                {review.commitHash && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 border border-border/50">
                    <GitCommit className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-xs">{review.commitHash.slice(0, 7)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 border border-border/50">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <Badge
              variant={review.status === "COMPLETED" ? "default" : "secondary"}
              className={`px-4 py-1.5 text-sm font-medium ${
                review.status === "COMPLETED" 
                  ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20" 
                  : ""
              }`}
            >
              {review.status === "COMPLETED" && <CheckCircle2 className="h-4 w-4 mr-2" />}
              {review.status.replace("_", " ")}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {(review.status !== "COMPLETED" && review.status !== "PENDING") && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Review Failed
            </CardTitle>
            <CardDescription className="text-destructive/80">
              The code review analysis failed to complete. Please try again later.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {review.status === "COMPLETED" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Overall Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <div
                    className={`text-4xl font-bold tracking-tight ${getScoreColor(review.overallScore)}`}
                  >
                    {review.overallScore}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">/100</div>
                </div>
                <Progress value={review.overallScore} className="mt-4 h-2" />
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <div
                    className={`text-4xl font-bold tracking-tight ${getScoreColor(review.securityScore)}`}
                  >
                    {review.securityScore}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">/100</div>
                </div>
                <Progress value={review.securityScore} className="mt-4 h-2" />
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <div
                    className={`text-4xl font-bold tracking-tight ${getScoreColor(review.performanceScore)}`}
                  >
                    {review.performanceScore}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">/100</div>
                </div>
                <Progress value={review.performanceScore} className="mt-4 h-2" />
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Maintainability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <div
                    className={`text-4xl font-bold tracking-tight ${getScoreColor(review.maintainabilityScore)}`}
                  >
                    {review.maintainabilityScore}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">/100</div>
                </div>
                <Progress value={review.maintainabilityScore} className="mt-4 h-2" />
              </CardContent>
            </Card>
          </div>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileCode className="h-5 w-5 text-primary" />
                Findings ({review.findings?.length || 0})
              </CardTitle>
              <CardDescription>
                Issues and concerns found in the codebase
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(!review.findings || review.findings.length === 0) ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <p className="text-lg font-medium text-green-600 mb-2">
                    No Issues Found!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your code looks great! No security, performance, or code quality issues detected.
                  </p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {Object.entries(findingsBySeverity).map(([severity, findings]) => {
                    if (findings.length === 0) return null;
                  return (
                    <AccordionItem key={severity} value={severity} className="border border-border/50 rounded-lg bg-card/30 overflow-hidden">
                      <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3 w-full">
                          {getSeverityIcon(severity)}
                          <span className="font-semibold capitalize">{severity.toLowerCase()}</span>
                          <Badge
                            variant="outline"
                            className={`${getSeverityColor(severity)} ml-auto mr-4`}
                          >
                            {findings.length} issues
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 bg-muted/20">
                        <div className="space-y-4 pt-4">
                          {findings.map((finding) => (
                            <div
                              key={finding.id}
                              className="bg-card border border-border/50 rounded-lg p-4 space-y-3 shadow-sm"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <h4 className="font-medium text-base">{finding.title}</h4>
                                <Badge variant="outline" className="text-xs shrink-0">
                                  {finding.category}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {finding.description}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 w-fit px-2 py-1 rounded border border-border/50">
                                <FileCode className="h-3 w-3" />
                                <code className="font-mono">
                                  {finding.filePath}
                                  {finding.lineNumber && `:${finding.lineNumber}`}
                                </code>
                              </div>
                              {finding.recommendation && (
                                <div className="mt-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                                  <div className="flex items-center gap-2 text-sm font-medium text-blue-600 mb-1">
                                    <Lightbulb className="h-4 w-4" />
                                    Recommendation
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {finding.recommendation}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                  })}
                </Accordion>
              )}
            </CardContent>
          </Card>
          {review.suggestions && review.suggestions.length > 0 && (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Improvement Suggestions ({review.suggestions.length})
                </CardTitle>
                <CardDescription>
                  Recommendations to enhance your code quality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {review.suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="border border-border/50 bg-card/30 rounded-lg p-6 space-y-4 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="font-semibold text-base">{suggestion.title}</h4>
                      {suggestion.applied && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-green-500/10 text-green-600 border-green-500/20"
                        >
                          Applied
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {suggestion.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 w-fit px-2 py-1 rounded border border-border/50">
                      <FileCode className="h-3 w-3" />
                      <code className="font-mono">
                        {suggestion.filePath}
                        {suggestion.lineNumber && `:${suggestion.lineNumber}`}
                      </code>
                    </div>
                    {suggestion.reasoning && (
                      <div className="flex items-start gap-2 text-sm p-3 bg-green-500/5 border border-green-500/10 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                        <span className="text-green-700 dark:text-green-400">
                          {suggestion.reasoning}
                        </span>
                      </div>
                    )}
                    {suggestion.suggestedCode && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Suggested Code
                        </p>
                        <div className="relative group">
                          <pre className="bg-muted/50 border border-border/50 p-4 rounded-lg text-xs overflow-x-auto font-mono">
                            <code>{suggestion.suggestedCode}</code>
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
