import React, { ChangeEvent } from 'react';

export interface AnalyticsConfig {
  googleTag?: string;
  facebookTag?: string;
}

export interface SettingsAccordionProps {
  analyticsConfig: AnalyticsConfig;
  onChange: (updated: AnalyticsConfig) => void;
}

export default function SettingsAccordion({
  analyticsConfig,
  onChange,
}: SettingsAccordionProps) {
  const updateField = (key: keyof AnalyticsConfig, value: string) => {
    onChange({ ...analyticsConfig, [key]: value });
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="flex justify-between items-center text-2xl font-bold text-gray-800 mb-4">
        <span>System Settings</span>
        <span className="text-xl">⚙️</span>
      </h2>

      {/* Analytics Config */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Analytics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="googleTag" className="block text-xs font-medium text-gray-600">
              Google Tag ID
            </label>
            <input
              id="googleTag"
              type="text"
              value={analyticsConfig.googleTag || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('googleTag', e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="facebookTag" className="block text-xs font-medium text-gray-600">
              Facebook Pixel ID
            </label>
            <input
              id="facebookTag"
              type="text"
              value={analyticsConfig.facebookTag || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('facebookTag', e.target.value)}
              placeholder="1234567890"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </section>
    </div>
  );
}