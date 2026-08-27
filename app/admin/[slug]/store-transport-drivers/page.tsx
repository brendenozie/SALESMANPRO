import { cookies } from "next/headers";
import DriversPageClient, { Driver } from "./DriversPageClient";

import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface pageProps {
  params: Promise<{ slug: string }>;
}

export default async function DriversPage({ params }: pageProps) {
  
  const { slug }  = await params;
  const cookieHeader = (await cookies()).toString();

    const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    const identifier = slug || session?.user?.id || '';
  
    // 2. Retrieve the memoized company data (no extra DB cost)
    const company = await findCompanyCached(identifier, "page");
  
    if (!company) {
      return <div>Company not found</div>;
    }
  
    // Use the actual database ID for your API calls, ensuring consistency
    const companyId = company.id;

  let initialDrivers : Driver[] = [];  
  
  try {
    // We assume an endpoint that filters staff by role 'DRIVER'
    const res = await fetch(
      `${apiBaseUrl}/admin/transport/drivers?companyId=${encodeURIComponent(companyId)}`,
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
        schoolId={companyId}
      />
  );
}