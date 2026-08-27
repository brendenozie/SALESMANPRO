import { Suspense } from "react";
import ClientsContent from "./ClientsContent";

async function getClientsData() {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
  try {
    const res = await fetch(`${url}/agent/clients`, {
      next: { revalidate: 60 }, // revalidate data every 1 minute
    });
    if (!res.ok) throw new Error("Failed to fetch clients");
    return await res.json();
  } catch (err) {
    console.error("Error fetching clients:", err);
    return [];
  }
}

export default async function ClientsPage() {
  const clientsData = await getClientsData();

  return (
    <Suspense fallback={<div className="text-center py-10 text-gray-400">Loading clients...</div>}>
      <ClientsContent clientsData={clientsData} />
    </Suspense>
  );
}
