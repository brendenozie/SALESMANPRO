import { cookies } from "next/headers";
import PassengerManifestClient from "./PassengerManifestClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function DriversPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: shiftId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialDrivers = [];  
  try {
    // We assume an endpoint that filters staff by role 'DRIVER'
    const res = await fetch(
      `${apiBaseUrl}/admin/transport/drivers?companyId=${shiftId}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 60 },
      }
    );

    if (res.ok) {
      initialDrivers = (await res.json()).data;
    }
  } catch (err) {
    console.error("[DriversPage] Failed to load drivers", err);
  }

  return (
    <PassengerManifestClient 
      shiftId={shiftId}      
    />
  );
}