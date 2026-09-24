import TransportScheduleClient from "./TransportScheduleClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

export default async function TransportSchedulePage({ params }: { params: Promise<{ slug: string }> }) {
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

  const [shifts, drivers, routes, vehicles] = await Promise.all([
    prisma.transportShift.findMany({
      where: { companyId },
      include: {
        vehicle: true,
        driver: { include: { user: true } },
        route: true,
      },
      orderBy: { startTime: 'asc' },
    }),
    prisma.transportDriver.findMany({
      where: { companyId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.transportRoute.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    }),
    prisma.transportVehicle.findMany({
      where: { companyId },
      orderBy: { registration: 'asc' },
    }),
  ]);

  const formattedShifts = shifts.map(s => ({
    id: s.id,
    startTime: s.startTime ? new Date(s.startTime).toISOString() : "",
    endTime: s.endTime ? new Date(s.endTime).toISOString() : "",
    status: s.status as any,
    route: { name: s.route?.name || "Route" },
    driver: { name: s.driver?.user?.name || "Driver" },
    vehicle: { registration: s.vehicle?.registration || "Vehicle" },
  }));

  const formattedDrivers = drivers.map(d => ({
    id: d.id,
    name: d.user?.name || "Driver",
  }));

  return (
    <TransportScheduleClient
      initialShifts={JSON.parse(JSON.stringify(formattedShifts))}
      initialDrivers={JSON.parse(JSON.stringify(formattedDrivers))}
      initialRoutes={JSON.parse(JSON.stringify(routes))}
      initialVehicles={JSON.parse(JSON.stringify(vehicles))}
      schoolId={companyId}
    />
  );
}