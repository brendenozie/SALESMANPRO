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
  EyeIcon, // For view details
} from "@heroicons/react/24/outline";
import Image from "next/image"; // For displaying service images
import ServiceListingForm from "@/components/admin/components/ServiceListingForm"; // Your revamped form component
import { useStoreContext } from "@/contexts/StoreContext"; // To get theme settings and store categories

// Enums/types matching Prisma schema (ensure these are consistent with ServiceListingFormRedesign)
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

export interface ServiceItem {
  id: string;
  title?: string;
  name?: string; // Sometimes title is 'name' in data
  description?: string;
  productCategoryId: string;
  subCategory?: any; // Consider a more specific type if possible
  subCategoryName?: string;
  tags: string[];
  images: string[]; // Changed to string[] for image URLs
  video?: string;
  quantity?: number; // Made optional as not all services have quantity
  profitMargin?: number;
  buyingPrice?: number; // Made optional
  sellingPrice?: number; // Made optional
  finalPrice?: number;
  tax?: number;
  shippingCost?: number;
  discount?: number;
  isAvailable: boolean;
  isOnOffer: boolean;
  isFlashDeal: boolean;
  isNewArrival: boolean;
  isDiscounted: boolean;
  isFeatured: boolean;
  startDealDate?: string; // Changed to string for consistency with datetime-local
  endDealDate?: string; // Changed to string
  availabilityStart?: string; // Changed to string
  availabilityEnd?: string; // Changed to string
  bookingSlots: BookingSlot[];
  minNoticePeriod?: string;
  maxBookingAhead?: string;
  pricingTiers: PricingTier[];
  requiredClientInfo: string[];
  fulfillmentStatus?: string;
  totalCapacity?: number;
  currentBookedCount?: number;
  providerRating?: number;
  hourlyRate?: number;
  minimumHours?: number;
  deliveryMethod?: string;
  serviceSchedule?: string;
  companyId?: string;
  sellerId?: string;
  sellerType?: SellerType;
  contact?: string; // Phone number
  email?: string;
  contactName?: string;
  location?: any; // Consider a more specific type
  locationName?: string;
  latitude?: number;
  longitude?: number;
  amenities: string[];
  delivery: boolean;
  paymentOption?: string; // Made optional
  showOnGhuba?: boolean;
  status: ListingStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

// Props for this AdminServicesClient component
interface Props {
  initialServices: ServiceItem[];
  productCategories: { id: string; name: string }[]; // Simplified for this component's use
  paymentOptions: string[];
  deliveryMethods: string[];
  sellers?: { id: string; name: string }[];
  companies?: { id: string; name: string }[];
  companyId?: string; // Made optional as it might come from context or parent
  categoriesData: any[]; // Full category data for ServiceListingForm
}

// Image loader for Next.js Image component
const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function AdminServicesClient({
  initialServices,
  productCategories, // Used for simplified category name lookup
  paymentOptions,
  deliveryMethods,
  // sellers = [],
  // companies = [],
  companyId = "",
  categoriesData, // Full category data passed to the form
}: Props) {
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<ServiceItem | null>(null);

  const { storeFormData } = useStoreContext(); // Access global store data for theme
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0d9488'; // Teal fallback
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#f97316'; // Orange fallback

  // Update services state when initialServices prop changes
  useEffect(() => {
    setServices(initialServices);
  }, [initialServices]);

  // Handle opening the form modal for creation
  const handleOpenCreate = () => {
    setServiceToEdit(null); // Clear any previous data
    setIsFormModalOpen(true);
  };

  // Handle opening the form modal for editing
  const handleOpenEdit = (service: ServiceItem) => {
    setServiceToEdit(service);
    setIsFormModalOpen(true);
  };

  // Handle saving the service (from the modal form)
  const handleSaveService = (data: ServiceItem) => {
    console.log('Attempting to save service:', data);
    // In a real application, you would send this data to your backend API
    // and then update the 'services' state based on the API response.

    // Mocking API call and state update
    if (data.id) {
      // Edit existing service
      setServices(prevServices =>
        prevServices.map(svc => (svc.id === data.id ? { ...svc, ...data } : svc))
      );
      console.log(`Service with ID ${data.id} updated.`);
    } else {
      // Create new service (assign a mock ID for demonstration)
      const newService = { ...data, id: `svc_${Date.now()}` };
      setServices(prevServices => [...prevServices, newService]);
      console.log('New service created:', newService);
    }

    setIsFormModalOpen(false); // Close the modal
  };

  // Helper to get category name from ID
  const getCategoryName = (categoryId: string) => {
    const category = productCategories.find(cat => cat.id === categoryId);
    return category ? category.name : "N/A";
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
          >
            <PlusIcon className="w-6 h-6" /> Add New Service
          </motion.button>
        </div>

        {/* Service Cards Grid */}
        {services.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-2xl p-10 shadow-lg text-center h-64"
          >
            <p className="text-2xl font-semibold text-gray-600 dark:text-gray-300 mb-4">No services listed yet!</p>
            <p className="text-lg text-gray-500 dark:text-gray-400">Click "Add New Service" to get started.</p>
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
                onClick={() => handleOpenEdit(svc)} // Make entire card clickable for edit
              >
                {/* Image Preview */}
                {svc.images && svc.images.length > 0 && (
                  <div className="relative w-full h-48 rounded-lg mb-4 overflow-hidden shadow-sm">
                    <Image
                      src={svc.images[0]}
                      loader={imageLoader}
                      alt={svc.title || svc.name || "Service Image"}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                )}

                {/* Card Header */}
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight pr-4">
                    {svc.title || svc.name || "Untitled Service"}
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
                    <p><span className="font-semibold" style={{ color: primaryColor }}>Hourly Rate:</span> ${svc.hourlyRate.toFixed(2)}</p>
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
                    onClick={(e : any) => {
                      e.stopPropagation(); // Prevent card click from triggering edit modal twice
                      // Implement view details logic or open a read-only modal
                      alert(`Viewing details for: ${svc.title || svc.name}`);
                    }}
                    className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-sm font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <EyeIcon className="w-4 h-4" /> View
                  </motion.button>
                  <motion.button
                    onClick={(e : any ) => {
                      e.stopPropagation(); // Prevent card click from triggering edit modal twice
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
