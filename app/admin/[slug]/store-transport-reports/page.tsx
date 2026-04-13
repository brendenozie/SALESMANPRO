import { cookies } from "next/headers";
import TransportDashboard from "./TransportDashboard";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TransportDashboardPage({ params }: PageProps) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialData = null;
  
  try {
    // Fetch aggregated dashboard data including metrics, alerts, and efficiency
    const res = await fetch(
      `${apiBaseUrl}/admin/transport/dashboard?companyId=${schoolId}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (res.ok) {
      initialData = (await res.json()).data;
    }
  } catch (err) {
    console.error("[TransportDashboardPage] Failed to load dashboard data", err);
  }

  return (
    <TransportDashboard
      initialData={initialData}
      schoolId={schoolId}
    />
  );
}