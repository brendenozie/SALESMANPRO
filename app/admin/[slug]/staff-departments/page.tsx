import DepartmentsClient from "./DepartmentsClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DepartmentsSSRPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  let initialDepartments: any[] = [];
  try {
    const rawDepartments = await prisma.department.findMany({
      where: { companyId },
      include: {
        _count: { select: { educators: true, courses: true } },
        head: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    initialDepartments = rawDepartments.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      head: d.head?.user || null,
      companyId: d.companyId,
      educatorCount: d._count.educators,
      courseCount: d._count.courses,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    }));
  } catch (err) {
    console.error("[DepartmentsSSRPage] Failed to query departments", err);
  }

  return (
    <DepartmentsClient
      initialDepartments={initialDepartments}
      companyId={companyId}
    />
  );
}