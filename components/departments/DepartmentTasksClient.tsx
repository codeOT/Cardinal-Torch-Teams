"use client";

import { TasksPanel } from "@/components/dashboard/TasksPanel";
import { AddTaskForm } from "@/components/tasks/AddTaskForm";
import { TaskStatsSummary } from "@/components/tasks/TaskStatsSummary";
import type { Department } from "@/lib/types";
import { useDepartmentData } from "@/lib/team-context";
import { getMembersByDepartment } from "@/lib/department-utils";

interface DepartmentTasksClientProps {
  department: Department;
}

export function DepartmentTasksClient({
  department,
}: DepartmentTasksClientProps) {
  const {
    tasks,
    comments,
    members,
    handleTaskStatusChange,
    handleAddTask,
    handleAddComment,
  } = useDepartmentData(department.id);

  const deptMembers = getMembersByDepartment(members, department.id);

  return (
    <div className="space-y-6">
      <AddTaskForm
        onAddTask={handleAddTask}
        departmentId={department.id}
        members={deptMembers}
      />
      <TaskStatsSummary tasks={tasks} />
      <TasksPanel
        tasks={tasks}
        comments={comments}
        onStatusChange={handleTaskStatusChange}
        onAddComment={handleAddComment}
      />
    </div>
  );
}
