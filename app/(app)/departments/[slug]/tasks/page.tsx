import { notFound } from "next/navigation";

import { DepartmentTasksClient } from "@/components/departments/DepartmentTasksClient";
import { getDepartmentBySlug } from "@/lib/server/departments";

interface DepartmentTasksPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DepartmentTasksPage({
  params,
}: DepartmentTasksPageProps) {
  const { slug } = await params;
  const department = await getDepartmentBySlug(slug);

  if (!department) {
    notFound();
  }

  return <DepartmentTasksClient department={department} />;
}
