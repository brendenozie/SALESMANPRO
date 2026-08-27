import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import AdminReportsClient from './reports-client';

interface AdminReportsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function AdminReportsPage({ params }: AdminReportsPageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  // Safely resolve the exact same identifier used across the application
  const identifier = slug || session?.user?.id || '';

  // Retrieve memoized company data
  const company = await findCompanyCached(identifier, 'page');

  if (!company) {
    return (
      <div className="p-8 text-center text-red-600 font-semibold">
        Company not found
      </div>
    );
  }

  return <AdminReportsClient companyId={company.id} />;
}