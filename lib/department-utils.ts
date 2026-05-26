import type {
  Activity,
  DailyLog,
  Department,
  Task,
  TaskComment,
  TaskStatus,
  TeamMember,
} from "@/lib/types";

export function getDepartmentSlugFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/departments\/([^/]+)/);
  return match?.[1] ?? null;
}

export function filterTasksByDepartment(tasks: Task[], departmentId: string) {
  return tasks.filter((t) => t.departmentId === departmentId);
}

export function filterLogsByDepartment(logs: DailyLog[], departmentId: string) {
  return logs.filter((l) => l.departmentId === departmentId);
}

export function filterActivitiesByDepartment(
  activities: Activity[],
  departmentId: string,
) {
  return activities.filter((a) => a.departmentId === departmentId);
}

export function getMembersByDepartment(
  members: TeamMember[],
  departmentId: string,
) {
  return members.filter((m) => m.departmentId === departmentId);
}

export function countTasksByStatus(tasks: Task[], status: TaskStatus) {
  return tasks.filter((t) => t.status === status).length;
}

export interface OngoingProjectSummary {
  id: string;
  title: string;
  collaboratorIds: string[];
}

export interface DepartmentTaskSummary {
  total: number;
  pending: number;
  ongoing: number;
  delivered: number;
  ongoingProjects: OngoingProjectSummary[];
}

export function getTaskCollaboratorIds(
  task: Task,
  comments: TaskComment[],
): string[] {
  const ids = new Set<string>(task.assigneeIds);
  for (const comment of comments) {
    if (comment.taskId === task.id) {
      ids.add(comment.memberId);
    }
  }
  return [...ids];
}

export function summarizeDepartmentTasks(
  tasks: Task[],
  comments: TaskComment[] = [],
): DepartmentTaskSummary {
  const pending = countTasksByStatus(tasks, "pending");
  const ongoing = countTasksByStatus(tasks, "ongoing");
  const delivered = countTasksByStatus(tasks, "delivered");

  const ongoingProjects = tasks
    .filter((t) => t.status === "ongoing")
    .slice(0, 3)
    .map((task) => ({
      id: task.id,
      title: task.title,
      collaboratorIds: getTaskCollaboratorIds(task, comments),
    }));

  return {
    total: tasks.length,
    pending,
    ongoing,
    delivered,
    ongoingProjects,
  };
}

export function getDepartmentNavItems(department: Department) {
  const base = `/departments/${department.slug}`;
  return [
    { href: base, label: "Dashboard", segment: "dashboard" as const },
    { href: `${base}/tasks`, label: "Tasks", segment: "tasks" as const },
    { href: `${base}/logs`, label: "Daily logs", segment: "logs" as const },
  ];
}
