import { cookies } from "next/headers";
import StaffAttendanceClient from "./StaffAttendanceClient";

import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function StaffAttendancePage({ params }: PageProps) {
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

  let initialData = [];  
  let initialStaff = [];
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/attendance?companyId=${encodeURIComponent(companyId)}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 60 },
      }
    );

    if (res.ok) {
      initialData = (await res.json());
      // console.log("Fetched initial attendance data:", initialData);
    }

    const resStaff = await fetch(
      `${apiBaseUrl}/admin/staff?companyId=${encodeURIComponent(companyId)}`,
      {
        headers: { cookie: cookieHeader },
        cache: 'no-store'
      }
    );

    if (resStaff.ok) {
      const json = await resStaff.json();
      initialStaff = json.data;
    }

  } catch (err) {
    console.error("[StaffAttendancePage] Failed to load attendance data", err);
  }

  return (
    <StaffAttendanceClient
      initialData={initialData}
      initialStaff={initialStaff}
      schoolId={companyId}
    />
  );
}