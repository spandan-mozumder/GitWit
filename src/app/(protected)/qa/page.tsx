"use client";
import React, { Fragment, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import useProject from "~/hooks/use-project";
import { api } from "~/trpc/react";
import AskQuestionCard from "../dashboard/ask-question-card";
import MarkdownPreview from "@uiw/react-markdown-preview";
import CodeRefrence from "../dashboard/code-refrence";
import { useTheme } from "next-themes";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Spinner } from "~/components/ui/spinner";
import { Calendar, Archive, MessageSquare } from "lucide-react";
const QAPage = () => {
  const { projectId } = useProject();
  const { data: questions, isLoading } = api.project.getQuestions.useQuery({
    projectId,
  });
  const { theme } = useTheme();
  const [questionIndex, setQuestionIndex] = useState(0);
  const question = questions?.[questionIndex];
  return (
    <Sheet>
      <div className="space-y-8 animate-fade-in">
        <AskQuestionCard />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Question archive</h1>
              <p className="text-sm text-muted-foreground">
                Review past analyses and insights from your codebase
              </p>
            </div>
            {questions && questions.length > 0 && (
              <Badge
                variant="secondary"
                className="rounded-full px-3 py-1 uppercase tracking-[0.3em]"
              >
                {questions.length}{" "}
                {questions.length === 1 ? "question" : "questions"}
              </Badge>
            )}
          </div>
          {isLoading && (
            <div className="flex justify-center py-12">
              <Spinner className="size-8" />
            </div>
          )}
          {!isLoading && (!questions || questions.length === 0) && (
            <Card className="border-dashed border-border/70 bg-card/70">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 rounded-full border border-border/70 bg-background/70 p-4">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">
                  No archived questions
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Ask GitWit a question above and save the answer to build your
                  knowledge base
                </p>
              </CardContent>
            </Card>
          )}
          {!isLoading && questions && questions.length > 0 && (
            <div className="grid gap-4">
              {questions?.map(
                (
                  question: {
                    id: string;
                    question: string;
                    answer: string;
                    filesRefrences: unknown;
                    user: { imageUrl?: string | null };
                    createdAt: Date;
                  },
                  index: number,
                ) => {
                  return (
                    <Fragment key={question.id}>
                      <SheetTrigger onClick={() => setQuestionIndex(index)}>
                        <Card className="overflow-hidden border border-border/70 bg-card/70 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-10 w-10 border border-border/60">
                                <AvatarImage
                                  src={question.user.imageUrl ?? ""}
                                />
                                <AvatarFallback>U</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 text-left space-y-2">
                                <div className="flex items-start justify-between gap-4">
                                  <p className="line-clamp-2 text-lg font-semibold text-foreground">
                                    {question.question}
                                  </p>
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                                    <Calendar className="h-3 w-3" />
                                    {question.createdAt.toLocaleDateString()}
                                  </div>
                                </div>
                                <p className="text-muted-foreground line-clamp-2 text-sm">
                                  {question.answer}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </SheetTrigger>
                    </Fragment>
                  );
                },
              )}
            </div>
          )}
        </div>
      </div>
      {question && (
        <SheetContent className="sm:max-w-[85vw] flex flex-col p-0">
          <div className="flex-shrink-0 border-b border-border/60 px-6 py-4">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-xl">
                <Archive className="h-5 w-5 text-primary" />
                {question.question}
              </SheetTitle>
            </SheetHeader>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            <div className="rounded-2xl border border-border/60 bg-card/80 p-4">
              <MarkdownPreview
                source={question.answer}
                className="prose prose-sm dark:prose-invert max-w-none"
                style={{ padding: "0", background: "transparent" }}
                wrapperElement={{
                  "data-color-mode": theme === "dark" ? "dark" : "light",
                }}
              />
            </div>
            <CodeRefrence
              filesRefrences={
                (question.filesRefrences ?? []) as {
                  fileName: string;
                  sourceCode: string;
                  summary: string;
                }[]
              }
            />
          </div>
        </SheetContent>
      )}
    </Sheet>
  );
};
export default QAPage;
