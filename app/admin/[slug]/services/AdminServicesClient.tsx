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

import AddToProductMarketModal from "@/components/AddToProductMarketModal";
import { Category } from "../categories/page";

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
  title?: string;
  name?: string;
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
  companyId: string;
  categoriesData: Category[];
}

type MarketplaceProduct = {
  _id: string;
  sellerId: string;
  sellerType: string;
  productId: string;
  name?: string;
  title?: string;
  description: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  salesPrice: number;
  discount: number;
  isOnOffer: boolean;
  isFlashDeal: boolean;
  isNewArrival: boolean;
  isDiscounted: boolean;
  isFeatured: boolean;
  buyingPrice: number;
  sellingPrice: number;
};

export default function AdminServicesClient({
  initialServices,
  productCategories,
  paymentOptions,
  deliveryMethods,
  sellers = [],
  companies = [],
  companyId = "",
  categoriesData
}: Props) {
  
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selected, setSelected] = useState<ServiceItem | null>(null);
  const [formMode, setFormMode] = useState<"edit" | "create">("edit");
  const [formData, setFormData] = useState<Omit<ServiceItem, "id" | "createdAt" | "updatedAt">>(
    {
      title: "",
      name: "",
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

  const [showRemoveProductModal, setShowRemoveProductModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAddToMarketModal, setShowAddToMarketModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);

  const openModal = (svc?: ServiceItem) => {
    if (svc) {
      setFormMode("edit");
      setSelected(svc);
      setFormData({
        title: svc.title,
        name: svc.name,
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
        name:"",
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
      name:"",
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
        response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/post-market-list`, {
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
          onClick={() => setShowAddToMarketModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <PlusIcon className="w-5 h-5" />
          Add Service Listing
        </button>
        {/* <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <PlusIcon className="w-5 h-5" />
          Add Service Listing Form 2
        </button> */}
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
      {/* {(selected !== null || formMode === "create") && (
        <ServiceListingFormRedesign
            selected={null} // or your data object
            formMode="create" // or "edit"
            closeModal={() => closeModal()}
            saveService={saveService}
        />
      )} */}

      {showAddToMarketModal && (
        <AddToProductMarketModal
          showRequestProductModal={showAddToMarketModal}
          setShowRequestProductModal={setShowAddToMarketModal}
          product={selectedProduct}
          sellerId={""}       
          sellerType={""}     
          marketListItem={selectedProduct}
          categories={categoriesData}
          companyId={companyId}
        />
      )}
    </div>
  );
}