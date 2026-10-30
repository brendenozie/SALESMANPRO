import { notFound } from "next/navigation";
import { findCompanyCached } from "@/lib/company-fetcher";
import {
  getStoreInventoryProducts,
  getStoreCategoriesByCompanyId,
} from "@/lib/store-category-service";
import prisma from "@/server/db/prismadb";
import AdminInventoryClient from "./AdminInventoryClient";

export const dynamic = "force-dynamic";

export default async function InventoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const company = await findCompanyCached(slug, "lean");
  if (!company) {
    notFound();
  }

  let productsData: any[] = [];
  let categoriesData: any[] = [];
  let agentsData: any[] = [];
  let loadWarning: string | null = null;

  try {
    const [fetchedProducts, fetchedCategories, fetchedAgents] =
      await Promise.all([
        getStoreInventoryProducts(company.id, 1, 200).catch((err: any) => {
          console.error(
            "[InventoryPage] getStoreInventoryProducts error:",
            err,
          );
          loadWarning = "Some inventory records required fallback recovery.";
          return [];
        }),
        getStoreCategoriesByCompanyId(company.id).catch((err: any) => {
          console.error("[InventoryPage] getStoreCategories error:", err);
          return [];
        }),
        prisma.salesAgent
          .findMany({
            where: { companyId: company.id },
            select: {
              id: true,
              loginCode: true,
              phoneNumber: true,
              isActive: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          })
          .then((rows: any[]) =>
            rows.map((a: any) => ({
              id: a.id,
              name:
                a.user?.name || a.user?.email || a.loginCode || "Sales Agent",
              loginCode: a.loginCode,
              phoneNumber: a.phoneNumber,
              status: a.isActive ? "ACTIVE" : "INACTIVE",
            })),
          )
          .catch((err: any) => {
            console.error("[InventoryPage] salesAgent fetch error:", err);
            return [];
          }),
      ]);

    productsData = Array.isArray(fetchedProducts) ? fetchedProducts : [];
    categoriesData = Array.isArray(fetchedCategories) ? fetchedCategories : [];
    agentsData = Array.isArray(fetchedAgents) ? fetchedAgents : [];
  } catch (err: any) {
    console.error("[InventoryPage] Unexpected error:", err);
    loadWarning = err?.message || "Failed to load inventory data.";
  }

  const serializedProducts = JSON.parse(JSON.stringify(productsData));
  const serializedCategories = JSON.parse(JSON.stringify(categoriesData));
  const serializedAgents = JSON.parse(JSON.stringify(agentsData));

  return (
    <AdminInventoryClient
      companyId={company.id}
      companyName={
        (company as any).name ||
        (company as any).companyName ||
        "SalesmanPro Store"
      }
      slug={company.slug || slug}
      productsData={serializedProducts}
      initialProducts={serializedProducts}
      categoriesData={serializedCategories}
      initialCategories={serializedCategories}
      agentsData={serializedAgents}
      initialAgents={serializedAgents}
      initialLoadWarning={loadWarning}
    />
  );
}
