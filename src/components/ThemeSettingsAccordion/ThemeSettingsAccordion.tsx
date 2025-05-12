import React, { useState } from 'react';
import { PaintBrushIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

export interface ThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
}

export interface ThemeSettingsAccordionProps {
  themeSettings: ThemeSettings;
  onChange: (updated: ThemeSettings) => void;
}

export default function ThemeSettingsAccordion({
  themeSettings,
  onChange,
}: ThemeSettingsAccordionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { primaryColor = '#4f46e5', secondaryColor = '#facc15', fontFamily = 'Inter, sans-serif' } = themeSettings;

  const updateField = (key: keyof ThemeSettings, value: string) => {
    onChange({ ...themeSettings, [key]: value });
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(prev => !prev)}
      >
        <h2 className="flex items-center text-2xl font-bold text-gray-800">
          <PaintBrushIcon className="h-6 w-6 mr-2 text-indigo-600" />
          Theme Settings
        </h2>
        {isOpen ? (
          <ChevronUpIcon className="h-6 w-6 text-gray-500" />
        ) : (
          <ChevronDownIcon className="h-6 w-6 text-gray-500" />
        )}
      </div>

      {isOpen && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="primaryColor" className="block text-xs font-medium text-gray-600">
              Primary Color
            </label>
            <input
              id="primaryColor"
              type="color"
              value={primaryColor}
              onChange={e => updateField('primaryColor', e.target.value)}
              className="mt-1 w-full h-10 p-0 border-0 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="secondaryColor" className="block text-xs font-medium text-gray-600">
              Secondary Color
            </label>
            <input
              id="secondaryColor"
              type="color"
              value={secondaryColor}
              onChange={e => updateField('secondaryColor', e.target.value)}
              className="mt-1 w-full h-10 p-0 border-0 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="fontFamily" className="block text-xs font-medium text-gray-600">
              Font Family
            </label>
            <input
              id="fontFamily"
              type="text"
              value={fontFamily}
              onChange={e => updateField('fontFamily', e.target.value)}
              placeholder="Inter, sans-serif"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}

      <div
        className="mt-6 p-6 rounded-lg border border-gray-200 transition-shadow hover:shadow-md"
        style={{ backgroundColor: secondaryColor, fontFamily }}
      >
        <h3 className="text-xl font-bold" style={{ color: primaryColor }}>
          Sample Heading
        </h3>
        <p className="mt-2 text-sm text-gray-700">
          This is a live preview of your current theme selection.
        </p>
        <button
          className="mt-4 px-4 py-2 rounded-lg font-medium transition-transform transform hover:scale-105"
          style={{ backgroundColor: primaryColor, color: '#ffffff' }}
        >
          Preview Button
        </button>
      </div>
    </div>
  );
}