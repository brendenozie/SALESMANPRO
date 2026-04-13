'use client';

import React, { useState, useMemo } from 'react';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  KeyIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/solid';
import toast, { Toaster } from 'react-hot-toast';

export default function ConsumersClientPage({ adminSlug, initialData }: any) {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return data.filter((c: any) => 
      c.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.loginCode?.includes(search)
    );
  }, [data, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This deletes the User and Consumer profile.")) return;
    
    const tid = toast.loading("Deleting...");
    try {
      const res = await fetch(`/api/admin/consumers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setData(data.filter((c: any) => c.id !== id));
        toast.success("Consumer removed", { id: tid });
      }
    } catch (e) {
      toast.error("Failed to delete", { id: tid });
    }
  };

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Search by name, email or login code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          <PlusIcon className="h-5 w-5" /> Add Consumer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((consumer: any) => (
          <div key={consumer.id} className="bg-white p-5 rounded-xl shadow-sm border hover:border-indigo-300 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl">
                  {consumer.user?.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{consumer.user?.name}</h3>
                  <div className="flex flex-col text-sm text-gray-500 space-y-1 mt-1">
                    <span className="flex items-center gap-2"><EnvelopeIcon className="h-4 w-4"/> {consumer.user?.email}</span>
                    {consumer.user?.phone && <span className="flex items-center gap-2"><PhoneIcon className="h-4 w-4"/> {consumer.user?.phone}</span>}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-xs font-mono flex items-center gap-1">
                  <KeyIcon className="h-3 w-3" /> {consumer.loginCode}
                </span>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-indigo-600 transition"><PencilIcon className="h-5 w-5"/></button>
                  <button onClick={() => handleDelete(consumer.id)} className="p-2 text-gray-400 hover:text-red-600 transition"><TrashIcon className="h-5 w-5"/></button>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t flex justify-between text-xs text-gray-400">
              <span>Inventory items: {consumer._count?.ConsumerInventory || 0}</span>
              <span>Joined: {new Date(consumer.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div className="text-center py-20 bg-gray-100 rounded-xl border-2 border-dashed">
          <p className="text-gray-500">No consumers found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}