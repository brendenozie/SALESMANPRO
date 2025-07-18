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
import CategoryPicker from './CategoryPicker';
import { MarketListingForm, ProductForm, StoreCategory } from '@/types/typings'; // Assuming StoreCategory is correctly defined

// Define ProductPayload and MarketListItemPayload based on your actual Prisma models if possible
// For simplicity, using 'any' for now, but strongly recommend defining these types.
interface ProductPayload {
  id: string;
  name: string;
  description?: string;
  longDescription?: string;
  quantity?: number;
  // ... other fields from your Product schema that might be pre-filled
  productCategory?: { id: string; displayName: string };
  subCategory?: any;
  subCategoryName?: string;
  tags?: string[];
  brand?: string;
  model?: string;
  color?: string[];
  size?: string[];
  weight?: string;
  condition?: string;
  dimensions?: string; // Corrected
  material?: string[];
  salesPrice?: number; // Check if this should be sellingPrice
  sellingPrice?: number; // Assuming product also has sellingPrice
  costPrice?: number;
  discount?: number;
  profitMargin?: number;
  finalPrice?: number;
  startDealDate?: string | Date;
  endDealDate?: string | Date;
  isAvailable?: boolean;
  isOnOffer?: boolean;
  isFlashDeal?: boolean;
  isNewArrival?: boolean;
  isDiscounted?: boolean;
  isFeatured?: boolean;
  delivery?: boolean;
  paymentOption?: string;
  showOnGhuba?: boolean;
  contactName?: string;
  contact?: string;
  email?: string;
  locationName?: string;
  location?: any;
  locationId?: string;
  latitude?: number;
  longitude?: number;
  propertyType?: { id: string }; // Assuming PropertyType relation on Product
  bathrooms?: number;
  area?: string;
  bedrooms?: number;
  studios?: number;
  serviceSchedule?: string;
  year?: number; // New for Product
  make?: string;
  trim?: string;
  type?: string;
  mileage?: string;
  engineType?: string;
  engineSize?: number; // Corrected to number
  horsepower?: number; // New for Product
  torque?: number; // New for Product
  fuelType?: string; // New for Product
  fuelEconomy?: string; // New for Product
  transmission?: string;
  drivetrain?: string;
  vin?: string;
  logbookStatus?: string;
  serviceHistory?: string;
  negotiable?: boolean;
  financingAvailable?: boolean;
  tradeIn?: boolean;
  features?: any[]; // New for Product
  previousOwners?: number; // New for Product
  tireCondition?: string; // New for Product
  accidentalHistory?: boolean; // New for Product
  digitalUrl?: string;
  autoDeliver?: boolean;
  status?: string;
  collectionId?: string;
  hourlyRate?: number;
  minimumHours?: number;
  minNoticePeriod?: string;
  maxBookingAhead?: string;
  totalCapacity?: number;
  currentBookedCount?: number;
  providerRating?: number;
  bookingSlots?: any[];
  deliveryMethod?: string;
  fulfillmentStatus?: string;
  pricingTiers?: any[];
  // ... potentially more
}

interface MarketListItemPayload {
  id?: string; // Can be undefined for new items
  productId: string;
  sellerType: string;
  companyId: string;
  name: string;
  description?: string;
  longDescription?: string; // Added
  quantity: number;
  images?: string[];
  video?: string;
  productCategoryId?: string;
  category?: string; // This is displayName from StoreCategory
  subCategory?: any; // JSON
  subCategoryName?: string;
  tags?: string[];
  brand?: string;
  model?: string;
  color?: string[];
  size?: string[];
  weight?: string;
  condition?: string;
  dimensions?: string; // Corrected
  material?: string[];
  buyingPrice: number;
  sellingPrice: number;
  finalPrice: number;
  profitMargin: number;
  discount: number;
  pricingTiers?: any[]; // Added
  startDealDate?: string | Date;
  endDealDate?: string | Date;
  isAvailable: boolean;
  isOnOffer?: boolean;
  isFlashDeal?: boolean;
  isNewArrival?: boolean;
  isDiscounted?: boolean;
  isFeatured?: boolean;
  delivery: boolean;
  paymentOption?: string;
  showOnGhuba: boolean;
  contactName?: string;
  contact?: string;
  email?: string;
  locationName?: string;
  location?: any; // JSON
  locationId?: string;
  latitude?: number;
  longitude?: number;
  propertyTypeId?: string; // Relation ID
  bathrooms?: number;
  area?: string;
  bedrooms?: number;
  studios?: number;
  serviceSchedule?: string;
  year?: number; // Added
  make?: string;
  trim?: string;
  type?: string;
  mileage?: string;
  engineType?: string;
  engineSize?: number; // Corrected
  horsepower?: number; // Added
  torque?: number; // Added
  fuelType?: string; // Added
  fuelEconomy?: string; // Added
  transmission?: string;
  drivetrain?: string;
  vin?: string;
  logbookStatus?: string;
  serviceHistory?: string;
  negotiable?: boolean;
  financingAvailable?: boolean;
  tradeIn?: boolean;
  features?: any[]; // Added
  previousOwners?: number; // Added
  tireCondition?: string; // Added
  accidentalHistory?: boolean; // Added
  author?: string;
  publisher?: string;
  isbn?: string;
  fabricComposition?: string;
  careInstructions?: string;
  energyRating?: string;
  warrantyPeriod?: string;
  applianceDimensions?: string;
  ingredients?: string;
  usageInstructions?: string;
  expirationDate?: string | Date;
  amenities?: string[];
  hourlyRate?: number;
  minimumHours?: number;
  minNoticePeriod?: string;
  maxBookingAhead?: string;
  totalCapacity?: number;
  currentBookedCount?: number;
  providerRating?: number;
  bookingSlots?: any[];
  deliveryMethod?: string;
  fulfillmentStatus?: string;
  digitalUrl?: string;
  autoDeliver?: boolean;
  status?: string;
  collectionId?: string;
  // Commission fields for the nested CommissionRate
  commissionType?: string;
  commissionRate?: number;
  commissionStartDate?: string | Date;
  commissionEndDate?: string | Date;
  // Timestamps
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// -----------------------------------------------------------------------------
// 1) Prop & Form Types
// -----------------------------------------------------------------------------
interface AddToProductMarketModalProps {
  showRequestProductModal: boolean;
  setShowRequestProductModal: (open: boolean) => void;
  product: ProductPayload; // Use the more specific type
  marketListItem?: MarketListItemPayload; // Use the more specific type
  companyId: string;
  categories: StoreCategory[];
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

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
    // books: [], // map book covers here if needed - removed if not in schema directly
    name: f.name,
    description: f.description || null, // Ensure null for optional strings
    longDescription: f.longDescription || null, // Added
    quantity: f.quantity,
    productCategoryId: f.productCategoryId,
    category: f.category?.displayName || null, // Ensure null for optional strings
    subCategory: f.subCategory || null,
    subCategoryName: f.subCategoryName || null,
    tags: f.tags,
    brand: f.brand || null,
    model: f.model || null,
    color: f.color,
    size: f.size,
    weight: f.weight || null,
    condition: f.condition || null,
    dimensions: f.dimensions || null, // Corrected
    material: f.material,
    profitMargin: f.profitMargin,
    discount: f.discount,
    buyingPrice: f.buyingPrice,
    sellingPrice: f.sellingPrice,
    finalPrice: f.finalPrice,
    pricingTiers: f.pricingTiers || [], // Added
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
    email: f.email || null, // Added
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
    horsepower: f.horsepower, // Added
    torque: f.torque, // Added
    fuelType: f.fuelType || null, // Added
    fuelEconomy: f.fuelEconomy || null, // Added
    transmission: f.transmission || null,
    drivetrain: f.drivetrain || null,
    vin: f.vin || null,
    logbookStatus: f.logbookStatus || null,
    serviceHistory: f.serviceHistory || null,
    negotiable: f.negotiable,
    financingAvailable: f.financingAvailable,
    tradeIn: f.tradeIn,
    features: f.features || [], // Added
    previousOwners: f.previousOwners, // Added
    tireCondition: f.tireCondition || null, // Added
    accidentalHistory: f.accidentalHistory, // Added
    tax: f.tax, // Added
    shippingCost: f.shippingCost, // Added
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
    collectionId: f.collectionId || null, // Added
    year: f.year, // Added
    productTypeId: f.productTypeId || null, // Added for relation
    commissionType: f.commissionType,
    commissionRate: f.commissionRate,
    commissionStartDate: f.commissionStartDate,
    commissionEndDate: f.commissionEndDate,
  };
}

// -----------------------------------------------------------------------------
// 3) Custom Hook to manage form data & calculations
// -----------------------------------------------------------------------------
function useMarketListingForm(
  product: ProductPayload,
  marketListItem: MarketListItemPayload | undefined,
  companyId: string
) {
  const getInitial = (): MarketListingForm => {
    const raw : MarketListingForm | any = marketListItem || {};
    const p :ProductForm | any = product || {}; // Use product directly, not p.product

    return {
      id: raw.id || '',
      productId: raw.productId || p.id || '',
      sellerType: raw.sellerType || 'ADMIN',
      companyId: raw.companyId || p.companyId || companyId,
      productTypeId: raw.propertyTypeId || p.propertyType?.id || '', // Initialize propertyTypeId
      commissionRateId: raw.commissionRateId || '', // Initialize commissionRateId

      name: raw.name || p.name || '',
      description: raw.description || p.description || undefined, // Use undefined for optional string
      longDescription: raw.longDescription || p.longDescription || undefined, // Added

      productCategoryId: raw.productCategoryId || p.productCategory?.id || '',
      category: raw.category ? { id: '', displayName: raw.category } : p.productCategory || null, // Simplified for string `category`
      subCategory: raw.subCategory || p.subCategory || {},
      subCategoryName: raw.subCategoryName || p.subCategoryName || '',
      tags: raw.tags || p.tags || [],

      brand: raw.brand || p.brand || undefined, // Use undefined for optional string
      model: raw.model || p.model || '',
      color: raw.color || p.color || [],
      size: raw.size || p.size || [],
      weight: raw.weight || p.weight || '',
      condition: raw.condition || p.condition || '',
      dimensions: raw.dimensions || p.dimensions || '', // Corrected
      material: raw.material || p.material || [],

      quantity: raw.quantity ?? p.quantity ?? 1,
      buyingPrice: raw.buyingPrice ?? p.costPrice ?? 0, // Using p.costPrice as initial for buyingPrice
      sellingPrice: raw.sellingPrice ?? p.sellingPrice ?? 0, // Using p.sellingPrice
      discount: raw.discount ?? p.discount ?? 0,
      finalPrice: raw.finalPrice ?? 0, // Will be calculated by useEffect
      profitMargin: raw.profitMargin ?? 0, // Will be calculated by useEffect
      pricingTiers: raw.pricingTiers || [], // Added

      startDealDate: (raw.startDealDate || p.startDealDate)?.toString() || null,
      endDealDate: (raw.endDealDate || p.endDealDate)?.toString() || null,

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
      email: raw.email || p.email || undefined, // Added
      locationName: raw.locationName || p.locationName || '',
      location: raw.location || p.location || {},
      locationId: raw.locationId || p.locationId || '',
      latitude: raw.latitude ?? p.latitude ?? null,
      longitude: raw.longitude ?? p.longitude ?? null,
      amenities: raw.amenities || p.amenities || [], // Corrected position

      make: raw.make || p.make || '',
      trim: raw.trim || p.trim || '',
      type: raw.type || p.type || '',
      mileage: raw.mileage || p.mileage || '',
      engineType: raw.engineType || p.engineType || '',
      engineSize: raw.engineSize ?? p.engineSize ?? null, // Corrected to number | null
      horsepower: raw.horsepower ?? p.horsepower ?? null, // Added
      torque: raw.torque ?? p.torque ?? null, // Added
      fuelType: raw.fuelType || p.fuelType || '', // Added
      fuelEconomy: raw.fuelEconomy || p.fuelEconomy || '', // Added
      transmission: raw.transmission || p.transmission || '',
      drivetrain: raw.drivetrain || p.drivetrain || '',
      vin: raw.vin || p.vin || '',
      logbookStatus: raw.logbookStatus || p.logbookStatus || 'Available',
      serviceHistory: raw.serviceHistory || p.serviceHistory || 'Full',
      negotiable: raw.negotiable ?? p.negotiable ?? false,
      financingAvailable: raw.financingAvailable ?? p.financingAvailable ?? false,
      tradeIn: raw.tradeIn ?? p.tradeIn ?? false,
      features: raw.features || [], // Added

      previousOwners: raw.previousOwners ?? p.previousOwners ?? null, // Added
      tireCondition: raw.tireCondition || p.tireCondition || '', // Added
      accidentalHistory: raw.accidentalHistory ?? p.accidentalHistory ?? false, // Added
      tax: raw.tax ?? undefined, // Added
      shippingCost: raw.shippingCost ?? undefined, // Added

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
      expirationDate: (raw.expirationDate || p.expirationDate)?.toString() || null,

      // Property-specific
      bedrooms: raw.bedrooms ?? p.bedrooms ?? null, // Corrected to number | null
      studios: raw.studios ?? p.studios ?? null, // Corrected to number | null
      bathrooms: raw.bathrooms ?? p.bathrooms ?? null, // Corrected to number | null
      area: raw.area || p.area || '',
      serviceSchedule: raw.serviceSchedule || p.serviceSchedule || '',

      // Service/Booking related fields
      availabilityStart: (raw.availabilityStart || p.availabilityStart)?.toString() || null,
      availabilityEnd: (raw.availabilityEnd || p.availabilityEnd)?.toString() || null,
      bookingSlots: raw.bookingSlots || [],
      minNoticePeriod: raw.minNoticePeriod || '',
      maxBookingAhead: raw.maxBookingAhead || '',
      requiredClientInfo: raw.requiredClientInfo || '', // Assuming this is a form field
      fulfillmentStatus: raw.fulfillmentStatus || '',
      totalCapacity: raw.totalCapacity ?? p.totalCapacity ?? null, // Corrected to number | null
      currentBookedCount: raw.currentBookedCount ?? p.currentBookedCount ?? null, // Corrected to number | null
      providerRating: raw.providerRating ?? p.providerRating ?? null, // Corrected to number | null
      hourlyRate: raw.hourlyRate ?? p.hourlyRate ?? null, // Corrected to number | null
      minimumHours: raw.minimumHours ?? p.minimumHours ?? null, // Corrected to number | null
      deliveryMethod: raw.deliveryMethod || '',

      digitalUrl: raw.digitalUrl || p.digitalUrl || '',
      autoDeliver: raw.autoDeliver ?? p.autoDeliver ?? false,

      status: raw.status || p.status || 'ACTIVE',
      collectionId: raw.collectionId || p.collectionId || undefined, // Added
      year: raw.year ?? p.year ?? null, // Added

      // Commission fields
      commissionType: raw.commissionType || '', // Default or get from product if applicable
      commissionRate: raw.commissionRate ?? 0, // Default or get from product if applicable
      commissionStartDate: (raw.commissionStartDate || p.commissionStartDate)?.toString() || null,
      commissionEndDate: (raw.commissionEndDate || p.commissionEndDate)?.toString() || null,
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
    <T extends keyof MarketListingForm>(name: T, value: MarketListingForm[T]) => {
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
  const isFirstStep = step === 1;
  const isLastStep = step === lastStepIndex;

  // simplified picker categories
  const pickerCategories = useMemo(
    () =>
      categories.map((raw) => ({
        id: raw.id,
        displayName: raw.displayName,
        icon: raw.icon,
        items: raw.items,
        allBrands: raw.allBrands ?? [],
      })),
    [categories]
  );

  // input handlers
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type, checked } = e.target;

      let parsedValue: any = value;

      // Handle numbers
      if (
        [
          'discount', 'buyingPrice', 'sellingPrice', 'finalPrice', 'profitMargin',
          'quantity', 'engineSize', 'horsepower', 'torque', 'previousOwners',
          'year', 'bathrooms', 'bedrooms', 'studios', 'hourlyRate', 'minimumHours',
          'totalCapacity', 'currentBookedCount', 'providerRating', 'tax', 'shippingCost'
        ].includes(name)
      ) {
        parsedValue = parseFloat(value) || 0;
        if (isNaN(parsedValue)) parsedValue = null; // Ensure null for invalid numbers
      }
      // Handle booleans
      else if (type === 'checkbox') {
        parsedValue = checked;
      }
      // Handle special cases for optional strings to be undefined/null
      else if (value === '') {
        parsedValue = undefined; // Or null, depending on your preference for optional empty strings
      }

      updateField(name as keyof MarketListingForm, parsedValue);
    },
    [updateField]
  );

  const handleCategoryChange = useCallback(
    (cat: StoreCategory | null) => updateField('category', cat),
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

      // Ensure dates are correctly formatted for the backend (e.g., ISO strings or null)
      const payload = buildListingPayload(
        {
          ...formData,
          startDealDate: formData.startDealDate ? new Date(formData.startDealDate).toISOString() : null,
          endDealDate: formData.endDealDate ? new Date(formData.endDealDate).toISOString() : null,
          expirationDate: formData.expirationDate ? new Date(formData.expirationDate).toISOString() : null,
          availabilityStart: formData.availabilityStart ? new Date(formData.availabilityStart).toISOString() : null,
          availabilityEnd: formData.availabilityEnd ? new Date(formData.availabilityEnd).toISOString() : null,
          commissionStartDate: formData.commissionStartDate ? new Date(formData.commissionStartDate).toISOString() : null,
          commissionEndDate: formData.commissionEndDate ? new Date(formData.commissionEndDate).toISOString() : null,
        },
        imageUrls,
        videoUrls
      );

      const res = await fetch(`${apiUrl}/marketplace-listings`, { // Assuming this is your new endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || res.statusText);
      }

      alert('Marketplace listing created successfully.');
      setShowRequestProductModal(false);
      setImageFiles([]);
      setImagePreviews([]);
      setVideoFiles([]);
      // Reset form data if needed
      // setFormData(getInitial()); // Uncomment if you want to reset the form
    } catch (err: any) {
      console.error('Error creating listing:', err);
      alert(`Error creating listing: ${err.message || 'Please try again.'}`);
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
                setFormData={updateField as any} // Cast as any because FormComponent might not have exact type
              />
            ) : (
              <p>No form available for this step.</p>
            )}
          </div>
        </motion.div>

        <div className="flex justify-between pt-4 border-t">
          {/* Back button only if not on the very first step */}
          {!isFirstStep ? (
            <button
              className="btn-secondary flex items-center"
              onClick={() => setStep((s) => s - 1)}
              disabled={loading}
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              Back
            </button>
          ) : (
            // empty div to keep spacing if you want
            <div />
          )}

          {/* Next on all but the last step; Save only on the last step */}
          {isLastStep ? (
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
          )}
        </div>
      </div>
    </Modal>
  );
}