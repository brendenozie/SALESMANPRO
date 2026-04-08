import { cookies } from "next/headers";
import LibrarySuppliersClient from "./LibrarySuppliersClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function LibrarySuppliersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialSuppliers = [];
  let initialCategories = [];
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
        phone: s.phone || "N/A",
        category: s.category,
        contact: s.contactEmail,
        leadTime: s.leadTime || "7 Days",
        status: s.status || "Active",
        reliability: s.reliability ?? 100,
      }));

    }

    const resCategories = await fetch(
      `${apiBaseUrl}/admin/library/suppliers-categories?companyId=${schoolId}`,
      {
        headers: { cookie: cookieHeader },
        cache: 'no-store'
      }
    );

    if (resCategories.ok) {
      const result = await resCategories.json();
      // Map database fields to client interface fields
      initialCategories = result.data.map((s: any) => ({
        id: s.id,
        name: s.name,
        phone: s.phone || "N/A",
        category: s.category,
        contact: s.contactEmail,
        leadTime: s.leadTime || "7 Days",
        status: s.status || "Active",
        reliability: s.reliability ?? 100,
      }));

    }

  } catch (err) {
    // console.error("[LibrarySuppliersPage] Error:", err);
  }

  return (
    <LibrarySuppliersClient 
      initialSuppliers={initialSuppliers} 
      initialCategories={initialCategories}
      schoolId={schoolId} 
    />
  );
}