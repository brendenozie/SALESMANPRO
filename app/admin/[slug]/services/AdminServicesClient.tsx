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

// Enums/types matching Prisma schema
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
  name?: string;
  description?: string;
  productCategoryId: string;
  subCategory?: any;
  subCategoryName?: string;
  tags: string[];
  images: any[];
  video?: string;
  quantity: number;
  profitMargin?: number;
  buyingPrice: number;
  sellingPrice: number;
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
  startDealDate?: Date;
  endDealDate?: Date;
  availabilityStart?: Date;
  availabilityEnd?: Date;
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
  contact?: string;
  email?: string;
  contactName?: string;
  location?: any;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  amenities: string[];
  delivery: boolean;
  paymentOption: string;
  showOnGhuba?: boolean;
  status: ListingStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Props {
  initialServices: ServiceItem[];
  productCategories: { id: string; name: string }[];
  paymentOptions: string[];
  deliveryMethods: string[];
  sellers?: { id: string; name: string }[];
  companies?: { id: string; name: string }[];
  companyId: string;
  categoriesData: Category[];
}

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
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [selected, setSelected] = useState<ServiceItem | null>(null);
  const [formMode, setFormMode] = useState<"edit" | "create">("edit");
  const [formData, setFormData] = useState<Omit<ServiceItem, "id" | "createdAt" | "updatedAt">>({
    title: "",
    name: "",
    description: "",
    companyId,
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

  useEffect(() => {
    setServices(initialServices);
  }, [initialServices]);

  const formatDateForInput = (date?: Date) =>
    date ? date.toISOString().slice(0, 16) : "";

  const [showAddToMarketModal, setShowAddToMarketModal] = useState(false);  
  const [showEditToMarketModal, setShowEditToMarketModal] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  const openModal = (svc?: ServiceItem) => {
    if (svc) {
      setFormMode("edit");
      setSelected(svc);
      setFormData({ ...svc, companyId, productCategoryId: svc.productCategoryId });
    } else {
      setFormMode("create");
      setSelected(null);
      setFormData({ ...formData, companyId, productCategoryId: productCategories[0]?.id || "" });
    }
    setShowAddToMarketModal(true);
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
          <PlusIcon className="w-5 h-5" /> Add Service Listing
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((svc) => (
          <div
            key={svc.id}
            onClick={() => {
              setShowEditToMarketModal(true);
              setSelectedService(svc);
            }}
            className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer transform hover:scale-[1.02] transition"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">{svc.title || svc.name}</h2>
              {statusBadge(svc.status)}
            </div>
            <p className="text-gray-600 mb-2"><span className="font-medium">Category ID:</span> {svc.productCategoryId}</p>
            <p className="text-gray-600 mb-2"><span className="font-medium">Selling Price:</span> ${svc.sellingPrice}</p>
            {svc.minimumHours && <p className="text-gray-600 mb-4"><span className="font-medium">Minimum Hours:</span> {svc.minimumHours}</p>}
            {svc.serviceSchedule && <p className="text-gray-600 mb-4"><span className="font-medium">Schedule:</span> {svc.serviceSchedule}</p>}
            {svc.contactName && <div className="text-gray-500 text-sm"><p><span className="font-medium">Contact:</span> {svc.contactName} ({svc.contact || svc.email})</p></div>}
            {svc.locationName && <p className="text-gray-500 text-sm"><span className="font-medium">Location:</span> {svc.locationName}</p>}
          </div>
        ))}
      </div>

      {showEditToMarketModal && selectedService && (
        <AddToProductMarketModal
          showRequestProductModal={showEditToMarketModal}
          setShowRequestProductModal={setShowEditToMarketModal}
          product={selectedService}
          sellerId={""}
          sellerType={""}
          marketListItem={selectedService}
          categories={categoriesData}
          companyId={companyId}
        />
      )}

      {showAddToMarketModal && (
        <AddToProductMarketModal
          showRequestProductModal={showAddToMarketModal}
          setShowRequestProductModal={setShowAddToMarketModal}
          product={null}
          sellerId={""}
          sellerType={""}
          marketListItem={null}
          categories={categoriesData}
          companyId={companyId}
        />
      )}
    </div>
  );
}
