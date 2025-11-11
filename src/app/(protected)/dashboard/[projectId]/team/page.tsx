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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { toast } from "sonner";
import { Shield, Trash2, UserPlus } from "lucide-react";
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
export default function TeamPage() {
  const { projectId } = useProject();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<
    "ADMIN" | "COLLABORATOR" | "VIEWER"
  >("VIEWER");
  const { data: myRole } = api.projectMembers.getMyRole.useQuery({ projectId });
  const { data: members, refetch } =
    api.projectMembers.getProjectMembers.useQuery({ projectId });
  const assignRole = api.projectMembers.assignRole.useMutation();
  const removeMember = api.projectMembers.removeMember.useMutation();
  const isAdmin = myRole === "ADMIN";
  const handleAssignRole = async () => {
    if (!selectedUserId || !selectedRole) {
      toast.error("Please select a user and role");
      return;
    }
    try {
      await assignRole.mutateAsync({
        projectId,
        userId: selectedUserId,
        role: selectedRole,
      });
      toast.success("Role assigned successfully");
      await refetch();
      setSelectedUserId("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to assign role",
      );
    }
  };
  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMember.mutateAsync({
        projectId,
        userId,
      });
      toast.success("Member removed successfully");
      await refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove member",
      );
    }
  };
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-red-500">Admin</Badge>;
      case "COLLABORATOR":
        return <Badge className="bg-blue-500">Collaborator</Badge>;
      case "VIEWER":
        return <Badge className="bg-gray-500">Viewer</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Team Management</h1>
        <p className="text-muted-foreground">
          Manage team members and their permissions
        </p>
      </div>
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Assign Role
            </CardTitle>
            <CardDescription>
              Assign or update roles for team members
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium">User ID</label>
                <input
                  type="text"
                  placeholder="Enter user ID"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                />
              </div>
              <div className="w-48">
                <label className="text-sm font-medium">Role</label>
                <Select
                  value={selectedRole}
                  onValueChange={(value: "ADMIN" | "COLLABORATOR" | "VIEWER") =>
                    setSelectedRole(value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="COLLABORATOR">Collaborator</SelectItem>
                    <SelectItem value="VIEWER">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleAssignRole}
                  disabled={assignRole.isPending || !selectedUserId}
                >
                  {assignRole.isPending ? "Assigning..." : "Assign Role"}
                </Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                • <strong>Admin:</strong> Full access, can delete workspace and
                manage all settings
              </p>
              <p>
                • <strong>Collaborator:</strong> Can host meetings and
                contribute to the project
              </p>
              <p>
                • <strong>Viewer:</strong> Read-only access to project resources
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Team Members
          </CardTitle>
          <CardDescription>
            {members?.length || 0} members in this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                {isAdmin && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members?.map((member) => (
                <TableRow key={member.userId}>
                  <TableCell className="font-mono text-sm">
                    {member.userId}
                  </TableCell>
                  <TableCell>{getRoleBadge(member.role)}</TableCell>
                  <TableCell>
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Remove team member?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove the user from the project. They
                              will lose access to all project resources.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveMember(member.userId)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {!members?.length && (
                <TableRow>
                  <TableCell
                    colSpan={isAdmin ? 4 : 3}
                    className="text-center text-muted-foreground"
                  >
                    No team members yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
