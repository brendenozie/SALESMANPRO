'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  BuildingStorefrontIcon,
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/24/outline";
import StoreCard from '@/components/stores/StoreCard';
import useSWR, { mutate } from 'swr';


const fetcher = (url: string) => fetch(url).then(res => res.json());

interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  bannerUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  category?: string;
}

export default function StoresPage() {

  const { data: session, status } = useSession();  
  const [page, setPage] = useState(1);  
  const router = useRouter(); 

  const { data: stores = [], error, isLoading } = useSWR<Store[]>(
    session?.user?.id ? `/api/stores?userId=${session.user.id}` : null,
    fetcher
  );

  const pageSize = 12;
  const totalPages = useMemo(() => Math.ceil(stores.length / pageSize), [stores]);
  const paginatedStores = useMemo(() => {
    const start = (page - 1) * pageSize;
    return stores.slice(start, start + pageSize);
  }, [stores, page]);

  const handleEdit = (id: string) => router.push(`/stores/${id}/edit`);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this store?')) return;

    try {
      const res = await fetch(`/api/stores/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      mutate(`/api/stores?userId=${session?.user?.id}`); // refresh list
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = () => router.push('/stores/create');

  const isAuthLoading = status === 'loading';

  return (
    
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800">Your Stores</h1>
        <button
          onClick={handleCreate}
          className="inline-flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-3 rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 transition"
        >
          <BuildingStorefrontIcon className="h-5 w-5 mr-2" />
          Create New Store
        </button>
      </header>

      {isAuthLoading ? (
        <p className="p-8 text-center">Checking session…</p>
      ) : !session ? (
        <p className="p-8 text-center">Please sign in to manage your stores.</p>
      ) : error ? (
        <p className="p-8 text-center text-red-600">Failed to load stores.</p>
      ) : isLoading ? (
        <p className="text-center">Fetching your stores…</p>
      ) : stores.length === 0 ? (
        <p className="text-center text-gray-600">You haven’t created any stores yet.</p>
      ) : (
        <>
          {/* grid + pagination */}
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedStores.map(store => (
               <StoreCard
                  key={store.id}
                  {...store}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center space-x-4">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
              >
                <ArrowLeftCircleIcon className="h-6 w-6 text-gray-600" />
              </button>
              <span className="text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
              >
                <ArrowRightCircleIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          )}
        </>
        </>
      )}

    </div>

  );
}
