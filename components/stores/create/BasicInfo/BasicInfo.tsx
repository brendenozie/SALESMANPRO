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
} from "@heroicons/react/24/outline";
import { ArrowPathIcon } from "@heroicons/react/20/solid";
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
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-zinc-900/95 dark:bg-black/90 backdrop-blur-xl text-xs font-medium leading-relaxed text-zinc-200 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-30 border border-zinc-800">
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
}) => {
  let statusBorder = "border-zinc-200 dark:border-zinc-700/80 focus:border-indigo-500 dark:focus:border-indigo-400";
  let statusBg = "bg-white/80 dark:bg-zinc-900/50";

  if (checking) {
    statusBorder = "border-indigo-400/70 focus:border-indigo-500";
  } else if (available === true) {
    statusBorder = "border-emerald-500/60 dark:border-emerald-500/50 focus:border-emerald-500";
    statusBg = "bg-emerald-50/[0.05] dark:bg-emerald-950/[0.1]";
  } else if (available === false) {
    statusBorder = "border-rose-500/60 dark:border-rose-500/50 focus:border-rose-500";
    statusBg = "bg-rose-50/[0.05] dark:bg-rose-950/[0.1]";
  }

  return (
    <div className="flex flex-col space-y-2 w-full group">
      <label htmlFor={id} className="flex items-center text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
        {label}
        <Tooltip content={tooltip} />
      </label>
      
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <StartIcon className="h-4 w-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        
        <input
          id={id}
          name={name}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-3.5 text-sm md:text-base rounded-xl border outline-none ${statusBg} ${statusBorder} shadow-sm backdrop-blur-sm transition-all focus:ring-4 ${available === false ? 'focus:ring-rose-500/10' : 'focus:ring-indigo-500/10'} text-zinc-900 dark:text-white`}
        />

        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
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
              Awesome! This link is available.
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
            Let's get your store set up. Enter your brand details and choose how customers will find you online.
          </p>
        </div>
      </header>

      {/* BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* LEFT COLUMN: BRAND DETAILS */}
        <div className="lg:col-span-7 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <span className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-inner">
              <SparklesIcon className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Your Store's Brand</h2>
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
                  Store Slogan <span className="ml-1 text-[10px] text-zinc-400 lowercase font-normal">(Optional)</span>
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
                  placeholder="We offer high-quality clothing for..."
                  className="w-full pl-11 pr-4 py-3.5 text-sm md:text-base bg-white/80 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700/80 rounded-xl outline-none focus:border-indigo-500 dark:focus:border-indigo-400 shadow-sm transition-all focus:ring-4 focus:ring-indigo-500/10 text-zinc-900 dark:text-white resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: WEB PRESENCE */}
        <div className="lg:col-span-5 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-inner">
              <GlobeAltIcon className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Web Link & Domain</h2>
          </div>

          <div className="space-y-6 flex-grow">
            {/* Slug URL Input */}
            <InputWithStatus
              id="slug"
              name="slug"
              value={slug}
              onChange={handleChange as (e: ChangeEvent<HTMLInputElement>) => void}
              placeholder="e.g. apex-apparel"
              label="Store Web Link"
              tooltip="The unique part of your web link. For example, if you enter 'my-store', your link might be 'hub.site/my-store'."
              available={slugAvailable}
              checking={checking}
              suggestion={slugSuggestion}
              applySuggestion={applySuggestion}
              icon={TagIcon}
            />

            {/* Divider */}
            <div className="h-px w-full bg-zinc-200 dark:bg-zinc-800/80" />

            {/* Custom Website Toggle */}
            <div className="flex items-start p-4 md:p-5 bg-zinc-50 dark:bg-black/20 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl cursor-pointer group hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors"
                 onClick={() => {
                   const e = { target: { name: 'hasWebsite', type: 'checkbox', checked: !hasWebsite } } as unknown as ChangeEvent<HTMLInputElement>;
                   handleChange(e);
                 }}>
              <label className="flex items-start space-x-4 text-zinc-700 dark:text-zinc-300 w-full cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="hasWebsite"
                  checked={hasWebsite || false}
                  onChange={handleChange}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1 h-5 w-5 text-indigo-600 dark:text-indigo-500 border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 focus:ring-indigo-500/40 transition-all cursor-pointer"
                />
                <div className="flex flex-col space-y-1">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm md:text-base">Want your own website?</span>
                  <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400">select this to have a custom website for your store.</p>
                </div>
              </label>
            </div>

            {/* Custom Domain Field (Animated) */}
            <AnimatePresence initial={false}>
              {hasWebsite && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden origin-top"
                >
                  <div className="pt-2">
                    <InputWithStatus
                      id="domain"
                      name="domain"
                      value={domain || ""}
                      onChange={handleChange as (e: ChangeEvent<HTMLInputElement>) => void}
                      placeholder="e.g. ***.salesmanpro.site"
                      label="Your subdomain"
                      tooltip="This is you custom subdomain for your store. For example, if you enter 'my-store', your link will be 'my-store.salesmanpro.site'."
                      available={domainAvailable}
                      checking={checking}
                      suggestion={domainSuggestion}
                      applySuggestion={applySuggestion}
                      icon={GlobeAltIcon}
                    />
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