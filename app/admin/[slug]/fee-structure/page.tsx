import FeeStructureClient from "./FeeStructureClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function FeeStructurePage({ params }: PageProps) {
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

  const initialStructures = await prisma.feeStructure.findMany({
    where: { companyId },
    include: {
      items: {
        include: { feeItem: true }
      },
      academicLevel: true,
      academicYear: true,
      academicTerm: true,
    },
    orderBy: { createdAt: 'desc' }
  }).catch(() => []);

  return (
    <FeeStructureClient
      initialStructures={JSON.parse(JSON.stringify(initialStructures))}
      schoolId={companyId}
    />
  );
}
