"use client";

import { useMemo, useState } from "react";

import { DailyLogForm } from "@/components/dashboard/DailyLogForm";
import { DailyLogsList } from "@/components/dashboard/DailyLogsList";
import { WeeklyReport } from "@/components/dashboard/WeeklyReport";
import type { Department } from "@/lib/types";
import { useDepartmentData } from "@/lib/team-context";
import { getWeekStart } from "@/lib/week-utils";

type LogView = "today" | "all" | "weekly";

interface DepartmentLogsClientProps {
  department: Department;
}

export function DepartmentLogsClient({ department }: DepartmentLogsClientProps) {
  const { logs, todaysLogs, members, handleLogSubmit, mutating } =
    useDepartmentData(department.id);
  const [view, setView] = useState<LogView>("today");
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));

  const displayedLogs = useMemo(
    () => (view === "today" ? todaysLogs : logs),
    [view, todaysLogs, logs],
  );

  const views: { value: LogView; label: string; count?: number }[] = [
    { value: "today", label: "Today", count: todaysLogs.length },
    { value: "all", label: "All logs", count: logs.length },
    { value: "weekly", label: "Weekly report" },
  ];

  return (
    <div className="space-y-6">
      <DailyLogForm
        onSubmit={handleLogSubmit}
        viewingDepartmentId={department.id}
        submitting={mutating}
      />

      <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 print:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        {views.map((v) => (
          <button
            key={v.value}
            type="button"
            onClick={() => setView(v.value)}
            className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              view === v.value
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {v.label}
            {v.count !== undefined ? ` (${v.count})` : ""}
          </button>
        ))}
      </div>

      {view === "weekly" ? (
        <WeeklyReport
          logs={logs}
          members={members}
          department={department}
          weekStart={weekStart}
          onWeekChange={setWeekStart}
        />
      ) : (
        <DailyLogsList
          logs={displayedLogs}
          title={view === "today" ? "Today's logs" : "All department logs"}
          subtitle={
            view === "today"
              ? `Updates from ${department.name} today`
              : `Full log history for ${department.name}`
          }
          emptyMessage={
            view === "today"
              ? "No logs yet today in this department."
              : "No logs yet for this department."
          }
          groupByDate={view === "all"}
        />
      )}
    </div>
  );
}
