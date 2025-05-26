import React, { ChangeEvent } from 'react';

export interface ShippingSettings {
  carrierName?: string;
  trackingUrl?: string;
  regions?: string[];
  enablePickup?: boolean;
  pickupInstructions?: string;
}

export interface ShippingAccordionProps {
  shippingSettings: ShippingSettings;
  onChange: (updated: ShippingSettings) => void;
}

export default function ShippingAccordion({
  shippingSettings,
  onChange,
}: ShippingAccordionProps) {
  const {
    carrierName = '',
    trackingUrl = '',
    regions = [],
    enablePickup = false,
    pickupInstructions = '',
  } = shippingSettings;

  const updateField = <K extends keyof ShippingSettings>(
    key: K,
    value: ShippingSettings[K]
  ) => {
    onChange({ ...shippingSettings, [key]: value });
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="flex justify-between items-center text-2xl font-bold text-gray-800 mb-4">
        <span>Shipping Settings</span>
        <span className="text-xl">🚚</span>
      </h2>

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="carrierName" className="block text-xs font-medium text-gray-600">
              Carrier Name
            </label>
            <input
              id="carrierName"
              type="text"
              value={carrierName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('carrierName', e.target.value)}
              placeholder="DHL, FedEx, etc."
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="trackingUrl" className="block text-xs font-medium text-gray-600">
              Tracking URL Template
            </label>
            <input
              id="trackingUrl"
              type="text"
              value={trackingUrl}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('trackingUrl', e.target.value)}
              placeholder="https://tracking.example.com/track?code={tracking_number}"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Shipping Regions */}
        <div>
          <label htmlFor="regions" className="block text-xs font-medium text-gray-600">
            Shipping Regions
          </label>
          <input
            id="regions"
            type="text"
            value={regions.join(', ')}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updateField('regions', e.target.value.split(',').map(r => r.trim()))
            }
            placeholder="e.g. US, EU, Asia"
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-500">Comma-separated list of regions you ship to.</p>
        </div>

        {/* Pickup Options */}
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              id="enablePickup"
              type="checkbox"
              checked={enablePickup}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('enablePickup', e.target.checked)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="enablePickup" className="ml-2 block text-sm font-medium text-gray-700">
              Enable Local Pickup
            </label>
          </div>
          {enablePickup && (
            <div>
              <label htmlFor="pickupInstructions" className="block text-xs font-medium text-gray-600">
                Pickup Instructions
              </label>
              <textarea
                id="pickupInstructions"
                rows={3}
                value={pickupInstructions}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateField('pickupInstructions', e.target.value)}
                placeholder="Provide details for customers picking up orders locally..."
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}