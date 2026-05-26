import type { TeamMember } from "@/lib/types";

interface AvatarProps {
  member: Pick<TeamMember, "initials" | "avatarColor" | "name" | "isOnline">;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

const onlineDotClasses = {
  sm: "h-2.5 w-2.5 border-[1.5px]",
  md: "h-3 w-3 border-2",
  lg: "h-3.5 w-3.5 border-2",
};

export function Avatar({ member, size = "md" }: AvatarProps) {
  const statusLabel = member.isOnline ? "Online" : "Offline";

  return (
    <div
      className="relative inline-flex shrink-0"
      title={`${member.name} — ${statusLabel}`}
    >
      <div
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full font-semibold text-white`}
        style={{ backgroundColor: member.avatarColor }}
        aria-label={`${member.name}, ${statusLabel}`}
      >
        {member.initials}
      </div>
      {member.isOnline && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 rounded-full border-white bg-emerald-500 ${onlineDotClasses[size]}`}
          aria-hidden
        />
      )}
    </div>
  );
}
