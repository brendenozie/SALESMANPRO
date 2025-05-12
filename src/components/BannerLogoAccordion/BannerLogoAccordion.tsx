import React, { useRef } from 'react';

const BannerLogoAccordion = ({ form, handleChange, handleUpload, handleRemove } :any) => {
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Media & Description</h2>

      {/* Banner Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Banner Image</label>
        {form.bannerUrl ? (
          <div className="relative">
            <img src={form.bannerUrl} alt="Banner Preview" className="w-full h-48 object-cover rounded-md border" />
            <div className="absolute inset-0 flex justify-end p-2 space-x-2">
              <button
                onClick={() => bannerInputRef.current?.click()}
                className="bg-white bg-opacity-75 rounded-full p-1 hover:bg-opacity-100 focus:outline-none"
              >
                Edit
              </button>
              <button
                onClick={() => handleRemove('bannerUrl')}
                className="bg-white bg-opacity-75 rounded-full p-1 hover:bg-opacity-100 focus:outline-none text-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <button
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
          onChange={e => e.target.files?.[0] && handleUpload('bannerUrl', e.target.files[0])}
        />
      </div>

      {/* Logo Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Logo Image</label>
        {form.logoUrl ? (
          <div className="relative inline-block">
            <img src={form.logoUrl} alt="Logo Preview" className="w-24 h-24 object-contain rounded-md border" />
            <div className="absolute top-0 right-0 flex space-x-1">
              <button
                onClick={() => logoInputRef.current?.click()}
                className="bg-white bg-opacity-75 rounded-full p-1 hover:bg-opacity-100 focus:outline-none"
              >
                Edit
              </button>
              <button
                onClick={() => handleRemove('logoUrl')}
                className="bg-white bg-opacity-75 rounded-full p-1 hover:bg-opacity-100 focus:outline-none text-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <button
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
          onChange={e => e.target.files?.[0] && handleUpload('logoUrl', e.target.files[0])}
        />
      </div>

      {/* Description */}
      {/* <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
          <span title="A brief description of your store or app" className="ml-1 cursor-help">?</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={form.description || ''}
          onChange={handleChange}
          placeholder="Write a short description or tagline..."
          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div> */}
    </div>
  );
};

export default BannerLogoAccordion;
