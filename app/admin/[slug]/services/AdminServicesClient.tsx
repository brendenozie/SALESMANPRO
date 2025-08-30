"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PencilSquareIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  PlusIcon,
  ExclamationCircleIcon,
  EyeIcon,
  ArrowPathIcon, // For loading spinner
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useStoreContext } from "@/contexts/StoreContext";
import ServiceListingForm from "./components/ServiceListingForm";

// --- Type Definitions (aligned with ServiceListingFormRedesign's FormData) ---
export type ListingStatus = "ACTIVE" | "PENDING" | "REJECTED" | "ARCHIVED";
export type SellerType = "INDIVIDUAL" | "COMPANY";

interface BookingSlot {
  date: string;
  time: string;
  capacity: number;
}

interface PricingTier {
  name: string;
  description?: string;
  price: number;
  duration?: string;
  features: string[];
}

// Full FormData structure from ServiceListingFormRedesign
interface FormDataForPayload {
  id?: string;
  name: string;
  description: string;
  productCategoryId: string;
  sellerId?: string;
  companyId?: string;
  sellerType?: SellerType;
  sellingPrice: number;
  finalPrice: number;
  buyingPrice: number;
  profitMargin?: number;
  tax?: number;
  shippingCost?: number;
  discount?: number;
  quantity?: number;
  serviceSchedule?: string;
  hourlyRate?: number;
  minimumHours?: number;
  minNoticePeriod?: string;
  maxBookingAhead?: string;
  totalCapacity?: number;
  deliveryMethod?: string;
  fulfillmentStatus?: string;
  providerRating?: number;
  bookingSlots: BookingSlot[];
  pricingTiers: PricingTier[];
  tags: string[];
  amenities: string[];
  requiredClientInfo: string[];
  images: string[]; // Expecting string URLs
  video?: string; // Expecting string URL
  contactName?: string;
  contact?: string;
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
  startDealDate?: string; // Expecting string for datetime-local
  endDealDate?: string; // Expecting string for datetime-local
  availabilityStart?: string; // Expecting string for datetime-local
  availabilityEnd?: string; // Expecting string for datetime-local
  delivery: boolean;
  showOnGhuba?: boolean;
  paymentOption?: string;
  status: ListingStatus;
  // Note: createdAt and updatedAt are typically handled by backend
}

// ServiceItem interface for displaying in the list (should be compatible with FormDataForPayload)
export interface ServiceItem extends Omit<FormDataForPayload, 'startDealDate' | 'endDealDate' | 'availabilityStart' | 'availabilityEnd'> {
    // title: string;
    name: string;
    duration: JSX.Element;
    id: string; // ID is required for existing items
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    // Dates might come back as Date objects from backend, handle conversion if needed for display
    startDealDate?: Date | null | undefined;
    endDealDate?: Date | null | undefined;
    availabilityStart?: Date | null | undefined;
    availabilityEnd?: Date | null | undefined;
    // Add any other fields specific to the display in the list
    category?: { displayName?: string; name?: string; icon?: string }; // For category lookup
}

// Props for this AdminServicesClient component
interface Props {
  initialServices: ServiceItem[];
  productCategories: { id: string; name: string }[]; // Simplified for this component's use
  paymentOptions: string[];
  deliveryMethods: string[];
  sellers?: { id: string; name: string }[];
  companies?: { id: string; name: string }[];
  companyId?: string;
  categoriesData: any[]; // Full category data for ServiceListingForm
}

// Image loader for Next.js Image component
const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// --- Helper function to build the API payload ---
// This function maps the frontend FormData to the backend's expected MarketListingForm structure.
// It explicitly handles image and video URLs, as well as date formats.
function buildListingPayload(formData: FormDataForPayload): any {
  // Ensure dates are in ISO string format if they are Date objects for API
  // (Assuming formData already has them as strings from datetime-local inputs)
  const formatDateTimeForAPI = (dateString?: string) => {
    if (!dateString) return null;
    try {
      // Ensure it's a valid date string before converting
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date.toISOString();
    } catch (e) {
      console.error("Invalid date string for API payload:", dateString, e);
      return null;
    }
  };

  return {
    id: formData.id || undefined, // Only include ID if it's an update
    sellerType: formData.sellerType,
    companyId: formData.companyId,
    // productId: formData.productId, // If your backend uses productId, ensure it's in FormDataForPayload
    images: formData.images || [],
    video: formData.video || null,
    // books: [], // Not relevant for services, remove if not needed by backend
    name: formData.name, // Map frontend 'title' to backend 'name'
    description: formData.description,
    quantity: formData.quantity,
    productCategoryId: formData.productCategoryId,
    // category: formData.category?.displayName || '', // Backend might prefer just ID
    // subCategory: formData.subCategory,
    // subCategoryName: formData.subCategoryName,
    tags: formData.tags || [],
    // brand: formData.brand, // Not relevant for services
    // model: formData.model, // Not relevant for services
    // color: formData.color, // Not relevant for services
    // size: formData.size, // Not relevant for services
    // weight: formData.weight, // Not relevant for services
    // condition: formData.condition, // Not relevant for services
    // dimension: formData.dimension, // Not relevant for services
    // material: formData.material, // Not relevant for services
    profitMargin: formData.profitMargin,
    discount: formData.discount,
    buyingPrice: formData.buyingPrice,
    sellingPrice: formData.sellingPrice,
    finalPrice: formData.finalPrice, // Ensure this is calculated or passed correctly
    startDealDate: formatDateTimeForAPI(formData.startDealDate),
    endDealDate: formatDateTimeForAPI(formData.endDealDate),
    isAvailable: formData.isAvailable,
    isOnOffer: formData.isOnOffer,
    isFlashDeal: formData.isFlashDeal,
    isNewArrival: formData.isNewArrival,
    isDiscounted: formData.isDiscounted,
    isFeatured: formData.isFeatured,
    delivery: formData.delivery,
    paymentOption: formData.paymentOption,
    showOnGhuba: formData.showOnGhuba,
    contactName: formData.contactName,
    contact: formData.contact,
    locationName: formData.locationName,
    // location: formData.location, // If backend expects a specific location object
    // locationId: formData.locationId,
    latitude: formData.latitude,
    longitude: formData.longitude,
    // make: formData.make, // Vehicle specific
    // trim: formData.trim,
    // type: formData.type,
    // mileage: formData.mileage,
    // engineType: formData.engineType,
    // engineSize: formData.engineSize,
    // transmission: formData.transmission,
    // drivetrain: formData.drivetrain,
    // vin: formData.vin,
    // logbookStatus: formData.logbookStatus,
    // serviceHistory: formData.serviceHistory,
    // negotiable: formData.negotiable,
    // financingAvailable: formData.financingAvailable,
    // tradeIn: formData.tradeIn,
    // author: formData.author, // Book specific
    // publisher: formData.publisher,
    // isbn: formData.isbn,
    // fabricComposition: formData.fabricComposition, // Clothing specific
    // careInstructions: formData.careInstructions,
    // energyRating: formData.energyRating, // Appliance specific
    // warrantyPeriod: formData.warrantyPeriod,
    // applianceDimensions: formData.applianceDimensions,
    // ingredients: formData.ingredients, // Beauty product specific
    // usageInstructions: formData.usageInstructions,
    // expirationDate: formData.expirationDate,
    amenities: formData.amenities || [],
    // bedrooms: formData.bedrooms, // Property specific
    // studios: formData.studios,
    // bathrooms: formData.bathrooms,
    // area: formData.area,
    serviceSchedule: formData.serviceSchedule,
    availabilityStart: formatDateTimeForAPI(formData.availabilityStart),
    availabilityEnd: formatDateTimeForAPI(formData.availabilityEnd),
    bookingSlots: formData.bookingSlots || [],
    minNoticePeriod: formData.minNoticePeriod,
    maxBookingAhead: formData.maxBookingAhead,
    pricingTiers: formData.pricingTiers || [],
    requiredClientInfo: formData.requiredClientInfo || [],
    fulfillmentStatus: formData.fulfillmentStatus,
    totalCapacity: formData.totalCapacity,
    currentBookedCount: 0,
    providerRating: formData.providerRating,
    hourlyRate: formData.hourlyRate,
    minimumHours: formData.minimumHours,
    deliveryMethod: formData.deliveryMethod,
    // digitalUrl: formData.digitalUrl, // Digital goods specific
    // autoDeliver: formData.autoDeliver,
    status: formData.status,
  };
}

const apiUrl = '/api'; // Define your API base URL here

export default function AdminServicesClient({
  initialServices,
  productCategories,
  paymentOptions,
  deliveryMethods,
  sellers = [],
  companies = [],
  companyId = "",
  categoriesData,
}: Props) {
  
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<ServiceItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null); // null: no action, true: success, false: error
  const [message, setMessage] = useState<string>("");

  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0d9488';
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#f97316';

  useEffect(() => {
    setServices(initialServices);
  }, [initialServices]);

  // Handle opening the form modal for creation
  const handleOpenCreate = () => {
    setServiceToEdit(null);
    setIsFormModalOpen(true);
    setIsSuccess(null); // Reset messages
    setMessage("");
  };

  // Handle opening the form modal for editing
  const handleOpenEdit = (service: ServiceItem) => {
    setServiceToEdit(service);
    setIsFormModalOpen(true);
    setIsSuccess(null); // Reset messages
    setMessage("");
  };

  // Handle saving the service (from the modal form)
  const handleSaveService = async (data: FormDataForPayload) => {
    setIsLoading(true);
    setIsSuccess(null);
    setMessage("");

    try {
      const payload = buildListingPayload({...data,companyId});
      console.log("Sending payload:", payload); // For debugging

      const res = await fetch(`${apiUrl}/admin/post-market-list`, {
        method: 'POST', // Use POST for both create and update (backend handles ID)
        headers: {
          'Content-Type': 'application/json',
          // Add authorization headers if needed, e.g., 'Authorization': `Bearer ${yourAuthToken}`
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || res.statusText);
      }

      const responseData = await res.json();
      console.log("API Response:", responseData);

      // Assuming responseData contains the saved/updated service item,
      // which should ideally match ServiceItem structure.
      const savedService: ServiceItem = {
        ...responseData,
        companyId,
        // Ensure dates are converted back to Date objects if needed for display
        startDealDate: responseData.startDealDate ? new Date(responseData.startDealDate) : undefined,
        endDealDate: responseData.endDealDate ? new Date(responseData.endDealDate) : undefined,
        availabilityStart: responseData.availabilityStart ? new Date(responseData.availabilityStart) : undefined,
        availabilityEnd: responseData.availabilityEnd ? new Date(responseData.availabilityEnd) : undefined,
      };

      if (data.id) {
        // Update existing service in state
        setServices(prevServices =>
          prevServices.map(svc => (svc.id === savedService.id ? savedService : svc))
        );
        setMessage(`Service "${savedService.name}" updated successfully!`);
      } else {
        // Add new service to state
        setServices(prevServices => [...prevServices, savedService]);
        setMessage(`New service "${savedService.name}" created successfully!`);
      }
      setIsSuccess(true);
      setIsFormModalOpen(false); // Close the modal on success

    } catch (error: any) {
      console.error('Failed to save service:', error);
      setIsSuccess(false);
      setMessage(`Error: ${error.message || "Something went wrong. Please try again."}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get category name from ID
  const getCategoryName = (categoryId: string) => {
    const category = categoriesData.find((cat: any) => cat.id === categoryId);
    return category ? (category.displayName || category.category?.name) : "N/A";
  };

  // Status badge component (enhanced for visual appeal)
  const StatusBadge = ({ status }: { status: ListingStatus }) => {
    let colorClass = "";
    let icon = null;
    let text = "";

    switch (status) {
      case "ACTIVE":
        colorClass = "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200";
        icon = <CheckCircleIcon className="w-4 h-4" />;
        text = "Active";
        break;
      case "PENDING":
        colorClass = "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200";
        icon = <ClockIcon className="w-4 h-4" />;
        text = "Pending";
        break;
      case "REJECTED":
        colorClass = "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200";
        icon = <XMarkIcon className="w-4 h-4" />;
        text = "Rejected";
        break;
      case "ARCHIVED":
        colorClass = "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
        icon = <ExclamationCircleIcon className="w-4 h-4" />;
        text = "Archived";
        break;
      default:
        return null;
    }

    return (
      <motion.span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${colorClass}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
      >
        {icon} {text}
      </motion.span>
    );
  };

  // Animation variants for the main container and individual cards
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 10 } },
    hover: { scale: 1.03, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" },
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-center sm:text-left">
            Manage <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}>Service Listings</span>
          </h1>
          <motion.button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-lg shadow-lg transition-all duration-300 transform hover:scale-105"
            style={{ backgroundColor: primaryColor, color: 'white' }}
            whileHover={{ backgroundColor: secondaryColor }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading} // Disable button while loading
          >
            {isLoading ? (
              <ArrowPathIcon className="w-6 h-6 animate-spin" />
            ) : (
              <PlusIcon className="w-6 h-6" />
            )}
            Add New Service
          </motion.button>
        </div>

        {/* Global Message/Notification */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-8 p-4 rounded-lg shadow-md text-center font-medium ${
                isSuccess ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'
              }`}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Service Cards Grid */}
        {services.length === 0 && !isLoading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-2xl p-10 shadow-lg text-center h-64 border border-gray-200 dark:border-gray-700"
          >
            <p className="text-2xl font-semibold text-gray-600 dark:text-gray-300 mb-4">No services listed yet!</p>
            <p className="text-lg text-gray-500 dark:text-gray-400">Click "Add New Service" to get started.</p>
          </motion.div>
        ) : isLoading && services.length === 0 ? (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-2xl p-10 shadow-lg text-center h-64 border border-gray-200 dark:border-gray-700"
            >
                <ArrowPathIcon className="w-12 h-12 text-gray-500 dark:text-gray-400 animate-spin mb-4" />
                <p className="text-2xl font-semibold text-gray-600 dark:text-gray-300">Loading services...</p>
            </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {services.map((svc) => (
              <motion.div
                key={svc.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col cursor-pointer border border-gray-200 dark:border-gray-700 overflow-hidden"
                variants={cardVariants}
                whileHover="hover"
                onClick={() => handleOpenEdit(svc)}
              >
                {/* Image Preview */}
                {svc.images && svc.images.length > 0 && svc.images[0] ? (
                  <div className="relative w-full h-48 rounded-lg mb-4 overflow-hidden shadow-sm">
                    <Image
                      src={svc.images[0]}
                      loader={imageLoader}
                      alt={svc.name || "Service Image"}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-48 rounded-lg mb-4 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
                    No Image
                  </div>
                )}

                {/* Card Header */}
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight pr-4">
                    { svc.name || "Untitled Service"}
                  </h2>
                  <StatusBadge status={svc.status} />
                </div>

                {/* Key Details */}
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2">
                  {svc.description || "No description provided."}
                </p>
                <div className="text-sm text-gray-700 dark:text-gray-400 space-y-1 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                  <p><span className="font-semibold" style={{ color: primaryColor }}>Category:</span> {getCategoryName(svc.productCategoryId)}</p>
                  {(svc.sellingPrice !== undefined && svc.sellingPrice !== null) && (
                    <p><span className="font-semibold" style={{ color: primaryColor }}>Price:</span> ${svc.sellingPrice.toFixed(2)}</p>
                  )}
                  {svc.hourlyRate && (
                    <p><span className="font-semibold" style={{ color: primaryColor }}>Hourly Rate:</span> ${svc.hourlyRate.toFixed(2)}/hr</p>
                  )}
                  {svc.minimumHours && (
                    <p><span className="font-semibold" style={{ color: primaryColor }}>Min. Hours:</span> {svc.minimumHours}</p>
                  )}
                  {svc.serviceSchedule && (
                    <p><span className="font-semibold" style={{ color: primaryColor }}>Schedule:</span> {svc.serviceSchedule}</p>
                  )}
                  {svc.locationName && (
                    <p><span className="font-semibold" style={{ color: primaryColor }}>Location:</span> {svc.locationName}</p>
                  )}
                </div>

                {/* Action Buttons on Card */}
                <div className="mt-4 flex justify-end gap-2">
                  <motion.button
                    onClick={(e:any) => {
                      e.stopPropagation();
                      // Implement view details logic (e.g., open a read-only modal or navigate to detail page)
                      alert(`Viewing details for: ${svc.name}`);
                    }}
                    className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-sm font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <EyeIcon className="w-4 h-4" /> View
                  </motion.button>
                  <motion.button
                    onClick={(e:any) => {
                      e.stopPropagation();
                      handleOpenEdit(svc);
                    }}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors text-sm font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <PencilSquareIcon className="w-4 h-4" /> Edit
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Service Listing Form Modal */}
      <ServiceListingForm
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveService}
        initialData={serviceToEdit}
        // Pass all necessary data for dropdowns/theme to the form
        productCategories={categoriesData} // Pass the full categoriesData to the form
        paymentOptions={paymentOptions}
        deliveryMethods={deliveryMethods}
        // sellers={sellers}
        // companies={companies}
        companyId={companyId}
        themeSettings={storeFormData?.themeSettings}
      />
    </div>
  );
}
