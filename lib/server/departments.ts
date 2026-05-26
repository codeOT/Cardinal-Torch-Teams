import { connectDB } from "@/lib/db/connect";
import { Department } from "@/lib/db/models/Department";
import { serializeDepartment } from "@/lib/serializers";
import type { Department as DepartmentType } from "@/lib/types";

export async function getDepartmentBySlug(
  slug: string,
): Promise<DepartmentType | null> {
  await connectDB();
  const doc = await Department.findOne({ slug });
  return doc ? serializeDepartment(doc) : null;
}

export async function getAllDepartments(): Promise<DepartmentType[]> {
  await connectDB();
  const docs = await Department.find().sort({ name: 1 });
  return docs.map(serializeDepartment);
}
