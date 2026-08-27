import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import AdminSettingsClient from './AdminSettingsClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminSettingsPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  // 1. Safely resolve the exact same identifier used in AdminStoreLayout
  const identifier = slug || session?.user?.id || '';

  // 2. Retrieve the memoized company data (no extra DB cost)
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  // Use the actual database ID for your logic/API calls, ensuring consistency
  const companyId = company.id;

  return <AdminSettingsClient companyId={companyId} slug={slug} />;
}