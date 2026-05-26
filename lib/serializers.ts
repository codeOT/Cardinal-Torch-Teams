import type { UserDocument } from "@/lib/db/models/User";
import type { DepartmentDocument } from "@/lib/db/models/Department";
import type { TaskDocument } from "@/lib/db/models/Task";
import type { DailyLogDocument } from "@/lib/db/models/DailyLog";
import type { TaskCommentDocument } from "@/lib/db/models/TaskComment";
import type { ActivityDocument } from "@/lib/db/models/Activity";
import type {
  Activity,
  DailyLog,
  Department,
  Task,
  TaskComment,
  TeamMember,
} from "@/lib/types";

export function serializeUser(doc: UserDocument): TeamMember {
  return {
    id: doc.memberId,
    name: doc.name,
    role: doc.role,
    departmentId: doc.departmentId,
    avatarColor: doc.avatarColor,
    initials: doc.initials,
    isOnline: doc.isOnline ?? false,
    isAdmin: doc.isAdmin ?? false,
  };
}

export function serializeDepartment(doc: DepartmentDocument): Department {
  return {
    id: doc.departmentId,
    slug: doc.slug,
    name: doc.name,
    description: doc.description,
    color: doc.color,
  };
}

export function serializeTask(doc: TaskDocument): Task {
  return {
    id: doc.taskId,
    title: doc.title,
    description: doc.description,
    departmentId: doc.departmentId,
    createdById: doc.createdById,
    assigneeIds: doc.assigneeIds,
    status: doc.status,
    dueDate: doc.dueDate,
    updatedAt: doc.updatedAt,
  };
}

export function serializeLog(doc: DailyLogDocument): DailyLog {
  return {
    id: doc.logId,
    memberId: doc.memberId,
    departmentId: doc.departmentId,
    taskId: doc.taskId ?? undefined,
    taskTitle: doc.taskTitle ?? undefined,
    date: doc.date,
    summary: doc.summary,
    imageUrl: doc.imageUrl ?? undefined,
    createdAt: doc.createdAt,
  };
}

export function serializeComment(doc: TaskCommentDocument): TaskComment {
  return {
    id: doc.commentId,
    taskId: doc.taskId,
    memberId: doc.memberId,
    body: doc.body,
    createdAt: doc.createdAt,
  };
}

export function serializeActivity(doc: ActivityDocument): Activity {
  return {
    id: doc.activityId,
    memberId: doc.memberId,
    departmentId: doc.departmentId,
    type: doc.type,
    message: doc.message,
    timestamp: doc.timestamp,
    meta: doc.meta as Activity["meta"],
  };
}
