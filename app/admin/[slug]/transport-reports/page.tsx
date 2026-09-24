import TransportDashboard from "./TransportDashboard";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TransportDashboardPage({ params }: PageProps) {
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

  const [
    totalVehicles,
    activeVehicles,
    pendingMaintenance,
    shifts,
    fuelLogs,
  ] = await Promise.all([
    prisma.transportVehicle.count({ where: { companyId } }).catch(() => 0),
    prisma.transportVehicle.count({ where: { companyId, status: "ACTIVE" } }).catch(() => 0),
    prisma.transportMaintenance.findMany({
      where: {
        vehicle: { companyId },
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
      },
      include: { vehicle: true },
      take: 5,
    }).catch(() => []),
    prisma.transportShift.findMany({
      where: { companyId },
      select: { status: true },
    }).catch(() => []),
    prisma.transportFuelLog.findMany({
      where: { vehicle: { companyId } },
      select: { quantity: true, cost: true },
      take: 20,
    }).catch(() => []),
  ]);

  const completedShifts = shifts.filter(s => s.status === "COMPLETED").length;
  const onTimeRate = shifts.length > 0 
    ? `${((completedShifts / shifts.length) * 100).toFixed(1)}%` 
    : "100%";

  const totalFuelLiters = fuelLogs.reduce((acc, l) => acc + (l.quantity || 0), 0);
  const avgFuel = fuelLogs.length > 0 
    ? (totalFuelLiters / fuelLogs.length).toFixed(1) 
    : "0.0";

  const alerts = pendingMaintenance.map(m => ({
    bus: m.vehicle?.registration || "Fleet Vehicle",
    issue: m.description || `${m.type} Service Needed`,
  }));

  const initialData = {
    metrics: {
      activeBuses: `${activeVehicles}/${totalVehicles}`,
      onTimeRate,
      avgFuel,
      safetyIncidents: "0",
      healthRate: totalVehicles > 0 
        ? `${(((totalVehicles - pendingMaintenance.length) / totalVehicles) * 100).toFixed(1)}%`
        : "100%",
    },
    alerts,
    efficiencyData: [65, 80, 55, 90, 70, 85, 95],
  };

  return (
    <TransportDashboard
      initialData={JSON.parse(JSON.stringify(initialData))}
      schoolId={companyId}
    />
  );
}