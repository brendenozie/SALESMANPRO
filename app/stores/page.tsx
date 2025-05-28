"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  BuildingStorefrontIcon,
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon
} from "@heroicons/react/24/outline";
import { WalletIcon } from '@heroicons/react/24/solid';

export default function StoresPage() {
  const { data: session, status } = useSession();
  const [stores, setStores] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 26;
  const router = useRouter();

  useEffect(() => {
    if (status !== 'authenticated') return;

    if (!session?.user?.id) {
      setStores([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/stores?userId=${session.user.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => setStores(data))
      .catch(err => {
        console.error(err);
        setStores([]);
      })
      .finally(() => setLoading(false));
  }, [status, session?.user?.id]);

  // pagination
  const totalPages = Math.ceil(stores.length / pageSize);
  const paginated = stores.slice((page - 1) * pageSize, page * pageSize);

  const handleEdit = (id: string) => router.push(`/stores/${id}`);
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this store?')) return;
    await fetch(`/api/stores/${id}`, { method: 'DELETE' });
    setStores(prev => prev.filter(s => s.id !== id));
  };

  if (status === 'loading') {
    return <p className="p-8 text-center">Loading your stores…</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800">Your Stores</h1>
        <button
          onClick={() => router.push('/stores/create')}
          className="inline-flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-3 rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 transition"
        >
          <BuildingStorefrontIcon className="h-5 w-5 mr-2" />
          Create New Store
        </button>
      </header>

      {loading ? (
        <p className="text-center">Fetching stores…</p>
      ) : stores.length === 0 ? (
        <p className="text-center text-gray-600">You haven’t created any stores yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map(store => (
              <div
                key={store.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition"
              >
                {store.bannerUrl && (
                  <div className="h-32 bg-gray-200">
                    <img
                      src={store.bannerUrl}
                      alt={`${store.name} banner`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6 relative group">
                  <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(store.id)} className="p-2 rounded-full hover:bg-gray-100">
                      <PencilIcon className="h-5 w-5 text-gray-600" />
                    </button>
                    <button onClick={() => handleDelete(store.id)} className="p-2 rounded-full hover:bg-gray-100">
                      <TrashIcon className="h-5 w-5 text-red-500" />
                    </button>
                  </div>

                  <div className="flex items-center mb-4">
                    <BuildingStorefrontIcon className="h-8 w-8 text-blue-500 mr-3" />
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800">{store.name}</h2>
                      <p className="text-sm text-indigo-600 font-medium">{store.category}</p>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {store.description || 'No description provided.'}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-700">
                      <WalletIcon className="h-5 w-5 mr-2" />
                      <a href={`mailto:${store.contactEmail}`} className="hover:underline">
                        {store.contactEmail}
                      </a>
                    </div>
                    {store.contactPhone && (
                      <div className="flex items-center text-gray-700">
                        <PhoneIcon className="h-5 w-5 mr-2" />
                        <a href={`tel:${store.contactPhone}`} className="hover:underline">
                          {store.contactPhone}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => router.push(`/site/${store.slug}`)}
                      className="text-blue-600 hover:underline flex items-center text-sm"
                    >
                      View Website
                    </button>
                    <button
                      onClick={() => router.push(`/admin/${store.id}`)}
                      className="text-green-600 hover:underline flex items-center text-sm"
                    >
                      Manage Store
                      <ArrowRightCircleIcon className="h-5 w-5 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
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
        </>
      )}
    </div>
  );
}
