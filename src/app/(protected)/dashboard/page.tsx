"use client";
import {
  ExternalLink,
  Github,
  Sparkles,
  BarChart3,
  Code2,
  MessageSquare,
  ArrowRight,
  Lightbulb,
  FolderTree,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import useProject from "~/hooks/use-project";
import AskQuestionCard from "./ask-question-card";
import MeetingCard from "./meeting-card";
import CommitLog from "./commit-log";
import DeleteButton from "./delete-button";
import InviteButton from "./invite-button";
import TeamMembers from "./team-members";
import { Spinner } from "~/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { EmptyProjectState } from "~/components/empty-project-state";
const DashboardPage = () => {
  const { project, projects } = useProject();
  if (!projects) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="size-8" />
      </div>
    );
  }
  if (!project) {
    return <EmptyProjectState />;
  }
  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 p-8 shadow-sm backdrop-blur-sm">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary via-primary/50 to-transparent rounded-l-3xl" />
        
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between relative z-10">
          <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 text-primary shadow-inner">
                  <Sparkles className="h-6 w-6" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold bg-primary/5 text-primary border-primary/20 px-2 py-0.5 h-5">
                    Active Workspace
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {project?.name || "Untitled initiative"}
                </h1>
              </div>
            </div>
            <p className="text-base leading-relaxed text-muted-foreground/90">
              This hub keeps your squads aligned across analysis, updates, and
              decision logs. Review core signals, act on AI insights, and keep
              leadership informed without extra status pings.
            </p>
          </div>
          
          <aside className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-background/40 p-5 text-sm backdrop-blur-md shadow-sm min-w-[300px]">
            <div className="flex items-center gap-3 pb-4 border-b border-border/50">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm">
                <Github className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">
                  Repository
                </p>
                <Link
                  href={project?.repoUrl ?? "#"}
                  target="_blank"
                  className="flex items-center gap-1.5 truncate text-sm font-medium text-foreground transition-colors hover:text-primary group"
                >
                  <span className="truncate max-w-[180px]">
                    {project?.repoUrl?.replace("https://github.com/", "") || "Link repository"}
                  </span>
                  <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <TeamMembers />
              <div className="h-4 w-px bg-border/60 mx-1" />
              <InviteButton />
              <DeleteButton />
            </div>
          </aside>
        </div>
      </section>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 h-full">
          <AskQuestionCard />
        </div>
        <div className="lg:col-span-2 h-full">
          <MeetingCard />
        </div>
      </div>
      
      <section className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Platform Features</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Powerful tools to boost your team&apos;s productivity
            </p>
          </div>
          <Badge
            variant="secondary"
            className="bg-gradient-to-r from-primary/10 to-purple-500/10 text-primary border-primary/20 px-3 py-1"
          >
            <Sparkles className="size-3.5 mr-1.5" />
            AI-Powered Suite
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="group relative overflow-hidden border-border/70 bg-gradient-to-br from-card/70 to-card/40 transition-all hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <Badge variant="outline" className="text-xs">
                  New
                </Badge>
              </div>
              <CardTitle className="mt-4">Advanced Analytics</CardTitle>
              <CardDescription>
                Track team metrics, DORA scores, velocity trends, and code
                hotspots with AI-powered insights.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/dashboard/${project?.id}/analytics`}>
                <Button
                  variant="ghost"
                  className="w-full justify-between group/btn"
                >
                  View Analytics
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="group relative overflow-hidden border-border/70 bg-gradient-to-br from-card/70 to-card/40 transition-all hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500">
                  <Code2 className="h-6 w-6" />
                </div>
                <Badge
                  variant="outline"
                  className="text-xs bg-purple-500/10 text-purple-600 border-purple-500/20"
                >
                  AI
                </Badge>
              </div>
              <CardTitle className="mt-4">AI Code Review</CardTitle>
              <CardDescription>
                Automated security scanning, performance analysis, and code
                quality scoring with AI suggestions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/dashboard/${project?.id}/code-review`}>
                <Button
                  variant="ghost"
                  className="w-full justify-between group/btn"
                >
                  Start Review
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="group relative overflow-hidden border-border/70 bg-gradient-to-br from-card/70 to-card/40 transition-all hover:shadow-lg hover:shadow-green-500/10 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-500">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <Badge
                  variant="outline"
                  className="text-xs bg-green-500/10 text-green-600 border-green-500/20"
                >
                  Live
                </Badge>
              </div>
              <CardTitle className="mt-4">Team Collaboration</CardTitle>
              <CardDescription>
                Real-time chat with code context, annotations, @mentions, and
                AI-powered assistance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/dashboard/${project?.id}/team-chat`}>
                <Button
                  variant="ghost"
                  className="w-full justify-between group/btn"
                >
                  Open Chat
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="group relative overflow-hidden border-border/70 bg-gradient-to-br from-card/70 to-card/40 transition-all hover:shadow-lg hover:shadow-yellow-500/10 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-500">
                  <Lightbulb className="h-6 w-6" />
                </div>
                <Badge
                  variant="outline"
                  className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                >
                  AI
                </Badge>
              </div>
              <CardTitle className="mt-4">Feature Brainstorming</CardTitle>
              <CardDescription>
                AI-generated feature ideas with implementation plans, time
                estimates, and user stories.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/brainstorming">
                <Button
                  variant="ghost"
                  className="w-full justify-between group/btn"
                >
                  Generate Ideas
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="group relative overflow-hidden border-border/70 bg-gradient-to-br from-card/70 to-card/40 transition-all hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-500">
                  <FolderTree className="h-6 w-6" />
                </div>
                <Badge variant="outline" className="text-xs">
                  New
                </Badge>
              </div>
              <CardTitle className="mt-4">Code Browser</CardTitle>
              <CardDescription>
                Browse your entire codebase, view PRs with AI analysis, and
                explore file changes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/code-browser">
                <Button
                  variant="ghost"
                  className="w-full justify-between group/btn"
                >
                  Browse Code
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
      <CommitLog />
    </div>
  );
};
export default DashboardPage;
