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

/* ============================
   SIMPLE HOVER TOOLTIP
============================ */
const Tooltip = ({ content }: { content: string }) => (
  <div className="group relative ml-1.5 inline-block cursor-help">
    <InformationCircleIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500 hover:text-indigo-500 transition-colors" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-3 bg-zinc-900/95 dark:bg-black/90 backdrop-blur-xl text-xs font-medium leading-relaxed text-zinc-200 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-30 border border-zinc-800">
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-900/95 dark:border-t-black/90" />
      {content}
    </div>
  </div>
);

/* ============================
   SMART INPUT WITH VALIDATION
============================ */
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
  suffix,
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
  suffix?: string;
}) => {
  let statusBorder = "border-zinc-200 dark:border-zinc-700/80 focus-within:border-indigo-500 dark:focus-within:border-indigo-400";
  let statusBg = "bg-white/80 dark:bg-zinc-900/50";

  if (checking) {
    statusBorder = "border-indigo-400/70 focus-within:border-indigo-500";
  } else if (available === true) {
    statusBorder = "border-emerald-500/60 dark:border-emerald-500/50 focus-within:border-emerald-500";
    statusBg = "bg-emerald-50/[0.03] dark:bg-emerald-950/[0.1]";
  } else if (available === false) {
    statusBorder = "border-rose-500/60 dark:border-rose-500/50 focus-within:border-rose-500";
    statusBg = "bg-rose-50/[0.03] dark:bg-rose-950/[0.1]";
  }

  return (
    <div className="flex flex-col space-y-2 w-full group">
      <label htmlFor={id} className="flex items-center text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
        {label}
        <Tooltip content={tooltip} />
      </label>
      
      <div className={`relative flex items-center rounded-xl border ${statusBg} ${statusBorder} shadow-sm backdrop-blur-sm transition-all focus-within:ring-4 ${available === false ? 'focus-within:ring-rose-500/10' : 'focus-within:ring-indigo-500/10'}`}>
        <div className="pl-3.5 pointer-events-none">
          <StartIcon className="h-4 w-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        
        {prefix && (
          <span className="text-xs sm:text-sm font-semibold text-zinc-400 pl-2 select-none">
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
          className="w-full py-3.5 px-2 text-sm md:text-base bg-transparent outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400"
        />

        {suffix && (
          <span className="text-xs sm:text-sm font-semibold text-zinc-400 dark:text-zinc-500 pr-3 select-none">
            {suffix}
          </span>
        )}

        <div className="pr-3.5 flex items-center pointer-events-none">
          <AnimatePresence mode="wait">
            {checking ? (
              <motion.div key="checking" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
                <ArrowPathIcon className="h-5 w-5 animate-spin text-indigo-500" />
              </motion.div>
            ) : available === true ? (
              <motion.div key="available" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
                <CheckCircleIcon className="h-5 w-5 text-emerald-500 stroke-[2.5]" />
              </motion.div>
            ) : available === false ? (
              <motion.div key="taken" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
                <XCircleIcon className="h-5 w-5 text-rose-500 stroke-[2.5]" />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <div className="min-h-[1.5rem] px-1">
        <AnimatePresence mode="wait">
          {available === false && suggestion ? (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-xs md:text-sm text-rose-600 dark:text-rose-400 flex items-center flex-wrap gap-1.5">
              <span>Taken. Try this instead:</span>
              <button
                onClick={() => applySuggestion(name as "slug" | "domain", suggestion)}
                type="button"
                className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline active:scale-95 transition-all"
              >
                {suggestion}
                <ArrowsRightLeftIcon className="h-3 w-3 stroke-[2.5]" />
              </button>
            </motion.div>
          ) : available === true ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs md:text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              Awesome! This domain parameter is available.
            </motion.p>
          ) : checking ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs md:text-sm italic text-zinc-500 dark:text-zinc-400">
              Checking availability...
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ============================
   MAIN COMPONENT
============================ */
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
        setSlugAvailable(null);
        setDomainAvailable(null);
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
    <section className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8 relative">
      {/* Visual Ambient Background */}
      <div className="absolute top-0 left-1/4 -z-10 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      {/* HEADER */}
      <header className="mb-8 md:mb-10 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            <BuildingStorefrontIcon className="w-4 h-4" /> Store Setup
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
            Basic Information
          </h1>
          <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Let's build your store identity. Set up your brand details and choose your preferred customer storefront channel.
          </p>
        </div>
      </header>

      {/* BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* LEFT COLUMN: BRAND DETAILS */}
        <div className="lg:col-span-6 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <span className="p-2.5 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-inner">
                <SparklesIcon className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Store Identity</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Define how your brand appears to visitors</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Store Name Input */}
                <div className="flex flex-col space-y-2 group">
                  <label htmlFor="name" className="flex items-center text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                    Store Name
                    <Tooltip content="The public name of your business. This is what customers will see first." />
                  </label>
                  <div className="relative">
                    <TagIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={name}
                      onChange={handleChange}
                      placeholder="e.g. Apex Apparel"
                      className="w-full pl-11 pr-4 py-3.5 text-sm md:text-base bg-white/80 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700/80 rounded-xl outline-none focus:border-indigo-500 dark:focus:border-indigo-400 shadow-sm transition-all focus:ring-4 focus:ring-indigo-500/10 text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Tagline Input */}
                <div className="flex flex-col space-y-2 group">
                  <label htmlFor="tagline" className="flex items-center text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                    Slogan <span className="ml-1 text-[10px] text-zinc-400 lowercase font-normal">(Optional)</span>
                    <Tooltip content="A short, catchy phrase about what makes your store special." />
                  </label>
                  <div className="relative">
                    <SparklesIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                    <input
                      id="tagline"
                      name="tagline"
                      type="text"
                      value={tagline || ""}
                      onChange={handleChange}
                      placeholder="e.g. Style for everyday"
                      className="w-full pl-11 pr-4 py-3.5 text-sm md:text-base bg-white/80 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700/80 rounded-xl outline-none focus:border-indigo-500 dark:focus:border-indigo-400 shadow-sm transition-all focus:ring-4 focus:ring-indigo-500/10 text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Description Textarea */}
              <div className="flex flex-col space-y-2 group">
                <label htmlFor="description" className="flex items-center text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                  About Your Store
                  <Tooltip content="Tell customers what you sell and the story behind your business." />
                </label>
                <div className="relative">
                  <DocumentTextIcon className="absolute left-3.5 top-4 h-5 w-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={description || ""}
                    onChange={handleChange}
                    placeholder="We offer high-quality clothing for modern urban lifestyles..."
                    className="w-full pl-11 pr-4 py-3.5 text-sm md:text-base bg-white/80 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700/80 rounded-xl outline-none focus:border-indigo-500 dark:focus:border-indigo-400 shadow-sm transition-all focus:ring-4 focus:ring-indigo-500/10 text-zinc-900 dark:text-white resize-none"
                  />
                </div>
              </div>

              {/* Shared Marketplace Slug Link */}
              <div className="pt-2">
                <InputWithStatus
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={handleChange as (e: ChangeEvent<HTMLInputElement>) => void}
                  placeholder="apex-apparel"
                  label="Marketplace Directory Handle"
                  tooltip="Your unique identifier on the shared marketplace directory."
                  available={slugAvailable}
                  checking={checking}
                  suggestion={slugSuggestion}
                  applySuggestion={applySuggestion}
                  icon={TagIcon}
                  prefix="ghuba.salesmanpro.site/"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: WEB PRESENCE & DEDICATED STOREFRONT SELECTION */}
        <div className="lg:col-span-6 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-inner">
                  <GlobeAltIcon className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Storefront Model</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Choose how customers access your store online</p>
                </div>
              </div>
              
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                <StarIcon className="w-3 h-3 fill-indigo-500" /> Recommendation
              </span>
            </div>

            {/* INTERACTIVE STOREFRONT TYPE SELECTOR CARDS */}
            <div className="grid grid-cols-1 gap-3.5 mb-6">
              {/* Option 1: Marketplace Profile Only */}
              <div
                onClick={() => toggleHasWebsite(false)}
                className={`relative p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-start gap-4 ${
                  !hasWebsite
                    ? "bg-white dark:bg-zinc-800/90 border-indigo-500 shadow-md ring-2 ring-indigo-500/20"
                    : "bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className={`mt-0.5 p-2 rounded-xl ${!hasWebsite ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400" : "bg-zinc-200/60 dark:bg-zinc-800 text-zinc-400"}`}>
                  <BuildingStorefrontIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Marketplace Listing Only</h3>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${!hasWebsite ? "border-indigo-600 bg-indigo-600 text-white" : "border-zinc-300 dark:border-zinc-600"}`}>
                      {!hasWebsite && <CheckIcon className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Your store is listed inside the Ghuba discovery marketplace hub.
                  </p>
                </div>
              </div>

              {/* Option 2: Dedicated Custom Web Storefront */}
              <div
                onClick={() => toggleHasWebsite(true)}
                className={`relative p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-start gap-4 ${
                  hasWebsite
                    ? "bg-gradient-to-br from-indigo-500/5 via-white to-emerald-500/5 dark:from-indigo-950/20 dark:via-zinc-900 dark:to-emerald-950/20 border-indigo-500 shadow-lg ring-2 ring-indigo-500/20"
                    : "bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className={`mt-0.5 p-2 rounded-xl ${hasWebsite ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" : "bg-zinc-200/60 dark:bg-zinc-800 text-zinc-400"}`}>
                  <RocketLaunchIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Standalone Custom Website</h3>
                      <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300/40">
                        Pro
                      </span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${hasWebsite ? "border-indigo-600 bg-indigo-600 text-white" : "border-zinc-300 dark:border-zinc-600"}`}>
                      {hasWebsite && <CheckIcon className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    Get a dedicated standalone online store at your own unique web address. Perfect for sharing on Instagram, WhatsApp, and social bios.
                  </p>

                  {/* Feature Value Pills */}
                  <div className="flex items-center flex-wrap gap-2 mt-3 pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-600 dark:text-zinc-300 bg-white/80 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700">
                      <CheckIcon className="w-3 h-3 text-emerald-500 stroke-[3]" /> Custom Subdomain
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-600 dark:text-zinc-300 bg-white/80 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700">
                      <CheckIcon className="w-3 h-3 text-emerald-500 stroke-[3]" /> Custom Branding
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-600 dark:text-zinc-300 bg-white/80 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700">
                      <CheckIcon className="w-3 h-3 text-emerald-500 stroke-[3]" /> Direct Checkout
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ANIMATED EXPANDABLE CUSTOM SUBDOMAIN FIELD */}
            <AnimatePresence initial={false}>
              {hasWebsite && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden origin-top"
                >
                  <div className="p-4 rounded-2xl bg-indigo-500/[0.03] dark:bg-indigo-500/[0.05] border border-indigo-200/80 dark:border-indigo-800/50 space-y-4">
                    <InputWithStatus
                      id="domain"
                      name="domain"
                      value={domain || ""}
                      onChange={handleChange as (e: ChangeEvent<HTMLInputElement>) => void}
                      placeholder="mybrand"
                      label="Your Custom Subdomain"
                      tooltip="Choose your web store address. For example, 'apex' creates 'apex.salesmanpro.site'."
                      available={domainAvailable}
                      checking={checking}
                      suggestion={domainSuggestion}
                      applySuggestion={applySuggestion}
                      icon={GlobeAltIcon}
                      suffix=".salesmanpro.site"
                    />

                    {/* LIVE INTERACTIVE PREVIEW CARD */}
                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <div className="flex flex-col truncate">
                          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Live URL Preview</span>
                          <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 truncate">
                            https://{domain ? domain.toLowerCase().trim() : "yourbrand"}.salesmanpro.site
                          </span>
                        </div>
                      </div>
                      <DevicePhoneMobileIcon className="w-5 h-5 text-zinc-400 shrink-0" />
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