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


// -----------------------------------------------------------------------------
// 1) Prop & Form Types
// -----------------------------------------------------------------------------
interface AddToProductMarketModalProps {
  showRequestProductModal: boolean;
  setShowRequestProductModal: (open: boolean) => void;
  product: ProductForm; // Use the more specific type
  marketListItem?: MarketListingForm; // Use the more specific type
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

/**
 * Turn a full ProductForm into a MarketListingForm skeleton
 * so the user can tweak it before saving.
 */
function productToListingForm(
  p: ProductForm,
  categories: StoreCategory[]
): MarketListingForm {
  // find the category object if any
  const cat = categories.find(c => c.categoryId === p.category?.id) ?? null;

  return {
    // copy over basic IDs & metadata
    id:           '',                 // new listing, so blank
    productId:    p.id,
    sellerType:   'ADMIN',
    companyId:    p.companyId,
    productTypeId: p.propertyTypeId || '',
    name:         p.name,
    description:  p.description || undefined,
    longDescription: p.longDescription || undefined,

    // category/subcategory
    productCategoryId: p.category?.id          || '',
    category:          cat,
    subCategory:       p.subCategory || cat?.items || {},
    subCategoryName:   p.subCategoryName,
    tags:              p.tags,

    // pricing & inventory
    quantity:     p.quantity,
    buyingPrice:  p.costPrice,
    sellingPrice: p.sellingPrice,
    discount:     p.discount,
    finalPrice:   p.finalPrice,
    profitMargin: p.profitMargin,
    pricingTiers: p.pricingTiers,

    // deal dates
    startDealDate: p.startDealDate?.toString() || null,
    endDealDate:   p.endDealDate?.toString()   || null,

    // flags
    isAvailable:   p.isAvailable,
    isOnOffer:     p.isOnOffer,
    isFlashDeal:   p.isFlashDeal,
    isNewArrival:  p.isNewArrival,
    isDiscounted:  p.isDiscounted,
    isFeatured:    p.isFeatured,

    // delivery & options
    delivery:      p.deliveryMethod === 'DELIVERY',
    paymentOption: p.paymentOption || 'AT SHOP',
    showOnGhuba:   true,

    // contact & location
    contactName: p.contactName,
    contact:     p.contact,
    email:       p.email,
    locationName: p.locationName,
    location:    p.location,
    locationId:  p.locationId,
    latitude:    p.latitude,
    longitude:   p.longitude,

    // vehicle fields
    make:        p.make,
    trim:        p.trim,
    type:        p.type,
    mileage:     p.mileage,
    engineType:  p.engineType,
    engineSize:  p.engineSize,
    horsepower:  p.horsepower,
    torque:      p.torque,
    fuelType:    p.fuelType,
    fuelEconomy: p.fuelEconomy,
    transmission:p.transmission,
    drivetrain:  p.drivetrain,
    vin:         p.vin,
    logbookStatus: p.logbookStatus,
    serviceHistory: p.serviceHistory,
    negotiable:    p.negotiable,
    financingAvailable: p.financingAvailable,
    tradeIn:       p.tradeIn,
    features:      p.features,

    // …and copy any other shared fields you care about…
    // e.g. author, publisher, isbn, dimensions, material, etc.

    // everything else you’ll probably leave at its default:
    weight:          p.weight,
    condition:       p.condition,
    material:        p.material,
    amenities:       p.amenities,
    bedrooms:        p.bedrooms,
    studios:         p.studios,
    bathrooms:       p.bathrooms,
    area:            p.area,
    serviceSchedule: p.serviceSchedule,
    availabilityStart: p.availabilityStart?.toString() || null,
    availabilityEnd:   p.availabilityEnd?.toString()   || null,
    bookingSlots:      p.bookingSlots,

    // defaults for anything not on ProductForm
    minNoticePeriod:   null,
    maxBookingAhead:   null,
    requiredClientInfo: null,
    fulfillmentStatus:  null,
    totalCapacity:      p.totalCapacity,
    currentBookedCount: p.currentBookedCount,
    providerRating:     p.providerRating,
    hourlyRate:         p.hourlyRate,
    minimumHours:       p.minimumHours,
    digitalUrl:         p.digitalUrl,
    autoDeliver:        p.autoDeliver,
    status:             'ACTIVE',
    collectionId:       p.collectionId,
    year:               p.year,
    commissionType:     '',
    commissionRate:     0,
    commissionStartDate: null,
    commissionEndDate:   null,
  };
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
    name: f.name,
    description: f.description || null, // Ensure null for optional strings
    longDescription: f.longDescription || null, // Added
    quantity: f.quantity,
    // IMPORTANT: Use the productCategoryId derived from StoreCategory
    productCategoryId: f.productCategoryId,
    // Use the displayName from the StoreCategory for the denormalized 'category' string field
    category: f.category?.displayName || null,
    // Use the `items` from the selected StoreCategory for `subCategory` JSON
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
    horsepower: f.horsepower,
    torque: f.torque,
    fuelType: f.fuelType || null,
    fuelEconomy: f.fuelEconomy || null,
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
    productTypeId: f.productTypeId || null,
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
  product: ProductForm,
  marketListItem: MarketListingForm | undefined,
  companyId: string,
  categories: StoreCategory[] // Added categories to hook parameters
) {

  const getInitial = useCallback((): MarketListingForm => {

    const raw : MarketListingForm | any = marketListItem || {};

    const p : ProductForm = product || {};

    // Find the initial StoreCategory object if productCategoryId is set
    
    let initialCategory: StoreCategory | null = null;

    const initialProductCategoryId = raw.productCategoryId || p.category?.id || '';

    if (initialProductCategoryId) {
      initialCategory = categories.find(
        (cat) => cat.categoryId === initialProductCategoryId
      ) || null;
    }

    return {
      id: raw.id || '',
      productId: raw.productId || p.id || '',
      sellerType: raw.sellerType || 'ADMIN',
      companyId: raw.companyId || p.companyId || companyId,
      productTypeId: raw.propertyTypeId || p.propertyType?.id || '',
      commissionRateId: raw.commissionRateId || '',

      name: raw.name || p.name || '',
      description: raw.description || p.description || undefined,
      longDescription: raw.longDescription || p.longDescription || undefined,

      productCategoryId: initialProductCategoryId, // Set the actual ProductCategory ID
      category: initialCategory, // Store the full StoreCategory object
      subCategory: raw.subCategory || initialCategory?.items || {}, // Initialize subCategory from StoreCategory.items
      subCategoryName: raw.subCategoryName || p.subCategoryName || '',
      tags: raw.tags || p.tags || [],

      brand: raw.brand || p.brand || undefined,
      model: raw.model || p.model || '',
      color: raw.color || p.color || [],
      size: raw.size || p.size || [],
      weight: raw.weight || p.weight || '',
      condition: raw.condition || p.condition || '',
      dimensions: raw.dimensions || p.dimensions || '',
      material: raw.material || p.material || [],

      quantity: raw.quantity ?? p.quantity ?? 1,
      buyingPrice: raw.buyingPrice ?? p.costPrice ?? 0,
      sellingPrice: raw.sellingPrice ?? p.sellingPrice ?? 0,
      discount: raw.discount ?? p.discount ?? 0,
      finalPrice: raw.finalPrice ?? 0, // Will be calculated by useEffect
      profitMargin: raw.profitMargin ?? 0, // Will be calculated by useEffect
      pricingTiers: raw.pricingTiers || [],

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
      email: raw.email || p.email || undefined,
      locationName: raw.locationName || p.locationName || '',
      location: raw.location || p.location || {},
      locationId: raw.locationId || p.locationId || '',
      latitude: raw.latitude ?? p.latitude ?? null,
      longitude: raw.longitude ?? p.longitude ?? null,
      amenities: raw.amenities || p.amenities || [],

      make: raw.make || p.make || '',
      trim: raw.trim || p.trim || '',
      type: raw.type || p.type || '',
      mileage: raw.mileage || p.mileage || '',
      engineType: raw.engineType || p.engineType || '',
      engineSize: raw.engineSize ?? p.engineSize ?? null,
      horsepower: raw.horsepower ?? p.horsepower ?? null,
      torque: raw.torque ?? p.torque ?? null,
      fuelType: raw.fuelType || p.fuelType || '',
      fuelEconomy: raw.fuelEconomy || p.fuelEconomy || '',
      transmission: raw.transmission || p.transmission || '',
      drivetrain: raw.drivetrain || p.drivetrain || '',
      vin: raw.vin || p.vin || '',
      logbookStatus: raw.logbookStatus || p.logbookStatus || 'Available',
      serviceHistory: raw.serviceHistory || p.serviceHistory || 'Full',
      negotiable: raw.negotiable ?? p.negotiable ?? false,
      financingAvailable: raw.financingAvailable ?? p.financingAvailable ?? false,
      tradeIn: raw.tradeIn ?? p.tradeIn ?? false,
      features: raw.features || [],

      previousOwners: raw.previousOwners ?? p.previousOwners ?? null,
      tireCondition: raw.tireCondition || p.tireCondition || '',
      accidentalHistory: raw.accidentalHistory ?? p.accidentalHistory ?? false,
      tax: raw.tax ?? undefined,
      shippingCost: raw.shippingCost ?? undefined,

      author: raw.author || p.author || '',
      publisher: raw.publisher || p.publisher || '',
      isbn: raw.isbn || p.isbn || '',

      fabricComposition: raw.fabricComposition || p.fabricComposition || '',
      careInstructions: raw.careInstructions || p.careInstructions || '',

      energyRating: raw.energyRating || p.energyRating || '',
      warrantyPeriod: raw.warrantyPeriod || p.warrantyPeriod || '',
      applianceDimensions: raw.applianceDimensions || p.dimensions || '',

      ingredients: raw.ingredients || p.ingredients || '',
      usageInstructions: raw.usageInstructions || p.usageInstructions || '',
      expirationDate: (raw.expirationDate || p.expirationDate)?.toString() || null,

      bedrooms: raw.bedrooms ?? p.bedrooms ?? null,
      studios: raw.studios ?? p.studios ?? null,
      bathrooms: raw.bathrooms ?? p.bathrooms ?? null,
      area: raw.area || p.area || '',
      serviceSchedule: raw.serviceSchedule || p.serviceSchedule || '',

      availabilityStart: (raw.availabilityStart || p.availabilityStart)?.toString() || null,
      availabilityEnd: (raw.availabilityEnd || p.availabilityEnd)?.toString() || null,
      bookingSlots: raw.bookingSlots || [],
      minNoticePeriod: raw.minNoticePeriod || '',
      maxBookingAhead: raw.maxBookingAhead || '',
      requiredClientInfo: raw.requiredClientInfo || '',
      fulfillmentStatus: raw.fulfillmentStatus || '',
      totalCapacity: raw.totalCapacity ?? p.totalCapacity ?? null,
      currentBookedCount: raw.currentBookedCount ?? p.currentBookedCount ?? null,
      providerRating: raw.providerRating ?? p.providerRating ?? null,
      hourlyRate: raw.hourlyRate ?? p.hourlyRate ?? null,
      minimumHours: raw.minimumHours ?? p.minimumHours ?? null,
      deliveryMethod: raw.deliveryMethod || '',

      digitalUrl: raw.digitalUrl || p.digitalUrl || '',
      autoDeliver: raw.autoDeliver ?? p.autoDeliver ?? false,

      status: raw.status || p.status || 'ACTIVE',
      collectionId: raw.collectionId || p.collectionId || undefined,
      year: raw.year ?? p.year ?? null,

      commissionType: raw.commissionType || '',
      commissionRate: raw.commissionRate ?? 0,
      commissionStartDate: (raw.commissionStartDate || p.commissionStartDate)?.toString() || null,
      commissionEndDate: (raw.commissionEndDate || p.commissionEndDate)?.toString() || null,
    };
  }, [product, marketListItem, companyId, categories]); // Added categories to the useCallback dependencies

  const [formData, setFormData] = useState<MarketListingForm>(getInitial); // Initialize with the memoized function

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

  // Use an effect to re-initialize form data if product, marketListItem, companyId, or categories change
  useEffect(() => {
    setFormData(getInitial());
  }, [getInitial]); // `getInitial` is a useCallback, so it only changes if its dependencies change.

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
  const { formData, updateField } = useMarketListingForm(product, marketListItem, companyId, categories); // Pass categories

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
        categoryId: raw.categoryId, // Ensure categoryId is available here
      })),
    [categories]
  );

  // input handlers
  const handleInputChange = useCallback(
  (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    let parsedValue: any = value;

    // Handle numbers
    if (
      [
        'discount', 'buyingPrice', 'sellingPrice', 'finalPrice', 'profitMargin',
          'quantity', 'engineSize', 'horsepower', 'torque', 'previousOwners',
          'year', 'bathrooms', 'bedrooms', 'studios', 'hourlyRate', 'minimumHours',
          'totalCapacity', 'currentBookedCount', 'providerRating', 'tax', 'shippingCost',
          'commissionRate'
      ].includes(name)
    ) {
      parsedValue = parseFloat(value) || 0;
      if (isNaN(parsedValue)) parsedValue = null;
    }
    // Handle booleans (checkboxes)
    else if (type === 'checkbox') {
      // Narrow to HTMLInputElement so TS knows `.checked` exists:
      parsedValue = (e.target as HTMLInputElement).checked;
    }
    // Empty‑string fields
    else if (value === '') {
      parsedValue = undefined;
    }

    updateField(name as keyof MarketListingForm, parsedValue);
  },
  [updateField]
);


  const handleCategoryChange = useCallback(
    (cat: StoreCategory | null) => {
      updateField('category', cat); // Store the full StoreCategory object
      updateField('productCategoryId', cat?.categoryId || ''); // Crucial: Store the ID from StoreCategory
      updateField('subCategory', cat?.items || []); // If StoreCategory.items holds subcategories
      updateField('subCategoryName', ''); // Reset subCategoryName or derive it
      // Optionally reset brand if brands are category-specific
      // updateField('brand', null);
    },
    [updateField]
  );
  const handleSubCategoryChange = useCallback(
    (sub: any) => {
      updateField('subCategory', sub);
      // You might also want to set subCategoryName based on the selected sub
      updateField('subCategoryName', sub?.name || ''); // Assuming sub has a 'name' property
    },
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
                categories={categories}
                filteredBrands={formData.category?.allBrands || []}
                onCategoryChange={handleCategoryChange}
                onSubCategoryChange={handleSubCategoryChange}
                onBrandChange={brand => updateField('brand', brand)}
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


