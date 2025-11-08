"use client";

import React, { ReactNode, useEffect, useMemo, useState, useCallback, Suspense } from 'react';
import Modal from './Modal';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Stepper from './Stepper';
import { CATEGORY_STEPS } from '@/constant/CATEGORY_STEPS';
import { FORM_COMPONENTS } from '@/constant/FORM_COMPONENTS';
import { STEP_LABELS } from '@/constant/STEP_LABELS';
import CategoryPicker from './CategoryPicker';
import PricingDetails from './PricingDetails';
import { ProductForm, IStoreCategory } from '@/types/typings';

// ✅ Unified Media Types
interface UnifiedMediaItem {
  id?: string;
  index?: number;
  file?: File;
  url: string;
  source: "local" | "server";
}

interface UnifiedBookItem {
  id: string;
  title: string;
  author: string;
  coverFile?: File | null;
  coverPreviewUrl?: string | null;
  bookFile?: File | null;
  bookFileName?: string;
  url?: string;
  source: "local" | "server";
}

// NOTE: keep API constants consistent with your app's env
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;

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


// async function uploadFiles(files: File[], type: "image" | "video" | "book") {
//   console.log("Uploading files:", files);
  
//   console.log("Starting upload for : ", type);

//   if (!files?.length) return [];
//   console.log("Starting upload for : ", type);

//   const uploads = files.map(async (file, index) => {
//     // 1. Request signed URL from your backend
//     // const res = await fetch(
//     //   `${API_URL}/upload-url?filename=${encodeURIComponent(file.name)}&type=${type}`
//     // );

//     const res = await fetch(
//       `${API_URL}/upload-url?filename=${encodeURIComponent(file.name)}&type=${type}&contentType=${encodeURIComponent(file.type)}`
//     );

//     if (!res.ok) throw new Error("Failed to get signed URL");
//     const { uploadUrl, publicUrl } = await res.json();

//     // 2. Upload directly to S3 via PUT request
//     const uploadRes = await fetch(uploadUrl, {
//       method: "PUT",
//       body: file,
//     });
//     if (!uploadRes.ok) throw new Error("Upload failed");

//     // 3. Return the public CloudFront/S3 URL
//     return {
//       // The original index is not needed here as we will re-index later
//       url: publicUrl,
//     };
//   });

//   return Promise.all(uploads);
// }


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
  } as ProductForm), [product, companyId]);

  const [formData, setFormData] = useState<ProductForm>(getInitial);

  useEffect(() => {
    const sellingPrice = formData.sellingPrice;
    const costPrice = formData.costPrice;
    const discount = formData.discount;
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
// Main AddProductModal Component
////////////////////////////////////////////////////////////////////////////////
export default function AddProductModal({
  showRequestProductModal,
  setShowRequestProductModal,
  product,
  companyId,
  categories,
}: {
  showRequestProductModal: boolean;
  setShowRequestProductModal: (open: boolean) => void;
  product: ProductForm | null;
  companyId: string;
  categories: IStoreCategory[];
}) {
  const { formData, setFormData, updateField } = useProductForm(product || null, companyId);
  const [step, setStep] = useState(1);

   // Unified media states
  const [images, setImages] = useState<UnifiedMediaItem[]>(
    product?.images?.map((img, idx) => ({ index: idx, url: img.url, source: 'server' })) || []
  );
  const [videos, setVideos] = useState<UnifiedMediaItem[]>(
    product?.videos?.map((vid, idx) => ({ index: idx, url: vid.url, source: 'server' })) || []
  );
  
    const [books, setBooks] = useState<UnifiedMediaItem[]>([]);
  // const [books, setBooks] = useState<UnifiedBookItem[]>(
  //   product?.ebooks?.map((b: any, idx: number) => ({
  //     id: b.url || `${idx}`,
  //     title: b.title,
  //     author: b.author,
  //     url: b.url,
  //     source: "server",
  //   })) || []
  // );
   // Single source of truth for images
  // const [images, setImages] = useState<MediaItem[]>(
  //   product?.images?.map((img, idx) => ({ index: img.index ?? idx, url: img.url, source: 'server' })) || []
  // );

  // // Single source of truth for videos
  // const [videos, setVideos] = useState<MediaItem[]>(
  //   product?.videos?.map((vid, idx) => ({ index: vid.index ?? idx, url: vid.url, source: 'server' })) || []
  // );
  
  // // State for books (assuming a similar structure)
  // const [books, setBooks] = useState<BookItem[]>(
  //   product?.books?.map((book: any) => ({ ...book, source: 'server', id: book.url })) || []
  // );

  // const [imageFiles, setImageFiles] = useState<File[]>([]);
  // const [imagePreviews, setImagePreviews] = useState<any[]>(
  //   product?.images?.map((i: any, idx: number) => ({
  //     url: i.url,
  //     index: i.index ?? idx,
  //     source: "server", // Mark existing images from the server
  //   })) || []
  // );
  // // --- Video states ---
  // const [videoFiles, setVideoFiles] = useState<File[]>([]);
  // const [videoPreviews, setVideoPreviews] = useState<any[]>(
  //   product?.videos?.map((v: any, idx: number) => ({
  //     url: v.url,
  //     index: v.index ?? idx,
  //     source: "server",
  //   })) || []
  // );

  // --- Book states ---
  // const [books, setBooks] = useState<any[]>(product?.books || []);
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const draftKey = useMemo(() => `product-draft-${companyId}-${product?.id || 'new'}`, [companyId, product?.id]);
  const { restore, clear } = useAutoSaveDraft(draftKey, formData, true);

  useEffect(() => {
    if (!product) {
      const draft = restore();
      if (draft) {
        setFormData((d: any) => ({ ...d, ...draft }));
        setToast('Restored unsaved draft');
      }
    }
  }, [product, restore, setFormData, setToast]);

  const categoryKey = formData.category?.displayName?.trim() || '';
  const stepsForCategory = useMemo(() => CATEGORY_STEPS[categoryKey] || [1, 2, 3], [categoryKey]);
  const lastStepIndex = stepsForCategory.length;
  const isFirstStep = step === 1;
  const isLastStep = step === lastStepIndex;
  const currentDynamicStep = stepsForCategory[step - 1] || 1;
  const FormComponent = FORM_COMPONENTS[currentDynamicStep] ?? null;

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const val = target.type === 'checkbox' ? target.checked : target.value;
    updateField(target.name as keyof ProductForm, val as any);
  }, [updateField]);

  const handleCategoryChange = useCallback((cat: IStoreCategory | null) => {
    updateField('category', cat as any);
    updateField('subCategory', null as any);
    updateField('brand', null as any);
  }, [updateField]);

  const goNext = useCallback(async () => {
    setStep((s) => Math.min(lastStepIndex, s + 1));
  }, [lastStepIndex]);

  const goPrev = useCallback(() => setStep((s) => Math.max(1, s - 1)), []);
  
  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) goPrev();
  };

  // Add this inside your AddProductModal component

const handleSave = useCallback(async () => {
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

    } catch (err: any) {
        console.error("Save error:", err); // Log the full error for debugging
        setToast(err?.message || 'Error: Could not save product.');
    } finally {
        setLoading(false);
    }
}, [formData, images, books, videos, books, clear, setShowRequestProductModal]);

  // const handleSave = useCallback(async () => {
    
  //   if (!window.confirm('Are you sure you want to save this product?')) return;

  //   setLoading(true);

  //   try {

  //     console.log("Images state before save:", images);
  //     console.log("Videos state before save:", videos);
  //     console.log("Books state before save:", books);

  //      // Separate new local files from existing ones
  //     const newImageFiles = images.filter(i => i.source === "local" && i.file).map(i => i.file!);
  //     const newVideoFiles = videos.filter(v => v.source === "local" && v.file).map(v => v.file!);
  //     const newBookFiles = books.filter(b => b.source === "local" && b.bookFile).map(b => b.bookFile!);

  //     const [uploadedImages, uploadedVideos, uploadedBooks] = await Promise.all([
  //       uploadFiles(newImageFiles, "image"),
  //       uploadFiles(newVideoFiles, "video"),
  //       uploadFiles(newBookFiles, "book"),
  //     ]);

  //     const finalImages = images.map((img, idx) => ({
  //       index: idx,
  //       url: img.source === "server" ? img.url : uploadedImages.shift()?.url,
  //     }));

  //     const finalVideos = videos.map((vid, idx) => ({
  //       index: idx,
  //       url: vid.source === "server" ? vid.url : uploadedVideos.shift()?.url,
  //     }));

  //     const finalBooks = books.map((book, idx) => ({
  //       index: idx,
  //       title: book.title,
  //       author: book.author,
  //       url: book.source === "server" ? book.url : uploadedBooks.shift()?.url,
  //     }));

  //     const payload = { ...formData, images: finalImages, videos: finalVideos, books: finalBooks };

  //     // 1. Filter to get only the new, local files that need uploading
  //     // const newImageFiles = images.filter((img): img is NewMedia => img.source === 'local').map(img => img.file);
  //     // const newVideoFiles = videos.filter((vid): vid is NewMedia => vid.source === 'local').map(vid => vid.file);
  //     // const newBookFiles = books.filter(b => b.source === 'local' && b.bookFile).map(b => b.bookFile!);
      
  //     // // 2. Upload all new files in parallel
  //     // const [uploadedImageUrls, uploadedVideoUrls, uploadedBookUrls] = await Promise.all([
  //     //   uploadFiles(newImageFiles, "image"),
  //     //   uploadFiles(newVideoFiles, "video"),
  //     //   uploadFiles(newBookFiles, "book"),
  //     // ]);

  //     // // 3. Map over the state arrays to build the final URL lists, maintaining order.
  //     // // This is now declarative and much easier to reason about.
  //     // let newImageIdx = 0;
  //     // const finalImages = images.map(img => {
  //     //   return { url: img.source === 'server' ? img.url : uploadedImageUrls[newImageIdx++]?.url };
  //     // }).map((img, idx) => ({ index: idx, url: img.url }));
      
  //     // let newVideoIdx = 0;
  //     // const finalVideos = videos.map(vid => {
  //     //   return { url: vid.source === 'server' ? vid.url : uploadedVideoUrls[newVideoIdx++]?.url };
  //     // }).map((vid, idx) => ({ index: idx, url: vid.url }));

  //     // let newBookIdx = 0;
  //     // const finalBooks = books.map(book => {
  //     //    // This assumes you want to send more than just the URL for books
  //     //   const bookUrl = book.source === 'server' ? book.url : uploadedBookUrls[newBookIdx++]?.url;
  //     //   return { 
  //     //     title: book.title, 
  //     //     author: book.author,
  //     //     url: bookUrl
  //     //     // ... any other book metadata ...
  //     //   };
  //     // }).map((book, idx) => ({ index: idx, ...book }));


  //     // // 4. Build the final payload and send it to the backend.
  //     // const payload = buildProductPayload(formData, finalImages, finalBooks, finalVideos);
      
  //     // 1. Upload only the new files held in the `imageFiles` state.
  //     // const newlyUploadedImages = await uploadFiles(imageFiles, 'image');
  //     // Upload new local images/videos
  //     // const [uploadedImages, uploadedVideos] = await Promise.all([
  //     //   uploadFiles(imageFiles, "image"),
  //     //   uploadFiles(videoFiles, "video"),
  //     // ]);

  //     // // books are handled differently since they are files with no urls
  //     // const uploadedBooks = await uploadFiles(
  //     //   books.filter((b) => b.source !== "server").map((b) => b.file),
  //     //   "book"
  //     // );
  //     // const finalBooks = books.map((b) =>
  //     //   b.source === "server" ? { url: b.url } : uploadedBooks.shift() // Use shift to maintain order
  //     // ).map((bk:any, idx) => ({ index: idx, url: bk.url }));

  //     // let imageIndex = 0;

  //     // const finalImages = imagePreviews.map((p) =>
  //     //   p.source === "server" ? { url: p.url } : uploadedImages[imageIndex++]
  //     // ).map((img, idx) => ({ index: idx, url: img.url }));

  //     // let videoIndex = 0;
  //     // const finalVideos = videoPreviews.map((p) =>
  //     //   p.source === "server" ? { url: p.url } : uploadedVideos[videoIndex++]
  //     // ).map((v, idx) => ({ index: idx, url: v.url }));

  //     // 2. Combine existing and new images, respecting the current display order.
  //     // The `imagePreviews` array is the source of truth for the final order.
  //     // let localFileCounter = 0;

  //     // const combinedImages = imagePreviews.map((preview) => {
  //     //   if (preview.source === 'server') {
  //     //     // This is an existing image; keep its original URL.
  //     //     return { url: preview.url };
  //     //   } else {
  //     //     // This is a new image; get its URL from the upload results.
  //     //     // Assumes the order of 'local' previews matches the upload order.
  //     //     const uploadedImage = newlyUploadedImages[localFileCounter++];
  //     //     return { url: uploadedImage.url };
  //     //   }
  //     // });

  //     // 3. Format the final array to match the desired database schema.
  //     // const finalPayloadImages = combinedImages.map((image, idx) => ({
  //     //   index: idx,
  //     //   url: image.url,
  //     // }));

  //     // 4. Build the final payload and send it to the backend.
  //     // const payload = buildProductPayload(formData, finalImages, finalBooks, finalVideos);
      
  //     const res = await fetch(`${API_URL}/admin/post-product`, {
  //       method: 'POST',
  //       credentials: 'include',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(payload),
  //     });

  //     if (!res.ok) throw new Error(await res.text());
      
  //     setToast('Product saved successfully.');
  //     clear(); // Clear the auto-saved draft
  //     setShowRequestProductModal(false);

  //   } catch (err: any) {
  //     setToast(err?.message || 'Error: Could not save product.');
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [images, formData, clear, setShowRequestProductModal]);


  const progress = Math.round((step / Math.max(1, lastStepIndex)) * 100);

  return (
   <Modal isOpen={showRequestProductModal} onClose={() => setShowRequestProductModal(false)} title="">
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

      {/* Top Bar */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <button aria-label="close" onClick={() => setShowRequestProductModal(false)} className="p-2 rounded-md hover:bg-gray-100">
            <XMarkIcon className="h-5 w-5 text-gray-700" />
          </button>
          <div>
            <div className="text-sm font-semibold">Add product</div>
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
      <div className="flex-1 overflow-y-auto px-4 py-4">
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
              filteredBrands={formData.category?.allBrands || []}
              onCategoryChange={handleCategoryChange}
              onSubCategoryChange={(s) => updateField("subCategory", s as any)}
              onBrandChange={(b) => updateField("brand", b as any)}
            />
          ) : currentDynamicStep === 7 ? (
            <PricingDetails<ProductForm>
              formData={formData}
              setFormData={updateField as any}
              costField="costPrice"
              revenueField="sellingPrice"
              discountField="discount"
              finalField="finalPrice"
              marginField="profitMargin"
            />
          ) : FormComponent ? (
            <Suspense fallback={<div className="p-6 text-center text-gray-500">Loading step…</div>}>
              <FormComponent
                formData={formData}
                setFormData={updateField as any}
                handleInputChange={handleInputChange}
                filteredSubCategories={formData.category?.subcategories || []}
                filteredBrands={formData.category?.allBrands || []}

                // imageFiles={imageFiles}
                // setImageFiles={setImageFiles}
                // imagePreviews={imagePreviews}
                // setImagePreviews={setImagePreviews}
                // videoFiles={videoFiles}
                // setVideoFiles={setVideoFiles}
                // videoPreviews={videoPreviews}
                // setVideoPreviews={setVideoPreviews}
                
                // Pass the unified state and setters
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
      </div>

      {/* Sticky Footer */}
      <div className="shrink-0 border-t bg-white/90 backdrop-blur-sm p-4 sticky bottom-0 left-0 right-0 z-30 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="hidden sm:flex items-center gap-2 text-gray-500 text-xs">
          Progress: {progress}%
        </div>
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
          {!isLastStep ? (
            <button
              onClick={goNext}
              className="w-full sm:w-auto px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"
            >
              <span className="sm:hidden">Next</span>
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="w-full sm:w-auto px-4 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
            >
              Save
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
