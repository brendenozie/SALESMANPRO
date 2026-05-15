// =========================================================
// app/admin/[slug]/tickets/page.tsx
// =========================================================

import { cookies } from "next/headers";
import AdminTicketsClient from "./AdminTicketsClient";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000/api";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AdminTicketsPage({
  params,
}: Props) {
  const { slug: companyId } = await params;

  const cookiesHeader = (
    await cookies()
  ).toString();

  let events = [];

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