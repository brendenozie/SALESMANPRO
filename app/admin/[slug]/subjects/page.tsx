// app/admin/categories-manager/page.tsx

import React from "react";
import SubjectsPage from "./SubjectsPage";

const apiUrl = "/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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
  // No dynamic route params here; adjust if you move under [slug].
}

/**
 * Server Component: fetches all categories (including their subcategories)
 * and passes them down to the client component.
 */
export default async function CategoryManagerPage(_: PageProps) {
  let categoriesData: Category[] = [];

  try {
    const res = await fetch(`${apiUrl}/admin/get-categories`, {
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

  return <SubjectsPage />;
}
