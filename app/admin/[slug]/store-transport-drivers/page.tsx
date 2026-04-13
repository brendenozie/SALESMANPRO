import { cookies } from "next/headers";
import DriversPageClient, { Driver } from "./DriversPageClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface pageProps {
  params: Promise<{ slug: string }>;
}

export default async function DriversPage({ params }: pageProps) {
  
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialDrivers : Driver[] = [];  
  
  try {
    // We assume an endpoint that filters staff by role 'DRIVER'
    const res = await fetch(
      `${apiBaseUrl}/admin/transport/drivers?companyId=${schoolId}`,
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
      <DriversPageClient
        initialDrivers={initialDrivers}
        schoolId={schoolId}
      />
  );
}