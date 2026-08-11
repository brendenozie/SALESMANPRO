// app/admin/[slug]/experts/page.tsx
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import ExpertManagementClient from "./ExpertManagementClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ExpertManagementPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  // 1. Safely resolve the exact same identifier used in AdminStoreLayout
  const identifier = slug || session?.user?.id || "";

  // 2. Retrieve the memoized company data (no extra DB cost)
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return (
      <div className="p-8 text-center text-gray-400 font-semibold bg-gray-900 min-h-screen">
        Company not found
      </div>
    );
  }

  // 3. Pass the resolved companyId down to the interactive client component
  return <ExpertManagementClient companyId={company.id} />;
}