import type { Task } from "@/lib/types";

interface TaskStatsSummaryProps {
  tasks: Task[];
}

export function TaskStatsSummary({ tasks }: TaskStatsSummaryProps) {
  const pending = tasks.filter((t) => t.status === "pending").length;
  const ongoing = tasks.filter((t) => t.status === "ongoing").length;
  const delivered = tasks.filter((t) => t.status === "delivered").length;

  const stats = [
    { label: "Total", value: tasks.length, className: "text-slate-900" },
    { label: "Pending", value: pending, className: "text-amber-700" },
    { label: "Ongoing", value: ongoing, className: "text-sky-700" },
    { label: "Delivered", value: delivered, className: "text-emerald-700" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {stat.label}
          </p>
          <p className={`mt-1 text-2xl font-semibold ${stat.className}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
