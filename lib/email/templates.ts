import type { TaskStatus } from "@/lib/types";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,-apple-system,sans-serif;color:#0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:#4f46e5;padding:20px 24px;">
              <p style="margin:0;font-size:18px;font-weight:600;color:#ffffff;">Team Center</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">${body}</td>
          </tr>
          <tr>
            <td style="padding:16px 24px 24px;border-top:1px solid #f1f5f9;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">You received this because of activity in your Team Center workspace.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function statusBadge(status: TaskStatus): string {
  const colors: Record<TaskStatus, string> = {
    pending: "#b45309",
    ongoing: "#a16207",
    delivered: "#047857",
  };
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return `<span style="display:inline-block;padding:2px 10px;border-radius:999px;background:#f1f5f9;color:${colors[status]};font-size:12px;font-weight:600;">${label}</span>`;
}

function taskBlock(opts: {
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate: string;
  departmentName: string;
}): string {
  const desc = opts.description?.trim()
    ? `<p style="margin:12px 0 0;font-size:14px;line-height:1.5;color:#475569;">${escapeHtml(opts.description)}</p>`
    : "";

  return `
    <p style="margin:0 0 8px;font-size:13px;color:#64748b;">${escapeHtml(opts.departmentName)}</p>
    <h2 style="margin:0;font-size:20px;font-weight:600;color:#0f172a;">${escapeHtml(opts.title)}</h2>
    ${desc}
    <p style="margin:16px 0 8px;">${statusBadge(opts.status)}</p>
    <p style="margin:0;font-size:13px;color:#64748b;">Due ${escapeHtml(opts.dueDate)}</p>
  `;
}

function cta(href: string, label: string): string {
  return `<p style="margin:24px 0 0;">
    <a href="${escapeHtml(href)}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 18px;border-radius:8px;">${escapeHtml(label)}</a>
  </p>`;
}

export function taskAssignedEmail(opts: {
  recipientName: string;
  actorName: string;
  taskTitle: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
  departmentName: string;
  taskUrl: string;
}): { subject: string; html: string } {
  const subject = `New task assigned: ${opts.taskTitle}`;
  const html = layout(
    subject,
    `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.5;">Hi ${escapeHtml(opts.recipientName)},</p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.5;"><strong>${escapeHtml(opts.actorName)}</strong> assigned you a task:</p>
    ${taskBlock({
      title: opts.taskTitle,
      description: opts.description,
      status: opts.status,
      dueDate: opts.dueDate,
      departmentName: opts.departmentName,
    })}
    ${cta(opts.taskUrl, "View task")}
  `,
  );
  return { subject, html };
}

export function taskStatusEmail(opts: {
  recipientName: string;
  actorName: string;
  taskTitle: string;
  description: string;
  status: TaskStatus;
  previousStatus: TaskStatus;
  dueDate: string;
  departmentName: string;
  taskUrl: string;
}): { subject: string; html: string } {
  const subject = `Task updated: ${opts.taskTitle}`;
  const html = layout(
    subject,
    `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.5;">Hi ${escapeHtml(opts.recipientName)},</p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.5;"><strong>${escapeHtml(opts.actorName)}</strong> changed a task from <strong>${escapeHtml(opts.previousStatus)}</strong> to <strong>${escapeHtml(opts.status)}</strong>:</p>
    ${taskBlock({
      title: opts.taskTitle,
      description: opts.description,
      status: opts.status,
      dueDate: opts.dueDate,
      departmentName: opts.departmentName,
    })}
    ${cta(opts.taskUrl, "View task")}
  `,
  );
  return { subject, html };
}

export function taskCommentEmail(opts: {
  recipientName: string;
  actorName: string;
  taskTitle: string;
  comment: string;
  departmentName: string;
  taskUrl: string;
}): { subject: string; html: string } {
  const subject = `New comment on: ${opts.taskTitle}`;
  const html = layout(
    subject,
    `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.5;">Hi ${escapeHtml(opts.recipientName)},</p>
    <p style="margin:0 0 12px;font-size:15px;line-height:1.5;"><strong>${escapeHtml(opts.actorName)}</strong> commented on <strong>${escapeHtml(opts.taskTitle)}</strong> in ${escapeHtml(opts.departmentName)}:</p>
    <blockquote style="margin:16px 0;padding:12px 16px;border-left:3px solid #c7d2fe;background:#f8fafc;border-radius:0 8px 8px 0;font-size:14px;line-height:1.5;color:#334155;">${escapeHtml(opts.comment)}</blockquote>
    ${cta(opts.taskUrl, "View task")}
  `,
  );
  return { subject, html };
}
