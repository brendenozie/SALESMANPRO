// src/components/AddProductModal.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

// Assuming ProductForm, StoreCategory, ProductCategory, BookingSlotType are defined in typings.ts
import { ProductForm, StoreCategory } from '@/types/typings'; 

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

////////////////////////////////////////////////////////////////////////////////
// 1) Props & Form Type
////////////////////////////////////////////////////////////////////////////////
export interface AddProductModalProps {
  showRequestProductModal: boolean;
  setShowRequestProductModal: (open: boolean) => void;
  product: ProductForm | null;           // TODO: replace with your Product type
  companyId: string;
  categories: StoreCategory[];
}

export interface BookingSlotType {
  date: string;
  time: string;
  capacity: number;
}

////////////////////////////////////////////////////////////////////////////////
// 2) Helpers: upload & payload
////////////////////////////////////////////////////////////////////////////////
async function uploadFiles(files: File[], type: 'image' | 'video'): Promise<string[]> {
  const uploads = files.map((file) => {
    const fd = new FormData();
    fd.append('type', type);
    fd.append('file', file);
    return fetch('/api/upload', { method: 'POST', body: fd })
      .then((res) => {
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
      })
      .then((json) => json.url as string);
  });
  return Promise.all(uploads);
}

function buildProductPayload(f: ProductForm, imageUrls: string[]): any {
  return {
    id: f.id || undefined,
    name: f.name,
    description: f.description,
    companyId: f.companyId,
    sellerType: 'ADMIN',
    collectionId: f.collectionId,

    // category
    productCategoryId: f.category?.categoryId || '',
    category: f.category?.displayName || '',
    subCategory: f.subCategory,
    subCategoryName: f.subCategoryName,
    tags: f.tags,

    // specs
    brand: f.brand,
    model: f.model,
    color: f.color,
    size: f.size,
    weight: f.weight,
    condition: f.condition,
    dimension: f.dimensions,
    material: Array.isArray(f.material) ? f.material : [f.material],

    // media
    images: imageUrls,
    video: f.video,
    digitalUrl: f.digitalUrl,
    autoDeliver: f.autoDeliver,

    // flags
    isAvailable: f.isAvailable,
    isOnOffer: f.isOnOffer,
    isFlashDeal: f.isFlashDeal,
    isNewArrival: f.isNewArrival,
    isDiscounted: f.isDiscounted,
    isFeatured: f.isFeatured,

    // pricing
    quantity: f.quantity,
    costPrice: f.costPrice,
    sellingPrice: f.sellingPrice,
    discount: f.discount,
    finalPrice: f.finalPrice,
    profitMargin: f.profitMargin,

    // deals
    startDealDate: f.startDealDate,
    endDealDate: f.endDealDate,

    // vehicle
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
    features: f.features,

    // books
    author: f.author,
    publisher: f.publisher,
    isbn: f.isbn,

    // fashion
    fabricComposition: f.fabricComposition,
    careInstructions: f.careInstructions,

    // appliances
    energyRating: f.energyRating,
    warrantyPeriod: f.warrantyPeriod,
    dimensions: f.dimensions,

    // beauty
    ingredients: f.ingredients,
    usageInstructions: f.usageInstructions,
    expirationDate: f.expirationDate,

    // options & amenities
    option: f.option,
    amenities: f.amenities,

    // property
    bedrooms: f.bedrooms,
    studios: f.studios,
    bathrooms: f.bathrooms,
    area: f.area,
    propertyTypeId: f.propertyTypeId,
    serviceSchedule: f.serviceSchedule,

    // year & scheduling
    year: f.year,
    availabilityStart: f.availabilityStart,
    availabilityEnd: f.availabilityEnd,

    // location & contact
    location: f.location,
    locationName: f.locationName,
    latitude: f.latitude,
    longitude: f.longitude,
    contact: f.contact,
    contactName: f.contactName,
    email: f.email,

    // admin
    status: f.status,
  };
}

////////////////////////////////////////////////////////////////////////////////
// 3) Hook: initialize & recalc
////////////////////////////////////////////////////////////////////////////////

function useProductForm(
  product: Partial<ProductForm> | null, // Use Partial for initial 'product' argument
  companyId: string
) {
  const getInitial = useCallback((): ProductForm => {
    const p = product || {}; // Ensure p is an object even if product is null
    return {
      id: p.id || '',
      companyId, // Directly use companyId passed as prop
      name: p.name || '',
      description: p.description || '',
      longDescription: p.longDescription || '', // New
      tags: p.tags || [],
      category: p.category || null,
      subCategory: p.subCategory || null,
      subCategoryName: p.subCategoryName || '',
      brand: p.brand || null,

      model: p.model || '',
      color: p.color || [],
      size: p.size || [],
      weight: p.weight || '',
      condition: p.condition || '',
      dimensions: p.dimensions || '', // Corrected to dimensions
      material: p.material || [], // Default to empty array for string | string[]
      
      images: p.images || [],
      video: p.video || null,
      digitalUrl: p.digitalUrl || '',
      autoDeliver: !!p.autoDeliver,

      isAvailable: p.isAvailable ?? false,
      isOnOffer: p.isOnOffer ?? false,
      isFlashDeal: p.isFlashDeal ?? false,
      isNewArrival: p.isNewArrival ?? false,
      isDiscounted: p.isDiscounted ?? false,
      isFeatured: p.isFeatured ?? false,

      quantity: p.quantity ?? 1, // Default quantity to 1
      costPrice: p.costPrice ?? 0,
      sellingPrice: p.sellingPrice ?? 0,
      discount: p.discount ?? 0,
      finalPrice: p.finalPrice ?? 0,
      profitMargin: p.profitMargin ?? 0,
      pricingTiers: p.pricingTiers || [], // New: Initialized

      startDealDate: p.startDealDate || null,
      endDealDate: p.endDealDate || null,

      make: p.make || '',
      trim: p.trim || '',
      type: p.type || '',
      mileage: p.mileage || '',
      engineType: p.engineType || '',
      engineSize: p.engineSize ?? 0, // New: Initialized as number
      transmission: p.transmission || '',
      drivetrain: p.drivetrain || '',
      vin: p.vin || '',
      logbookStatus: p.logbookStatus || 'Available',
      serviceHistory: p.serviceHistory || 'Full',
      negotiable: p.negotiable ?? false,
      financingAvailable: p.financingAvailable ?? false,
      tradeIn: p.tradeIn ?? false,
      features: p.features || [],

      // New vehicle-related fields
      horsepower: p.horsepower ?? 0, // New: Initialized as number
      torque: p.torque ?? 0, // New: Initialized as number
      fuelType: p.fuelType || '', // New
      fuelEconomy: p.fuelEconomy || '', // New

      // New ownership-related fields
      previousOwners: p.previousOwners ?? 0, // New: Initialized as number
      tireCondition: p.tireCondition || '', // New
      accidentalHistory: p.accidentalHistory ?? false, // New: Initialized as boolean

      author: p.author || '',
      publisher: p.publisher || '',
      isbn: p.isbn || '',

      fabricComposition: p.fabricComposition || '',
      careInstructions: p.careInstructions || '',

      energyRating: p.energyRating || '',
      warrantyPeriod: p.warrantyPeriod || '',
      // dimensions handled above, so no duplicate here

      ingredients: p.ingredients || '',
      usageInstructions: p.usageInstructions || '',
      expirationDate: p.expirationDate || null,

      option: p.option || [],
      amenities: p.amenities || [],

      bedrooms: p.bedrooms ?? 0, // Initialized as number
      studios: p.studios ?? 0, // Initialized as number
      bathrooms: p.bathrooms ?? 0, // Initialized as number
      area: p.area || '',

      propertyTypeId: p.propertyTypeId || '',
      serviceSchedule: p.serviceSchedule || '',

      year: p.year ?? new Date().getFullYear(), // Initialized as number, default to current year
      availabilityStart: p.availabilityStart || '',
      availabilityEnd: p.availabilityEnd || '',

      location: p.location || {}, // Default to empty object
      locationName: p.locationName || '',
      latitude: p.latitude ?? null,
      longitude: p.longitude ?? null,
      contact: p.contact || '',
      contactName: p.contactName || '',
      email: p.email || '',

      status: p.status || 'ACTIVE',
      collectionId: p.collectionId || '',

      // Optional fields, ensure they are correctly initialized as undefined or null if not present
      hourlyRate: p.hourlyRate,
      minimumHours: p.minimumHours,
      minNoticePeriod: p.minNoticePeriod,
      maxBookingAhead: p.maxBookingAhead,
      totalCapacity: p.totalCapacity,
      deliveryMethod: p.deliveryMethod,
      fulfillmentStatus: p.fulfillmentStatus,
      providerRating: p.providerRating,
      bookingSlots: p.bookingSlots,
    };
  }, [product, companyId]); // Depend on product and companyId

  const [formData, setFormData] = useState<ProductForm>(getInitial);

  // Recalculate finalPrice and profitMargin using a dedicated useEffect
  useEffect(() => {
    const sellingPrice = formData.sellingPrice;
    const costPrice = formData.costPrice;
    const discount = formData.discount;

    const calculatedFinalPrice = Math.max(sellingPrice - (sellingPrice * discount) / 100, 0);
    const calculatedProfitMargin = costPrice > 0 ? ((calculatedFinalPrice - costPrice) / costPrice) * 100 : 0;

    // Only update if values have actually changed to prevent unnecessary re-renders
    if (formData.finalPrice !== calculatedFinalPrice || formData.profitMargin !== calculatedProfitMargin) {
      setFormData((f) => ({
        ...f,
        finalPrice: calculatedFinalPrice,
        profitMargin: calculatedProfitMargin,
      }));
    }
  }, [formData.costPrice, formData.sellingPrice, formData.discount, formData.finalPrice, formData.profitMargin]);
  // Added finalPrice, profitMargin to dependencies to prevent infinite loop
  // if their values change due to external factors or initial state setting.

  const updateField = useCallback(
    <K extends keyof ProductForm>(name: K, value: ProductForm[K]) => {
      setFormData((f) => ({ ...f, [name]: value }));
    },
    []
  );

  return { formData, updateField };
}

// export default useProductForm; // Export the hook

////////////////////////////////////////////////////////////////////////////////
// 4) Main Component
////////////////////////////////////////////////////////////////////////////////
export default function AddProductModal({
  showRequestProductModal,
  setShowRequestProductModal,
  product,
  companyId,
  categories,
}: AddProductModalProps) {
  const { formData, updateField } = useProductForm(product, companyId);
  
  const [step, setStep] = useState(1);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // Images state
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<any[]>(
    product?.images?.map((img: any, index: number) => ({ ...img, index })) || []
  );

  const [loading, setLoading] = useState(false);
  
  // Category steps & component
  const categoryKey = formData.category?.displayName?.trim() || '';
  console.log("formData.category");
  console.log(categoryKey);
  console.log("categoryKey");
  console.log("zzzzzzzzzzzzzzz");
  console.log(formData.category);
  const stepsForCategory = useMemo(() => CATEGORY_STEPS[categoryKey] || [1], [categoryKey]);
  const currentDynamicStep = stepsForCategory[step - 1] || 1;
  const FormComponent = FORM_COMPONENTS[currentDynamicStep];

  // Picker data
  const pickerCategories = useMemo(() => categories, [categories]);
  
  const filteredSubCategories = useMemo(
    () => formData.category?.items || formData.category?.items || [],
    [formData.category]
  );
  const filteredBrands = useMemo(
    () => formData.category?.allBrands || [],
    [formData.category]
  );

  
  const lastStepIndex = stepsForCategory.length;
  const isFirstStep   = step === 1;
  const isLastStep    = step === lastStepIndex;

  // Handlers
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, type, value, checked } = e.target as HTMLInputElement;
      const val = type === 'checkbox' ? checked : value;
      updateField(name as keyof ProductForm, val);
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

  // Submit
  const handleSave = async () => {
    if (!window.confirm('Save this product?')) return;
    setLoading(true);
    try {
      const imageUrls = imageFiles.length ? await uploadFiles(imageFiles, 'image') : formData.images;
      const payload = buildProductPayload({ ...formData, images: imageUrls }, imageUrls);

      console.log(formData);

      const res = await fetch(`${apiUrl}/admin/post-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(res.statusText);
      alert('Product saved.');
      setShowRequestProductModal(false);
    } catch {
      alert('Error saving product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={showRequestProductModal} onClose={() => setShowRequestProductModal(false)}>
      <div className="relative p-6 bg-white rounded-xl shadow-lg text-gray-900 w-full max-w-4xl h-[90vh] flex flex-col">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <span>Saving…</span>
          </div>
        )}
        <motion.div key={step} 
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
                categories={categories}
                filteredBrands={formData.category?.allBrands || []}
                onCategoryChange={cat =>{
                   updateField('category', cat);
                   if(cat != formData.category){
                      updateField('subCategory', null);
                      updateField('brand', null);
                    }
                  }
                }
                onSubCategoryChange={sub => updateField('subCategory', sub)}
                onBrandChange={brand => updateField('brand', brand)}
              />
            ) : FormComponent ? (
              <FormComponent
                formData={formData}
                setFormData={updateField as any}
                handleInputChange={handleInputChange}
                filteredSubCategories={
                  formData.category?.items.length
                    ? formData.category.items
                    : formData.category?.category?.subcategories ?? []
                }
                filteredBrands={filteredBrands /* from your memo for later steps */}
                imageFiles={imageFiles}
                setImageFiles={setImageFiles}
                imagePreviews={imagePreviews}
                setImagePreviews={setImagePreviews}
              />
            ) : (
              <p>No form for this step.</p>
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
                onClick={handleSave}
                disabled={loading}
              >
                Save <CheckCircleIcon className="h-5 w-5 ml-1" />
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
      </div>
    </Modal>
  );
}
