"use client";

import { DailyLogsList } from "@/components/dashboard/DailyLogsList";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { TasksPanel } from "@/components/dashboard/TasksPanel";
import { TeamActivityFeed } from "@/components/dashboard/TeamActivityFeed";
import type { Department } from "@/lib/types";
import { getMembersByDepartment } from "@/lib/department-utils";
import { useDepartmentData } from "@/lib/team-context";

interface DepartmentDashboardClientProps {
  department: Department;
}

export function DepartmentDashboardClient({
  department,
}: DepartmentDashboardClientProps) {
  const {
    tasks,
    activities,
    comments,
    todaysLogs,
    members,
    handleTaskStatusChange,
    handleAddComment,
  } = useDepartmentData(department.id);

  const deptMembers = getMembersByDepartment(members, department.id);

  return (
    <div className="space-y-8">
      <StatsCards
        tasks={tasks}
        logs={todaysLogs}
        memberCount={deptMembers.length}
      />

      <TasksPanel
        tasks={tasks}
        comments={comments}
        onStatusChange={handleTaskStatusChange}
        onAddComment={handleAddComment}
      />

      <div className="grid gap-8 xl:grid-cols-2">
        <TeamActivityFeed activities={activities} />
        <DailyLogsList
          logs={todaysLogs}
          title="Today's logs"
          subtitle="Posted from task cards today"
          emptyMessage="No logs yet today. Use Daily log on a task to post an update."
        />
      </div>
    </div>
  );
}
