"use client"
import React, { useState } from 'react'
import useProject from '~/hooks/use-project'
import { api } from '~/trpc/react'
import MeetingCard from '../dashboard/meeting-card'
import Link from 'next/link'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { toast } from 'sonner'
import useRefetch from '~/hooks/use-refetch'
import { Card, CardContent } from '~/components/ui/card'
import { Calendar, Clock, AlertCircle, Eye, Trash2, Loader2, CheckCircle2 } from 'lucide-react'
import { Skeleton } from '~/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"

const MeetingPage = () => {
    const {projectId}= useProject()
    const {data: meetings, isLoading} = api.project.getMeetings.useQuery({projectId},{
        refetchInterval: 4000
    })
    const deleteMeeting = api.project.deleteMeeting.useMutation();
    const refetch = useRefetch()
    const [meetingToDelete, setMeetingToDelete] = useState<{id: string, name: string} | null>(null);

    const handleDelete = () => {
        if (!meetingToDelete) return;
        
        const loadingToast = toast.loading("Deleting meeting...", {
            description: "Removing meeting and associated data"
        });

        deleteMeeting.mutate({meetingId: meetingToDelete.id},{
            onSuccess:()=>{
                toast.dismiss(loadingToast);
                toast.success('Meeting deleted successfully', {
                    description: "All associated data has been removed",
                    icon: <CheckCircle2 className="h-4 w-4" />
                });
                refetch();
                setMeetingToDelete(null);
            },
            onError:(error)=>{
                toast.dismiss(loadingToast);
                console.error("Delete meeting error:", error);
                toast.error('Unable to delete meeting', {
                    description: error.message || "Please try again or contact support",
                    icon: <AlertCircle className="h-4 w-4" />,
                    duration: 5000
                });
            }
        });
    }

  return (
    <>
    <AlertDialog open={!!meetingToDelete} onOpenChange={(open) => !open && setMeetingToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete meeting recording?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{meetingToDelete?.name}&quot; and all associated summaries, issues, and insights. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete meeting
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    <div className="space-y-8 animate-fade-in">
        <MeetingCard/>

        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className='text-2xl font-semibold'>Meeting briefings</h1>
                    <p className="text-sm text-muted-foreground">
                        Every recording becomes searchable context with clear next steps.
                    </p>
                </div>
                {meetings && meetings.length > 0 && (
                    <Badge variant="secondary" className="rounded-full px-3 py-1 uppercase tracking-[0.3em]">
                        {meetings.length} {meetings.length === 1 ? 'meeting' : 'meetings'}
                    </Badge>
                )}
            </div>

            {isLoading && (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 space-y-3">
                                        <Skeleton className="h-5 w-2/3" />
                                        <Skeleton className="h-4 w-1/3" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Skeleton className="h-9 w-20" />
                                        <Skeleton className="h-9 w-20" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {!isLoading && meetings && meetings.length === 0 && (
                <Card className="border-dashed border-border/70 bg-card/70">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="mb-4 rounded-full border border-border/70 bg-background/70 p-4">
                            <Calendar className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold">No meetings yet</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Upload your first recording to receive summaries, sentiment, and action lists within minutes.
                        </p>
                    </CardContent>
                </Card>
            )}

            {!isLoading && meetings && meetings.length > 0 && (
                <div className="grid gap-4">
                    {meetings?.map((meeting: { id: string; name: string; status: string; createdAt: Date; issues: unknown[] })=>(
                        <Card key={meeting.id} className="overflow-hidden border border-border/70 bg-card/70">
                            <CardContent className="p-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <Link 
                                                href={`/meetings/${meeting.id}`} 
                                                className='text-lg font-semibold text-foreground transition-colors hover:text-primary'
                                            >
                                                {meeting.name}
                                            </Link>
                                            {meeting.status === 'PROCESSING' && (
                                                <Badge variant="secondary" className='gap-1.5 rounded-full animate-pulse'>
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                    Processing
                                                </Badge>
                                            )}
                                        </div>
                                        
                                        <div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
                                            <div className='flex items-center gap-1.5'>
                                                <Clock className='h-4 w-4' />
                                                {meeting.createdAt.toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                            <div className='flex items-center gap-1.5'>
                                                <AlertCircle className='h-4 w-4' />
                                                {meeting.issues.length} {meeting.issues.length === 1 ? 'issue' : 'issues'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className='flex items-center gap-3'>
                                        <Button 
                                            variant="outline" 
                                            asChild
                                            className="gap-2"
                                        >
                                            <Link href={`/meetings/${meeting.id}`}>
                                                <Eye className="h-4 w-4" />
                                                View Details
                                            </Link>
                                        </Button>
                                        <Button 
                                            size='icon'
                                            variant='ghost'
                                            disabled={deleteMeeting.isPending} 
                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            onClick={()=> setMeetingToDelete({id: meeting.id, name: meeting.name})}
                                        >
                                            {deleteMeeting.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    </div>
    </>
  )
}

export default MeetingPage