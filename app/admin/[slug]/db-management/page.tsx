import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import DatabaseManagementClient from './DatabaseManagementClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DatabaseManagementPage({ params }: PageProps) {
  const { slug } = await params;

  const session = await getAuthSession();

  // Safely resolve the exact same identifier used in AdminStoreLayout
  const identifier = slug || session?.user?.id || '';

  // Retrieve the memoized company data (no extra DB cost)
  const company = await findCompanyCached(identifier, 'page');

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600 dark:text-gray-400 font-medium">
        Company not found
      </div>
    );
  }

  return <DatabaseManagementClient companyId={company.id} />;
}