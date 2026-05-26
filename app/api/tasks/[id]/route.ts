import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/lib/api/require-auth";
import { jsonError } from "@/lib/api/errors";
import { connectDB } from "@/lib/db/connect";
import { Task } from "@/lib/db/models/Task";
import { serializeTask } from "@/lib/serializers";
import { createActivity } from "@/lib/services/activities";
import { isTaskAssignee } from "@/lib/members";

const patchSchema = z.object({
  status: z.enum(["pending", "ongoing", "delivered"]),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const { id } = await context.params;

  try {
    const body = patchSchema.parse(await request.json());
    await connectDB();

    const task = await Task.findOne({ taskId: id });
    if (!task) {
      return jsonError("Task not found", 404);
    }

    const serialized = serializeTask(task);
    if (!isTaskAssignee(serialized, auth.user.id)) {
      return jsonError("Only assignees can update this task", 403);
    }

    const now = new Date().toISOString();
    task.status = body.status;
    task.updatedAt = now;
    await task.save();

    const statusLabel =
      body.status === "delivered"
        ? "delivered"
        : body.status === "ongoing"
          ? "ongoing"
          : "pending";

    await createActivity({
      memberId: auth.user.id,
      departmentId: task.departmentId,
      type: "task_update",
      message: `moved "${task.title}" to ${statusLabel}`,
      meta: {
        taskStatus: body.status,
        taskId: task.taskId,
        taskTitle: task.title,
      },
    });

    return NextResponse.json({ task: serializeTask(task) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return jsonError("Invalid status");
    }
    console.error("Update task error:", err);
    return jsonError("Failed to update task", 500);
  }
}
