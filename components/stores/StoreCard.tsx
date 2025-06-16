'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  BuildingStorefrontIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/24/outline";
import { WalletIcon } from '@heroicons/react/24/solid';

interface Store {
  id: string;
  slug: string;
  name: string;
  category?: string;
  description?: string;
  bannerUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function StoreCard(store: Store) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition">
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
          <button onClick={() => store.onEdit(store.id)} className="p-2 rounded-full hover:bg-gray-100">
            <PencilIcon className="h-5 w-5 text-gray-600" />
          </button>
          <button onClick={() => store.onDelete(store.id)} className="p-2 rounded-full hover:bg-gray-100">
            <TrashIcon className="h-5 w-5 text-red-500" />
          </button>
        </div>

        <div className="flex items-center mb-4">
          <BuildingStorefrontIcon className="h-8 w-8 text-blue-500 mr-3" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">{store.name}</h2>
            <p className="text-sm text-indigo-600 font-medium">{store.category || 'Uncategorized'}</p>
          </div>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-3">
          {store.description || 'No description provided.'}
        </p>

        <div className="space-y-2 mb-4">
          {store.contactEmail && (
            <div className="flex items-center text-gray-700">
              <WalletIcon className="h-5 w-5 mr-2" />
              <a href={`mailto:${store.contactEmail}`} className="hover:underline">
                {store.contactEmail}
              </a>
            </div>
          )}
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
  );
}
