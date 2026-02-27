import { cookies } from "next/headers";
import SyncImagesClient from "./SyncImagesClient";
import { MarketListingForm } from "@/types/typings";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function SyncImagesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: companyId } = await params;
  const cookieHeader = (await cookies()).toString();

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