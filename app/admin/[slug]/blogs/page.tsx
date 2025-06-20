// app/admin/[slug]/blogs/page.tsx

import React from "react";
import BlogsClient from "./BlogsClient";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export type BlogItem = {
  id: string;
  companyId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  categories: string[];
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
  params: {
    slug: string; // companyId
  };
}

export default async function BlogsPage({ params }: PageProps) {
  const companyId = params.slug;
  const limit     = 10;
  const page      = 1;

  let blogsData: BlogItem[] = [];
  let categoriesData: Category[] = [];
  let totalItems = 0;
  let totalPages = 0;

  try {
    const res = await fetch(
      `${apiUrl}/blogs?companyId=${encodeURIComponent(companyId)}&limit=${limit}&page=${page}`,
      { cache: "no-store" }
    );

    if (res.ok) {
      const json = await res.json() as {
        meta: {
          totalItems: number;
          totalPages: number;
          currentPage: number;
          perPage: number;
        };
        results: BlogItem[];
      };

      blogsData   = json.results;
      totalItems  = json.meta.totalItems;
      totalPages  = json.meta.totalPages;
    } else {
      console.error(
        "[BlogsPage] Failed to fetch blogs:",
        res.status,
        res.statusText
      );
    }

    // Fetch all categories for this company
    const categoriesRes = await fetch(
      `${apiUrl}/admin/get-store-categories?companyId=${encodeURIComponent(
        companyId
      )}`,
      { cache: "no-store" }
    );
    if (categoriesRes.ok) {
      const categoriesJson = (await categoriesRes.json()) as {
        results: Category[];
      };
      categoriesData = categoriesJson.results;
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
