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
import { Textarea } from "@/components/ui/textarea";
import { ProjectBreadcrumb } from "@/components/project-breadcrumb";
import { QuickNav } from "@/components/quick-nav";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Send,
  Code2,
  Smile,
  Paperclip,
  MessageSquare,
  FileCode,
  Sparkles,
  Radio,
  X,
  File,
  Image as ImageIcon,
  Download,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from "next-themes";
import { useKeyboardShortcuts, type KeyboardShortcut } from "@/hooks/use-keyboard-shortcuts";

const EMOJI_LIST = [
  "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂",
  "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩",
  "😘", "😗", "😚", "😙", "🥲", "😋", "😛", "😜",
  "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐",
  "👍", "👎", "👌", "✌️", "🤞", "🤝", "👏", "🙌",
  "🎉", "🎊", "🎈", "🎁", "🏆", "🥇", "🥈", "🥉",
  "⭐", "🌟", "✨", "💫", "🔥", "💯", "✅", "❌",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍",
];

const CODE_LANGUAGES = [
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash/Shell" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "jsx", label: "React JSX" },
  { value: "tsx", label: "React TSX" },
];

export default function TeamChatPage() {
  const params = useParams<{ projectId: string }>();
  const { theme } = useTheme();
  const [message, setMessage] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState("typescript");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const teamChatShortcuts: KeyboardShortcut[] = [
    {
      key: 'c',
      metaKey: true,
      shiftKey: true,
      description: 'Open code snippet dialog',
      action: () => setCodeDialogOpen(true),
    },
    {
      key: 'u',
      metaKey: true,
      shiftKey: true,
      description: 'Upload file',
      action: () => fileInputRef.current?.click(),
    },
  ];

  useKeyboardShortcuts(teamChatShortcuts, true);

  const chatMutation = api.teamChat.getOrCreateChat.useMutation();
  const { data: messages, refetch: refetchMessages } = api.teamChat.getMessages.useQuery(
    {
      chatId: chatId || "",
      limit: 50,
    },
    {
      enabled: !!chatId,
      refetchInterval: 3000, 
    }
  );

  const { data: annotations } = api.teamChat.getAnnotations.useQuery({
    projectId: params.projectId,
  });

  const sendMessage = api.teamChat.sendMessage.useMutation({
    onSuccess: () => {
      setMessage("");
      setIsCodeMode(false);
      setUploadedFile(null);
      setFilePreviewUrl(null);
      refetchMessages();
      scrollToBottom();
    },
  });

  const addReaction = api.teamChat.addReaction.useMutation({
    onSuccess: () => refetchMessages(),
  });

  useEffect(() => {
    
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
    if (!chatId) return;
    if (!message.trim() && !uploadedFile) return;

    const messageType = isCodeMode ? "CODE" : uploadedFile ? "FILE" : "TEXT";

    sendMessage.mutate({
      chatId,
      content: message.trim() || (uploadedFile ? uploadedFile.name : ""),
      messageType,
      codeSnippet: isCodeMode ? message : undefined,
      codeLanguage: isCodeMode ? codeLanguage : undefined,
      attachmentName: uploadedFile ? uploadedFile.name : undefined,
      attachmentSize: uploadedFile ? uploadedFile.size : undefined,
      attachmentType: uploadedFile ? uploadedFile.type : undefined,
      attachmentUrl: filePreviewUrl || undefined,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isCodeMode) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(message + emoji);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    addReaction.mutate({
      messageId,
      emoji,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
                    {msg.messageType === "CODE" ? (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <FileCode className="h-3 w-3" />
                            {msg.codeLanguage ? (
                              <Badge variant="outline" className="text-xs capitalize">
                                {CODE_LANGUAGES.find(l => l.value === msg.codeLanguage)?.label || msg.codeLanguage}
                              </Badge>
                            ) : (
                              <span>Code Snippet</span>
                            )}
                          </div>
                        </div>
                        <div className="rounded overflow-hidden border border-border">
                          <SyntaxHighlighter
                            language={msg.codeLanguage || 'text'}
                            style={theme === 'dark' ? vscDarkPlus : vs}
                            customStyle={{
                              margin: 0,
                              fontSize: '0.75rem',
                              lineHeight: '1.5',
                            }}
                            showLineNumbers
                          >
                            {msg.content}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    ) : msg.messageType === "FILE" ? (
                      <div>
                        <div className="flex items-center gap-3 p-3 bg-background/80 rounded border border-border">
                          {msg.attachmentUrl && msg.attachmentType?.startsWith('image/') ? (
                            <div className="relative">
                              <ImageIcon className="h-10 w-10 text-blue-500" />
                            </div>
                          ) : (
                            <File className="h-10 w-10 text-muted-foreground" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-sm">{msg.attachmentName || 'Attachment'}</p>
                            <p className="text-xs text-muted-foreground">
                              {msg.attachmentSize ? formatFileSize(msg.attachmentSize) : 'Unknown size'}
                            </p>
                          </div>
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                        {msg.content && msg.content !== msg.attachmentName && (
                          <p className="text-sm mt-2 whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    )}
                    {msg.codeSnippet && msg.messageType !== "CODE" && (
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
                  {msg.reactions.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {Object.entries(
                        msg.reactions.reduce((acc, r) => {
                          acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([emoji, count]) => (
                        <Button
                          key={emoji}
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs hover:bg-accent"
                          onClick={() => handleReaction(msg.id, emoji)}
                        >
                          {emoji} {count}
                        </Button>
                      ))}
                    </div>
                  )}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          <Smile className="h-3 w-3 mr-1" />
                          React
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="grid grid-cols-8 gap-2">
                          {EMOJI_LIST.slice(0, 32).map((emoji) => (
                            <Button
                              key={emoji}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-lg hover:bg-accent"
                              onClick={() => handleReaction(msg.id, emoji)}
                            >
                              {emoji}
                            </Button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
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

          <div className="p-4 border-t border-border/50 space-y-3">
            {uploadedFile && (
              <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg border border-border">
                {filePreviewUrl ? (
                  <img src={filePreviewUrl} alt="Preview" className="h-16 w-16 object-cover rounded" />
                ) : (
                  <File className="h-12 w-12 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">{uploadedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(uploadedFile.size)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setUploadedFile(null);
                    setFilePreviewUrl(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {isCodeMode && (
              <div className="flex items-center justify-between p-2 bg-blue-500/10 rounded border border-blue-500/20">
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <FileCode className="h-4 w-4" />
                  Code snippet mode
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCodeMode(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              <Dialog open={codeDialogOpen} onOpenChange={setCodeDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant={isCodeMode ? "default" : "outline"}
                    size="icon"
                    title="Send code snippet (⌘⇧C)"
                  >
                    <Code2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Send Code Snippet</DialogTitle>
                    <DialogDescription>
                      Share code with syntax highlighting
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="language">Programming Language</Label>
                      <Select
                        value={codeLanguage}
                        onValueChange={setCodeLanguage}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {CODE_LANGUAGES.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="code">Code</Label>
                      <Textarea
                        id="code"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Paste your code here..."
                        className="font-mono text-sm min-h-[200px]"
                      />
                    </div>
                    <Button
                      onClick={() => {
                        setIsCodeMode(true);
                        setCodeDialogOpen(false);
                        handleSendMessage();
                      }}
                      className="w-full"
                      disabled={!message.trim()}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Code
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" title="Add emoji">
                    <Smile className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Choose an emoji</p>
                    <div className="grid grid-cols-8 gap-1 max-h-64 overflow-y-auto">
                      {EMOJI_LIST.map((emoji) => (
                        <Button
                          key={emoji}
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 text-xl hover:bg-accent"
                          onClick={() => handleEmojiSelect(emoji)}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx,.txt,.csv,.json,.xml"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                title="Attach file (⌘⇧U)"
              >
                <Paperclip className="h-4 w-4" />
              </Button>

              {isCodeMode ? (
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your code here..."
                  className="flex-1 min-h-[60px] font-mono text-sm resize-none"
                />
              ) : (
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={uploadedFile ? "Add a caption (optional)..." : "Type a message..."}
                  className="flex-1"
                />
              )}

              <Button
                onClick={handleSendMessage}
                disabled={(!message.trim() && !uploadedFile) || sendMessage.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

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
