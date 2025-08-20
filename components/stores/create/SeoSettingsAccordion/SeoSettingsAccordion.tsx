import React, { ChangeEvent } from 'react';

/**
 * Interface for SEO settings, directly mapping to the Prisma schema model.
 */
export interface SEOSettings {
  id?: string | undefined;
  description?: string | null;
  title?: string | null | undefined;
  keywords?: string[] | undefined; 
  companyId?: string | null;
}

/**
 * Props for the SeoSettingsAccordion component.
 */
export interface SeoSettingsAccordionProps {
  seo: SEOSettings | null;
  onChange: (updated: SEOSettings) => void;
}

/**
 * A component for editing SEO-related settings.
 * It handles the input fields for title, description, and keywords.
 */
export default function SeoSettingsAccordion({
  seo,
  onChange,
}: SeoSettingsAccordionProps) {

  /**
   * Handles changes to any of the SEO fields and updates the parent state.
   * @param key The key of the field being updated (e.g., 'title', 'description').
   * @param value The new value for the field.
   */
  const handleSeoChange = (key: keyof SEOSettings, value: any) => {
    // This updates the local copy of the SEO object before calling the parent onChange handler.
    onChange({ ...seo, [key]: value });
  };

  return (
    <div className="max-w-3xl mx-auto p-2">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">SEO & Config</h2>
        <span className="text-2xl" role="img" aria-label="settings">🔧</span>
      </div>
      
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
              // Correctly bind the input value to the 'title' property from the props.
              value={seo?.title || ''}
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
              // Correctly bind the textarea value to the 'description' property.
              value={seo?.description || ''}
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
              // Correctly bind the input value to the 'keywords' array.
              value={seo?.keywords?.join(', ') || ''}
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
