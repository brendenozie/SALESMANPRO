import FeeItemsClient from "./FeeItemsClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function FeeItemsPage({ params }: PageProps) {
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

  const [initialFeeItems, allAcademicLevels, allClassrooms] = await Promise.all([
    prisma.feeItem.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    }).catch(() => []),
    prisma.academicLevel.findMany({
      where: { companyId },
      orderBy: { order: 'asc' },
    }).catch(() => []),
    prisma.classroom.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    }).catch(() => []),
  ]);

  return (
    <FeeItemsClient
      initialFeeItemsData={JSON.parse(JSON.stringify(initialFeeItems))}
      allAcademicLevels={JSON.parse(JSON.stringify(allAcademicLevels))}
      allClassrooms={JSON.parse(JSON.stringify(allClassrooms))}
      schoolId={companyId}
    />
  );
}
