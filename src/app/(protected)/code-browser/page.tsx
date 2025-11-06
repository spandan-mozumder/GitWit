"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Badge } from '~/components/ui/badge'
import { Input } from '~/components/ui/input'
import { Code2, FileCode, GitPullRequest, FolderTree, Search, ChevronRight, ChevronDown, File, Folder, CheckCircle2, Plus, Minus, ExternalLink, TrendingUp } from 'lucide-react'
import useProject from '~/hooks/use-project'
import { api } from '~/trpc/react'
import { toast } from 'sonner'
import { Spinner } from '~/components/ui/spinner'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
const riskLevelColors = {
  LOW: 'bg-green-500/10 text-green-500 border-green-500/20',
  MEDIUM: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  HIGH: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  CRITICAL: 'bg-red-500/10 text-red-500 border-red-500/20',
}
const prStatusColors = {
  OPEN: 'bg-green-500/10 text-green-500 border-green-500/20',
  CLOSED: 'bg-red-500/10 text-red-500 border-red-500/20',
  MERGED: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  DRAFT: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
}
interface TreeNode {
  path: string
  name: string
  type: 'file' | 'folder'
  children?: TreeNode[]
}
const FileTreeItem = ({ node, onSelect, selectedPath }: {
  node: TreeNode
  onSelect: (path: string) => void
  selectedPath: string | null
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const isSelected = selectedPath === node.path
  if (node.type === 'file') {
    return (
      <div
        onClick={() => onSelect(node.path)}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer rounded-md transition-colors ${
          isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
        }`}
      >
        <File className="h-4 w-4 flex-shrink-0" />
        <span className="truncate">{node.name}</span>
      </div>
    )
  }
  return (
    <div>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer rounded-md hover:bg-muted transition-colors"
      >
        {isOpen ? <ChevronDown className="h-4 w-4 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 flex-shrink-0" />}
        <Folder className="h-4 w-4 flex-shrink-0" />
        <span className="truncate">{node.name}</span>
      </div>
      {isOpen && node.children && (
        <div className="ml-4 border-l border-border/50 pl-2">
          {node.children.map((child) => (
            <FileTreeItem key={child.path} node={child} onSelect={onSelect} selectedPath={selectedPath} />
          ))}
        </div>
      )}
    </div>
  )
}
const CodeBrowserPage = () => {
  const router = useRouter()
  const { project } = useProject()
  const [activeTab, setActiveTab] = useState<'files' | 'prs'>('files')
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [selectedPR] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { data: repoTree, isLoading: loadingTree } = api.codeBrowser.getRepoTree.useQuery(
    { projectId: project?.id ?? '' },
    { enabled: !!project }
  )
  const { data: fileContent, isLoading: loadingFile } = api.codeBrowser.getFileContent.useQuery(
    { projectId: project?.id ?? '', filePath: selectedFile ?? '' },
    { enabled: !!project && !!selectedFile }
  )
  const { data: pullRequests, isLoading: loadingPRs, refetch: refetchPRs } = api.codeBrowser.getPullRequests.useQuery(
    { projectId: project?.id ?? '' },
    { enabled: !!project && activeTab === 'prs' }
  )
  const syncPRs = api.codeBrowser.syncPullRequests.useMutation({
    onSuccess: () => {
      toast.success('Pull requests synced!')
      refetchPRs()
    },
    onError: (error) => {
      toast.error('Failed to sync: ' + error.message)
    }
  })
  const analyzePR = api.codeBrowser.analyzePullRequest.useMutation({
    onSuccess: () => {
      toast.success('PR analyzed!')
      refetchPRs()
    },
    onError: (error) => {
      toast.error('Failed to analyze: ' + error.message)
    }
  })

  interface FileItem {
    path?: string
    type?: string
  }

  interface TreeNodeInternal {
    path: string
    name: string
    type: 'file' | 'folder'
    children?: Record<string, TreeNodeInternal>
  }

  const buildFileTree = (items: FileItem[]): TreeNode[] => {
    const root: Record<string, TreeNodeInternal> = {}
    items.forEach((item) => {
      if (!item.path) return
      const parts = item.path.split('/')
      let currentLevel: Record<string, TreeNodeInternal> = root
      parts.forEach((part: string, index: number) => {
        if (!currentLevel[part]) {
          currentLevel[part] = {
            path: parts.slice(0, index + 1).join('/'),
            name: part,
            type: index === parts.length - 1 && item.type === 'blob' ? 'file' : 'folder',
            children: {}
          }
        }
        if (index < parts.length - 1 && currentLevel[part].children) {
          currentLevel = currentLevel[part].children
        }
      })
    })
    const convertToArray = (obj: Record<string, TreeNodeInternal>): TreeNode[] => {
      const entries = Object.entries(obj)

      entries.sort(([nameA, nodeA], [nameB, nodeB]) => {
        if (nodeA.type === nodeB.type) {
          return nameA.localeCompare(nameB)
        }
        return nodeA.type === 'folder' ? -1 : 1
      })
      return entries.map(([, node]) => ({
        path: node.path,
        name: node.name,
        type: node.type,
        children: node.children && Object.keys(node.children).length > 0
          ? convertToArray(node.children)
          : undefined
      }))
    }
    return convertToArray(root)
  }
  const fileTree = repoTree ? buildFileTree(repoTree) : []
  const getLanguageFromPath = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase()
    const langMap: { [key: string]: string } = {
      'ts': 'typescript',
      'tsx': 'tsx',
      'js': 'javascript',
      'jsx': 'jsx',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'go': 'go',
      'rs': 'rust',
      'rb': 'ruby',
      'php': 'php',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'yaml': 'yaml',
      'yml': 'yaml',
    }
    return langMap[ext ?? ''] ?? 'text'
  }

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
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-blue-500/30 via-border/60 to-transparent" />
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-500/12 text-blue-500">
                <Code2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Interactive</p>
                <h1 className="text-2xl font-semibold md:text-3xl">Code Browser</h1>
              </div>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Browse your entire codebase, view pull requests, and get AI-powered analysis of code changes.
            </p>
          </div>
        </div>
      </section>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'files' | 'prs')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="files" className="flex items-center gap-2">
            <FolderTree className="h-4 w-4" />
            File Explorer
          </TabsTrigger>
          <TabsTrigger value="prs" className="flex items-center gap-2">
            <GitPullRequest className="h-4 w-4" />
            Pull Requests
          </TabsTrigger>
        </TabsList>
        <TabsContent value="files" className="mt-6">
          <div className="grid lg:grid-cols-[350px_1fr] gap-6">
            <Card className="border-border/70 h-[calc(100vh-300px)]">
              <CardHeader>
                <CardTitle className="text-base">Files</CardTitle>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-450px)]">
                  {loadingTree ? (
                    <div className="flex justify-center py-12">
                      <Spinner className="size-6" />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {fileTree.map((node) => (
                        <FileTreeItem
                          key={node.path}
                          node={node}
                          onSelect={setSelectedFile}
                          selectedPath={selectedFile}
                        />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
            <Card className="border-border/70 h-[calc(100vh-300px)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileCode className="h-4 w-4" />
                    {selectedFile ?? 'Select a file'}
                  </CardTitle>
                  {fileContent && (
                    <Badge variant="secondary" className="text-xs">
                      {fileContent.size} bytes
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-430px)]">
                  {loadingFile ? (
                    <div className="flex justify-center py-12">
                      <Spinner className="size-6" />
                    </div>
                  ) : fileContent ? (
                    <SyntaxHighlighter
                      language={getLanguageFromPath(fileContent.path)}
                      style={vscDarkPlus}
                      showLineNumbers
                      wrapLines
                      customStyle={{
                        margin: 0,
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                      }}
                    >
                      {fileContent.content}
                    </SyntaxHighlighter>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <Code2 className="h-12 w-12 mb-4 opacity-50" />
                      <p>Select a file to view its contents</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="prs" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => syncPRs.mutate({ projectId: project.id, state: 'all' })}
                disabled={syncPRs.isPending}
              >
                {syncPRs.isPending && <Spinner className="mr-2 h-4 w-4" />}
                Sync Pull Requests
              </Button>
            </div>
            {loadingPRs ? (
              <div className="flex justify-center py-12">
                <Spinner className="size-8" />
              </div>
            ) : pullRequests && pullRequests.length > 0 ? (
              <div className="space-y-4">
                {pullRequests.map((pr) => (
                  <Card
                    key={pr.id}
                    className="cursor-pointer transition-all hover:border-primary/50"
                    onClick={() => router.push(`/code-browser/${pr.prNumber}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-muted-foreground text-sm">#{pr.prNumber}</span>
                            <Badge variant="outline" className={prStatusColors[pr.status]}>
                              {pr.status}
                            </Badge>
                            {pr.riskLevel && (
                              <Badge variant="outline" className={riskLevelColors[pr.riskLevel]}>
                                {pr.riskLevel} Risk
                              </Badge>
                            )}
                            {pr.qualityScore && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {pr.qualityScore}/100
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {pr.title}
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{pr.author}</span>
                            <span>•</span>
                            <span>{pr.branch} → {pr.baseBranch}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Plus className="h-3 w-3 text-green-500" />
                              {pr.additions}
                            </span>
                            <span className="flex items-center gap-1">
                              <Minus className="h-3 w-3 text-red-500" />
                              {pr.deletions}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {!pr.aiSummary && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                analyzePR.mutate({ projectId: project.id, prNumber: pr.prNumber })
                              }}
                              disabled={analyzePR.isPending}
                            >
                              {analyzePR.isPending ? (
                                <Spinner className="h-4 w-4" />
                              ) : (
                                <>AI Analyze</>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    {selectedPR === pr.prNumber && (
                      <CardContent className="space-y-4">
                        {pr.description && (
                          <div>
                            <h4 className="font-semibold mb-2">Description</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {pr.description}
                            </p>
                          </div>
                        )}
                        {pr.aiSummary && (
                          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                              AI Analysis
                            </h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {pr.aiSummary}
                            </p>
                          </div>
                        )}
                        {pr.files && pr.files.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3">Changed Files ({pr.files.length})</h4>
                            <div className="space-y-3">
                              {pr.files.map((file) => (
                                <div key={file.id} className="border border-border/50 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-mono">{file.filename}</span>
                                    <div className="flex items-center gap-2 text-xs">
                                      <span className="flex items-center gap-1">
                                        <Plus className="h-3 w-3 text-green-500" />
                                        {file.additions}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Minus className="h-3 w-3 text-red-500" />
                                        {file.deletions}
                                      </span>
                                    </div>
                                  </div>
                                  {file.aiSummary && (
                                    <p className="text-xs text-muted-foreground mt-2 pl-4 border-l-2 border-primary/30">
                                      {file.aiSummary}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <GitPullRequest className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground text-center">
                    No pull requests found. Click &quot;Sync Pull Requests&quot; to load them.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
export default CodeBrowserPage
