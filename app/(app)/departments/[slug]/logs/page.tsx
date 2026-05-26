import { notFound } from "next/navigation";

import { DepartmentLogsClient } from "@/components/departments/DepartmentLogsClient";
import { getDepartmentBySlug } from "@/lib/server/departments";

interface DepartmentLogsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DepartmentLogsPage({
  params,
}: DepartmentLogsPageProps) {
  const { slug } = await params;
  const department = await getDepartmentBySlug(slug);

  if (!department) {
    notFound();
  }

  return <DepartmentLogsClient department={department} />;
}
