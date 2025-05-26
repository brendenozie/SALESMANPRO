import React, { useState } from 'react';
import {
  PaintBrushIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/solid';

export interface ThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
}

export interface ThemeSettingsAccordionProps {
  themeSettings: ThemeSettings;
  onChange: (updated: ThemeSettings) => void;
}

const popularFonts = [
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Open Sans', value: '"Open Sans", sans-serif' },
  { label: 'Lato', value: 'Lato, sans-serif' },
  { label: 'Montserrat', value: 'Montserrat, sans-serif' },
  { label: 'Poppins', value: 'Poppins, sans-serif' },
  { label: 'Merriweather', value: 'Merriweather, serif' },
  { label: 'Playfair Display', value: '"Playfair Display", serif' },
];

export default function ThemeSettingsAccordion({
  themeSettings,
  onChange,
}: ThemeSettingsAccordionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const {
    primaryColor = '#4f46e5',
    secondaryColor = '#facc15',
    fontFamily = 'Inter, sans-serif',
  } = themeSettings;

  const updateField = (key: keyof ThemeSettings, value: string) => {
    onChange({ ...themeSettings, [key]: value });
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Accordion Header */}
      <div
        className="flex justify-between items-center cursor-pointer group"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <h2 className="flex items-center text-2xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
          <PaintBrushIcon className="h-6 w-6 mr-2 text-indigo-600 group-hover:scale-110 transform transition-transform" />
          Theme Settings
        </h2>
        {isOpen ? (
          <ChevronUpIcon className="h-6 w-6 text-gray-500 group-hover:text-indigo-600 transition-colors" />
        ) : (
          <ChevronDownIcon className="h-6 w-6 text-gray-500 group-hover:text-indigo-600 transition-colors" />
        )}
      </div>

      {/* Accordion Content */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[1000px] mt-6' : 'max-h-0'
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Primary Color */}
          <div>
            <label
              htmlFor="primaryColor"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Primary Color
            </label>
            <input
              id="primaryColor"
              type="color"
              value={primaryColor}
              onChange={(e) => updateField('primaryColor', e.target.value)}
              className="w-full h-12 rounded-lg cursor-pointer border border-gray-300"
              style={{ backgroundColor: primaryColor }}
            />
          </div>

          {/* Secondary Color */}
          <div>
            <label
              htmlFor="secondaryColor"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Secondary Color
            </label>
            <input
              id="secondaryColor"
              type="color"
              value={secondaryColor}
              onChange={(e) => updateField('secondaryColor', e.target.value)}
              className="w-full h-12 rounded-lg cursor-pointer border border-gray-300"
              style={{ backgroundColor: secondaryColor }}
            />
          </div>

          {/* Font Family Dropdown */}
          <div className="sm:col-span-2">
            <label
              htmlFor="fontFamily"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Font Family
            </label>
            <select
              id="fontFamily"
              value={fontFamily}
              onChange={(e) => updateField('fontFamily', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {popularFonts.map((font) => (
                <option
                  key={font.value}
                  value={font.value}
                  style={{ fontFamily: font.value }}
                >
                  {font.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div
        className="mt-8 p-6 rounded-xl border border-gray-200 transition-shadow hover:shadow-lg"
        style={{ backgroundColor: secondaryColor, fontFamily }}
      >
        <h3 className="text-xl font-bold mb-2" style={{ color: primaryColor }}>
          Sample Heading
        </h3>
        <p className="text-sm text-gray-800 mb-4">
          This is a live preview of your current theme selection. Adjust the
          colors and fonts above to see changes in real time.
        </p>
        <button
          className="px-5 py-2.5 rounded-full font-medium shadow transition-transform transform hover:scale-105"
          style={{ backgroundColor: primaryColor, color: '#fff' }}
        >
          Preview Button
        </button>
      </div>
    </div>
  );
}
