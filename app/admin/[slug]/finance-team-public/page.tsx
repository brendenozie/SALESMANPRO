// app/experts/page.tsx
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import ExpertClient from './ExpertClient';

interface PageProps {
  params: Promise<{ slug?: string }>;
}

export default async function ExpertPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || '';

  const session = await getAuthSession();

  // 1. Safely resolve the exact same identifier used in AdminStoreLayout
  const identifier = slug || session?.user?.id || '';

  // 2. Retrieve the memoized company data (no extra DB cost)
  const company = await findCompanyCached(identifier, 'page');

  if (!company) {
    return (
      <div className="p-8 text-center text-gray-400 font-semibold bg-gray-900 min-h-screen">
        Company not found
      </div>
    );
  }

  // 3. Pass company details to the client view
  return <ExpertClient companyId={company.id} />;
}