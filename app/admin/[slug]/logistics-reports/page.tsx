import { cookies } from "next/headers";
import TransportDashboard from "../store-transport-reports/TransportDashboard";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LogisticsReportsPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieHeader = (await cookies()).toString();
  const session = await getAuthSession();

  const identifier = slug || session?.user?.id || "";
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;
  let initialData = null;

  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/transport/dashboard?companyId=${encodeURIComponent(companyId)}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 300 },
      }
    );

    if (res.ok) {
      initialData = (await res.json()).data;
    }
  } catch (err) {
    console.error("[LogisticsReportsPage] Failed to load dashboard data", err);
  }

  return (
    <TransportDashboard
      initialData={initialData}
      schoolId={companyId}
    />
  );
}
