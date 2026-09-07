"use client";

import React, { ReactNode, useEffect, useMemo, useState, useCallback, Suspense } from 'react';
import Modal from './Modal';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XMarkIcon,
  BoltIcon,
  Cog6ToothIcon,
  TagIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  MapPinIcon,
  DocumentMagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import Stepper from './Stepper';
import { CATEGORY_STEPS } from '@/constant/CATEGORY_STEPS';
import { FORM_COMPONENTS } from '@/constant/FORM_COMPONENTS';
import ProductVariants from "@/components/ProductVariants";
import { STEP_LABELS } from '@/constant/STEP_LABELS';
import CategoryPicker from './CategoryPicker';
import PricingDetails from './PricingDetails';
import LocationPicker from './LocationPicker';
import ImageUploader, { UnifiedMediaItem } from './ImageUploader';
import { ProductForm, IStoreCategory, ILocation } from '@/types/typings';

// NOTE: keep API constants consistent with your app's env
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

////////////////////////////////////////////////////////////////////////////////
// Fast Mode Section Types
// These define the minimal sections for Fast Mode workflow
////////////////////////////////////////////////////////////////////////////////
type FastModeSection = "core" | "details" | "pricing" | "variants" | "media" | "location" | "review";

const FAST_MODE_SECTIONS: { id: FastModeSection; label: string; icon: React.ElementType }[] = [
  { id: "core", label: "Core Details", icon: TagIcon },
  { id: "details", label: "Details", icon: Cog6ToothIcon },
  { id: "pricing", label: "Pricing", icon: CurrencyDollarIcon },
  { id: "variants", label: "Variants", icon: PhotoIcon },
  { id: "media", label: "Media", icon: PhotoIcon },
  { id: "location", label: "Location", icon: MapPinIcon },
  { id: "review", label: "Review", icon: DocumentMagnifyingGlassIcon },
];

////////////////////////////////////////////////////////////////////////////////
// Utilities: lightweight Toast + debounce
////////////////////////////////////////////////////////////////////////////////
function useDebouncedCallback<T extends (...a: any[]) => void>(fn: T, wait = 1000) {
  const t = React.useRef<number | null>(null);
  return React.useCallback((...args: Parameters<T>) => {
    if (t.current) window.clearTimeout(t.current);
    t.current = window.setTimeout(() => fn(...args), wait);
  }, [fn, wait]);
}

function Toast({ msg, onClose }: { msg: string; onClose?: () => void }) {
  useEffect(() => {
    const id = setTimeout(() => onClose && onClose(), 3000);
    return () => clearTimeout(id);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-[9999] bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg">{msg}</div>
  );
}

////////////////////////////////////////////////////////////////////////////////
// Lightweight auto-save hook (localStorage draft)
////////////////////////////////////////////////////////////////////////////////
function useAutoSaveDraft(key: string, data: any, enabled = true) {
  const [status, setStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const save = useCallback((payload: any) => {
    if (!enabled) return;
    setStatus('saving');
    try {
      localStorage.setItem(key, JSON.stringify(payload));
      setStatus('saved');
    } catch (e) {
      setStatus('idle');
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

  return { status, restore, clear };
}

// Represents a file that already exists on the server
// interface ExistingMedia {
//   index?: number; // Optional index for ordering
//   url: string;
//   source: 'server';
// }

// Represents a new file selected by the user, not yet uploaded
// interface NewMedia {
//   id: string; // For stable keys in React  
//   index?: number; // Optional index for ordering
//   file: File;
//   url: string; // Blob URL for preview
//   source: 'local';
// }

// A discriminated union for robustly handling both types
// type MediaItem = ExistingMedia | NewMedia;

// Specific type for books, as they have more metadata
// interface BookItem {
//   id: string;
//   title: string;
//   author: string;
//   coverFile: File | null;
//   coverPreviewUrl: string | null;
//   bookFile: File | null;
//   source: 'local' | 'server'; // To distinguish new books from existing ones
//   url?: string; // URL for existing book files from the server
// }

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

      console.log(`✅ Uploaded: ${file.name} (${contentType}) → ${publicUrl}`);
      return { url: publicUrl, key, contentType };
    } catch (err) {
      console.error("❌ Upload error:", err);
      throw err;
    }
  });

  return Promise.all(uploads);
}


////////////////////////////////////////////////////////////////////////////////
// Payload builder to structure data for the backend
////////////////////////////////////////////////////////////////////////////////
function buildProductPayload(formData: ProductForm, finalImages: { index: number; url: string }[], 
  finalBooks: { index: number; url: string }[],
  finalVideos: { index: number; url: string }[] = []) {
  return {
    ...formData,
    images: finalImages,
    ebooks: finalBooks,
    videos: finalVideos,
  };
}

////////////////////////////////////////////////////////////////////////////////
// Hook to initialize and manage the product form state
////////////////////////////////////////////////////////////////////////////////
function useProductForm(product: Partial<ProductForm> | null, companyId: string) {
  const getInitial = useCallback((): ProductForm => ({
    id: product?.id || '',
    companyId,
    name: product?.name || '',
    description: product?.description || '',
    longDescription: product?.longDescription || '',
    tags: product?.tags || [],
    category: product?.category || null,
    subCategory: product?.subCategory || null,
    subCategoryName: product?.subCategoryName || '',
    brand: product?.brand || null,
    model: product?.model || '',
    color: product?.color || [],
    size: product?.size || [],
    weight: product?.weight || [],
    condition: product?.condition || '',
    dimensions: product?.dimensions || '',
    material: product?.material || [],
    images: product?.images || [],
    videos: product?.videos || [],
    ebooks: product?.ebooks || [],
    digitalUrl: product?.digitalUrl || '',
    autoDeliver: !!product?.autoDeliver,
    isAvailable: product?.isAvailable ?? false,
    isOnOffer: product?.isOnOffer ?? false,
    isFlashDeal: product?.isFlashDeal ?? false,
    isNewArrival: product?.isNewArrival ?? false,
    isDiscounted: product?.isDiscounted ?? false,
    isFeatured: product?.isFeatured ?? false,
    quantity: product?.quantity ?? 1,
    costPrice: product?.costPrice ?? 0,
    sellingPrice: product?.sellingPrice ?? 0,
    discount: product?.discount ?? 0,
    finalPrice: product?.finalPrice ?? 0,
    profitMargin: product?.profitMargin ?? 0,
    pricingTiers: product?.pricingTiers || [],
    startDealDate: product?.startDealDate || null,
    endDealDate: product?.endDealDate || null,
    make: product?.make || '',
    trim: product?.trim || '',
    type: product?.type || '',
    mileage: product?.mileage || '',
    engineType: product?.engineType || '',
    engineSize: product?.engineSize ?? 0,
    transmission: product?.transmission || '',
    drivetrain: product?.drivetrain || '',
    vin: product?.vin || '',
    logbookStatus: product?.logbookStatus || 'Available',
    serviceHistory: product?.serviceHistory || 'Full',
    negotiable: product?.negotiable ?? false,
    financingAvailable: product?.financingAvailable ?? false,
    tradeIn: product?.tradeIn ?? false,
    features: product?.features || [],
    author: product?.author || '',
    publisher: product?.publisher || '',
    isbn: product?.isbn || '',
    fabricComposition: product?.fabricComposition || '',
    careInstructions: product?.careInstructions || '',
    energyRating: product?.energyRating || '',
    warrantyPeriod: product?.warrantyPeriod || '',
    ingredients: product?.ingredients || '',
    usageInstructions: product?.usageInstructions || '',
    expirationDate: product?.expirationDate || null,
    option: product?.option || [],
    amenities: product?.amenities || [],
    bedrooms: product?.bedrooms ?? 0,
    studios: product?.studios ?? 0,
    bathrooms: product?.bathrooms ?? 0,
    area: product?.area || '',
    propertyTypeId: product?.propertyTypeId || '',
    serviceSchedule: product?.serviceSchedule || '',
    year: product?.year ?? new Date().getFullYear(),
    availabilityStart: product?.availabilityStart || '',
    availabilityEnd: product?.availabilityEnd || '',
    location: product?.location || {},
    locationName: product?.locationName || '',
    latitude: product?.latitude ?? null,
    longitude: product?.longitude ?? null,
    contact: product?.contact || '',
    contactName: product?.contactName || '',
    email: product?.email || '',
    status: product?.status || 'ACTIVE',
    collectionId: product?.collectionId || '',
    hourlyRate: product?.hourlyRate,
    minimumHours: product?.minimumHours,
    minNoticePeriod: product?.minNoticePeriod,
    maxBookingAhead: product?.maxBookingAhead,
    totalCapacity: product?.totalCapacity,
    deliveryMethod: product?.deliveryMethod,
    fulfillmentStatus: product?.fulfillmentStatus,
    providerRating: product?.providerRating,
    bookingSlots: product?.bookingSlots,
    listingTransactionType: product?.listingTransactionType,
    listingMarketStatus: product?.listingMarketStatus,
    listingSystemStatus: product?.listingSystemStatus,
  } as ProductForm), [product, companyId]);

  const [formData, setFormData] = useState<ProductForm>(getInitial);

  // DERIVED PRICING: Compute finalPrice and profitMargin from costPrice, sellingPrice, discount via useEffect
  // These are read-only in UI but present in payload
  useEffect(() => {
    // Add null/undefined checks to prevent NaN values
    const sellingPrice = formData.sellingPrice ?? 0;
    const costPrice = formData.costPrice ?? 0;
    const discount = formData.discount ?? 0;
    const calculatedFinalPrice = Math.max(sellingPrice - (sellingPrice * discount) / 100, 0);
    const calculatedProfitMargin = costPrice > 0 ? ((calculatedFinalPrice - costPrice) / costPrice) * 100 : 0;
    if (formData.finalPrice !== calculatedFinalPrice || formData.profitMargin !== calculatedProfitMargin) {
      setFormData((f) => ({ ...f, finalPrice: calculatedFinalPrice, profitMargin: calculatedProfitMargin }));
    }
  }, [formData.costPrice, formData.sellingPrice, formData.discount]);

  const updateField = useCallback(<K extends keyof ProductForm>(name: K, value: ProductForm[K]) => {
    setFormData((f) => ({ ...f, [name]: value }));
  }, []);

  return { formData, setFormData, updateField };
}

////////////////////////////////////////////////////////////////////////////////
// Fast Mode Review Component
// Displays a summary of all entered data with quick edit navigation
////////////////////////////////////////////////////////////////////////////////
function FastModeReview({
  formData,
  images,
  videos,
  books,
  onJumpTo,
}: {
  formData: ProductForm;
  images: UnifiedMediaItem[];
  videos: UnifiedMediaItem[];
  books: UnifiedMediaItem[];
  onJumpTo: (section: FastModeSection) => void;
}) {
  // Safely extract category display name with proper fallback chain
  const category = formData.category as { displayName?: string; name?: string } | null;
  const categoryName = category?.displayName || category?.name || "Not selected";

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Review Your Product</h2>
      <p className="text-gray-500 text-sm">Double-check all details before submitting.</p>

      {/* Core Section */}
      <div className="bg-gray-50 rounded-lg p-4 border">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <TagIcon className="h-5 w-5 text-indigo-500" />
            Core Details
          </h3>
          <button
            onClick={() => onJumpTo("core")}
            className="text-sm text-indigo-600 hover:underline"
          >
            Edit
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-gray-500">Name:</span> {formData.name || "—"}</div>
          <div><span className="text-gray-500">Category:</span> {categoryName}</div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-gray-50 rounded-lg p-4 border">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
            Pricing
          </h3>
          <button
            onClick={() => onJumpTo("pricing")}
            className="text-sm text-indigo-600 hover:underline"
          >
            Edit
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-gray-500">Cost Price:</span> {formData.costPrice || 0}</div>
          <div><span className="text-gray-500">Selling Price:</span> {formData.sellingPrice || 0}</div>
          <div><span className="text-gray-500">Discount:</span> {formData.discount || 0}%</div>
          {/* DERIVED PRICING: finalPrice and profitMargin are computed via useEffect, read-only in UI */}
          <div><span className="text-gray-500">Final Price:</span> {formData.finalPrice?.toFixed(2) || "0.00"}</div>
          <div><span className="text-gray-500">Profit Margin:</span> {formData.profitMargin?.toFixed(2) || "0.00"}%</div>
        </div>
      </div>

      {/* Media Section */}
      <div className="bg-gray-50 rounded-lg p-4 border">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <PhotoIcon className="h-5 w-5 text-purple-500" />
            Media
          </h3>
          <button
            onClick={() => onJumpTo("media")}
            className="text-sm text-indigo-600 hover:underline"
          >
            Edit
          </button>
        </div>
        <div className="text-sm">
          <span className="text-gray-500">Images:</span> {images.length} |{" "}
          <span className="text-gray-500">Videos:</span> {videos.length} |{" "}
          <span className="text-gray-500">Books:</span> {books.length}
        </div>
        {images.length > 0 && (
          <div className="flex gap-2 mt-2 overflow-x-auto">
            {images.slice(0, 4).map((img) => (
              <img
                key={img.id || img.url}
                src={img.url}
                alt="Preview"
                className="h-16 w-16 object-cover rounded"
              />
            ))}
            {images.length > 4 && (
              <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                +{images.length - 4}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Location Section */}
      <div className="bg-gray-50 rounded-lg p-4 border">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <MapPinIcon className="h-5 w-5 text-red-500" />
            Location
          </h3>
          <button
            onClick={() => onJumpTo("location")}
            className="text-sm text-indigo-600 hover:underline"
          >
            Edit
          </button>
        </div>
        <div className="text-sm">
          {formData.locationName || formData.locationId ? (
            <span>{formData.locationName || "Location selected"}</span>
          ) : (
            <span className="text-gray-400 italic">No location selected (optional)</span>
          )}
        </div>
      </div>
    </div>
  );
}

////////////////////////////////////////////////////////////////////////////////
// Fast Mode Stepper Component
// Horizontal pill-style navigation for Fast Mode sections
////////////////////////////////////////////////////////////////////////////////
function FastModeStepper({
  currentSection,
  onSectionChange,
}: {
  currentSection: FastModeSection;
  onSectionChange: (section: FastModeSection) => void;
}) {
  return (
    <div className="flex justify-center mb-4">
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-full overflow-x-auto">
        {FAST_MODE_SECTIONS.map((section, idx) => {
          const Icon = section.icon;
          const isActive = currentSection === section.id;
          const currentIdx = FAST_MODE_SECTIONS.findIndex((s) => s.id === currentSection);
          const isCompleted = idx < currentIdx;

          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-indigo-600 text-white shadow"
                  : isCompleted
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "text-gray-500 hover:bg-gray-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{section.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

////////////////////////////////////////////////////////////////////////////////
// Main AddProductModal Component
////////////////////////////////////////////////////////////////////////////////
export default function AddProductModal({
  showRequestProductModal,
  setShowRequestProductModal,
  product,
  companyId,
  categories,
  locations = [],
  refreshInventory
}: {
  showRequestProductModal: boolean;
  setShowRequestProductModal: (open: boolean) => void;
  product: ProductForm | null;
  companyId: string;
  categories: IStoreCategory[];
  // LOCATION SELECTION: Optional array of available locations for LocationPicker
  locations?: ILocation[];
  // Callback to refresh inventory list after product changes 
   refreshInventory: () => void;
}) {
  const { formData, setFormData, updateField } = useProductForm(product || null, companyId);
  
  // MODE TOGGLE: Fast Mode (default) vs Advanced Mode
  // Fast Mode provides a simplified 5-section workflow
  // Advanced Mode preserves the existing numeric step flow using CATEGORY_STEPS + FORM_COMPONENTS
  const [mode, setMode] = useState<"fast" | "advanced">("fast");
  
  // Fast Mode section state
  const [fastSection, setFastSection] = useState<FastModeSection>("core");
  
  // Advanced Mode step state
  const [step, setStep] = useState(1);

  // Unified media states with proper initialization from existing product data
  const [images, setImages] = useState<UnifiedMediaItem[]>(
    product?.images?.map((img: any, idx: number) => ({ 
      id: img.url || `server-img-${idx}`,
      url: typeof img === 'string' ? img : img.url, 
      source: 'server' as const,
      title: "Untitled Image",
      author: "Unknown",
    })) || []
  );
  const [videos, setVideos] = useState<UnifiedMediaItem[]>(
    product?.videos?.map((vid: any, idx: number) => ({ 
      id: vid.url || `server-vid-${idx}`,
      url: typeof vid === 'string' ? vid : vid.url, 
      source: 'server' as const,
      title: "Untitled Video",
      author: "Unknown",
    })) || []
  );
  const [books, setBooks] = useState<UnifiedMediaItem[]>(
    product?.ebooks?.map((book: any, idx: number) => ({
      id: book.url || `server-book-${idx}`,
      url: typeof book === 'string' ? book : book.url,
      source: 'server' as const,
      title: book.title || "Untitled Book",
      author: book.author || "Unknown",
    })) || []
  );

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // AUTOSAVE & DRAFT RESTORE: Persists form data to localStorage to prevent data loss
  const draftKey = useMemo(() => `product-draft-${companyId}-${product?.id || 'new'}`, [companyId, product?.id]);
  const { status: autosaveStatus, restore, clear } = useAutoSaveDraft(draftKey, formData, true);

  useEffect(() => {
    if (!product) {
      const draft = restore();
      if (draft) {
        setFormData((d: any) => ({ ...d, ...draft }));
        setToast('Restored unsaved draft');
      }
    }
  }, [product, restore, setFormData, setToast]);

  // Advanced Mode: Dynamic steps based on category
  // const categoryKey = formData.category?.displayName?.trim() || '';
  const categoryKey = useMemo(() => {
                          const categoryName =
                            (formData.category as any)?.displayName?.trim?.() ||
                            (formData.category as any)?.name ||
                            "";
  
                          // For Cars, use the selected subcategory name
                          if (categoryName.toLowerCase() === "cars") {
                            return formData.subCategoryName || categoryName;
                          }
  
                          return categoryName;
                        }, [formData.category, formData.subCategoryName]);
                        
  const stepsForCategory = useMemo(() => CATEGORY_STEPS[categoryKey] || [1, 2, 3], [categoryKey]);
  const lastStepIndex = stepsForCategory.length;
  const isFirstStep = step === 1;
  const isLastStep = step === lastStepIndex;
  const currentDynamicStep = stepsForCategory[step - 1] || 1;
  const FormComponent = FORM_COMPONENTS[currentDynamicStep] ?? null;

  // Fast Mode: Navigation helpers
  // Compute fastSectionIndex once and reuse to avoid multiple findIndex calls
  const fastSectionIndex = useMemo(
    () => FAST_MODE_SECTIONS.findIndex((s) => s.id === fastSection),
    [fastSection]
  );
  const fastProgress = Math.round(((fastSectionIndex + 1) / FAST_MODE_SECTIONS.length) * 100);
  const isFirstFastSection = fastSectionIndex === 0;
  const isLastFastSection = fastSectionIndex === FAST_MODE_SECTIONS.length - 1;

  const goToNextFastSection = useCallback(() => {
    if (fastSectionIndex < FAST_MODE_SECTIONS.length - 1) {
      setFastSection(FAST_MODE_SECTIONS[fastSectionIndex + 1].id);
    }
  }, [fastSectionIndex]);

  const goToPrevFastSection = useCallback(() => {
    if (fastSectionIndex > 0) {
      setFastSection(FAST_MODE_SECTIONS[fastSectionIndex - 1].id);
    }
  }, [fastSectionIndex]);

  // Input change handler supporting numeric fields
  // Default to 0 instead of undefined for numeric fields to ensure consistent pricing calculations
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, type, value } = target;
    let val: any = type === 'checkbox' ? target.checked : value;
    
    // Parse numeric fields - default to 0 if NaN to ensure consistent behavior
    const numericFields = [
      "costPrice", "sellingPrice", "discount", "finalPrice", "profitMargin",
      "quantity", "engineSize", "year", "bathrooms", "hourlyRate", "minimumHours",
      "totalCapacity", "providerRating"
    ];
    if (numericFields.includes(name)) {
      const parsed = parseFloat(val as string);
      val = isNaN(parsed) ? 0 : parsed;
    } else if (val === "") {
      val = undefined;
    }
    
    updateField(name as keyof ProductForm, val as any);
  }, [updateField]);

  const handleCategoryChange = useCallback((cat: IStoreCategory | null) => {
    updateField('category', cat as any);
    updateField('subCategory', null as any);
    updateField('brand', null as any);
    // Also update productCategoryId for API compatibility
    if (cat?.categoryId) {
      updateField('productCategoryId' as keyof ProductForm, cat.categoryId as any);
    }
  }, [updateField]);

  const handleSubCategoryChange = useCallback((sub: any) => {
    updateField('subCategory', sub);
    updateField('subCategoryName', sub?.name || '');
  }, [updateField]);

  // LOCATION SELECTION: Handler for LocationPicker to set location-related fields
  const handleLocationSelect = useCallback((locationId: string | null, locationDetails?: ILocation | null) => {
    updateField('locationId' as keyof ProductForm, locationId ?? undefined as any);
    updateField('location', locationDetails ? JSON.stringify(locationDetails) : null as any);
    updateField('locationName', locationDetails?.name || '' as any);
    updateField('latitude', locationDetails?.latitude ?? null as any);
    updateField('longitude', locationDetails?.longitude ?? null as any);
  }, [updateField]);

  // Advanced Mode navigation
  const goNext = useCallback(async () => {
    setStep((s) => Math.min(lastStepIndex, s + 1));
  }, [lastStepIndex]);

  const goPrev = useCallback(() => setStep((s) => Math.max(1, s - 1)), []);
  
  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100 && !isFirstStep) goPrev();
  };

  // VALIDATION: Minimal required fields before submit
  // Requires: name, productCategoryId (category), sellingPrice
  // Media and location are optional unless enforced by API
  const handleSave = useCallback(async () => {
    // Minimal validation
    if (!formData.name || !formData.name.trim()) {
      setToast("Please enter a product name");
      return;
    }
    if (!formData.category && !formData.productCategoryId) {
      setToast("Please select a category");
      return;
    }
    if (!formData.sellingPrice || formData.sellingPrice <= 0) {
      setToast("Please enter a valid selling price");
      return;
    }

    if (!window.confirm('Are you sure you want to save this product?')) return;
    setLoading(true);

    try {
        // 1. Filter local files that need uploading
        const newImageItems = images.filter(i => i.source === "local" && i.file);
        const newVideoItems = videos.filter(v => v.source === "local" && v.file);
        const newBookItems = books.filter(b => b.source === "local" && b.file);

        // 2. Create upload promises for new files
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

        const finalBookUrls = books
          .map(book => (book.source === "server" ? book.url : bookUrlMap.get(book.id)!))
          .filter(Boolean);


        // 6. Build final payload
        const payload = { ...formData, images: finalImageUrls, videos: finalVideoUrls, ebooks: finalBookUrls };
        
        const res = await fetch(`${apiBaseUrl}/admin/post-product`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(await res.text());
        
        setToast('Product saved successfully.');
        clear();
        setShowRequestProductModal(false);
        refreshInventory();

    } catch (err: any) {
        console.error("Save error:", err);
        setToast(err?.message || 'Error: Could not save product.');
    } finally {
        setLoading(false);
    }
  }, [formData, images, books, videos, clear, setShowRequestProductModal, refreshInventory]);

  // Progress calculations for both modes
  const progress = Math.round((step / Math.max(1, lastStepIndex)) * 100);

  // Extract typed category for cleaner code
  const categoryWithBrands = formData.category as { allBrands?: string[] } | null;

  // FAST MODE: Render section content based on current fastSection
  const renderFastModeContent = () => {
    switch (fastSection) {
      case "core":
        return (
          <div className="space-y-6">
            {/* Category Picker - reuses existing component */}
            <CategoryPicker
              formData={{ category: formData.category, subCategory: formData.subCategory, brand: formData.brand }}
              categories={categories}
              filteredBrands={categoryWithBrands?.allBrands || []}
              onCategoryChange={handleCategoryChange}
              onSubCategoryChange={handleSubCategoryChange}
              onBrandChange={(b) => updateField("brand", b as any)}
            />
          </div>
        );

      case "details":
        return (
        <div className="space-y-6">            
            {/* Inline Product Name Input for Fast Mode */}
            <div className="bg-white rounded-lg border p-4 shadow-sm">
              <label htmlFor="fast-name" className="block text-sm font-medium text-gray-700 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                id="fast-name"
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                placeholder="Enter product name..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">This will be the main title of your product.</p>
            </div>

            {/* Optional: Description field */}
            <div className="bg-white rounded-lg border p-4 shadow-sm">
              <label htmlFor="fast-description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                id="fast-description"
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                placeholder="Describe your product..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
              />
            </div>
          </div>
        );
      
      case "pricing":
        return (
          // DERIVED PRICING: finalPrice and profitMargin are computed via useEffect in useProductForm
          // These are read-only in the UI but present in the payload sent to the API
          <PricingDetails<ProductForm>
            formData={formData}
            setFormData={updateField as any}
            costField="costPrice"
            revenueField="sellingPrice"
            discountField="discount"
            finalField="finalPrice"
            marginField="profitMargin"
          />
        );

      case "variants":
        return (
          // VARIANTS: Reuses VariantsManager component for sizes, colors, materials, etc.
          <ProductVariants
            formData={formData}
            setFormData={updateField as any}
          />
        );

      case "media":
        return (
          // MEDIA UPLOADS: Reuses ImageUploader component for images/videos/books
          // Supports parallel uploads via uploadFiles helper; merges server and local items
          <ImageUploader
            images={images}
            setImages={setImages}
            videos={videos}
            setVideos={setVideos}
            books={books}
            setBooks={setBooks}
          />
        );
      
      case "location":
        return (
          // LOCATION SELECTION: Optional location picker for Fast Mode
          // Sets locationId, location (JSON), locationName, latitude, longitude in form data
          <section className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Location Details (Optional)</h2>
            <p className="text-sm text-gray-500 mb-4">Select where this product is available or located.</p>
            <LocationPicker
              selectedLocationId={formData.locationId || null}
              availableLocations={locations}
              onLocationSelect={handleLocationSelect}
            />
          </section>
        );
      
      case "review":
        return (
          // REVIEW STEP: Summary of all entered data with quick edit navigation
          <FastModeReview
            formData={formData}
            images={images}
            videos={videos}
            books={books}
            onJumpTo={setFastSection}
          />
        );
      
      default:
        return null;
    }
  };

  return (
   <Modal isOpen={showRequestProductModal} onClose={() => setShowRequestProductModal(false)} title="" showCloseButton={false} >
    <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-white/70 backdrop-blur flex items-center justify-center"
          >
            <div className="animate-pulse text-gray-700">Saving…</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar with Mode Toggle */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <button aria-label="close" onClick={() => setShowRequestProductModal(false)} className="p-2 rounded-md hover:bg-gray-100">
            <XMarkIcon className="h-5 w-5 text-gray-700" />
          </button>
          <div>
            <div className="text-sm font-semibold">{product ? "Edit Product" : "Add Product"}</div>
            <div className="text-xs text-gray-500">
              {mode === "fast" 
                ? `${FAST_MODE_SECTIONS.find(s => s.id === fastSection)?.label || "Core"}`
                : `Step ${step} of ${lastStepIndex}`}
            </div>
          </div>
        </div>

        {/* Mode Toggle + Progress */}
        <div className="flex items-center gap-3">
          {/* FAST MODE VS ADVANCED MODE TOGGLE */}
          <div className="flex items-center bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setMode("fast")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                mode === "fast"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
              title="Fast Mode - Simplified 5-section flow"
            >
              <BoltIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Fast</span>
            </button>
            <button
              onClick={() => setMode("advanced")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                mode === "advanced"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
              title="Advanced Mode - Full step-by-step flow based on category"
            >
              <Cog6ToothIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Advanced</span>
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-32 hidden sm:block">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300" 
                style={{ width: `${mode === "fast" ? fastProgress : progress}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        
        {/* FAST MODE UI */}
        {mode === "fast" && (
          <>
            <FastModeStepper currentSection={fastSection} onSectionChange={setFastSection} />
            <motion.div
              key={fastSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 240, damping: 30 }}
              className="mt-4"
            >
              {renderFastModeContent()}
            </motion.div>
          </>
        )}

        {/* ADVANCED MODE UI - Preserves existing numeric step flow using CATEGORY_STEPS + FORM_COMPONENTS */}
        {mode === "advanced" && (
          <>
            <Stepper step={step} stepsForCategory={stepsForCategory} STEP_LABELS={STEP_LABELS} />
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
              {/* Step 1 always renders CategoryPicker */}
              {step === 1 ? (
                <CategoryPicker
                  formData={{ category: formData.category, subCategory: formData.subCategory, brand: formData.brand }}
                  categories={categories}
                  filteredBrands={categoryWithBrands?.allBrands || []}
                  onCategoryChange={handleCategoryChange}
                  onSubCategoryChange={handleSubCategoryChange}
                  onBrandChange={(b) => updateField("brand", b as any)}
                />
              ) : currentDynamicStep === 7 ? (
                // Pricing step (7) uses PricingDetails with derived read-only values
                <PricingDetails<ProductForm>
                  formData={formData}
                  setFormData={updateField as any}
                  costField="costPrice"
                  revenueField="sellingPrice"
                  discountField="discount"
                  finalField="finalPrice"
                  marginField="profitMargin"
                />
              ) : currentDynamicStep === 18 ? (
                // Location step (18) renders LocationPicker directly
                <section className="bg-white p-6 rounded-lg shadow-sm border">
                  <h2 className="text-lg font-semibold mb-4">Location Details</h2>
                  <LocationPicker
                    selectedLocationId={formData.locationId || null}
                    availableLocations={locations}
                    onLocationSelect={handleLocationSelect}
                  />
                </section>
              ) : FormComponent ? (
                // Other steps render via FORM_COMPONENTS mapping
                <Suspense fallback={<div className="p-6 text-center text-gray-500">Loading step…</div>}>
                  <FormComponent
                    formData={formData}
                    setFormData={updateField as any}
                    handleInputChange={handleInputChange}
                    filteredSubCategories={formData.category?.subcategories || []}
                    filteredBrands={categoryWithBrands?.allBrands || []}
                    images={images}
                    setImages={setImages}
                    videos={videos}
                    setVideos={setVideos}
                    books={books}
                    setBooks={setBooks}
                  />
                </Suspense>
              ) : (
                <div className="p-6 text-sm text-gray-600">No form available for this step.</div>
              )}
            </motion.div>
          </>
        )}
      </div>

      {/* Sticky Footer */}
      <div className="shrink-0 border-t bg-white/90 backdrop-blur-sm p-4 sticky bottom-0 left-0 right-0 z-30 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="hidden sm:flex items-center gap-2 text-gray-500 text-xs">
          Progress: {mode === "fast" ? fastProgress : progress}%{" "}
          {/* AUTOSAVE STATUS: Subtle indicator for save state */}
          {autosaveStatus === "saving" ? "• saving…" : autosaveStatus === "saved" ? "• saved" : ""}
        </div>

        {/* FAST MODE NAVIGATION */}
        {mode === "fast" && (
          <div className="flex w-full sm:w-auto justify-between sm:justify-end gap-3">
            {!isFirstFastSection && (
              <button
                onClick={goToPrevFastSection}
                className="w-full sm:w-auto px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-2 text-gray-700"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span className="sm:hidden">Back</span>
              </button>
            )}

            {!isLastFastSection && (
              <button
                onClick={goToNextFastSection}
                className="w-full sm:w-auto px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"
              >
                <span className="sm:hidden">Next</span>
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            )}

            {isLastFastSection && (
              <button
                onClick={handleSave}
                className="w-full sm:w-auto px-4 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
              >
                Save
                <CheckCircleIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* ADVANCED MODE NAVIGATION */}
        {mode === "advanced" && (
          <div className="flex w-full sm:w-auto justify-between sm:justify-end gap-3">
            {!isFirstStep && (
              <button
                onClick={goPrev}
                className="w-full sm:w-auto px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-2 text-gray-700"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span className="sm:hidden">Back</span>
              </button>
            )}

            {!isLastStep && (
              <button
                onClick={goNext}
                className="w-full sm:w-auto px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"
              >
                <span className="sm:hidden">Next</span>
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            )}

            {isLastStep && (
              <button
                onClick={handleSave}
                className="w-full sm:w-auto px-4 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
              >
                Save
                <CheckCircleIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
   </Modal>
  );
}
