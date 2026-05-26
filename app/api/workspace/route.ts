import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/require-auth";
import { connectDB } from "@/lib/db/connect";
import { Department } from "@/lib/db/models/Department";
import { Task } from "@/lib/db/models/Task";
import { DailyLog } from "@/lib/db/models/DailyLog";
import { TaskComment } from "@/lib/db/models/TaskComment";
import { Activity } from "@/lib/db/models/Activity";
import { User } from "@/lib/db/models/User";
import {
  serializeActivity,
  serializeComment,
  serializeDepartment,
  serializeLog,
  serializeTask,
  serializeUser,
} from "@/lib/serializers";

export async function GET() {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  await connectDB();

  const [departments, members, tasks, logs, comments, activities] =
    await Promise.all([
      Department.find().sort({ name: 1 }),
      User.find().sort({ name: 1 }),
      Task.find().sort({ updatedAt: -1 }),
      DailyLog.find().sort({ createdAt: -1 }),
      TaskComment.find().sort({ createdAt: 1 }),
      Activity.find().sort({ timestamp: -1 }).limit(100),
    ]);

  return NextResponse.json({
    currentUser: auth.user,
    departments: departments.map(serializeDepartment),
    members: members.map(serializeUser),
    tasks: tasks.map(serializeTask),
    logs: logs.map(serializeLog),
    comments: comments.map(serializeComment),
    activities: activities.map(serializeActivity),
  });
}
