import { cookies } from "next/headers";
import ExamCategoriesClient from "./ExamCategoriesClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export default async function ExamCategoriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
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
    const res = await fetch(`${apiBaseUrl}/admin/exam-categories?schoolId=${encodeURIComponent(companyId)}`, {
      headers: { cookie: cookieHeader },
      next: { revalidate: 0 }, // Categorization often needs fresh data
    });

    if (res.ok) {
      initialCategories = await res.json();
    }
  } catch (err) {
    // console.error("Failed to load exam categories", err);
  }

  return (
    <ExamCategoriesClient 
      initialData={initialCategories} 
      schoolId={companyId} 
    />
  );
}