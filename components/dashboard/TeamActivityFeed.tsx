"use client";

import Image from "next/image";

import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getMemberById } from "@/lib/members";
import { useTeamData } from "@/lib/team-context";
import type { Activity } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";

interface TeamActivityFeedProps {
  activities: Activity[];
}

export function TeamActivityFeed({ activities }: TeamActivityFeedProps) {
  const { members } = useTeamData();

  const sorted = [...activities].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
        <h2 className="text-base font-semibold text-slate-900">Team activity</h2>
        <p className="text-sm text-slate-500">
          Recent updates from everyone on the team
        </p>
      </div>
      <ul className="divide-y divide-slate-100">
        {sorted.map((activity) => {
          const member = getMemberById(members, activity.memberId);
          if (!member) return null;

          return (
            <li key={activity.id} className="flex gap-3 px-4 py-4 sm:px-5">
              <Avatar member={member} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-800">
                  <span className="font-semibold">{member.name}</span>{" "}
                  {activity.message}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <time
                    className="text-xs text-slate-400"
                    dateTime={activity.timestamp}
                  >
                    {formatRelativeTime(activity.timestamp)}
                  </time>
                  {activity.meta?.taskStatus && (
                    <StatusBadge status={activity.meta.taskStatus} size="sm" />
                  )}
                </div>
                {activity.meta?.imageUrl && (
                  <div className="relative mt-3 h-36 w-full max-w-xs overflow-hidden rounded-lg border border-slate-200">
                    <Image
                      src={activity.meta.imageUrl}
                      alt="Activity attachment"
                      fill
                      className="object-cover"
                      sizes="320px"
                      unoptimized={
                        activity.meta.imageUrl.startsWith("data:")
                      }
                    />
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
