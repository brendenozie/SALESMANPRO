import { cookies } from "next/headers";
import PayrollManagementClient from "./PayrollManagementClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PayrollManagementPage({ params }: PageProps) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialData = []; 
  let initialStaff = []; 
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/payroll?companyId=${schoolId}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 60 },
      }
    );

    if (res.ok) {
      initialData = (await res.json());
    }
  } catch (err) {
    console.error("[PayrollManagementPage] Failed to load payroll data", err);
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
    <PayrollManagementClient
      initialData={initialData}
      initialStaff={initialStaff}
      companyId={schoolId}
    />
  );
}