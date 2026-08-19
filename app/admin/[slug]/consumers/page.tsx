import { notFound } from 'next/navigation';
import {
  UserGroupIcon,
  TicketIcon,
  ClockIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { cookies } from 'next/headers';
import ConsumersClientPage from './ConsumersClientPage';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.INTERNAL_API_URL || 'http://localhost:3000/api';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const SummaryCard = ({ title, value, icon: Icon, colorClass }: any) => (
  <div className={`p-6 rounded-xl shadow-md ${colorClass} text-white flex flex-col items-center`}>
    <Icon className="h-8 w-8 mb-2 opacity-80" />
    <h3 className="text-lg font-medium">{title}</h3>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

export default async function ConsumersPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();

  if (!slug) notFound();
  
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

  let consumers = [];
  let isSuccess = true;

  try {
    const res = await fetch(`${apiBaseUrl}/admin/consumers?companyId=${companyId}`, {
      cache: 'no-store',
      headers: { Cookie: cookieStore.toString() }
    });
    const json = await res.json();
    consumers = json.data || [];
  } catch (e) {
    isSuccess = false;
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen font-sans text-gray-800 dark:text-gray-200">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Consumer Management</h1>
          <p>Oversee retail profiles and login credentials.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          title="Total Consumers" 
          value={consumers.length} 
          icon={UserGroupIcon} 
          colorClass="bg-indigo-600" 
        />
        <SummaryCard 
          title="Active Profiles" 
          value={consumers.filter((c: any) => c.user?.isActive).length} 
          icon={ShieldCheckIcon} 
          colorClass="bg-emerald-600" 
        />
        <SummaryCard 
          title="Recent Signups" 
          value={consumers.filter((c: any) => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return new Date(c.createdAt) > weekAgo;
          }).length} 
          icon={ClockIcon} 
          colorClass="bg-amber-600" 
        />
      </div>

      <ConsumersClientPage 
        adminSlug={companyId} 
        initialConsumers={consumers} 
      />
    </div>
  );
}