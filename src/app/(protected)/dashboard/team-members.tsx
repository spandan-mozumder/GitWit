"use client";
import React from "react";
import useProject from "~/hooks/use-project";
import { api } from "~/trpc/react";
const TeamMembers = () => {
  const { projectId } = useProject();
  const { data: members } = api.project.getTeamMembers.useQuery({ projectId });
  return (
    <div className="flex items-center gap-2">
      {members?.map(
        (member: {
          id: string;
          user: { imageUrl?: string | null; firstName?: string | null };
        }) => (
          <img
            key={member.id}
            src={member.user.imageUrl ?? ""}
            alt={member.user.firstName ?? ""}
            height={32}
            width={32}
            className="rounded-full border border-border/60 bg-background object-cover shadow-sm"
          />
        ),
      )}
    </div>
  );
};
export default TeamMembers;
