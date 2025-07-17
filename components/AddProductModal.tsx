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
import { ProductCategory, StoreCategory } from '@/app/admin/[slug]/categories/page';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

////////////////////////////////////////////////////////////////////////////////
// 1) Props & Form Type
////////////////////////////////////////////////////////////////////////////////
interface AddProductModalProps {
  showRequestProductModal: boolean;
  setShowRequestProductModal: (open: boolean) => void;
  product: any | null;           // TODO: replace with your Product type
  companyId: string;
  categories: StoreCategory[];
}

interface ProductForm {
  // identifiers
  id: string;
  companyId: string;

  // basic info
  name: string;
  description: string;

  // category
  // category: CategoryData | null;
  // subCategory: any;
  subCategoryName: string;
  // brand: string;
  tags: string[];

  category: StoreCategory | null;
  subCategory: ProductCategory | null;
  brand: string | null;

  // specs
  model: string;
  color: string[];
  size: string[];
  weight: string;
  condition: string;
  dimension: string;
  material: string | string[];

  // media
  images: string[];
  video: string | null;
  digitalUrl: string;
  autoDeliver: boolean;

  // flags
  isAvailable: boolean;
  isOnOffer: boolean;
  isFlashDeal: boolean;
  isNewArrival: boolean;
  isDiscounted: boolean;
  isFeatured: boolean;

  // pricing
  quantity: number;
  costPrice: number;
  salesPrice: number;
  discount: number;
  finalPrice: number;
  profitMargin: number;

  // deals
  startDealDate: string | null;
  endDealDate: string | null;

  // vehicle
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
  features: any[];

  // books
  author: string;
  publisher: string;
  isbn: string;

  // fashion
  fabricComposition: string;
  careInstructions: string;

  // appliances
  energyRating: string;
  warrantyPeriod: string;
  dimensions: string;

  // beauty
  ingredients: string;
  usageInstructions: string;
  expirationDate: string | null;

  // options & amenities
  option: any[];
  amenities: string[];

  // property
  bedrooms: any[];
  studios: any[];
  bathrooms: string;
  area: string;
  propertyTypeId: string;
  serviceSchedule: string;

  // year & scheduling
  year: string;
  availabilityStart: string;
  availabilityEnd: string;

  // location & contact
  location: any;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  contact: string;
  contactName: string;
  email: string;

  // admin
  status: string;
  collectionId: string;
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
    productCategoryId: f.category?.id || '',
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
    dimension: f.dimension,
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
    salesPrice: f.salesPrice,
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
  product: any | null,
  companyId: string
) {
  const getInitial = (): ProductForm => {
    const p = product || {};
    return {
      id: p.id || '',
      companyId,
      name: p.name || '',
      description: p.description || '',
      
      subCategoryName: p.subCategoryName || '',

      category: p.category || null,
      subCategory: p.subCategory || null,
      brand: p.brand || null,

      tags: p.tags || [],
      collectionId: p.collectionId || '',
      
      model: p.model || '',
      color: p.color || [],
      size: p.size || [],
      weight: p.weight || '',
      condition: p.condition || '',
      dimension: p.dimension || '',
      dimensions: p.dimensions || '',
      material: p.material || [],
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
      quantity: p.companyStock ?? 1,
      costPrice: p.costPrice ?? 0,
      salesPrice: p.salesPrice ?? 0,
      discount: p.discount ?? 0,
      finalPrice: p.finalPrice ?? 0,
      profitMargin: p.profitMargin ?? 0,
      startDealDate: p.startDealDate || null,
      endDealDate: p.endDealDate || null,
      make: p.make || '',
      trim: p.trim || '',
      type: p.type || '',
      mileage: p.mileage || '',
      engineType: p.engineType || '',
      engineSize: p.engineSize || '',
      transmission: p.transmission || '',
      drivetrain: p.drivetrain || '',
      vin: p.vin || '',
      logbookStatus: p.logbookStatus || 'Available',
      serviceHistory: p.serviceHistory || 'Full',
      negotiable: p.negotiable ?? false,
      financingAvailable: p.financingAvailable ?? false,
      tradeIn: p.tradeIn ?? false,
      features: p.features || [],
      author: p.author || '',
      publisher: p.publisher || '',
      isbn: p.isbn || '',
      fabricComposition: p.fabricComposition || '',
      careInstructions: p.careInstructions || '',
      energyRating: p.energyRating || '',
      warrantyPeriod: p.warrantyPeriod || '',
      ingredients: p.ingredients || '',
      usageInstructions: p.usageInstructions || '',
      expirationDate: p.expirationDate || null,
      option: p.option || [],
      amenities: p.amenities || [],
      bedrooms: p.bedrooms || [],
      studios: p.studios || [],
      bathrooms: p.bathrooms || '',
      area: p.area || '',
      propertyTypeId: p.propertyTypeId || '',
      serviceSchedule: p.serviceSchedule || '',
      year: p.year || '',
      availabilityStart: p.availabilityStart || '',
      availabilityEnd: p.availabilityEnd || '',
      location: p.location || {},
      locationName: p.locationName || '',
      latitude: p.latitude ?? null,
      longitude: p.longitude ?? null,
      contact: p.contact || '',
      contactName: p.contactName || '',
      email: p.email || '',
      status: p.status || 'ACTIVE',
    };
  };

  const [formData, setFormData] = useState<ProductForm>(getInitial);

  useEffect(() => {
    const cost = formData.costPrice;
    const sale = formData.salesPrice;
    const disc = formData.discount;
    const finalPrice = sale - (sale * disc) / 100;
    const profitMargin = cost > 0 ? ((sale - cost) / cost) * 100 : 0;
    setFormData((f) => ({ ...f, finalPrice, profitMargin }));
  }, [formData.costPrice, formData.salesPrice, formData.discount]);

  const updateField = useCallback(
    (name: keyof ProductForm, value: any) => {
      setFormData((f) => ({ ...f, [name]: value }));
    },
    []
  );

  return { formData, updateField };
}

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
  const [newImages, setNewImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  

  // Category steps & component
  const categoryKey = formData.category?.displayName.trim() || '';
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
      const imageUrls = newImages.length
        ? await uploadFiles(newImages, 'image')
        : formData.images;
      const payload = buildProductPayload({ ...formData, images: imageUrls }, imageUrls);
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
                onCategoryChange={cat => updateField('category', cat)}
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
                newImages={newImages}
                setNewImages={setNewImages}
              />
            ) : (
              <p>No form for this step.</p>
            )}
          </div>
        </motion.div>

        {/* <motion.div
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
                formData={{ category: formData.category, subCategory: formData.subCategory, brand: formData.brand }}
                categories={pickerCategories}
                filteredBrands={filteredBrands}
                onCategoryChange={handleCategoryChange}
                onSubCategoryChange={handleSubCategoryChange}
                onBrandChange={handleBrandChange}
              />
            ) : FormComponent ? (
              <FormComponent
                formData={formData}
                setFormData={updateField as any}
                handleInputChange={handleInputChange}
                filteredSubCategories={filteredSubCategories}
                filteredBrands={filteredBrands}
                newImages={newImages}
                setNewImages={setNewImages}
              />
            ) : (
              <p>No form for this step.</p>
            )}
          </div>
        </motion.div> */}
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
