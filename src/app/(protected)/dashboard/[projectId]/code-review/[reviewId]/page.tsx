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
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
export default function ReviewDetailPage() {
  const params = useParams<{ projectId: string; reviewId: string }>();
  const router = useRouter();
  const { data: review, isLoading } = api.codeReview.getReview.useQuery({
    reviewId: params.reviewId,
  });
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "HIGH":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "MEDIUM":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "LOW":
        return <CheckCircle2 className="h-5 w-5 text-blue-500" />;
      default:
        return <CheckCircle2 className="h-5 w-5 text-gray-500" />;
    }
  };
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "HIGH":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      case "MEDIUM":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "LOW":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    if (score >= 50) return "text-orange-600";
    return "text-red-600";
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
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Review not found</p>
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
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <ProjectBreadcrumb />
        <QuickNav />
      </div>
      <Button
        variant="ghost"
        onClick={() =>
          router.push(`/dashboard/${params.projectId}/code-review`)
        }
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Reviews
      </Button>
      <Card className="border-border/70">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">Code Review Analysis</CardTitle>
              <CardDescription>
                Branch:{" "}
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {review.branch}
                </code>
                {review.commitHash && (
                  <>
                    {" · "}Commit:{" "}
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {review.commitHash.slice(0, 7)}
                    </code>
                  </>
                )}
              </CardDescription>
            </div>
            <Badge
              variant={review.status === "COMPLETED" ? "default" : "secondary"}
              className={review.status === "COMPLETED" ? "bg-green-500" : ""}
            >
              {review.status}
            </Badge>
          </div>
        </CardHeader>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/70">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Overall Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div
                className={`text-4xl font-bold ${getScoreColor(review.overallScore)}`}
              >
                {review.overallScore}
              </div>
              <div className="text-muted-foreground">/100</div>
            </div>
            <Progress value={review.overallScore} className="mt-3" />
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div
                className={`text-4xl font-bold ${getScoreColor(review.securityScore)}`}
              >
                {review.securityScore}
              </div>
              <div className="text-muted-foreground">/100</div>
            </div>
            <Progress value={review.securityScore} className="mt-3" />
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div
                className={`text-4xl font-bold ${getScoreColor(review.performanceScore)}`}
              >
                {review.performanceScore}
              </div>
              <div className="text-muted-foreground">/100</div>
            </div>
            <Progress value={review.performanceScore} className="mt-3" />
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Code className="h-4 w-4" />
              Maintainability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div
                className={`text-4xl font-bold ${getScoreColor(review.maintainabilityScore)}`}
              >
                {review.maintainabilityScore}
              </div>
              <div className="text-muted-foreground">/100</div>
            </div>
            <Progress value={review.maintainabilityScore} className="mt-3" />
          </CardContent>
        </Card>
      </div>
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            Findings ({review.findings?.length || 0})
          </CardTitle>
          <CardDescription>
            Issues and concerns found in the codebase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(findingsBySeverity).map(([severity, findings]) => {
              if (findings.length === 0) return null;
              return (
                <AccordionItem key={severity} value={severity}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 w-full">
                      {getSeverityIcon(severity)}
                      <span className="font-semibold">{severity}</span>
                      <Badge
                        variant="outline"
                        className={getSeverityColor(severity)}
                      >
                        {findings.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      {findings.map((finding) => (
                        <div
                          key={finding.id}
                          className="border border-border/50 rounded-lg p-4 space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium">{finding.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {finding.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {finding.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <FileCode className="h-3 w-3" />
                            <code className="bg-muted px-2 py-0.5 rounded">
                              {finding.filePath}
                              {finding.lineNumber && `:${finding.lineNumber}`}
                            </code>
                          </div>
                          {finding.recommendation && (
                            <div className="mt-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded">
                              <p className="text-sm text-blue-600 font-medium">
                                Recommendation:
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
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
          {review.findings?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p>No issues found! Your code looks great.</p>
            </div>
          )}
        </CardContent>
      </Card>
      {review.suggestions && review.suggestions.length > 0 && (
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Improvement Suggestions ({review.suggestions.length})
            </CardTitle>
            <CardDescription>
              Recommendations to enhance your code quality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {review.suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="border border-border/50 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-medium">{suggestion.title}</h4>
                  {suggestion.applied && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-green-500/10 text-green-600"
                    >
                      Applied
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {suggestion.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileCode className="h-3 w-3" />
                  <code className="bg-muted px-2 py-0.5 rounded">
                    {suggestion.filePath}
                    {suggestion.lineNumber && `:${suggestion.lineNumber}`}
                  </code>
                </div>
                {suggestion.reasoning && (
                  <div className="flex items-start gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-green-600">
                      {suggestion.reasoning}
                    </span>
                  </div>
                )}
                {suggestion.suggestedCode && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Suggested Code:
                    </p>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                      <code>{suggestion.suggestedCode}</code>
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
