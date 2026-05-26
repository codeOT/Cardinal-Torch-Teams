"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { apiGet, apiPatch, apiPost } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { isTaskAssignee } from "@/lib/members";
import type {
  Activity,
  DailyLog,
  Department,
  NewTaskInput,
  Task,
  TaskComment,
  TaskStatus,
  TeamMember,
} from "@/lib/types";

interface WorkspaceData {
  departments: Department[];
  members: TeamMember[];
  tasks: Task[];
  logs: DailyLog[];
  comments: TaskComment[];
  activities: Activity[];
}

interface TeamDataContextValue extends WorkspaceData {
  loading: boolean;
  mutating: boolean;
  error: string | null;
  currentUser: TeamMember;
  todaysLogs: DailyLog[];
  refresh: () => Promise<void>;
  handleLogSubmit: (input: {
    summary: string;
    taskId?: string;
    taskTitle?: string;
    imageUrl?: string;
  }) => Promise<void>;
  handleTaskStatusChange: (taskId: string, status: TaskStatus) => Promise<void>;
  handleAddTask: (input: NewTaskInput) => Promise<void>;
  handleAddComment: (taskId: string, body: string) => Promise<void>;
}

const TeamDataContext = createContext<TeamDataContextValue | null>(null);

const empty: WorkspaceData = {
  departments: [],
  members: [],
  tasks: [],
  logs: [],
  comments: [],
  activities: [],
};

export function TeamDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [data, setData] = useState<WorkspaceData>(empty);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const workspace = await apiGet<WorkspaceData & { currentUser: TeamMember }>(
        "/api/workspace",
      );
      setData({
        departments: workspace.departments,
        members: workspace.members,
        tasks: workspace.tasks,
        logs: workspace.logs,
        comments: workspace.comments,
        activities: workspace.activities,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refresh();
    } else {
      setData(empty);
      setLoading(false);
    }
  }, [user, refresh]);

  const today = new Date().toISOString().slice(0, 10);
  const todaysLogs = useMemo(
    () => data.logs.filter((l) => l.date === today),
    [data.logs, today],
  );

  const runMutation = useCallback(
    async (fn: () => Promise<void>) => {
      setMutating(true);
      setError(null);
      try {
        await fn();
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Action failed");
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [refresh],
  );

  const handleLogSubmit = useCallback(
    async (input: {
      summary: string;
      taskId?: string;
      taskTitle?: string;
      imageUrl?: string;
    }) => {
      if (!user) return;
      await runMutation(async () => {
        await apiPost("/api/logs", input);
      });
    },
    [runMutation, user],
  );

  const handleTaskStatusChange = useCallback(
    async (taskId: string, status: TaskStatus) => {
      if (!user) return;
      const task = data.tasks.find((t) => t.id === taskId);
      if (!task || !isTaskAssignee(task, user.id)) return;

      await runMutation(async () => {
        await apiPatch(`/api/tasks/${taskId}`, { status });
      });
    },
    [data.tasks, runMutation, user],
  );

  const handleAddTask = useCallback(
    async (input: NewTaskInput) => {
      if (!user) return;
      await runMutation(async () => {
        await apiPost("/api/tasks", input);
      });
    },
    [runMutation, user],
  );

  const handleAddComment = useCallback(
    async (taskId: string, body: string) => {
      if (!user) return;
      await runMutation(async () => {
        await apiPost("/api/comments", { taskId, body });
      });
    },
    [runMutation, user],
  );

  if (!user) {
    return null;
  }

  const value: TeamDataContextValue = {
    ...data,
    loading,
    mutating,
    error,
    currentUser: user,
    todaysLogs,
    refresh,
    handleLogSubmit,
    handleTaskStatusChange,
    handleAddTask,
    handleAddComment,
  };

  return (
    <TeamDataContext.Provider value={value}>{children}</TeamDataContext.Provider>
  );
}

export function useTeamData() {
  const ctx = useContext(TeamDataContext);
  if (!ctx) {
    throw new Error("useTeamData must be used within TeamDataProvider");
  }
  return ctx;
}

export function useDepartmentData(departmentId: string) {
  const data = useTeamData();
  const today = new Date().toISOString().slice(0, 10);

  return useMemo(() => {
    const tasks = data.tasks.filter((t) => t.departmentId === departmentId);
    const logs = data.logs.filter((l) => l.departmentId === departmentId);
    const activities = data.activities.filter(
      (a) => a.departmentId === departmentId,
    );
    const todaysLogs = logs.filter((l) => l.date === today);
    const taskIds = new Set(tasks.map((t) => t.id));
    const comments = data.comments.filter((c) => taskIds.has(c.taskId));

    return {
      ...data,
      tasks,
      logs,
      activities,
      comments,
      todaysLogs,
    };
  }, [data, departmentId, today]);
}
