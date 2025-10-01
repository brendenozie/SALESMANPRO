// app/admin/[slug]/services/page.tsx
import React from "react";
import AdminServicesClient from "./AdminServicesClient"; // Adjust path as needed
import { IStoreCategory, MarketListingForm } from "@/types/typings";

import { cookies } from "next/headers";


const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: {
    slug: string; // This will be the companyId
  };
}

export default async function ServicesPage({ params }: PageProps) {
  const companyId = params.slug;
  
    const cookieHeader = await cookies().toString();

  let initialServices: MarketListingForm[] = [];
  let categoriesData: IStoreCategory[] = [];

  try {
    // Fetch marketplace listings for the given companyId
    const res = await fetch(
      `${apiUrl}/admin/my-market-place?companyId=${encodeURIComponent(companyId)}`,
      { cache: 'no-store' , headers: { Cookie: cookieHeader } }
    );

    // Fetch all categories for this company
    const categoriesRes = await fetch(
      `${apiUrl}/admin/get-store-categories?companyId=${encodeURIComponent(
        companyId
      )}`,
      { cache: 'no-store' , headers: { Cookie: cookieHeader } }
    );

    if (categoriesRes.ok) {
      const categoriesJson = await categoriesRes.json();
      console.log("Categories JSON:", categoriesJson);
      const results = categoriesJson.data.results;
      categoriesData = Array.isArray(results) ? results : [];
    }

    if (res.ok) {
      const json = await res.json();
      // Determine which key holds the array
      const rawList =
        Array.isArray(json)
          ? json
          : Array.isArray((json as any).data.results)
          ? (json as any).data.results
          : Array.isArray((json as any).data.listing)
          ? (json as any).data.listing
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
    } else {
      console.error(
        `Failed to fetch services: ${res.status} ${res.statusText}`
      );
    }
  } catch (error) {
    console.error("Error fetching initial services:", error);
    initialServices = [];
  }

  console.log(initialServices);

  return (
    <div>
      <AdminServicesClient
        initialServices={initialServices}
        // TODO: Replace dummy lists with real API-driven data
        productCategories={[
          { id: "cat1", name: "Electronics" },
          { id: "cat2", name: "Services" },
          { id: "cat3", name: "Real Estate" },
          { id: "cat4", name: "Vehicles" },
          { id: "cat5", name: "Digital Goods" },
        ]}
        paymentOptions={[
          "AT SHOP",
          "MOBILE MONEY",
          "BANK TRANSFER",
          "CREDIT CARD",
        ]}
        deliveryMethods={[
          "On-site",
          "Remote/Virtual",
          "At Location",
          "Shipping",
          "Pickup",
        ]}
        sellers={[ { id: "seller1", name: "John Doe" }, { id: "seller2", name: "Jane Smith" } ]}
        companies={[ { id: "company1", name: "Acme Corp" }, { id: "company2", name: "Widgets Ltd" } ]}
        companyId={companyId}
        categoriesData={categoriesData}
      />
    </div>
  );
}
