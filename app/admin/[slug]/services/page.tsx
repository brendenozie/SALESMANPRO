import React from "react";
import AdminServicesClient from "./AdminServicesClient";
import { IStoreCategory, MarketListingForm } from "@/types/typings";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ServicesPage({ params }: PageProps) {
  const { slug: companyId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialServices: MarketListingForm[] = [];
  let categoriesData: IStoreCategory[] = [];

  try {
    // Parallelize network requests to optimize page render time
    const [listingsRes, categoriesRes] = await Promise.all([
      fetch(`${apiBaseUrl}/admin/my-market-place?companyId=${encodeURIComponent(companyId)}`, {
        cache: "no-store",
        headers: { Cookie: cookieHeader },
      }),
      fetch(`${apiBaseUrl}/admin/get-store-categories?companyId=${encodeURIComponent(companyId)}`, {
        cache: "no-store",
        headers: { Cookie: cookieHeader },
      }),
    ]);

    if (categoriesRes.ok) {
      const categoriesJson = await categoriesRes.json();
      const results = categoriesJson?.data?.results;
      categoriesData = Array.isArray(results) ? results : [];
    }

    if (listingsRes.ok) {
      const json = await listingsRes.json();
      const rawList = Array.isArray(json)
        ? json
        : Array.isArray(json?.data?.results)
        ? json.data.results
        : Array.isArray(json?.data?.listing)
        ? json.data.listing
        : [];

      initialServices = rawList.map((item: any) => ({
        ...item,
        startDealDate: item.startDealDate ? new Date(item.startDealDate) : undefined,
        endDealDate: item.endDealDate ? new Date(item.endDealDate) : undefined,
        availabilityStart: item.availabilityStart ? new Date(item.availabilityStart) : undefined,
        availabilityEnd: item.availabilityEnd ? new Date(item.availabilityEnd) : undefined,
        createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
      }));
    }
  } catch (error) {
    console.error("Critical error building server state for services layout context:", error);
  }

  // Dynamic values injected safely below to match configuration schemas
  // const paymentOptions = ["AT SHOP", "MOBILE MONEY", "BANK TRANSFER", "CREDIT CARD"];
  // const deliveryMethods = ["On-site", "Remote/Virtual", "At Location", "Shipping", "Pickup"];

  return (
    <AdminServicesClient
      initialServices={initialServices}
      companyId={companyId}
      categoriesData={categoriesData}
      // paymentOptions={paymentOptions}
      // deliveryMethods={deliveryMethods}
    />
  );
}