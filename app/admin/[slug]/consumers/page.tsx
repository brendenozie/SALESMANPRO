import { notFound } from 'next/navigation';
import {
  UserGroupIcon,
  TicketIcon,
  ClockIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { cookies } from 'next/headers';
import ConsumersClientPage from './ConsumersClientPage';

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

  let consumers = [];
  let isSuccess = true;

  try {
    const res = await fetch(`${apiBaseUrl}/admin/consumers?companyId=${slug}`, {
      cache: 'no-store',
      headers: { Cookie: cookieStore.toString() }
    });
    const json = await res.json();
    consumers = json.data || [];
  } catch (e) {
    isSuccess = false;
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 bg-gray-50 min-h-screen">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consumer Management</h1>
          <p className="text-gray-500">Oversee retail profiles and login credentials.</p>
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
        adminSlug={slug} 
        initialData={consumers} 
      />
    </div>
  );
}