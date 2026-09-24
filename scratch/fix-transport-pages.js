const fs = require('fs');

// 1. transport-maintenance-records/page.tsx
const maintPage = `import MaintenanceRecordsClient from "./MaintenanceRecordsClient";
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
`;
fs.writeFileSync('app/admin/[slug]/transport-maintenance-records/page.tsx', maintPage, 'utf8');

// 2. transport-fuel-logs/page.tsx
const fuelPage = `import FuelLogsClient from "./FuelLogsClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

export default async function FuelLogsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  const [logsRaw, vehiclesRaw] = await Promise.all([
    prisma.transportFuelLog.findMany({
      where: { vehicle: { companyId } },
      include: {
        vehicle: {
          select: { id: true, registration: true, make: true, model: true }
        }
      },
      orderBy: { date: "desc" },
    }),
    prisma.transportVehicle.findMany({
      where: { companyId },
      select: { id: true, registration: true, make: true, model: true },
      orderBy: { registration: "asc" },
    }),
  ]);

  const initialData = {
    logs: JSON.parse(JSON.stringify(logsRaw)),
    vehicles: JSON.parse(JSON.stringify(vehiclesRaw)),
  };

  return <FuelLogsClient initialData={initialData} schoolId={companyId} />;
}
`;
fs.writeFileSync('app/admin/[slug]/transport-fuel-logs/page.tsx', fuelPage, 'utf8');

console.log('Fixed transport maintenance and fuel pages successfully');
