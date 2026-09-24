import AssetTrackingClient, { AssetRecord } from "../inventory-assets-list/AssetTrackingClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function InventoryDepreciationSchedulesPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  const assets = await prisma.asset.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  const mappedAssets: AssetRecord[] = assets.map((a) => ({
    id: a.id,
    name: a.name,
    serial: a.serialNumber || `SN-${a.id.slice(-6).toUpperCase()}`,
    purchased: a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "N/A",
    cost: a.purchaseValue || 0,
    currentValue: a.currentValue || a.purchaseValue || 0,
    condition: a.status === "ACTIVE" ? "Excellent" : a.status === "MAINTENANCE" ? "Servicing Required" : "Good",
    location: a.location || "School Compound",
  }));

  return (
    <AssetTrackingClient
      initialAssets={JSON.parse(JSON.stringify(mappedAssets))}
      schoolId={companyId}
    />
  );
}
