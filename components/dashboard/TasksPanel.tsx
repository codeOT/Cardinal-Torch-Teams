"use client";

import { useMemo, useState } from "react";

import { DailyLogModal } from "@/components/dashboard/DailyLogModal";
import { canPostDailyLog } from "@/components/dashboard/DailyLogForm";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TaskComments } from "@/components/dashboard/TaskComments";
import type { Task, TaskComment, TaskStatus, TeamMember } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { useTeamData } from "@/lib/team-context";
import { CollaboratorAvatars } from "@/components/ui/CollaboratorAvatars";
import {
  formatMemberNames,
  getMemberById,
  isTaskAssignee,
} from "@/lib/members";
import { formatDate } from "@/lib/utils";

const TASK_CARD_STATUS_STYLES: Record<TaskStatus, string> = {
  pending: "border-red-200 bg-red-200",
  ongoing: "border-yellow-200 bg-yellow-200",
  delivered: "border-green-200 bg-green-200",
};

const TASK_COLUMN_HEADER_STYLES: Record<TaskStatus, string> = {
  pending: "text-red-800",
  ongoing: "text-yellow-800",
  delivered: "text-green-800",
};

// const STATUS_OPTIONS: { value: TaskStatus | "all"; label: string }[] = [
//   { value: "all", label: "All" },
//   { value: "pending", label: "Pending" },
//   { value: "ongoing", label: "Ongoing" },
//   { value: "delivered", label: "Delivered" },
// ];

interface TasksPanelProps {
  tasks: Task[];
  comments: TaskComment[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onAddComment: (taskId: string, body: string) => void | Promise<void>;
}

export function TasksPanel({
  tasks,
  comments,
  onStatusChange,
  onAddComment,
}: TasksPanelProps) {
  const { handleLogSubmit, currentUser, members, mutating } = useTeamData();
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [logTask, setLogTask] = useState<Task | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return tasks;
    return tasks.filter((t) => t.status === filter);
  }, [tasks, filter]);

  const grouped = useMemo(() => {
    const order: TaskStatus[] = ["ongoing", "pending", "delivered"];
    if (filter !== "all") {
      return { [filter]: filtered };
    }
    return order.reduce(
      (acc, status) => {
        acc[status] = tasks.filter((t) => t.status === status);
        return acc;
      },
      {} as Record<TaskStatus, Task[]>,
    );
  }, [tasks, filtered, filter]);

  return (
    <>
    <DailyLogModal
      task={logTask}
      open={logTask !== null}
      onClose={() => setLogTask(null)}
      onSubmit={handleLogSubmit}
    />
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-900">Tasks at hand</h2>
            <p className="text-sm text-slate-500">
              Track team work by status. Use Daily log on a task to post updates.
              Assignees can change status; anyone can comment.
            </p>
          </div>
          <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
            {/* {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFilter(opt.value)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  filter === opt.value
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {opt.label}
              </button>
            ))} */}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {filter === "all" ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {(Object.keys(grouped) as TaskStatus[]).map((status) => (
              <TaskColumn
                key={status}
                status={status}
                tasks={grouped[status]}
                onStatusChange={onStatusChange}
                comments={comments}
                onAddComment={onAddComment}
                onOpenDailyLog={setLogTask}
                currentUserId={currentUser.id}
                members={members}
                mutating={mutating}
              />
            ))}
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={onStatusChange}
                comments={comments}
                onAddComment={onAddComment}
                onOpenDailyLog={setLogTask}
                currentUserId={currentUser.id}
                members={members}
                mutating={mutating}
              />
            ))}
            {filtered.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-400">
                No tasks in this status.
              </p>
            )}
          </ul>
        )}
      </div>
    </section>
    </>
  );
}

function TaskColumn({
  status,
  tasks,
  onStatusChange,
  comments,
  onAddComment,
  onOpenDailyLog,
  currentUserId,
  members,
  mutating,
}: {
  status: TaskStatus;
  tasks: Task[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  comments: TaskComment[];
  onAddComment: (taskId: string, body: string) => void | Promise<void>;
  onOpenDailyLog: (task: Task) => void;
  currentUserId: string;
  members: TeamMember[];
  mutating: boolean;
}) {
  const titles: Record<TaskStatus, string> = {
    pending: "Pending",
    ongoing: "Ongoing",
    delivered: "Delivered",
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3
          className={`text-sm font-semibold ${TASK_COLUMN_HEADER_STYLES[status]}`}
        >
          {titles[status]}
        </h3>
        <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200/80">
          {tasks.length}
        </span>
      </div>
      <ul className="space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onStatusChange={onStatusChange}
            comments={comments}
            onAddComment={onAddComment}
            onOpenDailyLog={onOpenDailyLog}
            currentUserId={currentUserId}
            members={members}
            mutating={mutating}
          />
        ))}
        {tasks.length === 0 && (
          <li className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
            None
          </li>
        )}
      </ul>
    </div>
  );
}

function TaskCard({
  task,
  onStatusChange,
  comments,
  onAddComment,
  onOpenDailyLog,
  currentUserId,
  members,
  mutating,
}: {
  task: Task;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  comments: TaskComment[];
  onAddComment: (taskId: string, body: string) => void | Promise<void>;
  onOpenDailyLog: (task: Task) => void;
  currentUserId: string;
  members: TeamMember[];
  mutating: boolean;
}) {
  const { user } = useAuth();
  const isAssignee = isTaskAssignee(task, currentUserId);
  const assigneeLabel = formatMemberNames(task.assigneeIds, members);
  const creator = getMemberById(members, task.createdById);
  const isCreator = task.createdById === currentUserId;
  const canLog = canPostDailyLog(user, task.departmentId);

  return (
    <li
      className={`rounded-lg border p-3 sm:p-4 ${TASK_CARD_STATUS_STYLES[task.status]} ${
        isAssignee ? "ring-2 ring-indigo-300/60 ring-offset-1" : ""
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-medium text-slate-900 break-words">{task.title}</h4>
          {creator && (
            <p className="mt-0.5 text-xs text-slate-500">
              Created by{" "}
              <span className="font-medium text-slate-700">
                {creator.name}
                {isCreator && (
                  <span className="font-normal text-indigo-600"> (you)</span>
                )}
              </span>
            </p>
          )}
        </div>
        <StatusBadge status={task.status} size="sm" />
      </div>
      <p className="mb-3 text-xs leading-relaxed text-slate-600">
        {task.description}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Assignees
          </p>
          <div className="mt-1 flex items-center gap-2">
            <CollaboratorAvatars memberIds={task.assigneeIds} />
            <span className="min-w-0 truncate text-xs text-slate-500">
              {assigneeLabel}
              {isAssignee && (
                <span className="ml-1 font-medium text-indigo-600">(you)</span>
              )}
            </span>
          </div>
        </div>
        <span className="shrink-0 text-xs text-slate-400 sm:text-right">
          Due {formatDate(task.dueDate)}
        </span>
      </div>
      {isAssignee ? (
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
          disabled={mutating}
          className="mt-3 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
          aria-label={`Change status for ${task.title}`}
        >
          <option value="pending">Pending</option>
          <option value="ongoing">Ongoing</option>
          <option value="delivered">Delivered</option>
        </select>
      ) : (
        <p className="mt-3 text-xs text-slate-400">
          Only {assigneeLabel} can update this task.
        </p>
      )}

      {canLog && (
        <button
          type="button"
          onClick={() => onOpenDailyLog(task)}
          className="mt-3 w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-50"
        >
          Daily log
        </button>
      )}

      <TaskComments
        taskId={task.id}
        comments={comments}
        onAddComment={onAddComment}
      />
    </li>
  );
}
