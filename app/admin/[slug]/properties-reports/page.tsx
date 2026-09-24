import { cookies } from "next/headers";
import HostelReportsClient from "../property-reports/HostelReportsClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PropertiesReportsPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieHeader = (await cookies()).toString();

  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div className="p-8 text-center text-slate-500">Company not found</div>;
  }

  const companyId = company.id;
  let initialData = null;  

  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/property/analytics?companyId=${companyId}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 60 },
      }
    );

    if (res.ok) {
      const json = await res.json();
      initialData = json.data;
    }
  } catch (err) {
    console.error("[PropertiesReportsPage] Failed to load analytics", err);
  }

  return (
    <HostelReportsClient 
      schoolId={companyId}      
      initialData={initialData}
    />
  );
}
