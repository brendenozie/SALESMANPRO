// components/admin/components/ServiceDetailsTab.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { MarketListingForm } from '@/types/typings';

interface ServiceDetailsTabProps {
    MarketListingForm: MarketListingForm;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    errors: Partial<MarketListingForm & { [key: string]: string }>;
    fieldVariants: any; // Framer motion variants
    tabContentVariants: any; // Framer motion variants
    primaryColor: string;
    // sellers: { id: string; name: string }[];
    // companies: { id: string; name: string }[];
}

const ServiceDetailsTab: React.FC<ServiceDetailsTabProps> = ({
    MarketListingForm,
    handleChange,
    errors,
    fieldVariants,
    tabContentVariants,
    primaryColor,
    // sellers,
    // companies,
}) => {
    return (
        <motion.section
            key="details"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
        >
            <h4 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Basic Information</h4>
            <motion.label className="block" variants={fieldVariants}>
                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Listing Title <span className="text-red-500">*</span></span>
                <input
                    type="text"
                    name="name"
                    value={MarketListingForm.name}
                    onChange={handleChange}
                    required
                    className={`mt-1 block w-full rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    placeholder="E.g., Premium Car Wash Service"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </motion.label>

            <motion.label className="block" variants={fieldVariants}>
                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Description <span className="text-red-500">*</span></span>
                <textarea
                    name="description"
                    value={MarketListingForm.description || ""}
                    onChange={handleChange}
                    required
                    rows={5}
                    className={`mt-1 block w-full rounded-lg border ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    placeholder="Provide a detailed description of your service, its benefits, and what clients can expect."
                ></textarea>
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </motion.label>

            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={fieldVariants}>
                {/* <label className="block">
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Seller Type</span>
                    <select
                        name="sellerType"
                        value={MarketListingForm.sellerType || ''}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 appearance-none pr-8`}
                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    >
                        <option value="">Select type</option>
                        <option value="INDIVIDUAL">Individual</option>
                        <option value="COMPANY">Company</option>
                    </select>
                </label> */}
                {/* {MarketListingForm.sellerType === 'COMPANY' && (
                    <label className="block">
                        <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Company</span>
                        <select
                            name="companyId"
                            value={MarketListingForm.companyId || ''}
                            onChange={handleChange}
                            className={`mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 appearance-none pr-8`}
                            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                        >
                            <option value="">Select company</option>
                            {companies.map(comp => (
                                <option key={comp.id} value={comp.id}>{comp.name}</option>
                            ))}
                        </select>
                    </label>
                )}
                {MarketListingForm.sellerType === 'INDIVIDUAL' && (
                    <label className="block">
                        <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Seller</span>
                        <select
                            name="sellerId"
                            value={MarketListingForm.sellerId || ''}
                            onChange={handleChange}
                            className={`mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 appearance-none pr-8`}
                            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                        >
                            <option value="">Select seller</option>
                            {sellers.map(seller => (
                                <option key={seller.id} value={seller.id}>{seller.name}</option>
                            ))}
                        </select>
                    </label>
                )} */}
            </motion.div>
        </motion.section>
    );
};

export default ServiceDetailsTab;