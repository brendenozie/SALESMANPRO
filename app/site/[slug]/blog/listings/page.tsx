import React from "react";
import BlogsClient from "./BlogsClient";
import { cookies } from "next/headers";
import { findCompanyCached } from "@/lib/company-fetcher";
import { notFound } from "next/navigation";

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

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BlogsPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  
  const resolvedSearchParams = await searchParams;
  const cookieHeader = (await cookies()).toString();

  const baseCompany = await findCompanyCached(slug, "lean");
    if (!baseCompany) notFound();
  
  const page = typeof resolvedSearchParams.page === "string" ? parseInt(resolvedSearchParams.page, 10) : 1;
  const limit = 10;

  let blogsData: BlogItem[] = [];
  let categoriesData: any[] = [];
  let totalItems = 0;
  let totalPages = 0;

  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/get-all-blogs?companyId=${encodeURIComponent(baseCompany.id)}&limit=${limit}&page=${page}`,
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
      console.error("[BlogsPage] Failed to fetch blogs:", res.status, res.statusText);
    }

    const categoriesRes = await fetch(
      `${apiBaseUrl}/admin/get-store-categories?companyId=${encodeURIComponent(baseCompany.id)}`,
      { next: { revalidate: 60 }, headers: { cookie: cookieHeader } }
    );
    if (categoriesRes.ok) {
      const categoriesJson = (await categoriesRes.json()) as {
        data: { results: any[] };
      };
      categoriesData = categoriesJson.data.results;
    }

  } catch (err: any) {
    console.error("[BlogsPage] Error fetching blogs:", err.message);
  }

  return (
    <BlogsClient
      companyId={baseCompany.id}
      categoriesData={categoriesData}
      blogs={blogsData}
      totalItems={totalItems}
      totalPages={totalPages}
      currentPage={page}
      perPage={limit}
    />
  );
}