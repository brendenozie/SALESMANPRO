// components/admin/components/ServiceSpecificsTab.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { FormData } from './ServiceListingForm'; // Import types from parent

interface ServiceSpecificsTabProps {
    formData: FormData;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleArrayFieldChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, fieldName: keyof FormData) => void;
    errors: Partial<FormData & { [key: string]: string }>;
    fieldVariants: any;
    tabContentVariants: any;
    primaryColor: string;
}

const ServiceSpecificsTab: React.FC<ServiceSpecificsTabProps> = ({
    formData,
    handleChange,
    handleArrayFieldChange,
    errors,
    fieldVariants,
    tabContentVariants,
    primaryColor,
}) => {
    return (
        <motion.section
            key="service"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
        >
            <h4 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Service Specifics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.label className="block" variants={fieldVariants}>
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Quantity (e.g., number of units/seats)</span>
                    <input
                        type="number"
                        name="quantity"
                        className={`mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                        value={formData.quantity || ''}
                        onChange={handleChange}
                        placeholder="1"
                        min="0"
                    />
                </motion.label>
                <motion.label className="block" variants={fieldVariants}>
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">General Service Schedule (e.g., "Mon-Fri, 9am-5pm")</span>
                    <input
                        type="text"
                        name="serviceSchedule"
                        className={`mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                        value={formData.serviceSchedule || ""}
                        onChange={handleChange}
                        placeholder="Mon-Fri, 9am-5pm"
                    />
                </motion.label>
                <motion.label className="block" variants={fieldVariants}>
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Hourly Rate ($)</span>
                    <input
                        type="number"
                        name="hourlyRate"
                        step="0.01"
                        className={`mt-1 block w-full rounded-lg border ${errors.hourlyRate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                        value={formData.hourlyRate || ''}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0"
                    />
                    {errors.hourlyRate && <p className="text-red-500 text-xs mt-1">{errors.hourlyRate}</p>}
                </motion.label>
                <motion.label className="block" variants={fieldVariants}>
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Minimum Hours</span>
                    <input
                        type="number"
                        name="minimumHours"
                        step="1"
                        className={`mt-1 block w-full rounded-lg border ${errors.minimumHours ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                        value={formData.minimumHours || ''}
                        onChange={handleChange}
                        placeholder="1"
                        min="0"
                    />
                    {errors.minimumHours && <p className="text-red-500 text-xs mt-1">{errors.minimumHours}</p>}
                </motion.label>
                <motion.label className="block md:col-span-2" variants={fieldVariants}>
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Amenities (comma-separated, e.g., "Free Wi-Fi", "Parking")</span>
                    <textarea
                        name="amenities"
                        value={formData.amenities.join(', ')}
                        onChange={(e) => handleArrayFieldChange(e, 'amenities')}
                        rows={2}
                        className={`mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                        placeholder="e.g., Free Wi-Fi, Parking, Pet-friendly"
                    />
                </motion.label>
                <motion.label className="block md:col-span-2" variants={fieldVariants}>
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Required Client Information (comma-separated, e.g., "Phone Number", "Address")</span>
                    <textarea
                        name="requiredClientInfo"
                        value={formData.requiredClientInfo.join(', ')}
                        onChange={(e) => handleArrayFieldChange(e, 'requiredClientInfo')}
                        rows={2}
                        className={`mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                        placeholder="e.g., Full Name, Phone Number, Address"
                    />
                </motion.label>
            </div>
        </motion.section>
    );
};

export default ServiceSpecificsTab;
