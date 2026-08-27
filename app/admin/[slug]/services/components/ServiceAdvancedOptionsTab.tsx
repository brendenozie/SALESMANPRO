// components/admin/components/ServiceAdvancedOptionsTab.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { MarketListingForm } from '@/types/typings';

interface ServiceAdvancedOptionsTabProps {
    MarketListingForm: MarketListingForm;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleArrayFieldChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, fieldName: keyof MarketListingForm) => void;
    errors: Partial<MarketListingForm & { [key: string]: string }>;
    fieldVariants: any; // Framer motion variants for individual fields
    tabContentVariants: any; // Framer motion variants for the tab section
    primaryColor: string;
}

const ServiceAdvancedOptionsTab: React.FC<ServiceAdvancedOptionsTabProps> = ({
    MarketListingForm,
    handleChange,
    handleArrayFieldChange,
    errors,
    fieldVariants,
    tabContentVariants,
    primaryColor,
}) => {
    return (
        <motion.section
            key="advanced" // Unique key for AnimatePresence
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
        >
            <h4 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Advanced Options</h4>

            {/* SEO Tags */}
            <motion.label className="block" variants={fieldVariants}>
                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">SEO Tags (comma-separated)</span>
                <textarea
                    name="tags"
                    value={MarketListingForm.tags.join(', ') || ''}
                    onChange={(e) => handleArrayFieldChange(e, 'tags')}
                    rows={2}
                    className={`mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    placeholder="e.g., cleaning, home, office, professional"
                />
            </motion.label>

            {/* Listing Status */}
            <motion.label className="block" variants={fieldVariants}>
                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Listing Status</span>
                <select
                    name="status"
                    value={MarketListingForm.status}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 appearance-none pr-8`}
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                >
                    <option value="PENDING">Pending</option>
                    <option value="ACTIVE">Active</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="ARCHIVED">Archived</option>
                </select>
            </motion.label>

            {/* Show on Ghuba Marketplace */}
            <motion.label className="flex items-center space-x-2 cursor-pointer mt-4" variants={fieldVariants}>
                <input
                    type="checkbox"
                    name="showOnGhuba"
                    checked={MarketListingForm.showOnGhuba || false}
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-current rounded"
                    style={{ color: primaryColor }}
                />
                <span className="text-gray-700 dark:text-gray-300 font-medium">Show on Ghuba Marketplace?</span>
            </motion.label>

            {/* Provider Rating */}
            <motion.label className="block" variants={fieldVariants}>
                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Provider Rating (Optional, 1-5)</span>
                <input
                    type="number"
                    name="providerRating"
                    step="0.1"
                    min="1"
                    max="5"
                    value={MarketListingForm.providerRating || ''}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    placeholder="e.g., 4.5"
                />
            </motion.label>
        </motion.section>
    );
};

export default ServiceAdvancedOptionsTab;
