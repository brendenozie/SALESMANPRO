import React, { useRef, ChangeEvent } from 'react';
import {
  PhotoIcon,
  PencilIcon,
  TrashIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';

interface CoreValue {
  title: string;
  description: string;
  icon: string; // store as string key for flexibility
}

export interface BannerLogoAccordionProps {
  logoUrl?: string | null;
  bannerUrl?: string | null;
  onUpload: (field: 'logoUrl' | 'bannerUrl', file: File) => void;
  onRemove: (field: 'logoUrl' | 'bannerUrl') => void;  
  coreValues?: CoreValue[] | null;
}

export default function BannerLogoAccordion({
  logoUrl,
  bannerUrl,
  onUpload,
  onRemove,
  coreValues
}: BannerLogoAccordionProps) {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (
    field: 'logoUrl' | 'bannerUrl',
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) onUpload(field, file);
  };

  
  const handleUpdateCoreValue = (index: number, field: keyof CoreValue, value: string) => {
    const updated = [...(coreValues || [])];
    updated[index] = { ...updated[index], [field]: value };
    // setFormData('coreValues', updated);
  };

  const handleAddCoreValue = () => {
    const updated = [
      ...(coreValues || []),
      { title: '', description: '', icon: 'StarIcon' },
    ];
    // setFormData('coreValues', updated);
  };

  const handleRemoveCoreValue = (index: number) => {
    const updated = (coreValues || []).filter((_, i) => i !== index);
    // setFormData('coreValues', updated);
  };


  return (
    <section className="max-w-4xl mx-auto p-2 space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Company Media Upload</h2>

      {/* Logo Upload */}
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo Preview"
              className="w-full h-full object-contain"
            />
          ) : (
            <PhotoIcon className="w-12 h-12 text-gray-300" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Logo</label>
          <div className="flex gap-2">
            <button
              onClick={() => logoInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
            >
              <PencilIcon className="w-5 h-5 mr-2" />
              {logoUrl ? 'Change' : 'Upload'}
            </button>
            {logoUrl && (
              <button
                onClick={() => onRemove('logoUrl')}
                className="inline-flex items-center px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition"
              >
                <TrashIcon className="w-5 h-5 mr-2" />
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500">Recommended size: 200×200px, PNG/JPG</p>
        </div>
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => handleFileChange('logoUrl', e)}
        />
      </div>

      {/* Banner Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">Banner</label>
        <div
          className="relative w-full h-48 bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center"
          onClick={() => bannerInputRef.current?.click()}
        >
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt="Banner Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center">
              <PhotoIcon className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-gray-500">Click to upload a banner</p>
            </div>
          )}
          {bannerUrl && (
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                onClick={e => { e.stopPropagation(); bannerInputRef.current?.click(); }}
                className="p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition"
              >
                <PencilIcon className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); onRemove('bannerUrl'); }}
                className="p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition"
              >
                <TrashIcon className="w-5 h-5 text-red-600" />
              </button>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500">Recommendation: 1200×300px for best display</p>
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => handleFileChange('bannerUrl', e)}
        />
      </div>

      {/* Core Values */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium">Core Values</label>
          <button
            type="button"
            onClick={handleAddCoreValue}
            className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
          >
            <PlusCircleIcon className="h-5 w-5 mr-1" />
            Add Value
          </button>
        </div>

        <div className="space-y-4">
          {(coreValues || []).map((cv, i) => (
            <div
              key={i}
              className="p-3 border rounded-md bg-gray-50 dark:bg-gray-800 relative"
            >
              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemoveCoreValue(i)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                <TrashIcon className="h-4 w-4" />
              </button>

              <input
                type="text"
                placeholder="Title"
                value={cv.title}
                onChange={(e) => handleUpdateCoreValue(i, 'title', e.target.value)}
                className="w-full p-2 mb-2 border rounded-md text-sm"
              />
              <textarea
                rows={2}
                placeholder="Description"
                value={cv.description}
                onChange={(e) => handleUpdateCoreValue(i, 'description', e.target.value)}
                className="w-full p-2 mb-2 border rounded-md text-sm"
              />
              <input
                type="text"
                placeholder="Icon name (e.g. StarIcon, TruckIcon)"
                value={cv.icon}
                onChange={(e) => handleUpdateCoreValue(i, 'icon', e.target.value)}
                className="w-full p-2 border rounded-md text-sm"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}