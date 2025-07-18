// app/admin/clients/page.tsx (Recommended file path change for clarity)

import React from "react";
import ClientsClient from "./ClientsClient"; // Import the ClientsClient component

// Define the Client type, matching the one in ClientsClient.tsx
export type Client = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  totalPurchases: number;
  lastPurchaseDate: string | null;
  averageOrderValue: number;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: {
    slug: string; // companyId
  };
}

/**
 * Server Component: fetches the clients on every request (cache: "no-store"),
 * then renders the client component with the fetched data.
 */
export default async function ClientsPage({ params }: PageProps) { // Changed component name to ClientsPage
  const companyId = params.slug;
  let clientsData: Client[] = []; // Changed variable name to clientsData

  try {
    // Update the API endpoint to fetch client data
    const res = await fetch(`${apiUrl}/admin/clients?companyId=${companyId}`, { cache: "no-store" });
    if (res.ok) {
      clientsData = (await res.json()) as Client[];
      // Assuming the API returns an array of clients directly.
      // If your API returns { clients: [...] }, adjust accordingly:
      // const json = await res.json();
      // clientsData = json.clients;
    } else {
      console.error(
        "[ClientsPage] Failed to fetch clients →", // Updated console log message
        res.status,
        res.statusText
      );
    }
  } catch (err: any) {
    console.error("[ClientsPage] Error fetching clients →", err.message); // Updated console log message
  }

  return <ClientsClient clientsData={clientsData} />; // Pass clientsData to ClientsClient
}