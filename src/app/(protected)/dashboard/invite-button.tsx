"use client"
import { Clipboard, CheckCircle2, UserPlus, Copy } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import useProject from '~/hooks/use-project'

const InviteButton = () => {
    const {projectId} = useProject()
    const [open,setOpen] = useState(false)
    const [copied, setCopied] = useState(false)

    const inviteLink = typeof window !== 'undefined' ? `${window.location.origin}/join/${projectId}` : '';

    const handleCopy = async () => {
        try {
            if (typeof window !== 'undefined') {
                await navigator.clipboard.writeText(inviteLink);
                setCopied(true);
                toast.success("Invite link copied", {
                    description: "Share this link with your team members",
                    icon: <CheckCircle2 className="h-4 w-4" />
                });
                setTimeout(() => setCopied(false), 2000);
            }
        } catch (error) {
            console.error("Copy to clipboard error:", error);
            toast.error("Unable to copy link", {
                description: "Please try selecting and copying manually"
            });
        }
    }

  return (
    <>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-primary" />
                        Invite team members
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <p className='text-sm text-muted-foreground'>
                        Share this link with team members to grant them access to this workspace. They&apos;ll be able to view meetings, ask questions, and collaborate on insights.
                    </p>
                    <div className="flex items-center gap-2">
                        <Input 
                            readOnly 
                            className='flex-1 text-sm bg-background/80' 
                            value={inviteLink}
                        />
                        <Button 
                            size="sm"
                            onClick={handleCopy}
                            className="gap-2 shrink-0"
                        >
                            {copied ? (
                                <>
                                    <CheckCircle2 className="h-4 w-4 animate-success-pulse" />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4" />
                                    Copy
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
        <Button size={'sm'} onClick={()=> setOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Members
        </Button>
    </>
  )
}

export default InviteButton