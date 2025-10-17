import { Suspense } from "react";
import ProductsContent from "./ProductsContent";

async function getInventoryData() {
  const salesAgentId = "63f7c9e2d91b1b2a5e80b016";
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  try {
    const res = await fetch(`${url}/agent/inventory?salesAgentId=${salesAgentId}`, {
      next: { revalidate: 60 }, // cache and revalidate every 60s
    });

    if (!res.ok) throw new Error(`Failed to fetch inventory: ${res.statusText}`);
    const data = await res.json();
    return data.inventory || [];
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return [];
  }
}

export default async function ProductsPage() {
  const inventoryData = await getInventoryData();

  return (
    <Suspense fallback={<div className="text-center py-10 text-gray-400">Loading inventory...</div>}>
      <ProductsContent inventoryData={inventoryData} />
    </Suspense>
  );
}
