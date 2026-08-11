import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import AdminPOSClient from './AdminPOSClient';

interface PageProps {
  params: Promise<{
    slug?: string;
  }>;
}

export default async function AdminPOSPage({ params }: PageProps) {
  const resolvedParams = await params;
  const session = await getAuthSession();

  // Safely resolve identifier from route params or auth session
  const identifier = resolvedParams?.slug || session?.user?.id || '';

  // Retrieve cached company data on the server
  const company = await findCompanyCached(identifier, 'page');

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-gray-400 font-sans">
        Company not found
      </div>
    );
  }

  return <AdminPOSClient companyId={company.id} />;
}