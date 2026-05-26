"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { apiGet, apiPost } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useTeamData } from "@/lib/team-context";
import type { Department } from "@/lib/types";

const DEFAULT_COLOR = "#4f46e5";

export function AdminPanel() {
  const router = useRouter();
  const { user } = useAuth();
  const { refresh } = useTeamData();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);

  const loadDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<{ departments: Department[] }>(
        "/api/admin/departments",
      );
      setDepartments(data.departments);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load departments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.isAdmin) {
      loadDepartments();
    }
  }, [user?.isAdmin, loadDepartments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || submitting) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await apiPost<{ department: Department }>(
        "/api/admin/departments",
        {
          name: trimmedName,
          description: description.trim(),
          color,
        },
      );

      setDepartments((prev) =>
        [...prev, data.department].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setName("");
      setDescription("");
      setColor(DEFAULT_COLOR);
      setSuccess(`"${data.department.name}" was created.`);
      await refresh();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create department");
    } finally {
      setSubmitting(false);
    }
  }

  if (!user?.isAdmin) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-6 text-sm text-amber-800">
        You do not have permission to access the admin panel.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            Add department
          </h2>
          <p className="text-sm text-slate-500">
            New departments appear on the home page for all team members.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label
              htmlFor="dept-name"
              className="mb-1 block text-xs font-medium text-slate-600"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="dept-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Human Resources"
              required
              disabled={submitting}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="dept-description"
              className="mb-1 block text-xs font-medium text-slate-600"
            >
              Description
            </label>
            <textarea
              id="dept-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this department does..."
              rows={3}
              disabled={submitting}
              className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="dept-color"
              className="mb-1 block text-xs font-medium text-slate-600"
            >
              Brand color
            </label>
            <div className="flex items-center gap-3">
              <input
                id="dept-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                disabled={submitting}
                className="h-10 w-14 cursor-pointer rounded border border-slate-200 bg-white disabled:opacity-60"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                pattern="^#[0-9A-Fa-f]{6}$"
                disabled={submitting}
                className="w-28 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={!name.trim() || submitting}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            )}
            {submitting ? "Creating..." : "Create department"}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            All departments
          </h2>
          <p className="text-sm text-slate-500">
            {departments.length} department{departments.length === 1 ? "" : "s"}{" "}
            in the workspace
          </p>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading departments..." className="py-8" />
        ) : departments.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-400">
            No departments yet. Create one above to get started.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {departments.map((dept) => (
              <li
                key={dept.id}
                className="flex items-center gap-4 px-5 py-4"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: dept.color }}
                >
                  {dept.name.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{dept.name}</p>
                  <p className="text-xs text-slate-500">/{dept.slug}</p>
                  {dept.description && (
                    <p className="mt-1 text-sm text-slate-600">
                      {dept.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
