'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  RectangleGroupIcon, 
  PlusIcon, 
  GlobeAltIcon, 
  PhotoIcon,
  ChevronDownIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import CategoryFormModal from './CategoryFormModal';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function SiteCategoriesClient({ initialData }: { initialData: any[]}) {
  const [categories, setCategories] = useState(initialData);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Refresh data from API
  const fetchCategories = useCallback(async () => {
    if (!initialData) return; // Avoid fetching if no initial data provided
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/site-categories`);
      if (res.ok) {
        const result = await res.json();
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [initialData]);

  const handleSave = async (payload: any) => {
    try {
      const res = await fetch(`${apiBaseUrl}${selectedForEdit ? `/admin/site-categories/${selectedForEdit.id}` : '/admin/site-categories'}`, {
        method: selectedForEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, id: selectedForEdit?.id }),
      });
  
      if (res.ok) {
        await fetchCategories(); // Refresh the list
        setIsModalOpen(false);
        setSelectedForEdit(null);
      }
    } catch (error) {
      console.error("Failed to save:", error);
    }
  };

  const handleEdit = (cat: any) => {
    setSelectedForEdit(cat);
    setIsModalOpen(true);
  };

  // Inside SiteCategoriesClient.tsx
  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const res = await fetch(`${apiBaseUrl}/admin/site-categories/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        // Refresh the local state or re-fetch
        setCategories(prev => prev.map(cat => 
          cat.id === id ? { ...cat, status: newStatus } : cat
        ));
      }
    } catch (error) {
      console.error("Status toggle failed:", error);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <RectangleGroupIcon className="h-10 w-10 text-indigo-600" />
            Site Templates
          </h1>
          <p className="text-gray-500 font-medium">Manage industries and their specific layout variants.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-indigo-100"
        >
          <PlusIcon className="h-6 w-6 stroke-[3]" /> Add Industry
        </button>
      </div>

      {/* Category List */}
      <div className="grid gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
            <div 
              onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
              className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-5">
                {/* <span className="text-4xl bg-indigo-50 p-4 rounded-2xl ring-1 ring-indigo-100">{cat.icon}</span> */}
                {/* Industry Icon with Status Indicator */}
                <div className="relative">
                  <span className={`text-4xl p-4 rounded-2xl block transition-opacity ${cat.status === 'inactive' ? 'opacity-40 grayscale' : 'bg-indigo-50'}`}>
                    {cat.icon}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleStatus(cat.id, cat.status); }}
                    className={`absolute -top-2 -right-2 h-6 w-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center transition-colors ${cat.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}
                  >
                    <div className="h-2 w-2 bg-white rounded-full" />
                  </button>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{cat.name}</h3>
                  <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">{cat.variants?.length || 0} Variants Available</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleEdit(cat); }}
                  className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-indigo-600 shadow-sm ring-1 ring-gray-100"
                >
                  <PencilSquareIcon className="h-5 w-5" />
                </button>
                <ChevronDownIcon className={`h-6 w-6 text-gray-300 transition-transform duration-500 ${expandedCat === cat.id ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {expandedCat === cat.id && (
              <div className="px-6 pb-6 pt-2 bg-gray-50/30 border-t border-gray-50">
                <div className="grid gap-3 mt-4">
                  {cat.variants?.map((variant: any) => (
                    <div key={variant.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm group">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-xl bg-indigo-50 flex items-center justify-center overflow-hidden ring-1 ring-gray-100">
                          {variant.previewImage ? (
                            <img src={variant.previewImage} className="object-cover h-full w-full group-hover:scale-110 transition-transform" />
                          ) : (
                            <PhotoIcon className="h-7 w-7 text-indigo-200" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-800">{variant.name}</span>
                            <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                              {variant.tag}
                            </span>
                          </div>
                          <a href={variant.link} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 font-medium hover:underline flex items-center gap-1 mt-1">
                            <GlobeAltIcon className="h-3 w-3" /> {variant.link.replace('https://', '')}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => handleEdit(cat)}
                    className="mt-2 w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-2"
                  >
                    <PlusIcon className="h-5 w-5" /> Add Variant to {cat.name}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <CategoryFormModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedForEdit(null);
        }}
        onSave={handleSave}
        initialData={selectedForEdit}
      />
    </div>
  );
}