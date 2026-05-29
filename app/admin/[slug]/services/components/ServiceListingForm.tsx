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
    ArrowPathIcon,
    CheckCircleIcon, // For loading spinner
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

// Import child components
import ServiceDetailsTab from './ServiceDetailsTab';
import ServiceCategoryTab from './ServiceCategoryTab';
import ServicePricingTab from './ServicePricingTab';
import ServiceSpecificsTab from './ServiceSpecificsTab';
import ServiceAvailabilityTab from './ServiceAvailabilityTab';
// import ServiceMediaTab from './ServiceMediaTab';
import ImageUploader from '@/components/ImageUploader';
import ServiceContactLocationTab from './ServiceContactLocationTab';
import ServiceAdvancedOptionsTab from './ServiceAdvancedOptionsTab';
import { IStoreCategory, ListingMarketStatus, ListingSystemStatus, MarketListingForm } from '@/types/typings';
import { ListingTransactionType } from '@prisma/client';

// --- Type Definitions (Centralized) ---
export type SellerType = "INDIVIDUAL" | "COMPANY";
export type ListingStatus = "ACTIVE" | "PENDING" | "REJECTED" | "ARCHIVED";



// Animation Variants
const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
};

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
        opacity: 1, 
        scale: 1, 
        y: 0,
        transition: { type: "spring", damping: 25, stiffness: 300 }
    },
    exit: { opacity: 0, scale: 0.95, y: 20 }
};

const contentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};


// NOTE: keep API constants consistent with your app's env
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

export interface BookingSlot {
    date: string;
    time: string;
    capacity: number;
}

export interface UnifiedMediaItem {
  id: string;
  title: string;
  author: string;
  coverPreviewUrl?: string | null;
  file?: File | null; // ✅ unified field
  fileName?: string;
  url?: string;
  source: "local" | "server";
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
    location: null,
    listingMarketStatus: ListingMarketStatus.AVAILABLE,
    listingSystemStatus: ListingSystemStatus.DRAFT,
    listingTransactionType: ListingTransactionType.SALE
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

////////////////////////////////////////////////////////////////////////////////
// Upload helper for getting signed URLs and uploading files
////////////////////////////////////////////////////////////////////////////////
// utils/uploadFiles.ts
export async function uploadFiles(
  files: File[],
  type: "image" | "video" | "book",
  onProgress?: (progress: number, file: File) => void
): Promise<{ url: string; key: string; contentType: string }[]> {
  if (!files?.length) return [];

  const uploads = files.map(async (file) => {
    try {
      // ✅ Step 1: Request a signed upload URL from your API
      const res = await fetch(
        `${apiBaseUrl}/upload-url?filename=${encodeURIComponent(file.name)}&type=${type}&contentType=${encodeURIComponent(file.type)}`
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to get signed URL: ${text}`);
      }

      const { uploadUrl, publicUrl, key, contentType } = await res.json();

      // ✅ Step 2: Upload directly to S3
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress, file);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) resolve();
          else reject(new Error(`Upload failed for ${file.name}: ${xhr.status}`));
        };

        xhr.onerror = () => reject(new Error(`Network error during upload for ${file.name}`));
        xhr.send(file);
      });

    //   console.log(`✅ Uploaded: ${file.name} (${contentType}) → ${publicUrl}`);
      return { url: publicUrl, key, contentType };
    } catch (err) {
      console.error("❌ Upload error:", err);
      throw err;
    }
  });

  return Promise.all(uploads);
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

     // Unified media states with proper initialization from existing product data
      const [images, setImages] = useState<UnifiedMediaItem[]>(
        initialData?.images?.map((img: any, idx: number) => ({ 
          id: img.url || `server-img-${idx}`,
          url: typeof img === 'string' ? img : img.url, 
          source: 'server' as const,
          title: "Untitled Image",
          author: "Unknown",
        })) || []
      );
      const [videos, setVideos] = useState<UnifiedMediaItem[]>(
        initialData?.videos?.map((vid: any, idx: number) => ({ 
          id: vid.url || `server-vid-${idx}`,
          url: typeof vid === 'string' ? vid : vid.url, 
          source: 'server' as const,
          title: "Untitled Video",
          author: "Unknown",
        })) || []
      );
      const [books, setBooks] = useState<UnifiedMediaItem[]>(
        initialData?.ebooks?.map((book: any, idx: number) => ({
          id: book.url || `server-book-${idx}`,
          url: typeof book === 'string' ? book : book.url,
          source: 'server' as const,
          title: book.title || "Untitled Book",
          author: book.author || "Unknown",
        })) || []
      );

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
            } 
            // else if (name === 'images') {
            //     // Special handling for images array, assuming value is already an array of strings
            //     (newFormData as any)[name] = value as unknown as string[];
            // } 
            else if (type === 'number') {
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
        // if (MarketListingForm.sellingPrice <= 0) newErrors.sellingPrice = 'Selling Price must be positive.';
        // if (MarketListingForm.buyingPrice <= 0) newErrors.buyingPrice = 'Buying Price must be positive.';

        MarketListingForm.pricingTiers?.forEach((tier, index) => {
            if (!tier.name.trim()) newErrors[`pricingTiers[${index}].name`] = 'Tier name is required.';
            if (tier.price < 0) newErrors[`pricingTiers[${index}].price`] = 'Price cannot be negative.';
        });

        // Service Specifics Tab
        // if (MarketListingForm.hourlyRate !== undefined && MarketListingForm.hourlyRate < 0) newErrors.hourlyRate = 'Hourly Rate cannot be negative.';
        // if (MarketListingForm.minimumHours !== undefined && MarketListingForm.minimumHours < 0) newErrors.minimumHours = 'Minimum Hours cannot be negative.';
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
        // if (MarketListingForm.providerRating !== undefined && (MarketListingForm.providerRating < 1 || MarketListingForm.providerRating > 5)) {
        //     newErrors.providerRating = 'Rating must be between 1 and 5.';
        // }

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
            // console.log("Validation failed for current tab. Cannot proceed.");
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
            // 1. Filter local files that need uploading
                    const newImageItems = images.filter(i => i.source === "local" && i.file);
                    const newVideoItems = videos.filter(v => v.source === "local" && v.file);
                    const newBookItems = books.filter(b => b.source === "local" && b.file);
            
                    // 2. Create upload promises for new files
                    const uploadImagePromises = newImageItems.map(item =>
                      uploadFiles([item.file!], "image", (progress, file) => {
                        // console.log(`Uploading image ${file.name}: ${progress}%`);
                      }).then(result => ({ id: item.id, url: result[0].url }))
                    );
            
                    const uploadVideoPromises = newVideoItems.map(item =>
                      uploadFiles([item.file!], "video", (progress, file) => {
                        // console.log(`Uploading video ${file.name}: ${progress}%`);
                      }).then(result => ({ id: item.id, url: result[0].url }))
                    );
            
                    const uploadBookPromises = newBookItems.map(item =>
                      uploadFiles([item.file!], "book", (progress, file) => {
                        // console.log(`Uploading book ${file.name}: ${progress}%`);
                      }).then(result => ({ id: item.id, url: result[0].url }))
                    );
            
                    // 3. Run all uploads in parallel
                    const [uploadedImages, uploadedVideos, uploadedBooks] = await Promise.all([
                      Promise.all(uploadImagePromises),
                      Promise.all(uploadVideoPromises),
                      Promise.all(uploadBookPromises),
                    ]);
            
                    // 4. Create lookup maps for quick access
                    const imageUrlMap = new Map(uploadedImages.map(i => [i.id, i.url]));
                    const videoUrlMap = new Map(uploadedVideos.map(v => [v.id, v.url]));
                    const bookUrlMap = new Map(uploadedBooks.map(b => [b.id, b.url]));
            
                    // 5. Build final URL arrays (server + newly uploaded)
                    const finalImageUrls = images
                      .map(img => (img.source === "server" ? img.url : imageUrlMap.get(img.id)!))
                      .filter(Boolean);
            
                    const finalVideoUrls = videos
                      .map(vid => (vid.source === "server" ? vid.url : videoUrlMap.get(vid.id)!))
                      .filter(Boolean);
            
                    const finalBookUrls = books
                      .map(book => (book.source === "server" ? book.url : bookUrlMap.get(book.id)!))
                      .filter(Boolean);
            
            
                    // 6. Build final payload
                    const payload = { ...MarketListingForm, images: finalImageUrls, videos: finalVideoUrls, ebooks: finalBookUrls };
                    await onSave(payload);
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

    // Calculate Progress for Mobile Bar
    const progress = ((activeTabIndex + 1) / tabs.length) * 100;

    return (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-0 overflow-hidden sm:p-4 lg:p-6"
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                {/* Backdrop with Blur */}
                <motion.div 
                    className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
                    variants={overlayVariants}
                    onClick={onClose}
                />

                {/* Modal Card */}
                <motion.div
                    className="relative w-full max-w-6xl h-[100dvh] sm:h-[90vh] bg-white dark:bg-slate-900 sm:rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-gray-100 dark:border-slate-800"
                    variants={modalVariants}
                >
                    
                    {/* --------------------------------------------------------- */}
                    {/* SIDEBAR (Desktop) / TOPBAR (Mobile)                       */}
                    {/* --------------------------------------------------------- */}
                    
                    {/* Mobile Header & Progress (Fixed at top) */}
                    <div className="flex-shrink-0 bg-white border-b border-gray-100 md:hidden dark:bg-slate-900 dark:border-slate-800 z-20">
                        <div className="flex items-center justify-between p-4">
                            <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white truncate max-w-[70%]">
                                {initialData ? 'Edit Service' : 'New Service'}
                            </h3>
                            <button 
                                type="button"
                                onClick={onClose} 
                                className="p-2 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 bg-gray-50 dark:bg-slate-800 rounded-xl transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="flex gap-6 px-4 pb-3 overflow-x-auto snap-x hide-scrollbar">
                            {tabs.map((tab, index) => {
                                const isActive = activeTabIndex === index;
                                const hasError = tab.fields?.some(field => errors[field]);
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTabIndex(index)}
                                        className={`flex flex-col items-center flex-shrink-0 snap-center transition-all ${
                                            isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600'
                                        }`}
                                    >
                                        <div className={`relative p-2.5 rounded-xl mb-1 transition-all ${
                                            isActive 
                                                ? 'bg-indigo-50 dark:bg-indigo-950/50 ring-2 ring-indigo-600 dark:ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' 
                                                : 'bg-gray-50 dark:bg-slate-800/60'
                                        }`}>
                                            <tab.icon className="w-5 h-5" />
                                            {hasError && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900" />}
                                        </div>
                                        <span className="text-[10px] font-semibold uppercase tracking-wider">{tab.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                        
                        <div className="h-1 w-full bg-gray-100 dark:bg-slate-800">
                            <motion.div 
                                className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-r-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ ease: "easeInOut", duration: 0.3 }}
                            />
                        </div>
                    </div>

                    {/* Desktop Sidebar (Independent Scroll) */}
                    <div className="hidden md:flex flex-col w-1/4 bg-gray-50/70 dark:bg-slate-900/40 border-r border-gray-100 dark:border-slate-800 p-8 overflow-y-auto custom-scrollbar">
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                            {initialData ? 'Edit Service' : 'Create Service'}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mb-8">
                            Complete the steps below to publish your listing.
                        </p>

                        <nav className="space-y-1.5 relative">
                            <div className="absolute left-[1.4rem] top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-slate-800 -z-10" />
                            {tabs.map((tab, index) => {
                                const isActive = activeTabIndex === index;
                                const isCompleted = index < activeTabIndex;
                                const hasError = tab.fields?.some(field => errors[field]);

                                return (
                                    <motion.button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTabIndex(index)}
                                        className={`group w-full flex items-center gap-4 p-3 rounded-xl transition-all relative overflow-hidden ${
                                            isActive 
                                                ? 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm' 
                                                : 'hover:bg-gray-100/70 dark:hover:bg-slate-800/40 border border-transparent'
                                        }`}
                                    >
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border flex-shrink-0 transition-all ${
                                            isActive ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-600/10' 
                                            : isCompleted ? 'border-emerald-500 bg-emerald-500 text-white'
                                            : hasError ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-500'
                                            : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-400 dark:text-slate-500 group-hover:border-gray-300'
                                        }`}>
                                            {isCompleted ? <CheckCircleIcon className="w-5 h-5" /> : <tab.icon className="w-4 h-4" />}
                                        </div>
                                        <div className="text-left">
                                            <p className={`text-sm font-semibold transition-colors ${
                                                isActive ? 'text-indigo-600 dark:text-white' : 'text-gray-500 dark:text-slate-400 group-hover:text-gray-800 dark:group-hover:text-slate-200'
                                            }`}>
                                                {tab.name}
                                            </p>
                                        </div>
                                        {isActive && (
                                            <motion.div 
                                                layoutId="activeTabIndicator" 
                                                className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 dark:bg-indigo-500 rounded-l-xl" 
                                            />
                                        )}
                                    </motion.button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* --------------------------------------------------------- */}
                    {/* MAIN CONTENT AREA                                         */}
                    {/* --------------------------------------------------------- */}
                    
                    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 relative overflow-hidden">
                        
                        {/* Desktop Close Button */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="hidden md:flex absolute top-6 right-6 z-30 p-2.5 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>

                        {/* Scrollable Form Area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12">
                            <div className="max-w-3xl mx-auto pb-24">
                                <div className="mb-8 border-b border-gray-50 dark:border-slate-800/60 pb-6">
                                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
                                        {tabs[activeTabIndex].name}
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-slate-400">
                                        Please provide the details below.
                                    </p>
                                </div>

                                 <form id="service-form" onSubmit={handleSubmit}>
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeTabId}
                                            variants={contentVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            className="space-y-6"
                                        >
                                            {activeTabId === 'details' && (
                                                <ServiceDetailsTab
                                                    MarketListingForm={MarketListingForm}
                                                    handleChange={handleChange}
                                                    errors={errors}
                                                    fieldVariants={fieldVariants}
                                                    tabContentVariants={tabContentVariants}
                                                    primaryColor={primaryColor}
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
                                                <ImageUploader
                                                    images={images}
                                                    setImages={setImages}
                                                    videos={videos}
                                                    setVideos={setVideos}
                                                    books={books}
                                                    setBooks={setBooks}
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
                                        </motion.div>
                                    </AnimatePresence>
                                </form>
                            </div>
                        </div>

                        {/* Sticky Footer (Shrink-0 ensures it stays visible) */}
                        <div className="shrink-0 p-4 md:p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-gray-100 dark:border-slate-800/80 flex justify-between items-center z-20">
                            <button 
                                type="button" 
                                disabled={isFirstTab}
                                onClick={() => setActiveTabIndex(prev => prev - 1)}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white disabled:opacity-35 transition-opacity"
                            >
                                <ArrowLeftIcon className="w-4 h-4" /> Back
                            </button>

                            {isLastTab ? (
                                <button 
                                    type="submit"
                                    form="service-form"
                                    onClick={handleSubmit} 
                                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-600/10 transition-colors"
                                >
                                    {isSubmitting ? "Saving..." : "Complete Setup"}
                                </button>
                            ) : (
                                <button 
                                    type="button" 
                                    onClick={() => setActiveTabIndex(prev => prev + 1)}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-600/10 transition-colors"
                                >
                                    Next Step <ArrowRightIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);
};

export default ServiceListingForm;
