import React from 'react';


interface SEOSettings {
  title?: string;
  description?: string;
  keywords?: string[];
}

const SeoSettingsAccordion  = ({ form, setForm } : any) => {
  const updateSection = <K extends string>(section: string, key: K, value: any) => {
    setForm((f: any) => ({
      ...f,
      [section]: { ...f[section], [key]: value }
    }));
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="flex justify-between items-center text-2xl font-bold text-gray-800 mb-4">
        <span>SEO & Config</span>
        <span className="text-xl">🔧</span>
      </h2>

      {/* SEO Settings */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">SEO Settings</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="seoTitle" className="block text-xs font-medium text-gray-600">Page Title</label>
            <input
              id="seoTitle"
              type="text"
              value={form.seo?.title || ''}
              onChange={e => updateSection('seo', 'title', e.target.value)}
              placeholder="My Awesome Store"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="metaDescription" className="block text-xs font-medium text-gray-600">Meta Description</label>
            <textarea
              id="metaDescription"
              rows={2}
              value={form.seo?.description || ''}
              onChange={e => updateSection('seo', 'description', e.target.value)}
              placeholder="Best deals on fashion, electronics, and more."
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          <div>
            <label htmlFor="keywords" className="block text-xs font-medium text-gray-600">Keywords (comma-separated)</label>
            <input
              id="keywords"
              type="text"
              value={form.seo?.keywords?.join(', ') || ''}
              onChange={e => updateSection('seo', 'keywords', e.target.value.split(',').map(k => k.trim()))}
              placeholder="ecommerce, fashion, electronics"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default SeoSettingsAccordion;
