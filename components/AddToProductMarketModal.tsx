"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  Suspense,
} from "react";
import Modal from "./Modal";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XMarkIcon,
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

// ✅ Unified Media Types
// interface UnifiedMediaItem {
//   id?: string;
//   file?: File;
//   url: string;
//   source: "local" | "server";
// }
// interface UnifiedMediaItem {
//   id?: string;
//   title?: string;
//   author?: string;
//   coverPreviewUrl?: string | null;
//   file?: File;
//   bookFile?: File | null;
//   bookFileName?: string;
//   url?: string;
//   source: "local" | "server";
// }

////////////////////////////////////////////////////////////////////////////////
// Constants & API
////////////////////////////////////////////////////////////////////////////////
const API_URL = "/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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

function Toast({ msg, onClose }: { msg: string; onClose?: () => void }) {
  useEffect(() => {
    const id = setTimeout(() => onClose && onClose(), 3000);
    return () => clearTimeout(id);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-[9999] bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg">
      {msg}
    </div>
  );
}

function useAutoSaveDraft(key: string, data: any, enabled = true) {
  const [status, setStatus] = useState<"saved" | "saving" | "idle">("idle");
  const save = useCallback((payload: any) => {
    if (!enabled) return;
    setStatus("saving");
    try {
      localStorage.setItem(key, JSON.stringify(payload));
      setStatus("saved");
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

  return { status, restore, clear };
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
      `${apiBaserUrl}/upload-url?filename=${encodeURIComponent(file.name)}&type=${type}&contentType=${encodeURIComponent(file.type)}`
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

// export async function uploadFiles(
//   files: File[],
//   type: "image" | "video" | "book",
//   onProgress?: (progress: number, file: File) => void
// ): Promise<{ url: string; key: string; contentType: string }[]> {
//   if (!files?.length) return [];

//   const uploads = files.map(async (file) => {
//     try {
//       // ✅ Step 1: Request a signed upload URL from your API
//       const res = await fetch(
//         `${apiBaserUrl}/upload-url?filename=${encodeURIComponent(file.name)}&type=${type}&contentType=${encodeURIComponent(file.type)}`
//       );

//       if (!res.ok) {
//         const text = await res.text();
//         throw new Error(`Failed to get signed URL: ${text}`);
//       }

//       const { uploadUrl, publicUrl, key, contentType } = await res.json();

//       // ✅ Step 2: Upload directly to S3
//       await new Promise<void>((resolve, reject) => {
//         const xhr = new XMLHttpRequest();
//         xhr.open("PUT", uploadUrl);
//         xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

//         xhr.upload.onprogress = (event) => {
//           if (event.lengthComputable && onProgress) {
//             const progress = Math.round((event.loaded / event.total) * 100);
//             onProgress(progress, file);
//           }
//         };

//         xhr.onload = () => {
//           if (xhr.status === 200) resolve();
//           else reject(new Error(`Upload failed for ${file.name}: ${xhr.status}`));
//         };

//         xhr.onerror = () => reject(new Error(`Network error during upload for ${file.name}`));
//         xhr.send(file);
//       });

//       console.log(`✅ Uploaded: ${file.name} (${contentType}) → ${publicUrl}`);
//       return { url: publicUrl, key, contentType };
//     } catch (err) {
//       console.error("❌ Upload error:", err);
//       throw err;
//     }
//   });

//   return Promise.all(uploads);
// }

// async function uploadFiles(files: File[], type: "image" | "video" | "book"): Promise<{ url: string }[]> {
//   if (!files?.length) return [];

//   const uploads = files.map(async (file) => {
//     const res = await fetch(
//       `${API_URL}/upload-url?filename=${encodeURIComponent(file.name)}&type=${type}&contentType=${encodeURIComponent(file.type)}`
//     );

//     if (!res.ok) throw new Error("Failed to get signed URL");
//     const { uploadUrl, publicUrl } = await res.json();

//     const uploadRes = await fetch(uploadUrl, {
//       method: "PUT",
//       body: file,
//     });
//     if (!uploadRes.ok) throw new Error("Upload failed");

//     return {
//       url: publicUrl,
//     };
//   });

//   return Promise.all(uploads);
// }


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

  // local UI state
  const [images, setImages] = useState<UnifiedMediaItem[]>([]);
  const [videos, setVideos] = useState<UnifiedMediaItem[]>([]);
  const [ebooks, setBooks] = useState<UnifiedMediaItem[]>([]);
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

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

  // draft autosave
  const draftKey = useMemo(() => `market-listing-draft-${companyId}-${product?.id || "new"}`, [companyId, product?.id]);
  const { status: autosaveStatus, restore, clear } = useAutoSaveDraft(draftKey, formData, true);

  useEffect(() => {
    // restore draft if create flow and draft exists
    if (!product && !marketListItem) {
      const draft = restore();
      if (draft) {
        setFormData((d: any) => ({ ...d, ...draft }));
        setToast("Restored unsaved draft");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // dynamic steps
  const categoryKey = (formData.category as any)?.displayName?.trim?.() || (formData.category as any)?.name || "";
  const stepsForCategory = useMemo(() => CATEGORY_STEPS[categoryKey] || [1, 2, 3], [categoryKey]);
  const lastStepIndex = stepsForCategory.length;
  const isFirstStep = step === 1;
  const isLastStep = step === lastStepIndex;
  const currentDynamicStep = stepsForCategory[step - 1] || 1;

  const FormComponent = useMemo(() => FORM_COMPONENTS[currentDynamicStep] ?? null, [currentDynamicStep]);

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
    },
    [updateField]
  );

  const handleCategoryChange = useCallback(
    (cat: IStoreCategory | null) => {
      updateField("category", cat as any);
      updateField("productCategoryId", (cat as any)?.categoryId || "");
      updateField("subCategory", (cat as any)?.subcategories || {});
      updateField("subCategoryName", "");
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

  // load from product
  // const handleLoadFromProduct = useCallback(() => {
  //   const initial = productToListingForm(product ?? undefined, categories, companyId);
  //   Object.entries(initial).forEach(([key, val]) =>
  //     updateField(key as keyof MarketListingForm, val as any)
  //   );
  //   setToast("Loaded data from product");
  // }, [product, categories, companyId, updateField]);

  // drag to go back (mobile)
  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 80 && !isFirstStep) setStep((s) => Math.max(1, s - 1));
  };

  // Save / submit
  const handleCreateListing = useCallback(async () => {
    if (!window.confirm("Create listing?")) return;
    setLoading(true);
    try {

      console.log("Starting upload process...");
      console.log("Current images:", images);
      console.log("Current videos:", videos);
      console.log("Current books:", ebooks);

      // 1. Filter local files that need uploading
      const newImageItems = images.filter(i => i.source === "local" && i.file);
      const newVideoItems = videos.filter(v => v.source === "local" && v.file);
      const newBookItems = ebooks.filter(b => b.source === "local" && b.file);

      console.log("New images to upload:", newImageItems);
      console.log("New videos to upload:", newVideoItems);
      console.log("New books to upload:", newBookItems);

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

      const finalBookUrls = ebooks
        .map(book => (book.source === "server" ? book.url : bookUrlMap.get(book.id)!))
        .filter(Boolean);


      // 6. Build payload
      const payload = buildListingPayload(
        {
          ...formData,
          type: ebookType ? "ebook" : formData.type,
          category: (formData.category as any)?.displayName || (formData.category as any)?.name || formData.category,
          companyId: companyId,
        } as MarketListingForm,
        finalImageUrls,
        finalVideoUrls,
        finalBookUrls
      );

      const res = await fetch(`${API_URL}/admin/post-market-list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.message || res.statusText || "Failed to create listing");
      }

      setToast("Listing created!");
      clear();
      setShowRequestProductModal(false);
    } catch (err: any) {
      console.error(err);
      setToast(err?.message || "Error creating listing");
    } finally {
      setLoading(false);
    }
  }, [images, videos, ebooks, formData, companyId, clear, setShowRequestProductModal]);


  // progress %
  const progress = Math.round((step / Math.max(1, lastStepIndex)) * 100);

  // small animation container variants
  const containerVar = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { when: "beforeChildren", staggerChildren: 0.02 } },
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
              <div className="animate-pulse text-gray-700">Uploading…</div>
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
              <div className="text-sm font-semibold">{marketListItem ? "Edit Listing" : "Add to Marketplace"}</div>
              <div className="text-xs text-gray-500">Step {step} of {lastStepIndex}</div>
            </div>
          </div>
          <div className="w-64">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <motion.div className="flex-1 overflow-y-auto px-4 py-4" variants={containerVar} initial="hidden" animate="show">
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
            
            {step === 1 ? (
              <CategoryPicker
                formData={{ category: formData.category, subCategory: formData.subCategory, brand: formData.brand }}
                categories={categories}
                filteredBrands={(formData.category as any)?.allBrands || []}
                onCategoryChange={handleCategoryChange}
                onSubCategoryChange={handleSubCategoryChange}
                onBrandChange={(b) => updateField("brand", b as any)}
              />
            ) : currentDynamicStep === 7 ? (
              <PricingDetails<MarketListingForm>
                formData={formData}
                setFormData={updateField}
                costField="buyingPrice"
                revenueField="sellingPrice"
                discountField="discount"
                finalField="finalPrice"
                marginField="profitMargin"
              />
            ) : currentDynamicStep === 18 ? (
              <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Location Details</h2>
                <LocationPicker
                  selectedLocationId={formData.locationId || null}
                  availableLocations={locations}
                  onLocationSelect={handleLocationSelect}
                />
              </section>
            ) : FormComponent ? (
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
            ) : (
              <div className="p-6 text-sm text-gray-600">No form available for this step.</div>
            )}
          </motion.div>
        </motion.div>

        {/* Sticky Footer */}
        <div className="shrink-0 border-t bg-white/90 backdrop-blur-sm p-4 sticky bottom-0 left-0 right-0 z-30 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="hidden sm:flex items-center gap-2 text-gray-500 text-xs">
            Progress: {progress}% {autosaveStatus === "saving" ? "• saving…" : autosaveStatus === "saved" ? "• saved" : ""}
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
                className="w-full sm:w-auto px-4 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
              >
                Submit
                <CheckCircleIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Toast */}
        {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
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