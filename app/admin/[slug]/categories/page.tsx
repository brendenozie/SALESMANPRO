import React from 'react';
import CategoryManagerClient from './CategoryManagerClient';
import { IStoreCategory } from '@/types/typings';
import { cookies } from "next/headers";


const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface PageProps {
  params: {
    slug: string; // company ID
  };
}

/**
 * Server Component: fetches store-specific category settings
 * and passes them down to the client component.
 */
export default async function CategoryManagerPage({ params }: PageProps) {
  let storeCategories: IStoreCategory[] = [];
  const companyId = params.slug;

  try {
    const cookieHeader = cookies().toString();

    console.log('Fetching store categories for company:', params.slug);
    const res = await fetch(
      `${apiUrl}/admin/get-store-categories?companyId=${params.slug}`,
      { cache: 'no-store', headers: { Cookie: cookieHeader } },
    );

    if (res.ok) {
      console.log(`res.json() for company ${params.slug} categories`);

      const resJson = await res.json();

      console.log('resJson:', resJson);
      // Ensure the response has the expected structure
      if (!resJson || !resJson.data) {
        throw new Error('Invalid response structure');
      }

      console.log('resJson.results:', resJson.results);

      const data = resJson.results || resJson.data.results || resJson.data; // Handle both cases
      
      storeCategories = data.map((sc: any) => ({
        id: sc.id,
        companyId: sc.companyId,
        categoryId: sc.categoryId,
        displayName: sc.displayName,
        icon: sc.icon || sc.category.icon,
        sortOrder: sc.sortOrder,
        visible: sc.visible,
        subcategories: Array.isArray(sc.items)
          ? sc.items.map((sub: any) => ({
              id: sub.id,
              name: sub.name,
              slug: sub.slug,
              sortOrder: sub.sortOrder,
              visible: sub.visible,
            }))
          : Array.isArray(sc.category.subcategories)
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
          id: sc.category.id,
          name: sc.category.name,
          slug: sc.category.slug,
          description: sc.category.description,
          longDescription: sc.category.longDescription,
          seoTitle: sc.category.seoTitle,
          seoDescription: sc.category.seoDescription,
          metaKeywords: sc.category.metaKeywords,
          sortOrder: sc.category.sortOrder,
          visible: sc.category.visible,
          isFeatured: sc.category.isFeatured,
          showInHomepage: sc.category.showInHomepage,
          attributes: sc.category.attributes,
          subcategories: Array.isArray(sc.category.subcategories)
            ? sc.category.subcategories.map((sub: any) => ({
                id: sub._id?.$oid || sub.id,
                name: sub.name,
                slug: sub.slug,
                sortOrder: sub.sortOrder,
                visible: sub.visible,
              }))
            : [],
          icon: sc.category.icon,
          image: sc.category.image,
        },
      }));
      console.log('Fetched store categories:', storeCategories);
    } else {
      console.error('Failed to fetch store categories', res.status, res.statusText);
    }
  } catch (e: any) {
    console.error('Error fetching store categories', e.message);
  }

  return <CategoryManagerClient initialCategories={storeCategories} apiUrl={apiUrl} companyId={companyId} />;
}
