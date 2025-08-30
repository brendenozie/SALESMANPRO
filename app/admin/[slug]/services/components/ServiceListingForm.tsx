// components/admin/components/ServiceListingForm.tsx (Parent Component)
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XMarkIcon,
    InformationCircleIcon,
    CubeIcon,
    TagIcon,
    WrenchScrewdriverIcon,
    CalendarDaysIcon,
    PhotoIcon,
    MapPinIcon,
    Cog6ToothIcon,
    ArrowLeftIcon, // For Previous button
    ArrowRightIcon, // For Next button
    ArrowPathIcon, // For loading spinner
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

// Import child components
import ServiceDetailsTab from './ServiceDetailsTab';
import ServiceCategoryTab from './ServiceCategoryTab';
import ServicePricingTab from './ServicePricingTab';
import ServiceSpecificsTab from './ServiceSpecificsTab';
import ServiceAvailabilityTab from './ServiceAvailabilityTab';
import ServiceMediaTab from './ServiceMediaTab';
import ServiceContactLocationTab from './ServiceContactLocationTab';
import ServiceAdvancedOptionsTab from './ServiceAdvancedOptionsTab';
import { IStoreCategory, MarketListingForm } from '@/types/typings';

// --- Type Definitions (Centralized) ---
export type SellerType = "INDIVIDUAL" | "COMPANY";
export type ListingStatus = "ACTIVE" | "PENDING" | "REJECTED" | "ARCHIVED";

export interface BookingSlot {
    date: string;
    time: string;
    capacity: number;
}

export interface PricingTier {
    name: string;
    price: number;
    duration?: string;
    description?: string;
    features: string[];
}

// Dummy initial form data
const initialFormData: MarketListingForm = {
    name: '',
    description: '',
    productCategoryId: '',
    sellingPrice: 0,
    buyingPrice: 0,
    bookingSlots: [],
    pricingTiers: [],
    tags: [],
    amenities: [],
    requiredClientInfo: [],
    images: [],
    isAvailable: true,
    isOnOffer: false,
    isFlashDeal: false,
    isNewArrival: false,
    isDiscounted: false,
    isFeatured: false,
    delivery: false,
    status: 'PENDING',
    category: null,
    subCategory: undefined,
    subCategoryName: '',
    duration: undefined,
    id: '',
    option: [],
    color: [],
    size: [],
    weight: [],
    material: [],
    quantity: 0,
    bedrooms: [],
    studios: [],
    features: [],
    paymentOption: '',
    location: null
};

// Mock data for dropdowns if not provided by context
const mockProductCategories = [
    { id: 'cat1', displayName: 'Home Cleaning', icon: '🧹', category: { name: 'Home Cleaning' }, sortOrder: 0, visible: true },
    { id: 'cat2', displayName: 'Office Cleaning', icon: '🏢', category: { name: 'Office Cleaning' }, sortOrder: 1, visible: true },
    { id: 'cat3', displayName: 'Deep Cleaning', icon: '🧼', category: { name: 'Deep Cleaning' }, sortOrder: 2, visible: true },
    { id: 'cat4', displayName: 'Window Cleaning', icon: '🪟', category: { name: 'Window Cleaning' }, sortOrder: 3, visible: true },
];
// const mockSellers = [{ id: 's1', name: 'CleanPro Team' }, { id: 's2', name: 'Sparkle Solutions' }];
// const mockCompanies = [{ id: 'c1', name: 'Elite Services Inc.' }, { id: 'c2', name: 'Urban Cleaners' }];
const mockDeliveryMethods = ['In-person', 'Online', 'Hybrid'];
const mockPaymentOptions = ['Credit Card', 'Cash', 'Bank Transfer'];


export type FormErrors = {
    [K in keyof MarketListingForm]?: string;
} & {
    // Index signature for nested errors like 'pricingTiers[0].name'
    [key: string]: string;
};


// Main component props
interface ServiceListingFormProps {
    isOpen: boolean; // Controls modal visibility
    onClose: () => void; // Function to close the modal
    onSave: (data: MarketListingForm) => Promise<void>; // Function to save the form data, now async
    initialData?: MarketListingForm | null; // Data for editing an existing service
    // Data for dropdowns passed from parent (AdminServicesClient)
    productCategories?: any[]; // Full category data from storeFormData
    paymentOptions?: string[];
    deliveryMethods?: string[];
    // sellers?: { id: string; name: string }[];
    // companies?: { id: string; name: string }[];
}

const ServiceListingForm: React.FC<ServiceListingFormProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
    productCategories: propProductCategories,
    paymentOptions: propPaymentOptions,
    deliveryMethods: propDeliveryMethods,
    // sellers: propSellers,
    // companies: propCompanies,
}) => {
    const { storeFormData } = useStoreContext();
    const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0d9488';
    const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#f97316';

    const [MarketListingForm, setFormData] = useState<MarketListingForm>(initialData || initialFormData);
    const [activeTabIndex, setActiveTabIndex] = useState(0); // Use index for walkthrough
    const [errors, setErrors] = useState<Partial<MarketListingForm & { [key: string]: string }>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Use props data or mock data as fallback
    const categories = propProductCategories || mockProductCategories;
    // const sellers = propSellers || mockSellers;
    // const companies = propCompanies || mockCompanies;
    const deliveryMethods = propDeliveryMethods || mockDeliveryMethods;
    const paymentOptions = propPaymentOptions || mockPaymentOptions;

    // Tab data for rendering - useMemo to prevent re-creation on every render
    const tabs = useMemo(() => [
        { id: 'details', name: 'Listing Details', icon: InformationCircleIcon, fields: ['title', 'description', 'sellerType', 'companyId', 'sellerId'] },
        { id: 'productcategory', name: 'Pick Category', icon: CubeIcon, fields: ['productCategoryId'] },
        { id: 'pricing', name: 'Pricing & Tiers', icon: TagIcon, fields: ['sellingPrice', 'buyingPrice', 'profitMargin', 'tax', 'shippingCost', 'discount', 'pricingTiers'] },
        { id: 'service', name: 'Service Specifics', icon: WrenchScrewdriverIcon, fields: ['quantity', 'serviceSchedule', 'hourlyRate', 'minimumHours', 'amenities', 'requiredClientInfo'] },
        { id: 'availability', name: 'Availability & Deals', icon: CalendarDaysIcon, fields: ['availabilityStart', 'availabilityEnd', 'bookingSlots', 'isOnOffer', 'startDealDate', 'endDealDate', 'isFlashDeal', 'isNewArrival', 'isDiscounted', 'isFeatured'] },
        { id: 'media', name: 'Media', icon: PhotoIcon, fields: ['images', 'video'] },
        { id: 'contactLocation', name: 'Contact & Location', icon: MapPinIcon, fields: ['contactName', 'contact', 'email', 'locationName', 'latitude', 'longitude', 'delivery', 'deliveryMethod', 'paymentOption'] },
        { id: 'advanced', name: 'Advanced Options', icon: Cog6ToothIcon, fields: ['tags', 'status', 'showOnGhuba', 'providerRating'] },
    ], []);

    const activeTabId = tabs[activeTabIndex]?.id;
    const isFirstTab = activeTabIndex === 0;
    const isLastTab = activeTabIndex === tabs.length - 1;

    // Effect to update form data when initialData prop changes (for edit mode)
    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData(initialFormData);
        }
        setActiveTabIndex(0); // Always start at the first tab
        setErrors({}); // Clear errors
    }, [initialData, isOpen]);

    // Generic handleChange for most inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;

        setFormData((prev) => {
            const newFormData = { ...prev };

            // Handle nested properties (e.g., 'location.latitude')
            if (name.includes('.')) {
                const [parent, child] = name.split('.');
                (newFormData as any)[parent] = {
                    ...(newFormData as any)[parent],
                    [child]: type === 'number' ? parseFloat(value) : value,
                };
            } else if (name === 'images') {
                // Special handling for images array, assuming value is already an array of strings
                (newFormData as any)[name] = value as unknown as string[];
            } else if (type === 'number') {
                (newFormData as any)[name] = parseFloat(value);
            } else if (type === 'checkbox') {
                (newFormData as any)[name] = checked;
            } else {
                (newFormData as any)[name] = value;
            }
            return newFormData;
        });

        // Clear error for the field being changed
        if (errors[name as keyof MarketListingForm]) {
            setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
        }
    };

    // Handler for array fields (comma-separated strings)
    const handleArrayFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, fieldName: keyof MarketListingForm) => {
        const value = e.target.value;
        setFormData((prev) => ({
            ...prev,
            [fieldName]: value.split(',').map(item => item.trim()).filter(item => item !== ''),
        }));
        if (errors[fieldName as keyof MarketListingForm]) {
            setErrors((prevErrors) => ({ ...prevErrors, [fieldName]: undefined }));
        }
    };

    // --- Booking Slots Management ---
    const handleAddBookingSlot = () => {
        setFormData((prev) => ({
            ...prev,
            bookingSlots: [...(prev.bookingSlots || []), { date: '', time: '', capacity: 1 }],
        }));
    };

    const handleUpdateBookingSlot = (index: number, field: keyof BookingSlot, value: string | number) => {
        setFormData((prev) => {
            const updatedSlots = [...(prev.bookingSlots || [])];
            updatedSlots[index] = { ...updatedSlots[index], [field]: value };
            return { ...prev, bookingSlots: updatedSlots };
        });
    };

    const handleRemoveBookingSlot = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            bookingSlots: (prev.bookingSlots || []).filter((_, i) => i !== index),
        }));
    };

    // --- Pricing Tiers Management ---
    const handleAddPricingTier = () => {
        setFormData((prev) => ({
            ...prev,
            pricingTiers: [...(prev.pricingTiers || []), { name: '', price: 0, features: [] }],
        }));
    };

    const handleUpdatePricingTier = (index: number, field: keyof PricingTier, value: string | number | string[]) => {
        setFormData((prev) => {
            const updatedTiers = [...(prev.pricingTiers || [])];
            if (field === "features") {
                const featuresArray =
                    typeof value === "string"
                    ? value.split(",").map((f) => f.trim()).filter((f) => f !== "")
                    : (value as string[]); // explicitly cast
                updatedTiers[index] = { ...updatedTiers[index], features: featuresArray };
            } else if (field === "price") {
                updatedTiers[index] = { ...updatedTiers[index], price: Number(value) };
            } else {
                updatedTiers[index] = { ...updatedTiers[index], [field]: value };
            }

            return { ...prev, pricingTiers: updatedTiers };
        });
    };
    

    const handleRemovePricingTier = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            pricingTiers: (prev.pricingTiers || []).filter((_, i) => i !== index),
        }));
    };

    // --- Form Validation ---
    // This function now validates ALL fields, but `handleNext` will use it
    // to check only the *current* tab's fields.
    const validateForm = () => {
        let newErrors: Partial<MarketListingForm & { [key: string]: string }> = {};

        // Details Tab
        if (!MarketListingForm.name.trim()) newErrors.title = 'Listing Title is required.';
        if (!MarketListingForm.description?.trim()) newErrors.description = 'Description is required.';
        // Add validation for sellerType, companyId, sellerId if required
        // if (!MarketListingForm.sellerType) newErrors.sellerType = 'Seller type is required.';
        // if (MarketListingForm.sellerType === 'COMPANY' && !MarketListingForm.companyId) newErrors.companyId = 'Company is required.';
        // if (MarketListingForm.sellerType === 'INDIVIDUAL' && !MarketListingForm.sellerId) newErrors.sellerId = 'Seller is required.';

        // Category Tab
        if (!MarketListingForm.productCategoryId.trim()) newErrors.productCategoryId = 'Category is required.';

        // Pricing Tab
        if (MarketListingForm.sellingPrice <= 0) newErrors.sellingPrice = 'Selling Price must be positive.';
        if (MarketListingForm.buyingPrice <= 0) newErrors.buyingPrice = 'Buying Price must be positive.';

        MarketListingForm.pricingTiers?.forEach((tier, index) => {
            if (!tier.name.trim()) newErrors[`pricingTiers[${index}].name`] = 'Tier name is required.';
            if (tier.price < 0) newErrors[`pricingTiers[${index}].price`] = 'Price cannot be negative.';
        });

        // Service Specifics Tab
        if (MarketListingForm.hourlyRate !== undefined && MarketListingForm.hourlyRate < 0) newErrors.hourlyRate = 'Hourly Rate cannot be negative.';
        if (MarketListingForm.minimumHours !== undefined && MarketListingForm.minimumHours < 0) newErrors.minimumHours = 'Minimum Hours cannot be negative.';
        // Add validation for amenities and requiredClientInfo if they are mandatory arrays
        // if (MarketListingForm.amenities.length === 0) newErrors.amenities = 'At least one amenity is required.';
        // if (MarketListingForm.requiredClientInfo.length === 0) newErrors.requiredClientInfo = 'At least one required client info is needed.';


        // Availability Tab
        MarketListingForm.bookingSlots?.forEach((slot, index) => {
            if (!slot.date) newErrors[`bookingSlots[${index}].date`] = 'Date is required.';
            if (!slot.time) newErrors[`bookingSlots[${index}].time`] = 'Time is required.';
            if (slot.capacity <= 0) newErrors[`bookingSlots[${index}].capacity`] = 'Capacity must be positive.';
        });
        if (MarketListingForm.availabilityStart && MarketListingForm.availabilityEnd && new Date(MarketListingForm.availabilityStart) >= new Date(MarketListingForm.availabilityEnd)) {
            newErrors.availabilityStart = 'Start date must be before end date.';
            newErrors.availabilityEnd = 'End date must be after start date.';
        }
        if (MarketListingForm.isOnOffer && MarketListingForm.startDealDate && MarketListingForm.endDealDate && new Date(MarketListingForm.startDealDate) >= new Date(MarketListingForm.endDealDate)) {
            newErrors.startDealDate = 'Deal start date must be before end date.';
            newErrors.endDealDate = 'Deal end date must be after start date.';
        }

        // Media Tab
        // if (MarketListingForm.images.length === 0) newErrors.images = 'At least one image is required.';

        // Contact & Location Tab
        if (MarketListingForm.contact && !/^\+?[0-9\s\-()]{7,20}$/.test(MarketListingForm.contact)) newErrors.contact = 'Invalid phone number format.';
        if (MarketListingForm.email && !/\S+@\S+\.\S+/.test(MarketListingForm.email)) newErrors.email = 'Invalid email format.';
        // Add validation for locationName, latitude, longitude if mandatory
        // if (!MarketListingForm.locationName) newErrors.locationName = 'Location name is required.';


        // Advanced Options Tab
        // if (!MarketListingForm.tags || MarketListingForm.tags.length === 0) newErrors.tags = 'At least one tag is required.';
        // if (!MarketListingForm.status) newErrors.status = 'Status is required.';
        if (MarketListingForm.providerRating !== undefined && (MarketListingForm.providerRating < 1 || MarketListingForm.providerRating > 5)) {
            newErrors.providerRating = 'Rating must be between 1 and 5.';
        }

        setErrors(newErrors);
        return newErrors; // Return the errors object
    };

    const validateCurrentTab = () => {
        const allErrors = validateForm();
        const currentTabFields = tabs[activeTabIndex].fields;
        let currentTabHasErrors = false;
        let tabSpecificErrors: Partial<MarketListingForm & { [key: string]: string }> = {};

        for (const field of currentTabFields) {
            if (allErrors[field as keyof MarketListingForm]) {
                tabSpecificErrors[field as keyof MarketListingForm] = allErrors[field as keyof MarketListingForm];
                currentTabHasErrors = true;
            }
            // Handle nested array errors like pricingTiers[0].name
            if (field === 'pricingTiers' && MarketListingForm.pricingTiers) {
                MarketListingForm.pricingTiers.forEach((_, index) => {
                    if (allErrors[`pricingTiers[${index}].name`]) {
                        tabSpecificErrors[`pricingTiers[${index}].name`] = allErrors[`pricingTiers[${index}].name`];
                        currentTabHasErrors = true;
                    }
                    if (allErrors[`pricingTiers[${index}].price`]) {
                        tabSpecificErrors[`pricingTiers[${index}].price`] = allErrors[`pricingTiers[${index}].price`];
                        currentTabHasErrors = true;
                    }
                });
            }
            if (field === 'bookingSlots' && MarketListingForm.bookingSlots) {
                MarketListingForm.bookingSlots.forEach((_, index) => {
                    if (allErrors[`bookingSlots[${index}].date`]) {
                        tabSpecificErrors[`bookingSlots[${index}].date`] = allErrors[`bookingSlots[${index}].date`];
                        currentTabHasErrors = true;
                    }
                    if (allErrors[`bookingSlots[${index}].time`]) {
                        tabSpecificErrors[`bookingSlots[${index}].time`] = allErrors[`bookingSlots[${index}].time`];
                        currentTabHasErrors = true;
                    }
                    if (allErrors[`bookingSlots[${index}].capacity`]) {
                        tabSpecificErrors[`bookingSlots[${index}].capacity`] = allErrors[`bookingSlots[${index}].capacity`];
                        currentTabHasErrors = true;
                    }
                });
            }
        }
        // Also check for general tab-specific errors that might not map directly to a single field
        if (activeTabId === 'availability' && (allErrors.availabilityStart || allErrors.availabilityEnd || allErrors.startDealDate || allErrors.endDealDate)) {
             currentTabHasErrors = true;
             if(allErrors.availabilityStart) tabSpecificErrors.availabilityStart = allErrors.availabilityStart;
             if(allErrors.availabilityEnd) tabSpecificErrors.availabilityEnd = allErrors.availabilityEnd;
             if(allErrors.startDealDate) tabSpecificErrors.startDealDate = allErrors.startDealDate;
             if(allErrors.endDealDate) tabSpecificErrors.endDealDate = allErrors.endDealDate;
        }


        setErrors(tabSpecificErrors); // Only show errors relevant to the current tab
        return !currentTabHasErrors;
    };


    const handleNextTab = () => {
        if (validateCurrentTab()) { // Validate current tab before moving
            if (activeTabIndex < tabs.length - 1) {
                setActiveTabIndex(prev => prev + 1);
            }
        } else {
            // Validation failed, errors are already set in state
            console.log("Validation failed for current tab. Cannot proceed.");
        }
    };

    const handlePreviousTab = () => {
        if (activeTabIndex > 0) {
            setActiveTabIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // On final submit, validate all fields
        const allErrors = validateForm();
        if (Object.keys(allErrors).length > 0) {
            setErrors(allErrors); // Show all errors
            console.error('Form has validation errors:', allErrors);

            // Find the first tab with an error and switch to it
            const firstErrorField = Object.keys(allErrors)[0];
            if (firstErrorField) {
                let tabToSwitch: string | undefined;
                for (const tab of tabs) {
                    // Check if the error field is directly in this tab's fields
                    if (tab.fields.includes(firstErrorField)) {
                        tabToSwitch = tab.id;
                        break;
                    }
                    // Check for nested errors like pricingTiers[0].name
                    if (firstErrorField.startsWith(tab.id) || firstErrorField.includes(tab.id)) { // More general check
                        tabToSwitch = tab.id;
                        break;
                    }
                }
                if (tabToSwitch) {
                    setActiveTabIndex(tabs.findIndex(tab => tab.id === tabToSwitch));
                }
            }
            return;
        }

        setIsSubmitting(true);
        try {
            await onSave(MarketListingForm);
            // onClose() will be called by parent after successful save
        } catch (error) {
            console.error('Failed to save service:', error);
            // Error message handled by parent
        } finally {
            setIsSubmitting(false);
        }
    };

    // Animation variants for modal
    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: "easeIn" } },
    };

    // Animation variants for tab content
    const tabContentVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } },
    };

    // Animation variants for individual form fields
    const fieldVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-6xl p-8 relative max-h-[95vh] flex flex-col transform-gpu"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 z-10 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-label="Close modal"
                        >
                            <XMarkIcon className="w-8 h-8" />
                        </button>

                        {/* Header */}
                        <h3 className="text-4xl font-extrabold mb-6 text-gray-900 dark:text-gray-100 leading-tight">
                            {initialData ? `Edit: ${initialData.name || 'Service Listing'}` : "Add New Service Listing"}
                        </h3>

                        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row flex-grow">
                            {/* Tabs Navigation (Left Sidebar - Desktop Only) */}
                            <div className="hidden lg:block lg:w-1/4 p-6 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-bl-2xl lg:rounded-tl-2xl overflow-y-auto custom-scrollbar">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Service Setup</h3>
                                <nav className="space-y-2">
                                    {tabs.map((tab, index) => (
                                        <motion.button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setActiveTabIndex(index)} // Navigate by index
                                            className={`
                                                w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium transition-all duration-200
                                                ${activeTabIndex === index
                                                    ? 'font-bold'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }
                                            `}
                                            style={{
                                                backgroundColor: activeTabIndex === index ? `${primaryColor}1A` : '',
                                                color: activeTabIndex === index ? primaryColor : '',
                                            }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            aria-current={activeTabIndex === index ? 'page' : undefined}
                                        >
                                            <tab.icon className="w-5 h-5" />
                                            {tab.name}
                                            {/* Error indicator for tab */}
                                            {tab.fields.some(field => errors[field as keyof MarketListingForm]) ||
                                             (tab.id === 'pricing' && (errors['pricingTiers[0].name'] || errors['pricingTiers[0].price'])) || // Specific check for nested errors
                                             (tab.id === 'availability' && (errors['bookingSlots[0].date'] || errors['bookingSlots[0].time'] || errors['bookingSlots[0].capacity']))
                                            ? (
                                                <span className="ml-auto text-red-500 text-xs font-bold">!</span>
                                            ) : null}
                                        </motion.button>
                                    ))}
                                </nav>
                            </div>

                            {/* Form Content (Right Section) */}
                            <div className="flex-1 p-8 lg:p-10 bg-white dark:bg-gray-800 rounded-br-2xl lg:rounded-tr-2xl overflow-y-auto custom-scrollbar">
                                <AnimatePresence mode="wait">
                                    {activeTabId === 'details' && (
                                        <ServiceDetailsTab
                                            MarketListingForm={MarketListingForm}
                                            handleChange={handleChange}
                                            errors={errors}
                                            fieldVariants={fieldVariants}
                                            tabContentVariants={tabContentVariants}
                                            primaryColor={primaryColor}
                                            // sellers={sellers}
                                            // companies={companies}
                                        />
                                    )}

                                    {activeTabId === 'productcategory' && (
                                        <ServiceCategoryTab
                                            MarketListingForm={MarketListingForm}
                                            handleChange={handleChange}
                                            errors={errors}
                                            fieldVariants={fieldVariants}
                                            tabContentVariants={tabContentVariants}
                                            primaryColor={primaryColor}
                                            productCategories={categories}
                                        />
                                    )}

                                    {activeTabId === 'pricing' && (
                                        <ServicePricingTab
                                            MarketListingForm={MarketListingForm}
                                            handleChange={handleChange}
                                            handleArrayFieldChange={handleArrayFieldChange}
                                            handleAddPricingTier={handleAddPricingTier}
                                            handleUpdatePricingTier={handleUpdatePricingTier}
                                            handleRemovePricingTier={handleRemovePricingTier}
                                            errors={errors}
                                            fieldVariants={fieldVariants}
                                            tabContentVariants={tabContentVariants}
                                            primaryColor={primaryColor}
                                        />
                                    )}

                                    {activeTabId === 'service' && (
                                        <ServiceSpecificsTab
                                            MarketListingForm={MarketListingForm}
                                            handleChange={handleChange}
                                            handleArrayFieldChange={handleArrayFieldChange}
                                            errors={errors}
                                            fieldVariants={fieldVariants}
                                            tabContentVariants={tabContentVariants}
                                            primaryColor={primaryColor}
                                        />
                                    )}

                                    {activeTabId === 'availability' && (
                                        <ServiceAvailabilityTab
                                            MarketListingForm={MarketListingForm}
                                            handleChange={handleChange}
                                            handleAddBookingSlot={handleAddBookingSlot}
                                            handleUpdateBookingSlot={handleUpdateBookingSlot}
                                            handleRemoveBookingSlot={handleRemoveBookingSlot}
                                            errors={errors}
                                            fieldVariants={fieldVariants}
                                            tabContentVariants={tabContentVariants}
                                            primaryColor={primaryColor}
                                        />
                                    )}

                                    {activeTabId === 'media' && (
                                        <ServiceMediaTab
                                            MarketListingForm={MarketListingForm}
                                            handleChange={handleChange}
                                            errors={errors}
                                            fieldVariants={fieldVariants}
                                            tabContentVariants={tabContentVariants}
                                            primaryColor={primaryColor}
                                        />
                                    )}

                                    {activeTabId === 'contactLocation' && (
                                        <ServiceContactLocationTab
                                            MarketListingForm={MarketListingForm}
                                            handleChange={handleChange}
                                            errors={errors}
                                            fieldVariants={fieldVariants}
                                            tabContentVariants={tabContentVariants}
                                            primaryColor={primaryColor}
                                            deliveryMethods={deliveryMethods}
                                            paymentOptions={paymentOptions}
                                        />
                                    )}

                                    {activeTabId === 'advanced' && (
                                        <ServiceAdvancedOptionsTab
                                            MarketListingForm={MarketListingForm}
                                            handleChange={handleChange}
                                            handleArrayFieldChange={handleArrayFieldChange}
                                            errors={errors}
                                            fieldVariants={fieldVariants}
                                            tabContentVariants={tabContentVariants}
                                            primaryColor={primaryColor}
                                        />
                                    )}
                                </AnimatePresence>

                                {/* Form Actions (Navigation Buttons) */}
                                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between gap-4">
                                    {/* Previous Button */}
                                    {!isFirstTab && (
                                        <button
                                            type="button"
                                            onClick={handlePreviousTab}
                                            className="px-6 py-3 rounded-lg text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                                        >
                                            <ArrowLeftIcon className="w-5 h-5" /> Previous
                                        </button>
                                    )}

                                    {/* Spacer for alignment if only Next/Submit is present */}
                                    {isFirstTab && !isLastTab && <div className="flex-grow"></div>}

                                    {/* Cancel Button (Always visible) */}
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-6 py-3 rounded-lg text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>

                                    {/* Next or Submit Button */}
                                    {isLastTab ? (
                                        <button
                                            type="submit"
                                            className="px-6 py-3 rounded-lg text-white font-semibold transition-colors shadow-md flex items-center justify-center"
                                            style={{ backgroundColor: primaryColor }}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting && (
                                                <svg className="animate-spin h-5 w-5 text-white mr-3" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            )}
                                            {initialData ? 'Update Service' : 'Create Service'}
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleNextTab}
                                            className="px-6 py-3 rounded-lg text-white font-semibold transition-colors shadow-md flex items-center gap-2"
                                            style={{ backgroundColor: primaryColor }}
                                            disabled={isSubmitting}
                                        >
                                            Next <ArrowRightIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ServiceListingForm;
