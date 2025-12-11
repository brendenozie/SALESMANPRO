"use client";

import React, { ChangeEvent, useCallback } from "react";

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
  const settings = shippingSettings ?? {};

  // Memoized updater: avoids re-renders and ensures consistency
  const updateField = useCallback(
    <K extends keyof ShippingSettings>(key: K, value: ShippingSettings[K]) => {
      onChange({ ...settings, [key]: value });
    },
    [settings, onChange]
  );

  // Converts numeric fields safely
  const handlePriceChange = useCallback(
    (field: keyof ShippingSettings, value: string) => {
      if (value === "") {
        updateField(field, null); // allow empty
        return;
      }
      const floatValue = parseFloat(value);
      updateField(field, isNaN(floatValue) ? null : floatValue);
    },
    [updateField]
  );

  // Regions parser
  const handleRegionChange = useCallback(
    (value: string) => {
      const list = value
        .split(",")
        .map((item) => item.trim())
        .filter((v) => v.length > 0);

      updateField("regions", list.length ? list : null);
    },
    [updateField]
  );

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-xl rounded-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Shipping Settings</h2>
        <span className="text-2xl" role="img" aria-label="settings">
          🚚
        </span>
      </div>

      <div className="space-y-6">
        {/* Section 1: General */}
        <section className="p-6 border border-gray-200 rounded-xl bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            General Configuration
          </h3>

          <div className="space-y-6">
            {/* Carrier Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Carrier Name
              </label>
              <input
                value={settings.carrierName ?? ""}
                onChange={(e) => updateField("carrierName", e.target.value)}
                className="mt-2 w-full border rounded-lg px-4 py-2"
                placeholder="e.g., FedEx"
              />
            </div>

            {/* Tracking URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Tracking URL
              </label>
              <input
                value={settings.trackingUrl ?? ""}
                onChange={(e) => updateField("trackingUrl", e.target.value)}
                className="mt-2 w-full border rounded-lg px-4 py-2"
                placeholder="https://www.fedex.com/track?tracknum="
              />
            </div>

            {/* Regions */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Regions (comma-separated)
              </label>
              <input
                value={(settings.regions ?? []).join(", ")}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="mt-2 w-full border rounded-lg px-4 py-2"
                placeholder="North America, Europe"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Rates */}
        <section className="p-6 border border-gray-200 rounded-xl bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Shipping Rates
          </h3>

          <p className="text-sm text-gray-600 mb-6">
            Set your flat rates for standard and express delivery.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Standard Shipping */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Standard Shipping
              </label>

              <div className="relative mt-2">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={settings.standardRate ?? ""}
                  onChange={(e) =>
                    handlePriceChange("standardRate", e.target.value)
                  }
                  className="pl-7 w-full border rounded-md py-2"
                  placeholder="0.00"
                />
              </div>

              <p className="text-xs text-gray-500 mt-1">
                Usually 5–7 business days
              </p>
            </div>

            {/* Express Shipping */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Express Shipping
              </label>

              <div className="relative mt-2">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={settings.expressRate ?? ""}
                  onChange={(e) =>
                    handlePriceChange("expressRate", e.target.value)
                  }
                  className="pl-7 w-full border rounded-md py-2"
                  placeholder="0.00"
                />
              </div>

              <p className="text-xs text-gray-500 mt-1">
                Usually 1–2 business days
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Pickup */}
        <section className="p-6 border border-gray-200 rounded-xl bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Pickup Settings
          </h3>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={settings.enablePickup ?? false}
              onChange={(e) => updateField("enablePickup", e.target.checked)}
              className="h-4 w-4"
            />
            <label className="ml-2 text-sm font-semibold text-gray-700">
              Enable local pickup
            </label>
          </div>

          {settings.enablePickup && (
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Pickup Instructions
              </label>
              <textarea
                rows={3}
                value={settings.pickupInstructions ?? ""}
                onChange={(e) =>
                  updateField("pickupInstructions", e.target.value)
                }
                className="mt-2 w-full border rounded-lg px-4 py-2 resize-none"
                placeholder="Pick up at our office 9am–5pm."
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
