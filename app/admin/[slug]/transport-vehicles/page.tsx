import { cookies } from "next/headers";
import TransportFleetClient from "./TransportFleetClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TransportVehiclesPage({ params }: PageProps) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialVehicles = [];  
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/transport/vehicles?companyId=${schoolId}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 60 },
      }
    );

    if (res.ok) {
      initialVehicles = (await res.json()).data;
      console.log("[TransportVehiclesPage] Loaded vehicles:", initialVehicles);
    }
  } catch (err) {
    console.error("[TransportVehiclesPage] Failed to load vehicles", err);
  }

  return (
    <TransportFleetClient
      initialVehicles={initialVehicles}
      schoolId={schoolId}
    />
  );
}