import MaintenanceRecordsClient from "./MaintenanceRecordsClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

export default async function MaintenancePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  const [recordsRaw, vehiclesRaw] = await Promise.all([
    prisma.transportMaintenance.findMany({
      where: { vehicle: { companyId } },
      include: {
        vehicle: {
          select: { id: true, registration: true, make: true, model: true }
        }
      },
      orderBy: { scheduledDate: "desc" },
    }),
    prisma.transportVehicle.findMany({
      where: { companyId },
      select: { id: true, registration: true, make: true, model: true },
      orderBy: { registration: "asc" },
    }),
  ]);

  const initialData = {
    records: JSON.parse(JSON.stringify(recordsRaw)),
    vehicles: JSON.parse(JSON.stringify(vehiclesRaw)),
  };

  return <MaintenanceRecordsClient initialData={initialData} schoolId={companyId} />;
}
