import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/lib/api/require-auth";
import { jsonError } from "@/lib/api/errors";
import { connectDB } from "@/lib/db/connect";
import { DailyLog } from "@/lib/db/models/DailyLog";
import { serializeLog } from "@/lib/serializers";
import { createActivity } from "@/lib/services/activities";

const logSchema = z.object({
  summary: z.string().min(1),
  taskId: z.string().optional(),
  taskTitle: z.string().optional(),
  imageUrl: z.string().optional(),
});

export async function POST(request: Request) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  try {
    const body = logSchema.parse(await request.json());

    if (body.imageUrl && body.imageUrl.length > 500_000) {
      return jsonError("Image is too large");
    }

    await connectDB();

    const now = new Date();
    const logId = `l-${Date.now()}`;
    const taskPart = body.taskTitle ? ` on "${body.taskTitle}"` : "";

    const doc = await DailyLog.create({
      logId,
      memberId: auth.user.id,
      departmentId: auth.user.departmentId,
      taskId: body.taskId,
      taskTitle: body.taskTitle,
      date: now.toISOString().slice(0, 10),
      summary: body.summary.trim(),
      imageUrl: body.imageUrl,
      createdAt: now.toISOString(),
    });

    await createActivity({
      memberId: auth.user.id,
      departmentId: auth.user.departmentId,
      type: "log",
      message: body.imageUrl
        ? `posted a daily update${taskPart} with an attachment`
        : `posted a daily update${taskPart}`,
      meta: {
        imageUrl: body.imageUrl,
        taskId: body.taskId,
        taskTitle: body.taskTitle,
      },
    });

    return NextResponse.json({ log: serializeLog(doc) }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return jsonError("Invalid log data");
    }
    console.error("Create log error:", err);
    return jsonError("Failed to create log", 500);
  }
}
