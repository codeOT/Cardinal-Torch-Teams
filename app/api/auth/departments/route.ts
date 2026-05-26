import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db/connect";
import { Department } from "@/lib/db/models/Department";
import { serializeDepartment } from "@/lib/serializers";

/** Public department list for sign-up (no auth required). */
export async function GET() {
  await connectDB();
  const docs = await Department.find().sort({ name: 1 });
  return NextResponse.json({
    departments: docs.map(serializeDepartment),
  });
}
