"use client";

import React, { ChangeEvent, KeyboardEvent, useState, useCallback } from "react";
import { 
  TruckIcon, 
  ChevronUpIcon, 
  ChevronDownIcon, 
  GlobeAmericasIcon, 
  CurrencyDollarIcon, 
  BuildingStorefrontIcon,
  XMarkIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isOpen, setIsOpen] = useState(true);
  const [regionInput, setRegionInput] = useState("");
  
  const settings = shippingSettings ?? {};
  const regionsArray = settings.regions ?? [];

  const updateField = useCallback(
    <K extends keyof ShippingSettings>(key: K, value: ShippingSettings[K]) => {
      onChange({ ...settings, [key]: value });
    },
    [settings, onChange]
  );

  const handlePriceChange = useCallback(
    (field: keyof ShippingSettings, value: string) => {
      if (value === "") {
        updateField(field, null);
        return;
      }
      const floatValue = parseFloat(value);
      updateField(field, isNaN(floatValue) ? null : floatValue);
    },
    [updateField]
  );

  const handleAddRegion = () => {
    const trimmed = regionInput.trim().replace(/,$/, "");
    if (trimmed && !regionsArray.includes(trimmed)) {
      const updatedRegions = [...regionsArray, trimmed];
      updateField("regions", updatedRegions);
    }
    setRegionInput("");
  };

  const handleRegionKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddRegion();
    }
  };

  const handleRemoveRegion = (indexToRemove: number) => {
    const updatedRegions = regionsArray.filter((_, idx) => idx !== indexToRemove);
    updateField("regions", updatedRegions.length ? updatedRegions : null);
  };

  return (
    <div className="max-w-4xl mx-auto rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xl backdrop-blur-md overflow-hidden text-zinc-900 dark:text-zinc-100">
      
      {/* Accordion Toggle Ribbon */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-5 cursor-pointer bg-linear-to-r from-gray-50/50 via-transparent to-transparent dark:from-zinc-800/20 select-none"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <TruckIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white">Fulfillment & Shipping Logistics</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Manage distribution carrier details, regional bounds, and rate tiers.</p>
          </div>
        </div>

        <button className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-500">
          {isOpen ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="p-6 pt-0 border-t border-zinc-100 dark:border-zinc-800/60 space-y-6">
              
              {/* Core Layout Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
                
                {/* General Configuration Section */}
                <div className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950/40 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/60">
                    <GlobeAmericasIcon className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">General Rules</h3>
                  </div>

                  <div className="space-y-4">
                    {/* Carrier Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Preferred Carrier</label>
                      <input
                        type="text"
                        value={settings.carrierName ?? ""}
                        onChange={(e) => updateField("carrierName", e.target.value)}
                        placeholder="e.g., DHL Express, FedEx"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-hidden transition shadow-2xs"
                      />
                    </div>

                    {/* Tracking Route Link */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Tracking Base Endpoint URL</label>
                      <input
                        type="url"
                        value={settings.trackingUrl ?? ""}
                        onChange={(e) => updateField("trackingUrl", e.target.value)}
                        placeholder="https://www.fedex.com/track?tracknum="
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-hidden transition shadow-2xs"
                      />
                    </div>

                    {/* Interactive Region Tagging Matrix */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Permitted Delivery Jurisdictions</label>
                      <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 bg-white dark:bg-zinc-950 focus-within:ring-2 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all">
                        <div className="flex flex-wrap gap-1.5 mb-1">
                          {regionsArray.map((region, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                            >
                              {region}
                              <button
                                type="button"
                                onClick={() => handleRemoveRegion(index)}
                                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
                              >
                                <XMarkIcon className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <input
                          type="text"
                          value={regionInput}
                          onChange={(e) => setRegionInput(e.target.value)}
                          onKeyDown={handleRegionKeyDown}
                          onBlur={handleAddRegion}
                          placeholder="Type target region and press Enter..."
                          className="w-full bg-transparent border-none outline-hidden p-1 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rate Management Section */}
                <div className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950/40 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/60 mb-4">
                      <CurrencyDollarIcon className="w-4 h-4 text-indigo-500" />
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Pricing Controls</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Standard Rate Input */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Standard Tier Rate</label>
                        <div className="relative rounded-lg shadow-2xs">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-zinc-400 text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={settings.standardRate ?? ""}
                            onChange={(e) => handlePriceChange("standardRate", e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-7 pr-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-hidden transition"
                          />
                        </div>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">Baseline Transit (3&ndash;5 Open Days)</span>
                      </div>

                      {/* Express Rate Input */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Express Tier Rate</label>
                        <div className="relative rounded-lg shadow-2xs">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-zinc-400 text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={settings.expressRate ?? ""}
                            onChange={(e) => handlePriceChange("expressRate", e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-7 pr-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-hidden transition"
                          />
                        </div>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">Prioritized Air (1&ndash;2 Open Days)</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded-lg p-3 border border-zinc-200/60 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 mt-4">
                    Flat rate indices calculate aggregate order totals natively across mapped regional bounds during active checkout.
                  </div>
                </div>

              </div>

              {/* Local Warehouse Pickup Toggles Section */}
              <div className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950/40 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/60">
                  <div className="flex items-center gap-2">
                    <BuildingStorefrontIcon className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">On-Premises Local Pickup</h3>
                  </div>
                  
                  {/* Custom Toggle switch */}
                  <button
                    type="button"
                    onClick={() => updateField("enablePickup", !settings.enablePickup)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      settings.enablePickup ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-800'
                    }`}
                    role="switch"
                    aria-checked={settings.enablePickup ?? false}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        settings.enablePickup ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <AnimatePresence>
                  {settings.enablePickup && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-1.5 overflow-hidden"
                    >
                      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                        <MapPinIcon className="w-3.5 h-3.5 text-zinc-400" />
                        Customer Hand-off & Pickup Directions
                      </label>
                      <textarea
                        rows={3}
                        value={settings.pickupInstructions ?? ""}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateField("pickupInstructions", e.target.value)}
                        placeholder="Provide details regarding distribution points, warehouse doors, or storefront operating hours..."
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-hidden transition resize-none"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}