"use client";
import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList } from "~/components/ui/tabs";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { lucario } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "~/lib/utils";
import { ScrollArea } from "~/components/ui/scroll-area";
type Props = {
  filesRefrences: {
    fileName: string;
    sourceCode: string;
    summary: string;
  }[];
};
const CodeRefrence = ({ filesRefrences }: Props) => {
  const [tab, setTab] = useState(filesRefrences[0]?.fileName);
  if (filesRefrences.length === 0) return null;
  return (
    <div className="w-full space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">
        Referenced Code Files
      </h3>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            {filesRefrences.map((file) => (
              <Button
                variant={tab === file.fileName ? "default" : "outline"}
                onClick={() => setTab(file.fileName)}
                key={file.fileName}
                className="rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-[0.25em] flex-shrink-0"
              >
                {file.fileName}
              </Button>
            ))}
          </div>
        </ScrollArea>
        {filesRefrences.map((file) => (
          <TabsContent
            key={file.fileName}
            value={file.fileName}
            className="w-full border border-border/60 bg-background/80 rounded-lg p-0"
          >
            <ScrollArea className="h-[400px] w-full">
              <SyntaxHighlighter
                language="typescript"
                style={lucario}
                customStyle={{
                  margin: 0,
                  borderRadius: "0.5rem",
                  padding: "1rem",
                  background: "transparent",
                }}
                wrapLines
              >
                {file.sourceCode}
              </SyntaxHighlighter>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
export default CodeRefrence;
