// app/[adminSlug]/settings/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BuildingLibraryIcon, CloudArrowUpIcon, Cog6ToothIcon, GlobeAltIcon, SpeakerWaveIcon, ExclamationCircleIcon, PhotoIcon
} from '@heroicons/react/24/outline'; // Changed CloudIcon to CloudArrowUpIcon, added ExclamationCircleIcon, PhotoIcon
import { useParams } from 'next/navigation';
import Image from 'next/image';


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";


// Define the SettingsData interface to match the API response
interface SettingsData {
  id: string;
  companyId: string;
  companyName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  logoUrl: string | null;
  currency: string | null;
  timezone: string | null;
  emailNotifications: boolean;
  smsNotifications: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SettingsPageProps {
  params:Promise<{ slug: string }>
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const formFieldVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function SettingsPage({ params }: SettingsPageProps) {
  const { adminSlug } = params;

  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false); // For success message

  // Function to fetch settings from the API
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/${adminSlug}/settings`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: SettingsData = await response.json();
      setSettings(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch settings:", err);
    } finally {
      setLoading(false);
    }
  }, [adminSlug]);

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setSettings(prevSettings => {
      if (!prevSettings) return null;
      return {
        ...prevSettings,
        [name]: type === 'checkbox' ? checked : value,
      };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const response = await fetch(`${apiBaseUrl}/admin/${adminSlug}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save settings.');
      }

      const updatedSettings: SettingsData = await response.json();
      setSettings(updatedSettings); // Update state with fresh data from backend
      setSaveSuccess(true);
      // Automatically hide success message after a few seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8 text-white font-sans flex items-center justify-center">
        <svg className="animate-spin h-12 w-12 text-indigo-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-xl text-gray-400 ml-4">Loading settings...</p>
      </div>
    );
  }

  if (error && !settings) { // Only show full error if initial load failed
    return (
      <div className="min-h-screen bg-gray-900 p-8 text-white font-sans flex items-center justify-center">
        <div className="bg-red-900 bg-opacity-50 text-red-200 p-6 rounded-lg text-center border border-red-700">
          <p className="font-bold text-lg mb-2">Error loading settings:</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchSettings}
            className="mt-4 px-4 py-2 bg-red-700 rounded-lg hover:bg-red-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!settings) { // Fallback if settings are null after loading
    return (
      <div className="min-h-screen bg-gray-900 p-8 text-white font-sans flex items-center justify-center">
        <p className="text-xl text-gray-400">No settings data available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-8 text-white font-sans">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600 mb-12 drop-shadow-lg"
      >
        Company Settings
      </motion.h1>

      <motion.div
        className="max-w-4xl mx-auto space-y-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <form onSubmit={handleSave} className="space-y-10">
          {/* Section 1: General Information */}
          <motion.div
            className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700"
            variants={sectionVariants}
          >
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-700">
              <BuildingLibraryIcon className="text-3xl text-indigo-400 flex-shrink-0" />
              <h3 className="text-2xl font-bold text-white">General Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <motion.div variants={formFieldVariants}>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-400 mb-1">Company Name</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={settings.companyName || ''}
                  onChange={handleChange}
                  className="block w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
                />
              </motion.div>
              <motion.div variants={formFieldVariants}>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-400 mb-1">Contact Email</label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={settings.contactEmail || ''}
                  onChange={handleChange}
                  className="block w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
                />
              </motion.div>
              <motion.div variants={formFieldVariants}>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-400 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  value={settings.contactPhone || ''}
                  onChange={handleChange}
                  className="block w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
                />
              </motion.div>
              <motion.div variants={formFieldVariants}>
                <label htmlFor="address" className="block text-sm font-medium text-gray-400 mb-1">Address Line 1</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={settings.address || ''}
                  onChange={handleChange}
                  className="block w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
                />
              </motion.div>
              <motion.div variants={formFieldVariants}>
                <label htmlFor="city" className="block text-sm font-medium text-gray-400 mb-1">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={settings.city || ''}
                  onChange={handleChange}
                  className="block w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
                />
              </motion.div>
              <motion.div variants={formFieldVariants}>
                <label htmlFor="state" className="block text-sm font-medium text-gray-400 mb-1">State/Province</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={settings.state || ''}
                  onChange={handleChange}
                  className="block w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
                />
              </motion.div>
              <motion.div variants={formFieldVariants}>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-400 mb-1">Zip/Postal Code</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={settings.zipCode || ''}
                  onChange={handleChange}
                  className="block w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
                />
              </motion.div>
              <motion.div variants={formFieldVariants}>
                <label htmlFor="country" className="block text-sm font-medium text-gray-400 mb-1">Country</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={settings.country || ''}
                  onChange={handleChange}
                  className="block w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
                />
              </motion.div>
              <motion.div variants={formFieldVariants} className="md:col-span-2">
                <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-400 mb-1">Company Logo URL (Optional)</label>
                <input
                  type="url"
                  id="logoUrl"
                  name="logoUrl"
                  value={settings.logoUrl || ''}
                  onChange={handleChange}
                  className="block w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
                />
                {settings.logoUrl && (
                  <div className="mt-4 text-center">
                    <Image src={settings.logoUrl} alt="Company Logo Preview" width={150} height={150} objectFit="contain" className="rounded-md mx-auto" loader={customLoader} onError={(e) => { e.currentTarget.src = 'https://placehold.co/150x150/E0E7FF/4338CA?text=Logo+Error'; }} />
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Section 2: Localization */}
          <motion.div
            className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700"
            variants={sectionVariants}
          >
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-700">
              <GlobeAltIcon className="text-3xl text-indigo-400 flex-shrink-0" />
              <h3 className="text-2xl font-bold text-white">Localization</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <motion.div variants={formFieldVariants}>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-400 mb-1">Currency</label>
                <input
                  type="text"
                  id="currency"
                  name="currency"
                  value={settings.currency || ''}
                  onChange={handleChange}
                  className="block w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
                />
              </motion.div>
              <motion.div variants={formFieldVariants}>
                <label htmlFor="timezone" className="block text-sm font-medium text-gray-400 mb-1">Timezone</label>
                <input
                  type="text"
                  id="timezone"
                  name="timezone"
                  value={settings.timezone || ''}
                  onChange={handleChange}
                  className="block w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Section 3: Notification Settings (Example) */}
          <motion.div
            className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700"
            variants={sectionVariants}
          >
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-700">
              <SpeakerWaveIcon className="text-3xl text-indigo-400 flex-shrink-0" />
              <h3 className="text-2xl font-bold text-white">Notification Preferences</h3>
            </div>
            <div className="space-y-4">
              <motion.div variants={formFieldVariants} className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  name="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={handleChange}
                  className="h-5 w-5 text-indigo-600 rounded border-gray-600 focus:ring-indigo-500 bg-gray-700"
                />
                <label htmlFor="emailNotifications" className="ml-3 text-sm font-medium text-gray-400">Enable Email Notifications</label>
              </motion.div>
              <motion.div variants={formFieldVariants} className="flex items-center">
                <input
                  type="checkbox"
                  id="smsNotifications"
                  name="smsNotifications"
                  checked={settings.smsNotifications}
                  onChange={handleChange}
                  className="h-5 w-5 text-indigo-600 rounded border-gray-600 focus:ring-indigo-500 bg-gray-700"
                />
                <label htmlFor="smsNotifications" className="ml-3 text-sm font-medium text-gray-400">Enable SMS Notifications</label>
              </motion.div>
            </div>
          </motion.div>

          {/* Combined Save Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSaving}
            className="w-full inline-flex justify-center py-4 px-4 shadow-sm text-lg font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CloudArrowUpIcon className='w-6 h-6' />
                Save Changes
              </span>
            )}
          </motion.button>

          {/* Success/Error Message */}
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-700 bg-opacity-50 text-green-200 p-4 rounded-lg text-center mt-4 border border-green-600"
            >
              Settings saved successfully!
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-700 bg-opacity-50 text-red-200 p-4 rounded-lg text-center mt-4 border border-red-600 flex items-center justify-center gap-2"
            >
              <ExclamationCircleIcon className="w-5 h-5" />
              <span>Error: {error}</span>
            </motion.div>
          )}
        </form>
      </motion.div>
    </div>
  );
}
