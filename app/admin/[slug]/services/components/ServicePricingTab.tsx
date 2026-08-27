import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PricingTier } from './ServiceListingForm'; // Import types from parent
import { PlusIcon, MinusIcon, XMarkIcon } from '@heroicons/react/24/outline'; // Updated icons
import { MarketListingForm } from '@/types/typings';

interface ServicePricingTabProps {
    MarketListingForm: MarketListingForm;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleArrayFieldChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, fieldName: keyof MarketListingForm) => void;
    handleAddPricingTier: () => void;
    handleUpdatePricingTier: (index: number, field: keyof PricingTier, value: any) => void;
    handleRemovePricingTier: (index: number) => void;
    errors: Partial<MarketListingForm & { [key: string]: string }>;
    fieldVariants: any;
    tabContentVariants: any;
    primaryColor: string;
}

const ServicePricingTab: React.FC<ServicePricingTabProps> = ({
    MarketListingForm,
    handleChange,
    // handleArrayFieldChange is not used in this version but kept for prop consistency
    handleArrayFieldChange,
    handleAddPricingTier,
    handleUpdatePricingTier,
    handleRemovePricingTier,
    errors,
    fieldVariants,
    tabContentVariants,
    primaryColor,
}) => {
    // Handler to update a specific feature within a tier
    const handleFeatureChange = (tierIndex: number, featureIndex: number, value: string) => {
        const newFeatures = [...MarketListingForm.pricingTiers[tierIndex].features];
        newFeatures[featureIndex] = value;
        handleUpdatePricingTier(tierIndex, 'features', newFeatures);
    };

    // Handler to add a new, empty feature to a tier
    const handleAddFeature = (tierIndex: number) => {
        const newFeatures = [...MarketListingForm.pricingTiers[tierIndex].features, '']; // Add an empty string for the new feature
        handleUpdatePricingTier(tierIndex, 'features', newFeatures);
    };

    // Handler to remove a feature from a tier
    const handleRemoveFeature = (tierIndex: number, featureIndex: number) => {
        const newFeatures = MarketListingForm.pricingTiers[tierIndex].features.filter((_: string, i : number) => i !== featureIndex);
        handleUpdatePricingTier(tierIndex, 'features', newFeatures);
    };


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
                {/* --- Main Price Fields (Unchanged) --- */}
                <motion.label className="block" variants={fieldVariants}>
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Selling Price ($) <span className="text-red-500">*</span></span>
                    <input
                        type="number"
                        name="sellingPrice"
                        step="0.01"
                        className={`mt-1 block w-full rounded-lg border ${errors.sellingPrice ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                        value={MarketListingForm.sellingPrice}
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
                        value={MarketListingForm.buyingPrice}
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
                        value={MarketListingForm.profitMargin || ''}
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
                        value={MarketListingForm.tax || ''}
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
                        value={MarketListingForm.shippingCost || ''}
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
                        value={MarketListingForm.discount || ''}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        max="100"
                    />
                </motion.label>
            </div>

            <h4 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 pt-6 border-t border-gray-200 dark:border-gray-700">Pricing Tiers/Packages</h4>
            <AnimatePresence>
                {(MarketListingForm.pricingTiers || []).map((tier, index) => (
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
                            {/* --- Tier Name, Price, Duration, Description (Unchanged) --- */}
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
                            {/* ... other tier fields ... */}
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

                            {/* --- NEW: Dynamic Features Section --- */}
                            <div className="md:col-span-2 space-y-3">
                                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Features</span>
                                {tier.features.map((feature:any, featureIndex:number) => (
                                    <div key={featureIndex} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={feature}
                                            onChange={(e) => handleFeatureChange(index, featureIndex, e.target.value)}
                                            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2"
                                            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                            placeholder={`Feature #${featureIndex + 1}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFeature(index, featureIndex)}
                                            className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                                            aria-label="Remove feature"
                                        >
                                            <XMarkIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => handleAddFeature(index)}
                                    className="inline-flex items-center px-3 py-1.5 border border-dashed text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Add Feature
                                </button>
                            </div>
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