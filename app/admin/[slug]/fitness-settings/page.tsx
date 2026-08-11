"use client";

import React from 'react';
import { getSettingsData, GeneralSettings } from '@/constant/Data';
import { motion } from 'framer-motion';
import { BuildingLibraryIcon, CloudIcon, Cog6ToothIcon, GlobeAltIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';

import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

interface SettingsProps {
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

export default async function SettingsPage({ params }: SettingsProps) {

  const [isSaving, setIsSaving] = React.useState(false);
  
    const { slug } = await params;
  
    const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    const identifier = slug || session?.user?.id || '';
  
    // 2. Retrieve the memoized company data (no extra DB cost)
    const company = await findCompanyCached(identifier, "page");
  
    if (!company) {
      return <div>Company not found</div>;
    }
  
    // Use the actual database ID for your API calls, ensuring consistency
    const companyId = company.id;    
  
  const settingsData: GeneralSettings = getSettingsData(companyId);

  const [currentSettings, setCurrentSettings] = React.useState(settingsData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentSettings({
      ...currentSettings,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // console.log("Saving settings:", currentSettings);
    setIsSaving(false);
    alert("Settings saved successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-gray-100 font-sans">
      <div className="flex items-center gap-4 mb-10">
        <Cog6ToothIcon className="text-4xl text-indigo-400 w-6 h-6`" />
        <h1 className="text-4xl font-bold text-white">Settings</h1>
      </div>

      <motion.div
        className="max-w-4xl mx-auto space-y-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Section 1: General Information */}
        <motion.div
          className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700"
          variants={sectionVariants}
        >
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-700">
            <BuildingLibraryIcon className="text-2xl text-indigo-400 w-6 h-6" />
            <h3 className="text-2xl font-bold text-white">General Information</h3>
          </div>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <motion.div variants={formFieldVariants}>
              <label htmlFor="gymName" className="block text-sm font-medium text-gray-400 mb-1">Gym Name</label>
              <input
                type="text"
                id="gymName"
                name="gymName"
                value={currentSettings.gymName}
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
                value={currentSettings.contactEmail}
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
                value={currentSettings.contactPhone}
                onChange={handleChange}
                className="block w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
              />
            </motion.div>
            <motion.div variants={formFieldVariants}>
              <label htmlFor="address" className="block text-sm font-medium text-gray-400 mb-1">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={currentSettings.address}
                onChange={handleChange}
                className="block w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
              />
            </motion.div>
          </form>
        </motion.div>

        {/* Section 2: Localization */}
        <motion.div
          className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700"
          variants={sectionVariants}
        >
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-700">
            <GlobeAltIcon className="text-2xl text-indigo-400 w-6 h-6" />
            <h3 className="text-2xl font-bold text-white">Localization</h3>
          </div>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <motion.div variants={formFieldVariants}>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-400 mb-1">Currency</label>
              <input
                type="text"
                id="currency"
                name="currency"
                value={currentSettings.currency}
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
                value={currentSettings.timezone}
                onChange={handleChange}
                className="block w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
              />
            </motion.div>
          </form>
        </motion.div>
        
        {/* Combined Save Button */}
        <motion.button
          type="submit"
          onClick={handleSave}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSaving}
          className="w-full inline-flex justify-center py-4 px-4 shadow-sm text-lg font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <SpeakerWaveIcon className="animate-pulse w-6 h-6" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <CloudIcon className='w-6 h-6' />
              Save Changes
            </span>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}