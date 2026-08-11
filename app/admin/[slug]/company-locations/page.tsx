import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import CompanyLocationsClient from './CompanyLocationsClient';

interface PageProps {
  params: Promise<{
    slug?: string;
  }>;
}

export default async function CompanyLocationsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const session = await getAuthSession();

  // Safely resolve the identifier using route params or auth session
  const identifier = resolvedParams?.slug || session?.user?.id || '';

  // Retrieve company details on the server
  const company = await findCompanyCached(identifier, 'page');

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Company not found
      </div>
    );
  }

  // Pass the resolved company ID down to the interactive client component
  return <CompanyLocationsClient companyId={company.id} />;
}