import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import AdminPromotionsClient from './AdminPromotionsClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminPromotionsPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  // Safely resolve the exact same identifier used in AdminStoreLayout
  const identifier = slug || session?.user?.id || '';

  // Retrieve the memoized company data (no extra DB cost)
  const company = await findCompanyCached(identifier, 'page');

  if (!company) {
    return <div>Company not found</div>;
  }

  // Use the actual database ID for your API calls, ensuring consistency
  const companyId = company.id;

  return <AdminPromotionsClient companyId={companyId} slug={slug} />;
}