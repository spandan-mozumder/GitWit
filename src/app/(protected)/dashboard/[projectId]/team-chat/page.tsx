"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectBreadcrumb } from "@/components/project-breadcrumb";
import { QuickNav } from "@/components/quick-nav";
import {
  Send,
  Code2,
  Smile,
  Paperclip,
  MessageSquare,
  Users,
  FileCode,
  Sparkles,
  Radio,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function TeamChatPage() {
  const params = useParams<{ projectId: string }>();
  const [message, setMessage] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = api.teamChat.getOrCreateChat.useMutation();
  const { data: messages, refetch: refetchMessages } = api.teamChat.getMessages.useQuery(
    {
      chatId: chatId || "",
      limit: 50,
    },
    {
      enabled: !!chatId,
      refetchInterval: 3000, // Poll every 3 seconds
    }
  );

  const { data: annotations } = api.teamChat.getAnnotations.useQuery({
    projectId: params.projectId,
  });

  const sendMessage = api.teamChat.sendMessage.useMutation({
    onSuccess: () => {
      setMessage("");
      refetchMessages();
      scrollToBottom();
    },
  });

  const addReaction = api.teamChat.addReaction.useMutation({
    onSuccess: () => refetchMessages(),
  });

  const createAnnotation = api.teamChat.createAnnotation.useMutation({
    onSuccess: () => refetchMessages(),
  });

  useEffect(() => {
    // Initialize chat
    chatMutation.mutate({ projectId: params.projectId });
  }, [params.projectId]);

  useEffect(() => {
    if (chatMutation.data) {
      setChatId(chatMutation.data.id);
    }
  }, [chatMutation.data]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!chatId || !message.trim()) return;

    sendMessage.mutate({
      chatId,
      content: message,
      messageType: "TEXT",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <ProjectBreadcrumb />
        <QuickNav />
      </div>
      
      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500/10 to-green-500/5 text-green-500">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Team Collaboration
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time chat with code context and AI assistance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
            <Radio className="size-3 mr-1 animate-pulse" />
            Live Updates
          </Badge>
          <Badge variant="outline">
            <Sparkles className="size-3 mr-1" />
            AI Context
          </Badge>
          <Badge variant="outline">
            {chatMutation.data?.participants.length || 0} Members
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-20rem)]">
        {/* Main Chat */}
        <Card className="col-span-3 flex flex-col border-border/70 shadow-lg">
          <div className="p-4 border-b border-border/50 bg-card/70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Team Chat</h2>
              </div>
              <div className="flex items-center gap-2">
                {chatMutation.data?.participants.slice(0, 5).map((p) => (
                  <Avatar key={p.id} className="h-8 w-8 border-2 border-background">
                    <AvatarImage src={p.user.imageUrl || ""} />
                    <AvatarFallback>
                      {p.user.firstName?.[0]}
                      {p.user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {(chatMutation.data?.participants.length || 0) > 5 && (
                  <Badge variant="outline">
                    +{(chatMutation.data?.participants.length || 0) - 5}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/30">
            {messages?.messages.map((msg) => (
              <div key={msg.id} className="flex gap-3 group">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={msg.user.imageUrl || ""} />
                  <AvatarFallback>
                    {msg.user.firstName?.[0]}
                    {msg.user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">
                      {msg.user.firstName} {msg.user.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(msg.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <div className="bg-accent/50 rounded-lg p-3">
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.codeSnippet && (
                      <div className="mt-2 p-2 bg-background rounded border border-border/50">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <FileCode className="h-3 w-3" />
                          {msg.filePath}:{msg.lineNumber}
                        </div>
                        <pre className="text-xs overflow-x-auto">
                          <code>{msg.codeSnippet}</code>
                        </pre>
                      </div>
                    )}
                    {msg.aiContext && (
                      <div className="mt-2 p-2 bg-primary/10 rounded text-xs">
                        <strong>AI Context:</strong> {msg.aiContext}
                      </div>
                    )}
                  </div>
                  {/* Reactions */}
                  {msg.reactions.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {Object.entries(
                        msg.reactions.reduce((acc, r) => {
                          acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([emoji, count]) => (
                        <Badge key={emoji} variant="outline" className="text-xs">
                          {emoji} {count}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {/* Thread */}
                  {msg.threadMessages.length > 0 && (
                    <div className="mt-2 ml-4 space-y-2">
                      {msg.threadMessages.map((reply) => (
                        <div key={reply.id} className="flex gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={reply.user.imageUrl || ""} />
                            <AvatarFallback className="text-xs">
                              {reply.user.firstName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 bg-accent/30 rounded p-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold">
                                {reply.user.firstName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(reply.createdAt), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                            <p className="text-xs">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border/50">
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Code2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Smile className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || sendMessage.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Sidebar */}
        <Card className="col-span-1">
          <Tabs defaultValue="annotations" className="h-full">
            <TabsList className="w-full">
              <TabsTrigger value="annotations" className="flex-1">
                Annotations
              </TabsTrigger>
              <TabsTrigger value="members" className="flex-1">
                Members
              </TabsTrigger>
            </TabsList>
            <TabsContent value="annotations" className="p-4 space-y-3">
              <h3 className="font-semibold mb-3">Code Annotations</h3>
              {annotations?.map((annotation) => (
                <div
                  key={annotation.id}
                  className="p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="text-xs font-mono text-muted-foreground mb-1">
                    {annotation.filePath}:{annotation.lineStart}
                  </div>
                  <p className="text-sm mb-2">{annotation.content}</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={annotation.user.imageUrl || ""} />
                      <AvatarFallback className="text-xs">
                        {annotation.user.firstName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {annotation.user.firstName}
                    </span>
                  </div>
                  {!annotation.resolved && (
                    <Badge variant="warning" className="mt-2">
                      Unresolved
                    </Badge>
                  )}
                </div>
              ))}
            </TabsContent>
            <TabsContent value="members" className="p-4 space-y-3">
              <h3 className="font-semibold mb-3">Team Members</h3>
              {chatMutation.data?.participants.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={p.user.imageUrl || ""} />
                    <AvatarFallback>
                      {p.user.firstName?.[0]}
                      {p.user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {p.user.firstName} {p.user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">Active now</p>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
