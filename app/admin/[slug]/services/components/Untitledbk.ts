"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XMarkIcon,
    InformationCircleIcon,
    CubeIcon, // More fitting for category
    TagIcon, // More fitting for pricing
    WrenchScrewdriverIcon, // For Service Specifics
    CalendarDaysIcon, // For Availability
    PhotoIcon,
    MapPinIcon,
    Cog6ToothIcon, // For Advanced Options
    PlusIcon, // For adding items
    MinusIcon, // For general checkboxes
} from '@heroicons/react/24/outline';
import Image from 'next/image'; // Assuming Image component is available if needed for media previews
import { useStoreContext } from '@/contexts/StoreContext'; // Assuming this context provides themeSettings and storeCategories

// Define your SellerType and ListingStatus enums or types based on your backend
type SellerType = "INDIVIDUAL" | "COMPANY";
type ListingStatus = "ACTIVE" | "PENDING" | "REJECTED" | "ARCHIVED";

// Define form data interface
interface BookingSlot {
    date: string;
    time: string;
    capacity: number;
}

interface PricingTier {
    name: string;
    price: number;
    duration?: string; // e.g., "1 hour", "Monthly"
    description?: string;
    features: string[]; // Array of strings for features
}

interface FormData {
    id?: string; // Optional for create mode
    name: string;
    description: string;
    productCategoryId: string;
    sellerId?: string;
    companyId?: string;
    sellerType?: SellerType;
    sellingPrice: number;
    buyingPrice: number;
    profitMargin?: number;
    tax?: number;
    shippingCost?: number;
    discount?: number;
    quantity?: number; // e.g., number of seats, units
    serviceSchedule?: string; // e.g., "Mon-Fri, 9am-5pm"
    hourlyRate?: number;
    minimumHours?: number;
    minNoticePeriod?: string; // e.g., "24 hours"
    maxBookingAhead?: string; // e.g., "30 days"
    totalCapacity?: number; // Overall capacity for the service
    deliveryMethod?: string;
    fulfillmentStatus?: string;
    providerRating?: number;
    bookingSlots: BookingSlot[];
    pricingTiers: PricingTier[];
    tags: string[]; // For SEO or advanced filtering
    amenities: string[]; // e.g., "Free Wi-Fi", "Parking"
    requiredClientInfo: string[]; // e.g., "Phone Number", "Address"
    images: string[]; // URLs of uploaded images
    video?: string; // URL of video
    contactName?: string;
    contact?: string; // Phone number
    email?: string;
    locationName?: string;
    latitude?: number;
    longitude?: number;
    isAvailable: boolean;
    isOnOffer: boolean;
    isFlashDeal: boolean;
    isNewArrival: boolean;
    isDiscounted: boolean;
    isFeatured: boolean;
    startDealDate?: string; // Changed to string for input type="datetime-local"
    endDealDate?: string;   // Changed to string
    availabilityStart?: string; // Changed to string
    availabilityEnd?: string;   // Changed to string
    delivery: boolean;
    showOnGhuba?: boolean;
    paymentOption?: string; // Changed to optional
    status: ListingStatus;
}

// Dummy initial form data for demonstration
const initialFormData: FormData = {
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
};

// Mock data for dropdowns if not provided by context
const mockProductCategories = [
    { id: 'cat1', displayName: 'Home Cleaning', icon: '🧹', category: { name: 'Home Cleaning' } },
    { id: 'cat2', displayName: 'Office Cleaning', icon: '🏢', category: { name: 'Office Cleaning' } },
    { id: 'cat3', displayName: 'Deep Cleaning', icon: '🧼', category: { name: 'Deep Cleaning' } },
    { id: 'cat4', displayName: 'Window Cleaning', icon: '🪟', category: { name: 'Window Cleaning' } },
];
// const mockSellers = [{ id: 's1', name: 'CleanPro Team' }, { id: 's2', name: 'Sparkle Solutions' }];
// const mockCompanies = [{ id: 'c1', name: 'Elite Services Inc.' }, { id: 'c2', name: 'Urban Cleaners' }];
const mockDeliveryMethods = ['In-person', 'Online', 'Hybrid'];
const mockPaymentOptions = ['Credit Card', 'Cash', 'Bank Transfer'];


// Main component props
interface ServiceListingFormProps {
    isOpen: boolean; // Controls modal visibility
    onClose: () => void; // Function to close the modal
    onSave: (data: FormData) => void; // Function to save the form data
    initialData?: FormData | null; // Data for editing an existing service
}

const ServiceListingForm: React.FC<ServiceListingFormProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const { storeFormData } = useStoreContext(); // Access context for dynamic data
    const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0d9488'; // Teal fallback
    const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#f97316'; // Orange fallback

    const [formData, setFormData] = useState<FormData>(initialData || initialFormData);
    const [activeTab, setActiveTab] = useState('details');
    const [errors, setErrors] = useState<Partial<FormData & { [key: string]: string }>>({}); // For nested errors
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Use actual store categories or mock if context not available
    const productCategories = storeFormData?.storeCategories || mockProductCategories;
    // const sellers = mockSellers; // Replace with actual sellers from your data
    // const companies = mockCompanies; // Replace with actual companies from your data
    const deliveryMethods = mockDeliveryMethods; // Replace with actual delivery methods
    const paymentOptions = mockPaymentOptions; // Replace with actual payment options

    // Effect to update form data when initialData prop changes (for edit mode)
    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData(initialFormData);
        }
        // Reset to first tab and clear errors when modal opens/changes data
        setActiveTab('details');
        setErrors({});
    }, [initialData, isOpen]); // Re-run when initialData or isOpen changes

    // Generic handleChange for most inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        // Clear error for the field being changed
        if (errors[name as keyof FormData]) {
            setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
        }
    };

    // Handler for array fields (comma-separated strings)
    const handleArrayFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, fieldName: keyof FormData) => {
        const value = e.target.value;
        setFormData((prev) => ({
            ...prev,
            [fieldName]: value.split(',').map(item => item.trim()).filter(item => item !== ''),
        }));
        if (errors[fieldName as keyof FormData]) {
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
                updatedTiers[index] = { ...updatedTiers[index], [field]: typeof value === 'string' ? value.split(',').map(f => f.trim()).filter(f => f !== '') : value };
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
    const validateForm = () => {
        let newErrors: Partial<FormData & { [key: string]: string }> = {};

        // Details Tab
        if (!formData.title.trim()) newErrors.title = 'Listing Title is required.';
        if (!formData.description.trim()) newErrors.description = 'Description is required.';

        // Category Tab
        if (!formData.productCategoryId.trim()) newErrors.productCategoryId = 'Category is required.';

        // Pricing Tab
        if (formData.sellingPrice <= 0) newErrors.sellingPrice = 'Selling Price must be positive.';
        if (formData.buyingPrice <= 0) newErrors.buyingPrice = 'Buying Price must be positive.';
        formData.pricingTiers?.forEach((tier, index) => {
            if (!tier.name.trim()) newErrors[`pricingTiers[${index}].name`] = 'Tier name is required.';
            if (tier.price < 0) newErrors[`pricingTiers[${index}].price`] = 'Price cannot be negative.';
        });

        // Service Specifics Tab
        if (formData.hourlyRate && formData.hourlyRate < 0) newErrors.hourlyRate = 'Hourly Rate cannot be negative.';
        if (formData.minimumHours && formData.minimumHours < 0) newErrors.minimumHours = 'Minimum Hours cannot be negative.';

        // Availability Tab
        formData.bookingSlots?.forEach((slot, index) => {
            if (!slot.date) newErrors[`bookingSlots[${index}].date`] = 'Date is required.';
            if (!slot.time) newErrors[`bookingSlots[${index}].time`] = 'Time is required.';
            if (slot.capacity <= 0) newErrors[`bookingSlots[${index}].capacity`] = 'Capacity must be positive.';
        });
        if (formData.availabilityStart && formData.availabilityEnd && new Date(formData.availabilityStart) >= new Date(formData.availabilityEnd)) {
            newErrors.availabilityStart = 'Start date must be before end date.';
            newErrors.availabilityEnd = 'End date must be after start date.';
        }
        if (formData.startDealDate && formData.endDealDate && new Date(formData.startDealDate) >= new Date(formData.endDealDate)) {
            newErrors.startDealDate = 'Deal start date must be before end date.';
            newErrors.endDealDate = 'Deal end date must be after start date.';
        }


        // Contact & Location Tab
        if (formData.contact && !/^\+?[0-9\s\-()]{7,20}$/.test(formData.contact)) newErrors.contact = 'Invalid phone number format.';
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            console.error('Form has validation errors:', errors);
            // Find the first tab with an error and switch to it
            const firstErrorField = Object.keys(errors)[0];
            if (firstErrorField) {
                const errorTabMap: { [key: string]: string } = {
                    title: 'details', description: 'details',
                    productCategoryId: 'productcategory',
                    sellingPrice: 'pricing', buyingPrice: 'pricing', pricingTiers: 'pricing',
                    hourlyRate: 'service', minimumHours: 'service',
                    bookingSlots: 'availability', availabilityStart: 'availability', availabilityEnd: 'availability',
                    startDealDate: 'availability', endDealDate: 'availability',
                    contact: 'contactLocation', email: 'contactLocation',
                };
                const tabToSwitch = Object.keys(errorTabMap).find(key => firstErrorField.startsWith(key));
                if (tabToSwitch && errorTabMap[tabToSwitch]) {
                    setActiveTab(errorTabMap[tabToSwitch]);
                }
            }
            return;
        }

        setIsSubmitting(true);
        try {
            await onSave(formData); // Call the parent save function
            // Optionally, show a success message
            console.log('Form saved successfully!');
            onClose(); // Close modal on success
        } catch (error) {
            console.error('Failed to save service:', error);
            // Optionally, show an error message to the user
        } finally {
            setIsSubmitting(false);
        }
    };

    // Tab data for rendering
    const tabs = [
        { id: 'details', name: 'Listing Details', icon: InformationCircleIcon },
        { id: 'productcategory', name: 'Pick Category', icon: CubeIcon },
        { id: 'pricing', name: 'Pricing & Tiers', icon: TagIcon },
        { id: 'service', name: 'Service Specifics', icon: WrenchScrewdriverIcon },
        { id: 'availability', name: 'Availability & Deals', icon: CalendarDaysIcon },
        { id: 'media', name: 'Media', icon: PhotoIcon },
        { id: 'contactLocation', name: 'Contact & Location', icon: MapPinIcon },
        { id: 'advanced', name: 'Advanced Options', icon: Cog6ToothIcon },
    ];

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

    if (!isOpen) return null; // Only render if modal is open

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-auto " // Added overflow-auto for smaller screens
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-6xl p-8 relative max-h-[95vh] flex flex-col transform-gpu overflow-x-scroll" // Increased max-width
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
                            {/* Tabs Navigation (Left Sidebar) */}
                            <div className="lg:w-1/4 p-6 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-bl-2xl lg:rounded-tl-2xl overflow-y-auto custom-scrollbar">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 hidden lg:block">Service Setup</h3> {/* Hidden on mobile */}
                                <nav className="space-y-2">
                                    {tabs.map((tab) => (
                                        <motion.button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`
                                                w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium transition-all duration-200
                                                ${activeTab === tab.id
                                                    ? 'font-bold'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }
                                            `}
                                            style={{
                                                backgroundColor: activeTab === tab.id ? `${primaryColor}1A` : '', // Subtle background for active tab
                                                color: activeTab === tab.id ? primaryColor : '', // Primary color for active text
                                            }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            aria-current={activeTab === tab.id ? 'page' : undefined}
                                        >
                                            <tab.icon className="w-5 h-5" />
                                            {tab.name}
                                            {/* Error indicator for tab */}
                                            {Object.keys(errors).some(key => key.includes(tab.id) || (tab.id === 'details' && (key === 'title' || key === 'description')) || (tab.id === 'productcategory' && key === 'productCategoryId') || (tab.id === 'pricing' && (key.includes('sellingPrice') || key.includes('buyingPrice') || key.includes('pricingTiers')) ) || (tab.id === 'service' && (key.includes('hourlyRate') || key.includes('minimumHours'))) || (tab.id === 'availability' && (key.includes('bookingSlots') || key.includes('availabilityStart') || key.includes('availabilityEnd') || key.includes('startDealDate') || key.includes('endDealDate'))) || (tab.id === 'contactLocation' && (key.includes('contact') || key.includes('email')))) && (
                                                <span className="ml-auto text-red-500 text-xs font-bold">!</span>
                                            )}
                                        </motion.button>
                                    ))}
                                </nav>
                            </div>

                            {/* Form Content (Right Section) */}
                            <div className="flex-1 p-8 lg:p-10 bg-white dark:bg-gray-800 rounded-br-2xl lg:rounded-tr-2xl overflow-y-auto custom-scrollbar">
                                <AnimatePresence mode="wait">
                                    {activeTab === 'details' && (
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
                                                    name="title"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                    className={`mt-1 block w-full rounded-lg border ${errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                                                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                                    placeholder="E.g., Premium Car Wash Service"
                                                />
                                                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                                            </motion.label>

                                            <motion.label className="block" variants={fieldVariants}>
                                                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Description <span className="text-red-500">*</span></span>
                                                <textarea
                                                    name="description"
                                                    value={formData.description || ""}
                                                    onChange={handleChange}
                                                    required
                                                    rows={5}
                                                    className={`mt-1 block w-full rounded-lg border ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                                                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                                    placeholder="Provide a detailed description of your service, its benefits, and what clients can expect."
                                                ></textarea>
                                                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                                            </motion.label>

                                        </motion.section>
                                    )}

                                    {activeTab === 'productcategory' && (
                                        <motion.section
                                            key="productcategory"
                                            variants={tabContentVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            className="space-y-6"
                                        >
                                            <h4 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Pick Category</h4>
                                            <motion.label className="block" variants={fieldVariants}>
                                                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Service Category <span className="text-red-500">*</span></span>
                                                <div className="relative mt-1">
                                                    <select
                                                        name="productCategoryId"
                                                        className={`block w-full rounded-lg border ${errors.productCategoryId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} p-3 pr-10 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 appearance-none`}
                                                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                                        value={formData.productCategoryId}
                                                        onChange={handleChange}
                                                        required
                                                    >
                                                        <option value="" disabled>Select a category</option>
                                                        {productCategories
                                                            .filter(cat => cat.visible !== false) // Only show visible categories if 'visible' property exists
                                                            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) // Sort by sortOrder if it exists
                                                            .map((cat) => (
                                                                <option key={cat.id} value={cat.id}>
                                                                    {cat.category?.icon} {cat.displayName || cat.category?.name}
                                                                </option>
                                                            ))}
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                                                        <svg className="fill-current h-4 w-4" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" viewBox="0 0 20 20">
                                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                {errors.productCategoryId && <p className="text-red-500 text-xs mt-1">{errors.productCategoryId}</p>}
                                            </motion.label>
                                        </motion.section>
                                    )}

                                    {activeTab === 'pricing' && (
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
                                                                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Duration (Optional, e.g., "1 hour", "Monthly")</span>
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
                                    )}

                                    {activeTab === 'service' && (
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
                                    )}

                                    {activeTab === 'availability' && (
                                        <motion.section
                                            key="availability"
                                            variants={tabContentVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            className="space-y-6"
                                        >
                                            <h4 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Availability & Deals</h4>
                                            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={fieldVariants}>
                                                <label className="block">
                                                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Overall Availability Start Date</span>
                                                    <input
                                                        type="datetime-local"
                                                        name="availabilityStart"
                                                        value={formData.availabilityStart || ''}
                                                        onChange={handleChange}
                                                        className={`mt-1 block w-full rounded-lg border ${errors.availabilityStart ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                                                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                                    />
                                                    {errors.availabilityStart && <p className="text-red-500 text-xs mt-1">{errors.availabilityStart}</p>}
                                                </label>
                                                <label className="block">
                                                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Overall Availability End Date</span>
                                                    <input
                                                        type="datetime-local"
                                                        name="availabilityEnd"
                                                        value={formData.availabilityEnd || ''}
                                                        onChange={handleChange}
                                                        className={`mt-1 block w-full rounded-lg border ${errors.availabilityEnd ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                                                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                                    />
                                                    {errors.availabilityEnd && <p className="text-red-500 text-xs mt-1">{errors.availabilityEnd}</p>}
                                                </label>
                                            </motion.div>

                                            <h5 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100 pt-6 border-t border-gray-200 dark:border-gray-700">Specific Booking Slots</h5>
                                            <AnimatePresence>
                                                {(formData.bookingSlots || []).map((slot, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 relative mb-4"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveBookingSlot(index)}
                                                            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                                            aria-label="Remove booking slot"
                                                        >
                                                            <MinusIcon className="w-5 h-5" />
                                                        </button>
                                                        <label className="block">
                                                            <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Date</span>
                                                            <input
                                                                type="date"
                                                                value={slot.date}
                                                                onChange={(e) => handleUpdateBookingSlot(index, 'date', e.target.value)}
                                                                className={`mt-1 block w-full rounded-lg border ${errors[`bookingSlots[${index}].date`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2`}
                                                                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                                            />
                                                            {errors[`bookingSlots[${index}].date`] && <p className="text-red-500 text-xs mt-1">{errors[`bookingSlots[${index}].date`]}</p>}
                                                        </label>
                                                        <label className="block">
                                                            <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Time</span>
                                                            <input
                                                                type="time"
                                                                value={slot.time}
                                                                onChange={(e) => handleUpdateBookingSlot(index, 'time', e.target.value)}
                                                                className={`mt-1 block w-full rounded-lg border ${errors[`bookingSlots[${index}].time`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2`}
                                                                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                                            />
                                                            {errors[`bookingSlots[${index}].time`] && <p className="text-red-500 text-xs mt-1">{errors[`bookingSlots[${index}].time`]}</p>}
                                                        </label>
                                                        <label className="block">
                                                            <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Capacity</span>
                                                            <input
                                                                type="number"
                                                                value={slot.capacity}
                                                                onChange={(e) => handleUpdateBookingSlot(index, 'capacity', parseInt(e.target.value))}
                                                                className={`mt-1 block w-full rounded-lg border ${errors[`bookingSlots[${index}].capacity`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2`}
                                                                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                                                min="1"
                                                            />
                                                            {errors[`bookingSlots[${index}].capacity`] && <p className="text-red-500 text-xs mt-1">{errors[`bookingSlots[${index}].capacity`]}</p>}
                                                        </label>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                            <button
                                                type="button"
                                                onClick={handleAddBookingSlot}
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:opacity-90 transition-opacity"
                                                style={{ backgroundColor: primaryColor }}
                                            >
                                                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                                Add Booking Slot
                                            </button>

                                            <h5 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100 pt-6 border-t border-gray-200 dark:border-gray-700">Deal & Offer Settings</h5>
                                            <motion.label className="flex items-center space-x-2 cursor-pointer" variants={fieldVariants}>
                                                <input
                                                    type="checkbox"
                                                    name="isOnOffer"
                                                    checked={formData.isOnOffer}
                                                    onChange={handleChange}
                                                    className="form-checkbox h-5 w-5 text-current rounded"
                                                    style={{ color: primaryColor }}
                                                />
                                                <span className="text-gray-700 dark:text-gray-300 font-medium">Is On Offer?</span>
                                            </motion.label>
                                            {formData.isOnOffer && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                                    <label className="block">
                                                        <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Deal Start Date</span>
                                                        <input
                                                            type="datetime-local"
                                                            name="startDealDate"
                                                            value={formData.startDealDate || ''}
                                                            onChange={handleChange}
                                                            className={`mt-1 block w-full rounded-lg border ${errors.startDealDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                                                            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                                        />
                                                        {errors.startDealDate && <p className="text-red-500 text-xs mt-1">{errors.startDealDate}</p>}
                                                    </label>
                                                    <label className="block">
                                                        <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Deal End Date</span>
                                                        <input
                                                            type="datetime-local"
                                                            name="endDealDate"
                                                            value={formData.endDealDate || ''}
                                                            onChange={handleChange}
                                                            className={`mt-1 block w-full rounded-lg border ${errors.endDealDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                                                            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                                        />
                                                        {errors.endDealDate && <p className="text-red-500 text-xs mt-1">{errors.endDealDate}</p>}
                                                    </label>
                                                    <label className="flex items-center space-x-2 cursor-pointer md:col-span-2">
                                                        <input
                                                            type="checkbox"
                                                            name="isFlashDeal"
                                                            checked={formData.isFlashDeal}
                                                            onChange={handleChange}
                                                            className="form-checkbox h-5 w-5 text-current rounded"
                                                            style={{ color: primaryColor }}
                                                        />
                                                        <span className="text-gray-700 dark:text-gray-300 font-medium">Is Flash Deal?</span>
                                                    </label>
                                                </motion.div>
                                            )}
                                            <motion.label className="flex items-center space-x-2 cursor-pointer mt-4" variants={fieldVariants}>
                                                <input
                                                    type="checkbox"
                                                    name="isNewArrival"
                                                    checked={formData.isNewArrival}
                                                    onChange={handleChange}
                                                    className="form-checkbox h-5 w-5 text-current rounded"
                                                    style={{ color: primaryColor }}
                                                />
                                                <span className="text-gray-700 dark:text-gray-300 font-medium">Is New Arrival?</span>
                                            </motion.label>
                                            <motion.label className="flex items-center space-x-2 cursor-pointer" variants={fieldVariants}>
                                                <input
                                                    type="checkbox"
                                                    name="isDiscounted"
                                                    checked={formData.isDiscounted}
                                                    onChange={handleChange}
                                                    className="form-checkbox h-5 w-5 text-current rounded"
                                                    style={{ color: primaryColor }}
                                                />
                                                <span className="text-gray-700 dark:text-gray-300 font-medium">Is Discounted?</span>
                                            </motion.label>
                                            <motion.label className="flex items-center space-x-2 cursor-pointer" variants={fieldVariants}>
                                                <input
                                                    type="checkbox"
                                                    name="isFeatured"
                                                    checked={formData.isFeatured}
                                                    onChange={handleChange}
                                                    className="form-checkbox h-5 w-5 text-current rounded"
                                                    style={{ color: primaryColor }}
                                                />
                                                <span className="text-gray-700 dark:text-gray-300 font-medium">Is Featured?</span>
                                            </motion.label>
                                        </motion.section>
                                    )}

                                    {activeTab === 'media' && (
                                        <motion.section
                                            key="media"
                                            variants={tabContentVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            className="space-y-6"
                                        >
                                            <h4 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Media & Images</h4>
                                            <motion.label className="block" variants={fieldVariants}>
                                                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Main Service Image URL</span>
                                                <input
                                                    type="text"
                                                    name="images[0]" // Assuming first image is main
                                                    value={formData.images[0] || ''}
                                                    onChange={(e) => {
                                                        const newImages = [...formData.images];
                                                        newImages[0] = e.target.value;
                                                        setFormData({ ...formData, images: newImages });
                                                    }}
                                                    className={`mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                                                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                                    placeholder="e.g., [https://example.com/main-service.jpg](https://example.com/main-service.jpg)"
                                                />
                                                <p className="text-gray-500 text-sm mt-1">Provide a URL for your main service image.</p>
                                                {formData.images[0] && (
                                                    <div className="mt-4 relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                                        <Image src={formData.images[0]} alt="Main Image Preview" layout="fill" objectFit="cover" />
                                                    </div>
                                                )}
                                            </motion.label>
                                            <motion.label className="block" variants={fieldVariants}>
                                                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Additional Images (comma-separated URLs)</span>
                                                <textarea
                                                    name="additionalImages" // Placeholder name, actual logic needed
                                                    value={formData.images.slice(1).join(', ') || ''}
                                                    onChange={(e) => {
                                                        const mainImage = formData.images[0] || '';
                                                        const additionalImages = e.target.value.split(',').map(item => item.trim()).filter(item => item !== '');
                                                        setFormData({ ...formData, images: [mainImage, ...additionalImages] });
                                                    }}
                                                    rows={3}
                                                    className={`mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                                                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                                    placeholder="e.g., url1.jpg, url2.jpg, url3.png"
                                                />
                                                <p className="text-gray-500 text-sm mt-1">Provide URLs for additional images, separated by commas.</p>
                                                {formData.images.slice(1).length > 0 && (
                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        {formData.images.slice(1).map((imgUrl, idx) => (
                                                            <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                                                <Image src={imgUrl} alt={`Additional Image ${idx + 1}`} layout="fill" objectFit="cover" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </motion.label>
                                            <motion.label className="block" variants={fieldVariants}>
                                                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Video URL (Optional)</span>
                                                <input
                                                    type="text"
                                                    name="video"
                                                    value={formData.video || ''}
                                                    onChange={handleChange}
                                                    className={`mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                                                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                                    placeholder="e.g., [https://youtube.com/watch?v=yourvideo](https://youtube.com/watch?v=yourvideo)"
                                                />
                                                <p className="text-gray-500 text-sm mt-1">Link to a YouTube or Vimeo video showcasing your service.</p>
                                            </motion.label>
                                        </motion.section>
                                    )}

                                    {activeTab === 'contactLocation' && (
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
                                    )}

                                    {activeTab === 'advanced' && (
                                        <motion.section
                                            key="advanced"
                                            variants={tabContentVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            className="space-y-6"
                                        >
                                            <h4 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Advanced Options</h4>
                                            <motion.label className="block" variants={fieldVariants}>
                                                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">SEO Tags (comma-separated)</span>
                                                <textarea
                                                    name="tags"
                                                    value={formData.tags.join(', ') || ''}
                                                    onChange={(e) => handleArrayFieldChange(e, 'tags')}
                                                    rows={2}
                                                    className={`mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                                                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                                    placeholder="e.g., cleaning, home, office, professional"
                                                />
                                            </motion.label>
                                            <motion.label className="block" variants={fieldVariants}>
                                                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Listing Status</span>
                                                <select
                                                    name="status"
                                                    value={formData.status}
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
                                            <motion.label className="flex items-center space-x-2 cursor-pointer mt-4" variants={fieldVariants}>
                                                <input
                                                    type="checkbox"
                                                    name="showOnGhuba"
                                                    checked={formData.showOnGhuba || false}
                                                    onChange={handleChange}
                                                    className="form-checkbox h-5 w-5 text-current rounded"
                                                    style={{ color: primaryColor }}
                                                />
                                                <span className="text-gray-700 dark:text-gray-300 font-medium">Show on Ghuba Marketplace?</span>
                                            </motion.label>
                                            <motion.label className="block" variants={fieldVariants}>
                                                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Provider Rating (Optional, 1-5)</span>
                                                <input
                                                    type="number"
                                                    name="providerRating"
                                                    step="0.1"
                                                    min="1"
                                                    max="5"
                                                    value={formData.providerRating || ''}
                                                    onChange={handleChange}
                                                    className={`mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                                                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                                    placeholder="e.g., 4.5"
                                                />
                                            </motion.label>
                                        </motion.section>
                                    )}
                                </AnimatePresence>

                                {/* Form Actions */}
                                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-6 py-3 rounded-lg text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
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
