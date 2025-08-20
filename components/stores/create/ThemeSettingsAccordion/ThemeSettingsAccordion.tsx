import React, { useState, useMemo } from 'react';
import {
  PaintBrushIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/solid';

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
  primaryColor: '#4f46e5',
  secondaryColor: '#facc15',
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

export default function ThemeSettingsAccordion({
  themeSettings,
  onChange,
}: ThemeSettingsAccordionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [lockPreview, setLockPreview] = useState(false);
  const [fontFilter, setFontFilter] = useState('');

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

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div
        className="flex justify-between items-center cursor-pointer"
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
            className="p-1 rounded hover:bg-gray-100 transition"
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

      {/* Content */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[800px] mt-6' : 'max-h-0'
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Primary Color */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Primary Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={themeSettings?.primaryColor}
                onChange={(e) =>
                  updateField('primaryColor', e.target.value)
                }
                className="h-10 w-10 p-0 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={themeSettings?.primaryColor}
                onChange={(e) =>
                  updateField('primaryColor', e.target.value)
                }
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              />
            </div>
          </div>

          {/* Secondary Color */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Secondary Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={themeSettings?.secondaryColor}
                onChange={(e) =>
                  updateField('secondaryColor', e.target.value)
                }
                className="h-10 w-10 p-0 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={themeSettings?.secondaryColor}
                onChange={(e) =>
                  updateField('secondaryColor', e.target.value)
                }
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              />
            </div>
          </div>

          {/* Font Picker */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Font Family
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search fonts…"
                value={fontFilter}
                onChange={(e) => setFontFilter(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              />
              <MagnifyingGlassIcon className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded mt-1 max-h-40 overflow-auto">
                {filteredFonts.map((font) => (
                  <li
                    key={font}
                    onClick={() => {
                      updateField('fontFamily', font);
                      setFontFilter('');
                    }}
                    style={{ fontFamily: font }}
                    className="px-3 py-2 hover:bg-indigo-50 cursor-pointer"
                  >
                    {font.replace(/, sans-serif|, serif/, '')}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div
        className={`mt-8 p-6 rounded-xl border transition-shadow ${
          lockPreview ? '' : 'hover:shadow-lg'
        }`}
        style={{
          backgroundColor: themeSettings?.secondaryColor,
          fontFamily: themeSettings?.fontFamily,
        }}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3
              className="text-xl font-bold mb-2"
              style={{ color: themeSettings?.primaryColor }}
            >
              Sample Heading
            </h3>
            <p className="text-sm text-gray-800 mb-4">
              Live preview of your theme. Adjust above to see changes.
            </p>
          </div>
          <button
            onClick={() => setLockPreview((l) => !l)}
            title="Lock/unlock preview shadow"
            className="p-1 rounded hover:bg-gray-100"
          >
            {lockPreview ? (
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronUpIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
        <button
          className="px-5 py-2.5 rounded-full font-medium shadow transition-transform transform hover:scale-105"
          style={{
            backgroundColor: themeSettings?.primaryColor,
            color: '#fff',
          }}
        >
          Preview Button
        </button>
      </div>
    </div>
  );
}
