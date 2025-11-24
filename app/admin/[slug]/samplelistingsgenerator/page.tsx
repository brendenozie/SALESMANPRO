import React from "react";
import SampleListingsGeneratorClient from "./SampleListingsGeneratorClient";
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
  params:Promise<{ slug: string }>
}

export default async function ClientInventoryPage({ params }: PageProps) {
  const { slug : companyId } = await params;
  const cookieHeader = (await cookies()).toString();

  let categoriesData: IStoreCategory[] = [];

  try {
 
    // --- Fetch store categories ---
    const categoriesRes = await fetch(
      `${apiBaseUrl}/admin/get-store-categories?companyId=${encodeURIComponent(companyId)}`,
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
    <SampleListingsGeneratorClient
      companyId={companyId}
      categories={categoriesData}
    />
  );
}
