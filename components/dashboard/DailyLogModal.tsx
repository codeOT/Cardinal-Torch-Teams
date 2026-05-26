"use client";

import { useState } from "react";

import {
  DailyLogForm,
  type DailyLogSubmitInput,
} from "@/components/dashboard/DailyLogForm";
import type { Task } from "@/lib/types";

interface DailyLogModalProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (input: DailyLogSubmitInput) => Promise<void>;
}

export function DailyLogModal({
  task,
  open,
  onClose,
  onSubmit,
}: DailyLogModalProps) {
  const [submitting, setSubmitting] = useState(false);

  if (!open || !task) return null;

  async function handleSubmit(input: DailyLogSubmitInput) {
    setSubmitting(true);
    try {
      await onSubmit(input);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="daily-log-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50"
        onClick={onClose}
        disabled={submitting}
        aria-label="Close daily log"
      />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <h2
            id="daily-log-modal-title"
            className="text-base font-semibold text-slate-900"
          >
            Daily log
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-60"
            aria-label="Close"
          >
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>
        <div className="p-5">
          <DailyLogForm
            onSubmit={handleSubmit}
            viewingDepartmentId={task.departmentId}
            taskId={task.id}
            taskTitle={task.title}
            embedded
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
}
