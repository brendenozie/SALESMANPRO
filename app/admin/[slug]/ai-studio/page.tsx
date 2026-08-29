import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import AiStudioPageClient from "./AiStudioPageClient";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AiStudioPage({ params, searchParams }: PageProps) {
  // Await both promises for Next.js 15+ compatibility
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || "";
  const company = await findCompanyCached(identifier, "page");
  
  // Extract values directly from the awaited object
  const initialProductContext = {
    productId: resolvedSearchParams?.productId as string | undefined,
    name: resolvedSearchParams?.name as string | undefined,
    category: resolvedSearchParams?.category as string | undefined,
    subcategory: resolvedSearchParams?.subcategory as string | undefined,
    description: resolvedSearchParams?.description as string | undefined,
    price: resolvedSearchParams?.price as string | undefined,
    imageUrl: resolvedSearchParams?.image as string | undefined,
  };

  if (!company) {
    return <div className="p-8 text-slate-500">Company configuration not found.</div>;
  }

  return <AiStudioPageClient initialProduct={initialProductContext} companyId={company.id} />;
}