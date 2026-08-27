// app/admin/library/categories/page.tsx
import { cookies } from "next/headers";
import LibraryCategoriesClient from "./LibraryCategoriesClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function LibraryCategoriesPage({ params }: { params: Promise<{ slug: string }> }) {
  
  const { slug }  = await params;
  
  const cookieHeader = (await cookies()).toString();

  let initialCategories = [];
  
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

  try {
    const res = await fetch(`${apiBaseUrl}/admin/library/categories?companyId=${companyId}`, {
      headers: { cookie: cookieHeader },
      next: { revalidate: 0 },
    });
    if (res.ok) initialCategories = (await res.json()).data;
  } catch (err) {
    // console.error("Failed to load categories", err);
  }

  return <LibraryCategoriesClient initialCategories={initialCategories} schoolId={companyId} />;
}