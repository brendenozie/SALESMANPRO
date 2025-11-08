import React from "react";
import ProductsPageClient from "./ProductsPageClient";

const apiUrl = "/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

async function getData() {
  let productsData = [];
  let categoriesData = [];
  let agentsData = [];

  try {
    const [productsRes, categoriesRes, agentsRes] = await Promise.all([
      fetch(`${apiUrl}/clients/getAllProducts`, { cache: "no-store" }),
      fetch(`${apiUrl}/admin/get-all-categories`, { cache: "no-store" }),
      fetch(`${apiUrl}/admin/get-all-agents`, { cache: "no-store" }),
    ]);

    if (productsRes.ok) productsData = await productsRes.json();
    if (categoriesRes.ok) {
      const categories = await categoriesRes.json();
      categoriesData = categories.results || [];
    }
    if (agentsRes.ok) agentsData = await agentsRes.json();
  } catch (error) {
    console.error("❌ Error fetching data:", error);
  }

  return { productsData, categoriesData, agentsData };
}

export default async function ProductsPage() {
  const { productsData, categoriesData, agentsData } = await getData();

  return (
    <ProductsPageClient
      productsData={productsData}
      categoriesData={categoriesData}
      agentsData={agentsData}
    />
  );
}
