"use client";

import Image from "next/image";
import { useMemo } from "react";

import { Avatar } from "@/components/ui/Avatar";
import {
  buildWeeklyReport,
  formatWeeklyReportText,
} from "@/lib/weekly-report";
import type { DailyLog, Department, TeamMember } from "@/lib/types";
import {
  addDays,
  formatWeekRangeLabel,
  getWeekStart,
  isCurrentWeek,
} from "@/lib/week-utils";

interface WeeklyReportProps {
  logs: DailyLog[];
  members: TeamMember[];
  department: Department;
  weekStart: Date;
  onWeekChange: (weekStart: Date) => void;
}

export function WeeklyReport({
  logs,
  members,
  department,
  weekStart,
  onWeekChange,
}: WeeklyReportProps) {
  const report = useMemo(
    () => buildWeeklyReport(logs, members, department, weekStart),
    [logs, members, department, weekStart],
  );

  const isThisWeek = isCurrentWeek(weekStart);

  function goToPreviousWeek() {
    onWeekChange(addDays(weekStart, -7));
  }

  function goToNextWeek() {
    onWeekChange(addDays(weekStart, 7));
  }

  function goToThisWeek() {
    onWeekChange(getWeekStart(new Date()));
  }

  async function copyReport() {
    const text = formatWeeklyReportText(report);
    await navigator.clipboard.writeText(text);
  }

  function printReport() {
    window.print();
  }

  return (
    <section
      id="weekly-report"
      className="weekly-report rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-900">
              Weekly report
            </h2>
            <p className="text-sm text-slate-500">{report.weekLabel}</p>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 print:hidden sm:flex sm:w-auto sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={goToPreviousWeek}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              ← Prev
            </button>
            {!isThisWeek && (
              <button
                type="button"
                onClick={goToThisWeek}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                This week
              </button>
            )}
            <button
              type="button"
              onClick={goToNextWeek}
              disabled={isThisWeek}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
            <button
              type="button"
              onClick={copyReport}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Copy
            </button>
            <button
              type="button"
              onClick={printReport}
              className="col-span-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 sm:col-span-1"
            >
              Print
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
          <StatPill label="Total logs" value={report.totalLogs} />
          <StatPill label="Members logged" value={report.activeMembers} />
          <StatPill label="Active days" value={report.activeDays} />
        </div>
      </div>

      {report.totalLogs === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-slate-400">
          No daily logs this week. Team members can post updates above — they
          will appear here automatically.
        </p>
      ) : (
        <div className="divide-y divide-slate-100">
          {report.members
            .filter((entry) => entry.totalLogs > 0)
            .map(({ member, days, totalLogs }) => (
              <article key={member.id} className="px-4 py-5 sm:px-5">
                <div className="mb-4 flex items-center gap-3">
                  <Avatar member={member} size="sm" />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {member.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {member.role} · {totalLogs} log
                      {totalLogs === 1 ? "" : "s"} this week
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {days
                    .filter((day) => day.logs.length > 0)
                    .map((day) => (
                      <div key={day.date}>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {day.label}
                        </p>
                        <ul className="mt-2 space-y-3">
                          {day.logs.map((log) => (
                            <li
                              key={log.id}
                              className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
                            >
                              {log.taskTitle && (
                                <p className="text-xs font-medium text-indigo-600">
                                  Task: {log.taskTitle}
                                </p>
                              )}
                              <p className="mt-1 text-sm leading-relaxed text-slate-700">
                                {log.summary}
                              </p>
                              {log.imageUrl && (
                                <div className="relative mt-3 h-32 w-full max-w-xs overflow-hidden rounded-lg border border-slate-200">
                                  <Image
                                    src={log.imageUrl}
                                    alt="Log attachment"
                                    fill
                                    className="object-cover"
                                    sizes="320px"
                                    unoptimized={
                                      log.imageUrl.startsWith("blob:") ||
                                      log.imageUrl.startsWith("data:")
                                    }
                                  />
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                </div>
              </article>
            ))}
        </div>
      )}
    </section>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 rounded-lg bg-slate-50 px-2 py-2 sm:px-3">
      <p className="truncate text-[10px] text-slate-500 sm:text-xs">{label}</p>
      <p className="text-base font-semibold text-slate-900 sm:text-lg">{value}</p>
    </div>
  );
}
