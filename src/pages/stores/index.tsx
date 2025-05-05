import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  PencilIcon,
  TrashIcon,
  StarIcon,
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
  ShoppingCartIcon
} from "@heroicons/react/24/outline";


export default function StoresPage() {
  const [stores, setStores] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchStores() {
      const res = await fetch('/api/stores');
      const data = await res.json();
      setStores(data);
    }
    fetchStores();
  }, []);

  const handleEdit = (slug : any) => {
    router.push(`/stores/${slug}/edit`);
  };

  const handleDelete = async (id: any) => {
    if (confirm('Are you sure you want to delete this store?')) {
      await fetch(`/api/stores/${id}`, { method: 'DELETE' });
      setStores((prev: any) => prev.filter((s: any) => s.id !== id));
    }
  };

  return (
    <div className="p-6 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Stores</h1>
        <button
          onClick={() => router.push('/stores/create')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          + Create New Store
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store: any) => (
          <div
            key={store.id}
            className="relative bg-white rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEdit(store.slug)}
                className="p-1 rounded hover:bg-gray-100"
                aria-label="Edit Store"
              >
                <PencilIcon className="h-4 w-4 text-gray-600" />
              </button>
              <button
                onClick={() => handleDelete(store.id)}
                className="p-1 rounded hover:bg-gray-100"
                aria-label="Delete Store"
              >
                <TrashIcon className="h-4 w-4 text-red-500" />
              </button>
            </div>

            <div className="flex items-center mb-4">
              <img
                src={store.logoUrl}
                alt={store.name}
                className="h-12 w-12 rounded-full object-cover mr-4"
              />
              <div>
                <h2 className="text-xl font-semibold">{store.name}</h2>
                <p className="text-sm text-gray-500">{store.category}</p>
              </div>
            </div>

            <p className="truncate text-gray-700 mb-4">{store.description}</p>

            <button
              onClick={() => router.push(`/stores/${store.slug}/edit`)}
              className="text-blue-600 hover:underline text-sm"
            >
              View & Edit →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
