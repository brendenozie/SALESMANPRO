import InventoryReportsClient from "./InventoryReportsClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function InventoryReportsPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  const [assets, inventoryItems, auditsCount] = await Promise.all([
    prisma.asset.findMany({
      where: { companyId },
    }).catch(() => []),
    prisma.inventoryItem.findMany({
      where: { companyId },
      include: { product: true },
    }).catch(() => []),
    prisma.inventoryAudit.count({
      where: { companyId },
    }).catch(() => 0),
  ]);

  const totalAssetValue = assets.reduce((sum, a) => sum + (a.currentValue || a.purchaseValue || 0), 0);
  const totalStockUnits = inventoryItems.reduce((sum, i) => sum + i.quantity, 0);
  const maintenanceCount = assets.filter((a) => a.status === "MAINTENANCE").length;
  const maintenanceRatio = assets.length > 0 ? Math.round((maintenanceCount / assets.length) * 100) : 0;

  const kpis = [
    {
      label: "Total Asset Book Value",
      value: totalAssetValue > 0 ? `$${totalAssetValue.toLocaleString()}` : "$0",
      delta: `${assets.length} Units`,
      color: "text-amber-400",
    },
    {
      label: "Stock Units In Store",
      value: totalStockUnits.toLocaleString(),
      delta: `${inventoryItems.length} SKUs`,
      color: "text-emerald-400",
    },
    {
      label: "Maintenance Ratio",
      value: `${maintenanceRatio}%`,
      delta: maintenanceCount > 0 ? `${maintenanceCount} Pending` : "Optimal",
      color: maintenanceCount > 0 ? "text-rose-400" : "text-emerald-400",
    },
    {
      label: "Audits Completed",
      value: auditsCount.toString(),
      delta: "Verified",
      color: "text-blue-400",
    },
  ];

  return (
    <InventoryReportsClient
      initialKpis={JSON.parse(JSON.stringify(kpis))}
      schoolId={companyId}
    />
  );
}