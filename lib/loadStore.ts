import { notFound } from "next/navigation";
import React from "react";
import { findCompanyCached } from "@/lib/company-fetcher";
import { transformCompanyToStoreForm } from "@/utils/transformPrismaToStoreForm";
import { getComponentNameForCategory } from "@/components/site/layouts/siteBodyComponentMap";
import { getGhubaHomepageCached } from "@/lib/ghuba-fetcher";
import { isGhubaMarketplace } from "@/lib/ghuba-helpers";

// Safe per-request memoization helper compatible with React 18 types
const requestCache = ((React as any).cache || (<T extends (...args: any[]) => any>(fn: T): T => fn)) as <T extends (...args: any[]) => any>(fn: T) => T;

import { resolveCanonicalTemplate, TemplateDefinition } from "@/lib/website-builder/template-registry";

export interface LoadedStore {
  raw: any;
  pageData: any;
  componentName: string;
  ghubaData?: any;
  canonicalTemplate: TemplateDefinition;
}

export const loadStore = requestCache(async (slug: string): Promise<LoadedStore> => {
  const raw = await findCompanyCached(slug, "page");

  if (!raw) notFound();

  const pageData = transformCompanyToStoreForm(raw);
  const isGhuba = isGhubaMarketplace(slug, raw);

  const categoryInput = pageData.category || "other";
  const variantInput = pageData.variant || "";

  const category = isGhuba ? "portal" : categoryInput;
  const variant = isGhuba ? "ghuba" : variantInput;

  const canonicalTemplate = isGhuba
    ? resolveCanonicalTemplate("portal", "ghuba", "ghuba@v1")
    : resolveCanonicalTemplate(
        raw?.category,
        raw?.variant,
        raw?.website?.templateKey
      );

  const componentName = isGhuba
    ? "GhubaSite"
    : (canonicalTemplate.bodyComponent || getComponentNameForCategory(category, variant || ""));

  // Fetch global Ghuba marketplace data instantly from cache if applicable
  let ghubaData = null;
  if (isGhuba) {
    ghubaData = await getGhubaHomepageCached();
  }

  return { raw, pageData, componentName, ghubaData, canonicalTemplate };
});
