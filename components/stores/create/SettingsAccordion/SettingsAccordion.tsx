'use client';

import React, { ChangeEvent, useState } from 'react';
import { 
  ChartBarIcon, 
  ChevronUpIcon, 
  ChevronDownIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Interface for Analytics configuration, matching the database schema layer.
 */
export interface AnalyticsConfig {
  id?: string;
  companyId?: string;
  googleTag?: string | null;
  facebookTag?: string | null;
  hotjarSiteId?: string | null;
  isActive?: boolean | undefined; 
}

/**
 * Props for the SettingsAccordion component.
 */
export interface SettingsAccordionProps {
  analyticsConfig: AnalyticsConfig | null;
  onChange: (updated: AnalyticsConfig) => void;
}

export default function SettingsAccordion({
  analyticsConfig,
  onChange,
}: SettingsAccordionProps) {
  const [isOpen, setIsOpen] = useState(true);

  const isGloballyActive = analyticsConfig?.isActive ?? false;
  const googleTagValue = analyticsConfig?.googleTag || '';
  const facebookTagValue = analyticsConfig?.facebookTag || '';
  const hotjarSiteIdValue = analyticsConfig?.hotjarSiteId || '';

  const updateField = (key: keyof AnalyticsConfig, value: any) => {
    onChange({ ...analyticsConfig, [key]: value });
  };

  return (
    <div className="max-w-4xl mx-auto rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xl backdrop-blur-md overflow-hidden text-zinc-900 dark:text-zinc-100">
      
      {/* Interactive Module Accordion Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-5 cursor-pointer bg-linear-to-r from-gray-50/50 via-transparent to-transparent dark:from-zinc-800/20 select-none"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <ChartBarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white">Telemetry & Analytics Engines</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Deploy third-party behavioral pixels, site triggers, and indexing tags.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Quick Telemetry Status Pill */}
          <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            isGloballyActive 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' 
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isGloballyActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
            {isGloballyActive ? 'Live Sync' : 'Disabled'}
          </span>
          <button className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-500">
            {isOpen ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="p-6 pt-0 border-t border-zinc-100 dark:border-zinc-800/60 space-y-6">
              
              {/* Master Global Killswitch Module Switch */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 mt-5 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/50">
                <div className="space-y-0.5 max-w-xl">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Global Tracker Synchronization</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
                    Instantly spin up or dismantle active tracking script injection actions across client-side DOM loads window-wide.
                  </p>
                </div>
                
                {/* Custom Interactive iOS-style Toggle Switch Button */}
                <button
                  type="button"
                  onClick={() => updateField('isActive', !isGloballyActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    isGloballyActive ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-800'
                  }`}
                  role="switch"
                  aria-checked={isGloballyActive}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      isGloballyActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Main Script Token Input Fields Layout */}
              <div className={`grid grid-cols-1 md:grid-cols-3 gap-5 transition-opacity duration-300 ${
                isGloballyActive ? 'opacity-100' : 'opacity-40 pointer-events-none select-none'
              }`}>
                
                {/* Google Analytics Integration Configuration */}
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label htmlFor="googleTag" className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4285F4]" />
                        Google Tag ID
                      </label>
                      {googleTagValue ? (
                        <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded">Standby</span>
                      )}
                    </div>
                    <input
                      id="googleTag"
                      type="text"
                      disabled={!isGloballyActive}
                      value={googleTagValue}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('googleTag', e.target.value)}
                      placeholder="G-XXXXXXXXXX"
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-hidden transition shadow-2xs"
                    />
                  </div>
                  <div className="flex items-start gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 leading-normal pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                    <InformationCircleIcon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600 flex-shrink-0 mt-0.5" />
                    <span>Handles GA4 architecture events tracking streams effortlessly.</span>
                  </div>
                </div>

                {/* Facebook / Meta Pixel Integration Configuration */}
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label htmlFor="facebookTag" className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1877F2]" />
                        Meta Pixel ID
                      </label>
                      {facebookTagValue ? (
                        <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded">Standby</span>
                      )}
                    </div>
                    <input
                      id="facebookTag"
                      type="text"
                      disabled={!isGloballyActive}
                      value={facebookTagValue}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('facebookTag', e.target.value)}
                      placeholder="1234567890"
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-hidden transition shadow-2xs"
                    />
                  </div>
                  <div className="flex items-start gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 leading-normal pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                    <InformationCircleIcon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600 flex-shrink-0 mt-0.5" />
                    <span>Feeds customized retargeting signals directly into Ads Manager.</span>
                  </div>
                </div>

                {/* Hotjar Heatmap Integration Configuration */}
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label htmlFor="hotjarSiteId" className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF1C1C]" />
                        Hotjar Site ID
                      </label>
                      {hotjarSiteIdValue ? (
                        <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded">Standby</span>
                      )}
                    </div>
                    <input
                      id="hotjarSiteId"
                      type="text"
                      disabled={!isGloballyActive}
                      value={hotjarSiteIdValue}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('hotjarSiteId', e.target.value)}
                      placeholder="1234567"
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-hidden transition shadow-2xs"
                    />
                  </div>
                  <div className="flex items-start gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 leading-normal pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                    <InformationCircleIcon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600 flex-shrink-0 mt-0.5" />
                    <span>Aggregates live recording visual heatmaps and scroll-maps.</span>
                  </div>
                </div>

              </div>

              {/* Warning/Status Callout Banner if Engines are Closed down */}
              {!isGloballyActive && (
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800/80 flex items-center gap-2.5 text-xs text-zinc-500 dark:text-zinc-400 animate-fadeIn">
                  <ExclamationCircleIcon className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  <span>Tracking properties are safely localized. Toggle <strong>Global Tracker Synchronization</strong> back on to reconnect code pipelines.</span>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}