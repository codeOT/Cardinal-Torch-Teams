import { connectDB } from "@/lib/db/connect";
import { Department } from "@/lib/db/models/Department";
import { User } from "@/lib/db/models/User";
import { getAppUrl } from "@/lib/email/client";
import { runEmailJob, sendBulkEmails, type EmailRecipient } from "@/lib/email/send";
import {
  taskAssignedEmail,
  taskCommentEmail,
  taskStatusEmail,
} from "@/lib/email/templates";
import type { TaskStatus } from "@/lib/types";

async function getDepartmentName(departmentId: string): Promise<string> {
  const dept = await Department.findOne({ departmentId });
  return dept?.name ?? "Your department";
}

async function getRecipients(
  memberIds: string[],
  excludeIds: string[] = [],
): Promise<EmailRecipient[]> {
  const exclude = new Set(excludeIds);
  const uniqueIds = [...new Set(memberIds)].filter((id) => !exclude.has(id));
  if (uniqueIds.length === 0) return [];

  const users = await User.find({ memberId: { $in: uniqueIds } }).select(
    "memberId email name",
  );

  return users.map((user) => ({
    email: user.email,
    name: user.name,
  }));
}

function taskUrl(departmentSlug: string | null, departmentId: string): string {
  const base = getAppUrl();
  if (departmentSlug) {
    return `${base}/departments/${departmentSlug}/tasks`;
  }
  return `${base}/departments/${departmentId}/tasks`;
}

async function getDepartmentSlug(departmentId: string): Promise<string | null> {
  const dept = await Department.findOne({ departmentId }).select("slug");
  return dept?.slug ?? null;
}

export function notifyTaskAssigned(opts: {
  taskId: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
  departmentId: string;
  assigneeIds: string[];
  actorId: string;
  actorName: string;
}): void {
  runEmailJob(async () => {
    await connectDB();

    const [departmentName, slug, recipients] = await Promise.all([
      getDepartmentName(opts.departmentId),
      getDepartmentSlug(opts.departmentId),
      getRecipients(opts.assigneeIds, [opts.actorId]),
    ]);

    if (recipients.length === 0) return;

    const url = taskUrl(slug, opts.departmentId);

    await sendBulkEmails(recipients, (recipient) =>
      taskAssignedEmail({
        recipientName: recipient.name,
        actorName: opts.actorName,
        taskTitle: opts.title,
        description: opts.description,
        status: opts.status,
        dueDate: opts.dueDate,
        departmentName,
        taskUrl: url,
      }),
    );
  });
}

export function notifyTaskStatusChanged(opts: {
  taskId: string;
  title: string;
  description: string;
  status: TaskStatus;
  previousStatus: TaskStatus;
  dueDate: string;
  departmentId: string;
  assigneeIds: string[];
  createdById: string;
  actorId: string;
  actorName: string;
}): void {
  runEmailJob(async () => {
    await connectDB();

    const notifyIds = [...new Set([...opts.assigneeIds, opts.createdById])];
    const [departmentName, slug, recipients] = await Promise.all([
      getDepartmentName(opts.departmentId),
      getDepartmentSlug(opts.departmentId),
      getRecipients(notifyIds, [opts.actorId]),
    ]);

    if (recipients.length === 0) return;

    const url = taskUrl(slug, opts.departmentId);

    await sendBulkEmails(recipients, (recipient) =>
      taskStatusEmail({
        recipientName: recipient.name,
        actorName: opts.actorName,
        taskTitle: opts.title,
        description: opts.description,
        status: opts.status,
        previousStatus: opts.previousStatus,
        dueDate: opts.dueDate,
        departmentName,
        taskUrl: url,
      }),
    );
  });
}

export function notifyTaskComment(opts: {
  taskId: string;
  title: string;
  departmentId: string;
  assigneeIds: string[];
  createdById: string;
  actorId: string;
  actorName: string;
  comment: string;
}): void {
  runEmailJob(async () => {
    await connectDB();

    const notifyIds = [...new Set([...opts.assigneeIds, opts.createdById])];
    const [departmentName, slug, recipients] = await Promise.all([
      getDepartmentName(opts.departmentId),
      getDepartmentSlug(opts.departmentId),
      getRecipients(notifyIds, [opts.actorId]),
    ]);

    if (recipients.length === 0) return;

    const url = taskUrl(slug, opts.departmentId);

    await sendBulkEmails(recipients, (recipient) =>
      taskCommentEmail({
        recipientName: recipient.name,
        actorName: opts.actorName,
        taskTitle: opts.title,
        comment: opts.comment,
        departmentName,
        taskUrl: url,
      }),
    );
  });
}
