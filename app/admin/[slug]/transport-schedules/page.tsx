import { cookies } from "next/headers";
import TransportScheduleClient from "./TransportScheduleClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function TransportSchedulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialShifts = [];  
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
  } catch (err) {
    console.error("[SchedulePage] Failed to load shifts", err);
  }

  return (
    <TransportScheduleClient
      initialShifts={initialShifts}
      schoolId={schoolId}
    />
  );
}