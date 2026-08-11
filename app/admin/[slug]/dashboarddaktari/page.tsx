import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import AdminDashboardClient from './AdminDashboardClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminDashboardPage({ params }: PageProps) {
  const { slug } = await params;

  const session = await getAuthSession();

  // Safely resolve the identifier used across admin layouts
  const identifier = slug || session?.user?.id || '';

  // Retrieve cached company data on the server
  const company = await findCompanyCached(identifier, 'page');

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600 dark:text-gray-400">
        Company not found
      </div>
    );
  }

  return <AdminDashboardClient slug={slug} companyId={company.id} />;
}