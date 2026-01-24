import { cookies } from "next/headers";
import TransportRoutesClient from "./TransportRoutesClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function TransportRoutesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialRoutes = [];
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/transport/routes?companyId=${schoolId}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 60 },
      }
    );

    if (res.ok) {
      initialRoutes = (await res.json()).data;
    }
  } catch (err) {
    console.error("[TransportRoutesPage] Failed to load routes", err);
  }

  return (
    <TransportRoutesClient
      initialRoutes={initialRoutes}
      schoolId={schoolId}
    />
  );
}