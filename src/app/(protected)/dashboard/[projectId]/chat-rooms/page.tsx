"use client";
import { useState } from "react";
import { api } from "~/trpc/react";
import useProject from "~/hooks/use-project";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { toast } from "sonner";
import { MessageSquare, Plus, Users, Trash2, UserPlus, X } from "lucide-react";
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
export default function ChatRoomsPage() {
  const { projectId } = useProject();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [participantsDialogOpen, setParticipantsDialogOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const [newParticipantId, setNewParticipantId] = useState("");
  const { data: myRole } = api.projectMembers.getMyRole.useQuery({ projectId });
  const { data: rooms, refetch: refetchRooms } = api.chatRooms.getRooms.useQuery({ projectId });
  const { data: participants, refetch: refetchParticipants } = api.chatRooms.getRoomParticipants.useQuery(
    { roomId: selectedRoomId },
    { enabled: !!selectedRoomId }
  );
  const createRoom = api.chatRooms.createRoom.useMutation();
  const deleteRoom = api.chatRooms.deleteRoom.useMutation();
  const addParticipants = api.chatRooms.addParticipants.useMutation();
  const removeParticipant = api.chatRooms.removeParticipant.useMutation();
  const isAdmin = myRole === "ADMIN";
  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      toast.error("Please enter a room name");
      return;
    }
    try {
      await createRoom.mutateAsync({
        projectId,
        name: newRoomName,
        description: newRoomDescription,
      });
      toast.success("Chat room created successfully");
      await refetchRooms();
      setCreateDialogOpen(false);
      setNewRoomName("");
      setNewRoomDescription("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create room");
    }
  };
  const handleDeleteRoom = async (roomId: string) => {
    try {
      await deleteRoom.mutateAsync({ roomId });
      toast.success("Chat room deleted successfully");
      await refetchRooms();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete room");
    }
  };
  const handleAddParticipant = async () => {
    if (!newParticipantId.trim() || !selectedRoomId) {
      toast.error("Please enter a user ID");
      return;
    }
    try {
      await addParticipants.mutateAsync({
        roomId: selectedRoomId,
        userIds: [newParticipantId],
      });
      toast.success("Participant added successfully");
      await refetchParticipants();
      setNewParticipantId("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add participant");
    }
  };
  const handleRemoveParticipant = async (userId: string) => {
    if (!selectedRoomId) return;
    try {
      await removeParticipant.mutateAsync({
        roomId: selectedRoomId,
        userId,
      });
      toast.success("Participant removed successfully");
      await refetchParticipants();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove participant");
    }
  };
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Chat Rooms</h1>
          <p className="text-muted-foreground">
            Create topic-specific chat rooms for your team
          </p>
        </div>
        {isAdmin && (
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Chat Room</DialogTitle>
                <DialogDescription>
                  Create a new chat room for discussing specific topics
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Room Name</label>
                  <Input
                    placeholder="e.g., Frontend Discussion"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <Textarea
                    placeholder="What is this room for?"
                    value={newRoomDescription}
                    onChange={(e) => setNewRoomDescription(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreateRoom}
                  disabled={createRoom.isPending}
                >
                  {createRoom.isPending ? "Creating..." : "Create Room"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rooms?.map((room) => (
          <Card key={room.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  <CardTitle className="text-lg">{room.name}</CardTitle>
                </div>
                {isAdmin && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete chat room?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete &quot;{room.name}&quot; and all its messages.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteRoom(room.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              {room.description && (
                <CardDescription>{room.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Messages</span>
                <Badge variant="secondary">{room._count.messages}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Members</span>
                <Badge variant="secondary">{room.memberships.length}</Badge>
              </div>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setSelectedRoomId(room.id);
                    setParticipantsDialogOpen(true);
                  }}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Participants
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        {!rooms?.length && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No chat rooms yet</p>
              {isAdmin && (
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first chat room to get started
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      {/* Participants Management Dialog */}
      <Dialog open={participantsDialogOpen} onOpenChange={setParticipantsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Participants</DialogTitle>
            <DialogDescription>
              Add or remove participants from this chat room
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter user ID"
                value={newParticipantId}
                onChange={(e) => setNewParticipantId(e.target.value)}
              />
              <Button
                onClick={handleAddParticipant}
                disabled={addParticipants.isPending}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
              {participants?.map((participant) => (
                <div
                  key={participant.userId}
                  className="flex items-center justify-between p-3"
                >
                  <div>
                    <p className="font-mono text-sm">{participant.userId}</p>
                    <p className="text-xs text-muted-foreground">
                      Added {new Date(participant.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveParticipant(participant.userId)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {!participants?.length && (
                <div className="p-8 text-center text-muted-foreground">
                  No participants yet
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
