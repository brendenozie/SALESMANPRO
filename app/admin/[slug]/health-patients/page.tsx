import AdminPatientsPageClient from "./AdminPatientsPageClient";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";

interface Props {
  params: { slug: string };
}

export default async function AdminPatientsPage({ params }: Props) {
  const companyId = params.slug;

  // Optional: prefetch patients server-side (with JWT cookie/session)
  const res = await fetch(
    `${apiBaseUrl}/admin/patients?companyId=${companyId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies().toString(), // forward auth cookies if required
      },
      next: { revalidate: 60 }, // disable caching for fresh data
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
