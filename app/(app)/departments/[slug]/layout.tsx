import { notFound } from "next/navigation";

import { getDepartmentBySlug } from "@/lib/server/departments";

interface DepartmentSlugLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function DepartmentSlugLayout({
  children,
  params,
}: DepartmentSlugLayoutProps) {
  const { slug } = await params;
  const department = await getDepartmentBySlug(slug);

  if (!department) {
    notFound();
  }

  return children;
}
