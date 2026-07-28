import LeadsClient from "./LeadsClient";
import { cookies } from "next/headers";

interface LeadsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function LeadsPage({ params }: LeadsPageProps) {
  const cookieStore = (await cookies()).toString();
  const companyId = (await params).slug;
  const res = await fetch(`/admin/leads?companyId=${companyId}`, {
    cache: "no-store",
    headers: {
      Cookie: cookieStore,
    },
  });

  const leads = res.ok ? await res.json() : [];

  return <LeadsClient initialLeads={leads.data || []} companyId={companyId || ""} />;
}
