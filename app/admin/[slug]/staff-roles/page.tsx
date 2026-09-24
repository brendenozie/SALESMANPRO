import RolesManagementClient from "./RolesManagementClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function RolesSSRPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  let initialRoles: any[] = [];
  try {
    const rawRoles = await prisma.role.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    });

    initialRoles = rawRoles.map(r => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  } catch (err) {
    console.error("[RolesSSRPage] Failed to query roles", err);
  }

  return (
    <RolesManagementClient
      initialRoles={initialRoles}
      companyId={companyId}
    />
  );
}