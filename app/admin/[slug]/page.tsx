// File: app/admin/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { getAuthSession } from '../../../lib/auth';
import AdminDashClient, { DashboardData } from './AdminDashClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    console.log("notihing");
    redirect('/');
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error('Failed to load dashboard data');
  }

  const data = (await res.json()) as DashboardData;
  return <AdminDashClient {...data} session={session} />;
}


