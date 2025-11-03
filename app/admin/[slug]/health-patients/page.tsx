// app/admin/[slug]/health-patients/page.tsx
import AdminPatientsPageClient from "./AdminPatientsPageClient";
import { cookies } from "next/headers";

const apiBaseUrl =
  "/api";//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

interface AdminPatientsPageProps {
  params:Promise<{ slug: string }>
}

export default async function AdminPatientsPage(
  props: AdminPatientsPageProps
) {
  // ✅ correct typing ensures params is awaited properly
  const { slug: companyId } = await props.params;
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
    console.log("Fetched patients:", json);
    patients = json.data || [];
  }

  return (
    <AdminPatientsPageClient
      initialPatients={patients}
      companyId={companyId}
    />
  );
}
