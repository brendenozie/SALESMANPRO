import React from 'react';
import CategoryManagerClient from './CategoryManagerClient';
import { IStoreCategory } from '@/types/typings';
import { cookies } from "next/headers";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;

interface PageProps {
  params:Promise<{ slug: string }>
}

/**
 * Server Component: fetches store-specific category settings
 * and passes them down to the client component.
 */
export default async function CategoryManagerPage({ params }: PageProps) {
  let storeCategories: IStoreCategory[] = [];
  const { slug } = await params;

  const cookieHeader = (await cookies()).toString();
  
    const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    const identifier = slug || session?.user?.id || '';
  
    // 2. Retrieve the memoized company data (no extra DB cost)
    const company = await findCompanyCached(identifier, "page");
  
    if (!company) {
      return <div>Company not found</div>;
    }
  
    // Use the actual database ID for your API calls, ensuring consistency
    const companyId = company.id;

  const res = await fetch(
      `${apiBaseUrl}/admin/get-store-categories?companyId=${companyId}`,
      { cache: 'no-store', headers: { Cookie: cookieHeader } },
  );

    if (res.ok) {
      
      const resJson = await res.json();

      // Ensure the response has the expected structure
      if (!resJson || !resJson.data.results || !resJson.data) {
        throw new Error('Invalid response structure');
      }

      const data = resJson.data.results || resJson.results || resJson.data; // Handle both cases
      
      storeCategories = data.map((sc: any) => ({
        id: sc.id,
        companyId: sc.companyId,
        categoryId: sc.categoryId,
        displayName: sc.displayName,
        icon: sc.icon || sc.category.icon,
        sortOrder: sc.sortOrder,
        visible: sc.visible,
        subcategories: Array.isArray(sc.subcategories)
                          ? sc.subcategories.map((sub: any) => ({
                              id: sub._id?.$oid || sub.id,
                              name: sub.name,
                              slug: sub.slug,
                              sortOrder: sub.sortOrder,
                              visible: sub.visible,
                            }))
                          : Array.isArray(sc.items)
                            ? sc.items.map((sub: any) => ({
                                id: sub._id?.$oid || sub.id,
                                name: sub.name,
                                slug: sub.slug,
                                sortOrder: sub.sortOrder,
                                visible: sub.visible,
                              }))
                            : Array.isArray(sc.category?.subcategories) // Safe check for sc.category
                              ? sc.category.subcategories.map((sub: any) => ({
                                  id: sub._id?.$oid || sub.id,
                                  name: sub.name,
                                  slug: sub.slug,
                                  sortOrder: sub.sortOrder,
                                  visible: sub.visible,
                                }))
                              : [],
        allBrands: sc.allBrands || [],
        category: {
          id: sc.category?.id || sc.categoryId,
          name: sc.category?.name,
          slug: sc.category?.slug,
          description: sc.category?.description,
          longDescription: sc.category?.longDescription,
          seoTitle: sc.category?.seoTitle,
          seoDescription: sc.category?.seoDescription,
          metaKeywords: sc.category?.metaKeywords,
          sortOrder: sc.category?.sortOrder,
          visible: sc.category?.visible,
          isFeatured: sc.category?.isFeatured,
          showInHomepage: sc.category?.showInHomepage,
          attributes: sc.category?.attributes,
          subcategories: Array.isArray(sc.category?.subcategories)
            ? sc.category?.subcategories.map((sub: any) => ({
                id: sub._id?.$oid || sub.id,
                name: sub.name,
                slug: sub.slug,
                sortOrder: sub.sortOrder,
                visible: sub.visible,
              }))
            : [],
          icon: sc.category?.icon,
          image: sc.category?.image,
        },
      }));
      
    } else {
      console.error('Failed to fetch store categories', res.status, res.statusText);
    }

  return <CategoryManagerClient initialCategories={storeCategories} apiBaseUrl={apiBaseUrl} companyId={companyId} />;
}
