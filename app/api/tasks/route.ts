import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/lib/api/require-auth";
import { jsonError } from "@/lib/api/errors";
import { connectDB } from "@/lib/db/connect";
import { Task } from "@/lib/db/models/Task";
import { formatMemberNames } from "@/lib/members";
import { User } from "@/lib/db/models/User";
import { serializeTask, serializeUser } from "@/lib/serializers";
import { createActivity } from "@/lib/services/activities";
import { notifyTaskAssigned } from "@/lib/services/task-notifications";

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  departmentId: z.string().min(1),
  assigneeIds: z.array(z.string()).min(1),
  status: z.enum(["pending", "ongoing", "delivered"]),
  dueDate: z.string().min(1),
});

export async function POST(request: Request) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  try {
    const body = createTaskSchema.parse(await request.json());
    await connectDB();

    const members = (await User.find()).map(serializeUser);
    const now = new Date().toISOString();
    const taskId = `t-${Date.now()}`;

    const doc = await Task.create({
      taskId,
      title: body.title.trim(),
      description: body.description?.trim() ?? "",
      departmentId: body.departmentId,
      createdById: auth.user.id,
      assigneeIds: body.assigneeIds,
      status: body.status,
      dueDate: body.dueDate,
      updatedAt: now,
    });

    const statusLabel =
      body.status === "delivered"
        ? "delivered"
        : body.status === "ongoing"
          ? "ongoing"
          : "pending";

    await createActivity({
      memberId: auth.user.id,
      departmentId: body.departmentId,
      type: "task_created",
      message: `created "${body.title.trim()}" for ${formatMemberNames(body.assigneeIds, members)} (${statusLabel})`,
      meta: {
        taskStatus: body.status,
        taskId,
        taskTitle: body.title.trim(),
      },
    });

    notifyTaskAssigned({
      taskId,
      title: body.title.trim(),
      description: body.description?.trim() ?? "",
      status: body.status,
      dueDate: body.dueDate,
      departmentId: body.departmentId,
      assigneeIds: body.assigneeIds,
      actorId: auth.user.id,
      actorName: auth.user.name,
    });

    return NextResponse.json({ task: serializeTask(doc) }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return jsonError("Invalid task data");
    }
    console.error("Create task error:", err);
    return jsonError("Failed to create task", 500);
  }
}
