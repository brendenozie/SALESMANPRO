import LeadsClient from "./LeadsClient";
import { cookies } from "next/headers";

interface LeadsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function LeadsPage({ params }: LeadsPageProps) {
  const cookieStore = (await cookies()).toString();
  const { slug: companyId } = await params;

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api`
      : "http://localhost:3000/api");

  let initialLeads = [];
  let initialPagination = {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  try {
    const res = await fetch(
      `${baseUrl}/admin/leads?companyId=${companyId}&stage=cold&page=1&limit=10`,
      {
        cache: "no-store",
        headers: {
          Cookie: cookieStore,
        },
      }
    );

    if (res.ok) {
      const json = await res.json();
      initialLeads = json.data?.leads || [];
      if (json.data?.pagination) {
        initialPagination = json.data.pagination;
      }
    } else {
      console.error("Failed to fetch leads:", res.status, res.statusText);
    }
  } catch (error) {
    console.error("Error fetching leads on server:", error);
  }

  return (
    <LeadsClient
      initialLeads={Array.isArray(initialLeads) ? initialLeads : []}
      initialPagination={initialPagination}
      companyId={companyId || ""}
    />
  );
}