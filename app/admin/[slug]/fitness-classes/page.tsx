// app/admin/[slug]/fitness-classes/page.tsx

import ProgramsClient from "./ProgramsClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  // 1. Safely resolve the exact same identifier used in AdminStoreLayout
  const identifier = slug || session?.user?.id || '';

  // 2. Retrieve the memoized company data
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return (
      <div className="p-8 text-center text-gray-400 font-semibold bg-gray-950 min-h-screen">
        Company not found
      </div>
    );
  }

  const companyId = company.id;

  return <ProgramsClient slug={slug} companyId={companyId} />;
}
