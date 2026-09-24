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
      items: true,
    },
    orderBy: { createdAt: 'desc' }
  }).catch(() => []);

  const formattedStructures = initialStructures.map((fee: any) => ({
    id: fee.id,
    grade: fee.name,
    status: "Active",
    total: fee.amount || 0,
    components: fee.items?.length
      ? fee.items.map((i: any) => `${i.name}: $${i.amount}`)
      : ["General Tuition & Operational Services"],
    items: fee.items || [],
    year: fee.year,
    term: fee.term,
  }));

  return (
    <FeeStructureClient
      initialStructures={JSON.parse(JSON.stringify(formattedStructures))}
      schoolId={companyId}
    />
  );
}
