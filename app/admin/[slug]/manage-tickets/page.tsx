// =========================================================
// app/admin/[slug]/tickets/page.tsx
// =========================================================

import { cookies } from "next/headers";
import AdminTicketsClient from "./AdminTicketsClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000/api";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AdminTicketsPage({
  params,
}: Props) {
  const { slug } = await params;

  const cookiesHeader = (
    await cookies()
  ).toString();

  let events = [];
  
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

  try {
    const eventsRes = await fetch(
      `${apiBaseUrl}/admin/events?companyId=${companyId}`,
      {
        next: { revalidate: 60 },
        headers: {
          cookie: cookiesHeader,
        },
      },
    );

    if (eventsRes.ok) {
      const eventsJson =
        await eventsRes.json();

      events =
        eventsJson.data || [];
    }
  } catch (e) {}

  return (
    <AdminTicketsClient
      slug={companyId}
      events={events}
    />
  );
}