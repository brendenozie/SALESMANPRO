// components/admin/components/ServiceContactLocationTab.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { FormData } from './ServiceListingForm'; // Import types from parent

interface ServiceContactLocationTabProps {
    formData: FormData;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    errors: Partial<FormData & { [key: string]: string }>;
    fieldVariants: any;
    tabContentVariants: any;
    primaryColor: string;
    deliveryMethods: string[];
    paymentOptions: string[];
}

const ServiceContactLocationTab: React.FC<ServiceContactLocationTabProps> = ({
    formData,
    handleChange,
    errors,
    fieldVariants,
    tabContentVariants,
    primaryColor,
    deliveryMethods,
    paymentOptions,
}) => {
    return (
        <motion.section
            key="contactLocation"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
        >
            <h4 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Contact & Location</h4>
            <motion.label className="block" variants={fieldVariants}>
                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Contact Name</span>
                <input
                    type="text"
                    name="contactName"
                    value={formData.contactName || ''}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    placeholder="E.g., John Smith"
                />
            </motion.label>
            <motion.label className="block" variants={fieldVariants}>
                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Contact Phone Number</span>
                <input
                    type="tel"
                    name="contact"
                    value={formData.contact || ''}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-lg border ${errors.contact ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    placeholder="+1 (123) 456-7890"
                />
                {errors.contact && <p className="text-red-500 text-xs mt-1">{errors.contact}</p>}
            </motion.label>
            <motion.label className="block" variants={fieldVariants}>
                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Contact Email</span>
                <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    placeholder="contact@example.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </motion.label>
            <motion.label className="block" variants={fieldVariants}>
                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Location Name (e.g., "Main Office", "Downtown Branch")</span>
                <input
                    type="text"
                    name="locationName"
                    value={formData.locationName || ''}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    placeholder="E.g., Our Main Studio"
                />
            </motion.label>
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={fieldVariants}>
                <label className="block">
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Latitude</span>
                    <input
                        type="number"
                        name="latitude"
                        step="any"
                        value={formData.latitude || ''}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                        placeholder="e.g., 34.0522"
                    />
                </label>
                <label className="block">
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Longitude</span>
                    <input
                        type="number"
                        name="longitude"
                        step="any"
                        value={formData.longitude || ''}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                        placeholder="e.g., -118.2437"
                    />
                </label>
            </motion.div>
            <motion.label className="flex items-center space-x-2 cursor-pointer mt-4" variants={fieldVariants}>
                <input
                    type="checkbox"
                    name="delivery"
                    checked={formData.delivery}
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-current rounded"
                    style={{ color: primaryColor }}
                />
                <span className="text-gray-700 dark:text-gray-300 font-medium">Offer Delivery?</span>
            </motion.label>
            {formData.delivery && (
                <motion.label initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="block mt-4">
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Delivery Method</span>
                    <select
                        name="deliveryMethod"
                        value={formData.deliveryMethod || ''}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 appearance-none pr-8`}
                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    >
                        <option value="">Select method</option>
                        {deliveryMethods.map(method => (
                            <option key={method} value={method}>{method}</option>
                        ))}
                    </select>
                </motion.label>
            )}
            <motion.label className="block mt-4" variants={fieldVariants}>
                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Payment Option</span>
                <select
                    name="paymentOption"
                    value={formData.paymentOption || ''}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 appearance-none pr-8`}
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                >
                    <option value="">Select option</option>
                    {paymentOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </motion.label>
        </motion.section>
    );
};

export default ServiceContactLocationTab;
