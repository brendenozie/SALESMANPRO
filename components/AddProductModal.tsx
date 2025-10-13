"use client";

import React, { ReactNode, useEffect, useMemo, useState, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
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



// NOTE: keep API constants consistent with your app's env
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

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

////////////////////////////////////////////////////////////////////////////////
// Lightweight upload helper (keeps original signature, but safer)
////////////////////////////////////////////////////////////////////////////////
async function uploadFiles(files: File[], type: 'image' | 'video') {
  if (!files?.length) return [];
  const uploads = files.map(async (file) => {
    const fd = new FormData();
    fd.append('type', type);
    fd.append('file', file);
    const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: fd, credentials: 'include' });
    if (!res.ok) throw new Error('Upload failed');
    const json = await res.json();
    return json.url as string;
  });
  return Promise.all(uploads);
}

////////////////////////////////////////////////////////////////////////////////
// A slightly safer payload builder -- unchanged semantics but smaller surface
////////////////////////////////////////////////////////////////////////////////
function buildProductPayload(f: ProductForm, imageUrls: string[]) {
  return {
    ...f,
    images: imageUrls,
  } as any;
}

////////////////////////////////////////////////////////////////////////////////
// Hook: initialize product form (keeps shape compatible with your earlier hook)
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
    video: product?.video || null,
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

    // vehicles
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

    // books
    author: product?.author || '',
    publisher: product?.publisher || '',
    isbn: product?.isbn || '',

    // fashion
    fabricComposition: product?.fabricComposition || '',
    careInstructions: product?.careInstructions || '',

    // appliances
    energyRating: product?.energyRating || '',
    warrantyPeriod: product?.warrantyPeriod || '',

    // beauty
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

  // calculated final price & profit margin
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
// Main component: refactored modal with responsive layout, progress, autosave, lazy steps
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
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<any[]>(product?.images?.map((i: any, idx: number) => ({ url: i, idx })) || []);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Auto-save draft to localStorage
  const draftKey = useMemo(() => `product-draft-${companyId}-${product?.id || 'new'}`, [companyId, product?.id]);
  const { status: autosaveStatus, restore, clear } = useAutoSaveDraft(draftKey, formData, true);

  useEffect(() => {
    // restore draft if present and product is null (create flow)
    if (!product) {
      const draft = restore();
      if (draft) {
        setFormData((d: any) => ({ ...d, ...draft }));
        setToast('Restored unsaved draft');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // dynamic steps (lazy load heavy components)
  const categoryKey = formData.category?.displayName?.trim() || '';
  const stepsForCategory = useMemo(() => CATEGORY_STEPS[categoryKey] || [1, 2, 3], [categoryKey]);
  const lastStepIndex = stepsForCategory.length;
  const isFirstStep = step === 1;
  const isLastStep = step === lastStepIndex;
  const currentDynamicStep = stepsForCategory[step - 1] || 1;

  // Resolve component dynamically from your FORM_COMPONENTS map but wrap with Suspense
  // If FORM_COMPONENTS already contains React components, we will use them directly; otherwise
  // keep the logic simple and use a fallback.
  const FormComponent = FORM_COMPONENTS[currentDynamicStep] ?? null;

  // handle native inputs generically
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const val = target.type === 'checkbox' ? target.checked : target.value;
    updateField(target.name as keyof ProductForm, val as any);
  }, [updateField]);

  const handleCategoryChange = useCallback((cat: IStoreCategory | null) => {
    updateField('category', cat as any);
    // clear dependent fields
    updateField('subCategory', null as any);
    updateField('brand', null as any);
  }, [updateField]);

  // next with optional per-step validation
  const goNext = useCallback(async () => {
    // example hook per component to validate
    const Comp: any = FormComponent as any;
    if (Comp?.validate) {
      const ok = await Comp.validate(formData);
      if (!ok) {
        setToast('Please fix validation errors in this step');
        return;
      }
    }
    setStep((s) => Math.min(lastStepIndex, s + 1));
  }, [FormComponent, formData, lastStepIndex]);

  const goPrev = useCallback(() => setStep((s) => Math.max(1, s - 1)), []);

  // drag to go back (mobile feel)
  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) goPrev();
  };

  // Save (final): uploads and POST
  const handleSave = useCallback(async () => {
    if (!window.confirm('Save this product?')) return;
    setLoading(true);
    try {
      const imageUrls = imageFiles.length ? await uploadFiles(imageFiles, 'image') : formData.images;
      const payload = buildProductPayload({ ...formData, images: imageUrls }, imageUrls);
      const res = await fetch(`${API_URL}/admin/post-product`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      setToast('Product saved.');
      clear();
      setShowRequestProductModal(false);
    } catch (err: any) {
      setToast(err?.message || 'Error saving product');
    } finally {
      setLoading(false);
    }
  }, [imageFiles, formData, clear, setShowRequestProductModal]);

  // small responsive UI variants
  const containerVar = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { when: 'beforeChildren', staggerChildren: 0.02 } },
  };

  // progress percent
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
    <motion.div
      className="flex-1 overflow-y-auto px-4 py-4"
      variants={containerVar}
      initial="hidden"
      animate="show"
    >
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
              imageFiles={imageFiles}
              setImageFiles={setImageFiles}
              imagePreviews={imagePreviews}
              setImagePreviews={setImagePreviews}
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
    </div>

    {/* Toast */}
    {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
  </div>
</Modal>

  );
}
