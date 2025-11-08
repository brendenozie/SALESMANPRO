// app/admin/clients/page.tsx
import React from "react";
import ClientsClient, { Client } from "./ClientsClient"; // Import the ClientsClient component and Client type
import { cookies } from "next/headers";

const apiUrl = "/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params:Promise<{ slug: string }>
}

/**
 * Server Component: fetches the clients on every request (next: { revalidate: 60 }),
 * then renders the client component with the fetched data.
 */
export default async function ClientsPage({ params }: PageProps) {
  const { slug : companyId } = await params;
  const cookieStore = (await cookies()).toString();

  let clientsData: Client[] = [];

  try {
    const res = await fetch(
      `${apiUrl}/admin/clients?companyId=${companyId}`,
      { 
        headers: { cookie: cookieStore }, 
        next: { revalidate: 60 } 
      }
    );

    if (res.ok) {
      clientsData = (await res.json()).data as Client[];
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

  // Pass companyId so ClientsClient can include it in POST/PATCH/DELETE calls
  return (
    <ClientsClient
      companyId={companyId}
      clientsData={clientsData}
    />
  );
}
