import { cookies } from "next/headers";
import RouteMappingClient from "./RouteMappingClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function RouteMappingPage({ params }: { params: Promise<{ slug: string }> }) {
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
  let initialData = { routes: [], vehicles: [], drivers: [] };
  
  try {
    const [routeRes, vehRes, driverRes] = await Promise.all([
      fetch(`${apiBaseUrl}/admin/transport/routes?companyId=${encodeURIComponent(companyId)}`, { headers: { cookie: cookieHeader } }),
      fetch(`${apiBaseUrl}/admin/transport/vehicles?status=ACTIVE&companyId=${encodeURIComponent(companyId)}`, { headers: { cookie: cookieHeader } }),
      fetch(`${apiBaseUrl}/admin/users?role=DRIVER&companyId=${encodeURIComponent(companyId)}`, { headers: { cookie: cookieHeader } })
    ]);

    if (routeRes.ok) initialData.routes = (await routeRes.json()).data;
    if (vehRes.ok) initialData.vehicles = (await vehRes.json()).data;
    if (driverRes.ok) initialData.drivers = (await driverRes.json()).data;
  } catch (err) {
    console.error("Failed to load mapping data", err);
  }

  return <RouteMappingClient initialData={initialData} schoolId={companyId} />;
}