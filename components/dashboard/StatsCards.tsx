import type { DailyLog, Task } from "@/lib/types";

interface StatsCardsProps {
  tasks: Task[];
  logs: DailyLog[];
  memberCount: number;
}

export function StatsCards({ tasks, logs, memberCount }: StatsCardsProps) {
  const pending = tasks.filter((t) => t.status === "pending").length;
  const ongoing = tasks.filter((t) => t.status === "ongoing").length;
  const delivered = tasks.filter((t) => t.status === "delivered").length;

  const stats = [
    { label: "Team members", value: memberCount, hint: "Active in workspace" },
    { label: "Logs today", value: logs.length, hint: "Daily updates posted" },
    { label: "Ongoing tasks", value: ongoing, hint: "In progress now" },
    { label: "Pending", value: pending, hint: "Awaiting start" },
    { label: "Delivered", value: delivered, hint: "Completed this sprint" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {stat.label}
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{stat.value}</p>
          <p className="mt-0.5 text-xs text-slate-400">{stat.hint}</p>
        </div>
      ))}
    </div>
  );
}
