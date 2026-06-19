"use client";

import Link from "next/link";

import { CollaboratorAvatars } from "@/components/ui/CollaboratorAvatars";
import {
  filterTasksByDepartment,
  getMembersByDepartment,
  summarizeDepartmentTasks,
} from "@/lib/department-utils";
import { useAuth } from "@/lib/auth-context";
import { useTeamData } from "@/lib/team-context";

export function DepartmentsHome() {
  const { user } = useAuth();
  const { tasks, comments, departments, members } = useTeamData();

  if (departments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
        <p className="text-sm text-slate-600">No departments yet.</p>
        {user?.isAdmin ? (
          <Link
            href="/admin"
            className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Go to Admin to add a department →
          </Link>
        ) : (
          <p className="mt-2 text-xs text-slate-400">
            Ask an administrator to set up departments.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* <div>
        <h2 className="text-lg font-semibold text-slate-900">Departments</h2>
        <p className="mt-1 text-sm text-slate-500">
          Select a department to open its dashboard.
        </p>
      </div> */}

      <ul className="space-y-3">
        {departments.map((dept) => {
          const deptTasks = filterTasksByDepartment(tasks, dept.id);
          const summary = summarizeDepartmentTasks(deptTasks, comments);
          const deptMembers = getMembersByDepartment(members, dept.id);
          const memberIds = deptMembers.map((m) => m.id);

          return (
            <li key={dept.id}>
              <Link
                href={`/departments/${dept.slug}`}
                className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md sm:flex-row sm:items-center sm:gap-6 sm:p-6"
              >
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white sm:h-16 sm:w-16 sm:text-2xl"
                    style={{ backgroundColor: dept.color }}
                    aria-hidden
                  >
                    {dept.name.charAt(0)}
                  </div>

                  <h3 className="min-w-0 flex-1 truncate text-base font-semibold text-slate-900 group-hover:text-indigo-700 sm:min-w-[7rem] sm:flex-none sm:text-lg">
                    {dept.name}
                  </h3>

                  <div className="shrink-0 sm:hidden">
                    <CollaboratorAvatars
                      memberIds={memberIds}
                      maxVisible={3}
                      size="sm"
                    />
                  </div>
                </div>

                <DepartmentStats summary={summary} />

                <div className="hidden shrink-0 sm:flex">
                  <CollaboratorAvatars
                    memberIds={memberIds}
                    maxVisible={5}
                    size="sm"
                  />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function DepartmentStats({
  summary,
}: {
  summary: ReturnType<typeof summarizeDepartmentTasks>;
}) {
  return (
    <div
      className="flex w-full items-center justify-start gap-2 font-mono text-sm text-slate-700 sm:flex-1 sm:justify-center sm:gap-3 sm:text-base"
      aria-label={`${summary.total} total, ${summary.pending} pending, ${summary.delivered} delivered`}
    >
      <span className="font-semibold text-slate-900">{summary.total}</span>
      <span className="text-slate-300" aria-hidden>
        |
      </span>
      <StatChip label="p" value={summary.pending} className="text-amber-700" />
      <StatChip label="D" value={summary.delivered} className="text-emerald-700" />
    </div>
  );
}

function StatChip({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <span className={`inline-flex items-baseline gap-0.5 ${className}`}>
      <span className="text-xs font-medium uppercase text-slate-400 sm:text-sm">
        {label}
      </span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}
