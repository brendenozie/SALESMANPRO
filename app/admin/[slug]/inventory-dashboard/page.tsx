import InventoryDashboardClient from "./InventoryDashboardClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function InventoryDashboardPage({ params }: PageProps) {
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

  const [inventoryItems, assets, auditsCount] = await Promise.all([
    prisma.inventoryItem.findMany({
      where: { companyId },
      include: { product: true },
    }).catch(() => []),
    prisma.asset.findMany({
      where: { companyId },
      select: { category: true, purchaseValue: true, currentValue: true },
    }).catch(() => []),
    prisma.inventoryAudit.count({
      where: { companyId },
    }).catch(() => 0),
  ]);

  const totalSkus = inventoryItems.length;
  const outOfStock = inventoryItems.filter(i => i.quantity <= 0).length;
  const totalInvValue = inventoryItems.reduce((sum, i) => {
    const price = (i.product as any)?.price || 0;
    return sum + (i.quantity * price);
  }, 0);

  const lowStockAlerts = inventoryItems
    .filter(i => i.quantity <= (i.reorderThreshold || 5))
    .slice(0, 5)
    .map(i => ({
      item: i.product?.name || "Inventory Item",
      cat: (i.product as any)?.category || "General",
      stock: `${i.quantity} Units`,
      min: `${i.reorderThreshold || 5} Units`,
      urgency: i.quantity <= 0 ? "High" : "Medium",
    }));

  // Group assets by category
  const categoryCounts: Record<string, number> = {};
  assets.forEach(a => {
    const cat = String(a.category || "Other");
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const totalAssets = assets.length || 1;
  const colors = ['bg-blue-500', 'bg-orange-500', 'bg-emerald-500', 'bg-purple-500', 'bg-slate-700'];
  const categoriesList = Object.entries(categoryCounts).map(([label, count], idx) => ({
    label,
    val: Math.round((count / totalAssets) * 100),
    color: colors[idx % colors.length],
  }));

  const stats = {
    totalSkus,
    outOfStock,
    ordersInTransit: auditsCount,
    inventoryValue: totalInvValue > 0 ? `$${totalInvValue.toLocaleString()}` : "$0",
  };

  return (
    <InventoryDashboardClient
      stats={stats}
      alerts={lowStockAlerts}
      categories={categoriesList.length > 0 ? categoriesList : undefined}
      schoolId={companyId}
    />
  );
}