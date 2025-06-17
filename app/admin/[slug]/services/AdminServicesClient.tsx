"use client";

import React, { useState, useEffect } from "react";
import {
  PencilSquareIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  PlusIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import ServiceListingFormRedesign from "@/components/admin/components/ServiceListingFormRedesign";

// Assuming these enums/types are defined elsewhere, e.g., in a shared types file
// type ListingStatus = "ACTIVE" | "PENDING" | "REJECTED" | "ARCHIVED";
// type SellerType = "INDIVIDUAL" | "COMPANY";

// Define these based on your Prisma schema if they're not global
export type ListingStatus = "ACTIVE" | "PENDING" | "REJECTED" | "ARCHIVED";
export type SellerType = "INDIVIDUAL" | "COMPANY";

// Simplified type for Booking Slot and Pricing Tier for form handling
interface BookingSlot {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  capacity: number;
}

interface PricingTier {
  name: string;
  description?: string;
  price: number;
  duration?: string; // e.g., "30 mins", "1 hour"
  features: string[]; // comma-separated for input
}

// Full ServiceItem interface mapping directly to relevant MarketplaceListing fields
export interface ServiceItem {
  id: string;
  // Core listing details
  title: string;
  description?: string;
  productCategoryId: string;
  subCategory?: any; // Keep as Json for now, not directly editable here
  subCategoryName?: string;
  tags: string[];
  images: any[]; // Assuming an array of strings (URLs) or objects
  video?: string;
  quantity: number; // Services might have quantity (e.g., number of available slots if not handled by totalCapacity)
  profitMargin?: number;

  // Pricing
  buyingPrice: number;
  sellingPrice: number;
  finalPrice?: number;
  tax?: number;
  shippingCost?: number; // Keep for services that might involve physical travel costs

  // Deal flags
  discount?: number;
  isAvailable: boolean;
  isOnOffer: boolean;
  isFlashDeal: boolean;
  isNewArrival: boolean;
  isDiscounted: boolean;
  isFeatured: boolean;

  // Scheduling
  startDealDate?: Date;
  endDealDate?: Date;
  availabilityStart?: Date;
  availabilityEnd?: Date;

  // New Service-specific fields
  bookingSlots: BookingSlot[]; // [{ date: "2025-06-20", time: "10:00", capacity: 1 }, ...]
  minNoticePeriod?: string;
  maxBookingAhead?: string;
  pricingTiers: PricingTier[]; // name, description, price, duration, features[]
  requiredClientInfo: string[]; // (e.g., ["vehicle make", "pet type", "number of attendees"]
  fulfillmentStatus?: string; // (e.g., PENDING_CONFIRMATION, IN_PROGRESS, COMPLETED, CANCELLED_BY_CLIENT, CANCELLED_BY_PROVIDER
  totalCapacity?: number;
  currentBookedCount?: number; // This would typically be calculated, not set
  providerRating?: number; // Usually calculated from reviews
  hourlyRate?: number;
  minimumHours?: number;
  deliveryMethod?: string; // (e.g., "On-site", "Remote/Virtual", "At Location")
  serviceSchedule?: string; // Kept from previous iteration, useful for general availability description

  // Contact & Location
  companyId?: string;
  sellerId?: string;
  sellerType?: SellerType;
  contact?: string; // General contact string (e.g., phone number)
  email?: string;
  contactName?: string;
  location?: any; // JSON, for simplicity, we'll use latitude/longitude directly
  locationName?: string;
  latitude?: number;
  longitude?: number;
  amenities: string[];

  // Marketplace-specific
  delivery: boolean; // Does the service require physical delivery/travel by provider?
  paymentOption: string;
  showOnGhuba?: boolean;

  status: ListingStatus;
  createdAt?: Date; // Prisma handles this, not usually editable
  updatedAt?: Date; // Prisma handles this, not usually editable
}

interface Props {
  initialServices: ServiceItem[];
  productCategories: { id: string; name: string }[];
  // You might want to pass available payment options, delivery methods, etc. from a backend/enums
  paymentOptions: string[];
  deliveryMethods: string[];
  // Optional: For seller/company dropdowns
  sellers?: { id: string; name: string }[];
  companies?: { id: string; name: string }[];
  companyId: string

}

export default function AdminServicesClient({
  initialServices,
  productCategories,
  paymentOptions,
  deliveryMethods,
  sellers = [],
  companies = [],
  companyId = "",

}: Props) {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selected, setSelected] = useState<ServiceItem | null>(null);
  const [formMode, setFormMode] = useState<"edit" | "create">("edit");
  const [formData, setFormData] = useState<Omit<ServiceItem, "id" | "createdAt" | "updatedAt">>(
    {
      title: "",
      companyId: companyId,
      description: "",
      productCategoryId: productCategories[0]?.id || "",
      subCategory: {}, // Initialize as empty object or null
      subCategoryName: "",
      tags: [],
      images: [],
      video: "",
      quantity: 1,
      profitMargin: 0,
      buyingPrice: 0,
      sellingPrice: 0,
      finalPrice: 0,
      tax: 0,
      shippingCost: 0,
      discount: 0,
      isAvailable: true,
      isOnOffer: false,
      isFlashDeal: false,
      isNewArrival: false,
      isDiscounted: false,
      isFeatured: false,
      bookingSlots: [],
      requiredClientInfo: [],
      pricingTiers: [],
      amenities: [],
      delivery: false,
      paymentOption: paymentOptions[0] || "AT SHOP",
      showOnGhuba: true,
      status: "ACTIVE",
    }
  );

  useEffect(() => {
    setServices(initialServices);
  }, [initialServices]);

  // Helper for date inputs
  const formatDateForInput = (date?: Date) => {
    return date ? new Date(date).toISOString().substring(0, 16) : "";
  };

  const openModal = (svc?: ServiceItem) => {
    if (svc) {
      setFormMode("edit");
      setSelected(svc);
      setFormData({
        title: svc.title,
        description: svc.description || "",
        productCategoryId: svc.productCategoryId,
        subCategory: svc.subCategory || {},
        subCategoryName: svc.subCategoryName || "",
        tags: svc.tags || [],
        images: svc.images || [],
        video: svc.video || "",
        quantity: svc.quantity,
        profitMargin: svc.profitMargin || 0,
        buyingPrice: svc.buyingPrice,
        sellingPrice: svc.sellingPrice,
        finalPrice: svc.finalPrice || 0,
        tax: svc.tax || 0,
        shippingCost: svc.shippingCost || 0,
        discount: svc.discount || 0,
        isAvailable: svc.isAvailable,
        isOnOffer: svc.isOnOffer,
        isFlashDeal: svc.isFlashDeal,
        isNewArrival: svc.isNewArrival,
        isDiscounted: svc.isDiscounted,
        isFeatured: svc.isFeatured,
        startDealDate: svc.startDealDate ? new Date(svc.startDealDate) : undefined,
        endDealDate: svc.endDealDate ? new Date(svc.endDealDate) : undefined,
        availabilityStart: svc.availabilityStart ? new Date(svc.availabilityStart) : undefined,
        availabilityEnd: svc.availabilityEnd ? new Date(svc.availabilityEnd) : undefined,
        bookingSlots: svc.bookingSlots || [],
        minNoticePeriod: svc.minNoticePeriod || "",
        maxBookingAhead: svc.maxBookingAhead || "",
        pricingTiers: svc.pricingTiers || [],
        requiredClientInfo: svc.requiredClientInfo || [],
        fulfillmentStatus: svc.fulfillmentStatus || "",
        totalCapacity: svc.totalCapacity,
        currentBookedCount: svc.currentBookedCount,
        providerRating: svc.providerRating,
        hourlyRate: svc.hourlyRate,
        minimumHours: svc.minimumHours,
        deliveryMethod: svc.deliveryMethod || "",
        serviceSchedule: svc.serviceSchedule || "",
        companyId: svc.companyId || "",
        sellerId: svc.sellerId || "",
        sellerType: svc.sellerType,
        contact: svc.contact || "",
        email: svc.email || "",
        contactName: svc.contactName || "",
        location: svc.location || {},
        locationName: svc.locationName || "",
        latitude: svc.latitude,
        longitude: svc.longitude,
        amenities: svc.amenities || [],
        delivery: svc.delivery,
        paymentOption: svc.paymentOption,
        showOnGhuba: svc.showOnGhuba,
        status: svc.status,
      });
    } else {
      setFormMode("create");
      setSelected(null);
      setFormData({
        title: "",
        description: "",
        companyId:companyId,
        productCategoryId: productCategories[0]?.id || "",
        subCategory: {},
        subCategoryName: "",
        tags: [],
        images: [],
        video: "",
        quantity: 1,
        profitMargin: 0,
        buyingPrice: 0,
        sellingPrice: 0,
        finalPrice: 0,
        tax: 0,
        shippingCost: 0,
        discount: 0,
        isAvailable: true,
        isOnOffer: false,
        isFlashDeal: false,
        isNewArrival: false,
        isDiscounted: false,
        isFeatured: false,
        bookingSlots: [],
        requiredClientInfo: [],
        pricingTiers: [],
        amenities: [],
        delivery: false,
        paymentOption: paymentOptions[0] || "AT SHOP",
        showOnGhuba: true,
        status: "ACTIVE",
      });
    }
  };

  const closeModal = () => {
    setSelected(null);
    setFormData({
      title: "",
      description: "",
      companyId:companyId,
      productCategoryId: productCategories[0]?.id || "",
      subCategory: {},
      subCategoryName: "",
      tags: [],
      images: [],
      video: "",
      quantity: 1,
      profitMargin: 0,
      buyingPrice: 0,
      sellingPrice: 0,
      finalPrice: 0,
      tax: 0,
      shippingCost: 0,
      discount: 0,
      isAvailable: true,
      isOnOffer: false,
      isFlashDeal: false,
      isNewArrival: false,
      isDiscounted: false,
      isFeatured: false,
      bookingSlots: [],
      requiredClientInfo: [],
      pricingTiers: [],
      amenities: [],
      delivery: false,
      paymentOption: paymentOptions[0] || "AT SHOP",
      showOnGhuba: true,
      status: "ACTIVE",
    });
  };

  const saveService = async () => {
    console.log("Attempting to save service:", formData);
  
    // Prepare data for API: Convert Date objects to ISO strings
    const dataToSend = {
      ...formData,
      startDealDate: formData.startDealDate?.toISOString(),
      endDealDate: formData.endDealDate?.toISOString(),
      availabilityStart: formData.availabilityStart?.toISOString(),
      availabilityEnd: formData.availabilityEnd?.toISOString(),
      // expirationDate: formData.expirationDate?.toISOString(),
      // createdAt and updatedAt will be set by the backend for new items
      // and should not be sent for updates unless your API specifically expects them.
    };
  
    try {
      let response;
      let newOrUpdatedService: ServiceItem;
  
      if (formMode === "create") {
        // Logic for creating a new service
        response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/marketplace-list`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create service listing.");
        }
  
        newOrUpdatedService = await response.json();
        
        // Update local state with the service returned from the API (which includes ID, dates, etc.)
        setServices((prev) => [{
          ...newOrUpdatedService,
          // Ensure dates are Date objects for local state consistency
          createdAt: newOrUpdatedService.createdAt ? new Date(newOrUpdatedService.createdAt) : undefined,
          updatedAt: newOrUpdatedService.updatedAt ? new Date(newOrUpdatedService.updatedAt) : undefined,
          startDealDate: newOrUpdatedService.startDealDate ? new Date(newOrUpdatedService.startDealDate) : undefined,
          endDealDate: newOrUpdatedService.endDealDate ? new Date(newOrUpdatedService.endDealDate) : undefined,
          availabilityStart: newOrUpdatedService.availabilityStart ? new Date(newOrUpdatedService.availabilityStart) : undefined,
          availabilityEnd: newOrUpdatedService.availabilityEnd ? new Date(newOrUpdatedService.availabilityEnd) : undefined,
          // expirationDate: newOrUpdatedService.expirationDate ? new Date(newOrUpdatedService.expirationDate) : undefined,
        }, ...prev]);
  
        console.log("Service created successfully:", newOrUpdatedService);
  
      } else if (formMode === "edit" && selected) {
        // Logic for updating an existing service
        response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/marketplace-list/${selected.id}`, { // Assuming PUT/PATCH to a specific ID endpoint
          method: "PUT", // or PATCH, depending on your API
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update service listing.");
        }
  
        newOrUpdatedService = await response.json();
  
        // Update local state with the service returned from the API
        setServices((prev) =>
          prev.map((s) =>
            s.id === selected.id ? {
              ...newOrUpdatedService,
              // Ensure dates are Date objects for local state consistency
              createdAt: newOrUpdatedService.createdAt ? new Date(newOrUpdatedService.createdAt) : undefined,
              updatedAt: newOrUpdatedService.updatedAt ? new Date(newOrUpdatedService.updatedAt) : undefined,
              startDealDate: newOrUpdatedService.startDealDate ? new Date(newOrUpdatedService.startDealDate) : undefined,
              endDealDate: newOrUpdatedService.endDealDate ? new Date(newOrUpdatedService.endDealDate) : undefined,
              availabilityStart: newOrUpdatedService.availabilityStart ? new Date(newOrUpdatedService.availabilityStart) : undefined,
              availabilityEnd: newOrUpdatedService.availabilityEnd ? new Date(newOrUpdatedService.availabilityEnd) : undefined,
              // expirationDate: newOrUpdatedService.expirationDate ? new Date(newOrUpdatedService.expirationDate) : undefined,
            } : s
          )
        );
        console.log("Service updated successfully:", newOrUpdatedService);
      }
      
      closeModal(); // Close the modal on successful save/update
  
    } catch (error:any) {
      console.error("Error saving service:", error);
      // You might want to show a toast notification or an error message to the user here.
      alert(`Error saving service: ${error.message}`);
    }
  };

  // Helper for adding/removing items from array fields (tags, amenities, requiredClientInfo)
  const handleArrayFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    fieldName: keyof ServiceItem
  ) => {
    const value = e.target.value;
    // Split by comma, trim whitespace, filter out empty strings
    const newArray = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");
    setFormData((prev) => ({ ...prev, [fieldName]: newArray }));
  };

  // Handlers for dynamic lists like bookingSlots and pricingTiers
  const handleAddBookingSlot = () => {
    setFormData((prev) => ({
      ...prev,
      bookingSlots: [...(prev.bookingSlots || []), { date: "", time: "", capacity: 1 }],
    }));
  };

  const handleUpdateBookingSlot = (index: number, field: keyof BookingSlot, value: any) => {
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

  const handleAddPricingTier = () => {
    setFormData((prev) => ({
      ...prev,
      pricingTiers: [...(prev.pricingTiers || []), { name: "", price: 0, features: [] }],
    }));
  };

  const handleUpdatePricingTier = (index: number, field: keyof PricingTier, value: any) => {
    setFormData((prev) => {
      const updatedTiers = [...(prev.pricingTiers || [])];
      if (field === 'features') {
        updatedTiers[index] = { ...updatedTiers[index], [field]: value.split(',').map((f: string) => f.trim()) };
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

  const statusBadge = (status: ListingStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs">
            <CheckCircleIcon className="w-4 h-4" /> Active
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full text-xs">
            <ClockIcon className="w-4 h-4" /> Pending
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded-full text-xs">
            <XMarkIcon className="w-4 h-4" /> Rejected
          </span>
        );
      case "ARCHIVED":
        return (
          <span className="inline-flex items-center gap-1 text-gray-700 bg-gray-100 px-2 py-1 rounded-full text-xs">
            <ExclamationCircleIcon className="w-4 h-4" /> Archived
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-5xl font-extrabold text-gray-800">Service Listings</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <PlusIcon className="w-5 h-5" />
          Add Service Listing
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((svc) => (
          <div
            key={svc.id}
            onClick={() => openModal(svc)}
            className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer transform hover:scale-[1.02] transition"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">{svc.title}</h2>
              {statusBadge(svc.status)}
            </div>

            <p className="text-gray-600 mb-2">
              <span className="font-medium">Category ID:</span>{" "}
              {svc.productCategoryId}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Selling Price:</span> ${svc.sellingPrice}
            </p>
            {svc.minimumHours && (
              <p className="text-gray-600 mb-4">
                <span className="font-medium">Minimum Hours:</span> {svc.minimumHours}
              </p>
            )}
            {svc.serviceSchedule && (
              <p className="text-gray-600 mb-4">
                <span className="font-medium">Schedule:</span> {svc.serviceSchedule}
              </p>
            )}

            {svc.contactName && (
              <div className="text-gray-500 text-sm">
                <p>
                  <span className="font-medium">Contact:</span> {svc.contactName} (
                  {svc.contact || svc.email})
                </p>
              </div>
            )}
            {svc.locationName && (
              <p className="text-gray-500 text-sm">
                <span className="font-medium">Location:</span> {svc.locationName}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {(selected !== null || formMode === "create") && (
        <ServiceListingFormRedesign
            selected={null} // or your data object
            formMode="create" // or "edit"
            closeModal={() => closeModal()}
            saveService={saveService}
        />
        // <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        //   <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative overflow-auto max-h-[90vh]">
        //     <button
        //       onClick={() => closeModal()}
        //       className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        //     >
        //       <XMarkIcon className="w-6 h-6" />
        //     </button>

        //     <h3 className="text-3xl font-bold mb-4 text-gray-800">
        //       {formMode === "create" ? "Add New Service Listing" : `Edit: ${selected?.title}`}
        //     </h3>

        //     <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        //       {/* Basic Listing Details */}
        //       <label className="block col-span-2">
        //         <span className="text-gray-700">Listing Title <span className="text-red-500">*</span></span>
        //         <input
        //           type="text"
        //           className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //           value={formData.title}
        //           onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        //           required
        //         />
        //       </label>

        //       <label className="block col-span-2">
        //         <span className="text-gray-700">Description</span>
        //         <textarea
        //           className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //           value={formData.description || ""}
        //           onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        //           rows={3}
        //         ></textarea>
        //       </label>

        //       <label className="block">
        //         <span className="text-gray-700">Product Category <span className="text-red-500">*</span></span>
        //         <select
        //           className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //           value={formData.productCategoryId}
        //           onChange={(e) =>
        //             setFormData({ ...formData, productCategoryId: e.target.value })
        //           }
        //           required
        //         >
        //           {productCategories.map((cat) => (
        //             <option key={cat.id} value={cat.id}>
        //               {cat.name}
        //             </option>
        //           ))}
        //         </select>
        //       </label>
              
        //       {/* Seller/Company Info */}
        //       <label className="block">
        //         <span className="text-gray-700">Seller</span>
        //         <select
        //           className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //           value={formData.sellerId || ""}
        //           onChange={(e) => setFormData({ ...formData, sellerId: e.target.value || undefined })}
        //         >
        //           <option value="">Select Seller (Optional)</option>
        //           {sellers.map((seller) => (
        //             <option key={seller.id} value={seller.id}>{seller.name}</option>
        //           ))}
        //         </select>
        //       </label>
        //       <label className="block">
        //         <span className="text-gray-700">Company</span>
        //         <select
        //           className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //           value={formData.companyId || ""}
        //           onChange={(e) => setFormData({ ...formData, companyId: e.target.value || undefined })}
        //         >
        //           <option value="">Select Company (Optional)</option>
        //           {companies.map((company) => (
        //             <option key={company.id} value={company.id}>{company.name}</option>
        //           ))}
        //         </select>
        //       </label>
        //       <label className="block">
        //         <span className="text-gray-700">Seller Type</span>
        //         <select
        //           className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //           value={formData.sellerType || ""}
        //           onChange={(e) => setFormData({ ...formData, sellerType: e.target.value as SellerType || undefined })}
        //         >
        //           <option value="">Select Type</option>
        //           <option value="INDIVIDUAL">Individual</option>
        //           <option value="COMPANY">Company</option>
        //         </select>
        //       </label>

        //       {/* Pricing */}
        //       <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
        //         <label className="block">
        //           <span className="text-gray-700">Selling Price ($) <span className="text-red-500">*</span></span>
        //           <input
        //             type="number"
        //             step="0.01"
        //             className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //             value={formData.sellingPrice}
        //             onChange={(e) =>
        //               setFormData({ ...formData, sellingPrice: Number(e.target.value) })
        //             }
        //             required
        //           />
        //         </label>
        //         <label className="block">
        //           <span className="text-gray-700">Buying Price ($) - Internal <span className="text-red-500">*</span></span>
        //           <input
        //             type="number"
        //             step="0.01"
        //             className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //             value={formData.buyingPrice}
        //             onChange={(e) =>
        //               setFormData({ ...formData, buyingPrice: Number(e.target.value) })
        //             }
        //             required
        //           />
        //         </label>
        //         <label className="block">
        //           <span className="text-gray-700">Profit Margin (%)</span>
        //           <input
        //             type="number"
        //             step="0.01"
        //             className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //             value={formData.profitMargin || 0}
        //             onChange={(e) =>
        //               setFormData({ ...formData, profitMargin: Number(e.target.value) })
        //             }
        //           />
        //         </label>
        //         <label className="block">
        //           <span className="text-gray-700">Tax ($)</span>
        //           <input
        //             type="number"
        //             step="0.01"
        //             className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //             value={formData.tax || 0}
        //             onChange={(e) => setFormData({ ...formData, tax: Number(e.target.value) })}
        //           />
        //         </label>
        //         <label className="block">
        //           <span className="text-gray-700">Shipping Cost ($)</span>
        //           <input
        //             type="number"
        //             step="0.01"
        //             className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //             value={formData.shippingCost || 0}
        //             onChange={(e) =>
        //               setFormData({ ...formData, shippingCost: Number(e.target.value) })
        //             }
        //           />
        //         </label>
        //         <label className="block">
        //           <span className="text-gray-700">Discount (%)</span>
        //           <input
        //             type="number"
        //             step="1"
        //             className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //             value={formData.discount || 0}
        //             onChange={(e) =>
        //               setFormData({ ...formData, discount: Number(e.target.value) })
        //             }
        //           />
        //         </label>
        //       </div>

        //       {/* Service Specific Details */}
        //       <fieldset className="border p-4 rounded-lg col-span-2">
        //         <legend className="text-gray-700 font-medium">Service Details</legend>
        //         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        //           <label className="block">
        //             <span className="text-gray-700">Quantity (e.g., number of seats)</span>
        //             <input
        //               type="number"
        //               className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //               value={formData.quantity}
        //               onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
        //             />
        //           </label>
        //           <label className="block">
        //             <span className="text-gray-700">General Service Schedule (e.g., "Mon-Fri, 9am-5pm")</span>
        //             <input
        //               type="text"
        //               className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //               value={formData.serviceSchedule || ""}
        //               onChange={(e) => setFormData({ ...formData, serviceSchedule: e.target.value })}
        //             />
        //           </label>
        //           <label className="block">
        //             <span className="text-gray-700">Hourly Rate ($)</span>
        //             <input
        //               type="number"
        //               step="0.01"
        //               className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //               value={formData.hourlyRate || ""}
        //               onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
        //             />
        //           </label>
        //           <label className="block">
        //             <span className="text-gray-700">Minimum Hours</span>
        //             <input
        //               type="number"
        //               step="1"
        //               className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //               value={formData.minimumHours || ""}
        //               onChange={(e) => setFormData({ ...formData, minimumHours: Number(e.target.value) })}
        //             />
        //           </label>
        //           <label className="block">
        //             <span className="text-gray-700">Min. Notice Period (e.g., "24 hours", "3 days")</span>
        //             <input
        //               type="text"
        //               className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //               value={formData.minNoticePeriod || ""}
        //               onChange={(e) => setFormData({ ...formData, minNoticePeriod: e.target.value })}
        //             />
        //           </label>
        //           <label className="block">
        //             <span className="text-gray-700">Max Booking Ahead (e.g., "3 months")</span>
        //             <input
        //               type="text"
        //               className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //               value={formData.maxBookingAhead || ""}
        //               onChange={(e) => setFormData({ ...formData, maxBookingAhead: e.target.value })}
        //             />
        //           </label>
        //           <label className="block">
        //             <span className="text-gray-700">Total Capacity</span>
        //             <input
        //               type="number"
        //               step="1"
        //               className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //               value={formData.totalCapacity || ""}
        //               onChange={(e) => setFormData({ ...formData, totalCapacity: Number(e.target.value) })}
        //             />
        //           </label>
        //           <label className="block">
        //             <span className="text-gray-700">Delivery Method</span>
        //             <select
        //               className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //               value={formData.deliveryMethod || ""}
        //               onChange={(e) => setFormData({ ...formData, deliveryMethod: e.target.value || undefined })}
        //             >
        //               <option value="">Select Method</option>
        //               {deliveryMethods.map((method) => (
        //                 <option key={method} value={method}>{method}</option>
        //               ))}
        //             </select>
        //           </label>
        //           <label className="block">
        //             <span className="text-gray-700">Fulfillment Status</span>
        //             <input
        //               type="text"
        //               className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //               value={formData.fulfillmentStatus || ""}
        //               onChange={(e) => setFormData({ ...formData, fulfillmentStatus: e.target.value })}
        //               placeholder="e.g., PENDING_CONFIRMATION"
        //             />
        //           </label>
        //           <label className="block">
        //             <span className="text-gray-700">Provider Rating (Read-only for now)</span>
        //             <input
        //               type="number"
        //               step="0.1"
        //               className="mt-1 block w-full rounded-lg border-gray-300 p-2 bg-gray-100"
        //               value={formData.providerRating || ""}
        //               readOnly
        //             />
        //           </label>
        //         </div>
        //       </fieldset>

        //       {/* Dynamic Lists: Booking Slots */}
        //       <fieldset className="border p-4 rounded-lg col-span-2">
        //         <legend className="text-gray-700 font-medium">Booking Slots</legend>
        //         {(formData.bookingSlots || []).map((slot, index) => (
        //           <div key={index} className="grid grid-cols-4 gap-2 mb-2 items-end">
        //             <label className="block">
        //               <span className="text-gray-600 text-sm">Date</span>
        //               <input
        //                 type="date"
        //                 className="mt-1 block w-full rounded-lg border-gray-300 p-2 text-sm"
        //                 value={slot.date}
        //                 onChange={(e) => handleUpdateBookingSlot(index, "date", e.target.value)}
        //               />
        //             </label>
        //             <label className="block">
        //               <span className="text-gray-600 text-sm">Time</span>
        //               <input
        //                 type="time"
        //                 className="mt-1 block w-full rounded-lg border-gray-300 p-2 text-sm"
        //                 value={slot.time}
        //                 onChange={(e) => handleUpdateBookingSlot(index, "time", e.target.value)}
        //               />
        //             </label>
        //             <label className="block">
        //               <span className="text-gray-600 text-sm">Capacity</span>
        //               <input
        //                 type="number"
        //                 step="1"
        //                 className="mt-1 block w-full rounded-lg border-gray-300 p-2 text-sm"
        //                 value={slot.capacity}
        //                 onChange={(e) => handleUpdateBookingSlot(index, "capacity", Number(e.target.value))}
        //               />
        //             </label>
        //             <button
        //               type="button"
        //               onClick={() => handleRemoveBookingSlot(index)}
        //               className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition h-fit"
        //             >
        //               Remove
        //             </button>
        //           </div>
        //         ))}
        //         <button
        //           type="button"
        //           onClick={handleAddBookingSlot}
        //           className="mt-2 bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition text-sm"
        //         >
        //           Add Booking Slot
        //         </button>
        //       </fieldset>

        //       {/* Dynamic Lists: Pricing Tiers */}
        //       <fieldset className="border p-4 rounded-lg col-span-2">
        //         <legend className="text-gray-700 font-medium">Pricing Tiers/Packages</legend>
        //         {(formData.pricingTiers || []).map((tier, index) => (
        //           <div key={index} className="border-b pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
        //             <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2 items-end">
        //               <label className="block">
        //                 <span className="text-gray-600 text-sm">Tier Name</span>
        //                 <input
        //                   type="text"
        //                   className="mt-1 block w-full rounded-lg border-gray-300 p-2 text-sm"
        //                   value={tier.name}
        //                   onChange={(e) => handleUpdatePricingTier(index, "name", e.target.value)}
        //                 />
        //               </label>
        //               <label className="block">
        //                 <span className="text-gray-600 text-sm">Tier Price ($)</span>
        //                 <input
        //                   type="number"
        //                   step="0.01"
        //                   className="mt-1 block w-full rounded-lg border-gray-300 p-2 text-sm"
        //                   value={tier.price}
        //                   onChange={(e) => handleUpdatePricingTier(index, "price", Number(e.target.value))}
        //                 />
        //               </label>
        //               <label className="block">
        //                 <span className="text-gray-600 text-sm">Duration (Optional)</span>
        //                 <input
        //                   type="text"
        //                   className="mt-1 block w-full rounded-lg border-gray-300 p-2 text-sm"
        //                   value={tier.duration || ''}
        //                   onChange={(e) => handleUpdatePricingTier(index, "duration", e.target.value)}
        //                 />
        //               </label>
        //             </div>
        //             <label className="block mt-2">
        //                 <span className="text-gray-600 text-sm">Description</span>
        //                 <textarea
        //                   className="mt-1 block w-full rounded-lg border-gray-300 p-2 text-sm"
        //                   value={tier.description || ''}
        //                   onChange={(e) => handleUpdatePricingTier(index, "description", e.target.value)}
        //                   rows={2}
        //                 ></textarea>
        //             </label>
        //             <label className="block mt-2">
        //                 <span className="text-gray-600 text-sm">Features (comma-separated)</span>
        //                 <input
        //                   type="text"
        //                   className="mt-1 block w-full rounded-lg border-gray-300 p-2 text-sm"
        //                   value={tier.features.join(', ')}
        //                   onChange={(e) => handleUpdatePricingTier(index, "features", e.target.value)}
        //                 />
        //             </label>
        //             <button
        //               type="button"
        //               onClick={() => handleRemovePricingTier(index)}
        //               className="mt-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition text-sm"
        //             >
        //               Remove Tier
        //             </button>
        //           </div>
        //         ))}
        //         <button
        //           type="button"
        //           onClick={handleAddPricingTier}
        //           className="mt-2 bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition text-sm"
        //         >
        //           Add Pricing Tier
        //         </button>
        //       </fieldset>

        //       {/* General Array Fields */}
        //       <label className="block col-span-2">
        //         <span className="text-gray-700">Tags (comma-separated)</span>
        //         <input
        //           type="text"
        //           className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //           value={formData.tags.join(", ")}
        //           onChange={(e) => handleArrayFieldChange(e, "tags")}
        //         />
        //       </label>

        //       <label className="block col-span-2">
        //         <span className="text-gray-700">Amenities (comma-separated, e.g., "Wi-Fi, Parking")</span>
        //         <input
        //           type="text"
        //           className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //           value={formData.amenities.join(", ")}
        //           onChange={(e) => handleArrayFieldChange(e, "amenities")}
        //         />
        //       </label>
        //       <label className="block col-span-2">
        //         <span className="text-gray-700">Required Client Info (comma-separated, e.g., "Vehicle Make, Pet Type")</span>
        //         <input
        //           type="text"
        //           className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //           value={formData.requiredClientInfo.join(", ")}
        //           onChange={(e) => handleArrayFieldChange(e, "requiredClientInfo")}
        //         />
        //       </label>

        //       {/* Images and Video (simplified for now, actual implementation needs file uploads) */}
        //       <label className="block col-span-2">
        //         <span className="text-gray-700">Image URLs (comma-separated)</span>
        //         <textarea
        //           className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //           value={(formData.images as string[]).join(", ")} // Cast to string[] for input
        //           onChange={(e) =>
        //             setFormData({
        //               ...formData,
        //               images: e.target.value.split(",").map((url) => url.trim()),
        //             })
        //           }
        //           rows={2}
        //           placeholder="https://example.com/image1.jpg, https://example.com/image2.png"
        //         ></textarea>
        //         <p className="text-sm text-gray-500 mt-1">
        //           In a real app, this would be file upload components.
        //         </p>
        //       </label>
        //       <label className="block col-span-2">
        //         <span className="text-gray-700">Video URL</span>
        //         <input
        //           type="url"
        //           className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //           value={formData.video || ""}
        //           onChange={(e) => setFormData({ ...formData, video: e.target.value })}
        //         />
        //       </label>

        //       {/* Contact Info */}
        //       <fieldset className="border p-4 rounded-lg col-span-2">
        //         <legend className="text-gray-700 font-medium">Contact & Location</legend>
        //         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        //           <label className="block">
        //             <span className="text-gray-700">Contact Name</span>
        //             <input
        //               type="text"
        //               className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //               value={formData.contactName || ""}
        //               onChange={(e) =>
        //                 setFormData({ ...formData, contactName: e.target.value })
        //               }
        //             />
        //           </label>
        //           <label className="block">
        //             <span className="text-gray-700">Contact Phone</span>
        //             <input
        //               type="tel"
        //               className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //               value={formData.contact || ""}
        //               onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
        //             />
        //           </label>
        //           <label className="block">
        //             <span className="text-gray-700">Contact Email</span>
        //             <input
        //               type="email"
        //               className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //               value={formData.email || ""}
        //               onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        //             />
        //           </label>
        //           <label className="block">
        //             <span className="text-gray-700">Location Name</span>
        //             <input
        //               type="text"
        //               className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //               value={formData.locationName || ""}
        //               onChange={(e) =>
        //                 setFormData({ ...formData, locationName: e.target.value })
        //               }
        //             />
        //           </label>
        //           <label className="block">
        //             <span className="text-gray-700">Latitude</span>
        //             <input
        //               type="number"
        //               step="any"
        //               className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //               value={formData.latitude || ""}
        //               onChange={(e) =>
        //                 setFormData({ ...formData, latitude: Number(e.target.value) })
        //               }
        //             />
        //           </label>
        //           <label className="block">
        //             <span className="text-gray-700">Longitude</span>
        //             <input
        //               type="number"
        //               step="any"
        //               className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //               value={formData.longitude || ""}
        //               onChange={(e) =>
        //                 setFormData({ ...formData, longitude: Number(e.target.value) })
        //               }
        //             />
        //           </label>
        //         </div>
        //       </fieldset>

        //       {/* Deal Flags & Availability */}
        //       <fieldset className="border p-4 rounded-lg col-span-2">
        //         <legend className="text-gray-700 font-medium">Deal Flags & Availability</legend>
        //         <div className="grid grid-cols-2 gap-4 mt-2">
        //           <label className="flex items-center gap-2">
        //             <input
        //               type="checkbox"
        //               className="rounded text-indigo-600"
        //               checked={formData.isAvailable}
        //               onChange={(e) =>
        //                 setFormData({ ...formData, isAvailable: e.target.checked })
        //               }
        //             />
        //             <span className="text-gray-700">Available</span>
        //           </label>
        //           <label className="flex items-center gap-2">
        //             <input
        //               type="checkbox"
        //               className="rounded text-indigo-600"
        //               checked={formData.isOnOffer}
        //               onChange={(e) =>
        //                 setFormData({ ...formData, isOnOffer: e.target.checked })
        //               }
        //             />
        //             <span className="text-gray-700">On Offer</span>
        //           </label>
        //           <label className="flex items-center gap-2">
        //             <input
        //               type="checkbox"
        //               className="rounded text-indigo-600"
        //               checked={formData.isFlashDeal}
        //               onChange={(e) =>
        //                 setFormData({ ...formData, isFlashDeal: e.target.checked })
        //               }
        //             />
        //             <span className="text-gray-700">Flash Deal</span>
        //           </label>
        //           <label className="flex items-center gap-2">
        //             <input
        //               type="checkbox"
        //               className="rounded text-indigo-600"
        //               checked={formData.isNewArrival}
        //               onChange={(e) =>
        //                 setFormData({ ...formData, isNewArrival: e.target.checked })
        //               }
        //             />
        //             <span className="text-gray-700">New Arrival</span>
        //           </label>
        //           <label className="flex items-center gap-2">
        //             <input
        //               type="checkbox"
        //               className="rounded text-indigo-600"
        //               checked={formData.isDiscounted}
        //               onChange={(e) =>
        //                 setFormData({ ...formData, isDiscounted: e.target.checked })
        //               }
        //             />
        //             <span className="text-gray-700">Discounted</span>
        //           </label>
        //           <label className="flex items-center gap-2">
        //             <input
        //               type="checkbox"
        //               className="rounded text-indigo-600"
        //               checked={formData.isFeatured}
        //               onChange={(e) =>
        //                 setFormData({ ...formData, isFeatured: e.target.checked })
        //               }
        //             />
        //             <span className="text-gray-700">Featured</span>
        //           </label>
        //         </div>
        //         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        //           <label className="block">
        //             <span className="text-gray-700">Deal Start Date</span>
        //             <input
        //               type="datetime-local"
        //               className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //               value={formatDateForInput(formData.startDealDate)}
        //               onChange={(e) =>
        //                 setFormData({
        //                   ...formData,
        //                   startDealDate: e.target.value ? new Date(e.target.value) : undefined,
        //                 })
        //               }
        //             />
        //           </label>
        //           <label className="block">
        //             <span className="text-gray-700">Deal End Date</span>
        //             <input
        //               type="datetime-local"
        //               className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //               value={formatDateForInput(formData.endDealDate)}
        //               onChange={(e) =>
        //                 setFormData({
        //                   ...formData,
        //                   endDealDate: e.target.value ? new Date(e.target.value) : undefined,
        //                 })
        //               }
        //             />
        //           </label>
        //           <label className="block">
        //             <span className="text-gray-700">Availability Start Date</span>
        //             <input
        //               type="datetime-local"
        //               className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //               value={formatDateForInput(formData.availabilityStart)}
        //               onChange={(e) =>
        //                 setFormData({
        //                   ...formData,
        //                   availabilityStart: e.target.value ? new Date(e.target.value) : undefined,
        //                 })
        //               }
        //             />
        //           </label>
        //           <label className="block">
        //             <span className="text-gray-700">Availability End Date</span>
        //             <input
        //               type="datetime-local"
        //               className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //               value={formatDateForInput(formData.availabilityEnd)}
        //               onChange={(e) =>
        //                 setFormData({
        //                   ...formData,
        //                   availabilityEnd: e.target.value ? new Date(e.target.value) : undefined,
        //                 })
        //               }
        //             />
        //           </label>
        //         </div>
        //       </fieldset>

        //       {/* Marketplace Options */}
        //       <fieldset className="border p-4 rounded-lg col-span-2">
        //         <legend className="text-gray-700 font-medium">Marketplace Options</legend>
        //         <div className="grid grid-cols-2 gap-4 mt-2">
        //           <label className="flex items-center gap-2">
        //             <input
        //               type="checkbox"
        //               className="rounded text-indigo-600"
        //               checked={formData.delivery}
        //               onChange={(e) =>
        //                 setFormData({ ...formData, delivery: e.target.checked })
        //               }
        //             />
        //             <span className="text-gray-700">Offers Physical Delivery/On-site Service</span>
        //           </label>
        //           <label className="flex items-center gap-2">
        //             <input
        //               type="checkbox"
        //               className="rounded text-indigo-600"
        //               checked={formData.showOnGhuba || false}
        //               onChange={(e) =>
        //                 setFormData({ ...formData, showOnGhuba: e.target.checked })
        //               }
        //             />
        //             <span className="text-gray-700">Show on Ghuba Marketplace</span>
        //           </label>
        //           <label className="block col-span-2">
        //             <span className="text-gray-700">Payment Option <span className="text-red-500">*</span></span>
        //             <select
        //               className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //               value={formData.paymentOption}
        //               onChange={(e) =>
        //                 setFormData({ ...formData, paymentOption: e.target.value })
        //               }
        //               required
        //             >
        //               {paymentOptions.map((option) => (
        //                 <option key={option} value={option}>{option}</option>
        //               ))}
        //             </select>
        //           </label>
        //         </div>
        //       </fieldset>

        //       {/* Status */}
        //       <div className="mt-4 col-span-2">
        //         <span className="text-gray-700">Status <span className="text-red-500">*</span></span>
        //         <select
        //           className="mt-1 block w-full rounded-lg border-gray-300 p-2"
        //           value={formData.status}
        //           onChange={(e) =>
        //             setFormData({ ...formData, status: e.target.value as ListingStatus })
        //           }
        //           required
        //         >
        //           <option value="ACTIVE">Active</option>
        //           <option value="PENDING">Pending</option>
        //           <option value="REJECTED">Rejected</option>
        //           <option value="ARCHIVED">Archived</option>
        //         </select>
        //       </div>
        //     </div>

        //     <div className="flex justify-end gap-4 mt-6">
        //       <button
        //         onClick={closeModal}
        //         className="px-6 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition"
        //       >
        //         Cancel
        //       </button>
        //       <button
        //         onClick={saveService}
        //         className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
        //       >
        //         {formMode === "create" ? "Create Listing" : "Save Changes"}
        //       </button>
        //     </div>
        //   </div>
        // </div>
      )}
    </div>
  );
}