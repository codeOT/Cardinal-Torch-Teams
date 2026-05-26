"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Avatar } from "@/components/ui/Avatar";
import {
  getDepartmentNavItems,
  getDepartmentSlugFromPath,
} from "@/lib/department-utils";
import { useAuth } from "@/lib/auth-context";
import { useTeamData } from "@/lib/team-context";

interface SidebarProps {
  mobileOpen?: boolean;
  onNavigate?: () => void;
}

export function Sidebar({ mobileOpen = false, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { departments } = useTeamData();
  const [signingOut, setSigningOut] = useState(false);
  const deptSlug = getDepartmentSlugFromPath(pathname);
  const department = deptSlug
    ? departments.find((d) => d.slug === deptSlug)
    : null;

  const isHome = pathname === "/";
  const isAdminRoute = pathname.startsWith("/admin");
  const homeHref = user?.isAdmin ? "/admin" : "/";

  const linkClass = (active: boolean) =>
    `block w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      active
        ? "bg-indigo-50 text-indigo-700"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`;

  async function handleLogout() {
    setSigningOut(true);
    try {
      await logout();
      router.replace("/login");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 max-w-[85vw] flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-out lg:static lg:z-auto lg:max-w-none lg:translate-x-0 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-5">
        <Link
          href={homeHref}
          className="flex min-w-0 items-center gap-2.5"
          onClick={onNavigate}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            TC
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              Team Center
            </p>
            <p className="truncate text-xs text-slate-500">
              {isAdminRoute
                ? "Administration"
                : department
                  ? department.name
                  : "Collaboration hub"}
            </p>
          </div>
        </Link>
        <button
          type="button"
          onClick={onNavigate}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
          aria-label="Close menu"
        >
          <span className="text-xl leading-none">&times;</span>
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-slate-400">
          Menu
        </p>
        <ul className="space-y-0.5">
          {user?.isAdmin ? (
            <>
              <li>
                <Link
                  href="/admin"
                  className={linkClass(isAdminRoute)}
                  onClick={onNavigate}
                >
                  Admin
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className={linkClass(isHome)}
                  onClick={onNavigate}
                >
                  Departments
                </Link>
              </li>
            </>
          ) : (
            <li>
              <Link
                href="/"
                className={linkClass(isHome)}
                onClick={onNavigate}
              >
                Departments
              </Link>
            </li>
          )}

          {department &&
            getDepartmentNavItems(department).map((item) => {
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={linkClass(isActive)}
                    onClick={onNavigate}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
        </ul>

        {!department && (
          <>
            <p className="mb-2 mt-6 px-2 text-xs font-medium uppercase tracking-wider text-slate-400">
              Quick access
            </p>
            <ul className="space-y-0.5">
              {departments.map((dept) => (
                <li key={dept.id}>
                  <Link
                    href={`/departments/${dept.slug}`}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                    onClick={onNavigate}
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: dept.color }}
                    />
                    {dept.name}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>

      {user && (
        <div className="shrink-0 border-t border-slate-200 p-4">
          <div className="flex items-center gap-2.5">
            <Avatar member={user} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">
                {user.name}
              </p>
              <p className="truncate text-xs text-slate-500">{user.role}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={signingOut}
            className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
          >
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      )}
    </aside>
  );
}
