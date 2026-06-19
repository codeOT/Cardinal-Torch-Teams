"use client";

import { useMemo, useState } from "react";

import { Avatar } from "@/components/ui/Avatar";
import { getMemberById } from "@/lib/members";
import { useTeamData } from "@/lib/team-context";
import type { TaskComment } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";

interface TaskCommentsProps {
  taskId: string;
  comments: TaskComment[];
  onAddComment: (taskId: string, body: string) => void;
}

export function TaskComments({
  taskId,
  comments,
  onAddComment,
}: TaskCommentsProps) {
  const { members, mutating } = useTeamData();
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

  const taskComments = useMemo(
    () =>
      [...comments]
        .filter((c) => c.taskId === taskId)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
    [comments, taskId],
  );

  const count = taskComments.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || posting || mutating) return;

    setPosting(true);
    try {
      await onAddComment(taskId, trimmed);
      setDraft("");
      setExpanded(true);
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="mt-3 border-t border-slate-200 pt-3">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between text-left text-xs font-medium text-slate-600 hover:text-slate-900"
        aria-expanded={expanded}
      >
        <span>Comments {count > 0 && `(${count})`}</span>
        <span className="text-slate-400">{expanded ? "−" : "+"}</span>
      </button>

      {expanded && (
        <div className="mt-2 space-y-3">
          {taskComments.length > 0 ? (
            <ul className="space-y-2.5">
              {taskComments.map((comment) => {
                const author = getMemberById(members, comment.memberId);
                if (!author) return null;

                return (
                  <li
                    key={comment.id}
                    className="flex gap-2 rounded-md bg-white/80 px-2 py-2"
                  >
                    <Avatar member={author} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="text-xs font-semibold text-slate-800">
                          {author.name}
                        </span>
                        <time
                          className="text-[10px] text-slate-400"
                          dateTime={comment.createdAt}
                        >
                          {formatRelativeTime(comment.createdAt)}
                        </time>
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                        {comment.body}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">No comments yet.</p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add a comment..."
              disabled={posting || mutating}
              className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60 sm:py-1.5"
            />
            <button
              type="submit"
              disabled={!draft.trim() || posting || mutating}
              className="shrink-0 rounded-md bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-2.5 sm:py-1.5"
            >
              {posting ? "..." : "Post"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
