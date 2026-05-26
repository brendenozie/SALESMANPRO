import React from "react";
import ClientInventoryClient from "./ClientInventoryClient";
import { IStoreCategory, MarketListingForm } from "@/types/typings";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

type Category = {
  id: string;
  name: string;
  image: string;
  tags: string[];
  status: string;
};


interface PageProps {
  params: Promise<{ slug: string }>
  searchParams?: { page?: string }
}

export default async function ClientInventoryPage({ params, searchParams }: PageProps) {
  const { slug: companyId } = await params;
  const cookieHeader = (await cookies()).toString();

  const page = Number(searchParams?.page || 1);
  const limit = 20;

  let productsData: MarketListingForm[] = [];
  let meta = { page, limit, total: 0, totalPages: 1 };

  // Fetch paginated items
  const res = await fetch(
    `${apiBaseUrl}/admin/my-market-place?companyId=${companyId}&page=${page}&limit=${limit}`,
    { next: { revalidate: 60 }, headers: { Cookie: cookieHeader } }
  );

  if (res.ok) {
    const json = await res.json();
    productsData = json.data.results || [];
    meta = json.data.meta || meta;
  }

  // Fetch categories
  const categoriesRes = await fetch(
    `${apiBaseUrl}/admin/get-store-categories?companyId=${companyId}`,
    { next: { revalidate: 60 }, headers: { Cookie: cookieHeader } }
  );

  const categoriesData = categoriesRes.ok
    ? (await categoriesRes.json()).data.results
    : [];

  return (
    <ClientInventoryClient
      companyId={companyId}
      productsData={productsData}
      categoriesData={categoriesData}
      pagination={meta}
    />
  );
}
