"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

import { AuthCard } from "@/components/auth/AuthCard";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { getPostAuthPath } from "@/lib/auth/redirect";
import { useAuth } from "@/lib/auth-context";

function LoginForm() {
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const from = searchParams.get("from");
  const isAdminLogin = from === "/admin" || from?.startsWith("/admin/");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const signedIn = await login(email, password);
      const destination = getPostAuthPath(signedIn.isAdmin, from);

      if (!signedIn.isAdmin && isAdminLogin) {
        setError(
          "This account is not an administrator. Use an admin account or run npm run ensure-admin.",
        );
        setSubmitting(false);
        return;
      }

      // Full navigation so the session cookie is applied before /admin loads
      window.location.href = destination;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Team Center"
      subtitle={
        isAdminLogin
          ? "Administrator sign in — you will be taken to /admin"
          : "Sign in to your workspace"
      }
      footer={
        <p className="text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            Sign up
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
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
          {submitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
    </AuthCard>
  );
}

export default function LoginPage() {
  const { loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <AuthPageShell>
        <LoadingSpinner label="Checking session..." />
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell>
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <LoadingSpinner label="Loading..." />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthPageShell>
  );
}
