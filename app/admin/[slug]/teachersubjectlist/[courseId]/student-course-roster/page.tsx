// app/admin/[slug]/inventory/page.tsx

import React from "react";
import StudentRosterPage from "./StudentRosterPage";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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

type Category = {
  id: string;
  name: string;
  image: string;
  tags: string[];
  status: string;
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
  params:Promise<{ slug: string }>
}

/**
 * This is a **Server Component**. It fetches all the data
 * at request‐time (no caching, just like getServerSideProps),
 * then renders the Client Component below.
 */
export default async function AdminInventoryPage({ params }: Props) {
  const { slug : companyId } = await params;

  let productsData: Product[] = [];
  let categoriesData: Category[] = [];
  let agentsData: Agent[] = [];

  try {
    // Fetch all products for this company
    const productsRes = await fetch(
      `${apiBaseUrl}/admin/get-all-products?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 } } // equivalent to SSR on every request
    );
    if (productsRes.ok) {
      productsData = (await productsRes.json()) as Product[];
    }

    // Fetch all categories for this company
    const categoriesRes = await fetch(
      `${apiBaseUrl}/admin/get-store-categories?companyId=${encodeURIComponent(
        companyId
      )}`,
      { next: { revalidate: 60 } }
    );
    if (categoriesRes.ok) {
      const categoriesJson = (await categoriesRes.json()) as {
        results: Category[];
      };
      categoriesData = categoriesJson.results;
    }

    // Fetch all agents for this company
    const agentsRes = await fetch(
      `${apiBaseUrl}/admin/get-all-agents?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 } }
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
    // console.error("AdminInventoryPage-fetch error:", err.message);
    // We simply proceed with empty arrays if something fails.
  }

  // You need to determine how to get the classId; here we use a placeholder.
  const classId = "CL101"; // TODO: Replace with actual classId value

  return (
    <StudentRosterPage
      classId={classId}
    />
  );
}
