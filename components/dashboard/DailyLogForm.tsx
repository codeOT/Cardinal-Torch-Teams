"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/lib/auth-context";
import type { TeamMember } from "@/lib/types";

export interface DailyLogSubmitInput {
  summary: string;
  taskId?: string;
  taskTitle?: string;
  imageUrl?: string;
}

interface DailyLogFormProps {
  onSubmit: (input: DailyLogSubmitInput) => Promise<void>;
  viewingDepartmentId?: string;
  taskId?: string;
  taskTitle?: string;
  embedded?: boolean;
  submitting?: boolean;
}

export function canPostDailyLog(
  member: TeamMember | null,
  viewingDepartmentId?: string,
): boolean {
  if (!member) return false;
  if (!viewingDepartmentId) return true;
  return viewingDepartmentId === member.departmentId;
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function DailyLogForm({
  onSubmit,
  viewingDepartmentId,
  taskId,
  taskTitle,
  embedded = false,
  submitting = false,
}: DailyLogFormProps) {
  const { user: member } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [summary, setSummary] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  if (!member) return null;

  const mayPost = canPostDailyLog(member, viewingDepartmentId);
  const inputId = `log-image-${member.departmentId}-${taskId ?? "general"}`;

  const blockedMessage = (
    <p className="text-sm text-slate-500">
      You can only post daily logs for your own department.
    </p>
  );

  if (!mayPost) {
    if (embedded) return blockedMessage;
    return (
      <section className="rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
        <div className="px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">Log your day</h2>
          {blockedMessage}
        </div>
      </section>
    );
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreviewUrl(null);
      setImageFile(null);
      setFileName(null);
      return;
    }
    setFileName(file.name);
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }

  function clearImage() {
    setPreviewUrl(null);
    setImageFile(null);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = summary.trim();
    if (!trimmed || submitting) return;

    let imageUrl: string | undefined;
    if (imageFile) {
      imageUrl = await fileToDataUrl(imageFile);
    }

    await onSubmit({
      summary: trimmed,
      taskId,
      taskTitle,
      imageUrl,
    });

    setSummary("");
    clearImage();
  }

  const formContent = (
    <form onSubmit={handleSubmit}>
      {taskTitle && (
        <p className="mb-3 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-800">
          Logging progress for{" "}
          <span className="font-semibold">{taskTitle}</span>
        </p>
      )}
      <div className="mb-3 flex items-center gap-2.5">
        <Avatar member={member} size="sm" />
        <span className="text-sm font-medium text-slate-700">{member.name}</span>
      </div>

      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder={
          taskTitle
            ? "What did you work on for this task today?"
            : "What did you work on today?"
        }
        rows={4}
        disabled={submitting}
        className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
      />

      {previewUrl && (
        <div className="relative mt-3 h-40 w-full overflow-hidden rounded-lg border border-slate-200">
          <Image
            src={previewUrl}
            alt="Upload preview"
            fill
            className="object-cover"
            unoptimized
          />
          <button
            type="button"
            onClick={clearImage}
            disabled={submitting}
            className="absolute right-2 top-2 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white hover:bg-black/80 disabled:opacity-60"
          >
            Remove
          </button>
        </div>
      )}

      {fileName && !previewUrl && (
        <p className="mt-2 text-xs text-slate-500">Selected: {fileName}</p>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <label
          htmlFor={inputId}
          className={`w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 sm:w-auto ${
            submitting ? "pointer-events-none opacity-60" : ""
          }`}
        >
          Attach photo
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={submitting}
          className="hidden"
          id={inputId}
        />
        <button
          type="submit"
          disabled={!summary.trim() || submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {submitting && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          )}
          {submitting ? "Posting..." : "Post update"}
        </button>
      </div>
    </form>
  );

  if (embedded) {
    return formContent;
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
        <h2 className="text-base font-semibold text-slate-900">Log your day</h2>
        <p className="text-sm text-slate-500">
          Share what you worked on today with your team.
        </p>
      </div>
      <div className="p-4 sm:p-5">{formContent}</div>
    </section>
  );
}
