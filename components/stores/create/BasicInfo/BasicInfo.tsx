import React, { ChangeEvent, useEffect, useState } from "react";
import {
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowsRightLeftIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { ArrowPathIcon } from "@heroicons/react/20/solid"; // For checking/loading state


const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";
export interface BasicInfoProps {
  name: string;
  slug: string;
  category: string; // Not used in design, but keep for type safety
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

// Custom Input Field with Status and Suggestion
const InputWithStatus = ({
  id,
  name,
  value,
  onChange,
  placeholder,
  label,
  tooltip,
  available,
  checking,
  suggestion,
  applySuggestion,
}: {
  id: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  label: string;
  tooltip: string;
  available: boolean | null;
  checking: boolean;
  suggestion: string | null;
  applySuggestion: (field: "slug" | "domain", value: string) => void;
}) => {
  let statusIcon = null;
  let statusColor = "";
  let statusText = "";

  if (checking) {
    statusIcon = (
      <ArrowPathIcon className="h-5 w-5 animate-spin text-indigo-400" />
    );
    statusColor = "border-indigo-400";
    statusText = "Checking...";
  } else if (available === true) {
    statusIcon = <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    statusColor = "border-green-400";
    statusText = "Available";
  } else if (available === false) {
    statusIcon = <XCircleIcon className="h-5 w-5 text-red-500" />;
    statusColor = "border-red-500 bg-red-50";
    statusText = "Taken";
  }

  return (
    <div className="flex flex-col">
      <label
        htmlFor={id}
        className="flex items-center text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        <InformationCircleIcon
          className="ml-1 h-4 w-4 text-gray-400"
          title={tooltip}
        />
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full p-3 border ${statusColor || "border-gray-300"} rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-all ${available === false ? "pr-10" : "pr-3"}`}
        />
        {(checking || available !== null) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {statusIcon}
          </div>
        )}
      </div>

      <div className="mt-2 min-h-[1.5rem] text-sm">
        {available === false && suggestion && (
          <p className="text-red-600 flex items-center">
            {statusText}. Try{" "}
            <button
              onClick={() => applySuggestion(name as "slug" | "domain", suggestion)}
              type="button"
              className="ml-1 font-semibold text-indigo-600 hover:text-indigo-800 underline flex items-center"
            >
              {suggestion}
              <ArrowsRightLeftIcon className="ml-1 h-3 w-3" />
            </button>
            .
          </p>
        )}
        {available === true && (
          <p className="text-green-600">
            <span className="font-medium">{statusText}</span>.
          </p>
        )}
        {checking && (
           <p className="text-indigo-600 italic">{statusText}</p>
        )}
      </div>
    </div>
  );
};

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
    if (domain && !hasWebsite) return; // Only check domain if website is enabled

    // Reset status if fields are empty
    if (!slug) setSlugAvailable(null);
    if (!domain) setDomainAvailable(null);


    const timeout = setTimeout(async () => {
      // Only proceed if slug or domain (and hasWebsite) is set
      if (!slug && (!domain || !hasWebsite)) return;

      try {
        setChecking(true);
        const params = new URLSearchParams();
        if (slug) params.set("slug", slug);
        if (domain && hasWebsite) params.set("domain", domain);

        const res = await fetch(`${apiBaseUrl}/companies/check-unique?${params.toString()}`);
        const data = await res.json();

        // Update states based on API response, only if the input field is not empty
        setSlugAvailable(slug ? (data.slug?.isUnique ?? null) : null);
        setDomainAvailable(domain && hasWebsite ? (data.domain?.isUnique ?? null) : null);
        setSlugSuggestion(data.slug?.suggestion || null);
        setDomainSuggestion(data.domain?.suggestion || null);
      } catch (err) {
        console.error("Uniqueness check failed:", err);
        setSlugAvailable(null);
        setDomainAvailable(null);
      } finally {
        setChecking(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [slug, domain, hasWebsite]);

  // Helper for suggestion click
  const applySuggestion = (field: "slug" | "domain", value: string) => {
    const syntheticEvent = {
      target: { name: field, value },
    } as unknown as ChangeEvent<HTMLInputElement>;
    handleChange(syntheticEvent);
    // Clear suggestion after applying
    if (field === "slug") setSlugSuggestion(null);
    if (field === "domain") setDomainSuggestion(null);
  };

  return (
    <section className="max-w-4xl mx-auto p-6 bg-white">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-extrabold text-gray-900">
          <InformationCircleIcon className="inline h-8 w-8 text-indigo-500 mr-2 -mt-1" />
          Basic Information
        </h1>
        <p className="mt-2 text-gray-600">
          Set up the core identity and online presence for your store.
        </p>
      </header>

      {/* Primary Info: Name & Tagline */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">Branding Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Store Name */}
        <div className="flex flex-col">
          <label
            htmlFor="name"
            className="flex items-center text-sm font-medium text-gray-700 mb-1"
          >
            Store Name
            <InformationCircleIcon
              className="ml-1 h-4 w-4 text-gray-400"
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
            className="p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {/* Tagline */}
        <div className="flex flex-col">
          <label
            htmlFor="tagline"
            className="flex items-center text-sm font-medium text-gray-700 mb-1"
          >
            Tagline (Optional)
            <InformationCircleIcon
              className="ml-1 h-4 w-4 text-gray-400"
              title="Short, catchy slogan (2–3 words)"
            />
          </label>
          <input
            id="tagline"
            name="tagline"
            type="text"
            value={tagline || ""}
            onChange={handleChange}
            placeholder="Empower Your Journey"
            className="p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Description */}
      <div className="mb-8">
        <label
          htmlFor="description"
          className="flex items-center text-sm font-medium text-gray-700 mb-1"
        >
          Description
          <InformationCircleIcon
            className="ml-1 h-4 w-4 text-gray-400"
            title="Short description (1-2 sentences) used in search results and headers."
          />
        </label>
        <textarea
          id="description"
          name="description"
          rows={3} // Reduced rows for compactness
          value={description || ""}
          onChange={handleChange}
          placeholder="Describe your store’s mission, products, or services..."
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
        />
      </div>

      <hr className="my-8" />

      {/* Web Presence: Slug & Domain */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        <GlobeAltIcon className="inline h-6 w-6 text-indigo-500 mr-1 -mt-1" />
        Web Presence
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Slug (URL identifier) */}
        <InputWithStatus
          id="slug"
          name="slug"
          value={slug}
          onChange={handleChange as (e: ChangeEvent<HTMLInputElement>) => void}
          placeholder="e.g. my-store-id"
          label="URL Identifier (Slug)"
          tooltip="The unique, public part of your primary URL (e.g., app.site/my-store-id)"
          available={slugAvailable}
          checking={checking}
          suggestion={slugSuggestion}
          applySuggestion={applySuggestion}
        />

        {/* Has Website Checkbox */}
        <div className="md:col-span-2">
            <label className="flex items-center space-x-2 text-gray-700 font-medium cursor-pointer">
              <input
                type="checkbox"
                name="hasWebsite"
                checked={hasWebsite || false}
                onChange={handleChange}
                className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span>I want to set up a **public website and domain** for my store.</span>
            </label>
            {hasWebsite && (
                <p className="mt-1 text-sm text-indigo-600 italic">This will enable the custom domain field below.</p>
            )}
        </div>


        {/* Domain (editable) - Conditional based on hasWebsite */}
        <div className={`md:col-span-2 transition-all duration-300 ${hasWebsite ? 'opacity-100 max-h-40' : 'opacity-50 max-h-0 overflow-hidden pointer-events-none'}`}>
          <InputWithStatus
            id="domain"
            name="domain"
            value={domain || ""}
            onChange={handleChange as (e: ChangeEvent<HTMLInputElement>) => void}
            placeholder="e.g. myshop.com or techstore.salesmanpro.site"
            label="Custom Domain Name"
            tooltip="The public-facing web address for your storefront."
            available={domainAvailable}
            checking={checking}
            suggestion={domainSuggestion}
            applySuggestion={applySuggestion}
          />
        </div>
      </div>
    </section>
  );
}