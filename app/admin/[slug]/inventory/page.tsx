// app/admin/[slug]/inventory/page.tsx

import React from "react";
import AdminInventoryClient, { InventoryItem } from "./AdminInventoryClient";
import { IStoreCategory } from "@/types/typings";
import { cookies } from "next/headers";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

type Agent = {
  id: string;
  name: string;
};

interface Props {
  params: {
    slug: string; // companyId
  };
}

/**
 * This is a **Server Component**. It fetches all the data
 * at request‐time (no caching, just like getServerSideProps),
 * then renders the Client Component below.
 */
export default async function AdminInventoryPage({ params }: Props) {
  const companyId = params.slug;

  let productsData: InventoryItem[] = [];
  let categoriesData: IStoreCategory[] = [];
  let agentsData: Agent[] = [];

  try {
    const cookieHeader = await cookies().toString();

    // Fetch all products for this company
    const productsRes = await fetch(`${apiUrl}/admin/get-all-inventory?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { Cookie: cookieHeader } } // equivalent to SSR on every request
    );

    if (productsRes.ok) {
      let prodeuctR = (await productsRes.json());
      console.log("prodeuctR:", prodeuctR);
      productsData = Array.isArray(prodeuctR.data.results) ? prodeuctR.data.results : [];

    }

    // Fetch all categories for this company
    const categoriesRes = await fetch(`${apiUrl}/admin/get-store-categories?companyId=${encodeURIComponent(companyId )}`,
      { next: { revalidate: 60 }, headers: { Cookie: cookieHeader } } // equivalent to SSR on every request
    );

    if (categoriesRes.ok) {
          const { data } = await categoriesRes.json() as { data: { results: IStoreCategory[] } };
          categoriesData = Array.isArray(data.results) ? data.results : [];
    }

    // Fetch all agents for this company
    const agentsRes = await fetch(
      `${apiUrl}/admin/get-all-inventory-agents?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { Cookie: cookieHeader } } // equivalent to SSR on every request
    );
    if (agentsRes.ok) {
      let agentsR= (await agentsRes.json());
      agentsData = Array.isArray(agentsR.data) ? agentsR.data : [];
    }

    // // Sanity check: ensure arrays
    // if (!Array.isArray(productsData)) {
    //   throw new Error("Products API response is not an array.");
    // }
    // if (!Array.isArray(categoriesData)) {
    //   throw new Error("Categories API response is not an array.");
    // }
    // if (!Array.isArray(agentsData)) {
    //   throw new Error("Agents API response is not an array.");
    // }
  } catch (err: any) {
    console.error("AdminInventoryPage-fetch error:", err.message);
    // We simply proceed with empty arrays if something fails.
  }

  return (
    <AdminInventoryClient
      companyId={companyId}
      productsData={productsData}
      categoriesData={categoriesData}
      agentsData={agentsData}
    />
  );
}
