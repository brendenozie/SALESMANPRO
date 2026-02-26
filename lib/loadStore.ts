// lib/loadStore.ts
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { findCompanyCached, pageDataInclude } from '@/lib/company-fetcher';
import { transformCompanyToStoreForm } from '@/utils/transformPrismaToStoreForm';
import { getComponentNameForCategory } from '@/components/site/layouts/siteBodyComponentMap';
import { BodyComponentMap } from '@/components/site/BodyComponentMap';

export interface LoadedStore {
  raw: any;
  pageData: any;
  componentName: string;
  BodyComponent: any;
}

export async function loadStore(slug: string): Promise<LoadedStore> {
  const hdrs = await headers();
  const requestedHost = hdrs.get("x-requested-host");
  const requestedSubdomain = hdrs.get("x-requested-subdomain");

  const raw = await findCompanyCached(
    slug,
    requestedHost,
    requestedSubdomain,
    pageDataInclude()
  );

  if (!raw) notFound();

  const pageData = transformCompanyToStoreForm(raw);
  const componentName = getComponentNameForCategory(
    pageData.category,
    pageData.variant || ''
  );
  
  const BodyComponent = BodyComponentMap[componentName] || BodyComponentMap['DefaultSite'];

  return { raw, pageData, componentName, BodyComponent };
}
