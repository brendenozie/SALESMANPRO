import React from "react";
import ClientInventoryClient from "./ClientInventoryClient";
import { IStoreCategory, MarketListingForm } from "@/types/typings";
import { cookies } from "next/headers";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

type Category = {
  id: string;
  name: string;
  image: string;
  tags: string[];
  status: string;
};

interface PageProps {
  params: {
    slug: string; // this is companyId
  };
}

export default async function ClientInventoryPage({ params }: PageProps) {
  const companyId = params.slug;
  const cookieHeader = await cookies().toString();

  let productsData: MarketListingForm[] = [];
  let categoriesData: IStoreCategory[] = [];

  try {
    // --- Fetch marketplace listings ---
    const res = await fetch(
      `${apiUrl}/admin/my-market-place?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { Cookie: cookieHeader } }
    );
    if (res.ok) {
      const json = await res.json();
      console.log(json);
      productsData = Array.isArray(json.data.results) ? json.data.results : [];
    } else {
      console.error(
        "[ClientInventoryPage] Failed to fetch marketplace products:",
        res.status,
        res.statusText
      );
    }

    // --- Fetch store categories ---
    const categoriesRes = await fetch(
      `${apiUrl}/admin/get-store-categories?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { Cookie: cookieHeader } }
    );

    if (categoriesRes.ok) {
      const json = await categoriesRes.json();
      categoriesData = Array.isArray(json.data.results) ? json.data.results : [];
    } else {
      console.error(
        "[ClientInventoryPage] Failed to fetch store categories:",
        categoriesRes.status,
        categoriesRes.statusText
      );
    }

  } catch (err: any) {
    console.error("[ClientInventoryPage] Error during fetch:", err?.message || err);
  }

  return (
    <ClientInventoryClient
      companyId={companyId}
      productsData={productsData}
      categoriesData={categoriesData}
    />
  );
}
