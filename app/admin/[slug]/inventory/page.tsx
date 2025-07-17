// app/admin/[slug]/inventory/page.tsx

import React from "react";
import AdminInventoryClient from "./AdminInventoryClient";
import { StoreCategory } from "../categories/page";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

type Product = {
  id: string;
  name: string;
  companyId: string;
  inventoryId: string;
  category: string;
  agentStock: number;
  companyStock: number;
  sales: number;
  costPrice: number;
  salesPrice: number;
  commissionRate: number;
  commissionType: number;
};



type Tag = {
  id: string;
  name: string;
  image: string;
  status: string;
};

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

  let productsData: Product[] = [];
  let categoriesData: StoreCategory[] = [];
  let agentsData: Agent[] = [];

  try {
    // Fetch all products for this company
    const productsRes = await fetch(`${apiUrl}/admin/get-all-inventory?companyId=${encodeURIComponent(companyId)}`,
      { cache: "no-store" } // equivalent to SSR on every request
    );

    if (productsRes.ok) {
      productsData = (await productsRes.json()) as Product[];
    }

    // Fetch all categories for this company
    const categoriesRes = await fetch(`${apiUrl}/admin/get-store-categories?companyId=${encodeURIComponent(companyId )}`,
      { cache: "no-store" }
    );

    if (categoriesRes.ok) {
          const { results } = await categoriesRes.json() as { results: StoreCategory[] };
          categoriesData = Array.isArray(results) ? results : [];
    }

    // Fetch all agents for this company
    const agentsRes = await fetch(
      `${apiUrl}/admin/get-all-inventory-agents?companyId=${encodeURIComponent(companyId)}`,
      { cache: "no-store" }
    );
    if (agentsRes.ok) {
      agentsData = (await agentsRes.json()) as Agent[];
    }

    // Sanity check: ensure arrays
    if (!Array.isArray(productsData)) {
      throw new Error("Products API response is not an array.");
    }
    if (!Array.isArray(categoriesData)) {
      throw new Error("Categories API response is not an array.");
    }
    if (!Array.isArray(agentsData)) {
      throw new Error("Agents API response is not an array.");
    }
  } catch (err: any) {
    console.error("AdminInventoryPage-fetch error:", err.message);
    // We simply proceed with empty arrays if something fails.
  }


  console.log(productsData);
  console.log(categoriesData);
  console.log(agentsData);


  return (
    <AdminInventoryClient
      companyId={companyId}
      productsData={productsData}
      categoriesData={categoriesData}
      agentsData={agentsData}
    />
  );
}
