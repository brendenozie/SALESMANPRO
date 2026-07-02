// lib/loadStore.ts
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { findCompanyCached, pageDataInclude } from "@/lib/company-fetcher";
import { transformCompanyToStoreForm } from "@/utils/transformPrismaToStoreForm";
import { getComponentNameForCategory } from "@/components/site/layouts/siteBodyComponentMap";

export interface LoadedStore {
  raw: any;
  pageData: any;
  componentName: string;
}

export async function loadStore(slug: string): Promise<LoadedStore> {
  const raw = await findCompanyCached(slug, "page");

  if (!raw) notFound();

  const pageData = transformCompanyToStoreForm(raw);
  // 2. Apply your "ghuba" override logic
  const isGhuba = pageData.domain === "ghuba" || pageData.slug === "ghuba";
  const categoryInput = pageData.category || "other";
  const variantInput = pageData.variant || "";

  const category = isGhuba ? "other" : categoryInput;
  const variant = isGhuba ? "ghuba" : variantInput;

  const componentName = getComponentNameForCategory(category, variant || "");

  return { raw, pageData, componentName };
}
