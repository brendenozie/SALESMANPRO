import LeadsClient from "./LeadsClient";
import { cookies } from "next/headers";

interface LeadsPageProps {
  params: { slug: string };
}

export default async function LeadsPage({ params }: LeadsPageProps) {
  const cookieStore = (await cookies()).toString();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/leads?companyId=${params.slug}`, {
    cache: "no-store",
    headers: {
      Cookie: cookieStore,
    },
  });

  const leads = res.ok ? await res.json() : [];

  return <LeadsClient initialLeads={leads.data || []} companyId={params.slug} />;
}
