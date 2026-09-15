'use client';

import React, { useState, useEffect } from 'react';
import {
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  ArrowPathIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  TagIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface SeoStrategyTabProps {
  companyId: string;
  showStatus: (type: 'success' | 'error', message: string) => void;
  apiBaseUrl?: string;
}

export function SeoStrategyTab({ companyId, showStatus, apiBaseUrl = '/api' }: SeoStrategyTabProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');

  // Store Metadata & Readiness
  const [company, setCompany] = useState<any>(null);
  const [readiness, setReadiness] = useState<any>(null);
  const [aiRationale, setAiRationale] = useState<string | null>(null);

  // Fetch Current SEO Settings
  const fetchSeoData = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/seo/settings?companyId=${companyId}`);
      if (!res.ok) throw new Error('Failed to load store SEO settings');
      const data = await res.json();

      if (data.success) {
        setTitle(data.seo.title || '');
        setDescription(data.seo.description || '');
        setKeywords(data.seo.keywords || []);
        setCanonicalUrl(data.seo.canonicalPreview || '');
        setCompany(data.company || {});
        setReadiness(data.readinessReport || null);
      }
    } catch (err: any) {
      showStatus('error', err.message || 'Could not retrieve SEO configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeoData();
  }, [companyId]);

  // Handle Keyword Add / Remove
  const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = keywordInput.trim().toLowerCase();
      if (val && !keywords.includes(val)) {
        setKeywords([...keywords, val]);
        setKeywordInput('');
      }
    }
  };

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  // AI SEO Optimization Trigger
  const handleAiOptimize = async () => {
    setAiLoading(true);
    setAiRationale(null);
    try {
      const res = await fetch(`${apiBaseUrl}/seo/ai-optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, autoSave: false }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'AI generation failed');
      }

      if (data.generated) {
        setTitle(data.generated.seoTitle || title);
        setDescription(data.generated.seoDescription || description);
        if (Array.isArray(data.generated.keywords)) {
          setKeywords(data.generated.keywords);
        }
        setAiRationale(data.generated.competitiveSummary || null);
        showStatus('success', 'AI SEO recommendations generated! Review and click Save to apply.');
      }
    } catch (err: any) {
      showStatus('error', err.message || 'Failed to generate AI SEO suggestions');
    } finally {
      setAiLoading(false);
    }
  };

  // Save Settings
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${apiBaseUrl}/seo/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          title,
          description,
          keywords,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save SEO configuration');
      }

      if (data.readinessReport) {
        setReadiness(data.readinessReport);
      }
      showStatus('success', 'SEO Strategy saved & submitted to search engines via IndexNow!');
    } catch (err: any) {
      showStatus('error', err.message || 'Failed to update SEO strategy');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500 animate-pulse">
        <ArrowPathIcon className="h-8 w-8 mx-auto mb-3 animate-spin text-gray-400" />
        <p className="font-medium">Loading Store SEO Strategy & Readiness Score...</p>
      </div>
    );
  }

  const score = readiness?.score || 0;
  const isReady = readiness?.status === 'SEO_READY';
  const displayTitle = title || company?.name || 'Your Store Name';
  const displayDesc = description || company?.description || 'Your store description will appear here in search engine results...';

  return (
    <div className="space-y-8">
      {/* Header & AI Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GlobeAltIcon className="h-7 w-7 text-indigo-600" />
            SEO Strategy & Search Discovery
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your store's search engine presence, rich snippet schema, and Google ranking metadata.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAiOptimize}
          disabled={aiLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold shadow hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50"
        >
          <SparklesIcon className={clsx("h-5 w-5", aiLoading && "animate-spin")} />
          {aiLoading ? "Analyzing Store & Catalog..." : "✨ Optimize with AI"}
        </button>
      </div>

      {/* AI Strategy Rationale Banner (if generated) */}
      {aiRationale && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-sm flex items-start gap-3">
          <SparklesIcon className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">AI Search Strategy Rationale:</p>
            <p className="text-purple-700 mt-0.5">{aiRationale}</p>
          </div>
        </div>
      )}

      {/* SEO Readiness Score & Health Check */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">SEO Readiness</span>
              <ShieldCheckIcon className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold">{score}%</span>
              <span className={clsx("text-xs px-2.5 py-0.5 rounded-full font-bold uppercase", isReady ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30")}>
                {isReady ? "SEO Ready" : "Needs Attention"}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-3">{readiness?.summary}</p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700/60 text-xs text-slate-400">
            Canonical URL:
            <p className="font-mono text-slate-200 truncate mt-1">{canonicalUrl || "https://salesmanpro.site"}</p>
          </div>
        </div>

        {/* Readiness Checklist */}
        <div className="md:col-span-2 bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Discovery Checklist</h3>
          <div className="space-y-3">
            {readiness?.checks?.map((check: any) => (
              <div key={check.id} className="flex items-start gap-3 text-sm">
                {check.passed ? (
                  <CheckCircleIcon className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className={clsx("font-semibold", check.passed ? "text-gray-800" : "text-amber-900")}>
                    {check.label}
                  </span>
                  {!check.passed && (
                    <p className="text-xs text-gray-500 mt-0.5">{check.fixSuggestion}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Google SERP Search Snippet Preview */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Google Search Snippet Simulator
          </h3>
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setPreviewDevice('desktop')}
              className={clsx("px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition", previewDevice === 'desktop' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900")}
            >
              <ComputerDesktopIcon className="h-3.5 w-3.5" /> Desktop
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('mobile')}
              className={clsx("px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition", previewDevice === 'mobile' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900")}
            >
              <DevicePhoneMobileIcon className="h-3.5 w-3.5" /> Mobile
            </button>
          </div>
        </div>

        <div className={clsx("p-4 bg-gray-50 rounded-xl font-sans", previewDevice === 'mobile' ? "max-w-md border border-gray-300 mx-auto" : "w-full")}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
              {company?.name?.charAt(0) || "S"}
            </div>
            <div className="text-xs text-gray-700 truncate">
              {canonicalUrl.replace(/^https?:\/\//, '')}
            </div>
          </div>
          <p className="text-blue-800 text-lg hover:underline cursor-pointer font-medium leading-snug truncate">
            {displayTitle}
          </p>
          <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
            {displayDesc}
          </p>
        </div>
      </div>

      {/* SEO Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* SEO Title */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="seo-title" className="text-sm font-semibold text-gray-800">
              Custom Search Title (Meta Title)
            </label>
            <span className={clsx("text-xs font-medium", title.length >= 50 && title.length <= 65 ? "text-emerald-600" : title.length > 65 ? "text-red-500" : "text-gray-400")}>
              {title.length} / 65 characters {title.length >= 50 && title.length <= 65 ? "✓ Optimal" : ""}
            </span>
          </div>
          <input
            id="seo-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`${company?.name || 'Brand'} - Online Store | Products & Deals`}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">Recommended 50–65 characters. Include your store name and primary specialty.</p>
        </div>

        {/* SEO Description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="seo-description" className="text-sm font-semibold text-gray-800">
              Search Meta Description
            </label>
            <span className={clsx("text-xs font-medium", description.length >= 140 && description.length <= 160 ? "text-emerald-600" : description.length > 160 ? "text-red-500" : "text-gray-400")}>
              {description.length} / 160 characters {description.length >= 140 && description.length <= 160 ? "✓ Optimal" : ""}
            </span>
          </div>
          <textarea
            id="seo-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your store's value proposition, top offerings, delivery options, and a clear call to action..."
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">Recommended 140–160 characters. This snippet appears directly below your title in search results.</p>
        </div>

        {/* SEO Keywords */}
        <div>
          <label htmlFor="seo-keywords" className="block text-sm font-semibold text-gray-800 mb-1.5">
            Target Search Keywords & Tags
          </label>
          <div className="flex items-center gap-2 mb-2">
            <div className="relative flex-grow">
              <TagIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input
                id="seo-keywords"
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleAddKeyword}
                placeholder="Type keyword and press Enter (e.g. online shoes, best electronics kenya)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[38px] p-2 bg-gray-50 border border-gray-200 rounded-xl">
            {keywords.length === 0 && (
              <span className="text-xs text-gray-400 italic">No keywords added yet. Use AI Optimize or type above.</span>
            )}
            {keywords.map((kw, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded-lg shadow-sm"
              >
                #{kw}
                <button
                  type="button"
                  onClick={() => removeKeyword(i)}
                  className="text-gray-400 hover:text-red-500 ml-1 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t flex items-center justify-between">
          <p className="text-xs text-gray-500">
            ⚡ Changes automatically notify search engines (Bing, Google, IndexNow) in real time.
          </p>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-[var(--primary-color,#4f46e5)] hover:opacity-95 text-white font-bold text-sm rounded-xl shadow-md transition disabled:opacity-50"
          >
            {saving ? "Publishing Strategy..." : "Save SEO Strategy"}
          </button>
        </div>
      </form>
    </div>
  );
}
