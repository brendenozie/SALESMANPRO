import { cookies } from "next/headers";
import RouteMappingClient from "./RouteMappingClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function RouteMappingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialData = { routes: [], vehicles: [], drivers: [] };
  
  try {
    const [routeRes, vehRes, driverRes] = await Promise.all([
      fetch(`${apiBaseUrl}/admin/transport/routes?companyId=${schoolId}`, { headers: { cookie: cookieHeader } }),
      fetch(`${apiBaseUrl}/admin/transport/vehicles?status=ACTIVE&companyId=${schoolId}`, { headers: { cookie: cookieHeader } }),
      fetch(`${apiBaseUrl}/admin/users?role=DRIVER&companyId=${schoolId}`, { headers: { cookie: cookieHeader } })
    ]);

    if (routeRes.ok) initialData.routes = (await routeRes.json()).data;
    if (vehRes.ok) initialData.vehicles = (await vehRes.json()).data;
    if (driverRes.ok) initialData.drivers = (await driverRes.json()).data;
  } catch (err) {
    console.error("Failed to load mapping data", err);
  }

  return <RouteMappingClient initialData={initialData} schoolId={schoolId} />;
}