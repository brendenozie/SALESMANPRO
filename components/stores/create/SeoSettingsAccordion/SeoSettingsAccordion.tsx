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
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">SEO & Config</h2>
        <span className="text-2xl" role="img" aria-label="settings">🔧</span>
      </div>

      {/* SEO Settings Section */}
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">SEO Settings</h3>
        <div className="space-y-5">

          {/* Page Title */}
          <div>
            <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700">
              Page Title
            </label>
            <input
              id="seoTitle"
              type="text"
              value={seo.title || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateField('title', e.target.value)
              }
              placeholder="e.g., My Awesome Store"
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              Displayed in the browser tab and search engine results.
            </p>
          </div>

          {/* Meta Description */}
          <div>
            <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">
              Meta Description
            </label>
            <textarea
              id="metaDescription"
              rows={3}
              value={seo.description || ''}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                updateField('description', e.target.value)
              }
              placeholder="e.g., Best deals on fashion, electronics, and more."
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              Appears in search engine snippets. Keep it concise and relevant.
            </p>
          </div>

          {/* Keywords */}
          <div>
            <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">
              Keywords (comma-separated)
            </label>
            <input
              id="keywords"
              type="text"
              value={seo.keywords?.join(', ') || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateField(
                  'keywords',
                  e.target.value
                    .split(',')
                    .map(k => k.trim())
                    .filter(k => k.length > 0)
                )
              }
              placeholder="e.g., ecommerce, fashion, electronics"
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              Helps search engines understand the content of your page.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
