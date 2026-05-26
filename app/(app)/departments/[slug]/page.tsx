import { notFound } from "next/navigation";

import { DepartmentDashboardClient } from "@/components/departments/DepartmentDashboardClient";
import { getDepartmentBySlug } from "@/lib/server/departments";

interface DepartmentPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DepartmentPage({ params }: DepartmentPageProps) {
  const { slug } = await params;
  const department = await getDepartmentBySlug(slug);

  if (!department) {
    notFound();
  }

  return <DepartmentDashboardClient department={department} />;
}
