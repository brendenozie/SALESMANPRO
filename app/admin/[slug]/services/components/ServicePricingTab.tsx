// components/admin/components/ServicePricingTab.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormData, PricingTier } from './ServiceListingForm'; // Import types from parent
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline'; // Specific icons

interface ServicePricingTabProps {
    formData: FormData;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleArrayFieldChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, fieldName: keyof FormData) => void;
    handleAddPricingTier: () => void;
    handleUpdatePricingTier: (index: number, field: keyof PricingTier, value: string | number | string[]) => void;
    handleRemovePricingTier: (index: number) => void;
    errors: Partial<FormData & { [key: string]: string }>;
    fieldVariants: any;
    tabContentVariants: any;
    primaryColor: string;
}

const ServicePricingTab: React.FC<ServicePricingTabProps> = ({
    formData,
    handleChange,
    handleArrayFieldChange,
    handleAddPricingTier,
    handleUpdatePricingTier,
    handleRemovePricingTier,
    errors,
    fieldVariants,
    tabContentVariants,
    primaryColor,
}) => {
    return (
        <motion.section
            key="pricing"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
        >
            <h4 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Pricing Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <motion.label className="block" variants={fieldVariants}>
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Selling Price ($) <span className="text-red-500">*</span></span>
                    <input
                        type="number"
                        name="sellingPrice"
                        step="0.01"
                        className={`mt-1 block w-full rounded-lg border ${errors.sellingPrice ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                        value={formData.sellingPrice}
                        onChange={handleChange}
                        required
                        placeholder="0.00"
                        min="0"
                    />
                    {errors.sellingPrice && <p className="text-red-500 text-xs mt-1">{errors.sellingPrice}</p>}
                </motion.label>
                <motion.label className="block" variants={fieldVariants}>
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Buying Price ($) - Internal <span className="text-red-500">*</span></span>
                    <input
                        type="number"
                        name="buyingPrice"
                        step="0.01"
                        className={`mt-1 block w-full rounded-lg border ${errors.buyingPrice ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                        value={formData.buyingPrice}
                        onChange={handleChange}
                        required
                        placeholder="0.00"
                        min="0"
                    />
                    {errors.buyingPrice && <p className="text-red-500 text-xs mt-1">{errors.buyingPrice}</p>}
                </motion.label>
                <motion.label className="block" variants={fieldVariants}>
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Profit Margin (%)</span>
                    <input
                        type="number"
                        name="profitMargin"
                        step="0.01"
                        className={`mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                        value={formData.profitMargin || ''}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0"
                    />
                </motion.label>
                <motion.label className="block" variants={fieldVariants}>
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Tax ($)</span>
                    <input
                        type="number"
                        name="tax"
                        step="0.01"
                        className={`mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                        value={formData.tax || ''}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0"
                    />
                </motion.label>
                <motion.label className="block" variants={fieldVariants}>
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Shipping Cost ($)</span>
                    <input
                        type="number"
                        name="shippingCost"
                        step="0.01"
                        className={`mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                        value={formData.shippingCost || ''}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0"
                    />
                </motion.label>
                <motion.label className="block" variants={fieldVariants}>
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Discount (%)</span>
                    <input
                        type="number"
                        name="discount"
                        step="1"
                        className={`mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                        value={formData.discount || ''}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        max="100"
                    />
                </motion.label>
            </div>

            <h4 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 pt-6 border-t border-gray-200 dark:border-gray-700">Pricing Tiers/Packages</h4>
            <AnimatePresence>
                {(formData.pricingTiers || []).map((tier, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 relative mb-4"
                    >
                        <h5 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Tier #{index + 1}</h5>
                        <button
                            type="button"
                            onClick={() => handleRemovePricingTier(index)}
                            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            aria-label="Remove pricing tier"
                        >
                            <MinusIcon className="w-5 h-5" />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="block">
                                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Tier Name</span>
                                <input
                                    type="text"
                                    value={tier.name}
                                    onChange={(e) => handleUpdatePricingTier(index, "name", e.target.value)}
                                    className={`mt-1 block w-full rounded-lg border ${errors[`pricingTiers[${index}].name`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2`}
                                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                    placeholder="E.g., Basic Package, Premium Plan"
                                />
                                {errors[`pricingTiers[${index}].name`] && <p className="text-red-500 text-xs mt-1">{errors[`pricingTiers[${index}].name`]}</p>}
                            </label>
                            <label className="block">
                                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Tier Price ($)</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={tier.price}
                                    onChange={(e) => handleUpdatePricingTier(index, "price", Number(e.target.value))}
                                    className={`mt-1 block w-full rounded-lg border ${errors[`pricingTiers[${index}].price`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2`}
                                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                    placeholder="0.00"
                                    min="0"
                                />
                                {errors[`pricingTiers[${index}].price`] && <p className="text-red-500 text-xs mt-1">{errors[`pricingTiers[${index}].price`]}</p>}
                            </label>
                            <label className="block md:col-span-2">
                                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Duration (Optional)</span>
                                <input
                                    type="text"
                                    value={tier.duration || ''}
                                    onChange={(e) => handleUpdatePricingTier(index, "duration", e.target.value)}
                                    className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2"
                                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                    placeholder="E.g., 1 hour, 3 days, Monthly"
                                />
                            </label>
                            <label className="block md:col-span-2">
                                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Description</span>
                                <textarea
                                    value={tier.description || ''}
                                    onChange={(e) => handleUpdatePricingTier(index, "description", e.target.value)}
                                    rows={2}
                                    className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2"
                                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                    placeholder="Brief description of what this tier includes."
                                ></textarea>
                            </label>
                            <label className="block md:col-span-2">
                                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Features (comma-separated)</span>
                                <textarea
                                    value={tier.features.join(', ')}
                                    onChange={(e) => handleUpdatePricingTier(index, "features", e.target.value)}
                                    rows={2}
                                    className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2"
                                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                    placeholder="Feature A, Feature B, Feature C"
                                />
                            </label>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
            <button
                type="button"
                onClick={handleAddPricingTier}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: primaryColor }}
            >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Add Pricing Tier
            </button>
        </motion.section>
    );
};

export default ServicePricingTab;
