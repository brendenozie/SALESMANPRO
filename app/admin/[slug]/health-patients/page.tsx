// app/admin/[slug]/health-patients/page.tsx
import AdminPatientsPageClient from "./AdminPatientsPageClient";
import { cookies } from "next/headers";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface AdminPatientsPageProps {
  params:Promise<{ slug: string }>
}

export default async function AdminPatientsPage(
  { params }: AdminPatientsPageProps
) {  
    const { slug } = await params;
  
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
  // ✅ correct typing ensures params is awaited properly
  
  const cookiesHeaders = (await cookies()).toString();

  const res = await fetch(
    `${apiBaseUrl}/admin/patients?companyId=${companyId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookiesHeaders,
      },
      next: { revalidate: 60 },
    }
  );

  let patients: any[] = [];
  if (res.ok) {
    const json = await res.json();
    // console.log("Fetched patients:", json);
    patients = json.data || [];
  }

  return (
    <AdminPatientsPageClient
      initialPatients={patients}
      companyId={companyId}
    />
  );
}
