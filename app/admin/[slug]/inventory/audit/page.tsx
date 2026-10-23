import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import StockAuditClient from './StockAuditClient';

interface PageProps {
  params: { slug: string };
}

export const metadata = {
  title: 'Stock Audit & Cycle Count | SalesmanPro',
  description: 'Mobile barcode stock counting tool with variance tracking and adjustment vouchers.',
};

export default async function StockAuditPage({ params }: PageProps) {
  const { slug } = params;

  // Optionally: fetch company from DB to get companyId
  // For now, use slug as companyId fallback (adjust for real auth context)
  const companyId = slug;

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-zinc-500">Loading audit tool...</p>
        </div>
      </div>
    }>
      <StockAuditClient companyId={companyId} slug={slug} />
    </Suspense>
  );
}
