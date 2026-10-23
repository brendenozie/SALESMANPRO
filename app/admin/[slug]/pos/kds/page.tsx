import { Suspense } from 'react';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import KDSClient from '@/app/pos/kds/KDSClient';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ station?: string }>;
}

export const metadata = {
  title: 'Kitchen Display System (KDS) | SalesmanPro Store POS',
  description: 'Live paperless kitchen order tickets and bump screen.',
};

export default async function AdminKDSPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { station = 'ALL' } = await searchParams;
  const session = await getAuthSession();

  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, 'page');
  const companyId = company?.id || slug;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
            <p className="text-sm font-medium text-zinc-400">Loading KDS live screen...</p>
          </div>
        </div>
      }
    >
      <KDSClient companyId={companyId} initialStation={station} />
    </Suspense>
  );
}

