import { cookies } from "next/headers";
import LibrarySuppliersClient from "./LibrarySuppliersClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function LibrarySuppliersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialSuppliers = [];
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/library/suppliers?companyId=${schoolId}`,
      {
        headers: { cookie: cookieHeader },
        cache: 'no-store'
      }
    );

    if (res.ok) {
      const result = await res.json();
      // Map database fields to client interface fields
      initialSuppliers = result.data.map((s: any) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        contact: s.contactEmail,
        leadTime: s.leadTime,
        status: s.status,
        reliability: s.reliability
      }));
    }
  } catch (err) {
    console.error("[LibrarySuppliersPage] Error:", err);
  }

  return (
    <LibrarySuppliersClient 
      initialSuppliers={initialSuppliers} 
      schoolId={schoolId} 
    />
  );
}