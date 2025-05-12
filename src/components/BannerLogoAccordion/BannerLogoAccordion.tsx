import React, { useRef, ChangeEvent } from 'react';

export interface BannerLogoAccordionProps {
  logoUrl?: string;
  bannerUrl?: string;
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
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Media & Description</h2>

      {/* Logo Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Logo Image</label>
        {logoUrl ? (
          <div className="relative inline-block">
            <img
              src={logoUrl}
              alt="Logo Preview"
              className="w-24 h-24 object-contain rounded-md border"
            />
            <div className="absolute top-0 right-0 flex space-x-1">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="bg-white bg-opacity-75 rounded-full p-1 hover:bg-opacity-100 focus:outline-none"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onRemove('logoUrl')}
                className="bg-white bg-opacity-75 rounded-full p-1 hover:bg-opacity-100 focus:outline-none text-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            className="border-dashed border-2 border-gray-300 rounded-lg p-4 text-center text-gray-500 hover:border-gray-400"
          >
            Upload Logo
          </button>
        )}
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => handleFileChange('logoUrl', e)}
        />
      </div>

      {/* Banner Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Banner Image</label>
        {bannerUrl ? (
          <div className="relative">
            <img
              src={bannerUrl}
              alt="Banner Preview"
              className="w-full h-48 object-cover rounded-md border"
            />
            <div className="absolute inset-0 flex justify-end p-2 space-x-2">
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="bg-white bg-opacity-75 rounded-full p-1 hover:bg-opacity-100 focus:outline-none"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onRemove('bannerUrl')}
                className="bg-white bg-opacity-75 rounded-full p-1 hover:bg-opacity-100 focus:outline-none text-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => bannerInputRef.current?.click()}
            className="w-full border-dashed border-2 border-gray-300 rounded-lg py-6 text-center text-gray-500 hover:border-gray-400"
          >
            Upload Banner
          </button>
        )}
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => handleFileChange('bannerUrl', e)}
        />
      </div>
    </div>
  );
}