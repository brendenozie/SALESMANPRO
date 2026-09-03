import { headers } from "next/headers";
import { notFound } from "next/navigation";
import React from "react";
import { findCompanyCached, pageDataInclude } from "@/lib/company-fetcher";
import { transformCompanyToStoreForm } from "@/utils/transformPrismaToStoreForm";
import { getComponentNameForCategory } from "@/components/site/layouts/siteBodyComponentMap";
import { getGhubaHomepageCached } from "@/lib/ghuba-fetcher";

// Safe per-request memoization helper compatible with React 18 types
const requestCache = ((React as any).cache || (<T extends (...args: any[]) => any>(fn: T): T => fn)) as <T extends (...args: any[]) => any>(fn: T) => T;

export interface LoadedStore {
  raw: any;
  pageData: any;
  componentName: string;
  ghubaData?: any;
}

export const loadStore = requestCache(async (slug: string): Promise<LoadedStore> => {


  const raw = await findCompanyCached(slug, "page");

  if (!raw) notFound();

  const pageData = transformCompanyToStoreForm(raw);

  const isGhuba = pageData.domain === "ghuba" || pageData.slug === "ghuba";
  const categoryInput = pageData.category || "other";
  const variantInput = pageData.variant || "";

  const category = isGhuba ? "other" : categoryInput;
  const variant = isGhuba ? "ghuba" : variantInput;

  const componentName = getComponentNameForCategory(category, variant || "");

  // Fetch global Ghuba data instantly from cache if applicable
  let ghubaData = null;
  if (isGhuba) {
    ghubaData = await getGhubaHomepageCached();
  }

  return { raw, pageData, componentName, ghubaData };
});
