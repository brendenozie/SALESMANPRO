import React from "react";
import { cookies } from "next/headers";
import BulkImportClient from "./BulkImportClient";
import { IStoreCategory } from "@/types/typings";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function ClientImportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: companyId } = await params;
  const cookieHeader = (await cookies()).toString();

  let categories: IStoreCategory[] = [];

  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/get-store-categories?companyId=${encodeURIComponent(companyId)}`,
      { headers: { Cookie: cookieHeader } }
    );
    if (res.ok) {
      const json = await res.json();
      categories = Array.isArray(json.data.results) ? json.data.results : [];
    }
  } catch (err) {
    console.error("Failed to fetch categories for import mapping", err);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <BulkImportClient companyId={companyId} categories={categories} />
    </div>
  );
}