"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import {
  Lightbulb,
  ThumbsUp,
  Clock,
  Code2,
  ExternalLink,
  GitBranch,
  XCircle,
  Edit2,
  Trash2,
  Zap,
} from "lucide-react";
import useProject from "~/hooks/use-project";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { Spinner } from "~/components/ui/spinner";
const complexityColors = {
  EASY: "bg-green-500/10 text-green-500 border-green-500/20",
  MEDIUM: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  HARD: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  VERY_HARD: "bg-red-500/10 text-red-500 border-red-500/20",
};
const statusColors = {
  IDEA: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  PLANNED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  IN_PROGRESS: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  DONE: "bg-green-500/10 text-green-500 border-green-500/20",
  REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
};
const BrainstormingPage = () => {
  const { project, projects } = useProject();
  const [userInput, setUserInput] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    complexity: "MEDIUM" as const,
    estimatedHours: 0,
  });

  const queryInput = {
    projectId: project?.id ?? "",
    ...(selectedStatus !== "all" && {
      status: selectedStatus as
        | "IDEA"
        | "PLANNED"
        | "IN_PROGRESS"
        | "DONE"
        | "REJECTED",
    }),
    ...(selectedCategory !== "all" && {
      category: selectedCategory as
        | "NEW_FEATURE"
        | "ENHANCEMENT"
        | "BUG_FIX"
        | "PERFORMANCE"
        | "SECURITY"
        | "UI_UX"
        | "REFACTOR"
        | "TESTING"
        | "DOCUMENTATION",
    }),
  };

  const {
    data: features,
    refetch,
    isLoading,
  } = api.featureBrainstorming.getFeatureIdeas.useQuery(queryInput, {
    enabled: !!project,
  });
  const generateIdeas =
    api.featureBrainstorming.generateFeatureIdeas.useMutation({
      onSuccess: () => {
        toast.success("🎉 Feature ideas generated!");
        refetch();
        setUserInput("");
      },
      onError: (error) => {
        toast.error("Failed to generate ideas: " + error.message);
      },
    });
  const voteFeature = api.featureBrainstorming.voteFeature.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const updateStatus = api.featureBrainstorming.updateFeatureStatus.useMutation(
    {
      onSuccess: () => {
        toast.success("Status updated");
        refetch();
      },
    },
  );
  const createIssue = api.featureBrainstorming.createGitHubIssue.useMutation({
    onSuccess: (data) => {
      toast.success("GitHub issue created!", {
        action: {
          label: "View",
          onClick: () => window.open(data.issueUrl, "_blank"),
        },
      });
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to create issue: " + error.message);
    },
  });
  const deleteFeature = api.featureBrainstorming.deleteFeature.useMutation({
    onSuccess: () => {
      toast.success("Feature deleted");
      refetch();
    },
  });
  const updateFeature = api.featureBrainstorming.updateFeature.useMutation({
    onSuccess: () => {
      toast.success("Feature updated");
      setEditingFeatureId(null);
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to update feature: " + error.message);
    },
  });
  const handleOpenEdit = (feature: any) => {
    setEditingFeatureId(feature.id);
    setEditFormData({
      title: feature.title,
      description: feature.description,
      complexity: feature.complexity,
      estimatedHours: feature.estimatedHours,
    });
  };
  const handleSaveEdit = () => {
    if (!editingFeatureId) return;
    updateFeature.mutate({
      featureId: editingFeatureId,
      ...editFormData,
    });
  };
  if (projects === undefined) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Please select a project</p>
      </div>
    );
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
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  AI-Powered
                </p>
                <h1 className="text-2xl font-semibold md:text-3xl">
                  Feature Brainstorming
                </h1>
              </div>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Describe what you want to build, and AI will generate creative,
              actionable feature ideas with implementation details, time
              estimates, and user stories.
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
            Tell us what kind of features you&apos;re thinking about, and
            we&apos;ll generate detailed suggestions
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
            onClick={() =>
              generateIdeas.mutate({
                projectId: project.id,
                userInput,
                count: 5,
              })
            }
            disabled={!userInput.trim() || generateIdeas.isPending}
            className="w-full sm:w-auto min-w-[120px]"
          >
            {generateIdeas.isPending ? (
              <Spinner className="h-4 w-4" />
            ) : (
              "Generate Ideas"
            )}
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
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
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
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card
                  key={feature.id}
                  className="group relative flex flex-col overflow-hidden border-border/50 hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-card to-card/95"
                >
                  {/* Gradient accent bar */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                      feature.complexity === "EASY"
                        ? "from-green-500 to-green-600"
                        : feature.complexity === "MEDIUM"
                          ? "from-yellow-500 to-yellow-600"
                          : feature.complexity === "HARD"
                            ? "from-orange-500 to-orange-600"
                            : "from-red-500 to-red-600"
                    }`}
                  />

                  <CardHeader className="pb-3">
                    {/* Title and voting row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <CardTitle className="text-base leading-snug font-semibold line-clamp-2">
                          {feature.title}
                        </CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          voteFeature.mutate({ featureId: feature.id })
                        }
                        className="h-8 w-8 p-0 flex-shrink-0"
                        disabled={voteFeature.isPending}
                        title="Vote for this feature"
                      >
                        {voteFeature.isPending ? (
                          <Spinner className="h-3.5 w-3.5" />
                        ) : (
                          <ThumbsUp className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                    {/* Vote count */}
                    <div className="text-xs text-muted-foreground font-medium">
                      {feature.voteCount} votes
                    </div>

                    {/* Badges row */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className={`${statusColors[feature.status]} text-xs`}
                      >
                        {feature.status.replace("_", " ")}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`${complexityColors[feature.complexity]} text-xs`}
                      >
                        {feature.complexity}
                      </Badge>
                      {feature.category && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-purple-500/10 text-purple-600 border-purple-500/20"
                        >
                          {feature.category.replace("_", " ")}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pb-3 flex-1">
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                      {feature.description}
                    </p>

                    {/* Quick metrics */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="font-medium">
                          {feature.estimatedHours}h
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="h-3.5 w-3.5" />
                        <span className="font-medium">
                          {feature.techStack.length} tech
                        </span>
                      </div>
                    </div>

                    {/* Tech stack preview */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {feature.techStack.slice(0, 3).map((tech, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tech}
                        </Badge>
                      ))}
                      {feature.techStack.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{feature.techStack.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Tabs for details */}
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid w-full grid-cols-3 h-8">
                        <TabsTrigger value="overview" className="text-xs">
                          Overview
                        </TabsTrigger>
                        <TabsTrigger value="implementation" className="text-xs">
                          Steps
                        </TabsTrigger>
                        <TabsTrigger value="stories" className="text-xs">
                          Stories
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="overview" className="mt-2 space-y-2">
                        <div className="text-xs text-muted-foreground space-y-2">
                          <div>
                            <span className="font-medium text-foreground">
                              Time Estimate:{" "}
                            </span>
                            {feature.estimatedHours} hours
                          </div>
                          <div>
                            <span className="font-medium text-foreground">
                              Tech Stack:
                            </span>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {feature.techStack.map((tech, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="implementation" className="mt-2">
                        <div className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-[150px] overflow-y-auto">
                          {feature.implementation}
                        </div>
                      </TabsContent>
                      <TabsContent value="stories" className="mt-2 space-y-2">
                        {feature.userStories.map((story, idx) => (
                          <div
                            key={idx}
                            className="text-xs text-muted-foreground leading-snug pl-2 border-l-2 border-primary/50"
                          >
                            {story}
                          </div>
                        ))}
                      </TabsContent>
                    </Tabs>
                  </CardContent>

                  {/* Footer: Action buttons */}
                  <div className="border-t border-border/50 mt-3 pt-3 px-4 pb-3 space-y-2">
                    <Select
                      value={feature.status}
                      onValueChange={(value) =>
                        updateStatus.mutate({
                          featureId: feature.id,
                          status: value as
                            | "IDEA"
                            | "PLANNED"
                            | "IN_PROGRESS"
                            | "DONE"
                            | "REJECTED",
                        })
                      }
                      disabled={updateStatus.isPending}
                    >
                      <SelectTrigger className="h-8 text-xs">
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

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(feature)}
                        className="flex-1 h-8 text-xs"
                        title="Edit feature"
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          deleteFeature.mutate({ featureId: feature.id })
                        }
                        className="flex-1 h-8 text-xs text-destructive hover:text-destructive"
                        disabled={deleteFeature.isPending}
                        title="Delete feature"
                      >
                        {deleteFeature.isPending ? (
                          <Spinner className="h-3 w-3 mr-1" />
                        ) : (
                          <Trash2 className="h-3 w-3 mr-1" />
                        )}
                        Delete
                      </Button>
                    </div>

                    {!feature.githubIssueUrl && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() =>
                          createIssue.mutate({ featureId: feature.id })
                        }
                        disabled={createIssue.isPending}
                        className="w-full h-8 text-xs"
                      >
                        {createIssue.isPending ? (
                          <>
                            <Spinner className="h-3 w-3 mr-1" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <GitBranch className="h-3 w-3 mr-1" />
                            Create Issue
                          </>
                        )}
                      </Button>
                    )}
                    {feature.githubIssueUrl && (
                      <Button
                        variant="secondary"
                        size="sm"
                        asChild
                        className="w-full h-8 text-xs"
                      >
                        <a
                          href={feature.githubIssueUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Issue
                        </a>
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Edit Modal */}
            <Dialog
              open={!!editingFeatureId}
              onOpenChange={(open) => !open && setEditingFeatureId(null)}
            >
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Feature</DialogTitle>
                  <DialogDescription>
                    Make changes to your feature idea
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Title
                    </label>
                    <Input
                      value={editFormData.title}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Feature title"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Description
                    </label>
                    <Textarea
                      value={editFormData.description}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Feature description"
                      className="text-sm min-h-[80px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Complexity
                      </label>
                      <Select
                        value={editFormData.complexity}
                        onValueChange={(value: any) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            complexity: value,
                          }))
                        }
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EASY">Easy</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HARD">Hard</SelectItem>
                          <SelectItem value="VERY_HARD">Very Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Hours
                      </label>
                      <Input
                        type="number"
                        value={editFormData.estimatedHours}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            estimatedHours: parseInt(e.target.value) || 0,
                          }))
                        }
                        placeholder="Hours"
                        className="text-sm"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setEditingFeatureId(null)}
                    disabled={updateFeature.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveEdit}
                    disabled={updateFeature.isPending}
                  >
                    {updateFeature.isPending ? (
                      <Spinner className="h-4 w-4 mr-2" />
                    ) : null}
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
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
  );
};
export default BrainstormingPage;
