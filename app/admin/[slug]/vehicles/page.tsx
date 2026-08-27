// app/admin/[adminSlug]/vehicles/page.tsx
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import VehicleManagementClient from './VehicleManagementClient';

interface VehicleManagementPageProps {
  params: Promise<{ slug: string }>;
}

export default async function VehicleManagementPage({ params }: VehicleManagementPageProps) {
  const { slug } = await params;

  const session = await getAuthSession();

  // 1. Safely resolve the exact same identifier used in AdminStoreLayout
  const identifier = slug || session?.user?.id || '';

  // 2. Retrieve the memoized company data (no extra DB cost)
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  // Use the actual database ID for your API calls, ensuring consistency
  const companyId = company.id;

  return <VehicleManagementClient companyId={companyId} />;
}