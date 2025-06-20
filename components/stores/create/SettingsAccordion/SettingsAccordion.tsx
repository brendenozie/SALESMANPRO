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
    <div className="max-w-3xl mx-auto p-2">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>
        <span className="text-2xl" role="img" aria-label="settings">⚙️</span>
      </div>

      {/* Analytics Config Section */}
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Analytics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Google Tag ID */}
          <div>
            <label htmlFor="googleTag" className="block text-sm font-medium text-gray-700">
              Google Tag ID
            </label>
            <input
              id="googleTag"
              type="text"
              value={analyticsConfig.googleTag || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateField('googleTag', e.target.value)
              }
              placeholder="G-XXXXXXXXXX"
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              Format usually starts with <code>G-</code> followed by numbers and letters.
            </p>
          </div>

          {/* Facebook Pixel ID */}
          <div>
            <label htmlFor="facebookTag" className="block text-sm font-medium text-gray-700">
              Facebook Pixel ID
            </label>
            <input
              id="facebookTag"
              type="text"
              value={analyticsConfig.facebookTag || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateField('facebookTag', e.target.value)
              }
              placeholder="1234567890"
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter your Facebook Pixel numeric ID (usually 10+ digits).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
