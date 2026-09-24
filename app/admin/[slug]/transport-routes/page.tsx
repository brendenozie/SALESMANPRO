import TransportRoutesClient from "./TransportRoutesClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

export default async function TransportRoutesPage({ params }: { params: Promise<{ slug: string }> }) {
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

  const routes = await prisma.transportRoute.findMany({
    where: { companyId },
    include: {
      vehicle: { select: { registration: true } },
      _count: { select: { assignments: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <TransportRoutesClient
      initialRoutes={JSON.parse(JSON.stringify(routes))}
      schoolId={companyId}
    />
  );
}