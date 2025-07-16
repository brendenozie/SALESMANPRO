import React from 'react';
import { getSettingsData, GeneralSettings } from '@/constant/Data'; // Adjust path as needed
import { motion } from 'framer-motion';

interface SettingsProps {
  params: {
    adminSlug: string;
  };
}

const formFieldVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function SettingsPage({ params }: SettingsProps) {
  const { adminSlug } = params;
  const settingsData: GeneralSettings = getSettingsData(adminSlug);

  // In a real app, you'd use useState to manage form inputs and handle updates
  const [currentSettings, setCurrentSettings] = React.useState(settingsData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentSettings({
      ...currentSettings,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving settings:", currentSettings);
    // TODO: Integrate with backend API to save settings
    alert("Settings saved!");
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">General Settings</h2>

      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        <form onSubmit={handleSave} className="space-y-6">
          <motion.div variants={formFieldVariants}>
            <label htmlFor="gymName" className="block text-sm font-medium text-gray-700 mb-1">Gym Name</label>
            <input
              type="text"
              id="gymName"
              name="gymName"
              value={currentSettings.gymName}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-dark focus:border-primary-dark sm:text-sm"
            />
          </motion.div>

          <motion.div variants={formFieldVariants}>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={currentSettings.contactEmail}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-dark focus:border-primary-dark sm:text-sm"
            />
          </motion.div>

          <motion.div variants={formFieldVariants}>
            <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
            <input
              type="tel"
              id="contactPhone"
              name="contactPhone"
              value={currentSettings.contactPhone}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-dark focus:border-primary-dark sm:text-sm"
            />
          </motion.div>

          <motion.div variants={formFieldVariants}>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={currentSettings.address}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-dark focus:border-primary-dark sm:text-sm"
            />
          </motion.div>

          <motion.div variants={formFieldVariants}>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <input
              type="text"
              id="currency"
              name="currency"
              value={currentSettings.currency}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-dark focus:border-primary-dark sm:text-sm"
            />
          </motion.div>

          <motion.div variants={formFieldVariants}>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <input
              type="text"
              id="timezone"
              name="timezone"
              value={currentSettings.timezone}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-dark focus:border-primary-dark sm:text-sm"
            />
          </motion.div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-dark hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-colors"
          >
            Save Settings
          </motion.button>
        </form>
      </div>
    </div>
  );
}