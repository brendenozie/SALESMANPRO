// app/admin/[slug]/cases/page.tsx
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import CasesClient from './CasesClient';

interface PageProps {
  params: Promise<{ slug?: string; adminSlug?: string }>;
}

export default async function CasesPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || resolvedParams.adminSlug || '';

  const session = await getAuthSession();

  // Safely resolve the exact identifier used in admin routes
  const identifier = slug || session?.user?.id || '';

  // Retrieve memoized company data
  const company = await findCompanyCached(identifier, 'page');

  if (!company) {
    return (
      <div className="p-8 text-center text-gray-400 font-semibold bg-gray-900 min-h-screen">
        Company not found
      </div>
    );
  }

  return <CasesClient companyId={company.id} />;
}