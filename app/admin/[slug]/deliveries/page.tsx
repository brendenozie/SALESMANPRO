import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import DeliveriesClient from './DeliveriesClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DeliveriesPage({ params }: PageProps) {
  const { slug } = await params;

  const session = await getAuthSession();

  // 1. Safely resolve the exact same identifier used in AdminStoreLayout
  const identifier = slug || session?.user?.id || '';

  // 2. Retrieve the memoized company data (no extra DB cost)
  const company = await findCompanyCached(identifier, 'page');

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600 font-medium">
        Company not found
      </div>
    );
  }

  // Pass the resolved company ID down to client side components
  return <DeliveriesClient companyId={company.id} />;
}