"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { Badge } from '~/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Lightbulb, ThumbsUp, Clock, Code2, Loader2, ExternalLink, GitBranch, XCircle } from 'lucide-react'
import useProject from '~/hooks/use-project'
import { api } from '~/trpc/react'
import { toast } from 'sonner'
import { Spinner } from '~/components/ui/spinner'
const complexityColors = {
  EASY: 'bg-green-500/10 text-green-500 border-green-500/20',
  MEDIUM: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  HARD: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  VERY_HARD: 'bg-red-500/10 text-red-500 border-red-500/20',
}
const statusColors = {
  IDEA: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  PLANNED: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  IN_PROGRESS: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  DONE: 'bg-green-500/10 text-green-500 border-green-500/20',
  REJECTED: 'bg-red-500/10 text-red-500 border-red-500/20',
}
const BrainstormingPage = () => {
  const { project } = useProject()
  const [userInput, setUserInput] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const queryInput = {
    projectId: project?.id ?? '',
    ...(selectedStatus !== 'all' && { status: selectedStatus as "IDEA" | "PLANNED" | "IN_PROGRESS" | "DONE" | "REJECTED" }),
    ...(selectedCategory !== 'all' && { category: selectedCategory as "NEW_FEATURE" | "ENHANCEMENT" | "BUG_FIX" | "PERFORMANCE" | "SECURITY" | "UI_UX" | "REFACTOR" | "TESTING" | "DOCUMENTATION" }),
  }
  
  const { data: features, refetch, isLoading } = api.featureBrainstorming.getFeatureIdeas.useQuery(
    queryInput,
    { enabled: !!project }
  )
  const generateIdeas = api.featureBrainstorming.generateFeatureIdeas.useMutation({
    onSuccess: () => {
      toast.success('🎉 Feature ideas generated!')
      refetch()
      setUserInput('')
    },
    onError: (error) => {
      toast.error('Failed to generate ideas: ' + error.message)
    }
  })
  const voteFeature = api.featureBrainstorming.voteFeature.useMutation({
    onSuccess: () => {
      refetch()
    }
  })
  const updateStatus = api.featureBrainstorming.updateFeatureStatus.useMutation({
    onSuccess: () => {
      toast.success('Status updated')
      refetch()
    }
  })
  const createIssue = api.featureBrainstorming.createGitHubIssue.useMutation({
    onSuccess: (data) => {
      toast.success('GitHub issue created!', {
        action: {
          label: 'View',
          onClick: () => window.open(data.issueUrl, '_blank')
        }
      })
      refetch()
    },
    onError: (error) => {
      toast.error('Failed to create issue: ' + error.message)
    }
  })
  const deleteFeature = api.featureBrainstorming.deleteFeature.useMutation({
    onSuccess: () => {
      toast.success('Feature deleted')
      refetch()
    }
  })
  if (!project) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Please select a project</p>
      </div>
    )
  }
  return (
    <div className="space-y-8 animate-fade-in">
      <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/70 p-6 md:p-8">
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-purple-500/30 via-border/60 to-transparent" />
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-purple-500/12 text-purple-500">
                <Lightbulb className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">AI-Powered</p>
                <h1 className="text-2xl font-semibold md:text-3xl">Feature Brainstorming</h1>
              </div>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Describe what you want to build, and AI will generate creative, actionable feature ideas with implementation details, time estimates, and user stories.
            </p>
          </div>
        </div>
      </section>
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Generate New Ideas
          </CardTitle>
          <CardDescription>
            Tell us what kind of features you&apos;re thinking about, and we&apos;ll generate detailed suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="E.g., 'Add real-time collaboration features' or 'Improve performance monitoring' or 'Better analytics dashboard'"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="min-h-[100px] resize-none"
          />
          <Button 
            onClick={() => generateIdeas.mutate({ 
              projectId: project.id, 
              userInput,
              count: 5 
            })}
            disabled={!userInput.trim() || generateIdeas.isPending}
            className="w-full sm:w-auto"
          >
            {generateIdeas.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Ideas
          </Button>
        </CardContent>
      </Card>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-xl font-semibold">Your Ideas</h2>
          <div className="flex flex-wrap gap-3">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="IDEA">Idea</SelectItem>
                <SelectItem value="PLANNED">Planned</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="DONE">Done</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="NEW_FEATURE">New Feature</SelectItem>
                <SelectItem value="ENHANCEMENT">Enhancement</SelectItem>
                <SelectItem value="PERFORMANCE">Performance</SelectItem>
                <SelectItem value="SECURITY">Security</SelectItem>
                <SelectItem value="UI_UX">UI/UX</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner className="size-8" />
          </div>
        ) : features && features.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature) => (
              <Card key={feature.id} className="group relative overflow-hidden border-border/70 hover:border-primary/30 transition-all">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <CardTitle className="text-lg leading-tight">{feature.title}</CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className={statusColors[feature.status]}>
                          {feature.status}
                        </Badge>
                        <Badge variant="outline" className={complexityColors[feature.complexity]}>
                          {feature.complexity}
                        </Badge>
                        {feature.category && (
                          <Badge variant="outline" className="text-xs">
                            {feature.category.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => voteFeature.mutate({ featureId: feature.id })}
                        className="flex items-center gap-1 h-8"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                        <span className="text-xs font-semibold">{feature.voteCount}</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="implementation">Steps</TabsTrigger>
                      <TabsTrigger value="stories">Stories</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="space-y-3 mt-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Estimated:</span>
                        <span className="font-medium">{feature.estimatedHours}h</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {feature.techStack.map((tech, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="implementation" className="mt-4">
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {feature.implementation}
                      </div>
                    </TabsContent>
                    <TabsContent value="stories" className="mt-4 space-y-2">
                      {feature.userStories.map((story, index) => (
                        <div key={index} className="text-sm text-muted-foreground leading-relaxed pl-4 border-l-2 border-primary/30">
                          {story}
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Select 
                      value={feature.status}
                      onValueChange={(value) => updateStatus.mutate({ 
                        featureId: feature.id, 
                        status: value as "IDEA" | "PLANNED" | "IN_PROGRESS" | "DONE" | "REJECTED"
                      })}
                    >
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IDEA">Idea</SelectItem>
                        <SelectItem value="PLANNED">Planned</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="DONE">Done</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    {!feature.githubIssueUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => createIssue.mutate({ featureId: feature.id })}
                        disabled={createIssue.isPending}
                        className="h-8"
                      >
                        <GitBranch className="h-3 w-3 mr-1" />
                        Create Issue
                      </Button>
                    )}
                    {feature.githubIssueUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-8"
                      >
                        <a href={feature.githubIssueUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Issue
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteFeature.mutate({ featureId: feature.id })}
                      className="h-8 text-destructive hover:text-destructive"
                    >
                      <XCircle className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Lightbulb className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-center">
                No feature ideas yet. Start by generating some ideas above!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
export default BrainstormingPage
