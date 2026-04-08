// app/admin/[slug]/orders/page.tsx
import React from "react";
import { cookies } from "next/headers";
import AdminOrdersClient from "./AdminOrdersClient"; // Ensure this path is correct

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// The types should ideally be more detailed/shared, but we use the provided ones for structure
type Agent = {
  id: string;
  name: string;
  email: string;
};

// Assuming the data fetched from /api/admin/orders includes all necessary fields
// for the client component (customerName, customerEmail, totalPrice, status, createdAt)
type Order = {
  id: string;
  eventId: string;
  userId: string;
  customerName?: string; // Add fields needed by the Client Component
  customerEmail?: string;
  totalPrice: number; // Use totalPrice to match the client component's usage
  status: 'COMPLETED' | 'PENDING' | 'REFUNDED' | 'CANCELLED' | string;
  createdAt: string;
  // ... potentially other fields like items for modal preview
};

interface Props {
  params:Promise<{ slug: string }>
}

export default async function AdminOrdersPage({ params }: Props) {
  const { slug : companyId } = await params;

  // ✅ Serialize cookies correctly
  const cookiesHeader = (await cookies())
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  let allOrganizers: Agent[] = [];
  let allOrders: Order[] = []; // Type assertion will be needed

  let initialFetchError: string | null = null; // New state to track server-side errors

  try {
    // 1. Fetch organizers (Unchanged)
    const organizersRes = await fetch(
      `${apiBaseUrl}/admin/agents?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { cookie: cookiesHeader } }
    );
    if (organizersRes.ok) {
      const organizersJson = await organizersRes.json();
      allOrganizers = organizersJson.data as Agent[];
    }

    // 2. Fetch ALL orders initially (Crucial change: No search/filter query params here)
    // NOTE: The API endpoint used by the Server Component must return all orders for the admin.
    const ordersRes = await fetch(
      // Assuming your API endpoint for all orders is simply /admin/{slug}/orders
      `${apiBaseUrl}/admin/orders?companyId=${encodeURIComponent(companyId)}`, 
      { next: { revalidate: 60 }, headers: { cookie: cookiesHeader } }
    );
    if (ordersRes.ok) {
      const ordersJson = await ordersRes.json();
      // console.log("AdminOrdersPage-fetch all orders →", ordersJson);
      // Assuming the API returns an object like { orders: [...] }
      allOrders = ordersJson.data.orderItems as Order[]; 
    } else {
      const errorData = await ordersRes.json();
      throw new Error(errorData.message || `HTTP error! status: ${ordersRes.status}`);
    }
  } catch (err: any) {
    // console.error("AdminOrdersPage-fetch error:", err.message);
    initialFetchError = err.message || "Failed to load initial data. Please try refreshing.";
  }

  // // If there's a severe error on initial fetch, you can render a fallback message
  // if (initialFetchError && allOrders.length === 0) {
  //     return (
  //       <div className="min-h-screen bg-gray-950 text-red-400 p-8 sm:p-12 font-sans">
  //         <h1 className="text-4xl font-bold mb-4">Data Loading Error</h1>
  //         <p>Could not load initial orders data for company ID: {companyId}.</p>
  //         <p className="mt-2 text-red-300">{initialFetchError}</p>
  //       </div>
  //     );
  // }


  return (
    <AdminOrdersClient
      adminSlug={companyId}
      initialOrders={allOrders} // Pass the fetched orders as initial data
      allOrganizers={allOrganizers} // Pass auxiliary data
    />
  );
}