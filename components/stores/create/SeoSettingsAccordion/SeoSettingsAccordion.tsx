import React, { ChangeEvent } from 'react';

export interface SEOSettings {
  id: string;
  description?: string | null;
  title?: string | null;
  keywords: string[];
  companyId?: string | null;
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

  const handleSeoChange = (key: keyof SEOSettings, value: any) => {
    onChange({ ...seo, [key]: value });
    // onChange({
    //   seo: {
    //     ...seo,
    //     [key]: value,
    //   },
    // });
  };

  return (
    <div className="max-w-3xl mx-auto p-2 ">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">SEO & Config</h2>
        <span className="text-2xl" role="img" aria-label="settings">🔧</span>
      </div>

      {/* SEO Settings Section */}
      
      {/* SEO Settings Section */}
      <section className="mb-8 p-6 border border-gray-200 rounded-xl bg-gray-50">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          SEO Configuration
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Optimize your site for search engines.
        </p>
        <div className="space-y-6">
          <div>
            <label htmlFor="seoTitle" className="block text-sm font-semibold text-gray-700">
              Page Title
            </label>
            <input
              id="seoTitle"
              type="text"
              value={''}//settings.seo?.title || 
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleSeoChange('title', e.target.value)
              }
              placeholder="e.g., My Awesome Store"
              className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
            />
            <p className="mt-1 text-xs text-gray-500">
              Displayed in the browser tab and search engine results.
            </p>
          </div>

          <div>
            <label htmlFor="metaDescription" className="block text-sm font-semibold text-gray-700">
              Meta Description
            </label>
            <textarea
              id="metaDescription"
              rows={3}
              value={''}//settings.seo.description || 
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                handleSeoChange('description', e.target.value)
              }
              placeholder="e.g., Best deals on fashion, electronics, and more."
              className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none transition duration-150 ease-in-out"
            />
            <p className="mt-1 text-xs text-gray-500">
              Appears in search engine snippets. Keep it concise and relevant.
            </p>
          </div>

          <div>
            <label htmlFor="keywords" className="block text-sm font-semibold text-gray-700">
              Keywords (comma-separated)
            </label>
            <input
              id="keywords"
              type="text"
              value={''}//settings.seo.keywords?.join(', ') || 
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleSeoChange(
                  'keywords',
                  e.target.value
                    .split(',')
                    .map(k => k.trim())
                    .filter(k => k.length > 0)
                )
              }
              placeholder="e.g., ecommerce, fashion, electronics"
              className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
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
