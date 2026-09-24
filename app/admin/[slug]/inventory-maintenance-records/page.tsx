import MaintenanceManagementClient from "./MaintenanceManagementClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function InventoryMaintenanceRecordsPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  const [assetsNeedingMaintenance, trackingMaintenance] = await Promise.all([
    prisma.asset.findMany({
      where: {
        companyId,
        status: { in: ["MAINTENANCE", "DISPOSED"] },
      },
      orderBy: { updatedAt: "desc" },
    }).catch(() => []),
    prisma.assetTracking.findMany({
      where: {
        asset: { companyId },
        action: "MAINTENANCE",
      },
      include: { asset: true },
      orderBy: { date: "desc" },
    }).catch(() => []),
  ]);

  const tasks: any[] = [];

  assetsNeedingMaintenance.forEach((asset) => {
    tasks.push({
      id: `MNT-${asset.id.slice(-6).toUpperCase()}`,
      asset: asset.name,
      category: asset.category,
      task: "Scheduled Servicing & Inspection",
      dueDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      priority: asset.status === "MAINTENANCE" ? "Critical" : "Medium",
      status: "In Progress",
    });
  });

  trackingMaintenance.forEach((track) => {
    tasks.push({
      id: `LOG-${track.id.slice(-6).toUpperCase()}`,
      asset: track.asset?.name || "Equipment Unit",
      category: track.asset?.category || "General",
      task: track.notes || "Routine Preventative Maintenance",
      dueDate: new Date(track.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      priority: "Routine",
      status: "Completed",
    });
  });

  return (
    <MaintenanceManagementClient
      initialTasks={JSON.parse(JSON.stringify(tasks))}
      schoolId={companyId}
    />
  );
}