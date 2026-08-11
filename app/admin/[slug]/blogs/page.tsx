import React from "react";
import BlogsClient from "./BlogsClient";
import { cookies } from "next/headers";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export type BlogItem = {
  id: string;
  companyId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  categories: string[];
  category: string | null;
  subCategory: string | null;
  tags: string[];
  author: { name: string; profileImage?: string } | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt: string | null;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  seo?: {
    id: string;
    title?: string;
    description?: string;
    keywords: string[];
  };
};

type Category = {
  id: string;
  name: string;
  image: string;
  tags: string[];
  status: string;
};

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BlogsPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const cookieHeader = (await cookies()).toString();
  
  // Extract page from URL or default to 1
  const page = typeof resolvedSearchParams.page === "string" ? parseInt(resolvedSearchParams.page, 10) : 1;
  const limit = 10;

  let blogsData: BlogItem[] = [];
  let categoriesData: any[] = [];
  let totalItems = 0;
  let totalPages = 0;
    
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
    const res = await fetch(
      `${apiBaseUrl}/admin/get-all-blogs?companyId=${encodeURIComponent(companyId)}&limit=${limit}&page=${page}`,
      { next: { revalidate: 60 }, headers: { cookie: cookieHeader } }
    );

    if (res.ok) {
      const json = await res.json() as {
        data: {
          meta: {
            totalItems: number;
            totalPages: number;
            currentPage: number;
            perPage: number;
          };
          results: BlogItem[];
        }
      };

      blogsData = json.data.results;
      totalItems = json.data.meta.totalItems;
      totalPages = json.data.meta.totalPages;
    } else {
      console.error(
        "[BlogsPage] Failed to fetch blogs:",
        res.status,
        res.statusText
      );
    }

    // Fetch all categories for this company
    const categoriesRes = await fetch(
      `${apiBaseUrl}/admin/get-store-categories?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { cookie: cookieHeader } }
    );
    if (categoriesRes.ok) {
      const categoriesJson = (await categoriesRes.json()) as {
        data: {
          results: any[];
        };
      };
      categoriesData = categoriesJson.data.results;
    }

  } catch (err: any) {
    console.error("[BlogsPage] Error fetching blogs:", err.message);
  }

  return (
    <BlogsClient
      companyId={companyId}
      categoriesData={categoriesData}
      blogs={blogsData}
      totalItems={totalItems}
      totalPages={totalPages}
      currentPage={page}
      perPage={limit}
    />
  );
}