import { cookies } from "next/headers";
import CategoryManagerClient from "./CategoryManagerClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export default async function LibrarySuppliersCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  
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

  let initialCategories = [];
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/library/suppliers-categories?companyId=${companyId}`,
      {
        headers: { cookie: cookieHeader },
        cache: 'no-store'
      }
    );

    if (res.ok) {
      const result = await res.json();
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
    <CategoryManagerClient 
      initialCategories={initialCategories} 
      schoolId={companyId} 
    />
  );
}