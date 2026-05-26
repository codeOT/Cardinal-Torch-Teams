import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/api/require-admin";
import { jsonError } from "@/lib/api/errors";
import { connectDB } from "@/lib/db/connect";
import { Department } from "@/lib/db/models/Department";
import { serializeDepartment } from "@/lib/serializers";
import { uniqueSlug } from "@/lib/slug";

const createSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(500).optional().default(""),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a hex value like #4f46e5"),
});

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  await connectDB();
  const docs = await Department.find().sort({ name: 1 });

  return NextResponse.json({
    departments: docs.map(serializeDepartment),
  });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const body = createSchema.parse(await request.json());
    await connectDB();

    const slug = await uniqueSlug(body.name, async (candidate) => {
      const existing = await Department.findOne({ slug: candidate });
      return Boolean(existing);
    });

    const departmentId = `dept-${Date.now()}`;

    const doc = await Department.create({
      departmentId,
      slug,
      name: body.name.trim(),
      description: body.description?.trim() ?? "",
      color: body.color,
    });

    return NextResponse.json(
      { department: serializeDepartment(doc) },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return jsonError(err.issues[0]?.message ?? "Invalid department data");
    }
    console.error("Create department error:", err);
    return jsonError("Failed to create department", 500);
  }
}
