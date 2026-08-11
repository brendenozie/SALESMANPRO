// app/admin/[adminSlug]/page.tsx
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import DashboardClient from './DashboardClient';

interface AdminDashboardProps {
  params: Promise<{ adminSlug: string }>;
}

export default async function AdminDashboard({ params }: AdminDashboardProps) {
  const { adminSlug } = await params;
  
  const session = await getAuthSession();

  // 1. Safely resolve the exact same identifier used in AdminStoreLayout
  const identifier = adminSlug || session?.user?.id || '';

  // 2. Retrieve the memoized company data (no extra DB cost)
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  // Use the actual database ID for your API calls, ensuring consistency
  const companyId = company.id;

  return <DashboardClient adminSlug={adminSlug} companyId={companyId} />;
}