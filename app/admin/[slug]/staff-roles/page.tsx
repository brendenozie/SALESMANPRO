// app/admin/roles/[slug]/page.tsx
import { cookies } from "next/headers";
import RolesManagementClient from "./RolesManagementClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function RolesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: companyId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialData = { roleCounts: [], profiles: [] };
  
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/roles?companyId=${companyId}`,
      {
        headers: { cookie: cookieHeader },
        cache: 'no-store'
      }
    );

    if (res.ok) {
      initialData = (await res.json());
      // console.log("Fetched roles data:", initialData);
    }
  } catch (err) {
    console.error("Failed to load roles", err);
  }

  return (
    <RolesManagementClient
      initialData={initialData}
      companyId={companyId}
    />
  );
}