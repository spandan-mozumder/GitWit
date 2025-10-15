"use client"
import { ExternalLink, Github, Sparkles, BarChart3, Code2, MessageSquare, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react'
import useProject from '~/hooks/use-project';
import AskQuestionCard from './ask-question-card';
import MeetingCard from './meeting-card';
import CommitLog from './commit-log';
import DeleteButton from './delete-button';
import InviteButton from './invite-button';
import TeamMembers from './team-members';
import { Skeleton } from '~/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { EmptyProjectState } from '~/components/empty-project-state';

const DashboardPage = () => {
  const { project, projects } = useProject();

  if (!projects) {
    return (
      <div className="space-y-10 animate-fade-in">
        <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/70 p-6 md:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-6 flex-1">
              <div className="flex items-center gap-3">
                <Skeleton className="h-11 w-11 rounded-full animate-skeleton-pulse" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-32 animate-skeleton-pulse" />
                  <Skeleton className="h-7 w-64 animate-skeleton-pulse" />
                </div>
              </div>
              <Skeleton className="h-16 w-full max-w-xl animate-skeleton-pulse" />
            </div>
            <div className="w-full lg:w-80">
              <Skeleton className="h-48 w-full rounded-2xl animate-skeleton-pulse" />
            </div>
          </div>
        </section>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <Skeleton className="h-96 col-span-3 rounded-3xl animate-skeleton-pulse" />
          <Skeleton className="h-96 col-span-2 rounded-3xl animate-skeleton-pulse" />
        </div>
        <Skeleton className="h-96 w-full rounded-3xl animate-skeleton-pulse" />
      </div>
    );
  }

  // Show empty state if no project is selected
  if (!project) {
    return <EmptyProjectState />
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header Section */}
      <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/70 p-6 md:p-8">
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-primary/30 via-border/60 to-transparent" />
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/12 text-primary">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Active workspace</p>
                <h1 className="text-2xl font-semibold md:text-3xl">{project?.name || 'Untitled initiative'}</h1>
              </div>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              This hub keeps your squads aligned across analysis, updates, and decision logs. Review core signals, act on
              AI insights, and keep leadership informed without extra status pings.
            </p>
          </div>

          <aside className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-background/70 p-5 text-sm">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Github className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Connected repository</p>
                <Link 
                  href={project?.repoUrl ?? "#"} 
                  target='_blank' 
                  className='inline-flex items-center gap-1 truncate text-sm text-foreground transition-colors hover:text-primary'
                >
                  <span className="truncate">{project?.repoUrl || 'Link a repository to unlock insights'}</span>
                  <ExternalLink className='h-3 w-3 flex-shrink-0' />
                </Link>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <TeamMembers/>
              <InviteButton/>
              <DeleteButton/>
            </div>
          </aside>
        </div>
      </section>

      {/* Main Content Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <AskQuestionCard />
        <MeetingCard/>
      </div>

      {/* New Tier 1 Features Showcase */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Platform Features</h2>
            <p className="text-sm text-muted-foreground mt-1">Powerful tools to boost your team's productivity</p>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            <Sparkles className="size-3 mr-1" />
            AI-Powered
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Analytics Card */}
          <Card className="group relative overflow-hidden border-border/70 bg-gradient-to-br from-card/70 to-card/40 transition-all hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <Badge variant="outline" className="text-xs">New</Badge>
              </div>
              <CardTitle className="mt-4">Advanced Analytics</CardTitle>
              <CardDescription>
                Track team metrics, DORA scores, velocity trends, and code hotspots with AI-powered insights.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/dashboard/${project?.id}/analytics`}>
                <Button variant="ghost" className="w-full justify-between group/btn">
                  View Analytics
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Code Review Card */}
          <Card className="group relative overflow-hidden border-border/70 bg-gradient-to-br from-card/70 to-card/40 transition-all hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500">
                  <Code2 className="h-6 w-6" />
                </div>
                <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-600 border-purple-500/20">AI</Badge>
              </div>
              <CardTitle className="mt-4">AI Code Review</CardTitle>
              <CardDescription>
                Automated security scanning, performance analysis, and code quality scoring with AI suggestions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/dashboard/${project?.id}/code-review`}>
                <Button variant="ghost" className="w-full justify-between group/btn">
                  Start Review
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Team Chat Card */}
          <Card className="group relative overflow-hidden border-border/70 bg-gradient-to-br from-card/70 to-card/40 transition-all hover:shadow-lg hover:shadow-green-500/10 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-500">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">Live</Badge>
              </div>
              <CardTitle className="mt-4">Team Collaboration</CardTitle>
              <CardDescription>
                Real-time chat with code context, annotations, @mentions, and AI-powered assistance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/dashboard/${project?.id}/team-chat`}>
                <Button variant="ghost" className="w-full justify-between group/btn">
                  Open Chat
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Commit Log */}
      <CommitLog/>
    </div>
  )
}

export default DashboardPage