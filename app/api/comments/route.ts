import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/lib/api/require-auth";
import { jsonError } from "@/lib/api/errors";
import { connectDB } from "@/lib/db/connect";
import { Task } from "@/lib/db/models/Task";
import { TaskComment } from "@/lib/db/models/TaskComment";
import { serializeComment } from "@/lib/serializers";
import { createActivity } from "@/lib/services/activities";

const commentSchema = z.object({
  taskId: z.string().min(1),
  body: z.string().min(1),
});

export async function POST(request: Request) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  try {
    const body = commentSchema.parse(await request.json());
    await connectDB();

    const task = await Task.findOne({ taskId: body.taskId });
    if (!task) {
      return jsonError("Task not found", 404);
    }

    const now = new Date().toISOString();
    const doc = await TaskComment.create({
      commentId: `c-${Date.now()}`,
      taskId: body.taskId,
      memberId: auth.user.id,
      body: body.body.trim(),
      createdAt: now,
    });

    await createActivity({
      memberId: auth.user.id,
      departmentId: task.departmentId,
      type: "task_comment",
      message: `commented on "${task.title}"`,
      meta: { taskId: task.taskId, taskTitle: task.title },
    });

    return NextResponse.json({ comment: serializeComment(doc) }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return jsonError("Invalid comment");
    }
    console.error("Create comment error:", err);
    return jsonError("Failed to add comment", 500);
  }
}
