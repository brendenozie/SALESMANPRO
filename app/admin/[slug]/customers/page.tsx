// app/admin/clients/page.tsx

import React from "react";
import ClientsClient from "./ClientsClient";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSales: number;
  recentTransactionAmount: number;
  recentTransactionDate: string;
  status: "new" | "active";
};

interface PageProps {
  // No dynamic route params for this page.
}

/**
 * Server Component that fetches clients on every request
 * (cache: "no-store") and passes the array down to the client side.
 */
export default async function ClientsPage(_: PageProps) {
  let clientsData: Client[] = [];

  try {
    const res = await fetch(`${apiUrl}/admin/clients`, { cache: "no-store" });
    if (res.ok) {
      clientsData = (await res.json()) as Client[];
    } else {
      console.error(
        "[ClientsPage] Failed to fetch clients →",
        res.status,
        res.statusText
      );
    }
  } catch (err: any) {
    console.error("[ClientsPage] Error fetching clients →", err.message);
  }

  return <ClientsClient initialClients={clientsData} />;
}
