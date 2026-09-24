import InventoryCategoriesClient from "./InventoryCategoriesClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function InventoryCategoriesPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  const [categories, inventoryItems] = await Promise.all([
    prisma.category.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
    }).catch(() => []),
    prisma.inventoryItem.findMany({
      where: { companyId },
      include: { product: true },
    }).catch(() => []),
  ]);

  const mappedCategories = categories.map((cat, idx) => {
    const relatedItems = inventoryItems.filter(
      (item) => (item.product as any)?.category === cat.name || (item.product as any)?.categoryId === cat.id
    );
    const totalVal = relatedItems.reduce((sum, item) => {
      const price = (item.product as any)?.price || 0;
      return sum + (item.quantity * price);
    }, 0);

    const colors = ["text-blue-400", "text-orange-400", "text-emerald-400", "text-purple-400", "text-teal-400"];

    return {
      id: cat.id || `CAT-${String(idx + 1).padStart(2, "0")}`,
      name: cat.name,
      sub: [cat.description || "General Stock"],
      items: relatedItems.length,
      value: totalVal > 0 ? `$${totalVal.toLocaleString()}` : "$0",
      color: colors[idx % colors.length],
    };
  });

  return (
    <InventoryCategoriesClient
      initialCategories={JSON.parse(JSON.stringify(mappedCategories))}
      companyId={companyId}
    />
  );
}