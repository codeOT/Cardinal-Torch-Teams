import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/api/require-admin";
import { jsonError } from "@/lib/api/errors";
import { connectDB } from "@/lib/db/connect";
import { handleDbError } from "@/lib/db/errors";
import {
  deleteDepartment,
  DepartmentDeleteError,
} from "@/lib/services/delete-department";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id: departmentId } = await params;
  if (!departmentId) {
    return jsonError("Department id is required");
  }

  try {
    await connectDB();
    const { name } = await deleteDepartment(departmentId);
    return NextResponse.json({ ok: true, name });
  } catch (err) {
    if (err instanceof DepartmentDeleteError) {
      return jsonError(err.message, err.status);
    }
    return handleDbError(err, "Failed to delete department");
  }
}
