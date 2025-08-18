import React, { ChangeEvent } from 'react';


export interface AnalyticsConfig {
  id?: string;
  companyId?: string;
  googleTag?: string | null;
  facebookTag?: string | null;
  hotjarSiteId?: string | null;
  isActive: boolean;
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

  const handleAnalyticsChange = (key: keyof AnalyticsConfig, value: any) => {
      // onChange({
      //   analyticsConfig: {
      //     ...settings.analyticsConfig,
      //     [key]: value,
      //   },
      // });
    };

  return (
    <div className="max-w-3xl mx-auto p-2">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>
        <span className="text-2xl" role="img" aria-label="settings">⚙️</span>
      </div>

      {/* Analytics Config Section */}

      
      {/* Analytics Settings Section */}
      <section className="mb-8 p-6 border border-gray-200 rounded-xl bg-gray-50">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Analytics & Tracking
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Connect your analytics services to track user behavior.
        </p>
        <div className="space-y-6">
          <div>
            <label htmlFor="googleTag" className="block text-sm font-semibold text-gray-700">
              Google Tag
            </label>
            <input
              id="googleTag"
              type="text"
              // value={settings.analyticsConfig.googleTag || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleAnalyticsChange('googleTag', e.target.value)
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
              // value={settings.analyticsConfig.facebookTag || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleAnalyticsChange('facebookTag', e.target.value)
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
              // value={settings.analyticsConfig.hotjarSiteId || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>{}
                // handleAnalyticsChange('hotjarSiteId', e.target.value)
              }
              placeholder="e.g., 1234567"
              className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
            />
          </div>
          <div className="flex items-center">
            <input
              id="isActive"
              type="checkbox"
              // checked={settings.analyticsConfig.isActive}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>{}
                // handleAnalyticsChange('isActive', e.target.checked)
              }
              className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm font-semibold text-gray-700">
              Enable Analytics
            </label>
          </div>
        </div>
      </section>



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
              // value={analyticsConfig.googleTag || ''}
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
              // value={analyticsConfig.facebookTag || ''}
              // onChange={(e: ChangeEvent<HTMLInputElement>) =>
              //   updateField('facebookTag', e.target.value)
              // }
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
