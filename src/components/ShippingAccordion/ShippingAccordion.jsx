import React, { useState, ChangeEvent, FormEvent, useEffect, useMemo, useRef } from 'react';
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import dynamic from "next/dynamic";
import { useRouter } from 'next/router';
import debounce from "lodash.debounce";
import {
  MapPinIcon,
  ChevronDownIcon,
  InboxIcon,
  PlusIcon,
  CheckIcon,
  TrashIcon,
  ChevronUpIcon, 
  PaintBrushIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { PhoneIcon } from '@heroicons/react/24/solid';

const loaderProp = ({ src, width, quality }) => {
  const params = [`w=${width || 800}`]; // Default width to 800 if not provided
  if (quality) {
    params.push(`q=${quality}`);
  }
  return `${src}?${params.join("&")}`;
};

interface ShippingSettings {
  carrierName?: string;
  trackingUrl?: string;
  regions?: string[];
  enablePickup?: boolean;
  pickupInstructions?: string;
}

interface ShippingAccordionProps {
  form: {
    shippingSettings?: ShippingSettings;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
}

export const ShippingAccordion: React.FC<ShippingAccordionProps> = ({ form, setForm }) => {
  const updateField = <K extends keyof ShippingSettings>(key: K, value: ShippingSettings[K]) => {
    setForm((f: any) => ({
      ...f,
      shippingSettings: { ...f.shippingSettings, [key]: value }
    }));
  };

  const regionsValue = form.shippingSettings?.regions?.join(', ') || '';

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="flex justify-between items-center text-2xl font-bold text-gray-800 mb-4">
        <span>Shipping Settings</span>
        <span className="text-xl">🚚</span>
      </h2>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="carrierName" className="block text-xs font-medium text-gray-600">Carrier Name</label>
            <input
              id="carrierName"
              type="text"
              value={form.shippingSettings?.carrierName || ''}
              onChange={e => updateField('carrierName', e.target.value)}
              placeholder="DHL, FedEx, etc."
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="trackingUrl" className="block text-xs font-medium text-gray-600">Tracking URL Template</label>
            <input
              id="trackingUrl"
              type="text"
              value={form.shippingSettings?.trackingUrl || ''}
              onChange={e => updateField('trackingUrl', e.target.value)}
              placeholder="https://tracking.example.com/track?code={tracking_number}"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Shipping Regions */}
        <div>
          <label htmlFor="regions" className="block text-xs font-medium text-gray-600">Shipping Regions</label>
          <input
            id="regions"
            type="text"
            value={regionsValue}
            onChange={e => updateField('regions', e.target.value.split(',').map(r => r.trim()))}
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
              checked={form.shippingSettings?.enablePickup || false}
              onChange={e => updateField('enablePickup', e.target.checked)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="enablePickup" className="ml-2 block text-sm font-medium text-gray-700">Enable Local Pickup</label>
          </div>
          {form.shippingSettings?.enablePickup && (
            <div>
              <label htmlFor="pickupInstructions" className="block text-xs font-medium text-gray-600">Pickup Instructions</label>
              <textarea
                id="pickupInstructions"
                rows={3}
                value={form.shippingSettings?.pickupInstructions || ''}
                onChange={e => updateField('pickupInstructions', e.target.value)}
                placeholder="Provide details for customers picking up orders locally..."
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShippingAccordion;
