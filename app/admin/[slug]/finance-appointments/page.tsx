// app/admin/[slug]/appointments/page.tsx
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import AppointmentsClient from './AppointmentsClient';

interface PageProps {
  params: Promise<{ slug?: string; adminSlug?: string }>;
}

export default async function AppointmentsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || resolvedParams.adminSlug || '';

  const session = await getAuthSession();

  // Safely resolve identifier used across the admin ecosystem
  const identifier = slug || session?.user?.id || '';

  // Retrieve cached company data
  const company = await findCompanyCached(identifier, 'page');

  if (!company) {
    return (
      <div className="p-8 text-center text-gray-400 font-semibold bg-gray-900 min-h-screen">
        Company not found
      </div>
    );
  }

  return <AppointmentsClient companyId={company.id} />;
}