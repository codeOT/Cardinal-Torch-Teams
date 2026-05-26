import { Activity } from "@/lib/db/models/Activity";
import type { TaskStatus } from "@/lib/types";

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function createActivity(input: {
  memberId: string;
  departmentId: string;
  type: "log" | "task_update" | "task_created" | "task_comment";
  message: string;
  meta?: {
    taskStatus?: TaskStatus;
    imageUrl?: string;
    taskId?: string;
    taskTitle?: string;
  };
}) {
  const now = new Date().toISOString();
  return Activity.create({
    activityId: newId("a"),
    memberId: input.memberId,
    departmentId: input.departmentId,
    type: input.type,
    message: input.message,
    timestamp: now,
    meta: input.meta,
  });
}
