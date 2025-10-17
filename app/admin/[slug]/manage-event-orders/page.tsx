import React from "react";
import { cookies } from "next/headers";
import AdminOrdersClient from "./AdminOrdersClient"; // Import the client component

// Define the API URL based on the environment
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// --- Shared Data Types (Matching the Client Component) ---
type Agent = {
  id: string;
  name: string;
  email: string;
  // ... other organizer fields
};

type Order = {
  id: string;
  eventId: string;
  userId: string;
  customerName?: string;
  customerEmail?: string;
  totalPrice: number;
  status: 'COMPLETED' | 'PENDING' | 'REFUNDED' | 'CANCELLED' | string;
  createdAt: string;
  paymentMethod?: string;
  paymentTransactionId?: string;
  items?: any[];
};

interface Props {
  params: {
    slug: string; // companyId
  };
}

export default async function AdminOrdersPage({ params }: Props) {
  const { slug : companyId } = await params;

  // ✅ 1. Serialize cookies for secure server-side fetching
  const cookiesHeader = (await cookies())
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  let allOrganizers: Agent[] = [];
  let allOrders: Order[] = [];
  let initialFetchError: string | null = null;

  try {
    // --- 2. Fetch Organizers (Agent Data) ---
    const organizersRes = await fetch(
      `${apiUrl}/admin/agents?companyId=${encodeURIComponent(companyId)}`,
      { 
        next: { revalidate: 60 }, 
        headers: { cookie: cookiesHeader },
        // Add a timeout if needed: signal: AbortSignal.timeout(5000)
      }
    );
    if (organizersRes.ok) {
      const organizersJson = await organizersRes.json();
      allOrganizers = organizersJson.data as Agent[];
    } else {
       console.warn(`AdminOrdersPage: Failed to fetch organizers (Status: ${organizersRes.status})`);
    }

    // --- 3. Fetch ALL Orders (The complete, unfiltered dataset) ---
    // The client component will handle the filtering/searching.
    const ordersRes = await fetch(
      `${apiUrl}/admin/orders?companyId=${encodeURIComponent(companyId)}`,
      { 
        next: { revalidate: 60 }, 
        headers: { cookie: cookiesHeader },
      }
    );
    
    if (ordersRes.ok) {
      const ordersJson = await ordersRes.json();
      // Assuming the API returns the order list in a 'data' or 'orders' field
      allOrders = (ordersJson.data || ordersJson.orders) as Order[]; 
    } else {
      const errorData = await ordersRes.json();
      throw new Error(errorData.message || `HTTP error! status: ${ordersRes.status}`);
    }
  } catch (err: any) {
    console.error("AdminOrdersPage-initial fetch error:", err.message);
    initialFetchError = "Failed to load initial data. Check backend connection and authorization.";
  }

  // --- 4. Error Fallback UI (Server-side rendered error) ---
  if (initialFetchError && allOrders.length === 0) {
      return (
        <div className="min-h-screen bg-gray-950 text-red-400 p-8 sm:p-12 font-sans">
          <h1 className="text-4xl font-bold mb-4">Initial Data Load Error 😟</h1>
          <p>We could not load the initial orders for company ID: **{companyId}**.</p>
          <p className="mt-2 text-red-300">**Details:** {initialFetchError}</p>
        </div>
      );
  }

  // --- 5. Pass Data to Client Component ---
  return (
    <AdminOrdersClient
      adminSlug={companyId}
      initialOrders={allOrders}    // The full dataset for client-side use
      allOrganizers={allOrganizers} // Auxiliary data
    />
  );
}