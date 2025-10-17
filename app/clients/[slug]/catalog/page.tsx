import React from "react";
import ClientLayout from "@/components/ClientLayout";
import ProductsPageClient from "./ProductsPageClient";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function ProductsPage() {
  let productsData = [];
  let categoriesData = [];
  let agentsData: any[] = [];

  try {
    const [productsResponse, categoriesResponse] = await Promise.all([
      fetch(`${apiUrl}/clients/getAllProducts`, { cache: "no-store" }),
      fetch(`${apiUrl}/admin/get-all-categories`, { cache: "no-store" }),
    ]);

    if (productsResponse.ok) {
      productsData = await productsResponse.json();
    }

    if (categoriesResponse.ok) {
      const categories = await categoriesResponse.json();
      categoriesData = categories.results || [];
    }

    if (!Array.isArray(productsData)) {
      throw new Error("Products API response is not an array.");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }

  return (
    <ClientLayout>
      <ProductsPageClient
        productsData={productsData}
        categoriesData={categoriesData}
        agentsData={agentsData}
      />
    </ClientLayout>
  );
}
