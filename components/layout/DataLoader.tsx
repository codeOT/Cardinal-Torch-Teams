"use client";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useTeamData } from "@/lib/team-context";

export function DataLoader({ children }: { children: React.ReactNode }) {
  const { loading, error, departments } = useTeamData();
  const isInitialLoad = loading && departments.length === 0;

  if (isInitialLoad) {
    return <LoadingSpinner label="Loading workspace..." />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return <>{children}</>;
}
