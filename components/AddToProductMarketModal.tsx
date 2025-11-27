"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  Suspense,
  useRef,
} from "react";
import Modal from "./Modal";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XMarkIcon,
  BoltIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import Stepper from "./Stepper";
import { CATEGORY_STEPS } from "@/constant/CATEGORY_STEPS";
import { FORM_COMPONENTS } from "@/constant/FORM_COMPONENTS";
import { STEP_LABELS } from "@/constant/STEP_LABELS";
import CategoryPicker from "./CategoryPicker";
import PricingDetails from "./PricingDetails";
import LocationPicker from "./LocationPicker";
import { MarketListingForm, ProductForm, IStoreCategory, ILocation } from "@/types/typings";
import { UnifiedMediaItem } from "./ImageUploader";


////////////////////////////////////////////////////////////////////////////////
// Constants & API
////////////////////////////////////////////////////////////////////////////////
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

////////////////////////////////////////////////////////////////////////////////
// Mode Types & Semantic Section Configuration
////////////////////////////////////////////////////////////////////////////////

/** Mode for the listing modal - Fast (minimal fields) or Advanced (all fields) */
type ListingMode = "FAST" | "ADVANCED";

/**
 * Semantic section keys for the listing form.
 * Each section represents a logical grouping of fields.
 */
type SectionKey = 
  | "category"      // Category, subcategory, brand selection
  | "core"          // Name, description, basic info
  | "pricing"       // Pricing fields (buyingPrice, sellingPrice, discount)
  | "media"         // Images, videos, books uploads
  | "location"      // Location picker
  | "variants"      // Color, size, weight, material variants
  | "availability"  // Stock, availability flags
  | "vehicle"       // Vehicle-specific fields (automotive)
  | "property"      // Property-specific fields (real estate)
  | "service"       // Service-specific fields
  | "contact"       // Contact information
  | "review";       // Final review section

/**
 * CATEGORY_FIELD_MAP - Maps category names to the sections that should be shown.
 * This replaces the rigid numeric step mapping with semantic sections.
 * 
 * Fast Mode sections are always: category, core, pricing, media, location, review
 * Advanced Mode adds additional sections based on category.
 */
const CATEGORY_FIELD_MAP: Record<string, { fast: SectionKey[]; advanced: SectionKey[] }> = {
  // Default for standard products (Electronics, Clothing, etc.)
  default: {
    fast: ["category", "core", "pricing", "media", "location", "review"],
    advanced: ["category", "core", "pricing", "media", "variants", "availability", "contact", "location", "review"],
  },
  // Automotive categories
  "Automotive": {
    fast: ["category", "core", "pricing", "media", "location", "review"],
    advanced: ["category", "core", "vehicle", "pricing", "media", "availability", "contact", "location", "review"],
  },
  "Cars": {
    fast: ["category", "core", "pricing", "media", "location", "review"],
    advanced: ["category", "core", "vehicle", "pricing", "media", "availability", "contact", "location", "review"],
  },
  // Real Estate categories
  "Real Estate": {
    fast: ["category", "core", "pricing", "media", "location", "review"],
    advanced: ["category", "core", "property", "pricing", "media", "availability", "contact", "location", "review"],
  },
  "Property": {
    fast: ["category", "core", "pricing", "media", "location", "review"],
    advanced: ["category", "core", "property", "pricing", "media", "availability", "contact", "location", "review"],
  },
  // Service categories
  "Services": {
    fast: ["category", "core", "pricing", "media", "location", "review"],
    advanced: ["category", "core", "service", "pricing", "media", "availability", "contact", "location", "review"],
  },
};

/**
 * SECTION_COMPONENTS - Maps semantic section keys to their dynamic step numbers.
 * This allows computing visible steps from active sections.
 */
const SECTION_COMPONENTS: Record<SectionKey, number> = {
  category: 1,      // CategoryPicker
  core: 2,          // ProductDetails
  pricing: 7,       // PricingDetails
  media: 8,         // ImageUploader
  location: 18,     // LocationPicker
  variants: 9,      // ProductVariants
  availability: 10, // ProductAvailability
  vehicle: 3,       // GeneralDetails + EnginePerformance
  property: 19,     // PropertyTypeDetails
  service: 16,      // ServiceSpecifics
  contact: 12,      // ContactLocation
  review: 11,       // FinalReview
};

/**
 * Semantic section labels for stepper display
 */
const SECTION_LABELS: Record<SectionKey, string> = {
  category: "Category",
  core: "Details",
  pricing: "Pricing",
  media: "Media",
  location: "Location",
  variants: "Variants",
  availability: "Availability",
  vehicle: "Vehicle Info",
  property: "Property Info",
  service: "Service Info",
  contact: "Contact",
  review: "Review",
};

/**
 * Get sections for a given category and mode
 */
function getSectionsForCategory(categoryName: string, mode: ListingMode): SectionKey[] {
  const normalizedName = categoryName?.trim() || "";
  const config = CATEGORY_FIELD_MAP[normalizedName] || CATEGORY_FIELD_MAP.default;
  return mode === "FAST" ? config.fast : config.advanced;
}

/**
 * Convert semantic sections to step numbers for backward compatibility
 */
function sectionsToSteps(sections: SectionKey[]): number[] {
  return sections.map(s => SECTION_COMPONENTS[s]);
}

/**
 * Get step labels from sections
 */
function getSectionStepLabels(sections: SectionKey[]): Record<number, string> {
  const labels: Record<number, string> = {};
  sections.forEach(s => {
    labels[SECTION_COMPONENTS[s]] = SECTION_LABELS[s];
  });
  return labels;
}

////////////////////////////////////////////////////////////////////////////////
// Small utilities reused from the product modal design
////////////////////////////////////////////////////////////////////////////////
function useDebouncedCallback<T extends (...a: any[]) => void>(fn: T, wait = 1000) {
  const t = React.useRef<number | null>(null);
  return React.useCallback((...args: Parameters<T>) => {
    if (t.current) window.clearTimeout(t.current);
    t.current = window.setTimeout(() => fn(...args), wait);
  }, [fn, wait]);
}

function Toast({ msg, onClose, type = "info" }: { msg: string; onClose?: () => void; type?: "info" | "success" | "error" }) {
  useEffect(() => {
    const id = setTimeout(() => onClose && onClose(), 3000);
    return () => clearTimeout(id);
  }, [onClose]);
  
  const bgColor = type === "success" ? "bg-green-600" : type === "error" ? "bg-red-600" : "bg-gray-900";
  
  return (
    <div className={`fixed bottom-6 right-6 z-[9999] ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2`}>
      {type === "success" && <CheckCircleIcon className="h-5 w-5" />}
      {type === "error" && <ExclamationCircleIcon className="h-5 w-5" />}
      {msg}
    </div>
  );
}

/**
 * Autosave draft hook with improved messaging
 */
function useAutoSaveDraft(key: string, data: any, enabled = true) {
  const [status, setStatus] = useState<"saved" | "saving" | "idle" | "restored">("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const save = useCallback((payload: any) => {
    if (!enabled) return;
    setStatus("saving");
    try {
      localStorage.setItem(key, JSON.stringify(payload));
      setStatus("saved");
      setLastSaved(new Date());
    } catch (e) {
      setStatus("idle");
    }
  }, [key, enabled]);

  const debouncedSave = useDebouncedCallback(save, 1200);

  useEffect(() => {
    if (!enabled) return;
    debouncedSave(data);
  }, [data, debouncedSave, enabled]);

  const restore = useCallback(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }, [key]);

  const clear = useCallback(() => localStorage.removeItem(key), [key]);
  
  // Format time since last save
  const getStatusMessage = useCallback(() => {
    if (status === "saving") return "Saving draft...";
    if (status === "saved" && lastSaved) {
      const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
      if (seconds < 60) return "Draft saved";
      return `Draft saved ${Math.floor(seconds / 60)}m ago`;
    }
    if (status === "restored") return "Draft restored";
    return "";
  }, [status, lastSaved]);

  return { status, restore, clear, getStatusMessage, setStatus };
}

////////////////////////////////////////////////////////////////////////////////
// Validation Helpers
////////////////////////////////////////////////////////////////////////////////

/**
 * Validation result interface
 */
interface ValidationResult {
  isValid: boolean;
  errors: { field: string; message: string }[];
}

/**
 * Validate Fast Mode required fields
 * Required: name, productCategoryId (category), sellingPrice
 * Recommended but not blocking: at least one image, locationId (category-dependent)
 * 
 * This validation is minimal to not block users when optional fields are omitted.
 */
function validateFastMode(formData: MarketListingForm, images: UnifiedMediaItem[]): ValidationResult {
  const errors: { field: string; message: string }[] = [];
  
  // Required: Product name
  if (!formData.name?.trim()) {
    errors.push({ field: "name", message: "Product name is required" });
  }
  
  // Required: Category selected
  if (!formData.productCategoryId) {
    errors.push({ field: "productCategoryId", message: "Please select a category" });
  }
  
  // Required: Selling price must be set and > 0
  if (!formData.sellingPrice || formData.sellingPrice <= 0) {
    errors.push({ field: "sellingPrice", message: "List Price must be greater than 0" });
  }
  
  // Note: We do NOT hard-fail on images or location as per requirements
  // These are recommendations only
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Stub for future Zod/Yup schema validation per category
 * This can be expanded to validate visible sections only
 */
function validateSectionSchema(
  _section: SectionKey,
  _formData: MarketListingForm,
  _images: UnifiedMediaItem[]
): ValidationResult {
  // Future: Implement Zod/Yup schema validation per section
  // For now, return valid for all sections except core validation
  return { isValid: true, errors: [] };
}

////////////////////////////////////////////////////////////////////////////////
// Upload helpers
////////////////////////////////////////////////////////////////////////////////
// utils/uploadFiles.ts
export async function uploadFiles(
  files: File[],
  type: "image" | "video" | "book",
  onProgress?: (progress: number, file: File) => void
): Promise<{ url: string; key: string; contentType: string }[]> {
  console.log("uploadFiles called with files:", files, "type:", type);
  if (!files?.length) return [];

  const uploads = files.map(async (file) => {
    const res = await fetch(
      `${apiBaseUrl}/upload-url?filename=${encodeURIComponent(file.name)}&type=${type}&contentType=${encodeURIComponent(file.type)}`
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to get signed URL: ${text}`);
    }

    const { uploadUrl, publicUrl, key, contentType } = await res.json();

    // ✅ Upload to S3
    const xhr = new XMLHttpRequest();
    await new Promise<void>((resolve, reject) => {
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100), file);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) resolve();
        else reject(new Error(`Upload failed for ${file.name}: ${xhr.status}`));
      };

      xhr.onerror = () => reject(new Error(`Network error for ${file.name}`));
      xhr.send(file);
    });

    return { url: publicUrl, key, contentType };
  });

  return Promise.all(uploads);
}



////////////////////////////////////////////////////////////////////////////////
// Converters / Payload builders
////////////////////////////////////////////////////////////////////////////////
function productToListingForm(
  p?: ProductForm | null | undefined,
  cat?: IStoreCategory | undefined,
  companyId?: string | undefined
): MarketListingForm {
  // Keep this converter forgiving; copy a sensible default mapping from product fields
  // to market listing fields. Most fields are 1:1.
  // const cat = (categories && categories.find((c) => c.categoryId === p?.productCategoryId)) ?? null;

  return {
    id: "",
    productId: p?.id ?? "",
    sellerType: "ADMIN",
    companyId: p?.companyId ?? companyId,
    propertyTypeId: p?.propertyTypeId || "",
    commissionRateId: "",

    name: p?.name ?? "",
    description: p?.description ?? undefined,
    longDescription: p?.longDescription ?? undefined,

    productCategoryId: p?.productCategoryId ?? "",
    category: p?.category ?? cat ?? null,
    subCategory: p?.subCategory || (cat?.subcategories ?? {}) || null,
    subCategoryName: p?.subCategoryName ?? "",
    tags: p?.tags ?? [],

    quantity: p?.quantity ?? 0,
    buyingPrice: p?.sellingPrice ?? 0,
    sellingPrice: p?.sellingPrice ?? 0,
    discount: p?.discount ?? 0,
    finalPrice: p?.finalPrice ?? 0,
    profitMargin: p?.profitMargin ?? 0,
    pricingTiers: p?.pricingTiers ?? [],

    startDealDate: p?.startDealDate?.toString() || null,
    endDealDate: p?.endDealDate?.toString() || null,

    isAvailable: p?.isAvailable ?? false,
    isOnOffer: p?.isOnOffer ?? false,
    isFlashDeal: p?.isFlashDeal ?? false,
    isNewArrival: p?.isNewArrival ?? false,
    isDiscounted: p?.isDiscounted ?? false,
    isFeatured: p?.isFeatured ?? false,

    delivery: p?.deliveryMethod === "DELIVERY",
    paymentOption: (p as any)?.paymentOption || "AT SHOP",
    showOnGhuba: true,

    contactName: p?.contactName ?? "",
    contact: p?.contact ?? "",
    email: p?.email ?? undefined,
    locationName: p?.locationName ?? "",
    location: p?.location ? JSON.parse(JSON.stringify(p.location)) : null,
    locationId: (p as any)?.locationId ?? undefined,
    latitude: p?.latitude ?? 0.0,
    longitude: p?.longitude ?? 0.0,

    model: p?.model ?? "",
    color: p?.color ?? [],
    size: p?.size ?? [],
    weight: p?.weight ?? [],
    condition: p?.condition ?? "",
    dimensions: p?.dimensions ?? "",
    material: p?.material ?? [],

    make: p?.make ?? "",
    trim: p?.trim ?? "",
    type: p?.type ?? "",
    mileage: p?.mileage ?? "",
    engineType: p?.engineType ?? "",
    engineSize: p?.engineSize ?? 0,
    horsepower: (p as any)?.horsepower ?? 0,
    torque: (p as any)?.torque ?? 0,
    fuelType: (p as any)?.fuelType ?? "",
    fuelEconomy: (p as any)?.fuelEconomy ?? "",

    transmission: p?.transmission ?? "",
    drivetrain: p?.drivetrain ?? "",
    vin: p?.vin ?? "",
    logbookStatus: p?.logbookStatus ?? "",
    serviceHistory: p?.serviceHistory ?? "",
    negotiable: p?.negotiable ?? false,
    financingAvailable: p?.financingAvailable ?? false,
    tradeIn: p?.tradeIn ?? false,
    features: p?.features ?? [],

    hourlyRate: p?.hourlyRate,
    minimumHours: p?.minimumHours,
    minNoticePeriod: p?.minNoticePeriod,
    maxBookingAhead: p?.maxBookingAhead,
    totalCapacity: p?.totalCapacity,
    currentBookedCount: (p as any)?.currentBookedCount,
    providerRating: p?.providerRating,
    bookingSlots: p?.bookingSlots,
    requiredClientInfo: p?.requiredClientInfo,
    fulfillmentStatus: p?.fulfillmentStatus,
    deliveryMethod: p?.deliveryMethod,

    bedrooms: p?.bedrooms ?? [],
    studios: p?.studios ?? [],
    bathrooms: p?.bathrooms ?? 0,
    area: p?.area ?? "",
    serviceSchedule: p?.serviceSchedule ?? "",
    availabilityStart: p?.availabilityStart || null,
    availabilityEnd: p?.availabilityEnd || null,
    amenities: p?.amenities ?? [],

    ingredients: p?.ingredients ?? "",
    usageInstructions: p?.usageInstructions ?? "",
    expirationDate: p?.expirationDate?.toString() || null,

    fabricComposition: p?.fabricComposition ?? "",
    careInstructions: p?.careInstructions ?? "",
    energyRating: p?.energyRating ?? "",
    warrantyPeriod: p?.warrantyPeriod ?? "",
    applianceDimensions: (p as any)?.applianceDimensions,

    commissionStartDate: null,
    commissionEndDate: null,

    author: p?.author ?? "",
    publisher: p?.publisher ?? "",
    isbn: p?.isbn ?? "",
    tax: (p as any)?.tax,
    shippingCost: (p as any)?.shippingCost,

    status: "ACTIVE",
    collectionId: p?.collectionId,
    year: p?.year ?? (new Date()).getFullYear(),

    brand: (p as any)?.brand ?? null,
    option: (p as any)?.option ?? [],

    previousOwners: (p as any)?.previousOwners ?? null,
    tireCondition: (p as any)?.tireCondition ?? "",
    accidentalHistory: (p as any)?.accidentalHistory ?? false,

    digitalUrl: (p as any)?.digitalUrl ?? "",
    autoDeliver: (p as any)?.autoDeliver ?? false,
    duration: undefined,

    images: p?.images ?? [],
    videos: p?.videos ?? [],
    ebooks: p?.ebooks ?? [],
    // NOTE: videos are not part of the standard ProductForm -> MarketListingForm conversion in original code
  } as MarketListingForm;
}

function buildListingPayload(
  f: MarketListingForm,
  imageUrls: any[],
  videoUrls: any[],
  bookUrls: any[]
): any {
  return {
    id: f.id || undefined,
    sellerType: f.sellerType,
    companyId: f.companyId,
    productId: f.productId,
    images: imageUrls || [],
    videos: videoUrls || [],
    ebooks: bookUrls || [],
    name: f.name,
    description: f.description || null,
    longDescription: f.longDescription || null,
    quantity: f.quantity,
    productCategoryId: f.productCategoryId,
    category: f.category || null,
    subCategory: f.subCategory || null,
    subCategoryName: f.subCategoryName || null,
    tags: f.tags,
    brand: f.brand || null,
    model: f.model || null,
    color: f.color,
    size: f.size,
    weight: f.weight || null,
    condition: f.condition || null,
    dimensions: f.dimensions || null,
    material: f.material,
    profitMargin: f.profitMargin,
    discount: f.discount,
    buyingPrice: f.buyingPrice,
    sellingPrice: f.sellingPrice,
    finalPrice: f.finalPrice,
    pricingTiers: f.pricingTiers,
    startDealDate: f.startDealDate,
    endDealDate: f.endDealDate,
    isAvailable: f.isAvailable,
    isOnOffer: f.isOnOffer,
    isFlashDeal: f.isFlashDeal,
    isNewArrival: f.isNewArrival,
    isDiscounted: f.isDiscounted,
    isFeatured: f.isFeatured,
    delivery: f.delivery,
    paymentOption: f.paymentOption || null,
    showOnGhuba: f.showOnGhuba,
    contactName: f.contactName || null,
    contact: f.contact || null,
    email: f.email || null,
    locationName: f.locationName || null,
    location: f.location || null,
    locationId: f.locationId || null,
    latitude: f.latitude,
    longitude: f.longitude,
    make: f.make || null,
    trim: f.trim || null,
    type: f.type || null,
    mileage: f.mileage || null,
    engineType: f.engineType || null,
    engineSize: f.engineSize,
    horsepower: (f as any).horsepower,
    torque: (f as any).torque,
    fuelType: (f as any).fuelType || null,
    fuelEconomy: (f as any).fuelEconomy || null,
    transmission: f.transmission || null,
    drivetrain: f.drivetrain || null,
    vin: f.vin || null,
    logbookStatus: f.logbookStatus || null,
    serviceHistory: f.serviceHistory || null,
    negotiable: f.negotiable,
    financingAvailable: f.financingAvailable,
    tradeIn: f.tradeIn,
    features: f.features || [],
    previousOwners: f.previousOwners,
    tireCondition: f.tireCondition || null,
    accidentalHistory: f.accidentalHistory,
    tax: f.tax,
    shippingCost: f.shippingCost,
    author: f.author || null,
    publisher: f.publisher || null,
    isbn: f.isbn || null,
    fabricComposition: f.fabricComposition || null,
    careInstructions: f.careInstructions || null,
    energyRating: f.energyRating || null,
    warrantyPeriod: f.warrantyPeriod || null,
    applianceDimensions: f.applianceDimensions || null,
    ingredients: f.ingredients || null,
    usageInstructions: f.usageInstructions || null,
    expirationDate: f.expirationDate,
    amenities: f.amenities,
    bedrooms: f.bedrooms,
    studios: f.studios,
    bathrooms: f.bathrooms,
    area: f.area || null,
    serviceSchedule: f.serviceSchedule || null,
    availabilityStart: f.availabilityStart,
    availabilityEnd: f.availabilityEnd,
    bookingSlots: f.bookingSlots || [],
    minNoticePeriod: f.minNoticePeriod || null,
    maxBookingAhead: f.maxBookingAhead || null,
    requiredClientInfo: f.requiredClientInfo || null,
    fulfillmentStatus: f.fulfillmentStatus || null,
    totalCapacity: f.totalCapacity,
    currentBookedCount: f.currentBookedCount,
    providerRating: f.providerRating,
    hourlyRate: f.hourlyRate,
    minimumHours: f.minimumHours,
    deliveryMethod: f.deliveryMethod || null,
    digitalUrl: f.digitalUrl || null,
    autoDeliver: f.autoDeliver,
    status: f.status,
    collectionId: f.collectionId || null,
    year: f.year,
  };
}

////////////////////////////////////////////////////////////////////////////////
// Review Section Component
// Summarizes: Core, Pricing, Media, Location, and Category data with inline edit
////////////////////////////////////////////////////////////////////////////////
interface ReviewSectionProps {
  formData: MarketListingForm;
  images: UnifiedMediaItem[];
  videos: UnifiedMediaItem[];
  ebooks: UnifiedMediaItem[];
  sections: SectionKey[];
  onNavigateToSection: (section: SectionKey) => void;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
  formData,
  images,
  videos,
  ebooks,
  sections,
  onNavigateToSection,
}) => {
  const displayValue = (val: any) =>
    val !== undefined && val !== "" && val !== null ? val : "Not set";

  const formatCurrency = (value: number | null | undefined) => {
    if (value === undefined || value === null) return "Not set";
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number | null | undefined) => {
    if (value === undefined || value === null) return "0%";
    return `${value.toFixed(2)}%`;
  };

  const SectionHeader: React.FC<{ title: string; section: SectionKey; icon: React.ReactNode }> = ({
    title,
    section,
    icon,
  }) => (
    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
      <div className="flex items-center gap-2">
        {icon}
        <h4 className="font-semibold text-gray-800">{title}</h4>
      </div>
      {sections.includes(section) && (
        <button
          onClick={() => onNavigateToSection(section)}
          className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1"
        >
          <PencilSquareIcon className="h-4 w-4" />
          Edit
        </button>
      )}
    </div>
  );

  const KeyValue: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between py-1">
      <span className="text-gray-600 text-sm">{label}:</span>
      <span className="text-gray-800 text-sm font-medium">{value}</span>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 rounded-xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Review Your Listing</h2>
        <p className="text-gray-500 mt-1">
          Check all details before submitting. Click Edit to make changes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Core Information */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <SectionHeader
            title="Core Information"
            section="core"
            icon={<InformationCircleIcon className="h-5 w-5 text-blue-500" />}
          />
          <KeyValue label="Name" value={displayValue(formData.name)} />
          <KeyValue
            label="Description"
            value={
              formData.description
                ? formData.description.substring(0, 50) + (formData.description.length > 50 ? "..." : "")
                : "Not set"
            }
          />
        </div>

        {/* Category */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <SectionHeader
            title="Category"
            section="category"
            icon={<CheckCircleIcon className="h-5 w-5 text-green-500" />}
          />
          <KeyValue
            label="Category"
            value={displayValue(
              (formData.category as any)?.displayName || (formData.category as any)?.name
            )}
          />
          <KeyValue label="Subcategory" value={displayValue(formData.subCategoryName)} />
          <KeyValue label="Brand" value={displayValue(formData.brand)} />
        </div>

        {/* Pricing - with improved labels */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <SectionHeader
            title="Pricing"
            section="pricing"
            icon={<span className="text-lg">💰</span>}
          />
          <KeyValue label="Your Cost" value={formatCurrency(formData.buyingPrice)} />
          <KeyValue label="List Price" value={formatCurrency(formData.sellingPrice)} />
          <KeyValue label="Discount" value={formatPercent(formData.discount)} />
          <div className="mt-2 pt-2 border-t border-gray-100">
            <KeyValue
              label="Customer Pays"
              value={
                <span className="text-green-600 font-bold">
                  {formatCurrency(formData.finalPrice)}
                </span>
              }
            />
            <KeyValue
              label="Estimated Margin"
              value={
                <span className={formData.profitMargin && formData.profitMargin > 0 ? "text-green-600" : "text-red-600"}>
                  {formatPercent(formData.profitMargin)}
                </span>
              }
            />
          </div>
        </div>

        {/* Media */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <SectionHeader
            title="Media"
            section="media"
            icon={<span className="text-lg">📷</span>}
          />
          <KeyValue label="Images" value={`${images.length} uploaded`} />
          <KeyValue label="Videos" value={`${videos.length} uploaded`} />
          <KeyValue label="Books/PDFs" value={`${ebooks.length} uploaded`} />
          {images.length > 0 && (
            <div className="flex gap-1 mt-2 overflow-x-auto">
              {images.slice(0, 4).map((img, idx) => (
                <div key={img.id || idx} className="relative flex-shrink-0">
                  <img
                    src={img.url}
                    alt={`Preview ${idx + 1}`}
                    className="h-12 w-12 object-cover rounded"
                  />
                  {idx === 0 && (
                    <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[8px] px-1 rounded">
                      Cover
                    </span>
                  )}
                </div>
              ))}
              {images.length > 4 && (
                <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-600">
                  +{images.length - 4}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Location */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <SectionHeader
            title="Location"
            section="location"
            icon={<span className="text-lg">📍</span>}
          />
          <KeyValue label="Location" value={displayValue(formData.locationName)} />
          <KeyValue
            label="Coordinates"
            value={
              formData.latitude && formData.longitude
                ? `${formData.latitude.toFixed(4)}, ${formData.longitude.toFixed(4)}`
                : "Not set"
            }
          />
        </div>

        {/* Availability */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <SectionHeader
            title="Status"
            section="availability"
            icon={<span className="text-lg">✅</span>}
          />
          <KeyValue label="Available" value={formData.isAvailable ? "Yes" : "No"} />
          <KeyValue label="Featured" value={formData.isFeatured ? "Yes" : "No"} />
          <KeyValue label="Show on Marketplace" value={formData.showOnGhuba ? "Yes" : "No"} />
          <KeyValue label="Status" value={displayValue(formData.status)} />
        </div>
      </div>
    </div>
  );
};

////////////////////////////////////////////////////////////////////////////////
// Mode Selector Component
////////////////////////////////////////////////////////////////////////////////
interface ModeSelectorProps {
  mode: ListingMode;
  onModeChange: (mode: ListingMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, onModeChange }) => (
  <div className="flex flex-col items-center justify-center py-8 px-4">
    <h2 className="text-2xl font-bold text-gray-800 mb-2">How would you like to create your listing?</h2>
    <p className="text-gray-500 mb-6 text-center max-w-md">
      Choose Fast Mode for quick listings with essential fields, or Advanced Mode for complete control.
    </p>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
      {/* Fast Mode Card */}
      <button
        onClick={() => onModeChange("FAST")}
        className={`p-6 rounded-xl border-2 transition-all ${
          mode === "FAST"
            ? "border-indigo-600 bg-indigo-50 shadow-md"
            : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
        }`}
      >
        <div className="flex flex-col items-center text-center">
          <div className={`p-3 rounded-full ${mode === "FAST" ? "bg-indigo-600" : "bg-gray-200"} mb-3`}>
            <BoltIcon className={`h-8 w-8 ${mode === "FAST" ? "text-white" : "text-gray-600"}`} />
          </div>
          <h3 className="font-semibold text-lg text-gray-800">Fast Mode</h3>
          <p className="text-sm text-gray-500 mt-1">
            Quick setup with minimal required fields
          </p>
          <ul className="text-xs text-gray-400 mt-3 space-y-1">
            <li>✓ Category & Brand</li>
            <li>✓ Name & Pricing</li>
            <li>✓ Images & Location</li>
          </ul>
        </div>
      </button>

      {/* Advanced Mode Card */}
      <button
        onClick={() => onModeChange("ADVANCED")}
        className={`p-6 rounded-xl border-2 transition-all ${
          mode === "ADVANCED"
            ? "border-indigo-600 bg-indigo-50 shadow-md"
            : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
        }`}
      >
        <div className="flex flex-col items-center text-center">
          <div className={`p-3 rounded-full ${mode === "ADVANCED" ? "bg-indigo-600" : "bg-gray-200"} mb-3`}>
            <Cog6ToothIcon className={`h-8 w-8 ${mode === "ADVANCED" ? "text-white" : "text-gray-600"}`} />
          </div>
          <h3 className="font-semibold text-lg text-gray-800">Advanced Mode</h3>
          <p className="text-sm text-gray-500 mt-1">
            Full control with all available fields
          </p>
          <ul className="text-xs text-gray-400 mt-3 space-y-1">
            <li>✓ All Fast Mode fields</li>
            <li>✓ Variants & Availability</li>
            <li>✓ Category-specific options</li>
          </ul>
        </div>
      </button>
    </div>
  </div>
);

////////////////////////////////////////////////////////////////////////////////
// Hook: market listing form state (keeps logic similar to product modal)
////////////////////////////////////////////////////////////////////////////////
function useMarketListingForm(
  product?: ProductForm | undefined | null,
  marketListItem?: MarketListingForm | undefined | null,
  companyId?: string,
  categories?: IStoreCategory[]
) {
  const getInitial = useCallback((): MarketListingForm => {
    const raw: Partial<MarketListingForm> = marketListItem || {};
    const p: ProductForm | null = product ?? null;


    const cat: IStoreCategory | undefined  = (categories && categories.find((c) => c.categoryId === raw?.productCategoryId)) ?? undefined;

    // If editing a market list item, prefer its values; otherwise convert from product
    const base = marketListItem ? { ...productToListingForm(p ?? undefined, cat), ...marketListItem, companyId, category: cat } : productToListingForm(p ?? undefined, cat);

    return base as MarketListingForm;
  }, [product, marketListItem, companyId, categories]);

  const [formData, setFormData] = useState<MarketListingForm>(getInitial);

  // recalc prices when core numeric fields change
  useEffect(() => {
    const buyingPrice = formData.buyingPrice ?? 0;
    const sellingPrice = formData.sellingPrice ?? 0;
    const discount = formData.discount ?? 0;
    const finalPrice = Math.max(sellingPrice - (sellingPrice * discount) / 100, 0);
    const profitMargin = buyingPrice > 0 ? ((finalPrice - buyingPrice) / buyingPrice) * 100 : 0;
    // only update if changed to avoid infinite rerender loops
    setFormData((f) => {
      if (f.finalPrice === finalPrice && f.profitMargin === profitMargin) return f;
      return { ...f, finalPrice, profitMargin };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.buyingPrice, formData.sellingPrice, formData.discount]);

  const updateField = useCallback(
    <K extends keyof MarketListingForm>(name: K, value: MarketListingForm[K]) => {
      setFormData((f) => ({ ...f, [name]: value }));
    },
    []
  );

  // keep form in sync if initial props change
  useEffect(() => {
    setFormData(getInitial());
  }, [getInitial]);

  return { formData, updateField, setFormData };
}

////////////////////////////////////////////////////////////////////////////////
// Main Component
////////////////////////////////////////////////////////////////////////////////
export default function ProductMarketModal({
  showRequestProductModal,
  setShowRequestProductModal,
  product,
  marketListItem,
  companyId,
  categories,
  locations,
  ebookType = false
}: AddToProductMarketModalProps) {
  const { formData, updateField, setFormData } = useMarketListingForm(
    product,
    marketListItem,
    companyId,
    categories
  );

  // Mode state - Fast or Advanced
  const [mode, setMode] = useState<ListingMode>("FAST");
  const [showModeSelector, setShowModeSelector] = useState(!marketListItem); // Show mode selector for new listings

  // local UI state
  const [images, setImages] = useState<UnifiedMediaItem[]>([]);
  const [videos, setVideos] = useState<UnifiedMediaItem[]>([]);
  const [ebooks, setBooks] = useState<UnifiedMediaItem[]>([]);
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "info" | "success" | "error" } | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ field: string; message: string }[]>([]);
  
  // Ref for auto-focusing invalid fields
  const formRef = useRef<HTMLDivElement>(null);

  // Sync unified media state when formData changes
  useEffect(() => {
    setImages(
      formData.images?.map((img: any, idx: number) => ({
        id: img.url || `server-img-${idx}`,
        url: typeof img === 'string' ? img : img.url,
        source: 'server',
        file: undefined,
        title: "Untitled Image",
        author: "Unknown",
        coverPreviewUrl: undefined,
        fileName: undefined,
      })) || []
    );
  }, [formData.images]);

  useEffect(() => {
    setVideos(
      formData.videos?.map((vid: any, idx: number) => ({
        id: vid.url || `server-vid-${idx}`,
        url: typeof vid === 'string' ? vid : vid.url,
        source: 'server',
        title: "Untitled Video",
        author: "Unknown",
        coverPreviewUrl: undefined,
        fileName: undefined,
      })) || []
    );
  }, [formData.videos]);

  useEffect(() => {
    if (ebooks.length > 0 && ebooks.some(b => b.source === 'local')) return; // Preserve local files
    setBooks(
      formData.ebooks?.map((book: any, idx: number) => ({
        id: book.url || `server-book-${idx}`,
        url: typeof book === 'string' ? book : book.url,
        source: 'server',
        title: book.title || "Untitled Book",
        author: "Unknown",
        coverPreviewUrl: undefined,
        fileName: undefined,
      })) || []
    );
  }, [formData.ebooks]);

  // draft autosave with improved messaging
  const draftKey = useMemo(() => `market-listing-draft-${companyId}-${product?.id || "new"}`, [companyId, product?.id]);
  const { status: autosaveStatus, restore, clear, getStatusMessage, setStatus: setAutosaveStatus } = useAutoSaveDraft(draftKey, formData, true);

  useEffect(() => {
    // restore draft if create flow and draft exists
    if (!product && !marketListItem) {
      const draft = restore();
      if (draft) {
        setFormData((d: any) => ({ ...d, ...draft }));
        setToast({ msg: "📝 Draft restored from your last session", type: "info" });
        setAutosaveStatus("restored");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute semantic sections based on category and mode
  const categoryKey = (formData.category as any)?.displayName?.trim?.() || (formData.category as any)?.name || "";
  const activeSections = useMemo(() => getSectionsForCategory(categoryKey, mode), [categoryKey, mode]);
  
  // Convert sections to step numbers for backward compatibility with existing FORM_COMPONENTS
  const stepsForCategory = useMemo(() => sectionsToSteps(activeSections), [activeSections]);
  const sectionStepLabels = useMemo(() => getSectionStepLabels(activeSections), [activeSections]);
  
  const lastStepIndex = stepsForCategory.length;
  const isFirstStep = step === 1;
  const isLastStep = step === lastStepIndex;
  const currentDynamicStep = stepsForCategory[step - 1] || 1;
  const currentSection = activeSections[step - 1];

  const FormComponent = useMemo(() => FORM_COMPONENTS[currentDynamicStep] ?? null, [currentDynamicStep]);

  // Navigate to a specific section (for Review section edit links)
  const navigateToSection = useCallback((section: SectionKey) => {
    const sectionIndex = activeSections.indexOf(section);
    if (sectionIndex >= 0) {
      setStep(sectionIndex + 1);
    }
  }, [activeSections]);

  // handle input generically
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const target = e.target as HTMLInputElement;
      const { name, type } = target;
      let val: any = target.value;

      if (type === "checkbox") {
        val = target.checked;
      } else if (
        [
          "discount",
          "buyingPrice",
          "sellingPrice",
          "finalPrice",
          "profitMargin",
          "quantity",
          "engineSize",
          "horsepower",
          "torque",
          "previousOwners",
          "year",
          "bathrooms",
          "hourlyRate",
          "minimumHours",
          "totalCapacity",
          "currentBookedCount",
          "providerRating",
          "tax",
          "shippingCost",
        ].includes(name)
      ) {
        const parsed = parseFloat(val as string);
        if (isNaN(parsed)) val = undefined;
        else val = parsed;
      } else if (val === "") {
        val = undefined;
      }

      updateField(name as keyof MarketListingForm, val as any);
      
      // Clear validation error for this field if it exists
      setValidationErrors(prev => prev.filter(e => e.field !== name));
    },
    [updateField]
  );

  const handleCategoryChange = useCallback(
    (cat: IStoreCategory | null) => {
      updateField("category", cat as any);
      updateField("productCategoryId", (cat as any)?.categoryId || "");
      updateField("subCategory", (cat as any)?.subcategories || {});
      updateField("subCategoryName", "");
      setValidationErrors(prev => prev.filter(e => e.field !== "productCategoryId"));
    },
    [updateField]
  );

  const handleSubCategoryChange = useCallback(
    (sub: any) => {
      updateField("subCategory", sub);
      updateField("subCategoryName", sub?.name || "");
    },
    [updateField]
  );

  const handleBrandChange = useCallback((b: string) => updateField("brand", b), [updateField]);

  const handleLocationSelect = useCallback((locationId: string | null, locationDetails?: ILocation | null) => {
    updateField("locationId", locationId ?? undefined);
    updateField("location", locationDetails ? JSON.stringify(locationDetails) : null);
    updateField("locationName", locationDetails?.name || "");
    updateField("latitude", locationDetails?.latitude ?? 0);
    updateField("longitude", locationDetails?.longitude ?? 0);
  }, [updateField]);

  // Mode change handler
  const handleModeChange = useCallback((newMode: ListingMode) => {
    setMode(newMode);
    setShowModeSelector(false);
    setStep(1); // Reset to first step when mode changes
  }, []);

  // drag to go back (mobile)
  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 80 && !isFirstStep) setStep((s) => Math.max(1, s - 1));
  };

  // Validate before submission
  const validateBeforeSubmit = useCallback((): boolean => {
    const result = validateFastMode(formData, images);
    setValidationErrors(result.errors);
    
    if (!result.isValid) {
      // Show first error as toast
      setToast({ msg: result.errors[0]?.message || "Please fill required fields", type: "error" });
      
      // Navigate to the section containing the first error
      const firstError = result.errors[0];
      if (firstError) {
        if (firstError.field === "name" || firstError.field === "description") {
          navigateToSection("core");
        } else if (firstError.field === "productCategoryId") {
          navigateToSection("category");
        } else if (firstError.field === "sellingPrice") {
          navigateToSection("pricing");
        }
      }
      
      return false;
    }
    
    return true;
  }, [formData, images, navigateToSection]);

  // Save / submit with validation
  const handleCreateListing = useCallback(async () => {
    // Validate required fields first
    if (!validateBeforeSubmit()) {
      return;
    }
    
    if (!window.confirm("Create listing?")) return;
    setLoading(true);
    try {

      // 1. Filter local files that need uploading
      const newImageItems = images.filter(i => i.source === "local" && i.file);
      const newVideoItems = videos.filter(v => v.source === "local" && v.file);
      const newBookItems = ebooks.filter(b => b.source === "local" && b.file);

      // 2. Create upload promises for new files (parallel uploads maintained)
      const uploadImagePromises = newImageItems.map(item =>
        uploadFiles([item.file!], "image", (progress, file) => {
          console.log(`Uploading image ${file.name}: ${progress}%`);
        }).then(result => ({ id: item.id, url: result[0].url }))
      );

      const uploadVideoPromises = newVideoItems.map(item =>
        uploadFiles([item.file!], "video", (progress, file) => {
          console.log(`Uploading video ${file.name}: ${progress}%`);
        }).then(result => ({ id: item.id, url: result[0].url }))
      );

      const uploadBookPromises = newBookItems.map(item =>
        uploadFiles([item.file!], "book", (progress, file) => {
          console.log(`Uploading book ${file.name}: ${progress}%`);
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

      const finalBookUrls = ebooks
        .map(book => (book.source === "server" ? book.url : bookUrlMap.get(book.id)!))
        .filter(Boolean);


      // 6. Build payload - maintains API contract with buildListingPayload
      // Category is converted to name string as required by the API
      const payload = buildListingPayload(
        {
          ...formData,
          type: ebookType ? "ebook" : formData.type,
          // Ensure category is sent as name string (API compliance)
          category: (formData.category as any)?.displayName || (formData.category as any)?.name || formData.category,
          companyId: companyId,
        } as MarketListingForm,
        finalImageUrls,
        finalVideoUrls,
        finalBookUrls
      );

      // 7. POST to api/admin/post-market-list (same endpoint, preserved)
      const res = await fetch(`${apiBaseUrl}/admin/post-market-list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.message || res.statusText || "Failed to create listing");
      }

      // Non-blocking success toast
      setToast({ msg: "✅ Listing created successfully!", type: "success" });
      clear();
      
      // Small delay before closing to show success message
      setTimeout(() => {
        setShowRequestProductModal(false);
      }, 1000);
      
    } catch (err: any) {
      console.error(err);
      setToast({ msg: err?.message || "Error creating listing", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [images, videos, ebooks, formData, companyId, clear, setShowRequestProductModal, validateBeforeSubmit, ebookType]);


  // progress %
  const progress = Math.round((step / Math.max(1, lastStepIndex)) * 100);

  // small animation container variants
  const containerVar = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { when: "beforeChildren", staggerChildren: 0.02 } },
  };

  // Render current step content
  const renderStepContent = () => {
    // Show review section if on review step
    if (currentSection === "review") {
      return (
        <ReviewSection
          formData={formData}
          images={images}
          videos={videos}
          ebooks={ebooks}
          sections={activeSections}
          onNavigateToSection={navigateToSection}
        />
      );
    }
    
    // Category step (step 1)
    if (currentSection === "category") {
      return (
        <CategoryPicker
          formData={{ category: formData.category, subCategory: formData.subCategory, brand: formData.brand }}
          categories={categories}
          filteredBrands={(formData.category as any)?.allBrands || []}
          onCategoryChange={handleCategoryChange}
          onSubCategoryChange={handleSubCategoryChange}
          onBrandChange={(b) => updateField("brand", b as any)}
        />
      );
    }
    
    // Pricing step with improved labels
    if (currentSection === "pricing") {
      return (
        <PricingDetails<MarketListingForm>
          formData={formData}
          setFormData={updateField}
          costField="buyingPrice"
          revenueField="sellingPrice"
          discountField="discount"
          finalField="finalPrice"
          marginField="profitMargin"
        />
      );
    }
    
    // Location step
    if (currentSection === "location") {
      return (
        <section className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Location Details</h2>
          <LocationPicker
            selectedLocationId={formData.locationId || null}
            availableLocations={locations}
            onLocationSelect={handleLocationSelect}
          />
        </section>
      );
    }
    
    // Dynamic form component for other steps
    if (FormComponent) {
      return (
        <Suspense fallback={<div className="p-6 text-center text-gray-500">Loading step…</div>}>
          <FormComponent
            formData={formData}
            handleInputChange={handleInputChange}
            setFormData={updateField as any}
            images={images}
            setImages={setImages}
            videos={videos}
            setVideos={setVideos}
            books={ebooks}
            setBooks={setBooks}
          />
        </Suspense>
      );
    }
    
    return <div className="p-6 text-sm text-gray-600">No form available for this step.</div>;
  };

  return (
    <Modal isOpen={showRequestProductModal} onClose={() => setShowRequestProductModal(false)} title="">
      <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">

        {/* Loading overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-white/70 backdrop-blur flex items-center justify-center"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <div className="text-gray-700">Uploading files…</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Bar */}
        <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-3">
            <button aria-label="close" onClick={() => setShowRequestProductModal(false)} className="p-2 rounded-md hover:bg-gray-100">
              <XMarkIcon className="h-5 w-5 text-gray-700" />
            </button>
            <div>
              <div className="text-sm font-semibold flex items-center gap-2">
                {marketListItem ? "Edit Listing" : "Add to Marketplace"}
                {!showModeSelector && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${mode === "FAST" ? "bg-indigo-100 text-indigo-700" : "bg-purple-100 text-purple-700"}`}>
                    {mode === "FAST" ? "Fast" : "Advanced"}
                  </span>
                )}
              </div>
              {!showModeSelector && (
                <div className="text-xs text-gray-500">
                  Step {step} of {lastStepIndex} • {SECTION_LABELS[currentSection]}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Mode toggle button */}
            {!showModeSelector && !marketListItem && (
              <button
                onClick={() => setShowModeSelector(true)}
                className="text-xs text-indigo-600 hover:text-indigo-800 underline"
              >
                Change mode
              </button>
            )}
            
            <div className="w-48 sm:w-64">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300" 
                  style={{ width: showModeSelector ? "0%" : `${progress}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <motion.div 
          ref={formRef}
          className="flex-1 overflow-y-auto px-4 py-4" 
          variants={containerVar} 
          initial="hidden" 
          animate="show"
        >
          {showModeSelector ? (
            <ModeSelector mode={mode} onModeChange={handleModeChange} />
          ) : (
            <>
              <Stepper 
                step={step} 
                stepsForCategory={stepsForCategory} 
                STEP_LABELS={sectionStepLabels}
                onStepClick={(s) => setStep(s)}
              />

              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 240, damping: 30 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                className="mt-4"
              >
                {renderStepContent()}
              </motion.div>
              
              {/* Validation errors display */}
              {validationErrors.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700 text-sm font-medium mb-1">
                    <ExclamationCircleIcon className="h-5 w-5" />
                    Please fix the following:
                  </div>
                  <ul className="text-red-600 text-sm list-disc list-inside">
                    {validationErrors.map((err, idx) => (
                      <li key={idx}>{err.message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Sticky Footer */}
        {!showModeSelector && (
          <div className="shrink-0 border-t bg-white/90 backdrop-blur-sm p-4 sticky bottom-0 left-0 right-0 z-30 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="hidden sm:flex items-center gap-2 text-gray-500 text-xs">
              <span>Progress: {progress}%</span>
              {getStatusMessage() && <span>• {getStatusMessage()}</span>}
            </div>

            <div className="flex w-full sm:w-auto justify-between sm:justify-end gap-3">
              {!isFirstStep && (
                <button
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  className="w-full sm:w-auto px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-2 text-gray-700"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span className="sm:hidden">Back</span>
                </button>
              )}

              {!isLastStep && (
                <button
                  onClick={() => setStep((s) => Math.min(lastStepIndex, s + 1))}
                  className="w-full sm:w-auto px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"
                >
                  <span className="sm:hidden">Next</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              )}

              {isLastStep && (
                <button
                  onClick={handleCreateListing}
                  disabled={loading}
                  className="w-full sm:w-auto px-4 py-2 rounded-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white flex items-center justify-center gap-2"
                >
                  {loading ? "Submitting..." : "Submit"}
                  <CheckCircleIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </Modal>
  );
}

interface AddToProductMarketModalProps {
  showRequestProductModal: boolean;
  setShowRequestProductModal: (open: boolean) => void;
  product?: ProductForm | undefined | null;
  marketListItem?: MarketListingForm | undefined | null;
  companyId: string;
  categories: IStoreCategory[];
  locations: ILocation[];
  ebookType?: boolean;
}