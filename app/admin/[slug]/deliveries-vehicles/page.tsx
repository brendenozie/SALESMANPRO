// app/admin/[adminSlug]/vehicles/page.tsx
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import VehiclesClient from './VehiclesClient';

interface VehiclesPageProps {
  params: Promise<{ adminSlug?: string; slug?: string }>;
}

export default async function VehiclesPage({ params }: VehiclesPageProps) {
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

  // Pass the resolved database companyId down to the interactive client component
  return <VehiclesClient companyId={company.id} />;
}