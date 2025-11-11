"use client";
import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { toast } from "sonner";
import { Mic, Users, Upload, StopCircle, PlayCircle } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";
import { Spinner } from "~/components/ui/spinner";
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
export default function LiveMeetingPage() {
  const params = useParams<{ meetingId: string }>();
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { data: meeting, refetch } = api.liveMeetings.getMeeting.useQuery({
    meetingId: params.meetingId,
  });
  const endMeeting = api.liveMeetings.endMeeting.useMutation();
  const uploadRecording = api.liveMeetings.uploadRecording.useMutation();
  const leaveMeeting = api.liveMeetings.leaveMeeting.useMutation();
  const isHost = meeting?.hostId === meeting?.participants?.[0]?.userId;
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      toast.success("Recording started");
    } catch (error) {
      toast.error("Failed to access microphone");
    }
  };
  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      toast.success("Recording stopped");
    }
  };
  const handleUploadRecording = async (audioUrl: string) => {
    try {
      await uploadRecording.mutateAsync({
        meetingId: params.meetingId,
        audioFileUrl: audioUrl,
      });
      toast.success("Recording uploaded! Transcription started.");
      await refetch();
    } catch {
      toast.error("Failed to upload recording");
    }
  };
  const handleEndMeeting = async () => {
    try {
      await endMeeting.mutateAsync({ meetingId: params.meetingId });
      toast.success("Meeting ended");
      router.push(`/meetings/live/${params.meetingId}/summary`);
    } catch {
      toast.error("Failed to end meeting");
    }
  };
  const handleLeaveMeeting = async () => {
    try {
      await leaveMeeting.mutateAsync({ meetingId: params.meetingId });
      toast.success("Left meeting");
      router.push("/meetings");
    } catch {
      toast.error("Failed to leave meeting");
    }
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {meeting?.title || "Live Meeting"}
          </h1>
          <p className="text-muted-foreground">
            {meeting?.description || "Recording and collaboration session"}
          </p>
        </div>
        <div className="flex gap-2">
          {meeting?.status === "IN_PROGRESS" && (
            <Badge className="bg-red-500 animate-pulse">
              <div className="h-2 w-2 bg-white rounded-full mr-2" />
              Live
            </Badge>
          )}
          {meeting?.status === "ENDED" && (
            <Badge variant="secondary">Ended</Badge>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Audio Recording
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center p-12 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg border-2 border-dashed">
              <div className="text-center space-y-4">
                {isRecording ? (
                  <>
                    <div className="flex items-center justify-center">
                      <div className="relative">
                        <Mic className="h-16 w-16 text-red-500 animate-pulse" />
                        <div className="absolute inset-0 animate-ping">
                          <Mic className="h-16 w-16 text-red-500 opacity-75" />
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl font-mono font-bold">
                      {formatTime(recordingTime)}
                    </div>
                    <Button
                      onClick={stopRecording}
                      variant="destructive"
                      size="lg"
                      className="gap-2"
                    >
                      <StopCircle className="h-5 w-5" />
                      Stop Recording
                    </Button>
                  </>
                ) : audioBlob ? (
                  <>
                    <div className="flex items-center justify-center">
                      <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center">
                        <Mic className="h-8 w-8 text-green-500" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Recording complete: {formatTime(recordingTime)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Size: {(audioBlob.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button
                        onClick={startRecording}
                        variant="outline"
                        className="gap-2"
                      >
                        <PlayCircle className="h-4 w-4" />
                        Record Again
                      </Button>
                      <UploadButton
                        endpoint="meetingRecording"
                        onClientUploadComplete={(res) => {
                          if (res?.[0]?.url) {
                            handleUploadRecording(res[0].url);
                          }
                        }}
                        onUploadError={(error: Error) => {
                          toast.error(`Upload failed: ${error.message}`);
                        }}
                        appearance={{
                          button:
                            "bg-primary text-primary-foreground hover:bg-primary/90",
                        }}
                        content={{
                          button: () => (
                            <span className="flex items-center gap-2">
                              <Upload className="h-4 w-4" />
                              Upload & Transcribe
                            </span>
                          ),
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center">
                      <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center">
                        <Mic className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <p className="text-muted-foreground">
                      Ready to record audio
                    </p>
                    <Button
                      onClick={startRecording}
                      size="lg"
                      className="gap-2"
                      disabled={meeting?.status !== "IN_PROGRESS"}
                    >
                      <PlayCircle className="h-5 w-5" />
                      Start Recording
                    </Button>
                  </>
                )}
              </div>
            </div>
            {meeting?.audioFileUrl && (
              <div className="p-4 bg-accent rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Recording Status</span>
                  {meeting.transcriptionStatus === "PENDING" && (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                  {meeting.transcriptionStatus === "PROCESSING" && (
                    <Badge className="bg-blue-500">
                      <Spinner className="h-3 w-3 mr-1" />
                      Processing
                    </Badge>
                  )}
                  {meeting.transcriptionStatus === "COMPLETED" && (
                    <Badge className="bg-green-500">Completed</Badge>
                  )}
                  {meeting.transcriptionStatus === "FAILED" && (
                    <Badge variant="destructive">Failed</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Audio file uploaded. Transcription in progress...
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(`/meetings/live/${params.meetingId}/summary`)
                  }
                >
                  View Transcript
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        {}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participants ({meeting?.participants?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {meeting?.participants?.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent"
              >
                <Avatar>
                  <AvatarFallback>{participant.userId[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{participant.userId}</p>
                  <p className="text-xs text-muted-foreground">
                    {participant.role}
                  </p>
                </div>
                {participant.role === "HOST" && (
                  <Badge variant="outline" className="text-xs">
                    Host
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      {}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {meeting?.status === "IN_PROGRESS" && "Meeting is in progress"}
              {meeting?.status === "ENDED" && "Meeting has ended"}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleLeaveMeeting}>
                Leave Meeting
              </Button>
              {isHost && meeting?.status === "IN_PROGRESS" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">End Meeting</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        End meeting for everyone?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will end the meeting for all participants. Make
                        sure all recordings are uploaded before ending.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleEndMeeting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        End Meeting
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
