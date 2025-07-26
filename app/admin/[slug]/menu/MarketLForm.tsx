"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import toast from 'react-hot-toast'; // Assuming react-hot-toast is available
import {
  
} from '@heroicons/react/24/solid'; // Icons from Lucide
import { ArchiveBoxArrowDownIcon, ArchiveBoxIcon, BookOpenIcon, CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon, CurrencyDollarIcon, HomeIcon, InformationCircleIcon, MapPinIcon, PhotoIcon, VideoCameraSlashIcon, WalletIcon } from "@heroicons/react/24/outline";
import { MarketListingForm, StoreCategory } from "@/types/typings";

// --- Type Definitions (Updated for MarketListingForm and StoreCategory) ---
interface ImageAsset {
  id?: string;
  url: string;
}

// Simplified MarketListingForm for demonstration.
// In a real app, this would be much more detailed and potentially split into sub-interfaces.
// interface MarketListingForm {
//   id?: string; // Optional for new listings
//   name: string;
//   description: string | null;
//   images: string[]; // Changed to string[] based on your snippet `images: imageUrl ? [imageUrl] : []`
//   video: string | null;
//   tags: string[];
//   productCategoryId: string; // Renamed from productCategoryId to categoryId if it refers to StoreCategory
//   // Assuming 'category' is a client-side populated field for display, not for submission
//   category?: StoreCategory;

//   // Pricing & Availability
//   buyingPrice: number; // Renamed from costPrice
//   sellingPrice: number; // Renamed from salesPrice
//   finalPrice: number;
//   discount: number;
//   isAvailable: boolean;
//   isOnOffer: boolean;
//   isFlashDeal: boolean;
//   isNewArrival: boolean;
//   isDiscounted: boolean;
//   isFeatured: boolean;
//   ingredients: string | null; // From "Dish" context, might be "materials" or "components" for other listings

//   // General Listing Details
//   productId: string; // Unique identifier for the product itself, if different from listing ID
//   sellerType: string;
//   subCategory?: string; // Optional sub-category ID
//   subCategoryName: string; // Optional sub-category name

//   // Product Specifics (Conditional based on category)
//   brand: string | null;
//   model: string;
//   color: string[];
//   size: string[];
//   weight: string;
//   condition: string; // e.g., 'New', 'Used', 'Refurbished'
//   dimensions: string;
//   material: string[]; // e.g., 'Cotton', 'Wood', 'Plastic'
//   quantity: number;
//   profitMargin: number;
//   pricingTiers: { quantity: number; price: number }[]; // For bulk pricing
//   startDealDate: string | null; // ISO Date string
//   endDealDate: string | null; // ISO Date string

//   // Transaction & Logistics
//   delivery: boolean;
//   paymentOption: string; // e.g., 'M-Pesa', 'Card', 'Cash'
//   showOnGhuba: boolean; // Platform specific flag

//   // Contact & Location
//   contactName: string;
//   contact: string; // Phone number or email
//   locationName: string; // Human-readable location
//   location: { lat: number; lng: number } | undefined; // Geo coordinates
//   latitude: number | null;
//   longitude: number | null;

//   // Vehicle Specific (example conditional fields)
//   make: string;
//   trim: string;
//   type: string; // e.g., 'Sedan', 'SUV', 'Motorcycle'
//   mileage: string;
//   engineType: string;
//   engineSize: number | null;
//   horsepower: number | null;
//   torque: number | null;
//   fuelType: string;
//   fuelEconomy: string;
//   transmission: string;
//   drivetrain: string;
//   vin: string;
//   logbookStatus: string;
//   serviceHistory: string;
//   negotiable: boolean;
//   financingAvailable: boolean;
//   tradeIn: boolean;
//   features: string[];
//   previousOwners: number | null;
//   tireCondition: string;
//   accidentalHistory: boolean;

//   // Book Specific (example conditional fields)
//   author: string;
//   publisher: string;
//   isbn: string;

//   // Clothing Specific (example conditional fields)
//   fabricComposition: string;
//   careInstructions: string;

//   // Appliance Specific (example conditional fields)
//   energyRating: string;
//   warrantyPeriod: string;
//   usageInstructions: string;

//   // Property Specific (example conditional fields)
//   expirationDate: string | null; // For listings that expire
//   bedrooms: number | null;
//   studios: number | null;
//   bathrooms: number | null;
//   area: string; // e.g., "1200 sqft"
//   amenities: string[]; // e.g., 'Swimming Pool', 'Gym'

//   // Service Specific (example conditional fields)
//   serviceSchedule: string; // e.g., 'Hourly', 'Daily', 'Project-based'
//   availabilityStart: string | null; // ISO Date string
//   availabilityEnd: string | null; // ISO Date string

//   // Digital Product Specific (example conditional fields)
//   digitalUrl: string;
//   autoDeliver: boolean;

//   // Admin/Platform Specific
//   status: string; // 'Active', 'Pending', 'Archived'
//   commissionType: string;
//   commissionRate: number;
//   commissionStartDate: string | null;
//   commissionEndDate: string | null;

//   createdAt?: string; // Optional, set by backend
//   updatedAt?: string; // Optional, set by backend
// }

// interface StoreCategory {
//   id: string;
//   name: string;
//   slug?: string;
//   description?: string | null;
//   image?: string | null;
//   sortOrder: number;
//   visible: boolean;
//   companyId: string | null;
//   createdAt?: string;
//   updatedAt?: string;
//   // Add a property to define what kind of fields this category expects
// }

// --- Image loader (for Next.js Image component) ---
const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;


// --- Add/Edit MarketListingForm Form Component ---
interface MarketListingFormProps {
  onSubmit: (listing: Omit<MarketListingForm, 'id' | 'createdAt' | 'updatedAt' | 'category'>) => void;
  onCancel: () => void;
  isLoading: boolean;
  categories: StoreCategory[];
  initialData?: MarketListingForm; // For editing
}

const MarketLForm: React.FC<MarketListingFormProps> = ({ onSubmit, onCancel, isLoading, categories, initialData }) => {
  // --- Form State ---
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [productCategoryId, setProductCategoryId] = useState(initialData?.productCategoryId || '');
  const [sellingPrice, setSellingPrice] = useState<string>(initialData?.sellingPrice.toString() || '');
  const [buyingPrice, setBuyingPrice] = useState<string>(initialData?.buyingPrice.toString() || '');
  const [discount, setDiscount] = useState<string>(initialData?.discount.toString() || '0');
  const [isAvailable, setIsAvailable] = useState(initialData?.isAvailable ?? true);
  const [isOnOffer, setIsOnOffer] = useState(initialData?.isOnOffer ?? false);
  const [ingredients, setIngredients] = useState(initialData?.ingredients || ''); // General purpose 'components'
  const [imageUrl, setImageUrl] = useState(initialData?.images?.[0] || '');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string | null }>({});

  // Dynamic fields based on initialData or category selection
  const [productId, setProductId] = useState(initialData?.productId || '');
  const [sellerType, setSellerType] = useState(initialData?.sellerType || '');
  const [subCategory, setSubCategory] = useState(initialData?.subCategory || '');
  const [subCategoryName, setSubCategoryName] = useState(initialData?.subCategoryName || '');
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [model, setModel] = useState(initialData?.model || '');
  const [colors, setColors] = useState<string[]>(initialData?.color || []);
  const [sizes, setSizes] = useState<string[]>(initialData?.size || []);
  const [weight, setWeight] = useState(initialData?.weight || '');
  const [condition, setCondition] = useState(initialData?.condition || '');
  const [dimensions, setDimensions] = useState(initialData?.dimensions || '');
  const [materials, setMaterials] = useState<string[]>(initialData?.material || []);
  const [quantity, setQuantity] = useState<string>(initialData?.quantity.toString() || '1');
  const [contactName, setContactName] = useState(initialData?.contactName || '');
  const [contact, setContact] = useState(initialData?.contact || '');
  const [locationName, setLocationName] = useState(initialData?.locationName || '');
  const [delivery, setDelivery] = useState(initialData?.delivery ?? false);
  const [paymentOption, setPaymentOption] = useState(initialData?.paymentOption || '');
  const [negotiable, setNegotiable] = useState(initialData?.negotiable ?? false);
  const [financingAvailable, setFinancingAvailable] = useState(initialData?.financingAvailable ?? false);
  const [tradeIn, setTradeIn] = useState(initialData?.tradeIn ?? false);
  const [features, setFeatures] = useState<string[]>(initialData?.features || []);
  const [amenities, setAmenities] = useState<string[]>(initialData?.amenities || []);


  // Vehicle Specific
  const [make, setMake] = useState(initialData?.make || '');
  const [trim, setTrim] = useState(initialData?.trim || '');
  const [vehicleType, setVehicleType] = useState(initialData?.type || ''); // Renamed to avoid conflict with JS 'type'
  const [mileage, setMileage] = useState(initialData?.mileage || '');
  const [engineType, setEngineType] = useState(initialData?.engineType || '');
  const [engineSize, setEngineSize] = useState<string>(initialData?.engineSize?.toString() || '');
  const [horsepower, setHorsepower] = useState<string>(initialData?.horsepower?.toString() || '');
  const [torque, setTorque] = useState<string>(initialData?.torque?.toString() || '');
  const [fuelType, setFuelType] = useState(initialData?.fuelType || '');
  const [fuelEconomy, setFuelEconomy] = useState(initialData?.fuelEconomy || '');
  const [transmission, setTransmission] = useState(initialData?.transmission || '');
  const [drivetrain, setDrivetrain] = useState(initialData?.drivetrain || '');
  const [vin, setVin] = useState(initialData?.vin || '');
  const [logbookStatus, setLogbookStatus] = useState(initialData?.logbookStatus || '');
  const [serviceHistory, setServiceHistory] = useState(initialData?.serviceHistory || '');
  const [previousOwners, setPreviousOwners] = useState<string>(initialData?.previousOwners?.toString() || '');
  const [tireCondition, setTireCondition] = useState(initialData?.tireCondition || '');
  const [accidentalHistory, setAccidentalHistory] = useState(initialData?.accidentalHistory ?? false);

  // Property Specific
  const [bedrooms, setBedrooms] = useState<string>(initialData?.bedrooms?.toString() || '');
  const [studios, setStudios] = useState<string>(initialData?.studios?.toString() || '');
  const [bathrooms, setBathrooms] = useState<string>(initialData?.bathrooms?.toString() || '');
  const [area, setArea] = useState(initialData?.area || '');
  const [expirationDate, setExpirationDate] = useState(initialData?.expirationDate || '');

  // Digital Product Specific
  const [digitalUrl, setDigitalUrl] = useState(initialData?.digitalUrl || '');
  const [autoDeliver, setAutoDeliver] = useState(initialData?.autoDeliver ?? false);


  // --- Multi-step Form Logic ---
  const [currentStep, setCurrentStep] = useState(0);
  const formSteps = [
    { title: "Basic Details", icon: <InformationCircleIcon className="w-6 h-6"  /> },
    { title: "Pricing & Availability", icon: <CurrencyDollarIcon className="w-6 h-6" /> },
    { title: "Media & Description", icon: <PhotoIcon className="w-6 h-6" /> },
    { title: "Contact & Location", icon: <MapPinIcon  className="w-6 h-6" /> },
    { title: "Specifics", icon: <ArchiveBoxArrowDownIcon  className="w-6 h-6" /> }, // This step will be dynamic
    { title: "Review & Submit", icon: <CheckCircleIcon className="w-6 h-6"/> },
  ];

  // Determine the field group based on selected category
  const selectedCategory = useMemo(() => {
    return categories.find(cat => cat.id === productCategoryId);
  }, [productCategoryId, categories]);

  // --- Price Calculation ---
  const calculateFinalPrice = (sPrice: number, disc: number) => {
    return sPrice * (1 - disc / 100);
  };

  const currentFinalPrice = useMemo(() => {
    const sP = parseFloat(sellingPrice);
    const d = parseFloat(discount);
    if (isNaN(sP) || sP <= 0) return 'N/A';
    if (isNaN(d) || d < 0 || d > 100) return 'N/A';
    return calculateFinalPrice(sP, d).toFixed(2);
  }, [sellingPrice, discount]);

  // --- Form Validation ---
  const validateStep = (step: number) => {
    const errors: { [key: string]: string | null } = {};
    let isValid = true;

    if (step === 0) { // Basic Details
      if (!name.trim()) {
        errors.name = 'Listing name is required.';
        isValid = false;
      }
      if (!productCategoryId) {
        errors.productCategoryId = 'Category is required.';
        isValid = false;
      }
    } else if (step === 1) { // Pricing & Availability
      const sp = parseFloat(sellingPrice);
      if (isNaN(sp) || sp <= 0) {
        errors.sellingPrice = 'Selling price must be a positive number.';
        isValid = false;
      }
      const bp = parseFloat(buyingPrice);
      if (isNaN(bp) || bp <= 0) {
        errors.buyingPrice = 'Buying price must be a positive number.';
        isValid = false;
      }
      const disc = parseFloat(discount);
      if (isNaN(disc) || disc < 0 || disc > 100) {
        errors.discount = 'Discount must be between 0 and 100.';
        isValid = false;
      }
    } else if (step === 3) { // Contact & Location
      if (!contactName.trim()) {
        errors.contactName = 'Contact name is required.';
        isValid = false;
      }
      if (!contact.trim()) {
        errors.contact = 'Contact information is required.';
        isValid = false;
      }
      if (!locationName.trim()) {
        errors.locationName = 'Location is required.';
        isValid = false;
      }
    }
    // Add more validation for other steps and conditional fields here

    setFormErrors(errors);
    return isValid;
  };

  // --- Navigation Handlers ---
  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, formSteps.length - 1));
    } else {
      toast.error('Please fill in all required fields for this step.');
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Final validation for all steps before submission
    if (!validateStep(currentStep) || !validateStep(0) || !validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) { // Ensure all steps are validated
      toast.error('Please correct all errors before submitting.');
      return;
    }

    const finalPrice = calculateFinalPrice(parseFloat(sellingPrice), parseFloat(discount));

    onSubmit({
      // Basic Details
      name,
      description: description || null,
      productCategoryId,
      images: imageUrl ? [imageUrl] : [],
      video: null, // Not implemented in UI for brevity
      tags: [], // Not implemented in UI for brevity

      // Pricing & Availability
      buyingPrice: parseFloat(buyingPrice),
      sellingPrice: parseFloat(sellingPrice),
      finalPrice: finalPrice,
      discount: parseFloat(discount),
      isAvailable,
      isOnOffer,
      isFlashDeal: false, // Default
      isNewArrival: false, // Default
      isDiscounted: parseFloat(discount) > 0,
      isFeatured: false, // Default
      ingredients: ingredients || null, // General purpose

      // General Listing Details
      productId: productId || 'auto-generated', // Placeholder
      sellerType: sellerType || 'Individual', // Placeholder
      subCategory: subCategory || undefined,
      subCategoryName: subCategoryName || '',
      brand: brand || null,
      model: model || '',
      color: colors,
      size: sizes,
      weight: weight || '',
      condition: condition || '',
      dimensions: dimensions || '',
      material: materials,
      quantity: parseInt(quantity) || 1,
      profitMargin: 0, // Not implemented in UI
      pricingTiers: [], // Not implemented in UI
      startDealDate: null, // Not implemented in UI
      endDealDate: null, // Not implemented in UI

      // Transaction & Logistics
      delivery,
      paymentOption: paymentOption || '',
      showOnGhuba: false, // Default

      // Contact & Location
      contactName,
      contact,
      locationName,
      location: undefined, // Not implemented in UI for brevity
      latitude: null, // Not implemented in UI for brevity
      longitude: null, // Not implemented in UI for brevity
      option: [], // Not implemented in UI
      amenities: amenities,

      // Vehicle Specific (only include if category matches)
      make: selectedCategory?.fieldTypeGroup === 'vehicle' ? make : '',
      trim: selectedCategory?.fieldTypeGroup === 'vehicle' ? trim : '',
      type: selectedCategory?.fieldTypeGroup === 'vehicle' ? vehicleType : '',
      mileage: selectedCategory?.fieldTypeGroup === 'vehicle' ? mileage : '',
      engineType: selectedCategory?.fieldTypeGroup === 'vehicle' ? engineType : '',
      engineSize: selectedCategory?.fieldTypeGroup === 'vehicle' && engineSize ? parseFloat(engineSize) : null,
      horsepower: selectedCategory?.fieldTypeGroup === 'vehicle' && horsepower ? parseFloat(horsepower) : null,
      torque: selectedCategory?.fieldTypeGroup === 'vehicle' && torque ? parseFloat(torque) : null,
      fuelType: selectedCategory?.fieldTypeGroup === 'vehicle' ? fuelType : '',
      fuelEconomy: selectedCategory?.fieldTypeGroup === 'vehicle' ? fuelEconomy : '',
      transmission: selectedCategory?.fieldTypeGroup === 'vehicle' ? transmission : '',
      drivetrain: selectedCategory?.fieldTypeGroup === 'vehicle' ? drivetrain : '',
      vin: selectedCategory?.fieldTypeGroup === 'vehicle' ? vin : '',
      logbookStatus: selectedCategory?.fieldTypeGroup === 'vehicle' ? logbookStatus : '',
      serviceHistory: selectedCategory?.fieldTypeGroup === 'vehicle' ? serviceHistory : '',
      negotiable: selectedCategory?.fieldTypeGroup === 'vehicle' ? negotiable : false,
      financingAvailable: selectedCategory?.fieldTypeGroup === 'vehicle' ? financingAvailable : false,
      tradeIn: selectedCategory?.fieldTypeGroup === 'vehicle' ? tradeIn : false,
      features: selectedCategory?.fieldTypeGroup === 'vehicle' ? features : [],
      previousOwners: selectedCategory?.fieldTypeGroup === 'vehicle' && previousOwners ? parseInt(previousOwners) : null,
      tireCondition: selectedCategory?.fieldTypeGroup === 'vehicle' ? tireCondition : '',
      accidentalHistory: selectedCategory?.fieldTypeGroup === 'vehicle' ? accidentalHistory : false,

      // Property Specific (only include if category matches)
      bedrooms: selectedCategory?.fieldTypeGroup === 'property' && bedrooms ? parseInt(bedrooms) : null,
      studios: selectedCategory?.fieldTypeGroup === 'property' && studios ? parseInt(studios) : null,
      bathrooms: selectedCategory?.fieldTypeGroup === 'property' && bathrooms ? parseInt(bathrooms) : null,
      area: selectedCategory?.fieldTypeGroup === 'property' ? area : '',
      expirationDate: selectedCategory?.fieldTypeGroup === 'property' ? expirationDate : null, // Assuming expiration for property listings

      // Digital Product Specific (only include if category matches)
      digitalUrl: selectedCategory?.fieldTypeGroup === 'digital' ? digitalUrl : '',
      autoDeliver: selectedCategory?.fieldTypeGroup === 'digital' ? autoDeliver : false,

      // Book Specific (only include if category matches)
      author: selectedCategory?.fieldTypeGroup === 'book' ? initialData?.author || '' : '',
      publisher: selectedCategory?.fieldTypeGroup === 'book' ? initialData?.publisher || '' : '',
      isbn: selectedCategory?.fieldTypeGroup === 'book' ? initialData?.isbn || '' : '',

      // Clothing Specific (only include if category matches)
      fabricComposition: selectedCategory?.fieldTypeGroup === 'clothing' ? initialData?.fabricComposition || '' : '',
      careInstructions: selectedCategory?.fieldTypeGroup === 'clothing' ? initialData?.careInstructions || '' : '',

      // Appliance Specific (only include if category matches)
      energyRating: selectedCategory?.fieldTypeGroup === 'appliance' ? initialData?.energyRating || '' : '',
      warrantyPeriod: selectedCategory?.fieldTypeGroup === 'appliance' ? initialData?.warrantyPeriod || '' : '',
      usageInstructions: selectedCategory?.fieldTypeGroup === 'appliance' ? initialData?.usageInstructions || '' : '',

      // Service Specific (only include if category matches)
      serviceSchedule: selectedCategory?.fieldTypeGroup === 'service' ? initialData?.serviceSchedule || '' : '',
      availabilityStart: selectedCategory?.fieldTypeGroup === 'service' ? initialData?.availabilityStart || null : null,
      availabilityEnd: selectedCategory?.fieldTypeGroup === 'service' ? initialData?.availabilityEnd || null : null,

      // Admin/Platform Specific (defaults)
      status: initialData?.status || 'Pending',
      commissionType: initialData?.commissionType || 'Percentage',
      commissionRate: initialData?.commissionRate || 0,
      commissionStartDate: initialData?.commissionStartDate || null,
      commissionEndDate: initialData?.commissionEndDate || null,
    });
  };

  // --- Conditional Field Rendering ---
  const renderSpecificFields = () => {
    if (!selectedCategory) return <p className="text-gray-400 text-center py-4">Select a category to see specific fields.</p>;

    switch (selectedCategory.fieldTypeGroup) {
      case 'vehicle':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h3 className="col-span-full text-xl font-semibold text-rose-300 mb-4 flex items-center"><VideoCameraSlashIcon className="mr-2 h-6 w-6" /> Vehicle Details</h3>
            <div>
              <label htmlFor="make" className="block text-sm font-medium text-gray-300">Make</label>
              <input type="text" id="make" value={make} onChange={(e) => setMake(e.target.value)} className="form-input" />
            </div>
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-300">Model</label>
              <input type="text" id="model" value={model} onChange={(e) => setModel(e.target.value)} className="form-input" />
            </div>
            <div>
              <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-300">Type</label>
              <input type="text" id="vehicleType" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="form-input" />
            </div>
            <div>
              <label htmlFor="mileage" className="block text-sm font-medium text-gray-300">Mileage</label>
              <input type="text" id="mileage" value={mileage} onChange={(e) => setMileage(e.target.value)} className="form-input" />
            </div>
            <div>
              <label htmlFor="engineType" className="block text-sm font-medium text-gray-300">Engine Type</label>
              <input type="text" id="engineType" value={engineType} onChange={(e) => setEngineType(e.target.value)} className="form-input" />
            </div>
            <div>
              <label htmlFor="fuelType" className="block text-sm font-medium text-gray-300">Fuel Type</label>
              <input type="text" id="fuelType" value={fuelType} onChange={(e) => setFuelType(e.target.value)} className="form-input" />
            </div>
            <div className="col-span-full flex items-center space-x-4 mt-2">
              <label className="flex items-center text-sm font-medium text-gray-300 cursor-pointer">
                <input type="checkbox" checked={negotiable} onChange={(e) => setNegotiable(e.target.checked)} className="form-checkbox" />
                <span className="ml-2">Price Negotiable</span>
              </label>
              <label className="flex items-center text-sm font-medium text-gray-300 cursor-pointer">
                <input type="checkbox" checked={financingAvailable} onChange={(e) => setFinancingAvailable(e.target.checked)} className="form-checkbox" />
                <span className="ml-2">Financing Available</span>
              </label>
            </div>
          </div>
        );
      case 'property':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h3 className="col-span-full text-xl font-semibold text-rose-300 mb-4 flex items-center"><HomeIcon className="mr-2 w-6 h-6" /> Property Details</h3>
            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-300">Bedrooms</label>
              <input type="number" id="bedrooms" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className="form-input" />
            </div>
            <div>
              <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-300">Bathrooms</label>
              <input type="number" id="bathrooms" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className="form-input" />
            </div>
            <div>
              <label htmlFor="area" className="block text-sm font-medium text-gray-300">Area (e.g., "1200 sqft")</label>
              <input type="text" id="area" value={area} onChange={(e) => setArea(e.target.value)} className="form-input" />
            </div>
            <div>
              <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-300">Listing Expiration Date</label>
              <input type="date" id="expirationDate" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} className="form-input" />
            </div>
            <div>
              <label htmlFor="amenities" className="block text-sm font-medium text-gray-300">Amenities (comma-separated)</label>
              <input type="text" id="amenities" value={amenities.join(', ')} onChange={(e) => setAmenities(e.target.value.split(',').map(s => s.trim()))} className="form-input" />
            </div>
          </div>
        );
      case 'book':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h3 className="col-span-full text-xl font-semibold text-rose-300 mb-4 flex items-center"><BookOpenIcon className="mr-2 w-6 h-6" /> Book Details</h3>
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-300">Author</label>
              <input type="text" id="author" value={initialData?.author || ''} onChange={() => {}} className="form-input" readOnly />
            </div>
            <div>
              <label htmlFor="publisher" className="block text-sm font-medium text-gray-300">Publisher</label>
              <input type="text" id="publisher" value={initialData?.publisher || ''} onChange={() => {}} className="form-input" readOnly />
            </div>
            <div>
              <label htmlFor="isbn" className="block text-sm font-medium text-gray-300">ISBN</label>
              <input type="text" id="isbn" value={initialData?.isbn || ''} onChange={() => {}} className="form-input" readOnly />
            </div>
          </div>
        );
      case 'dish': // Re-using ingredients for dish
      case 'general': // Default for general products
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h3 className="col-span-full text-xl font-semibold text-rose-300 mb-4 flex items-center"><ArchiveBoxIcon className="mr-2 w-6 h-6" /> General Product Details</h3>
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-300">Brand</label>
              <input type="text" id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} className="form-input" />
            </div>
            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-300">Condition</label>
              <select id="condition" value={condition} onChange={(e) => setCondition(e.target.value)} className="form-input">
                <option value="">Select condition</option>
                <option value="New">New</option>
                <option value="Used">Used</option>
                <option value="Refurbished">Refurbished</option>
              </select>
            </div>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-300">Quantity</label>
              <input type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" className="form-input" />
            </div>
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-300">Weight (e.g., "500g", "2kg")</label>
              <input type="text" id="weight" value={weight} onChange={(e) => setWeight(e.target.value)} className="form-input" />
            </div>
            <div>
              <label htmlFor="dimensions" className="block text-sm font-medium text-gray-300">Dimensions (e.g., "10x5x2 cm")</label>
              <input type="text" id="dimensions" value={dimensions} onChange={(e) => setDimensions(e.target.value)} className="form-input" />
            </div>
            <div>
              <label htmlFor="colors" className="block text-sm font-medium text-gray-300">Colors (comma-separated)</label>
              <input type="text" id="colors" value={colors.join(', ')} onChange={(e) => setColors(e.target.value.split(',').map(s => s.trim()))} className="form-input" />
            </div>
            <div>
              <label htmlFor="sizes" className="block text-sm font-medium text-gray-300">Sizes (comma-separated)</label>
              <input type="text" id="sizes" value={sizes.join(', ')} onChange={(e) => setSizes(e.target.value.split(',').map(s => s.trim()))} className="form-input" />
            </div>
            <div>
              <label htmlFor="materials" className="block text-sm font-medium text-gray-300">Materials (comma-separated)</label>
              <input type="text" id="materials" value={materials.join(', ')} onChange={(e) => setMaterials(e.target.value.split(',').map(s => s.trim()))} className="form-input" />
            </div>
            {selectedCategory.fieldTypeGroup === 'dish' && (
              <div className="col-span-full">
                <label htmlFor="ingredients" className="block text-sm font-medium text-gray-300">Ingredients (comma-separated)</label>
                <input
                  type="text"
                  id="ingredients"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  className="form-input"
                />
              </div>
            )}
          </div>
        );
      default:
        return <p className="text-gray-400 text-center py-4">No specific fields for this category type yet.</p>;
    }
  };


  // --- Form Sections ---
  const renderFormStep = () => {
    switch (currentStep) {
      case 0: // Basic Details
        return (
          <div className="space-y-5">
            <h3 className="text-2xl font-bold text-rose-400 mb-4 flex items-center"><InformationCircleIcon className="mr-3 w-6 h-6" /> Basic Listing Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">Listing Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setFormErrors(prev => ({ ...prev, name: null })); }}
                  className={`form-input ${formErrors.name ? 'border-red-500' : ''}`}
                  required
                />
                {formErrors.name && <p className="text-red-400 text-xs mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label htmlFor="productCategoryId" className="block text-sm font-medium text-gray-300">Category <span className="text-red-500">*</span></label>
                <select
                  id="productCategoryId"
                  value={productCategoryId}
                  onChange={(e) => { setProductCategoryId(e.target.value); setFormErrors(prev => ({ ...prev, productCategoryId: null })); }}
                  className={`form-input ${formErrors.productCategoryId ? 'border-red-500' : ''}`}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.categoryId}>{cat.displayName}</option>
                  ))}
                </select>
                {formErrors.productCategoryId && <p className="text-red-400 text-xs mt-1">{formErrors.productCategoryId}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="form-input"
                placeholder="Provide a detailed description of your listing..."
              ></textarea>
            </div>
          </div>
        );
      case 1: // Pricing & Availability
        return (
          <div className="space-y-5">
            <h3 className="text-2xl font-bold text-rose-400 mb-4 flex items-center"><CurrencyDollarIcon className="mr-3 w-6 h-6" /> Pricing & Availability</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="buyingPrice" className="block text-sm font-medium text-gray-300">Buying Price ($) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  id="buyingPrice"
                  value={buyingPrice}
                  onChange={(e) => { setBuyingPrice(e.target.value); setFormErrors(prev => ({ ...prev, buyingPrice: null })); }}
                  step="0.01"
                  className={`form-input ${formErrors.buyingPrice ? 'border-red-500' : ''}`}
                  required
                />
                {formErrors.buyingPrice && <p className="text-red-400 text-xs mt-1">{formErrors.buyingPrice}</p>}
              </div>
              <div>
                <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-300">Selling Price ($) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  id="sellingPrice"
                  value={sellingPrice}
                  onChange={(e) => { setSellingPrice(e.target.value); setFormErrors(prev => ({ ...prev, sellingPrice: null })); }}
                  step="0.01"
                  className={`form-input ${formErrors.sellingPrice ? 'border-red-500' : ''}`}
                  required
                />
                {formErrors.sellingPrice && <p className="text-red-400 text-xs mt-1">{formErrors.sellingPrice}</p>}
              </div>
              <div>
                <label htmlFor="discount" className="block text-sm font-medium text-gray-300">Discount (%)</label>
                <input
                  type="number"
                  id="discount"
                  value={discount}
                  onChange={(e) => { setDiscount(e.target.value); setFormErrors(prev => ({ ...prev, discount: null })); }}
                  min="0"
                  max="100"
                  className={`form-input ${formErrors.discount ? 'border-red-500' : ''}`}
                />
                {formErrors.discount && <p className="text-red-400 text-xs mt-1">{formErrors.discount}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between bg-gray-700 p-4 rounded-lg border border-gray-600 shadow-inner">
              <span className="text-lg font-semibold text-gray-200 flex items-center"><WalletIcon className="mr-2 text-green-400 w-6 h-6"/> Final Price:</span>
              <span className="text-3xl font-bold text-green-400">${currentFinalPrice}</span>
            </div>

            <div className="flex items-center space-x-6 pt-2">
              <label className="flex items-center text-sm font-medium text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="form-checkbox"
                />
                <span className="ml-2">Available for Purchase</span>
              </label>
              <label className="flex items-center text-sm font-medium text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOnOffer}
                  onChange={(e) => setIsOnOffer(e.target.checked)}
                  className="form-checkbox"
                />
                <span className="ml-2">Mark as On Offer</span>
              </label>
            </div>
          </div>
        );
      case 2: // Media & Description
        return (
          <div className="space-y-5">
            <h3 className="text-2xl font-bold text-rose-400 mb-4 flex items-center"><PhotoIcon className="mr-3 w-6 h-6" /> Media & Additional Info</h3>
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300">Primary Image URL</label>
              <input
                type="url"
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="form-input"
                placeholder="e.g., [https://example.com/your-product.jpg](https://example.com/your-product.jpg)"
              />
              {imageUrl && (
                <div className="mt-4 w-48 h-32 relative rounded-lg overflow-hidden border border-gray-600 shadow-md">
                  <Image
                    src={imageUrl}
                    alt="Image Preview"
                    fill
                    className="object-cover"
                    loader={loader}
                    onError={(e) => { e.currentTarget.src = "[https://placehold.co/192x128/555/eee?text=Invalid+URL](https://placehold.co/192x128/555/eee?text=Invalid+URL)"; }}
                  />
                </div>
              )}
            </div>
            {/* Future: Add more image inputs, video URL, tags */}
          </div>
        );
      case 3: // Contact & Location
        return (
          <div className="space-y-5">
            <h3 className="text-2xl font-bold text-rose-400 mb-4 flex items-center"><MapPinIcon className="mr-3 w-6 h-6" /> Contact & Location</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contactName" className="block text-sm font-medium text-gray-300">Contact Person Name <span className="text-red-500">*</span></label>
                <input type="text" id="contactName" value={contactName} onChange={(e) => { setContactName(e.target.value); setFormErrors(prev => ({ ...prev, contactName: null })); }} className={`form-input ${formErrors.contactName ? 'border-red-500' : ''}`} required />
                {formErrors.contactName && <p className="text-red-400 text-xs mt-1">{formErrors.contactName}</p>}
              </div>
              <div>
                <label htmlFor="contact" className="block text-sm font-medium text-gray-300">Contact Info (Phone/Email) <span className="text-red-500">*</span></label>
                <input type="text" id="contact" value={contact} onChange={(e) => { setContact(e.target.value); setFormErrors(prev => ({ ...prev, contact: null })); }} className={`form-input ${formErrors.contact ? 'border-red-500' : ''}`} required />
                {formErrors.contact && <p className="text-red-400 text-xs mt-1">{formErrors.contact}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="locationName" className="block text-sm font-medium text-gray-300">Location Name (e.g., "Nairobi CBD") <span className="text-red-500">*</span></label>
              <input type="text" id="locationName" value={locationName} onChange={(e) => { setLocationName(e.target.value); setFormErrors(prev => ({ ...prev, locationName: null })); }} className={`form-input ${formErrors.locationName ? 'border-red-500' : ''}`} required />
              {formErrors.locationName && <p className="text-red-400 text-xs mt-1">{formErrors.locationName}</p>}
            </div>
            <label className="flex items-center text-sm font-medium text-gray-300 cursor-pointer pt-2">
              <input type="checkbox" checked={delivery} onChange={(e) => setDelivery(e.target.checked)} className="form-checkbox" />
              <span className="ml-2">Offer Delivery</span>
            </label>
            <div>
              <label htmlFor="paymentOption" className="block text-sm font-medium text-gray-300">Preferred Payment Option</label>
              <input type="text" id="paymentOption" value={paymentOption} onChange={(e) => setPaymentOption(e.target.value)} className="form-input" placeholder="e.g., M-Pesa, Bank Transfer, Cash" />
            </div>
          </div>
        );
      case 4: // Specifics (Dynamically rendered)
        return (
          <div className="space-y-5">
            <h3 className="text-2xl font-bold text-rose-400 mb-4 flex items-center"><ArchiveBoxArrowDownIcon className="mr-3 w-6 h-6" /> Listing Specifics</h3>
            {renderSpecificFields()}
          </div>
        );
      case 5: // Review & Submit
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-rose-400 mb-4 flex items-center"><CheckCircleIcon className="mr-3 w-6 h-6" /> Review Your Listing</h3>
            <div className="bg-gray-700 p-6 rounded-lg shadow-inner border border-gray-600">
              <h4 className="text-xl font-semibold text-gray-100 mb-3">{name}</h4>
              <p className="text-gray-300 mb-2">Category: <span className="font-medium text-rose-300">{selectedCategory?.name || 'N/A'}</span></p>
              <p className="text-gray-300 mb-2">Description: <span className="text-gray-400">{description || 'No description provided.'}</span></p>
              <p className="text-gray-300 mb-2">Selling Price: <span className="font-medium text-green-400">${parseFloat(sellingPrice).toFixed(2)}</span></p>
              <p className="text-gray-300 mb-2">Discount: <span className="font-medium text-yellow-400">{discount}%</span></p>
              <p className="text-gray-300 mb-2 text-lg font-bold">Final Price: <span className="text-green-300">${currentFinalPrice}</span></p>
              <p className="text-gray-300 mb-2">Availability: {isAvailable ? <span className="text-green-400">Available</span> : <span className="text-red-400">Unavailable</span>}</p>
              <p className="text-gray-300 mb-2">On Offer: {isOnOffer ? <span className="text-yellow-400">Yes</span> : <span className="text-gray-400">No</span>}</p>
              {imageUrl && (
                <div className="mt-4">
                  <p className="text-gray-300 mb-2">Image Preview:</p>
                  <div className="w-48 h-32 relative rounded-lg overflow-hidden border border-gray-600 shadow-md">
                    <Image
                      src={imageUrl}
                      alt="Listing Image"
                      fill
                      className="object-cover"
                      loader={loader}
                      onError={(e) => { e.currentTarget.src = "[https://placehold.co/192x128/555/eee?text=Image+Error](https://placehold.co/192x128/555/eee?text=Image+Error)"; }}
                    />
                  </div>
                </div>
              )}
              {/* Add more review details as needed */}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // --- Common Input Styling ---
  // This class will be applied to all standard input fields
  const formInputClass = "mt-1 block w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-rose-500 focus:border-rose-500 transition-colors placeholder-gray-500";
  // Apply this to form-checkbox for consistent styling
  const formCheckboxClass = "form-checkbox h-5 w-5 text-rose-500 rounded border-gray-600 bg-gray-700 focus:ring-rose-500";

  useEffect(() => {
    // Inject custom CSS for form inputs and checkboxes
    const style = document.createElement('style');
    style.innerHTML = `
      .form-input {
        ${formInputClass.replace(/ /g, ';')}
      }
      .form-checkbox {
        ${formCheckboxClass.replace(/ /g, ';')}
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Indicator / Step Navigation */}
      <div className="flex justify-between items-center mb-8 p-3 bg-gray-800 rounded-full shadow-inner border border-gray-700">
        {formSteps.map((step, index) => (
          <div
            key={index}
            className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${
              index === currentStep ? 'text-rose-400 font-bold' : 'text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => setCurrentStep(index)}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
              index <= currentStep ? 'bg-rose-600 text-white' : 'bg-gray-700 text-gray-400'
            } transition-all duration-300 shadow-md`}>
              {step.icon}
            </div>
            <span className="text-xs sm:text-sm text-center">{step.title}</span>
          </div>
        ))}
      </div>

      {/* Form Content for Current Step */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700 animate-fade-in">
        {renderFormStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between space-x-3 mt-8">
        {currentStep > 0 && (
          <button
            type="button"
            onClick={goToPreviousStep}
            className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition font-semibold flex items-center transform hover:scale-105"
            disabled={isLoading}
          >
            <ChevronLeftIcon className="mr-2 w-6 h-6" /> Previous
          </button>
        )}
        <div className="flex-grow"></div> {/* Spacer */}
        {currentStep < formSteps.length - 1 ? (
          <button
            type="button"
            onClick={goToNextStep}
            className="px-6 py-3 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition disabled:opacity-50 font-semibold flex items-center transform hover:scale-105"
            disabled={isLoading}
          >
            Next <ChevronRightIcon className="ml-2 w-6 h-6" />
          </button>
        ) : (
          <button
            type="submit"
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50 font-semibold flex items-center transform hover:scale-105"
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Listing'} <CheckCircleIcon className="ml-2 w-6 h-6" />
          </button>
        )}
      </div>
    </form>
  );
};

export default MarketLForm;
