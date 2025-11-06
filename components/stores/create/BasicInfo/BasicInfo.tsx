// components/BasicInfo.tsx
import React, { ChangeEvent, useEffect, useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';


export interface BasicInfoProps {
  name: string;
  slug: string;
  category: string;
  hasWebsite: boolean | null | undefined;
  description?: string  | undefined | null;
  tagline: string | null;
  domain: string | null;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export default function BasicInfo({
  name,
  slug,
  description,
  hasWebsite,
  tagline,
  domain,
  handleChange,
}: BasicInfoProps) {
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
    const [domainAvailable, setDomainAvailable] = useState<boolean | null>(null);
  
    // Check slug uniqueness when slug changes
    useEffect(() => {
      if (!slug) return;
      const timeout = setTimeout(async () => {
        const res = await fetch(`/api/companies/check-unique?slug=${slug}`);
        const data = await res.json();
        setSlugAvailable(data.isUnique);
      }, 400); // debounce to avoid spamming
      return () => clearTimeout(timeout);
    }, [slug]);
  
    // Check domain uniqueness when domain changes
    useEffect(() => {
      if (!domain) return;
      const timeout = setTimeout(async () => {
        const res = await fetch(`/api/companies/check-unique?domain=${domain}`);
        const data = await res.json();
        setDomainAvailable(data.isUnique);
      }, 400);
      return () => clearTimeout(timeout);
    }, [domain]);
    
  return (
    <section className="max-w-4xl mx-auto p-2">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Basic Information</h1>
        <p className="mt-1 text-gray-600">Tell us about your store to get started.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="flex flex-col">
          <label htmlFor="name" className="flex items-center text-sm font-semibold text-gray-700">
            Store Name
            <InformationCircleIcon className="ml-1 h-5 w-5 text-gray-400" title="Your brand’s public name" />
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={handleChange}
            placeholder="My Awesome Store"
            className="mt-2 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        {/* Tagline */}
        <div className="flex flex-col">
          <label htmlFor="tagline" className="flex items-center text-sm font-semibold text-gray-700">
            Tagline
            <InformationCircleIcon className="ml-1 h-5 w-5 text-gray-400" title="Short, catchy tagline (2–3 words)" />
          </label>
          <input
            id="tagline"
            name="tagline"
            type="text"
            value={tagline || ''}
            onChange={handleChange}
            placeholder="Empower Your Journey"
            className="mt-2 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        {/* Slug (read-only) */}
        {/* Slug field */}
      <div className="flex flex-col">
        <label htmlFor="slug" className="flex items-center text-sm font-semibold text-gray-700">
          Slug
          <InformationCircleIcon className="ml-1 h-5 w-5 text-gray-400" title="Auto-generated URL identifier" />
        </label>
        <div className="relative">
          <input
            id="slug"
            name="slug"
            type="text"
            value={slug}
            readOnly
            className={`mt-2 p-3 border rounded-xl ${
              slugAvailable === false
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-200 bg-gray-100 text-gray-600'
            }`}
          />
          {slugAvailable === false && (
            <span className="text-sm text-red-600 absolute top-full mt-1">
              This slug is already taken.
            </span>
          )}
          {slugAvailable === true && (
            <span className="text-sm text-green-600 absolute top-full mt-1">
              Slug is available ✅
            </span>
          )}
        </div>
      </div>

        {/* Has Website */}
        <label className="flex items-center space-x-2 md:col-span-2">
          <input
            type="checkbox"
            name="hasWebsite"
            checked={hasWebsite || false}
            onChange={handleChange}
          />
          <span>I’d like to set up a public website too</span>
        </label>

        {/* Domain field */}
      <div className="flex flex-col">
        <label htmlFor="domain" className="flex items-center text-sm font-semibold text-gray-700">
            Domain
            <InformationCircleIcon className="ml-1 h-5 w-5 text-gray-400" title="Your store’s web address" />
        </label>
        <div className="relative">
          <input
            id="domain"
            name="domain"
            type="text"
            value={domain || ''}
            readOnly
            className={`mt-2 p-3 border rounded-xl ${
              domainAvailable === false
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-200 bg-gray-100 text-gray-600'
            }`}
          />
          {domainAvailable === false && (
            <span className="text-sm text-red-600 absolute top-full mt-1">
              Domain already exists.
            </span>
          )}
          {domainAvailable === true && (
            <span className="text-sm text-green-600 absolute top-full mt-1">
              Domain is available ✅
            </span>
          )}
        </div>
      </div>

        {/* Description (full width) */}
        <div className="md:col-span-2 flex flex-col">
          <label htmlFor="description" className="flex items-center text-sm font-semibold text-gray-700">
            Description
            <InformationCircleIcon className="ml-1 h-5 w-5 text-gray-400" title="Short description (1–2 sentences)" />
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={description || ""}
            onChange={handleChange}
            placeholder="Describe your store’s mission, products, or services..."
            className="mt-2 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
          />
        </div>
      </div>
    </section>
  );
}
