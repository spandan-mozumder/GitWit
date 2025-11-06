"use client"
import { useParams, useRouter } from "next/navigation"
import { api } from "~/trpc/react"
import useProject from "~/hooks/use-project"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Spinner } from "~/components/ui/spinner"
import {
  ArrowLeft,
  GitBranch,
  GitMerge,
  GitPullRequest,
  Check,
  X,
  AlertCircle,
  FileCode,
  Plus,
  Minus,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Clock,
  User
} from "lucide-react"
import { useState } from "react"
import { cn } from "~/lib/utils"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { ScrollArea } from "~/components/ui/scroll-area"
export default function PullRequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { project } = useProject()
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())
  const [mergeMethod, setMergeMethod] = useState<'merge' | 'squash' | 'rebase'>('merge')
  const prNumber = parseInt(params.prNumber as string)
  const { data: prData, isLoading, refetch } = api.codeBrowser.getPullRequestDetails.useQuery(
    {
      projectId: project?.id ?? '',
      prNumber,
    },
    {
      enabled: !!project?.id,
    }
  )
  const mergePR = api.codeBrowser.mergePullRequest.useMutation({
    onSuccess: () => {
      toast.success('Pull request merged successfully!', {
        icon: <Check className="h-4 w-4" />
      })
      refetch()
    },
    onError: (error) => {
      toast.error('Failed to merge PR', {
        description: error.message,
        icon: <X className="h-4 w-4" />
      })
    }
  })
  const toggleFileExpand = (filename: string) => {
    const newExpanded = new Set(expandedFiles)
    if (newExpanded.has(filename)) {
      newExpanded.delete(filename)
    } else {
      newExpanded.add(filename)
    }
    setExpandedFiles(newExpanded)
  }
  const handleMerge = () => {
    if (!project?.id) return
    mergePR.mutate({
      projectId: project.id,
      prNumber,
      mergeMethod,
    })
  }
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="size-8" />
      </div>
    )
  }
  if (!prData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Pull Request Not Found</h2>
        <Button onClick={() => router.push('/code-browser')}>
          Back to Code Browser
        </Button>
      </div>
    )
  }
  const { github, files, analysis } = prData
  const isMerged = github.merged
  const isMergeable = github.mergeable && github.state === 'open'
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/code-browser')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <GitPullRequest className="h-6 w-6" />
            <h1 className="text-2xl font-bold">
              #{github.number} {github.title}
            </h1>
            <Badge variant={
              isMerged ? "default" :
              github.state === 'open' ? "secondary" :
              "outline"
            }>
              {isMerged ? 'Merged' : github.state}
            </Badge>
          </div>
        </div>
        {isMergeable && !mergePR.isPending && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="gap-2">
                <GitMerge className="h-4 w-4" />
                Merge Pull Request
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Merge Pull Request</AlertDialogTitle>
                <AlertDialogDescription className="space-y-4">
                  <p>
                    This will merge <strong>{github.head.ref}</strong> into <strong>{github.base.ref}</strong>.
                  </p>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Merge Method</label>
                    <Select value={mergeMethod} onValueChange={(v) => setMergeMethod(v as typeof mergeMethod)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="merge">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Create a merge commit</span>
                            <span className="text-xs text-muted-foreground">All commits will be preserved</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="squash">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Squash and merge</span>
                            <span className="text-xs text-muted-foreground">Combine all commits into one</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="rebase">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Rebase and merge</span>
                            <span className="text-xs text-muted-foreground">Rebase commits onto base branch</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleMerge}>
                  Merge
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {mergePR.isPending && (
          <Button disabled className="gap-2">
            <Spinner className="h-4 w-4" />
            Merging...
          </Button>
        )}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              {github.body ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{github.body}</p>
                </div>
              ) : (
                <p className="text-muted-foreground italic">No description provided</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Changes</CardTitle>
              <CardDescription>
                {github.changedFiles} files changed with {github.additions} additions and {github.deletions} deletions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-green-500" />
                  <span className="text-green-500 font-medium">{github.additions} additions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Minus className="h-4 w-4 text-red-500" />
                  <span className="text-red-500 font-medium">{github.deletions} deletions</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileCode className="h-4 w-4" />
                  <span>{github.commits} commits</span>
                </div>
              </div>
            </CardContent>
          </Card>
          {analysis && (
            <Card>
              <CardHeader>
                <CardTitle>AI Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  {analysis.qualityScore !== null && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Quality Score:</span>
                      <Badge variant={analysis.qualityScore >= 80 ? "default" : analysis.qualityScore >= 60 ? "secondary" : "destructive"}>
                        {analysis.qualityScore}/100
                      </Badge>
                    </div>
                  )}
                  {analysis.riskLevel && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Risk Level:</span>
                      <Badge variant={
                        analysis.riskLevel === 'LOW' ? "default" :
                        analysis.riskLevel === 'MEDIUM' ? "secondary" :
                        "destructive"
                      }>
                        {analysis.riskLevel}
                      </Badge>
                    </div>
                  )}
                </div>
                {analysis.aiSummary && (
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm whitespace-pre-wrap">{analysis.aiSummary}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle>Files Changed ({files.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ScrollArea className="h-[600px]">
                {files.map((file) => (
                  <div key={file.filename} className="border rounded-lg mb-4">
                    <button
                      onClick={() => toggleFileExpand(file.filename)}
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {expandedFiles.has(file.filename) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <FileCode className="h-4 w-4" />
                        <span className="font-mono text-sm">{file.filename}</span>
                        <Badge variant="outline" className="text-xs">
                          {file.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-green-500 flex items-center gap-1">
                          <Plus className="h-3 w-3" />
                          {file.additions}
                        </span>
                        <span className="text-red-500 flex items-center gap-1">
                          <Minus className="h-3 w-3" />
                          {file.deletions}
                        </span>
                      </div>
                    </button>
                    {expandedFiles.has(file.filename) && file.patch && (
                      <div className="border-t bg-muted/30">
                        <pre className="p-4 overflow-x-auto text-xs font-mono">
                          {file.patch.split('\n').map((line, i) => (
                            <div
                              key={i}
                              className={cn(
                                "px-2",
                                line.startsWith('+') && !line.startsWith('+++') && "bg-green-500/10 text-green-600",
                                line.startsWith('-') && !line.startsWith('---') && "bg-red-500/10 text-red-600",
                                line.startsWith('@@') && "bg-blue-500/10 text-blue-600 font-semibold"
                              )}
                            >
                              {line}
                            </div>
                          ))}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Author:</span>
                  <div className="flex items-center gap-2">
                    {github.authorAvatar && (
                      <img
                        src={github.authorAvatar}
                        alt={github.author || 'Author'}
                        className="h-5 w-5 rounded-full"
                      />
                    )}
                    <span className="font-medium">{github.author}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span>{new Date(github.createdAt).toLocaleDateString()}</span>
                </div>
                {github.mergedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <GitMerge className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Merged:</span>
                    <span>{new Date(github.mergedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <GitBranch className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">From:</span>
                  <code className="px-2 py-1 rounded bg-muted text-xs font-mono">
                    {github.head.ref}
                  </code>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <GitBranch className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Into:</span>
                  <code className="px-2 py-1 rounded bg-muted text-xs font-mono">
                    {github.base.ref}
                  </code>
                </div>
              </div>
              {!isMergeable && github.state === 'open' && (
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      {github.mergeable === false ? 'Has conflicts' : 'Checking merge status...'}
                    </span>
                  </div>
                </div>
              )}
              <div className="border-t pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => {
                    const [owner, repo] = project?.repoUrl
                      .replace('https://github.com/', '')
                      .replace('.git', '')
                      .split('/') ?? []
                    window.open(`https://github.com/${owner}/${repo}/pull/${prNumber}`, '_blank')
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                  View on GitHub
                </Button>
              </div>
            </CardContent>
          </Card>
          {!isMerged && isMergeable && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-sm">Ready to Merge</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">
                  This pull request can be merged automatically.
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="h-3 w-3 text-green-500" />
                  <span>No conflicts detected</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
