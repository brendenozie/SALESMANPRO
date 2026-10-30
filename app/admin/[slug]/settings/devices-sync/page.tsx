import React from 'react';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import DevicesSyncAdminClient from './DevicesSyncAdminClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DevicesSyncAdminPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, 'page');

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold">Store Not Found</h2>
          <p className="text-sm text-slate-400 mt-2">
            Unable to resolve store for identifier: {identifier}
          </p>
        </div>
      </div>
    );
  }

  return (
    <DevicesSyncAdminClient
      companyId={company.id}
      companyName={company.name || 'Store'}
      slug={slug}
    />
  );
}

