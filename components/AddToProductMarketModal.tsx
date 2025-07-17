// src/components/AddToProductMarketModal.tsx
'use client';

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import Modal from './Modal';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import Stepper from './Stepper';
import { CATEGORY_STEPS } from '@/constant/CATEGORY_STEPS';
import { FORM_COMPONENTS } from '@/constant/FORM_COMPONENTS';
import { STEP_LABELS } from '@/constant/STEP_LABELS';
import CategoryPicker, { CategoryData } from './CategoryPicker';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// -----------------------------------------------------------------------------
// 1) Prop & Form Types
// -----------------------------------------------------------------------------
interface AddToProductMarketModalProps {
  showRequestProductModal: boolean;
  setShowRequestProductModal: (open: boolean) => void;
  product: any;          // replace with your ProductPayload
  marketListItem?: any;  // replace with your MarketListItemPayload
  companyId: string;
  categories: CategoryData[];
}

interface MarketListingForm {
  // Identifiers & relations
  id: string;
  productId: string;
  sellerType: string;
  companyId: string;

  // Title & description
  name: string;
  description: string;

  // Category hierarchy & tagging
  productCategoryId: string;
  category: CategoryData | null;
  subCategory: any;
  subCategoryName: string;
  tags: string[];

  // Branding & specs
  brand: string | null;
  model: string;
  color: string[];
  size: string[];
  weight: string;
  condition: string;
  dimension: string;
  material: string[];

  // Profit & pricing
  quantity: number;
  buyingPrice: number;
  sellingPrice: number;
  discount: number;
  finalPrice: number;
  profitMargin: number;

  // Deal scheduling
  startDealDate: string | null;
  endDealDate: string | null;

  // Feature flags
  isAvailable: boolean;
  isOnOffer: boolean;
  isFlashDeal: boolean;
  isNewArrival: boolean;
  isDiscounted: boolean;
  isFeatured: boolean;

  // Marketplace-specific
  delivery: boolean;
  paymentOption: string;
  showOnGhuba: boolean;

  // Contact & location
  contactName: string;
  contact: string;
  locationName: string;
  location: any;
  locationId: string;
  latitude: number | null;
  longitude: number | null;

  // Vehicle-specific
  make: string;
  trim: string;
  type: string;
  mileage: string;
  engineType: string;
  engineSize: string;
  transmission: string;
  drivetrain: string;
  vin: string;
  logbookStatus: string;
  serviceHistory: string;
  negotiable: boolean;
  financingAvailable: boolean;
  tradeIn: boolean;

  // Books
  author: string;
  publisher: string;
  isbn: string;

  // Clothing/Fashion
  fabricComposition: string;
  careInstructions: string;

  // Home Appliances
  energyRating: string;
  warrantyPeriod: string;
  applianceDimensions: string;

  // Beauty Products
  ingredients: string;
  usageInstructions: string;
  expirationDate: string | null;

  // Amenities (for properties/services)
  amenities: string[];

  // Property-specific
  bedrooms: any;
  studios: any;
  bathrooms: string;
  area: string;
  serviceSchedule: string;

  // Scheduling (services/bookings)
  availabilityStart: string;
  availabilityEnd: string;
  bookingSlots: any[];
  minNoticePeriod: string;
  maxBookingAhead: string;
  pricingTiers: any[];
  requiredClientInfo: string;
  fulfillmentStatus: string;
  totalCapacity: string;
  currentBookedCount: string;
  providerRating: string;
  hourlyRate: string;
  minimumHours: string;
  deliveryMethod: string;

  // Digital goods
  digitalUrl: string;
  autoDeliver: boolean;

  // Admin-only
  status: string;
}

// -----------------------------------------------------------------------------
// 2) Helpers: uploads + payload builder
// -----------------------------------------------------------------------------
async function uploadFiles(files: File[], type: 'image' | 'video' | 'file'): Promise<string[]> {
  const promises = files.map((file) => {
    const fd = new FormData();
    fd.append('type', type);
    fd.append('file', file);
    return fetch('/api/upload', { method: 'POST', body: fd })
      .then((res) => {
        if (!res.ok) throw new Error(`${type} upload failed`);
        return res.json();
      })
      .then((json) => json.url as string);
  });
  return Promise.all(promises);
}

function buildListingPayload(
  f: MarketListingForm,
  imageUrls: string[],
  videoUrls: string[]
): any {
  return {
    id: f.id || undefined,
    sellerType: f.sellerType,
    companyId: f.companyId,
    productId: f.productId,
    images: imageUrls,
    video: videoUrls[0] || null,
    books: [], // map book covers here if needed
    name: f.name,
    description: f.description,
    quantity: f.quantity,
    productCategoryId: f.productCategoryId,
    category: f.category?.displayName || '',
    subCategory: f.subCategory,
    subCategoryName: f.subCategoryName,
    tags: f.tags,
    brand: f.brand,
    model: f.model,
    color: f.color,
    size: f.size,
    weight: f.weight,
    condition: f.condition,
    dimension: f.dimension,
    material: f.material,
    profitMargin: f.profitMargin,
    discount: f.discount,
    buyingPrice: f.buyingPrice,
    sellingPrice: f.sellingPrice,
    finalPrice: f.finalPrice,
    startDealDate: f.startDealDate,
    endDealDate: f.endDealDate,
    isAvailable: f.isAvailable,
    isOnOffer: f.isOnOffer,
    isFlashDeal: f.isFlashDeal,
    isNewArrival: f.isNewArrival,
    isDiscounted: f.isDiscounted,
    isFeatured: f.isFeatured,
    delivery: f.delivery,
    paymentOption: f.paymentOption,
    showOnGhuba: f.showOnGhuba,
    contactName: f.contactName,
    contact: f.contact,
    locationName: f.locationName,
    location: f.location,
    locationId: f.locationId,
    latitude: f.latitude,
    longitude: f.longitude,
    make: f.make,
    trim: f.trim,
    type: f.type,
    mileage: f.mileage,
    engineType: f.engineType,
    engineSize: f.engineSize,
    transmission: f.transmission,
    drivetrain: f.drivetrain,
    vin: f.vin,
    logbookStatus: f.logbookStatus,
    serviceHistory: f.serviceHistory,
    negotiable: f.negotiable,
    financingAvailable: f.financingAvailable,
    tradeIn: f.tradeIn,
    author: f.author,
    publisher: f.publisher,
    isbn: f.isbn,
    fabricComposition: f.fabricComposition,
    careInstructions: f.careInstructions,
    energyRating: f.energyRating,
    warrantyPeriod: f.warrantyPeriod,
    applianceDimensions: f.applianceDimensions,
    ingredients: f.ingredients,
    usageInstructions: f.usageInstructions,
    expirationDate: f.expirationDate,
    amenities: f.amenities,
    bedrooms: f.bedrooms,
    studios: f.studios,
    bathrooms: f.bathrooms,
    area: f.area,
    serviceSchedule: f.serviceSchedule,
    availabilityStart: f.availabilityStart,
    availabilityEnd: f.availabilityEnd,
    bookingSlots: f.bookingSlots,
    minNoticePeriod: f.minNoticePeriod,
    maxBookingAhead: f.maxBookingAhead,
    pricingTiers: f.pricingTiers,
    requiredClientInfo: f.requiredClientInfo,
    fulfillmentStatus: f.fulfillmentStatus,
    totalCapacity: f.totalCapacity,
    currentBookedCount: f.currentBookedCount,
    providerRating: f.providerRating,
    hourlyRate: f.hourlyRate,
    minimumHours: f.minimumHours,
    deliveryMethod: f.deliveryMethod,
    digitalUrl: f.digitalUrl,
    autoDeliver: f.autoDeliver,
    status: f.status,
  };
}

// -----------------------------------------------------------------------------
// 3) Custom Hook to manage form data & calculations
// -----------------------------------------------------------------------------
function useMarketListingForm(
  product: any,
  marketListItem: any,
  companyId: string
) {
  const getInitial = (): MarketListingForm => {
    const raw = marketListItem || {};
    const p = product?.product || {};
    return {
      id: raw.id || '',
      productId: raw.productId || p.id || '',
      sellerType: p.sellerType || 'ADMIN',
      companyId: raw.companyId || p.companyId || companyId,

      name: raw.name || p.name || '',
      description: raw.description || p.description || '',

      productCategoryId: raw.productCategoryId || p.productCategoryId || '',
      category: raw.productCategory || p.product?.productCategory || null,
      subCategory: raw.subCategory || p.subCategory || {},
      subCategoryName: raw.subCategoryName || p.subCategoryName || '',
      tags: raw.tags || p.tags || [],

      brand: raw.brand || p.brand || null,
      model: raw.model || p.model || '',
      color: raw.color || p.color || [],
      size: raw.size || p.size || [],
      weight: raw.weight || p.weight || '',
      condition: raw.condition || p.condition || '',
      dimension: raw.dimension || p.dimension || '',
      material: raw.material || p.material || [],

      quantity: raw.quantity ?? 1,
      buyingPrice: raw.buyingPrice ?? p.salesPrice ?? 0,
      sellingPrice: raw.sellingPrice ?? p.sellingPrice ?? 0,
      discount: raw.discount ?? p.discount ?? 0,
      finalPrice: 0,
      profitMargin: 0,

      startDealDate: raw.startDealDate || p.startDealDate || null,
      endDealDate: raw.endDealDate || p.endDealDate || null,

      isAvailable: raw.isAvailable ?? p.isAvailable ?? false,
      isOnOffer: raw.isOnOffer ?? p.isOnOffer ?? false,
      isFlashDeal: raw.isFlashDeal ?? p.isFlashDeal ?? false,
      isNewArrival: raw.isNewArrival ?? p.isNewArrival ?? false,
      isDiscounted: raw.isDiscounted ?? p.isDiscounted ?? false,
      isFeatured: raw.isFeatured ?? p.isFeatured ?? false,

      delivery: raw.delivery ?? p.delivery ?? false,
      paymentOption: raw.paymentOption || p.paymentOption || 'AT SHOP',
      showOnGhuba: raw.showOnGhuba ?? p.showOnGhuba ?? true,

      contactName: raw.contactName || p.contactName || '',
      contact: raw.contact || p.contact || '',
      locationName: raw.locationName || p.locationName || '',
      location: raw.location || p.location || {},
      locationId: raw.locationId || p.locationId || '',
      latitude: raw.latitude ?? p.latitude ?? null,
      longitude: raw.longitude ?? p.longitude ?? null,

      make: raw.make || p.make || '',
      trim: raw.trim || p.trim || '',
      type: raw.type || p.type || '',
      mileage: raw.mileage || p.mileage || '',
      engineType: raw.engineType || p.engineType || '',
      engineSize: raw.engineSize || p.engineSize || '',
      transmission: raw.transmission || p.transmission || '',
      drivetrain: raw.drivetrain || p.drivetrain || '',
      vin: raw.vin || p.vin || '',
      logbookStatus: raw.logbookStatus || p.logbookStatus || 'Available',
      serviceHistory: raw.serviceHistory || p.serviceHistory || 'Full',
      negotiable: raw.negotiable ?? p.negotiable ?? false,
      financingAvailable: raw.financingAvailable ?? p.financingAvailable ?? false,
      tradeIn: raw.tradeIn ?? p.tradeIn ?? false,

      author: raw.author || p.author || '',
      publisher: raw.publisher || p.publisher || '',
      isbn: raw.isbn || p.isbn || '',

      fabricComposition: raw.fabricComposition || p.fabricComposition || '',
      careInstructions: raw.careInstructions || p.careInstructions || '',

      energyRating: raw.energyRating || p.energyRating || '',
      warrantyPeriod: raw.warrantyPeriod || p.warrantyPeriod || '',
      applianceDimensions: raw.applianceDimensions || p.applianceDimensions || '',

      ingredients: raw.ingredients || p.ingredients || '',
      usageInstructions: raw.usageInstructions || p.usageInstructions || '',
      expirationDate: raw.expirationDate || p.expirationDate || null,

      amenities: raw.amenities || p.amenities || [],
      bedrooms: raw.bedrooms || p.bedrooms || {},
      studios: raw.studios || p.studios || {},
      bathrooms: raw.bathrooms || p.bathrooms || '',
      area: raw.area || p.area || '',
      serviceSchedule: raw.serviceSchedule || p.serviceSchedule || '',

      availabilityStart: raw.availabilityStart || p.availabilityStart || '',
      availabilityEnd: raw.availabilityEnd || p.availabilityEnd || '',
      bookingSlots: raw.bookingSlots || p.bookingSlots || [],
      minNoticePeriod: raw.minNoticePeriod || p.minNoticePeriod || '',
      maxBookingAhead: raw.maxBookingAhead || p.maxBookingAhead || '',
      pricingTiers: raw.pricingTiers || p.pricingTiers || [],
      requiredClientInfo: raw.requiredClientInfo || p.requiredClientInfo || '',
      fulfillmentStatus: raw.fulfillmentStatus || p.fulfillmentStatus || '',
      totalCapacity: raw.totalCapacity || p.totalCapacity || '',
      currentBookedCount: raw.currentBookedCount || p.currentBookedCount || '',
      providerRating: raw.providerRating || p.providerRating || '',
      hourlyRate: raw.hourlyRate || p.hourlyRate || '',
      minimumHours: raw.minimumHours || p.minimumHours || '',
      deliveryMethod: raw.deliveryMethod || p.deliveryMethod || '',

      digitalUrl: raw.digitalUrl || p.digitalUrl || '',
      autoDeliver: raw.autoDeliver ?? p.autoDeliver ?? false,

      status: raw.status || p.status || 'ACTIVE',
    };
  };

  const [formData, setFormData] = useState<MarketListingForm>(getInitial);

  // update price calculations
  useEffect(() => {
    const { buyingPrice, sellingPrice, discount } = formData;
    const finalPrice = sellingPrice - (sellingPrice * discount) / 100;
    const profitMargin = buyingPrice > 0 ? ((sellingPrice - buyingPrice) / buyingPrice) * 100 : 0;
    setFormData((f) => ({ ...f, finalPrice, profitMargin }));
  }, [formData.buyingPrice, formData.sellingPrice, formData.discount]);

  const updateField = useCallback(
    (name: keyof MarketListingForm, value: any) => {
      setFormData((f) => ({ ...f, [name]: value }));
    },
    []
  );

  return { formData, updateField };
}

// -----------------------------------------------------------------------------
// 4) Main Component
// -----------------------------------------------------------------------------
export default function AddToProductMarketModal({
  showRequestProductModal,
  setShowRequestProductModal,
  product,
  marketListItem,
  companyId,
  categories,
}: AddToProductMarketModalProps) {
  const { formData, updateField } = useMarketListingForm(product, marketListItem, companyId);

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // derive dynamic steps & form component
  const categoryKey = formData.category?.displayName?.trim() || '';
  const stepsForCategory = useMemo(() => CATEGORY_STEPS[categoryKey] || [1], [categoryKey]);
  const currentDynamicStep = stepsForCategory[step - 1] || 1;
  const FormComponent = useMemo(
    () => FORM_COMPONENTS[currentDynamicStep] || FORM_COMPONENTS[1],
    [currentDynamicStep]
  );

  const lastStepIndex = stepsForCategory.length;
  const isFirstStep   = step === 1;
  const isLastStep    = step === lastStepIndex;

  // simplified picker categories
  const pickerCategories = useMemo(
    () =>
      categories.map((raw) => ({
        id: raw.category.id,
        displayName: raw.displayName,
        icon: raw.icon,
        items: raw.items,
        allBrands: raw.allBrands ?? [],
      })),
    [categories]
  );

  // input handlers
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      const parsed = ['discount', 'buyingPrice', 'sellingPrice'].includes(name)
        ? parseFloat(value) || 0
        : value;
      updateField(name as any, parsed);
    },
    [updateField]
  );

  const handleCategoryChange = useCallback(
    (cat: CategoryData | null) => updateField('category', cat),
    [updateField]
  );
  const handleSubCategoryChange = useCallback(
    (sub: any) => updateField('subCategory', sub),
    [updateField]
  );
  const handleBrandChange = useCallback(
    (b: string) => updateField('brand', b),
    [updateField]
  );

  // form submission
  const handleCreateListing = async () => {
    if (!window.confirm('Are you sure you want to create this listing?')) return;

    setLoading(true);
    try {
      const [imageUrls, videoUrls] = await Promise.all([
        uploadFiles(imageFiles, 'image'),
        uploadFiles(videoFiles, 'video'),
      ]);
      const payload = buildListingPayload(formData, imageUrls, videoUrls);
      const res = await fetch(`${apiUrl}/admin/post-market-list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(res.statusText);

      alert('Marketplace listing created successfully.');
      setShowRequestProductModal(false);
      setImageFiles([]);
      setImagePreviews([]);
      setVideoFiles([]);
    } catch (err) {
      console.error(err);
      alert('Error creating listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={showRequestProductModal} onClose={() => setShowRequestProductModal(false)}>
      <div className="relative p-6 bg-white rounded-xl shadow-lg text-gray-900 w-full max-w-4xl h-[90vh] flex flex-col">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <span>Uploading…</span>
          </div>
        )}

        <motion.div
          key={step}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="flex-grow overflow-y-auto"
        >
          <Stepper step={step} stepsForCategory={stepsForCategory} STEP_LABELS={STEP_LABELS} />
          <div className="flex-grow overflow-y-auto p-4">
            {step === 1 ? (
              <CategoryPicker
                formData={{
                  category: formData.category,
                  subCategory: formData.subCategory,
                  brand: formData.brand,
                }}
                categories={pickerCategories}
                filteredBrands={formData.category?.allBrands || []}
                onCategoryChange={handleCategoryChange}
                onSubCategoryChange={handleSubCategoryChange}
                onBrandChange={handleBrandChange}
              />
            ) : FormComponent ? (
              <FormComponent
                formData={formData}
                handleInputChange={handleInputChange}
                setFormData={updateField as any}
              />
            ) : (
              <p>No form available for this step.</p>
            )}
          </div>
        </motion.div>

        <div className="flex justify-between pt-4 border-t">
                  {/* Back button only if not on the very first step */}
                  { !isFirstStep
                    ? (
                      <button
                        className="btn-secondary flex items-center"
                        onClick={() => setStep((s) => s - 1)}
                        disabled={loading}
                      >
                        <ArrowLeftIcon className="h-5 w-5 mr-1" />
                        Back
                      </button>
                    )
                    // empty div to keep spacing if you want
                    : <div />
                  }
        
                  {/* Next on all but the last step; Save only on the last step */}
                  { isLastStep
                    ? (
                      <button
                        className="btn-success flex items-center"
                        onClick={handleCreateListing}
                        disabled={loading}
                      >
                        Submit <CheckCircleIcon className="h-5 w-5 ml-1" />
                      </button>
                    ) : (
                      <button
                        className="btn-primary flex items-center"
                        onClick={() => setStep((s) => s + 1)}
                        disabled={loading}
                      >
                        Next <ArrowRightIcon className="h-5 w-5 ml-1" />
                      </button>
                    )
                  }
                </div>
        {/* <div className="flex justify-between pt-4 border-t">
          {step > 1 && (
            <button
              className="btn-secondary flex items-center"
              onClick={() => setStep((s) => s - 1)}
              disabled={loading}
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" /> Back
            </button>
          )}
          {step < stepsForCategory.length ? (
            <button
              className="btn-primary flex items-center"
              onClick={() => setStep((s) => s + 1)}
              disabled={loading}
            >
              Next <ArrowRightIcon className="h-5 w-5 ml-1" />
            </button>
          ) : (step > (stepsForCategory.length - 1) ? (
                <button
                  className="btn-success flex items-center"
                  onClick={handleCreateListing}
                  disabled={loading}
                >
                  Submit <CheckCircleIcon className="h-5 w-5 ml-1" />
                </button>
            ) : (
              <div></div>
            )
          )}
        </div> */}
      </div>
    </Modal>
  );
}
