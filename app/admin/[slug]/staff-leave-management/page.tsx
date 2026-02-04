import { cookies } from "next/headers";
import LeaveManagementClient from "./LeaveManagementClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LeaveManagementPage({ params }: PageProps) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialRequests = [];  
  let initialStaff = [];
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/leave?companyId=${schoolId}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 60 },
      }
    );

    if (res.ok) {
      initialRequests = (await res.json()).data;
    }
  } catch (err) {
    console.error("[LeaveManagementPage] Failed to load leave requests", err);
  }

  const resStaff = await fetch(
      `${apiBaseUrl}/admin/staff?companyId=${schoolId}`,
      {
        headers: { cookie: cookieHeader },
        cache: 'no-store'
      }
    );

    if (resStaff.ok) {
      const json = await resStaff.json();
      initialStaff = json.data;
    }

  return (
    <LeaveManagementClient
      initialRequests={initialRequests}
      initialStaff={initialStaff}
      companyId={schoolId}
    />
  );
}