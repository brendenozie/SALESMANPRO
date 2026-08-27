'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  PaintBrushIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  LockClosedIcon,
  LockOpenIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export interface ThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
}

export interface ThemeSettingsAccordionProps {
  themeSettings: ThemeSettings | null;
  onChange: (updated: ThemeSettings) => void;
}

const DEFAULTS: ThemeSettings = {
  primaryColor: '#F43F5E',
  secondaryColor: '#FBBF24',
  fontFamily: 'Inter, sans-serif',
};

const popularFonts = [
  'Inter, sans-serif',
  'Roboto, sans-serif',
  '"Open Sans", sans-serif',
  'Lato, sans-serif',
  'Montserrat, sans-serif',
  'Poppins, sans-serif',
  'Merriweather, serif',
  '"Playfair Display", serif',
];

const themePresets = [
  { name: 'Vibrant', primary: '#6366F1', secondary: '#F59E0B' },
  { name: 'Energetic', primary: '#10B981', secondary: '#F97316' },
  { name: 'Luxury', primary: '#78350F', secondary: '#FBBF24' },
  { name: 'Oceanic', primary: '#0891B2', secondary: '#ECFEFF' },
  { name: 'Sunset', primary: '#E11D48', secondary: '#FCD34D' },
  { name: 'Forest', primary: '#059669', secondary: '#D9F99D' },
  { name: 'Retro', primary: '#9333EA', secondary: '#F472B6' },
  { name: 'Midnight', primary: '#1F2937', secondary: '#D1D5DB' },
];

export default function ThemeSettingsAccordion({
  themeSettings,
  onChange,
}: ThemeSettingsAccordionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [lockPreview, setLockPreview] = useState(false);
  const [fontFilter, setFontFilter] = useState('');
  const [isFontModalOpen, setIsFontModalOpen] = useState(false);

  const activePrimary = themeSettings?.primaryColor || DEFAULTS.primaryColor!;
  const activeSecondary = themeSettings?.secondaryColor || DEFAULTS.secondaryColor!;
  const activeFont = themeSettings?.fontFamily || DEFAULTS.fontFamily!;

  const filteredFonts = useMemo(
    () => popularFonts.filter((f) => f.toLowerCase().includes(fontFilter.toLowerCase())),
    [fontFilter]
  );

  const updateField = (key: keyof ThemeSettings, value: string) => {
    onChange({ ...themeSettings, [key]: value });
  };

  const resetDefaults = () => onChange({ ...DEFAULTS });

  // 🧩 Dynamically load selected Google font parameters
  useEffect(() => {
    const cleanFont = activeFont.replace(/, (sans-serif|serif)/, '').replace(/['"]+/g, '').trim();
    const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(cleanFont)}:wght@400;500;600;700&display=swap`;

    const existing = document.getElementById('dynamic-font');
    if (existing) existing.remove();

    const link = document.createElement('link');
    link.id = 'dynamic-font';
    link.rel = 'stylesheet';
    link.href = fontUrl;
    document.head.appendChild(link);
  }, [activeFont]);

  // 🎨 Apply style token adjustments globally
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', activePrimary);
    document.documentElement.style.setProperty('--secondary-color', activeSecondary);
    document.documentElement.style.setProperty('--font-family', activeFont);
  }, [activePrimary, activeSecondary, activeFont]);

  return (
    <motion.div
      className="max-w-4xl mx-auto rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xl backdrop-blur-md overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {/* Interactive Accordion Trigger Bar */}
      <div
        className="flex items-center justify-between p-5 cursor-pointer bg-linear-to-r from-gray-50/50 via-transparent to-transparent dark:from-zinc-800/20 select-none"
        onClick={() => setIsOpen((o) => !o)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <PaintBrushIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">Interface Customization</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Adapt visual design properties, layout colors, and typography signatures.</p>
          </div>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={resetDefaults}
            title="Reset to Factory Defaults"
            className="p-2 rounded-xl text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition"
          >
            <ArrowPathIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsOpen((o) => !o)}
            className="p-2 rounded-xl text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition"
          >
            {isOpen ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
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
            <div className="p-6 pt-0 border-t border-zinc-100 dark:border-zinc-800/60 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Configuration Panel Settings */}
              <div className="lg:col-span-7 space-y-6 mt-5">
                
                {/* Color Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Primary Accent</label>
                    <div className="flex items-center gap-2 p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xs">
                      <div className="relative w-8 h-8 rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-800 flex-shrink-0">
                        <input
                          type="color"
                          value={activePrimary}
                          onChange={(e) => updateField('primaryColor', e.target.value)}
                          className="absolute inset-0 w-full h-full transform scale-150 cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={activePrimary}
                        onChange={(e) => updateField('primaryColor', e.target.value)}
                        className="w-full bg-transparent px-1 border-none outline-hidden text-sm text-zinc-900 dark:text-zinc-100 uppercase focus:ring-0"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Secondary Fill</label>
                    <div className="flex items-center gap-2 p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xs">
                      <div className="relative w-8 h-8 rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-800 flex-shrink-0">
                        <input
                          type="color"
                          value={activeSecondary}
                          onChange={(e) => updateField('secondaryColor', e.target.value)}
                          className="absolute inset-0 w-full h-full transform scale-150 cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={activeSecondary}
                        onChange={(e) => updateField('secondaryColor', e.target.value)}
                        className="w-full bg-transparent px-1 border-none outline-hidden text-sm text-zinc-900 dark:text-zinc-100 uppercase focus:ring-0"
                      />
                    </div>
                  </div>
                </div>

                {/* Theme Color Palettes Presets Selection Grid */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Curated Palettes</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {themePresets.map((preset) => {
                      const isMatch = activePrimary.toLowerCase() === preset.primary.toLowerCase() && 
                                      activeSecondary.toLowerCase() === preset.secondary.toLowerCase();
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => onChange({ ...themeSettings, primaryColor: preset.primary, secondaryColor: preset.secondary })}
                          className={`flex flex-col items-start p-2.5 rounded-xl border text-left bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition group relative ${
                            isMatch ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-zinc-200 dark:border-zinc-800'
                          }`}
                        >
                          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-2 truncate max-w-full">{preset.name}</span>
                          <div className="flex items-center -space-x-1.5">
                            <span className="w-5 h-5 rounded-full border border-white dark:border-zinc-950 shadow-xs" style={{ backgroundColor: preset.primary }} />
                            <span className="w-5 h-5 rounded-full border border-white dark:border-zinc-950 shadow-xs" style={{ backgroundColor: preset.secondary }} />
                          </div>
                          {isMatch && (
                            <span className="absolute top-2 right-2 p-0.5 rounded-full bg-indigo-500 text-white">
                              <CheckIcon className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Typography Selection Engine Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Typography Font Face</label>
                  <button
                    type="button"
                    onClick={() => setIsFontModalOpen(true)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-left hover:border-indigo-400 dark:hover:border-indigo-500 transition shadow-2xs"
                  >
                    <span className="font-medium text-zinc-900 dark:text-zinc-100" style={{ fontFamily: activeFont }}>
                      {activeFont.replace(/, (sans-serif|serif)/, '').replace(/['"]+/g, '')}
                    </span>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide uppercase">Swap Font</span>
                  </button>
                </div>

              </div>

              {/* Dynamic Interactive Visual Sandbox Preview Container */}
              <div className="lg:col-span-5 lg:sticky lg:top-5 space-y-3 mt-5">
                <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/40">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Sandbox Render Preview</span>
                    <button
                      type="button"
                      onClick={() => setLockPreview((l) => !l)}
                      className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
                      title={lockPreview ? 'Unlock scale transformation dynamics' : 'Lock preview card constraints'}
                    >
                      {lockPreview ? <LockClosedIcon className="w-4 h-4" /> : <LockOpenIcon className="w-4 h-4" />}
                    </button>
                  </div>

                  <motion.div
                    className="p-5 border border-white dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 shadow-sm relative overflow-hidden"
                    style={{
                      fontFamily: activeFont,
                    }}
                    whileHover={{ scale: lockPreview ? 1 : 1.015 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <div 
                      className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-15 filter blur-xl transition-colors duration-300"
                      style={{ backgroundColor: activeSecondary }}
                    />
                    
                    <h3 className="text-base font-bold tracking-tight mb-1" style={{ color: activePrimary }}>
                      Live Interface Card
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                      Tweak design configurations above. Typography rules and token variables map dynamically into view.
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-transform"
                        style={{ backgroundColor: activePrimary, color: '#ffffff' }}
                      >
                        Action Accent
                      </button>
                      <button
                        type="button"
                        className="px-3 py-2 rounded-lg text-xs font-medium border dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition"
                      >
                        Secondary Option
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Font Picker Slide Modal */}
      <AnimatePresence>
        {isFontModalOpen && (
          <motion.div
            className="fixed inset-0 bg-zinc-950/40 dark:bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-2xl w-full border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[85vh]"
              initial={{ scale: 0.96, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 8 }}
              transition={{ type: 'spring', duration: 0.3 }}
            >
              {/* Modal Top Controls Bar */}
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">Select Font Signature</h3>
                </div>
                <button
                  onClick={() => setIsFontModalOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Dynamic Font Filtering Input */}
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search available typography suites..."
                    value={fontFilter}
                    onChange={(e) => setFontFilter(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-hidden transition"
                  />
                </div>
              </div>

              {/* Fonts Listing Grid Canvas */}
              <div className="p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 bg-zinc-50/30 dark:bg-zinc-950/10 flex-1">
                {filteredFonts.map((font) => {
                  const isCurrent = activeFont === font;
                  return (
                    <div
                      key={font}
                      onClick={() => {
                        updateField('fontFamily', font);
                        setIsFontModalOpen(false);
                      }}
                      style={{ fontFamily: font }}
                      className={`p-3.5 border rounded-xl cursor-pointer bg-white dark:bg-zinc-900 text-left hover:border-indigo-500 dark:hover:border-indigo-400 transition relative group ${
                        isCurrent ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 pr-6">
                        {font.replace(/, (sans-serif|serif)/, '').replace(/['"]+/g, '')}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
                        Sphinx of black quartz, judge my vow.
                      </p>
                      {isCurrent && (
                        <span className="absolute top-3.5 right-3.5 text-indigo-600 dark:text-indigo-400">
                          <CheckIcon className="w-4 h-4 stroke-[2.5]" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}