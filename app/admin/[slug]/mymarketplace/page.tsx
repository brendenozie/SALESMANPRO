import React from "react";
import ClientInventoryClient from "./ClientInventoryClient";
import { IStoreCategory, MarketListingForm } from "@/types/typings";
import { cookies } from "next/headers";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

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
  const { slug } = await params;
  const cookieHeader = (await cookies()).toString();

  const page = Number(searchParams?.page || 1);
  const limit = 20;

  let productsData: MarketListingForm[] = [];
  let meta = { page, limit, total: 0, totalPages: 1 };
  
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
      slug={slug}
      page={page}
      limit={limit}
      searchParams={searchParams}
      productsData={productsData}
      categoriesData={categoriesData}
      pagination={meta}
    />
  );
}
