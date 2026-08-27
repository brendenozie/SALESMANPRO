// app/admin/[adminSlug]/page.tsx
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import DashboardClient from './DashboardClient';

// Dummy Data Helper
const getDashboardData = (storeName: string) => ({
  storeName,
  totalVehicles: 150,
  activeListings: 120,
  pendingRequests: 25,
  newClientsLastMonth: 15,
  revenueLastMonth: 750000,
  recentSales: [
    { id: 1, vehicle: '2023 Tesla Model 3', client: 'Alice Johnson', amount: 48000, date: '2025-07-10' },
    { id: 2, vehicle: '2024 Toyota RAV4', client: 'Bob Williams', amount: 36000, date: '2025-07-08' },
    { id: 3, vehicle: '2022 Ford F-150', client: 'Charlie Davis', amount: 62000, date: '2025-07-05' },
  ],
  inventoryBreakdown: {
    cars: 80,
    suvs: 40,
    trucks: 20,
    motorcycles: 10,
  },
});

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminDashboardPage({ params }: PageProps) {
  const { slug } = await params;
  
  const session = await getAuthSession();

  // 1. Safely resolve the exact same identifier used in AdminStoreLayout
  const identifier = slug || session?.user?.id || '';

  // 2. Retrieve the memoized company data (no extra DB cost)
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  // Use the actual database ID or company name for consistency
  const data = getDashboardData(slug);

  return <DashboardClient data={data} companyId={company.id} />;
}