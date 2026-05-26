"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthCard } from "@/components/auth/AuthCard";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { apiGet } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import type { Department } from "@/lib/types";

export default function SignUpPage() {
  const router = useRouter();
  const { signup, loading: authLoading } = useAuth();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<{ departments: Department[] }>("/api/auth/departments")
      .then((data) => {
        setDepartments(data.departments);
        if (data.departments.length === 1) {
          setDepartmentId(data.departments[0].id);
        }
      })
      .catch(() => setError("Could not load departments"))
      .finally(() => setLoadingDepts(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!departmentId) {
      setError("Select a department");
      return;
    }

    setSubmitting(true);
    try {
      await signup({
        name,
        email,
        password,
        role: role.trim() || undefined,
        departmentId,
      });
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <AuthPageShell>
        <LoadingSpinner label="Checking session..." />
      </AuthPageShell>
    );
  }

  const noDepartments = !loadingDepts && departments.length === 0;

  return (
    <AuthPageShell>
      <AuthCard
        title="Team Center"
        subtitle="Create your account"
        footer={
          <p className="text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-700"
            >
              Sign in
            </Link>
          </p>
        }
      >
        {loadingDepts ? (
          <LoadingSpinner label="Loading departments..." className="py-4" />
        ) : noDepartments ? (
          <p className="rounded-lg bg-amber-50 px-3 py-3 text-sm text-amber-800">
            No departments are available yet. Ask an administrator to add
            departments before you can sign up.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                Full name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                disabled={submitting}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="signup-email"
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={submitting}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                Job title
              </label>
              <input
                id="role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Designer"
                autoComplete="organization-title"
                disabled={submitting}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="department"
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                Department <span className="text-red-500">*</span>
              </label>
              <select
                id="department"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                required
                disabled={submitting}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
              >
                <option value="">Select a department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="signup-password"
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                disabled={submitting}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
              />
              <p className="mt-1 text-xs text-slate-400">At least 8 characters</p>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                Confirm password <span className="text-red-500">*</span>
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                disabled={submitting}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
              {submitting ? "Creating account..." : "Sign up"}
            </button>
          </form>
        )}
      </AuthCard>
    </AuthPageShell>
  );
}
