import { Suspense } from 'react';
import KDSClient from './KDSClient';

interface KDSPageProps {
  searchParams: Promise<{
    companyId?: string;
    slug?: string;
    station?: string;
  }>;
}

export default async function KDSPage({ searchParams }: KDSPageProps) {
  const params = await searchParams;
  const companyId = params.companyId || '';
  const station = params.station || 'ALL';

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-zinc-400">Loading Kitchen Display System...</p>
          </div>
        </div>
      }
    >
      <KDSClient companyId={companyId} initialStation={station} />
    </Suspense>
  );
}
