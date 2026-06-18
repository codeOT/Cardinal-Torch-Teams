import { Activity } from "@/lib/db/models/Activity";
import { DailyLog } from "@/lib/db/models/DailyLog";
import { Department } from "@/lib/db/models/Department";
import { Task } from "@/lib/db/models/Task";
import { TaskComment } from "@/lib/db/models/TaskComment";
import { User } from "@/lib/db/models/User";

export class DepartmentDeleteError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function deleteDepartment(departmentId: string) {
  const department = await Department.findOne({ departmentId });
  if (!department) {
    throw new DepartmentDeleteError("Department not found", 404);
  }

  const memberCount = await User.countDocuments({ departmentId });
  if (memberCount > 0) {
    throw new DepartmentDeleteError(
      `Cannot delete: ${memberCount} member${memberCount === 1 ? "" : "s"} still assigned to this department.`,
      409,
    );
  }

  const tasks = await Task.find({ departmentId }).select("taskId");
  const taskIds = tasks.map((t) => t.taskId);

  if (taskIds.length > 0) {
    await TaskComment.deleteMany({ taskId: { $in: taskIds } });
  }

  await Promise.all([
    Task.deleteMany({ departmentId }),
    DailyLog.deleteMany({ departmentId }),
    Activity.deleteMany({ departmentId }),
  ]);

  await Department.deleteOne({ departmentId });

  return { name: department.name };
}
