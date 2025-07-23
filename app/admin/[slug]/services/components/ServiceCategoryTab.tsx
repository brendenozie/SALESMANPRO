import React from 'react';
import { motion } from 'framer-motion';
import { FormData } from './ServiceListingForm'; // Import types from parent

interface ServiceCategoryTabProps {
    formData: FormData;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    errors: Partial<FormData & { [key: string]: string }>;
    fieldVariants: any;
    tabContentVariants: any;
    primaryColor: string;
    productCategories: any[]; // Full category data from storeFormData
}

const ServiceCategoryTab: React.FC<ServiceCategoryTabProps> = ({
    formData,
    handleChange,
    errors,
    fieldVariants,
    tabContentVariants,
    primaryColor,
    productCategories,
}) => {
    // Find the full category object that is currently selected
    const selectedCategoryObject = productCategories.find(
        (cat) => cat.categoryId === formData.productCategoryId
    );

    // Get the subcategories from the selected category, or an empty array if none is selected
    const subcategories = selectedCategoryObject?.category?.subcategories || [];

    // Handle category change to reset the subcategory when a new category is chosen
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        // Propagate the change up to the parent form handler
        handleChange(e);

        // Create a synthetic event to reset the subCategoryName
        const resetEvent = {
            target: {
                name: 'subCategoryName',
                value: '',
            },
        } as unknown as React.ChangeEvent<HTMLSelectElement>;
        handleChange(resetEvent);
    };


    return (
        <motion.section
            key="productcategory"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
        >
            <h4 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Pick Category</h4>
            
            {/* Main Category Dropdown */}
            <motion.label className="block" variants={fieldVariants}>
                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Service Category <span className="text-red-500">*</span></span>
                <div className="relative mt-1">
                    <select
                        name="productCategoryId"
                        className={`block w-full rounded-lg border ${errors.productCategoryId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} p-3 pr-10 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 appearance-none`}
                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                        value={formData.productCategoryId}
                        onChange={handleCategoryChange} // Use the new handler
                        required
                    >
                        <option value="" disabled>Select a category</option>
                        {productCategories
                            .filter(cat => cat.visible !== false)
                            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                            .map((cat) => (
                                <option key={cat.id} value={cat.categoryId}>
                                    {cat.category?.icon} {cat.displayName || cat.category?.name}
                                </option>
                            ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                    </div>
                </div>
                {errors.productCategoryId && <p className="text-red-500 text-xs mt-1">{errors.productCategoryId}</p>}
            </motion.label>

            {/* Subcategory Dropdown - Conditionally rendered */}
            {subcategories.length > 0 && (
                <motion.label className="block" variants={fieldVariants}>
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Service Subcategory <span className="text-red-500">*</span></span>
                    <div className="relative mt-1">
                        <select
                            name="subCategoryName"
                            className={`block w-full rounded-lg border ${errors.subCategoryName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} p-3 pr-10 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 appearance-none`}
                            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                            value={formData.subCategoryName}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>Select a subcategory</option>
                            {subcategories.map((subcat: any) => (
                                // Assuming subcategory object has a `name` property
                                <option key={subcat.id || subcat.name} value={subcat.name}>
                                    {subcat.icon} {subcat.name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                           <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                    {errors.subCategoryName && <p className="text-red-500 text-xs mt-1">{errors.subCategoryName}</p>}
                </motion.label>
            )}
        </motion.section>
    );
};

export default ServiceCategoryTab;







// // components/admin/components/ServiceCategoryTab.tsx
// import React from 'react';
// import { motion } from 'framer-motion';
// import { FormData } from './ServiceListingForm'; // Import types from parent

// interface ServiceCategoryTabProps {
//     formData: FormData;
//     handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
//     errors: Partial<FormData & { [key: string]: string }>;
//     fieldVariants: any;
//     tabContentVariants: any;
//     primaryColor: string;
//     productCategories: any[]; // Full category data from storeFormData
// }

// const ServiceCategoryTab: React.FC<ServiceCategoryTabProps> = ({
//     formData,
//     handleChange,
//     errors,
//     fieldVariants,
//     tabContentVariants,
//     primaryColor,
//     productCategories,
// }) => {
//     return (
//         <motion.section
//             key="productcategory"
//             variants={tabContentVariants}
//             initial="hidden"
//             animate="visible"
//             exit="exit"
//             className="space-y-6"
//         >
//             <h4 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Pick Category</h4>
//             <motion.label className="block" variants={fieldVariants}>
//                 <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Service Category <span className="text-red-500">*</span></span>
//                 <div className="relative mt-1">
//                     <select
//                         name="productCategoryId"
//                         className={`block w-full rounded-lg border ${errors.productCategoryId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} p-3 pr-10 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 appearance-none`}
//                         style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
//                         value={formData.productCategoryId}
//                         onChange={handleChange}
//                         required
//                     >
//                         <option value="" disabled>Select a category</option>
//                         {productCategories
//                             .filter(cat => cat.visible !== false)
//                             .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
//                             .map((cat) => (
//                                 <option key={cat.id} value={cat.categoryId}>
//                                     {cat.category?.icon} {cat.displayName || cat.category?.name}
//                                 </option>
//                             ))}
//                     </select>
//                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
//                         <svg className="fill-current h-4 w-4" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" viewBox="0 0 20 20">
//                             <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
//                         </svg>
//                     </div>
//                 </div>
//                 {errors.productCategoryId && <p className="text-red-500 text-xs mt-1">{errors.productCategoryId}</p>}
//             </motion.label>
//         </motion.section>
//     );
// };

// export default ServiceCategoryTab;
