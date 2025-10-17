import ClientsPageClient from "./ClientsPageClient";

export const revalidate = 30; // optional: re-fetch every 30s (ISR)

async function getClientsData() {
  try {
    const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    const res = await fetch(`${url}/clients`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch clients");
    return res.json();
  } catch (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
}

export default async function ClientsPage() {
  const clientsData = await getClientsData();

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800 p-6">
      <ClientsPageClient clientsData={clientsData} />
    </main>
  );
}
