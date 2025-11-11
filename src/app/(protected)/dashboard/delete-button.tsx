"use client";
import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import useProject from "~/hooks/use-project";
import useRefetch from "~/hooks/use-refetch";
import { api } from "~/trpc/react";
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
import { Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { Spinner } from "~/components/ui/spinner";
import { useRouter } from "next/navigation";
const DeleteButton = () => {
  const deleteProject = api.project.deleteProject.useMutation();
  const { projectId, project } = useProject();
  const refetch = useRefetch();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { data: myRole } = api.projectMembers.getMyRole.useQuery({ projectId });
  const isAdmin = myRole === "ADMIN";
  const handleDelete = () => {
    const loadingToast = toast.loading("Deleting project...", {
      description: "Removing all project data and configurations",
    });
    deleteProject.mutate(
      { projectId: projectId },
      {
        onSuccess: () => {
          toast.dismiss(loadingToast);
          toast.success("Project deleted successfully", {
            description: "All data has been permanently removed",
            icon: <CheckCircle2 className="h-4 w-4" />,
          });
          setOpen(false);
          localStorage.removeItem("gitwit-project-id");
          refetch();
          router.push("/dashboard");
        },
        onError: (error) => {
          toast.dismiss(loadingToast);
          toast.error("Unable to delete project", {
            description: error.message || "Please try again or contact support",
            icon: <AlertCircle className="h-4 w-4" />,
            duration: 5000,
          });
        },
      },
    );
  };

  if (!isAdmin) {
    return null;
  }
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          disabled={deleteProject.isPending}
          size={"sm"}
          variant={"destructive"}
          className="min-w-[80px]"
        >
          {deleteProject.isPending ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              Delete
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete project permanently?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              This will permanently delete{" "}
              <span className="font-semibold text-foreground">
                &quot;{project?.name}&quot;
              </span>{" "}
              and remove all associated data including:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Repository analysis and insights</li>
              <li>Meeting recordings and summaries</li>
              <li>Q&A history and saved answers</li>
              <li>Team member access</li>
            </ul>
            <p className="font-semibold text-destructive pt-2">
              This action cannot be undone.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete project
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
export default DeleteButton;
