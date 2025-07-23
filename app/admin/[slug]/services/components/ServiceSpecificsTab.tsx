import React from 'react';
import { motion } from 'framer-motion';
import { FormData } from './ServiceListingForm'; // Import types from parent
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ServiceSpecificsTabProps {
    formData: FormData;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    // The prop below is no longer used by this component but is kept for API consistency.
    handleArrayFieldChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, fieldName: keyof FormData) => void;
    errors: Partial<FormData & { [key: string]: string }>;
    fieldVariants: any;
    tabContentVariants: any;
    primaryColor: string;
}

const ServiceSpecificsTab: React.FC<ServiceSpecificsTabProps> = ({
    formData,
    handleChange,
    errors,
    fieldVariants,
    tabContentVariants,
    primaryColor,
}) => {
    // A single, reusable handler to manage updates for our dynamic lists ('amenities', 'requiredClientInfo')
    const handleListUpdate = (
        fieldName: keyof FormData,
        action: 'update' | 'add' | 'remove',
        index?: number,
        value?: string
    ) => {
        const list = (formData[fieldName] as string[]) || [];
        let newList = [...list];

        if (action === 'update' && index !== undefined) {
            newList[index] = value || '';
        } else if (action === 'add') {
            newList.push('');
        } else if (action === 'remove' && index !== undefined) {
            newList = newList.filter((_, i) => i !== index);
        }

        // Create a synthetic event to pass to the parent form's generic handleChange function
        const syntheticEvent = {
            target: {
                name: fieldName,
                value: newList,
            },
        } as unknown as React.ChangeEvent<HTMLInputElement>;

        handleChange(syntheticEvent);
    };


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
                {/* --- Static Fields (Unchanged) --- */}
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

                {/* --- NEW: Dynamic Amenities Field --- */}
                <motion.div className="block md:col-span-2 space-y-3" variants={fieldVariants}>
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Amenities</span>
                    {(formData.amenities || []).map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={amenity}
                                onChange={(e) => handleListUpdate('amenities', 'update', index, e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2"
                                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                placeholder="e.g., Free Wi-Fi, Parking"
                            />
                            <button
                                type="button"
                                onClick={() => handleListUpdate('amenities', 'remove', index)}
                                className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                                aria-label="Remove amenity"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => handleListUpdate('amenities', 'add')}
                        className="inline-flex items-center px-3 py-1.5 border border-dashed text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Amenity
                    </button>
                </motion.div>

                {/* --- NEW: Dynamic Required Client Info Field --- */}
                <motion.div className="block md:col-span-2 space-y-3" variants={fieldVariants}>
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Required Client Information</span>
                     {(formData.requiredClientInfo || []).map((info, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={info}
                                onChange={(e) => handleListUpdate('requiredClientInfo', 'update', index, e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2"
                                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                placeholder="e.g., Full Name, Phone Number"
                            />
                            <button
                                type="button"
                                onClick={() => handleListUpdate('requiredClientInfo', 'remove', index)}
                                className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                                aria-label="Remove required info"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => handleListUpdate('requiredClientInfo', 'add')}
                        className="inline-flex items-center px-3 py-1.5 border border-dashed text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Required Info
                    </button>
                </motion.div>
            </div>
        </motion.section>
    );
};

export default ServiceSpecificsTab;