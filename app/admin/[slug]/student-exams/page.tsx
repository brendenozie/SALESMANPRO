// app/admin/categories-manager/page.tsx

import React from "react";
import StudentExamsPage from "./StudentExamsPage";

import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

// Define your Category and Subcategory shapes (adjust fields if your API differs)
export type Subcategory = {
  _id: { $oid: string };
  name: string;
  slug: string;
  sortOrder: number;
  visible: boolean;
};

export type Category = {
  _id: { $oid: string };
  name: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string[];
  sortOrder?: number;
  visible?: boolean;
  isFeatured?: boolean;
  showInHomepage?: boolean;
  attributes?: Record<string, any>;
  subcategories: Subcategory[];
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Server Component: fetches all categories (including their subcategories)
 * and passes them down to the client component.
 */
export default async function CategoryManagerPage({ params }: PageProps) {
  let categoriesData: Category[] = [];

    const { slug } = await params;
  
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

  try {
    const res = await fetch(`${apiBaseUrl}/admin/get-categories`, {
      next: { revalidate: 60 }, // SSR on every request
    });

    if (res.ok) {
      // Assuming API responds with { categories: Category[] }
      const json = (await res.json()) as { categories: Category[] };
      categoriesData = json.categories;
    } else {
      console.error(
        "[CategoryManagerPage] Failed to fetch categories →",
        res.status,
        res.statusText
      );
    }
  } catch (err: any) {
    console.error("[CategoryManagerPage] Error fetching categories →", err.message);
  }

  return <StudentExamsPage />;
}
