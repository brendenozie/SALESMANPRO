import React, { ChangeEvent, useEffect, useState } from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

export interface BasicInfoProps {
  name: string;
  slug: string;
  category: string;
  hasWebsite: boolean | null | undefined;
  description?: string | undefined | null;
  tagline: string | null;
  domain: string | null;
  handleChange: (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
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
  const [checking, setChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [domainAvailable, setDomainAvailable] = useState<boolean | null>(null);
  const [slugSuggestion, setSlugSuggestion] = useState<string | null>(null);
  const [domainSuggestion, setDomainSuggestion] = useState<string | null>(null);

  // Combined uniqueness check (debounced)
  useEffect(() => {
    if (!slug && !domain) return;

    const timeout = setTimeout(async () => {
      try {
        setChecking(true);
        const params = new URLSearchParams();
        if (slug) params.set("slug", slug);
        if (domain) params.set("domain", domain || "");

        const res = await fetch(`/api/companies/check-unique?${params.toString()}`);
        const data = await res.json();

        setSlugAvailable(data.slug?.isUnique ?? null);
        setDomainAvailable(data.domain?.isUnique ?? null);
        setSlugSuggestion(data.slug?.suggestion || null);
        setDomainSuggestion(data.domain?.suggestion || null);
      } catch (err) {
        console.error("Uniqueness check failed:", err);
      } finally {
        setChecking(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [slug, domain]);

  // Helper for suggestion click
  const applySuggestion = (field: "slug" | "domain", value: string) => {
    const syntheticEvent = {
      target: { name: field, value },
    } as unknown as ChangeEvent<HTMLInputElement>;
    handleChange(syntheticEvent);
  };

  return (
    <section className="max-w-4xl mx-auto p-2">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Basic Information</h1>
        <p className="mt-1 text-gray-600">
          Tell us about your store to get started.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Store Name */}
        <div className="flex flex-col">
          <label
            htmlFor="name"
            className="flex items-center text-sm font-semibold text-gray-700"
          >
            Store Name
            <InformationCircleIcon
              className="ml-1 h-5 w-5 text-gray-400"
              title="Your brand’s public name"
            />
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
          <label
            htmlFor="tagline"
            className="flex items-center text-sm font-semibold text-gray-700"
          >
            Tagline
            <InformationCircleIcon
              className="ml-1 h-5 w-5 text-gray-400"
              title="Short, catchy tagline (2–3 words)"
            />
          </label>
          <input
            id="tagline"
            name="tagline"
            type="text"
            value={tagline || ""}
            onChange={handleChange}
            placeholder="Empower Your Journey"
            className="mt-2 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        {/* Slug (editable) */}
        <div className="flex flex-col">
          <label
            htmlFor="slug"
            className="flex items-center text-sm font-semibold text-gray-700"
          >
            Slug
            <InformationCircleIcon
              className="ml-1 h-5 w-5 text-gray-400"
              title="Auto-generated URL identifier"
            />
          </label>
          <div className="relative">
            <input
              id="slug"
              name="slug"
              type="text"
              value={slug}
              onChange={handleChange}
              placeholder="e.g. techstore"
              className={`mt-2 p-3 border rounded-xl w-full ${
                slugAvailable === false
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              }`}
            />
            {checking && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm animate-pulse">
                Checking...
              </span>
            )}
            {slugAvailable === false && (
              <span className="text-sm text-red-600 absolute top-full mt-1">
                Taken. Try{" "}
                <button
                  onClick={() => applySuggestion("slug", slugSuggestion!)}
                  type="button"
                  className="font-semibold text-indigo-600 underline"
                >
                  {slugSuggestion}
                </button>
                .
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
          <span>I'd like to set up a public website too</span>
        </label>

        {/* Domain (editable) */}
        <div className="flex flex-col">
          <label
            htmlFor="domain"
            className="flex items-center text-sm font-semibold text-gray-700"
          >
            Domain
            <InformationCircleIcon
              className="ml-1 h-5 w-5 text-gray-400"
              title="Your store’s web address"
            />
          </label>
          <div className="relative">
            <input
              id="domain"
              name="domain"
              type="text"
              value={domain || ""}
              onChange={handleChange}
              placeholder="e.g. techstore.salesmanpro.site or myshop.com"
              className={`mt-2 p-3 border rounded-xl w-full ${
                domainAvailable === false
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              }`}
            />
            {domainAvailable === false && (
              <span className="text-sm text-red-600 absolute top-full mt-1">
                Taken. Try{" "}
                <button
                  onClick={() => applySuggestion("domain", domainSuggestion!)}
                  type="button"
                  className="font-semibold text-indigo-600 underline"
                >
                  {domainSuggestion}
                </button>
                .
              </span>
            )}
            {domainAvailable === true && (
              <span className="text-sm text-green-600 absolute top-full mt-1">
                Domain is available ✅
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="md:col-span-2 flex flex-col">
          <label
            htmlFor="description"
            className="flex items-center text-sm font-semibold text-gray-700"
          >
            Description
            <InformationCircleIcon
              className="ml-1 h-5 w-5 text-gray-400"
              title="Short description (1-2 sentences)"
            />
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
