import React, { ChangeEvent } from 'react';

/**
 * Interface for Shipping settings, directly mapping to the Prisma schema model.
 */
export interface ShippingSettings {
  id?: string;
  companyId?: string;
  carrierName?: string | null;
  trackingUrl?: string | null;
  regions?: string[] | null;
  enablePickup?: boolean | null;
  pickupInstructions?: string | null;
}

/**
 * Props for the ShippingAccordion component.
 */
export interface ShippingAccordionProps {
  shippingSettings: ShippingSettings | null;
  onChange: (updated: ShippingSettings) => void;
}

/**
 * A component for editing shipping-related settings.
 * It handles input fields for carrier info, regions, and local pickup options.
 */
export default function ShippingAccordion({
  shippingSettings,
  onChange,
}: ShippingAccordionProps) {

  /**
   * A generic handler to update a specific field in the shipping settings object.
   * It creates a new object with the updated field and calls the parent onChange handler.
   * @param key The key of the field to update.
   * @param value The new value for the field.
   */
  const updateField = <K extends keyof ShippingSettings>(
    key: K,
    value: ShippingSettings[K]
  ) => {
    onChange({ ...shippingSettings, [key]: value });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-xl rounded-2xl">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Shipping Settings</h2>
        <span className="text-2xl" role="img" aria-label="settings">🚚</span>
      </div>

      {/* Shipping Configuration Section */}
      <section className="p-6 border border-gray-200 rounded-xl bg-gray-50">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Shipping Configuration
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Define your shipping carriers and rules.
        </p>
        <div className="space-y-6">
          <div>
            <label htmlFor="carrierName" className="block text-sm font-semibold text-gray-700">
              Carrier Name
            </label>
            <input
              id="carrierName"
              type="text"
              // Correctly binding the value to the prop
              value={shippingSettings?.carrierName || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateField('carrierName', e.target.value)
              }
              placeholder="e.g., FedEx"
              className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
            />
          </div>
          <div>
            <label htmlFor="trackingUrl" className="block text-sm font-semibold text-gray-700">
              Tracking URL
            </label>
            <input
              id="trackingUrl"
              type="text"
              // Correctly binding the value to the prop
              value={shippingSettings?.trackingUrl || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateField('trackingUrl', e.target.value)
              }
              placeholder="e.g., https://www.fedex.com/track?tracknum="
              className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
            />
          </div>
          <div>
            <label htmlFor="regions" className="block text-sm font-semibold text-gray-700">
              Regions (comma-separated)
            </label>
            <input
              id="regions"
              type="text"
              // Correctly binding the value to the prop
              value={shippingSettings?.regions?.join(', ') || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateField(
                  'regions',
                  e.target.value
                    .split(',')
                    .map(k => k.trim())
                    .filter(k => k.length > 0)
                )
              }
              placeholder="e.g., North America, Europe"
              className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
            />
          </div>
          <div className="flex items-center">
            <input
              id="enablePickup"
              type="checkbox"
              // Correctly binding the checked state to the prop
              checked={shippingSettings?.enablePickup || false}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateField('enablePickup', e.target.checked)
              }
              className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
            />
            <label htmlFor="enablePickup" className="ml-2 block text-sm font-semibold text-gray-700">
              Enable local pickup
            </label>
          </div>
          {/* Conditionally render the pickup instructions field */}
          {(shippingSettings?.enablePickup || false) && (
            <div>
              <label htmlFor="pickupInstructions" className="block text-sm font-semibold text-gray-700">
                Pickup Instructions
              </label>
              <textarea
                id="pickupInstructions"
                rows={3}
                // Correctly binding the value to the prop
                value={shippingSettings?.pickupInstructions || ''}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  updateField('pickupInstructions', e.target.value)
                }
                placeholder="e.g., Pick up at our main office between 9am-5pm."
                className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none transition duration-150 ease-in-out"
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
