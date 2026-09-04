import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import StoreWorkforceDashboard from "@/components/admin/StoreWorkforceDashboard";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AiWorkforcePage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || "";
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div className="p-8 text-slate-500">Store configuration not found.</div>;
  }

  return <StoreWorkforceDashboard companySlug={slug} />;
}
