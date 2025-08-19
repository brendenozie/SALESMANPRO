import React, { ChangeEvent } from 'react';

/**
 * Interface for Analytics configuration, matching the data structure.
 */
export interface AnalyticsConfig {
  id?: string;
  companyId?: string;
  googleTag?: string | null;
  facebookTag?: string | null;
  hotjarSiteId?: string | null;
  isActive: boolean;
}

/**
 * Props for the SettingsAccordion component.
 */
export interface SettingsAccordionProps {
  analyticsConfig: AnalyticsConfig | null;
  onChange: (updated: AnalyticsConfig) => void;
}

/**
 * A component for editing analytics and tracking settings.
 * It handles the input fields for Google, Facebook, and Hotjar IDs,
 * as well as a toggle to enable/disable analytics.
 */
export default function SettingsAccordion({
  analyticsConfig,
  onChange,
}: SettingsAccordionProps) {

  /**
   * A generic handler to update a specific field in the analytics config object.
   * It creates a new object with the updated field and calls the parent onChange handler.
   * @param key The key of the field to update.
   * @param value The new value for the field.
   */
  const updateField = (key: keyof AnalyticsConfig, value: any) => {
    onChange({ ...analyticsConfig, [key]: value });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-xl rounded-2xl">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>
        <span className="text-2xl" role="img" aria-label="settings">⚙️</span>
      </div>

      {/* Analytics & Tracking Section */}
      <section className="p-6 border border-gray-200 rounded-xl bg-gray-50">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Analytics & Tracking
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Connect your analytics services to track user behavior.
        </p>
        <div className="space-y-6">
          <div>
            <label htmlFor="googleTag" className="block text-sm font-semibold text-gray-700">
              Google Tag ID
            </label>
            <input
              id="googleTag"
              type="text"
              // Correctly bind the input value to the 'googleTag' property from the props.
              value={analyticsConfig?.googleTag || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateField('googleTag', e.target.value)
              }
              placeholder="e.g., G-XXXXXXXXXX"
              className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
            />
          </div>
          <div>
            <label htmlFor="facebookTag" className="block text-sm font-semibold text-gray-700">
              Facebook Pixel ID
            </label>
            <input
              id="facebookTag"
              type="text"
              // Correctly bind the input value to the 'facebookTag' property.
              value={analyticsConfig?.facebookTag || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateField('facebookTag', e.target.value)
              }
              placeholder="e.g., 1234567890"
              className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
            />
          </div>
          <div>
            <label htmlFor="hotjarSiteId" className="block text-sm font-semibold text-gray-700">
              Hotjar Site ID
            </label>
            <input
              id="hotjarSiteId"
              type="text"
              // Correctly bind the input value to the 'hotjarSiteId' property.
              value={analyticsConfig?.hotjarSiteId || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateField('hotjarSiteId', e.target.value)
              }
              placeholder="e.g., 1234567"
              className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
            />
          </div>
          <div className="flex items-center">
            <input
              id="isActive"
              type="checkbox"
              // Correctly bind the checkbox checked state to the 'isActive' property.
              checked={analyticsConfig?.isActive}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateField('isActive', e.target.checked)
              }
              className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm font-semibold text-gray-700">
              Enable Analytics
            </label>
          </div>
        </div>
      </section>
    </div>
  );
}
