import LibraryMembersClient from "./LibraryMembersClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LibraryMembersPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  // Safely resolve the exact same identifier used in AdminStoreLayout
  const identifier = slug || session?.user?.id || '';

  // Retrieve the memoized company data
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  const members = await prisma.libraryMember.findMany({
    where: { companyId },
    include: {
      student: true,
      educator: { include: { user: true } },
      issuances: {
        include: {
          fines: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <LibraryMembersClient
      initialMembers={JSON.parse(JSON.stringify(members))}
      schoolId={companyId}
    />
  );
}