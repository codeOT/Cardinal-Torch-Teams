"use client";

import { Avatar } from "@/components/ui/Avatar";
import { getMemberById } from "@/lib/members";
import { useTeamData } from "@/lib/team-context";

interface CollaboratorAvatarsProps {
  memberIds: string[];
  maxVisible?: number;
  size?: "sm" | "md";
}

export function CollaboratorAvatars({
  memberIds,
  maxVisible = 4,
  size = "sm",
}: CollaboratorAvatarsProps) {
  const { members } = useTeamData();

  const resolved = memberIds
    .map((id) => getMemberById(members, id))
    .filter((m): m is NonNullable<typeof m> => m !== undefined);

  if (resolved.length === 0) return null;

  const visible = resolved.slice(0, maxVisible);
  const overflow = resolved.length - visible.length;

  return (
    <div
      className="flex shrink-0 items-center"
      title={resolved.map((m) => m.name).join(", ")}
    >
      <div className="flex -space-x-2">
        {visible.map((member) => (
          <div key={member.id} className="rounded-full ring-2 ring-white">
            <Avatar member={member} size={size} />
          </div>
        ))}
      </div>
      {overflow > 0 && (
        <span className="ml-1.5 text-xs font-medium text-slate-500">
          +{overflow}
        </span>
      )}
    </div>
  );
}
