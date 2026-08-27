// app/admin/[slug]/faqs/page.tsx
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import FaqsClient from './FaqsClient';

interface PageProps {
  params: Promise<{ slug?: string; adminSlug?: string }>;
}

export default async function FAQsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || resolvedParams.adminSlug || '';

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

  return <FaqsClient companyId={company.id} />;
}