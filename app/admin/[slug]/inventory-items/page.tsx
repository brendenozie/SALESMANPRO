import StockListClient, { StockItem } from "./StockListClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function InventoryItemsPage({ params }: PageProps) {
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

  const items = await prisma.inventoryItem.findMany({
    where: { companyId },
    include: {
      product: true,
    },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  const mappedItems: StockItem[] = items.map((item) => {
    const product = item.product;
    const price = (product as any)?.price || 0;
    const value = item.quantity * price;

    return {
      id: item.id,
      sku: (product as any)?.sku || (product as any)?.barcode || `SKU-${item.id.slice(-6).toUpperCase()}`,
      name: product?.name || "Inventory Product",
      category: (product as any)?.category || "General",
      location: "Main Store",
      stock: item.quantity,
      min: item.reorderThreshold || 5,
      unit: "Units",
      value: value > 0 ? `$${value.toLocaleString()}` : "$0",
    };
  });

  return (
    <StockListClient
      initialItems={JSON.parse(JSON.stringify(mappedItems))}
      schoolId={companyId}
    />
  );
}