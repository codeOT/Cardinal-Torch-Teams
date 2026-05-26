"use client";

import { useState } from "react";

import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/lib/auth-context";
import { formatMemberNames } from "@/lib/members";
import { useTeamData } from "@/lib/team-context";
import type { NewTaskInput, TaskStatus, TeamMember } from "@/lib/types";

interface AddTaskFormProps {
  onAddTask: (input: NewTaskInput) => Promise<void>;
  departmentId: string;
  members: TeamMember[];
}

function defaultDueDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

function defaultAssigneeIds(
  deptMembers: TeamMember[],
  currentUserId: string,
): string[] {
  const self = deptMembers.find((m) => m.id === currentUserId);
  if (self) return [self.id];
  return deptMembers[0] ? [deptMembers[0].id] : [];
}

export function AddTaskForm({
  onAddTask,
  departmentId,
  members,
}: AddTaskFormProps) {
  const { user } = useAuth();
  const { mutating } = useTeamData();
  const currentUserId = user?.id ?? "";

  const deptMembers = members.filter((m) => m.departmentId === departmentId);
  const defaultAssignees = defaultAssigneeIds(deptMembers, currentUserId);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeIds, setAssigneeIds] = useState<string[]>(defaultAssignees);
  const [status, setStatus] = useState<TaskStatus>("pending");
  const [dueDate, setDueDate] = useState(defaultDueDate);
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setTitle("");
    setDescription("");
    setAssigneeIds(defaultAssigneeIds(deptMembers, currentUserId));
    setStatus("pending");
    setDueDate(defaultDueDate());
  }

  function toggleAssignee(memberId: string) {
    setAssigneeIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle || assigneeIds.length === 0 || submitting || mutating) {
      return;
    }

    setSubmitting(true);
    try {
      await onAddTask({
        title: trimmedTitle,
        description: description.trim(),
        departmentId,
        assigneeIds,
        status,
        dueDate,
      });
      resetForm();
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  const includesSelf = assigneeIds.includes(currentUserId);
  const onlyOthers =
    assigneeIds.length > 0 &&
    assigneeIds.every((id) => id !== currentUserId);

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Add a task</h2>
          <p className="text-sm text-slate-500">
            Create a department task, assign one or more people, and set status.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {open ? "Cancel" : "New task"}
        </button>
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label
              htmlFor="task-title"
              className="mb-1 block text-xs font-medium text-slate-600"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
              disabled={submitting}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="task-description"
              className="mb-1 block text-xs font-medium text-slate-600"
            >
              Description
            </label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details, context, or acceptance criteria..."
              rows={3}
              disabled={submitting}
              className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-slate-600">
              Assign to <span className="text-red-500">*</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {deptMembers.map((m) => {
                const selected = assigneeIds.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleAssignee(m.id)}
                    disabled={submitting}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
                      selected
                        ? "border-indigo-300 bg-indigo-50 text-indigo-800"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Avatar member={m} size="sm" />
                    {m.name}
                    {m.id === currentUserId ? " (you)" : ""}
                  </button>
                );
              })}
            </div>
            {assigneeIds.length === 0 && (
              <p className="mt-1.5 text-xs text-amber-600">
                Select at least one assignee.
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="task-status"
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                Status
              </label>
              <select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                disabled={submitting}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
              >
                <option value="pending">Pending</option>
                <option value="ongoing">Ongoing</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="task-due"
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                Due date
              </label>
              <input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                disabled={submitting}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
              />
            </div>
          </div>

          {onlyOthers && (
            <p className="text-xs text-slate-500">
              Assigned to {formatMemberNames(assigneeIds, members)}. They can
              update the status after the task is created.
            </p>
          )}
          {includesSelf && assigneeIds.length > 1 && (
            <p className="text-xs text-slate-500">
              You and{" "}
              {formatMemberNames(
                assigneeIds.filter((id) => id !== currentUserId),
                members,
              )}{" "}
              can update this task&apos;s status.
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
              disabled={submitting}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !title.trim() || assigneeIds.length === 0 || submitting
              }
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
              {submitting ? "Creating..." : "Create task"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
