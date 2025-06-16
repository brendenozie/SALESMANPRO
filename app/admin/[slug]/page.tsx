// File: app/admin/[slug]/page.tsx

import { redirect } from 'next/navigation';
import { getAuthSession } from '../../../lib/auth';
import AdminDashClient, { DashboardData } from '../../../components/admin/AdminDashClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await getAuthSession();

  if (!session?.user?.id && session?.user?.role?.toLowerCase() != 'admin') {
    redirect('/');
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard/${params.slug}`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error('Failed to load dashboard data');
  }

  const data = (await res.json()) as DashboardData;

  return <AdminDashClient {...data} session={session} />;
}
