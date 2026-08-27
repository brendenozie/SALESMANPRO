// app/admin/[adminSlug]/ebooks/page.tsx
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import EbooksClient from './EbooksClient';

interface EbookManagementPageProps {
  params: Promise<{ adminSlug?: string; slug?: string }>;
}

export default async function EbookManagementPage({ params }: EbookManagementPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.adminSlug || resolvedParams.slug || '';

  const session = await getAuthSession();

  // Safely resolve the exact same identifier used in AdminStoreLayout
  const identifier = slug || session?.user?.id || '';

  // Retrieve the memoized company data (no extra DB cost)
  const company = await findCompanyCached(identifier, 'page');

  if (!company) {
    return (
      <div className="p-8 text-center text-gray-600 font-semibold">
        Company not found
      </div>
    );
  }

  // Pass companyId down to the client component
  return <EbooksClient companyId={company.id} />;
}