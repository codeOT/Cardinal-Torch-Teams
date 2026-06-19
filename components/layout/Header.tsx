"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getDepartmentSlugFromPath } from "@/lib/department-utils";
import { useTeamData } from "@/lib/team-context";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const { departments } = useTeamData();
  const deptSlug = getDepartmentSlugFromPath(pathname);
  const department = deptSlug
    ? departments.find((d) => d.slug === deptSlug)
    : null;
  const isAdmin = pathname.startsWith("/admin");

  const isTasks = deptSlug !== null && pathname.endsWith("/tasks");
  const isLogs = deptSlug !== null && pathname.endsWith("/logs");
  const deptLabel =
    department?.name ??
    (deptSlug
      ? deptSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : null);

  let title = "Departments";
  let description =
    "Choose a department to view its dashboard, tasks, and daily logs.";

  if (isAdmin) {
    title = "Admin";
    description = "Manage organization departments.";
  } else if (deptLabel && deptSlug) {
    if (isTasks) {
      title = `${deptLabel} — Tasks`;
      description =
        "Create and manage department tasks. Assignees update their own work.";
    } else if (isLogs) {
      title = `${deptLabel} — Daily logs`;
      description =
        "Post daily logs and view your personal weekly report.";
    } else if (pathname === `/departments/${deptSlug}`) {
      title = `${deptLabel} dashboard`;
      description = department?.description ?? "Department overview.";
    }
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="shrink-0 border-b border-slate-200 bg-white px-3 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5">
      <div className="flex items-start gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="-ml-1 rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          aria-label="Open menu"
        >
          <HamburgerIcon />
        </button>

        <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            {deptSlug && pathname !== `/departments/${deptSlug}` && (
              <Link
                href={`/departments/${deptSlug}`}
                className="mb-1 inline-block text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                ← Back to {deptLabel} dashboard
              </Link>
            )}
            {!deptSlug && !isAdmin && (
              <p className="mb-1 text-xs font-medium text-slate-400">
                Cardinal Torch company limited organization overview
              </p>
            )}
            <h1 className="line-clamp-2 text-lg font-semibold tracking-tight text-slate-900 sm:text-2xl">
              {title}
            </h1>
            <p className="mt-0.5 line-clamp-3 text-sm text-slate-500">{description}</p>
          </div>
          <p className="hidden shrink-0 text-sm font-medium text-slate-600 sm:block">
            {today}
          </p>
        </div>
      </div>
      <p className="mt-2 text-xs font-medium text-slate-500 sm:hidden">{today}</p>
    </header>
  );
}

function HamburgerIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
      />
    </svg>
  );
}
