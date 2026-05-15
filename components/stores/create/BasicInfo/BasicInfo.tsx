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
  CpuChipIcon
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
   PREMIUM HOVER-CARD TOOLTIP
============================ */
const PremiumTooltip = ({ content }: { content: string }) => (
  <div className="group relative ml-1.5 inline-block cursor-help">
    <InformationCircleIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500 hover:text-indigo-500 transition-colors" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2.5 bg-zinc-900/95 dark:bg-zinc-950 backdrop-blur-md text-[11px] font-normal leading-relaxed text-zinc-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-30 border border-zinc-800">
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-900/95 dark:border-t-zinc-950" />
      {content}
    </div>
  </div>
);

/* ============================
   SMART VALIDATED INPUT COMPONENT
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
  let statusBorder = "border-zinc-200 dark:border-zinc-800/80 focus:border-indigo-500 dark:focus:border-indigo-400";
  let statusBg = "bg-white dark:bg-zinc-900/60";

  if (checking) {
    statusBorder = "border-indigo-400/70 focus:border-indigo-500";
  } else if (available === true) {
    statusBorder = "border-emerald-500/60 dark:border-emerald-500/40 focus:border-emerald-500";
    statusBg = "bg-emerald-50/[0.02] dark:bg-emerald-950/[0.02]";
  } else if (available === false) {
    statusBorder = "border-rose-500/60 dark:border-rose-500/40 focus:border-rose-500";
    statusBg = "bg-rose-50/[0.02] dark:bg-rose-950/[0.02]";
  }

  return (
    <div className="flex flex-col space-y-1.5 w-full group">
      <label htmlFor={id} className="flex items-center text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {label}
        <PremiumTooltip content={tooltip} />
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
          className={`w-full pl-10 pr-10 py-3 text-sm rounded-xl border outline-none ${statusBg} ${statusBorder} shadow-sm transition-all focus:ring-4 ${available === false ? 'focus:ring-rose-500/5' : 'focus:ring-indigo-500/5'}`}
        />

        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
          <AnimatePresence mode="wait">
            {checking ? (
              <motion.div key="checking" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
                <ArrowPathIcon className="h-4 w-4 animate-spin text-indigo-500" />
              </motion.div>
            ) : available === true ? (
              <motion.div key="available" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
                <CheckCircleIcon className="h-4 w-4 text-emerald-500 stroke-[2.5]" />
              </motion.div>
            ) : available === false ? (
              <motion.div key="taken" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
                <XCircleIcon className="h-4 w-4 text-rose-500 stroke-[2.5]" />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <div className="min-h-[1.25rem] px-1">
        <AnimatePresence mode="wait">
          {available === false && suggestion ? (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-xs text-rose-600 dark:text-rose-400/90 flex items-center flex-wrap gap-1">
              <span>Taken. Alternative suggestion available:</span>
              <button
                onClick={() => applySuggestion(name as "slug" | "domain", suggestion)}
                type="button"
                className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 hover:underline active:scale-95 transition-transform"
              >
                {suggestion}
                <ArrowsRightLeftIcon className="h-3 w-3 stroke-[2.5]" />
              </button>
            </motion.div>
          ) : available === true ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-semibold text-emerald-600 dark:text-emerald-400/90">
              Identity vector is available for registration.
            </motion.p>
          ) : checking ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs italic text-indigo-500">
              Querying distributed global registry database...
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ============================
   MAIN ADVANCED PANEL
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
        console.error("Uniqueness engine handshake failure:", err);
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
    <section className="max-w-4xl mx-auto p-4 md:p-10 relative">
      {/* Visual Ambient Decorative Accents */}
      <div className="absolute top-0 left-1/3 -z-10 w-72 h-72 bg-indigo-500/[0.02] dark:bg-indigo-500/[0.01] rounded-full blur-[80px]" />
      
      {/* PREMIUM BLOCK HEADER */}
      <header className="mb-10 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            <CpuChipIcon className="w-3.5 h-3.5 animate-pulse" /> Identity Management
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            Basic Information
          </h1>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 max-w-xl">
            Configure public identity structures, storefront parameters, and routing paths.
          </p>
        </div>
      </header>

      <div className="space-y-8">
        {/* SECTION 1: CORE BRANDING CARD */}
        <div className="bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200/60 dark:border-zinc-800/60 rounded-[2rem] p-6 md:p-8 shadow-sm space-y-6 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <SparklesIcon className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">Branding Blueprint</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Store Name Input */}
            <div className="flex flex-col space-y-1.5 group">
              <label htmlFor="name" className="flex items-center text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Storefront Signature Title
                <PremiumTooltip content="Your premium corporate brand's public-facing title layout." />
              </label>
              <div className="relative">
                <TagIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={handleChange}
                  placeholder="e.g. Apex Apparel Studio"
                  className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-xl outline-none focus:border-indigo-500 dark:focus:border-indigo-400 shadow-sm transition-all focus:ring-4 focus:ring-indigo-500/5 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            {/* Tagline Input */}
            <div className="flex flex-col space-y-1.5 group">
              <label htmlFor="tagline" className="flex items-center text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Brand Core Tagline <span className="ml-1 text-[10px] text-zinc-400 lowercase italic">(optional)</span>
                <PremiumTooltip content="Short motivational dynamic snippet statement (ideally limited to 3-5 words)." />
              </label>
              <div className="relative">
                <SparklesIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                <input
                  id="tagline"
                  name="tagline"
                  type="text"
                  value={tagline || ""}
                  onChange={handleChange}
                  placeholder="e.g. Engineering Tomorrow's Essentials"
                  className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-xl outline-none focus:border-indigo-500 dark:focus:border-indigo-400 shadow-sm transition-all focus:ring-4 focus:ring-indigo-500/5 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
          </div>

          {/* Description Textarea */}
          <div className="flex flex-col space-y-1.5 group">
            <label htmlFor="description" className="flex items-center text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Corporate Mission Overview Narrative
              <PremiumTooltip content="A concise summary paragraph deployed to public search engines, indices, and portal index headers." />
            </label>
            <div className="relative">
              <DocumentTextIcon className="absolute left-3.5 top-4 h-4 w-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
              <textarea
                id="description"
                name="description"
                rows={3}
                value={description || ""}
                onChange={handleChange}
                placeholder="Elaborate on your corporate core values, product matrices, operations frameworks, and target market solutions..."
                className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-xl outline-none focus:border-indigo-500 dark:focus:border-indigo-400 shadow-sm transition-all focus:ring-4 focus:ring-indigo-500/5 text-zinc-900 dark:text-zinc-100 resize-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: WEB PRESENCE & CUSTOM DOMAIN CARD */}
        <div className="bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200/60 dark:border-zinc-800/60 rounded-[2rem] p-6 md:p-8 shadow-sm space-y-6 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <GlobeAltIcon className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">Network Routing & Web Presence</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-6">
            {/* Slug URL Input */}
            <InputWithStatus
              id="slug"
              name="slug"
              value={slug}
              onChange={handleChange as (e: ChangeEvent<HTMLInputElement>) => void}
              placeholder="e.g. apex-studios"
              label="Routing Pointer Identifier (Slug)"
              tooltip="The alphanumeric key assigned for target portal subdirectory routing structures (e.g. hub.site/your-slug-id)"
              available={slugAvailable}
              checking={checking}
              suggestion={slugSuggestion}
              applySuggestion={applySuggestion}
              icon={TagIcon}
            />

            {/* Premium Website Toggle Checkbox Block */}
            <div className="md:col-span-2 flex items-start p-4 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-inner group/checkbox">
              <label className="flex items-start space-x-3.5 text-zinc-700 dark:text-zinc-300 font-medium cursor-pointer select-none text-sm leading-tight">
                <input
                  type="checkbox"
                  name="hasWebsite"
                  checked={hasWebsite || false}
                  onChange={handleChange}
                  className="mt-0.5 h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400 border-zinc-300 dark:border-zinc-700 rounded focus:ring-indigo-500/40 transition-all cursor-pointer"
                />
                <div className="space-y-0.5">
                  <span className="font-bold text-zinc-800 dark:text-zinc-100">Provision Standalone Web Storefront Instance</span>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">Enable cloud-native compilation parameters to open an isolated custom domain pipeline.</p>
                </div>
              </label>
            </div>

            {/* Animated Conditional Domain Field Block */}
            <div className="md:col-span-2">
              <AnimatePresence initial={false}>
                {hasWebsite && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2">
                      <InputWithStatus
                        id="domain"
                        name="domain"
                        value={domain || ""}
                        onChange={handleChange as (e: ChangeEvent<HTMLInputElement>) => void}
                        placeholder="e.g. store.apexstudios.com"
                        label="Dedicated Custom Domain Target Address"
                        tooltip="The primary domain pointer where users map DNS records to bind storefront clusters."
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
      </div>
    </section>
  );
}