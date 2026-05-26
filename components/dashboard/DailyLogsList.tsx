"use client";

import Image from "next/image";
import { useMemo } from "react";

import { Avatar } from "@/components/ui/Avatar";
import { getMemberById } from "@/lib/members";
import { useTeamData } from "@/lib/team-context";
import type { DailyLog } from "@/lib/types";
import { formatDate, formatRelativeTime } from "@/lib/utils";

interface DailyLogsListProps {
  logs: DailyLog[];
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
  groupByDate?: boolean;
}

function LogEntry({ log }: { log: DailyLog }) {
  const { members } = useTeamData();
  const member = getMemberById(members, log.memberId);
  if (!member) return null;

  return (
    <li className="px-5 py-4">
      <div className="flex gap-3">
        <Avatar member={member} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-800">
              {member.name}
            </span>
            <time className="text-xs text-slate-400" dateTime={log.createdAt}>
              {formatRelativeTime(log.createdAt)}
            </time>
          </div>
          {log.taskTitle && (
            <p className="mt-1 text-xs font-medium text-indigo-600">
              Task: {log.taskTitle}
            </p>
          )}
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            {log.summary}
          </p>
          {log.imageUrl && (
            <div className="relative mt-3 h-40 w-full max-w-sm overflow-hidden rounded-lg border border-slate-200">
              <Image
                src={log.imageUrl}
                alt={`${member.name}'s update`}
                fill
                className="object-cover"
                sizes="384px"
                unoptimized={
                  log.imageUrl.startsWith("blob:") ||
                  log.imageUrl.startsWith("data:")
                }
              />
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export function DailyLogsList({
  logs,
  title = "Today's logs",
  subtitle = "What everyone shared today",
  emptyMessage = "No logs yet today. Be the first to post an update.",
  groupByDate = false,
}: DailyLogsListProps) {
  const sorted = useMemo(
    () =>
      [...logs].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [logs],
  );

  const grouped = useMemo(() => {
    if (!groupByDate) return null;

    const map = new Map<string, DailyLog[]>();
    for (const log of sorted) {
      const existing = map.get(log.date) ?? [];
      existing.push(log);
      map.set(log.date, existing);
    }
    return [...map.entries()].sort(([a], [b]) => b.localeCompare(a));
  }, [sorted, groupByDate]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>

      {sorted.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-slate-400">
          {emptyMessage}
        </p>
      ) : groupByDate && grouped ? (
        <div className="divide-y divide-slate-100">
          {grouped.map(([date, dateLogs]) => (
            <div key={date}>
              <p className="bg-slate-50 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {formatDate(date)}
              </p>
              <ul className="divide-y divide-slate-100">
                {dateLogs.map((log) => (
                  <LogEntry key={log.id} log={log} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {sorted.map((log) => (
            <LogEntry key={log.id} log={log} />
          ))}
        </ul>
      )}
    </section>
  );
}
