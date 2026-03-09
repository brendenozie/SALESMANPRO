'use client';

import React, { useState, useMemo } from 'react';
import { 
  RectangleGroupIcon, 
  PlusIcon, 
  GlobeAltIcon, 
  PhotoIcon,
  ChevronDownIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import CategoryFormModal from './CategoryFormModal';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function SiteCategoriesClient({ initialData, }: { initialData: any[]}) {
  const [categories, setCategories] = useState(initialData);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  // Inside SiteCategoriesClient.tsx
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState<any>(null);
  
  const handleSave = async (payload: any) => {
    try {
      const res = await fetch(`${apiBaseUrl}/admin/site-categories`, {
        method: selectedForEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload }),
      });
  
      if (res.ok) {
        // Refresh your list here (e.g., fetchCategories())
        setIsModalOpen(false);
        setSelectedForEdit(null);
      }
    } catch (error) {
      console.error("Failed to save:", error);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <RectangleGroupIcon className="h-10 w-10 text-indigo-600" />
            Site Templates
          </h1>
          <p className="text-gray-500">Manage industries and their specific layout variants.</p>
        </div>
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all">
          <PlusIcon className="h-5 w-5" /> Add Category
        </button>
      </div>

      {/* Category List */}
      <div className="grid gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div 
              onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
              className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl bg-gray-100 p-3 rounded-2xl">{cat.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{cat.name}</h3>
                  <p className="text-sm text-gray-500">{cat.variants.length} Layout Variants</p>
                </div>
              </div>
              <ChevronDownIcon className={`h-6 w-6 text-gray-400 transition-transform ${expandedCat === cat.id ? 'rotate-180' : ''}`} />
            </div>

            {expandedCat === cat.id && (
              <div className="px-6 pb-6 pt-2 bg-gray-50/50 border-t border-gray-50">
                <div className="grid gap-3">
                  {cat.variants.map((variant: any) => (
                    <div key={variant.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center overflow-hidden">
                          {variant.previewImage ? (
                            <img src={variant.previewImage} className="object-cover h-full w-full" />
                          ) : (
                            <PhotoIcon className="h-6 w-6 text-indigo-200" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-800">{variant.name}</span>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full">
                              {variant.tag}
                            </span>
                          </div>
                          <a href={variant.link} target="_blank" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                            <GlobeAltIcon className="h-3 w-3" /> {variant.link}
                          </a>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  <button className="mt-2 w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold hover:border-indigo-300 hover:text-indigo-500 transition-all flex items-center justify-center gap-2">
                    <PlusIcon className="h-4 w-4" /> Add Variant to {cat.name}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

    {isModalOpen && (
      <CategoryFormModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedForEdit(null);
        }}
        onSave={handleSave}
        initialData={selectedForEdit}
      />
    )}

    </div>
  );
}