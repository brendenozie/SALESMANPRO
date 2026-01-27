import { cookies } from "next/headers";
import TransportScheduleClient from "./TransportScheduleClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function TransportSchedulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialShifts = [];  
  let initialDrivers = [];
  let initialRoutes = [];
  let initialVehicles = [];

  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/transport/shifts?companyId=${schoolId}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 0 }, // Schedules change often, so no cache
      }
    );

    if (res.ok) {
      initialShifts = (await res.json()).data;
    }

    const resDrivers = await fetch(
      `${apiBaseUrl}/admin/transport/drivers?companyId=${schoolId}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 60 },
      }
    );

    if (resDrivers.ok) {
      initialDrivers = (await resDrivers.json()).data;
    }

    const resRoutes = await fetch(
      `${apiBaseUrl}/admin/transport/routes?companyId=${schoolId}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 60 },
      }
    );

    if (resRoutes.ok) {
      initialRoutes = (await resRoutes.json()).data;
    }

    const resVehicles = await fetch(
      `${apiBaseUrl}/admin/transport/vehicles?companyId=${schoolId}`,
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
      schoolId={schoolId}
    />
  );
}