'use client';

import React, { ChangeEvent, useEffect, useState } from "react";
import {
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowsRightLeftIcon,
  GlobeAltIcon,
  SparklesIcon,
  TagIcon,
  DocumentTextIcon,
  BuildingStorefrontIcon,
  RocketLaunchIcon,
  CheckIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";
import { ArrowPathIcon, StarIcon } from "@heroicons/react/20/solid";
import { motion, AnimatePresence } from "framer-motion";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export interface BasicInfoProps {
  name: string;
  slug: string;
  category: string;
  hasWebsite: boolean | null | undefined;
  description?: string | undefined | null;
  tagline: string | null;
  domain: string | null;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
}

/* Tooltip */
const Tooltip = ({ content }: { content: string }) => (
  <div className="group relative ml-1.5 inline-block cursor-help">
    <InformationCircleIcon className="h-4 w-4 text-zinc-400 hover:text-indigo-500 transition-colors" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-zinc-900 text-xs font-normal text-zinc-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-30 border border-zinc-800">
      {content}
    </div>
  </div>
);

/* Smart Input Field */
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
  icon: StartIcon,
  prefix,
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
  icon: React.ElementType;
  prefix?: string;
}) => {
  let statusBorder = "border-zinc-200 dark:border-zinc-700/80 focus-within:border-indigo-500";
  let statusBg = "bg-white dark:bg-zinc-900/50";

  if (checking) {
    statusBorder = "border-indigo-400";
  } else if (available === true) {
    statusBorder = "border-emerald-500";
    statusBg = "bg-emerald-50/20 dark:bg-emerald-950/20";
  } else if (available === false) {
    statusBorder = "border-rose-500";
    statusBg = "bg-rose-50/20 dark:bg-rose-950/20";
  }

  return (
    <div className="flex flex-col space-y-1.5 w-full">
      <label htmlFor={id} className="flex items-center text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
        {label}
        {tooltip && <Tooltip content={tooltip} />}
      </label>
      
      <div className={`relative flex items-center rounded-xl border ${statusBg} ${statusBorder} transition-all focus-within:ring-2 focus-within:ring-indigo-500/20`}>
        <div className="pl-3.5 pointer-events-none">
          <StartIcon className="h-4 w-4 text-zinc-400" />
        </div>
        
        {prefix && (
          <span className="text-xs font-medium text-zinc-400 pl-2 select-none">
            {prefix}
          </span>
        )}

        <input
          id={id}
          name={name}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full py-3 px-2 text-sm bg-transparent outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400"
        />

        <div className="pr-3.5 flex items-center pointer-events-none">
          <AnimatePresence mode="wait">
            {checking ? (
              <ArrowPathIcon className="h-4 w-4 animate-spin text-indigo-500" />
            ) : available === true ? (
              <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
            ) : available === false ? (
              <XCircleIcon className="h-4 w-4 text-rose-500" />
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <div className="min-h-[1.25rem] px-1">
        <AnimatePresence mode="wait">
          {available === false && suggestion ? (
            <div className="text-xs text-rose-500 flex items-center gap-1.5">
              <span>Taken. Try this:</span>
              <button
                onClick={() => applySuggestion(name as "slug" | "domain", suggestion)}
                type="button"
                className="font-bold text-indigo-500 hover:underline inline-flex items-center gap-1"
              >
                {suggestion}
                <ArrowsRightLeftIcon className="h-3 w-3" />
              </button>
            </div>
          ) : available === true ? (
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Great choice! This address is available.
            </p>
          ) : checking ? (
            <p className="text-xs italic text-zinc-400">Checking availability...</p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* Main Component */
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

  useEffect(() => {
    if (!slug && !domain) return;
    if (domain && !hasWebsite) return;

    if (!slug) setSlugAvailable(null);
    if (!domain) setDomainAvailable(null);

    const timeout = setTimeout(async () => {
      if (!slug && (!domain || !hasWebsite)) return;

      try {
        setChecking(true);
        const params = new URLSearchParams();
        if (slug) params.set("slug", slug);
        if (domain && hasWebsite) params.set("domain", domain);

        const res = await fetch(`${apiBaseUrl}/companies/check-unique?${params.toString()}`);
        const data = await res.json();

        setSlugAvailable(slug ? (data.slug?.isUnique ?? null) : null);
        setDomainAvailable(domain && hasWebsite ? (data.domain?.isUnique ?? null) : null);
        setSlugSuggestion(data.slug?.suggestion || null);
        setDomainSuggestion(data.domain?.suggestion || null);
      } catch (err) {
        console.error("Failed to check availability:", err);
      } finally {
        setChecking(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [slug, domain, hasWebsite]);

  const applySuggestion = (field: "slug" | "domain", value: string) => {
    const syntheticEvent = {
      target: { name: field, value },
    } as unknown as ChangeEvent<HTMLInputElement>;
    handleChange(syntheticEvent);
    if (field === "slug") setSlugSuggestion(null);
    if (field === "domain") setDomainSuggestion(null);
  };

  const toggleHasWebsite = (enableWebsite: boolean) => {
    const syntheticEvent = {
      target: { name: "hasWebsite", type: "checkbox", checked: enableWebsite },
    } as unknown as ChangeEvent<HTMLInputElement>;
    handleChange(syntheticEvent);
  };

  return (
    <section className="max-w-5xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <header className="mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
          <BuildingStorefrontIcon className="w-4 h-4" /> Step 1: Store Details
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mt-1">
          Tell us about your business
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Set up your brand identity and choose how customers find your store.
        </p>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Brand Info */}
        <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <SparklesIcon className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">Store Profile</h2>
              <p className="text-xs text-zinc-500">Your basic store details</p>
            </div>
          </div>

          {/* Store Name */}
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
              Store Name
            </label>
            <div className="relative">
              <TagIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={handleChange}
                placeholder="e.g. Apex Apparel"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:border-indigo-500 text-zinc-900 dark:text-white"
              />
            </div>
          </div>

          {/* Slogan */}
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="tagline" className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
              Slogan <span className="text-zinc-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              id="tagline"
              name="tagline"
              type="text"
              value={tagline || ""}
              onChange={handleChange}
              placeholder="e.g. Quality clothing for everyday wear"
              className="w-full px-3.5 py-2.5 text-sm bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:border-indigo-500 text-zinc-900 dark:text-white"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
              About Your Store
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={description || ""}
              onChange={handleChange}
              placeholder="Briefly describe what you sell..."
              className="w-full p-3 text-sm bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:border-indigo-500 text-zinc-900 dark:text-white resize-none"
            />
          </div>

          {/* Directory Handle */}
          <InputWithStatus
            id="slug"
            name="slug"
            value={slug}
            onChange={handleChange as (e: ChangeEvent<HTMLInputElement>) => void}
            placeholder="apex-apparel"
            label="Marketplace Profile Link"
            tooltip="Your address inside the shared store directory."
            available={slugAvailable}
            checking={checking}
            suggestion={slugSuggestion}
            applySuggestion={applySuggestion}
            icon={TagIcon}
            prefix="salesmanpro.site/"
          />
        </div>

        {/* Right Column: Web Store Choice */}
        <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <GlobeAltIcon className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white">Online Presence</h2>
                  <p className="text-xs text-zinc-500">How customers visit your shop</p>
                </div>
              </div>
            </div>

            {/* Option 1 */}
            <div
              onClick={() => toggleHasWebsite(false)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                !hasWebsite
                  ? "border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/20 ring-1 ring-indigo-500"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
              }`}
            >
              <BuildingStorefrontIcon className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Directory Listing Only</h3>
                  {!hasWebsite && <CheckIcon className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Your products appear in the main marketplace search.
                </p>
              </div>
            </div>

            {/* Option 2 */}
            <div
              onClick={() => toggleHasWebsite(true)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                hasWebsite
                  ? "border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/20 ring-1 ring-indigo-500"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
              }`}
            >
              <RocketLaunchIcon className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Standalone Website</h3>
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">Pro</span>
                  </div>
                  {hasWebsite && <CheckIcon className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Get your own dedicated store link to share on WhatsApp, Instagram, or social bios.
                </p>
              </div>
            </div>

            {/* Subdomain Input */}
            <AnimatePresence>
              {hasWebsite && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden pt-2"
                >
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-3">
                    <InputWithStatus
                      id="domain"
                      name="domain"
                      value={domain || ""}
                      onChange={handleChange as (e: ChangeEvent<HTMLInputElement>) => void}
                      placeholder="mybrand"
                      label="Your Store Subdomain"
                      tooltip="Choose your store web address name."
                      available={domainAvailable}
                      checking={checking}
                      suggestion={domainSuggestion}
                      applySuggestion={applySuggestion}
                      icon={GlobeAltIcon}
                    />

                    {/* Preview */}
                    <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400 truncate">
                          https://{domain ? domain.toLowerCase().trim() : "yourbrand"}.salesmanpro.site
                        </span>
                      </div>
                      <DevicePhoneMobileIcon className="w-4 h-4 text-zinc-400 shrink-0" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  );
}