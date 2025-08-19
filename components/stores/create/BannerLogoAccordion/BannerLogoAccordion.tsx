import React, { useRef, ChangeEvent } from 'react';
import {
  PhotoIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

export interface BannerLogoAccordionProps {
  logoUrl?: string | null;
  bannerUrl?: string | null;
  onUpload: (field: 'logoUrl' | 'bannerUrl', file: File) => void;
  onRemove: (field: 'logoUrl' | 'bannerUrl') => void;
}

export default function BannerLogoAccordion({
  logoUrl,
  bannerUrl,
  onUpload,
  onRemove,
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
    </section>
  );
}