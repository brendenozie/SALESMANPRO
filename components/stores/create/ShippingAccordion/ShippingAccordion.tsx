import React, { ChangeEvent } from 'react';

export interface ShippingSettings {
  id?: string;
  companyId?: string;
  carrierName?: string | null;
  trackingUrl?: string | null;
  regions?: string[] | null;
  enablePickup?: boolean | null;
  pickupInstructions?: string | null;
  standardRate?: number | null;
  expressRate?: number | null;
}

export interface ShippingAccordionProps {
  shippingSettings: ShippingSettings | null;
  onChange: (updated: ShippingSettings) => void;
}

export default function ShippingAccordion({
  shippingSettings,
  onChange,
}: ShippingAccordionProps) {

  const updateField = <K extends keyof ShippingSettings>(
    key: K,
    value: ShippingSettings[K]
  ) => {
    onChange({ ...shippingSettings, [key]: value });
  };

  /**
   * Helper to parse string input to number for rates
   */
  const handlePriceChange = (field: keyof ShippingSettings, value: string) => {
    const floatValue = parseFloat(value);
    // If the input is empty or invalid, you might want to set it to 0 or null
    updateField(field, isNaN(floatValue) ? 0 : floatValue);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-xl rounded-2xl">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Shipping Settings</h2>
        <span className="text-2xl" role="img" aria-label="settings">🚚</span>
      </div>

      <div className="space-y-6">
        {/* Section 1: Configuration */}
        <section className="p-6 border border-gray-200 rounded-xl bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            General Configuration
          </h3>
          <div className="space-y-6">
            <div>
              <label htmlFor="carrierName" className="block text-sm font-semibold text-gray-700">
                Carrier Name
              </label>
              <input
                id="carrierName"
                type="text"
                value={shippingSettings?.carrierName || ''}
                onChange={(e) => updateField('carrierName', e.target.value)}
                placeholder="e.g., FedEx"
                className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="trackingUrl" className="block text-sm font-semibold text-gray-700">
                Tracking URL
              </label>
              <input
                id="trackingUrl"
                type="text"
                value={shippingSettings?.trackingUrl || ''}
                onChange={(e) => updateField('trackingUrl', e.target.value)}
                placeholder="e.g., https://www.fedex.com/track?tracknum="
                className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="regions" className="block text-sm font-semibold text-gray-700">
                Regions (comma-separated)
              </label>
              <input
                id="regions"
                type="text"
                value={shippingSettings?.regions?.join(', ') || ''}
                onChange={(e) =>
                  updateField('regions', e.target.value.split(',').map(k => k.trim()).filter(k => k.length > 0))
                }
                placeholder="e.g., North America, Europe"
                className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Shipping Rates (NEW) */}
        <section className="p-6 border border-gray-200 rounded-xl bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Shipping Rates
          </h3>
          <p className="text-sm text-gray-600 mb-6">
             Set your flat rates for standard and express delivery.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Standard Shipping Input */}
            <div className="relative">
              <label htmlFor="standardRate" className="block text-sm font-semibold text-gray-700 mb-1">
                Standard Shipping
              </label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="standardRate"
                  id="standardRate"
                  min="0"
                  step="0.01"
                  className="block w-full rounded-md border border-gray-300 pl-7 pr-4 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="0.00"
                  value={shippingSettings?.standardRate || ''}
                  onChange={(e) => handlePriceChange('standardRate', e.target.value)}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Usually 5-7 business days</p>
            </div>

            {/* Express Shipping Input */}
            <div className="relative">
              <label htmlFor="expressRate" className="block text-sm font-semibold text-gray-700 mb-1">
                Express Shipping
              </label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="expressRate"
                  id="expressRate"
                  min="0"
                  step="0.01"
                  className="block w-full rounded-md border border-gray-300 pl-7 pr-4 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="0.00"
                  value={shippingSettings?.expressRate || ''}
                  onChange={(e) => handlePriceChange('expressRate', e.target.value)}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Usually 1-2 business days</p>
            </div>
          </div>
        </section>

        {/* Section 3: Local Pickup */}
        <section className="p-6 border border-gray-200 rounded-xl bg-gray-50">
           <h3 className="text-xl font-bold text-gray-800 mb-4">
            Pickup Settings
          </h3>
          <div className="flex items-center mb-4">
            <input
              id="enablePickup"
              type="checkbox"
              checked={shippingSettings?.enablePickup || false}
              onChange={(e) => updateField('enablePickup', e.target.checked)}
              className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
            />
            <label htmlFor="enablePickup" className="ml-2 block text-sm font-semibold text-gray-700">
              Enable local pickup
            </label>
          </div>
          
          {(shippingSettings?.enablePickup || false) && (
            <div>
              <label htmlFor="pickupInstructions" className="block text-sm font-semibold text-gray-700">
                Pickup Instructions
              </label>
              <textarea
                id="pickupInstructions"
                rows={3}
                value={shippingSettings?.pickupInstructions || ''}
                onChange={(e) => updateField('pickupInstructions', e.target.value)}
                placeholder="e.g., Pick up at our main office between 9am-5pm."
                className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}