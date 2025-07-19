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
import {
  MarketListingForm,
  ProductForm,
  StoreCategory,
} from '@/types/typings';
import PricingDetails from './PricingDetails';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// -----------------------------------------------------------------------------
// 1) File upload helper
// -----------------------------------------------------------------------------
async function uploadFiles(
  files: File[],
  type: 'image' | 'video' | 'file'
): Promise<string[]> {
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

// -----------------------------------------------------------------------------
// 2) product → listing converter
// -----------------------------------------------------------------------------
function productToListingForm(
  p: ProductForm,
  categories: StoreCategory[]
): MarketListingForm {
  const cat = categories.find(c => c.categoryId === p?.category?.id) ?? null;

  return {
  // identifiers & metadata
  id: '',
  productId: p?.id,
  sellerType: 'ADMIN',
  companyId: p?.companyId,
  productTypeId: p?.propertyTypeId || '',
  commissionRateId: '',

  // titles & descriptions
  name: p?.name,
  description: p?.description || undefined,
  longDescription: p?.longDescription || undefined,

  // categorization
  productCategoryId: p?.category?.id || '',
  category: p?.category,
  subCategory: p?.subCategory || cat?.items || {},
  subCategoryName: p?.subCategoryName,
  tags: p?.tags,

  // visual media (filled later)
  // images/videos are handled in payload builder
  // pricing & inventory
  quantity: p?.quantity,

  // buyingPrice: p?.costPrice,
  // sellingPrice: p?.sellingPrice,

  buyingPrice: p?.sellingPrice,
  sellingPrice: p?.sellingPrice, 

  discount: p?.discount,
  finalPrice: p?.finalPrice,
  profitMargin: p?.profitMargin,
  pricingTiers: p?.pricingTiers,

  // deal dates
  startDealDate: p?.startDealDate?.toString() || null,
  endDealDate: p?.endDealDate?.toString() || null,

  // availability flags
  isAvailable: p?.isAvailable,
  isOnOffer: p?.isOnOffer,
  isFlashDeal: p?.isFlashDeal,
  isNewArrival: p?.isNewArrival,
  isDiscounted: p?.isDiscounted,
  isFeatured: p?.isFeatured,

  // delivery & payment
  delivery: p?.deliveryMethod === 'DELIVERY',
  paymentOption: p?.paymentOption || 'AT SHOP',
  showOnGhuba: true,

  // contact & location
  contactName: p?.contactName,
  contact: p?.contact,
  email: p?.email,
  locationName: p?.locationName,
  location: p?.location,
  locationId: p?.locationId,
  latitude: p?.latitude,
  longitude: p?.longitude,

  // core product fields
  model: p?.model,
  color: p?.color,
  size: p?.size,
  weight: p?.weight,
  condition: p?.condition,
  dimensions: p?.dimensions,
  material: p?.material,

  // vehicle-specific
  make: p?.make,
  trim: p?.trim,
  type: p?.type,
  mileage: p?.mileage,
  engineType: p?.engineType,
  engineSize: p?.engineSize,
  horsepower: p?.horsepower,
  torque: p?.torque,
  fuelType: p?.fuelType,
  fuelEconomy: p?.fuelEconomy,
  transmission: p?.transmission,
  drivetrain: p?.drivetrain,
  vin: p?.vin,
  logbookStatus: p?.logbookStatus,
  serviceHistory: p?.serviceHistory,
  negotiable: p?.negotiable,
  financingAvailable: p?.financingAvailable,
  tradeIn: p?.tradeIn,
  features: p?.features,

  // bookable/service-specific
  hourlyRate: p?.hourlyRate,
  minimumHours: p?.minimumHours,
  minNoticePeriod: p?.minNoticePeriod,
  maxBookingAhead: p?.maxBookingAhead,
  totalCapacity: p?.totalCapacity,
  currentBookedCount: p?.currentBookedCount,
  providerRating: p?.providerRating,
  bookingSlots: p?.bookingSlots,
  requiredClientInfo: p?.requiredClientInfo,
  fulfillmentStatus: p?.fulfillmentStatus,
  deliveryMethod: p?.deliveryMethod,

  // property-specific
  bedrooms: p?.bedrooms,
  studios: p?.studios,
  bathrooms: p?.bathrooms,
  area: p?.area,
  serviceSchedule: p?.serviceSchedule,
  availabilityStart: p?.availabilityStart?.toString() || null,
  availabilityEnd: p?.availabilityEnd?.toString() || null,
  amenities: p?.amenities,

  // bookable consumables
  ingredients: p?.ingredients,
  usageInstructions: p?.usageInstructions,
  expirationDate: p?.expirationDate?.toString() || null,

  // textiles & appliances
  fabricComposition: p?.fabricComposition,
  careInstructions: p?.careInstructions,
  energyRating: p?.energyRating,
  warrantyPeriod: p?.warrantyPeriod,
  applianceDimensions: p?.applianceDimensions,

  // commission
  commissionType: '',
  commissionRate: 0,
  commissionStartDate: null,
  commissionEndDate: null,

  // misc
  author: p?.author,
  publisher: p?.publisher,
  isbn: p?.isbn,
  tax: p?.tax,
  shippingCost: p?.shippingCost,

  // status & grouping
  status: 'ACTIVE',
  collectionId: p?.collectionId,
  year: p?.year,
  
  brand: null,
  option: [],
  
  previousOwners: null,
  tireCondition: '',
  accidentalHistory: false,
  
  digitalUrl: '',
  autoDeliver: false,
  
};
}

// -----------------------------------------------------------------------------
// 3) Build payload for API
// -----------------------------------------------------------------------------
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
    description: f.description || null,
    longDescription: f.longDescription || null,
    quantity: f.quantity,
    productCategoryId: f.category?.categoryId,
    category: f.category?.displayName || null,
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
// 4) useMarketListingForm hook
// -----------------------------------------------------------------------------
function useMarketListingForm(
  product: ProductForm,
  marketListItem: MarketListingForm | undefined,
  companyId: string,
  categories: StoreCategory[]
) {
  const getInitial = useCallback((): MarketListingForm => {
    const raw: Partial<MarketListingForm> = marketListItem || {};
    const p: ProductForm = product;

    let initialCategory: StoreCategory | null = null;
    const initialProductCategoryId = raw.productCategoryId || p?.category?.id || '';

    if (initialProductCategoryId) {
      initialCategory =
        categories.find(
          (cat) => cat.categoryId === initialProductCategoryId
        ) || null;
    }

    // merge raw (edit-mode) or p (new-listing) with defaults
    return {
      // (repeat every property exactly as in productToListingForm,
      // but first taking raw.* then falling back to p.* then to literal defaults)
      // ...for brevity, assume same structure & order as above converter...
      ...(marketListItem
        ? { ...productToListingForm(p, categories), ...marketListItem }
        : productToListingForm(p, categories)),
    } as MarketListingForm;
  }, [product, marketListItem, companyId, categories]);

  const [formData, setFormData] = useState<MarketListingForm>(getInitial);

  // recalc prices
  useEffect(() => {
    const { buyingPrice, sellingPrice, discount } = formData;
    const finalPrice = sellingPrice - (sellingPrice * discount) / 100;
    const profitMargin =
      buyingPrice > 0 ? ((finalPrice - buyingPrice) / buyingPrice) * 100 : 0;
    setFormData((f) => ({ ...f, finalPrice, profitMargin }));
  }, [formData.buyingPrice, formData.sellingPrice, formData.discount]);

  const updateField = useCallback(
    <K extends keyof MarketListingForm>(name: K, value: MarketListingForm[K]) => {
      setFormData((f) => ({ ...f, [name]: value }));
    },
    []
  );

  useEffect(() => {
    setFormData(getInitial());
  }, [getInitial]);

  return { formData, updateField };
}

// -----------------------------------------------------------------------------
// 5) Main Component
// -----------------------------------------------------------------------------
export default function AddToProductMarketModal({
  showRequestProductModal,
  setShowRequestProductModal,
  product,
  marketListItem,
  companyId,
  categories,
}: AddToProductMarketModalProps) {
  const { formData, updateField } = useMarketListingForm(
    product,
    marketListItem,
    companyId,
    categories
  );

  // Load from product
  const handleLoadFromProduct = () => {
    const initial = productToListingForm(product, categories);
    Object.entries(initial).forEach(([key, val]) =>
      updateField(key as keyof MarketListingForm, val as any)
    );
  };

  // UI state
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const categoryKey = formData.category?.displayName?.trim() || '';
  const stepsForCategory = useMemo(
    () => CATEGORY_STEPS[categoryKey] || [1],
    [categoryKey]
  );
  const currentDynamicStep = stepsForCategory[step - 1] || 1;
  const FormComponent = useMemo(
    () => FORM_COMPONENTS[currentDynamicStep] || FORM_COMPONENTS[1],
    [currentDynamicStep]
  );
  const lastStepIndex = stepsForCategory.length;
  const isFirstStep = step === 1;
  const isLastStep = step === lastStepIndex;

  // input handlers (same as you had)
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      let parsed: any = value;
      if (
        [
          'discount',
          'buyingPrice',
          'sellingPrice',
          'finalPrice',
          'profitMargin',
          'quantity',
          'engineSize',
          'horsepower',
          'torque',
          'previousOwners',
          'year',
          'bathrooms',
          'bedrooms',
          'studios',
          'hourlyRate',
          'minimumHours',
          'totalCapacity',
          'currentBookedCount',
          'providerRating',
          'tax',
          'shippingCost',
          'commissionRate',
        ].includes(name)
      ) {
        parsed = parseFloat(value) || 0;
      } else if (type === 'checkbox') {
        parsed = (e.target as HTMLInputElement).checked;
      } else if (value === '') {
        parsed = undefined;
      }
      updateField(name as any, parsed);
    },
    [updateField]
  );

  const handleCategoryChange = useCallback(
    (cat: StoreCategory | null) => {
      updateField('category', cat);
      updateField('productCategoryId', cat?.categoryId || '');
      updateField('subCategory', cat?.items || {});
      updateField('subCategoryName', '');
    },
    [updateField]
  );
  const handleSubCategoryChange = useCallback(
    (sub: any) => {
      updateField('subCategory', sub);
      updateField('subCategoryName', sub?.name || '');
    },
    [updateField]
  );
  const handleBrandChange = useCallback(
    (b: string) => updateField('brand', b),
    [updateField]
  );

  // final submit
  const handleCreateListing = async () => {
    if (!window.confirm('Create listing?')) return;
    setLoading(true);
    try {
      const [imageUrls, videoUrls] = await Promise.all([
        uploadFiles(imageFiles, 'image'),
        uploadFiles(videoFiles, 'video'),
      ]);

      const payload = buildListingPayload(
        {
          ...formData,
          startDealDate: formData.startDealDate
            ? new Date(formData.startDealDate).toISOString()
            : null,
          endDealDate: formData.endDealDate
            ? new Date(formData.endDealDate).toISOString()
            : null,
          expirationDate: formData.expirationDate
            ? new Date(formData.expirationDate).toISOString()
            : null,
          availabilityStart: formData.availabilityStart
            ? new Date(formData.availabilityStart).toISOString()
            : null,
          availabilityEnd: formData.availabilityEnd
            ? new Date(formData.availabilityEnd).toISOString()
            : null,
          commissionStartDate: formData.commissionStartDate
            ? new Date(formData.commissionStartDate).toISOString()
            : null,
          commissionEndDate: formData.commissionEndDate
            ? new Date(formData.commissionEndDate).toISOString()
            : null,
        },
        imageUrls,
        videoUrls
      );

      const res = await fetch(`${apiUrl}/admin/post-market-list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).message || res.statusText);

      alert('Listing created!');
      setShowRequestProductModal(false);
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={showRequestProductModal}
      onClose={() => setShowRequestProductModal(false)}
    >
      <div className="relative p-6 bg-white rounded-xl shadow-lg text-gray-900 w-full max-w-4xl h-[90vh] flex flex-col">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <span>Uploading…</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {marketListItem ? 'Edit Listing' : 'New Listing'}
          </h2>
          {!marketListItem && (
            <button
              type="button"
              onClick={handleLoadFromProduct}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
            >
              Load from product
            </button>
          )}
        </div>

        {/* Steps & Form */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="flex-grow overflow-y-auto"
        >
          <Stepper
            step={step}
            stepsForCategory={stepsForCategory}
            STEP_LABELS={STEP_LABELS}
          />
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
                onBrandChange={(b) => updateField('brand', b)}
              />
            ) :  currentDynamicStep === 7 ? (
                    // PricingDetails is mapped to step 7
                    <PricingDetails<MarketListingForm>
                      formData={formData}
                      setFormData={updateField}
                      costField="buyingPrice"
                      revenueField="sellingPrice"
                      discountField="discount"
                      finalField="finalPrice"
                      marginField="profitMargin"
                    />
                  ) :
                  (
                    <FormComponent
                      formData={formData}
                      handleInputChange={handleInputChange}
                      setFormData={updateField as any}
                    />
                  )}
          </div>
        </motion.div>

        {/* Footer */}
        <div className="flex justify-between pt-4 border-t">
          {!isFirstStep ? (
            <button
              className="btn-secondary flex items-center"
              onClick={() => setStep(s => s - 1)}
              disabled={loading}
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              Back
            </button>
          ) : <div />}

          {isLastStep ? (
            <button
              className="btn-success flex items-center"
              onClick={handleCreateListing}
              disabled={loading}
            >
              Submit
              <CheckCircleIcon className="h-5 w-5 ml-1" />
            </button>
          ) : (
            <button
              className="btn-primary flex items-center"
              onClick={() => setStep(s => s + 1)}
              disabled={loading}
            >
              Next
              <ArrowRightIcon className="h-5 w-5 ml-1" />
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

interface AddToProductMarketModalProps {
  showRequestProductModal: boolean;
  setShowRequestProductModal: (open: boolean) => void;
  product: ProductForm;
  marketListItem?: MarketListingForm;
  companyId: string;
  categories: StoreCategory[];
}
