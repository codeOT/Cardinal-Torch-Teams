import type { TaskStatus } from "@/lib/types";

const config: Record<
  TaskStatus,
  { label: string; className: string; dot: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-red-100 text-red-800 ring-red-200",
    dot: "bg-red-500",
  },
  ongoing: {
    label: "Ongoing",
    className: "bg-yellow-100 text-yellow-800 ring-yellow-200",
    dot: "bg-yellow-500",
  },
  delivered: {
    label: "Delivered",
    className: "bg-green-100 text-green-800 ring-green-200",
    dot: "bg-green-500",
  },
};

interface StatusBadgeProps {
  status: TaskStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const { label, className, dot } = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ring-1 ring-inset ${className} ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
