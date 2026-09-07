import { cookies } from "next/headers";
import VisitorsPageClient from "./VisitorsPageClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function VisitorsPage({ params }: PageProps) {

  const { slug }  = await params;

  const cookieHeader = (await cookies()).toString();  
  
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

  let initialLogs = [];  
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/hostel/visitors?companyId=${companyId}`,
      { headers: { cookie: cookieHeader }, cache: 'no-store' }
    );
    if (res.ok) initialLogs = (await res.json()).data;
  } catch (err) { 
    // console.error(err); 
    }

  return (
    <VisitorsPageClient 
      initialLogs={initialLogs} 
      schoolId={companyId} 
    />
  );
}