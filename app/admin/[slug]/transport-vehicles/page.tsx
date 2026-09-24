import TransportFleetClient from "./TransportFleetClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TransportVehiclesPage({ params }: PageProps) {
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

  const vehicles = await prisma.transportVehicle.findMany({
    where: { companyId },
    include: {
      _count: {
        select: { routes: true, maintenances: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <TransportFleetClient
      initialVehicles={JSON.parse(JSON.stringify(vehicles))}
      schoolId={companyId}
    />
  );
}