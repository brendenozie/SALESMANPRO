import { cookies } from "next/headers";
import SyncImagesClient from "./SyncImagesClient";
import { MarketListingForm } from "@/types/typings";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function SyncImagesPage({ params }: { params: Promise<{ slug: string }> }) {
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

  // Fetch all products (increase limit to ensure we catch the whole inventory)
  const res = await fetch(
    `${apiBaseUrl}/admin/my-market-place?companyId=${companyId}&limit=1000`,
    { headers: { Cookie: cookieHeader }, cache: 'no-store' }
  );

  const products: MarketListingForm[] = res.ok 
    ? (await res.json()).data.results 
    : [];

  return (
    <SyncImagesClient 
      companyId={companyId} 
      initialProducts={products} 
    />
  );
}