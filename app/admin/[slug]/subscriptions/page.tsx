// app/admin/clients/page.tsx

import React from "react";
import { cookies } from "next/headers";
import SubscriptionsClient from "./SubscriptionsClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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
 * (next: { revalidate: 60 }) and passes the array down to the client side.
 */
export default async function ClientsPage(_: PageProps) {
  let clientsData: Client[] = [];
  const cookieHeader = (await cookies()).toString();

  // try {
  //   const res = await fetch(`${apiBaseUrl}/admin/clients`, { next: { revalidate: 60 }, headers: { cookie: cookieHeader } });
  //   if (res.ok) {
  //     clientsData = (await res.json()).data as Client[];
  //   } else {
  //     console.error(
  //       "[ClientsPage] Failed to fetch clients →",
  //       res.status,
  //       res.statusText
  //     );
  //   }
  // } catch (err: any) {
  //   console.error("[ClientsPage] Error fetching clients →", err.message);
  // }

  return <SubscriptionsClient  />;
}
