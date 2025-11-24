"use client";
import React, { useState, useRef, useEffect } from "react";
import useProject from "~/hooks/use-project";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import Image from "next/image";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { useTheme } from "next-themes";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import useRefetch from "~/hooks/use-refetch";
import { askQuestion } from "./action";
import CodeRefrence from "./code-refrence";
import { Compass, Send, Save, CheckCircle2, AlertCircle, Database, RefreshCw } from "lucide-react";
import { Spinner } from "~/components/ui/spinner";
import { Badge } from "~/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
const AskQuestionCard = () => {
  const { project } = useProject();
  const { theme } = useTheme();
  const [question, setQuestion] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filesReferences, setFilesReferences] = useState<
    { fileName: string; sourceCode: string; summary: string }[]
  >([]);
  const [answer, setAnswer] = useState("");
  const contentRef = useRef<HTMLDivElement | null>(null);
  const answerRef = useRef<HTMLDivElement | null>(null);
  const filesAnchorRef = useRef<HTMLDivElement | null>(null);
  const saveAnswer = api.project.saveAnswer.useMutation();
  
  const { data: indexStatus, refetch: refetchIndexStatus } = api.project.getIndexStatus.useQuery(
    { projectId: project?.id ?? "" },
    { enabled: !!project?.id }
  );
  
  const reindexProject = api.project.reindexProject.useMutation();
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setAnswer("");
    setFilesReferences([]);
    e.preventDefault();

    if (!project?.id) {
      toast.error("No project selected", {
        description: "Please select or create a project first",
      });
      return;
    }

    if (!question.trim()) {
      toast.error("Question cannot be empty", {
        description: "Please enter a question to get insights",
      });
      return;
    }

    setLoading(true);
    setOpen(true);

    const loadingToast = toast.loading("Analyzing codebase...", {
      description: "Searching for relevant context and patterns",
    });

    try {
      const { output, filesRefrences } = await askQuestion(
        question,
        project.id,
      );

      toast.dismiss(loadingToast);

      setFilesReferences(filesRefrences);

      if (filesRefrences.length > 0) {
        toast.info(`Found ${filesRefrences.length} relevant files`, {
          description: "Generating answer based on your codebase",
          duration: 3000,
        });
      }

      let streamedContent = "";
      let hasReceivedContent = false;
      let chunkCount = 0;
      
      console.log("Starting to consume stream...");
      
      for await (const delta of output) {
        chunkCount++;
        console.log(`Received chunk ${chunkCount}:`, delta?.substring(0, 50));
        
        if (delta) {
          hasReceivedContent = true;
          streamedContent += delta;
          setAnswer(streamedContent);
        }
      }
      
      console.log(`Stream complete. Total chunks: ${chunkCount}, Content length: ${streamedContent.length}`);

      if (!hasReceivedContent || !streamedContent.trim()) {
        toast.warning("No response generated", {
          description: "The AI didn't return any content. Try rephrasing your question.",
          duration: 5000,
        });
        setAnswer(
          `# No Response Generated\n\nThe AI model didn't return any content for your question.\n\n**Possible reasons:**\n\n1. The question might be too broad or unclear\n2. The indexed code might not contain relevant information\n3. There was an issue with the AI service\n\n**Please try:**\n\n- Rephrasing your question more specifically\n- Checking the index status (${filesRefrences.length} files found)\n- Asking about specific files or features in your codebase`
        );
      } else {
        toast.success("Analysis complete", {
          description: `Answer generated with ${filesRefrences.length} file references`,
          icon: <CheckCircle2 className="h-4 w-4" />,
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Please try again or rephrase your question";

      toast.error("Unable to analyze question", {
        description: errorMessage,
        icon: <AlertCircle className="h-4 w-4" />,
        duration: 5000,
      });

      setAnswer(
        `# Error Occurred\n\nSorry, I encountered an error while analyzing your question.\n\n**Error:** ${errorMessage}\n\n**Please try:**\n\n1. **Rephrasing your question** - Be more specific or use different keywords\n2. **Checking if the repository is indexed** - New projects need a few minutes to index\n3. **Verifying the project setup** - Ensure the repository URL is correct\n\n**Debug Information:**\n- Project ID: ${project.id}\n- Question length: ${question.length} characters\n- Time: ${new Date().toISOString()}`,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [open]);

  useEffect(() => {
    if (filesReferences.length > 0) {
      setTimeout(() => {
        filesAnchorRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 120);
    }
  }, [filesReferences]);

  useEffect(() => {
    if (answer && !loading) {
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [answer, loading]);

  useEffect(() => {
    if (loading && answerRef.current) {
      answerRef.current.scrollTop = answerRef.current.scrollHeight;
    }
  }, [answer, loading]);

  const refetch = useRefetch();
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[85vw] h-[95vh] flex flex-col p-0">
          <div className="flex-shrink-0 border-b border-border/60 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <DialogTitle>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-border/60 bg-background p-2">
                    <Image
                      src="/favicon.ico"
                      alt="logo"
                      width={24}
                      height={24}
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Strategist answer</h2>
                    <p className="text-sm text-muted-foreground font-normal">
                      Generated by GitWit Copilot
                    </p>
                  </div>
                </div>
              </DialogTitle>
              <Button
                variant="outline"
                size="sm"
                disabled={saveAnswer.isPending || !answer.trim()}
                onClick={() => {
                  saveAnswer.mutate(
                    {
                      projectId: project!.id,
                      question,
                      answer,
                      filesRefrences: filesReferences,
                    },
                    {
                      onSuccess: () => {
                        toast.success("Answer archived successfully", {
                          description: "You can access it in the Q&A section",
                          icon: <CheckCircle2 className="h-4 w-4" />,
                        });
                        refetch();
                      },
                      onError: (error: { message?: string }) => {
                        toast.error("Unable to archive answer", {
                          description: error.message || "Please try again",
                          icon: <AlertCircle className="h-4 w-4" />,
                        });
                      },
                    },
                  );
                }}
                className="gap-2 flex-shrink-0 min-w-[120px]"
              >
                {saveAnswer.isPending ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Archive answer
                  </>
                )}
              </Button>
            </div>
          </div>

          <div
            ref={contentRef}
            className="flex-1 overflow-y-auto px-6 py-4 space-y-6"
          >
            <div 
              ref={answerRef}
              className="rounded-2xl border border-border/60 bg-card/80 p-4 max-h-[60vh] overflow-y-scroll scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
            >
              {loading && !answer ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner className="h-5 w-5" />
                </div>
              ) : (
                <MarkdownPreview
                  source={answer || "Waiting for response..."}
                  className="prose prose-sm dark:prose-invert max-w-none overflow-scroll max-h-[60vh]"
                  style={{ padding: "0", background: "transparent" }}
                  wrapperElement={{
                    "data-color-mode": theme === "dark" ? "dark" : "light",
                  }}
                />
              )}
            </div>
            {filesReferences.length > 0 && (
              <div ref={filesAnchorRef}>
                <CodeRefrence filesRefrences={filesReferences} />
              </div>
            )}
          </div>

          <div className="flex-shrink-0 border-t border-border/60 px-6 py-4">
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              className="w-full"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Card className="relative col-span-3 overflow-hidden border border-border/70 bg-card/70 shadow-lg shadow-primary/5">
        <div className="absolute inset-x-6 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/12 text-primary">
              <Compass className="h-5 w-5" />
            </span>
            Strategic Q&A
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {indexStatus && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/30">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Index Status:</span>
                {indexStatus.isIndexed ? (
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {indexStatus.indexedFiles} files indexed
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Not indexed
                  </Badge>
                )}
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={reindexProject.isPending}
                      onClick={() => {
                        if (!project?.id) return;
                        const loadingToast = toast.loading("Reindexing project...", {
                          description: "This may take a few minutes",
                        });
                        reindexProject.mutate(
                          { projectId: project.id },
                          {
                            onSuccess: () => {
                              toast.dismiss(loadingToast);
                              toast.success("Project reindexed successfully", {
                                description: "All code files have been processed",
                              });
                              refetchIndexStatus();
                            },
                            onError: (error) => {
                              toast.dismiss(loadingToast);
                              toast.error("Failed to reindex project", {
                                description: error.message,
                              });
                            },
                          }
                        );
                      }}
                      className="gap-2"
                    >
                      {reindexProject.isPending ? (
                        <Spinner className="h-4 w-4" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Reindex
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Rebuild the code embeddings for better Q&A accuracy</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Share the scenario
              </p>
              <Textarea
                className="min-h-[140px] resize-none border border-border/70 bg-background/80 px-4 py-3 text-sm leading-relaxed transition-shadow focus:border-primary focus:shadow-[0_0_0_2px_rgba(240,182,112,0.35)]"
                placeholder='Example: "Compare the auth middleware with the new policy service." or "What breaks if we sunset the CLI client?"'
                value={question}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setQuestion(e.target.value)
                }
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !question.trim()}
              className="w-full gap-2 rounded-full transition-all"
            >
              {loading ? (
                <>
                  <Spinner className="h-4 w-4 animate-spin-slow" />
                  Synthesizing context…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Ask GitWit
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};
export default AskQuestionCard;
