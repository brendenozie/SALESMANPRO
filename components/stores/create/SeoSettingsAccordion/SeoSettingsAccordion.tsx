import React, { ChangeEvent } from 'react';

export interface SEOSettings {
  title?: string;
  description?: string;
  keywords?: string[];
}

export interface SeoSettingsAccordionProps {
  seo: SEOSettings;
  onChange: (updated: SEOSettings) => void;
}

export default function SeoSettingsAccordion({
  seo,
  onChange,
}: SeoSettingsAccordionProps) {
  const updateField = (key: keyof SEOSettings, value: string | string[]) => {
    onChange({ ...seo, [key]: value });
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="flex justify-between items-center text-2xl font-bold text-gray-800 mb-4">
        <span>SEO & Config</span>
        <span className="text-xl">🔧</span>
      </h2>

      {/* SEO Settings */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">SEO Settings</h3>
        <div className="space-y-4">
          {/* Page Title */}
          <div>
            <label htmlFor="seoTitle" className="block text-xs font-medium text-gray-600">
              Page Title
            </label>
            <input
              id="seoTitle"
              type="text"
              value={seo.title || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('title', e.target.value)}
              placeholder="My Awesome Store"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {/* Meta Description */}
          <div>
            <label htmlFor="metaDescription" className="block text-xs font-medium text-gray-600">
              Meta Description
            </label>
            <textarea
              id="metaDescription"
              rows={2}
              value={seo.description || ''}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateField('description', e.target.value)}
              placeholder="Best deals on fashion, electronics, and more."
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          {/* Keywords */}
          <div>
            <label htmlFor="keywords" className="block text-xs font-medium text-gray-600">
              Keywords (comma-separated)
            </label>
            <input
              id="keywords"
              type="text"
              value={seo.keywords?.join(', ') || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateField('keywords', e.target.value.split(',').map(k => k.trim()))
              }
              placeholder="ecommerce, fashion, electronics"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
