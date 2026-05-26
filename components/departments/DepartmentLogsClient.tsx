"use client";

import { useMemo, useState } from "react";

import { DailyLogsList } from "@/components/dashboard/DailyLogsList";
import type { Department } from "@/lib/types";
import { useDepartmentData } from "@/lib/team-context";

type LogFilter = "today" | "all";

interface DepartmentLogsClientProps {
  department: Department;
}

export function DepartmentLogsClient({ department }: DepartmentLogsClientProps) {
  const { logs, todaysLogs } = useDepartmentData(department.id);
  const [filter, setFilter] = useState<LogFilter>("today");

  const displayedLogs = useMemo(
    () => (filter === "today" ? todaysLogs : logs),
    [filter, todaysLogs, logs],
  );

  const filters: { value: LogFilter; label: string; count: number }[] = [
    { value: "today", label: "Today", count: todaysLogs.length },
    { value: "all", label: "All logs", count: logs.length },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        Post daily logs from the <strong>Daily log</strong> button on any task in
        your department.
      </p>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f.value
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      <DailyLogsList
        logs={displayedLogs}
        title={filter === "today" ? "Today's logs" : "All department logs"}
        subtitle={
          filter === "today"
            ? `Updates from ${department.name} today`
            : `Full log history for ${department.name}`
        }
        emptyMessage={
          filter === "today"
            ? "No logs yet today in this department."
            : "No logs yet for this department."
        }
        groupByDate={filter === "all"}
      />
    </div>
  );
}
