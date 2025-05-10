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

interface AnalyticsConfig {
  googleTag?: string;
  facebookTag?: string;
}

interface SettingsAccordionProps {
  form: {
    analyticsConfig?: AnalyticsConfig;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
}

const SettingsAccordion: React.FC<SettingsAccordionProps> = ({ form, setForm }) => {
  const updateSection = <K extends string>(section: string, key: K, value: any) => {
    setForm((f: any) => ({
      ...f,
      [section]: { ...f[section], [key]: value }
    }));
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
            <label htmlFor="googleTag" className="block text-xs font-medium text-gray-600">Google Tag ID</label>
            <input
              id="googleTag"
              type="text"
              value={form.analyticsConfig?.googleTag || ''}
              onChange={e => updateSection('analyticsConfig', 'googleTag', e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="facebookTag" className="block text-xs font-medium text-gray-600">Facebook Pixel ID</label>
            <input
              id="facebookTag"
              type="text"
              value={form.analyticsConfig?.facebookTag || ''}
              onChange={e => updateSection('analyticsConfig', 'facebookTag', e.target.value)}
              placeholder="1234567890"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </section>
      
    </div>
  );
};


export default SettingsAccordion;
