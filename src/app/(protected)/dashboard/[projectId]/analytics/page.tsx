"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectBreadcrumb } from "@/components/project-breadcrumb";
import { QuickNav } from "@/components/quick-nav";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  GitCommit,
  GitPullRequest,
  Bug,
  Clock,
  Target,
  Zap,
  AlertTriangle,
  BarChart3,
  Sparkles,
} from "lucide-react";
export default function AnalyticsPage() {
  const params = useParams<{ projectId: string }>();
  const [period, setPeriod] = useState<"week" | "month" | "quarter">("week");
  const { data: productivity, isLoading: loadingProductivity } =
    api.analytics.getProductivitySummary.useQuery({
      projectId: params.projectId,
      period,
    });
  const { data: velocityTrends, isLoading: loadingVelocity } =
    api.analytics.getVelocityTrends.useQuery({
      projectId: params.projectId,
      days: period === "week" ? 7 : period === "month" ? 30 : 90,
    });
  const { data: leaderboard, isLoading: loadingLeaderboard } =
    api.analytics.getDeveloperLeaderboard.useQuery({
      projectId: params.projectId,
      metric: "commitsCount",
      period: period === "quarter" ? "month" : period,
    });
  const { data: hotspots, isLoading: loadingHotspots } =
    api.analytics.getCodeHotspots.useQuery({
      projectId: params.projectId,
      limit: 10,
    });
  const { data: doraMetrics, isLoading: loadingDora } =
    api.analytics.getDoraMetrics.useQuery({
      projectId: params.projectId,
      period,
    });

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <ProjectBreadcrumb />
        <QuickNav />
      </div>
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 text-blue-500">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Comprehensive insights into your team&apos;s performance
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
              <Sparkles className="size-3 mr-1" />
              AI-Powered Insights
            </Badge>
            <Badge variant="outline">DORA Metrics</Badge>
          </div>
        </div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as "week" | "month" | "quarter")} className="w-fit">
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="quarter">Quarter</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Commits"
          value={productivity?.developer._sum.commitsCount || 0}
          icon={<GitCommit className="h-5 w-5" />}
          trend={12}
          loading={loadingProductivity}
        />
        <MetricCard
          title="Pull Requests"
          value={productivity?.developer._sum.prsCreated || 0}
          icon={<GitPullRequest className="h-5 w-5" />}
          trend={-5}
          loading={loadingProductivity}
        />
        <MetricCard
          title="Issues Closed"
          value={productivity?.developer._sum.issuesClosed || 0}
          icon={<Target className="h-5 w-5" />}
          trend={8}
          loading={loadingProductivity}
        />
        <MetricCard
          title="Avg Review Time"
          value={`${Math.round(productivity?.developer._avg.averageReviewTime || 0)}m`}
          icon={<Clock className="h-5 w-5" />}
          trend={-15}
          loading={loadingProductivity}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Velocity</CardTitle>
            <CardDescription>Commits and PRs over time</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingVelocity ? (
              <Skeleton className="h-[300px]" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={velocityTrends}>
                  <defs>
                    <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPRs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="totalCommits"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorCommits)"
                    name="Commits"
                  />
                  <Area
                    type="monotone"
                    dataKey="totalPRs"
                    stroke="#82ca9d"
                    fillOpacity={1}
                    fill="url(#colorPRs)"
                    name="Pull Requests"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              DORA Metrics
              {doraMetrics && (
                <Badge
                  variant={
                    doraMetrics.rating === "Elite"
                      ? "default"
                      : doraMetrics.rating === "High"
                      ? "success"
                      : "warning"
                  }
                >
                  {doraMetrics.rating}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>DevOps performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingDora ? (
              <Skeleton className="h-[300px]" />
            ) : doraMetrics ? (
              <div className="space-y-4">
                <DORAMetricItem
                  label="Deployment Frequency"
                  value={`${doraMetrics.deploymentFrequency.toFixed(2)}/day`}
                  icon={<Zap className="h-4 w-4" />}
                />
                <DORAMetricItem
                  label="Lead Time"
                  value={`${Math.round(doraMetrics.leadTime)} hours`}
                  icon={<Clock className="h-4 w-4" />}
                />
                <DORAMetricItem
                  label="MTTR"
                  value={`${Math.round(doraMetrics.mttr)} hours`}
                  icon={<AlertTriangle className="h-4 w-4" />}
                />
                <DORAMetricItem
                  label="Change Failure Rate"
                  value={`${doraMetrics.changeFailureRate.toFixed(1)}%`}
                  icon={<Bug className="h-4 w-4" />}
                />
              </div>
            ) : (
              <p className="text-muted-foreground">No DORA metrics available</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>
            <CardDescription>Based on commits this {period}</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingLeaderboard ? (
              <Skeleton className="h-[300px]" />
            ) : (
              <div className="space-y-4">
                {leaderboard?.slice(0, 5).map((entry, index) => (
                  <div key={entry.userId} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <img
                      src={entry.user?.imageUrl || "/default-avatar.png"}
                      alt={entry.user?.firstName || "User"}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">
                        {entry.user?.firstName} {entry.user?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {entry._sum.commitsCount} commits
                      </p>
                    </div>
                    <Badge>{entry._sum.prsCreated} PRs</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Code Hotspots</CardTitle>
            <CardDescription>Files that need attention</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingHotspots ? (
              <Skeleton className="h-[300px]" />
            ) : (
              <div className="space-y-3">
                {hotspots?.map((hotspot) => (
                  <div
                    key={hotspot.id}
                    className="p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-mono text-sm truncate flex-1">
                        {hotspot.filePath}
                      </p>
                      <Badge
                        variant={
                          hotspot.riskScore > 75
                            ? "destructive"
                            : hotspot.riskScore > 50
                            ? "warning"
                            : "default"
                        }
                      >
                        Risk: {hotspot.riskScore}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Changes: {hotspot.changeFrequency}</span>
                      <span>Lines: {hotspot.linesChanged}</span>
                      <span>Contributors: {hotspot.contributorsCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
function MetricCard({
  title,
  value,
  icon,
  trend,
  loading,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-5 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend !== undefined && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {trend > 0 ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={trend > 0 ? "text-green-500" : "text-red-500"}>
              {Math.abs(trend)}%
            </span>{" "}
            from last period
          </p>
        )}
      </CardContent>
    </Card>
  );
}
function DORAMetricItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">{icon}</div>
        <span className="font-medium">{label}</span>
      </div>
      <span className="font-bold text-primary">{value}</span>
    </div>
  );
}
