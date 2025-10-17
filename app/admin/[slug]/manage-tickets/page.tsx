// app/admin/[slug]/tickets/page.tsx
import { cookies } from "next/headers";
import AdminTicketsClient from "./AdminTicketsClient";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface Props {
  params: { slug: string };
}

export default async function AdminTicketsPage({ params }: Props) {
  const { slug : companyId } = await params;
  const cookiesHeader = (await cookies()).toString();

  let tickets = [];

  try {
    const res = await fetch(
      `${apiUrl}/admin/${companyId}/tickets`,
      { next: { revalidate: 60 }, headers: { cookie: cookiesHeader } }
    );

    if (res.ok) {
      const json = await res.json();
      tickets = json.data?.tickets || [];
    } else {
      console.error(`Failed to fetch tickets: ${res.status}`);
    }
  } catch (err: any) {
    console.error("Error fetching tickets:", err.message);
  }

  return <AdminTicketsClient slug={companyId} initialTickets={tickets} />;
}
