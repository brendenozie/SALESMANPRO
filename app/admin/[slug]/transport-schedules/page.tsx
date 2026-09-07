import { cookies } from "next/headers";
import TransportScheduleClient from "./TransportScheduleClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export default async function TransportSchedulePage({ params }: { params: Promise<{ slug: string }> }) {
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
  let initialShifts = [];  
  let initialDrivers = [];
  let initialRoutes = [];
  let initialVehicles = [];

  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/transport/shifts?companyId=${encodeURIComponent(companyId)}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 0 }, // Schedules change often, so no cache
      }
    );

    if (res.ok) {
      initialShifts = (await res.json()).data;
    }

    const resDrivers = await fetch(
      `${apiBaseUrl}/admin/transport/drivers?companyId=${encodeURIComponent(companyId)}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 60 },
      }
    );

    if (resDrivers.ok) {
      initialDrivers = (await resDrivers.json()).data;
    }

    const resRoutes = await fetch(
      `${apiBaseUrl}/admin/transport/routes?companyId=${encodeURIComponent(companyId)}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 60 },
      }
    );

    if (resRoutes.ok) {
      initialRoutes = (await resRoutes.json()).data;
    }

    const resVehicles = await fetch(
      `${apiBaseUrl}/admin/transport/vehicles?companyId=${encodeURIComponent(companyId)}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 60 },
      }
    );

    if (resVehicles.ok) {
      initialVehicles = (await resVehicles.json()).data;
    }

  } catch (err) {
    console.error("[SchedulePage] Failed to load shifts", err);
  }

  return (
    <TransportScheduleClient
      initialShifts={initialShifts}
      initialDrivers={initialDrivers}
      initialRoutes={initialRoutes}
      initialVehicles={initialVehicles}
      schoolId={companyId}
    />
  );
}