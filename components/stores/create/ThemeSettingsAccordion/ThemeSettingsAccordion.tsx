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
} from '@heroicons/react/24/solid';
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
  primaryColor: '#6366F1',
  secondaryColor: '#F59E0B',
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
  { name: 'Vibrant', primary: '#6366F1', secondary: '#F59E0B' }, // Existing
  { name: 'Energetic', primary: '#10B981', secondary: '#F97316' }, // Existing
  { name: 'Elegant', primary: '#0F172A', secondary: '#E2E8F0' }, // Existing
  { name: 'Luxury', primary: '#78350F', secondary: '#FBBF24' }, // Existing
  { name: 'Minimal', primary: '#3B82F6', secondary: '#9CA3AF' }, // Existing
  { name: 'Bold', primary: '#EF4444', secondary: '#1E3A8A' }, // Existing
  { name: 'Oceanic', primary: '#0891B2', secondary: '#ECFEFF' }, // Teal primary, light secondary for contrast
  { name: 'Sunset', primary: '#E11D48', secondary: '#FCD34D' }, // Deep red/pink primary, golden yellow secondary
  { name: 'Forest', primary: '#059669', secondary: '#D9F99D' }, // Dark green primary, bright lime/pale green secondary
  { name: 'Retro', primary: '#9333EA', secondary: '#F472B6' }, // Deep violet primary, hot pink secondary for a vintage feel
  { name: 'Monochromatic', primary: '#1E40AF', secondary: '#93C5FD' },
  { name: 'High Contrast', primary: '#000000', secondary: '#FFFF00' },
  { name: 'Midnight', primary: '#1F2937', secondary: '#D1D5DB' }
];

export default function ThemeSettingsAccordion({
  themeSettings,
  onChange,
}: ThemeSettingsAccordionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [lockPreview, setLockPreview] = useState(false);
  const [fontFilter, setFontFilter] = useState('');
  const [isFontModalOpen, setIsFontModalOpen] = useState(false);

  const filteredFonts = useMemo(
    () =>
      popularFonts.filter((f) =>
        f.toLowerCase().includes(fontFilter.toLowerCase())
      ),
    [fontFilter]
  );

  const updateField = (key: keyof ThemeSettings, value: string) =>
    onChange({ ...themeSettings, [key]: value });

  const resetDefaults = () => onChange({ ...DEFAULTS });

  // 🧩 Dynamically load selected Google font
  useEffect(() => {
    if (!themeSettings?.fontFamily) return;

    const cleanFont = themeSettings.fontFamily
      .replace(/, (sans-serif|serif)/, '')
      .replace(/['"]+/g, '')
      .trim();

    const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      cleanFont
    )}:wght@400;500;600;700&display=swap`;

    // Remove existing dynamic font links before adding a new one
    const existing = document.getElementById('dynamic-font');
    if (existing) existing.remove();

    const link = document.createElement('link');
    link.id = 'dynamic-font';
    link.rel = 'stylesheet';
    link.href = fontUrl;
    document.head.appendChild(link);
  }, [themeSettings?.fontFamily]);

  // 🎨 Apply colors globally for live theme preview
  useEffect(() => {
    if (!themeSettings) return;
    document.documentElement.style.setProperty(
      '--primary-color',
      themeSettings.primaryColor || DEFAULTS.primaryColor!
    );
    document.documentElement.style.setProperty(
      '--secondary-color',
      themeSettings.secondaryColor || DEFAULTS.secondaryColor!
    );
    document.documentElement.style.setProperty(
      '--font-family',
      themeSettings.fontFamily || DEFAULTS.fontFamily!
    );
  }, [themeSettings]);

  return (
    <motion.div
      className="max-w-3xl mx-auto p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div
        className="flex justify-between items-center cursor-pointer pb-3 border-b border-gray-100"
        onClick={() => setIsOpen((o) => !o)}
      >
        <h2 className="flex items-center text-2xl font-bold text-gray-800 hover:text-indigo-600 transition">
          <PaintBrushIcon className="h-6 w-6 mr-2 text-indigo-600" />
          Theme Settings
        </h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              resetDefaults();
            }}
            title="Reset to defaults"
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <ArrowPathIcon className="h-5 w-5 text-gray-500 hover:text-indigo-600" />
          </button>
          {isOpen ? (
            <ChevronUpIcon className="h-6 w-6 text-gray-500" />
          ) : (
            <ChevronDownIcon className="h-6 w-6 text-gray-500" />
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* ---------- Primary Color ---------- */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Primary Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={themeSettings?.primaryColor}
                    onChange={(e) => updateField('primaryColor', e.target.value)}
                    className="h-10 w-10 rounded cursor-pointer border border-gray-300"
                  />
                  <input
                    type="text"
                    value={themeSettings?.primaryColor}
                    onChange={(e) => updateField('primaryColor', e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              {/* ---------- Secondary Color ---------- */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Secondary Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={themeSettings?.secondaryColor}
                    onChange={(e) => updateField('secondaryColor', e.target.value)}
                    className="h-10 w-10 rounded cursor-pointer border border-gray-300"
                  />
                  <input
                    type="text"
                    value={themeSettings?.secondaryColor}
                    onChange={(e) => updateField('secondaryColor', e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>
            </div>

            {/* ---------- Theme Presets ---------- */}
            <div className="mt-6 flex flex-wrap gap-3">
              {themePresets.map((preset) => (
                <motion.button
                  key={preset.name}
                  whileHover={{ scale: 1.05 }}
                  onClick={() =>
                    onChange({
                      ...themeSettings,
                      primaryColor: preset.primary,
                      secondaryColor: preset.secondary,
                    })
                  }
                  className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-50 transition"
                >
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: preset.secondary }}
                  />
                  {preset.name}
                </motion.button>
              ))}
            </div>

            {/* ---------- Font Picker ---------- */}
            <div className="sm:col-span-2 mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Font Family
              </label>
              <button
                onClick={() => setIsFontModalOpen(true)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-left hover:bg-indigo-50 transition"
              >
                <span style={{ fontFamily: themeSettings?.fontFamily }}>
                  {themeSettings?.fontFamily?.replace(/, (sans-serif|serif)/, '') ||
                    'Select a font'}
                </span>
              </button>
            </div>

            {/* ---------- Live Preview ---------- */}
            <motion.div
              className="mt-10 p-6 rounded-xl border relative overflow-hidden transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${themeSettings?.secondaryColor}40, white)`,
                fontFamily: themeSettings?.fontFamily,
              }}
              whileHover={{ scale: lockPreview ? 1 : 1.02 }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3
                    className="text-xl font-bold mb-2 transition-colors"
                    style={{ color: themeSettings?.primaryColor }}
                  >
                    Live Theme Preview
                  </h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Adjust colors and fonts above to see your brand come alive ✨
                  </p>
                </div>
                <button
                  onClick={() => setLockPreview((l) => !l)}
                  title={lockPreview ? 'Unlock Preview' : 'Lock Preview'}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  {lockPreview ? (
                    <LockClosedIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <LockOpenIcon className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
              <motion.button
                className="px-6 py-2.5 rounded-full font-medium shadow hover:shadow-lg transition-transform"
                whileHover={{ scale: lockPreview ? 1 : 1.05 }}
                style={{
                  backgroundColor: themeSettings?.primaryColor,
                  color: '#fff',
                }}
              >
                Explore Now
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- Font Picker Modal ---------- */}
      <AnimatePresence>
        {isFontModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-6 relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button
                onClick={() => setIsFontModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded hover:bg-gray-100"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>

              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <MagnifyingGlassIcon className="h-5 w-5 mr-2 text-indigo-600" />
                Choose a Font
              </h3>

              <input
                type="text"
                placeholder="Search fonts…"
                value={fontFilter}
                onChange={(e) => setFontFilter(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-sm focus:ring-2 focus:ring-indigo-500"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
                {filteredFonts.map((font) => (
                  <motion.div
                    key={font}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      updateField('fontFamily', font);
                      setIsFontModalOpen(false);
                    }}
                    style={{ fontFamily: font }}
                    className="border rounded-lg p-4 cursor-pointer hover:border-indigo-500 transition"
                  >
                    <p className="text-lg font-semibold mb-1">
                      {font.replace(/, (sans-serif|serif)/, '')}
                    </p>
                    <p className="text-sm text-gray-600">
                      The quick brown fox jumps over the lazy dog.
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
