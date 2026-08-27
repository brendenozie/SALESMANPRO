// app/communications/page.tsx
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import CommunicationsClient from './CommunicationsClient';

interface PageProps {
  params: Promise<{ slug?: string }>;
}

export default async function CommunicationsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || '';

  const session = await getAuthSession();

  // 1. Safely resolve the exact same identifier used in AdminStoreLayout
  const identifier = slug || session?.user?.id || '';

  // 2. Retrieve the memoized company data (no extra DB cost)
  const company = await findCompanyCached(identifier, 'page');

  if (!company) {
    return (
      <div className="p-8 text-center text-zinc-400 font-semibold bg-zinc-950 min-h-screen">
        Company not found
      </div>
    );
  }

  // Pass resolved company ID and slug to the Client Component
  return <CommunicationsClient companyId={company.id} slug={slug} />;
}