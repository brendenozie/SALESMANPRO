import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { findCompanyCached, pageDataInclude } from "@/lib/company-fetcher";
import { transformCompanyToStoreForm } from "@/utils/transformPrismaToStoreForm";
import { getComponentNameForCategory } from "@/components/site/layouts/siteBodyComponentMap";
import { getGhubaHomepageCached } from "@/lib/ghuba-fetcher"; // <-- Add this import

export interface LoadedStore {
  raw: any;
  pageData: any;
  componentName: string;
  ghubaData?: any; // <-- Add this to the interface
}

export async function loadStore(slug: string): Promise<LoadedStore> {
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
}
