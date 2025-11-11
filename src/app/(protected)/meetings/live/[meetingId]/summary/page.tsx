"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { toast } from "sonner";
import {
  FileText,
  Sparkles,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
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
} from "~/components/ui/alert-dialog";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Spinner } from "~/components/ui/spinner";
export default function MeetingSummaryPage() {
  const params = useParams<{ meetingId: string }>();
  const router = useRouter();
  const [isPolling, setIsPolling] = useState(false);
  const { data: meeting, refetch } = api.liveMeetings.getMeeting.useQuery({
    meetingId: params.meetingId,
  });
  const { data: myRole } = api.projectMembers.getMyRole.useQuery(
    {
      projectId: meeting?.projectId || "",
    },
    {
      enabled: !!meeting?.projectId,
    },
  );
  const requestSummary = api.liveMeetings.requestSummary.useMutation();
  const generateSummary = api.liveMeetings.generateSummary.useMutation();
  const isAdmin = myRole === "ADMIN";

  useEffect(() => {
    if (meeting?.transcriptionStatus === "PROCESSING" && !isPolling) {
      setIsPolling(true);
      const interval = setInterval(async () => {
        try {
          await refetch();

          if (meeting?.transcriptionStatus === "COMPLETED") {
            setIsPolling(false);
            clearInterval(interval);
            toast.success("Transcription completed!");
          } else if (meeting?.transcriptionStatus === "FAILED") {
            setIsPolling(false);
            clearInterval(interval);
            toast.error("Transcription failed");
          }
        } catch (error) {}
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [meeting?.transcriptionStatus, params.meetingId, refetch, isPolling]);
  const handleRequestSummary = async () => {
    try {
      await requestSummary.mutateAsync({ meetingId: params.meetingId });
      toast.success("Summary requested");
      await refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to request summary",
      );
    }
  };
  const handleGenerateSummary = async () => {
    try {
      await generateSummary.mutateAsync({ meetingId: params.meetingId });
      toast.success("Summary generated successfully!");
      await refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate summary",
      );
    }
  };
  const downloadTranscript = () => {
    if (!meeting?.transcript) return;
    const blob = new Blob([meeting.transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meeting-transcript-${params.meetingId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const downloadSummary = () => {
    if (!meeting?.summary) return;
    const blob = new Blob([meeting.summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meeting-summary-${params.meetingId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meeting Summary</h1>
          <p className="text-muted-foreground">{meeting?.title}</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Back to Meeting
        </Button>
      </div>
      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recording</CardTitle>
          </CardHeader>
          <CardContent>
            {meeting?.audioFileUrl ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm">Uploaded</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <span className="text-sm">Not uploaded</span>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Transcription</CardTitle>
          </CardHeader>
          <CardContent>
            {meeting?.transcriptionStatus === "COMPLETED" && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm">Completed</span>
              </div>
            )}
            {meeting?.transcriptionStatus === "PROCESSING" && (
              <div className="flex items-center gap-2">
                <Spinner className="h-5 w-5 text-blue-500" />
                <span className="text-sm">Processing...</span>
              </div>
            )}
            {meeting?.transcriptionStatus === "PENDING" && (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <span className="text-sm">Pending</span>
              </div>
            )}
            {meeting?.transcriptionStatus === "FAILED" && (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-sm">Failed</span>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">AI Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {meeting?.summary ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm">Generated</span>
              </div>
            ) : meeting?.summaryRequested ? (
              <div className="flex items-center gap-2">
                <Spinner className="h-5 w-5 text-blue-500" />
                <span className="text-sm">Requested</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-gray-500" />
                <span className="text-sm">Not generated</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {}
      {meeting?.transcript && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Full Transcript
                </CardTitle>
                <CardDescription className="mt-1">
                  Automatically generated from meeting audio
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={downloadTranscript}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] rounded-md border p-4">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {meeting.transcript}
              </p>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
      {}
      {meeting?.transcriptionStatus === "COMPLETED" && !meeting?.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI-Powered Summary
            </CardTitle>
            <CardDescription>
              Generate a concise summary of the meeting using AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!meeting.summaryRequested ? (
              <>
                <p className="text-sm text-muted-foreground">
                  The AI summary will extract key points, decisions made, and
                  action items from the transcript.
                  {!isAdmin && " Only admins can request summaries."}
                </p>
                {isAdmin && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="gap-2">
                        <Sparkles className="h-4 w-4" />
                        Request Summary
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Generate AI Summary?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will use AI to analyze the transcript and
                          generate a comprehensive summary including key points,
                          decisions, and action items.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRequestSummary}>
                          Generate Summary
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-blue-600">
                  <Spinner className="h-4 w-4" />
                  <span className="text-sm">
                    Summary requested, generating...
                  </span>
                </div>
                <Button
                  onClick={handleGenerateSummary}
                  disabled={generateSummary.isPending}
                  variant="outline"
                  className="gap-2"
                >
                  {generateSummary.isPending ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Retry Generation
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
      {}
      {meeting?.summary && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI-Generated Summary
                </CardTitle>
                <CardDescription className="mt-1">
                  Key insights and action items from the meeting
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={downloadSummary}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 p-6">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {meeting.summary}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {}
      {!meeting?.audioFileUrl && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No recording uploaded yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Upload a recording from the meeting page to see the transcript
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
