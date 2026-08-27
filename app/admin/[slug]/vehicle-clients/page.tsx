// app/admin/[adminSlug]/clients/page.tsx
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import ClientsClient from './AdminClientsPage';

interface ClientsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminClientsPage({ params }: ClientsPageProps) {
  const { slug } = await params;
  
  const session = await getAuthSession();

  // 1. Safely resolve the exact same identifier used in AdminStoreLayout
  const identifier = slug || session?.user?.id || '';

  // 2. Retrieve the memoized company data (no extra DB cost)
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  // Use the actual database ID, ensuring consistency
  const companyId = company.id;

  return <ClientsClient companyId={companyId} />;
}