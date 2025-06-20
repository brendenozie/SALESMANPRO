import React, { useState, useMemo } from "react";
import Modal from "./Modal";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

import CategoryPicker from "./CategoryPicker";
import Stepper from "./Stepper";
import ProductDetails from "./ProductDetails";
import GeneralDetails from "./GeneralDetails";
import EnginePerformance from "./EnginePerformance";
import OwnershipPricing from "./OwnershipPricing";
import PricingDetails from "./PricingDetails";
import ImageUploader from "./ImageUploader";
import ProductVariants from "./ProductVariants";
import ProductAvailability from "./ProductAvailability";
import FinalReview from "./FinalReview";
import ContactLocation from "./ContactLocation";
import AmenitiesStep from "./AmenitiesStep";
import VehicleAmenitiesStep from "./VehicleAmenitiesStep";

// -------------------
// MAPPINGS
// -------------------

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const FORM_COMPONENTS: Record<number, React.FC<any>> = {
  1: CategoryPicker,
  2: ProductDetails,
  3: GeneralDetails,
  4: EnginePerformance,
  5: OwnershipPricing,
  7: PricingDetails,
  8: ImageUploader,
  9: ProductVariants,
  10: ProductAvailability,
  11: FinalReview,
  12: ContactLocation,
  13: AmenitiesStep,
  14: VehicleAmenitiesStep,
};

const STEP_LABELS: Record<number, string> = {
  1: "Category",
  2: "Details",
  3: "General Info",
  4: "Engine Specs",
  5: "Ownership Pricing",
  7: "Pricing",
  8: "Images",
  9: "Variants",
  10: "Availability",
  11: "Review",
  12: "Location / Contact",
  13: "Property Amenities",
  14: "Vehicle Amenities",
};

// ------------------- 
// CATEGORY_STEPS  
// (Already includes all categories and subcategories.)
// -------------------
const CATEGORY_STEPS: Record<string, number[]> = {
  // — Standard “store” items —
  "Electronics":         [1,2,7,8,9,10,12,11],
  "Clothing":            [1,2,7,8,9,10,12,11],
  "Fashion":             [1,2,7,8,9,10,12,11],
  "Smartphones":         [1,2,7,8,9,10,12,11],
  "Laptops":             [1,2,7,8,9,10,12,11],
  "Tablets":             [1,2,7,8,9,10,12,11],
  "Wearables":           [1,2,7,8,9,10,12,11],
  "Home Appliances":     [1,2,7,8,9,10,12,11],
  "Cameras":             [1,2,7,8,9,10,12,11],
  "Gaming Consoles":     [1,2,7,8,9,10,12,11],
  "Televisions":         [1,2,7,8,9,10,12,11],
  "Audio Systems":       [1,2,7,8,9,10,12,11],
  "Music":               [1,2,7,8,9,10,12,11],
  "Books":               [1,2,7,8,9,10,12,11],
  "Stationery":          [1,2,7,8,9,10,12,11],
  "Shoes":               [1,2,7,8,9,10,12,11],
  "Watches":             [1,2,7,8,9,10,12,11],
  "Jewelry":             [1,2,7,8,9,10,12,11],
  "Beauty Products":     [1,2,7,8,9,10,12,11],
  "Skincare":            [1,2,7,8,9,10,12,11],
  "Haircare":            [1,2,7,8,9,10,12,11],
  "Toys":                [1,2,7,8,9,10,12,11],
  "Baby Toys":           [1,2,7,8,9,10,12,11],
  "Sports Equipment":    [1,2,7,8,9,10,12,11],
  "Fitness Gear":        [1,2,7,8,9,10,12,11],
  "Outdoor Gear":        [1,2,7,8,9,10,12,11],
  "Bicycles":            [1,2,7,8,9,10,12,11],
  "Musical Instruments": [1,2,7,8,9,10,12,11],
  "Furniture":           [1,2,7,8,9,10,12,11],
  "Decor":               [1,2,7,8,9,10,12,11],
  "Kitchenware":         [1,2,7,8,9,10,12,11],
  "Dining":              [1,2,7,8,9,10,12,11],
  "Bedding":             [1,2,7,8,9,10,12,11],
  "Pet Supplies":        [1,2,7,8,9,10,12,11],
  "Pets":                [1,2,7,8,9,10,12,11],
  "Lighting":            [1,2,7,8,9,10,12,11],
  "Gardening":           [1,2,7,8,9,10,12,11],
  "Home & Garden":       [1,2,7,8,9,10,12,11],
  "Office Supplies":     [1,2,7,8,9,10,12,11],
  "Art Supplies":        [1,2,7,8,9,10,12,11],
  "Health Products":     [1,2,7,8,9,10,12,11],
  "Health & Beauty":     [1,2,7,8,9,10,12,11],
  "Supplements":         [1,2,7,8,9,10,12,11],
  "Baby Products":       [1,2,7,8,9,10,12,11],
  "Maternity":           [1,2,7,8,9,10,12,11],
  "Groceries":           [1,2,7,8,9,10,12,11],
  "Snacks":              [1,2,7,8,9,10,12,11],
  "Beverages":           [1,2,7,8,9,10,12,11],
  "Alcohol":             [1,2,7,8,9,10,12,11],
  "Gourmet Foods":       [1,2,7,8,9,10,12,11],
  "Cleaning Supplies":   [1,2,7,8,9,10,12,11],
  "Safety Equipment":    [1,2,7,8,9,10,12,11],
  "Party Supplies":      [1,2,7,8,9,10,12,11],
  "Gifts":               [1,2,7,8,9,10,12,11],
  "Travel Gear":         [1,2,7,8,9,10,12,11],

  // — Property listings flow —
  "Real Estate":         [1,3,7,8,10,12,13,11],
  "Property":            [1,3,7,8,10,12,13,11],
  "Houses":              [1,3,7,8,10,12,13,11],
  "Land":                [1,3,7,8,10,12,13,11],
  "Commercial":          [1,3,7,8,10,12,13,11],
  "Apartments":          [1,3,7,8,10,12,13,11],
  "Vacation Rentals":    [1,3,7,8,10,12,13,11],
  "Warehouses":          [1,3,7,8,10,12,13,11],
  "Gated Communities":   [1,3,7,8,10,12,13,11],
  "Offices":             [1,3,7,8,10,12,13,11],
  "Serviced Apartments": [1,3,7,8,10,12,13,11],
  "Hostels":             [1,3,7,8,10,12,13,11],
  "Shared Housing":      [1,3,7,8,10,12,13,11],
  "Shops":               [1,3,7,8,10,12,13,11],
  "Farms":               [1,3,7,8,10,12,13,11],
  "Hotels":              [1,3,7,8,10,12,13,11],
  "Event Spaces":        [1,3,7,8,10,12,13,11],

  // — Automotive & tools flow —
  "Automotive":          [1,3,4,5,7,8,10,12,14,11],
  "Cars":                [1,3,4,5,7,8,10,12,14,11],
  "Car Accessories":     [1,3,4,5,7,8,10,12,14,11],
  "Tools":               [1,3,4,5,7,8,10,12,14,11],
  "Hardware":            [1,3,4,5,7,8,10,12,14,11],

  // — Services flow —
  "Services":            [1,2,7,8,9,10,12,11],
  "Cleaning":            [1,2,7,8,9,10,12,11],
  "Plumbing":            [1,2,7,8,9,10,12,11],
  "Electrical":          [1,2,7,8,9,10,12,11],
  "Landscaping":         [1,2,7,8,9,10,12,11],
  "Catering":            [1,2,7,8,9,10,12,11],
  "Transportation":      [1,2,7,8,9,10,12,11],
  "IT Services":         [1,2,7,8,9,10,12,11],
  "Beauty Services":     [1,2,7,8,9,10,12,11],
  "Tutoring":            [1,2,7,8,9,10,12,11],
  "Event Planning":      [1,2,7,8,9,10,12,11],

  // — Arts & Crafts flow —
  "Arts & Crafts":       [1,2,7,8,9,10,12,11],
  "Painting Supplies":   [1,2,7,8,9,10,12,11],
  "Knitting & Sewing":   [1,2,7,8,9,10,12,11],
  "DIY Kits":            [1,2,7,8,9,10,12,11],
  "Scrapbooking":        [1,2,7,8,9,10,12,11],
  "Art Prints":          [1,2,7,8,9,10,12,11],

  // — Travel & Experiences flow —
  "Travel & Experiences":[1,2,7,8,9,10,12,11],
  "Flight Tickets":      [1,2,7,8,9,10,12,11],
  "Hotel Bookings":      [1,2,7,8,9,10,12,11],
  "Tour Packages":       [1,2,7,8,9,10,12,11],
  "Event Tickets":       [1,2,7,8,9,10,12,11],
  "Travel Insurance":    [1,2,7,8,9,10,12,11],

  // — Digital Goods & Subscriptions flow —
  "Digital Goods & Subscriptions":[1,2,7,8,9,10,12,11],
  "Software Licenses":   [1,2,7,8,9,10,12,11],
  "E-books":             [1,2,7,8,9,10,12,11],
  "Online Courses":      [1,2,7,8,9,10,12,11],
  "Streaming Subscriptions":[1,2,7,8,9,10,12,11],
  "Mobile App Credits":  [1,2,7,8,9,10,12,11],
};

// -------------------
// MAIN MODAL COMPONENT
// -------------------

interface AddProductModalProps {
  showRequestProductModal: boolean;
  setShowRequestProductModal: (b: boolean) => void;
  product: any | null;
  companyId: string;
  categories: any[]; // array of category objects including subcategories
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  showRequestProductModal,
  setShowRequestProductModal,
  product,
  companyId,
  categories,
}) => {

  // Step state
  const [step, setStep] = useState(1);

  // Form data state
  const [formData, setFormData] = useState<any>({
    id: product?.id || "",
    name: product?.name || "",
    description: product?.description || "",
    productCategoryId: product?.productCategoryId || "",

    // Generic fields:
    model: product?.model || "",

    color: product?.color || [],
    size: product?.size || [],
    weight: product?.weight || "",

    condition: product?.condition || "",
    dimension: product?.dimension || "",
    material: product?.material || "",
    images: product?.images || [],

    // Flags:
    isAvailable: product?.isAvailable || false,
    isOnOffer: product?.isOnOffer || false,
    isFlashDeal: product?.isFlashDeal || false,
    isNewArrival: product?.isNewArrival || false,
    isDiscounted: product?.isDiscounted || false,
    isFeatured: product?.isFeatured || false,

    // Pricing:
    quantity: product?.companyStock || 1,
    costPrice: product?.costPrice || "",
    salesPrice: product?.salesPrice || 0,
    discount: product?.discount || 0,
    finalPrice: product?.finalPrice || 0,
    profitMargin: product?.profitMargin || 0,

    // Category / subcategory / brand / tags
    category: product?.productCategory || { subcategories: [], allBrands: [] },
    subCategory: product?.subCategory || "",
    brand: product?.brand || "",
    tags: product?.tags || [],

    // Commission / company
    commissionRate: product?.commissionRate || 0,
    commissionType: product?.commissionType || "COST",
    companyId: product?.companyId || `${companyId}`,

    // Vehicle-specific:
    make: product?.make || "",
    trim: product?.trim || "",
    type: product?.type || "",
    mileage: product?.mileage || "",
    engineType: product?.engineType || "",
    engineSize: product?.engineSize || "",
    transmission: product?.transmission || "",
    drivetrain: product?.drivetrain || "",
    vin: product?.vin || "",
    logbookStatus: product?.logbookStatus || "Available",
    serviceHistory: product?.serviceHistory || "Full",

    negotiable: product?.negotiable || false,
    financingAvailable: product?.financingAvailable || false,
    tradeIn: product?.tradeIn || false,
    features: product?.features || [],

    location: product?.location || "",
    contact: product?.contact || "",
    video: product?.video || null,

    // Books:
    author: product?.author || "",
    publisher: product?.publisher || "",
    isbn: product?.isbn || "",

    // Clothing/Fashion:
    fabricComposition: product?.fabricComposition || "",
    careInstructions: product?.careInstructions || "",

    // Home Appliances:
    energyRating: product?.energyRating || "",
    warrantyPeriod: product?.warrantyPeriod || "",
    dimensions: product?.dimensions || "",

    // Beauty Products:
    ingredients: product?.ingredients || "",
    usageInstructions: product?.usageInstructions || "",
    expirationDate: product?.expirationDate || "",

    // Deals:
    startDealDate: product?.startDealDate,
    endDealDate: product?.endDealDate,

    // Options / amenities / featured:
    option: product?.option || [],
    amenities: product?.amenities || [],
    featured: product?.featured || false,

    // Property-specific:
    bedrooms: product?.bedrooms || [],
    studios: product?.studios || [],
    bathrooms: product?.bathrooms || "",
    area: product?.area || "",

    digitalUrl: product?.digitalUrl || "",
    autoDeliver: !!product?.autoDeliver,

    year: product?.year || "",

    availabilityStart: product?.availabilityStart || "",
    availabilityEnd: product?.availabilityEnd || "",

    tax: product?.tax || 0,
    shippingCost: product?.shippingCost || 0,

    email: product?.email || "",
    locationName: product?.locationName || "",
    latitude: product?.latitude || null,
    longitude: product?.longitude || null,

    subCategoryName: product?.subCategoryName || "",
    contactName:     product?.contactName || "",
    
    propertyTypeId:  product?.propertyTypeId || "",
    serviceSchedule: product?.serviceSchedule || "",
    
    status:           product?.status || "ACTIVE",
    collectionId:     product?.collectionId || "",

  });

  // Determine which steps to show based on category
  const stepsForCategory: number[] = useMemo(() => {
    return CATEGORY_STEPS[formData.category?.name] || [1];
  }, [formData.category]);

  const currentDynamicStep = stepsForCategory[step - 1] || 1;
  const FormComponent = FORM_COMPONENTS[currentDynamicStep];

  // Images state
  const [newImages, setNewImages] = useState<File[]>([]);
  const [images, setImages] = useState<any[]>(
    product?.images?.map((img: any, index: number) => ({ ...img, index })) || []
  );
  const [loading, setLoading] = useState(false);

  // Subcategories and brands filtered from selected category
  const filteredSubCategories = useMemo(() => {
    if (!formData.category) return [];
    return formData.category.subcategories || [];
  }, [formData.category]);

  const filteredBrands = useMemo(() => {
    if (!formData.category) return [];
    return formData.category.allBrands || [];
  }, [formData.category]);

  // Generic input change handler
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, type, value, checked } = e.target as HTMLInputElement;

    setFormData((prev: any) => {
      let updatedData = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      // If pricing fields change, recalc finalPrice & profitMargin
      if (["costPrice", "salesPrice", "discount"].includes(name)) {
        const cost = parseFloat(updatedData.costPrice) || 0;
        const sales = parseFloat(updatedData.salesPrice) || 0;
        const disc = parseFloat(updatedData.discount) || 0;
        updatedData.finalPrice = +(
          sales -
          (sales * disc) / 100
        ).toFixed(2);
        updatedData.profitMargin = cost > 0 ? +(((sales - cost) / cost) * 100).toFixed(1) : 0;
      }

      return updatedData;
    });
  };

  // Upload logic (unchanged)
  async function uploadWithRetry(file: any, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await uploadFile(file, "image");
      } catch (error) {
        console.error(`Upload failed for ${file.name}, attempt ${attempt}`);
        if (attempt === retries) {
          return null;
        }
      }
    }
  }

  const uploadFile = async (file: File, type: string) => {
    const data = new FormData();
    data.append("file", file);
    data.append("type", type);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: data,
    });
    const json = await res.json();
    return json.url;
  };

  // Final submission
  const handleCreateListing = async () => {
    if (!window.confirm("Are you sure you want to create this listing?")) return;
    let updatedImages = images;

    if (newImages.length > 0) {
      const newImgsWithId = newImages.map((file, idx) => ({
        id: crypto.randomUUID(),
        file,
        index: idx,
      }));

      const uploadedUrls = await Promise.all(
        newImgsWithId.map(async ({ id, file, index }) => {
          const url = await uploadWithRetry(file);
          return url ? { id, url, index } : null;
        })
      );

      const success = uploadedUrls.filter((u) => !!u) as any[];
      const failed = newImgsWithId.filter(
        ({ id }) => !success.some((u) => u.id === id)
      );

      if (failed.length > 0) {
        setLoading(false);
        alert(
          `The following images failed: ${failed.map((f) => f.file.name).join(", ")}`
        );
        return;
      }

      // Replace placeholder images with actual URLs
      updatedImages = images.map((img: any, idx: number) => {
        const match = success.find((u) => u.index === idx);
        return match ? { ...img, url: match.url } : img;
      });

      setImages(updatedImages);
      setNewImages([]);
    }

    // Build final listing object
    const listing: any = {
      // — Required scalars / identifiers — 
      id:                 formData.id,                         // String
      name:               formData.name,                       // String
      description:        formData.description,                // String?
      companyId:          formData.companyId,                  // String? @db.ObjectId
      sellerType:         "ADMIN",
    
      // — Category hierarchy — 
      productCategoryId:  formData.category?.id || "",         // String? @db.ObjectId
      category:           formData.category?.name || "",       // String?
      subCategory:        formData.subCategory,                // Json?
      subCategoryName:    formData.subCategoryName,            // String?
    
      // — Media — 
      images:             images.map((i) => i.url),            // Json[]
      video:              formData.video || null,              // String?
    
      // — Tagging & branding — 
      tags:               formData.tags || [],                  // String[]
      brand:              formData.brand,                       // String?
      model:              formData.model,                       // String?
    
      // — Basic specs — 
      color:              formData.color,                       // String[]
      size:               formData.size,                        // String[]
      weight:             formData.weight,                      // String?
      condition:          formData.condition,                   // String?
      dimension:          formData.dimension,                   // String?
      material:           Array.isArray(formData.material)      // String[]
                             ? formData.material
                             : formData.material
                               ? [formData.material]
                               : [],
    
      // — Book-specific — 
      author:             formData.author,                      // String?
      publisher:          formData.publisher,                   // String?
      isbn:               formData.isbn,                        // String?
    
      // — Clothing/Fashion — 
      fabricComposition:  formData.fabricComposition,           // String?
      careInstructions:   formData.careInstructions,            // String?
    
      // — Home Appliances — 
      energyRating:       formData.energyRating,                // String?
      warrantyPeriod:     formData.warrantyPeriod,              // String?
      applianceDimensions: formData.applianceDimensions,        // String?
    
      // — Beauty Products — 
      ingredients:        formData.ingredients,                 // String?
      usageInstructions:  formData.usageInstructions,           // String?
      expirationDate:     formData.expirationDate 
                            ? new Date(formData.expirationDate)
                            : null,                             // DateTime?
    
      // — Pricing & deals — 
      costPrice:          parseFloat(formData.costPrice)  || 0, // Float
      salesPrice:         parseFloat(formData.salesPrice) || 0, // Float
      discount:           formData.discount,                    // Int?
      finalPrice:         parseFloat(formData.finalPrice)  || 0, // Float?
      profitMargin:       parseFloat(formData.profitMargin)|| 0, // Float?
      startDealDate:      formData.startDealDate,               // DateTime?
      endDealDate:        formData.endDealDate,                 // DateTime?
    
      // — General availability — 
      availabilityStart:  formData.availabilityStart,           // DateTime?
      availabilityEnd:    formData.availabilityEnd,             // DateTime?
    
      // — Location & contact — 
      location:           formData.location,                    // Json?
      locationId:         formData.locationId,                  // String? @db.ObjectId
      locationName:       formData.locationName,                // String?
      latitude:           formData.latitude,                    // Float?
      longitude:          formData.longitude,                   // Float?
      contact:            formData.contact || "",                // String?
      contactName:        formData.contactName,                 // String?
      email:              formData.email,                       // String?
    
      // — Amenities — 
      amenities:          formData.amenities || [],              // String[]
    
      // — Property-specific — 
      propertyTypeId:     formData.propertyTypeId,               // String? @db.ObjectId
      bedrooms:           formData.bedrooms || [],               // Json?
      studios:            formData.studios  || [],               // Json?
      bathrooms:          formData.bathrooms,                    // String?
      area:               formData.area,                         // String?
      serviceSchedule:    formData.serviceSchedule,              // String?
    
      // — Vehicle-specific — 
      make:               formData.make,                         // String?
      trim:               formData.trim,                         // String?
      type:               formData.type,                         // String?
      mileage:            formData.mileage,                      // String?
      engineType:         formData.engineType,                   // String?
      engineSize:         formData.engineSize,                   // String?
      transmission:       formData.transmission,                 // String?
      drivetrain:         formData.drivetrain,                   // String?
      vin:                formData.vin,                          // String?
      logbookStatus:      formData.logbookStatus,                // String?
      serviceHistory:     formData.serviceHistory,               // String?
      negotiable:         formData.negotiable || false,          // Boolean?
      financingAvailable: formData.financingAvailable || false,  // Boolean?
      tradeIn:            formData.tradeIn || false,             // Boolean?
    
      // — Digital Goods — 
      digitalUrl:         formData.digitalUrl,                    // String?
      autoDeliver:        !!formData.autoDeliver,                // Boolean?
    
      // — Pricing breakdown — 
      tax:                formData.tax      || 0,                // Float?
      shippingCost:       formData.shippingCost || 0,            // Float?
    
      // — Feature flags — 
      isAvailable:        formData.isAvailable  || false,        // Boolean
      isOnOffer:          formData.isOnOffer    || false,        // Boolean
      isFlashDeal:        formData.isFlashDeal  || false,        // Boolean
      isNewArrival:       formData.isNewArrival || false,        // Boolean
      isDiscounted:       formData.isDiscounted || false,        // Boolean
      isFeatured:         formData.isFeatured   || false,        // Boolean
    
      // — Other marketplace fields — 
      delivery:           formData.delivery     || false,         // Boolean
      paymentOption:      formData.paymentOption || "AT SHOP",   // String
      showOnGhuba:        formData.showOnGhuba,                   // Boolean?
    
      // — Optional: collection & status — 
      collectionId:       formData.collectionId,                 // String?
      status:             formData.status,                       // ListingStatus
  
    };
    
    // const listing: any = {
    //   // Basic identifiers
    //   id:                 formData.id,
    //   sellerType:         "ADMIN",
    //   name:               formData.name,
    //   description:        formData.description,
    //   companyId:          formData.companyId,
    
    //   // Category/Hierarchy
    //   productCategoryId:  formData.category?.id || "",
    //   category:           formData.category?.name || "",
    //   subCategory:        formData.subCategory,
    //   subCategoryName:    formData.subCategoryName,       // ← (new!)
    //   tags:               formData.tags || [],
    
    //   // Images / Video
    //   images:             images.map((i) => i.url),       // ← send actual URLs
    //   video:              formData.video || null,
    
    //   // Brand / Model / Specs
    //   brand:              formData.brand,
    //   model:              formData.model,
    //   color:              formData.color,
    //   size:               formData.size,
    //   weight:             formData.weight,
    //   condition:          formData.condition,
    //   dimension:          formData.dimension,
    //   material:           Array.isArray(formData.material)
    //                          ? formData.material
    //                          : formData.material
    //                            ? [formData.material]
    //                            : [],
    
    //   // Category‐specific attributes
    //   author:             formData.author,                // Books
    //   publisher:          formData.publisher,             // Books
    //   isbn:               formData.isbn,                  // Books
    //   fabricComposition:  formData.fabricComposition,     // Clothing
    //   careInstructions:   formData.careInstructions,      // Clothing
    //   energyRating:       formData.energyRating,          // Appliances
    //   warrantyPeriod:     formData.warrantyPeriod,        // Appliances
    //   applianceDimensions: formData.applianceDimensions,  // Appliances
    //   ingredients:        formData.ingredients,           // Beauty
    //   usageInstructions:  formData.usageInstructions,     // Beauty
    //   expirationDate:     formData.expirationDate 
    //                        ? new Date(formData.expirationDate)
    //                        : null,                        // Beauty
    
    //   // Pricing / Margins / Discounts
    //   costPrice:          parseFloat(formData.costPrice) || 0,
    //   salesPrice:         parseFloat(formData.salesPrice) || 0,
    //   discount:           formData.discount,
    //   finalPrice:         parseFloat(formData.finalPrice) || 0,
    //   profitMargin:       parseFloat(formData.profitMargin) || 0,
    
    //   // Deal scheduling
    //   startDealDate:      formData.startDealDate,
    //   endDealDate:        formData.endDealDate,
    
    //   // General “Availability”
    //   availabilityStart:  formData.availabilityStart,      // ← (new!)
    //   availabilityEnd:    formData.availabilityEnd,        // ← (new!)
    
    //   // Location/Contact
    //   location:           formData.location,               // if you still want raw GeoJSON
    //   locationId:         formData.locationId,             // ← (new, if you use the Location relation)
    //   locationName:       formData.locationName,           // ← (new!)
    //   latitude:           formData.latitude,               // ← (new!)
    //   longitude:          formData.longitude,              // ← (new!)
    //   contact:            formData.contact || "",          
    //   contactName:        formData.contactName,            // ← (new!)
    //   email:              formData.email,                  // ← (new!)
    
    //   // Amenities / Options
    //   option:             formData.option || [],
    //   amenities:          formData.amenities || [],
    
    //   // Property‐specific
    //   propertyTypeId:     formData.propertyTypeId,         // ← (new!)
    //   bedrooms:           formData.bedrooms || [],
    //   studios:            formData.studios || [],
    //   bathrooms:          formData.bathrooms,
    //   area:               formData.area,
    //   serviceSchedule:    formData.serviceSchedule,        // ← (new!)
    
    //   // Vehicle‐specific
    //   make:               formData.make,
    //   trim:               formData.trim,
    //   type:               formData.type,
    //   mileage:            formData.mileage,
    //   engineType:         formData.engineType,
    //   engineSize:         formData.engineSize,
    //   transmission:       formData.transmission,
    //   drivetrain:         formData.drivetrain,
    //   vin:                formData.vin,
    //   logbookStatus:      formData.logbookStatus,
    //   serviceHistory:     formData.serviceHistory,
    //   negotiable:         formData.negotiable || false,
    //   financingAvailable: formData.financingAvailable || false,
    //   tradeIn:            formData.tradeIn || false,
    //   year:               formData.year,
    
    //   // Digital products
    //   digitalUrl:         formData.digitalUrl,
    //   autoDeliver:        !!formData.autoDeliver,
    
    //   // Pricing breakdown
    //   tax:                formData.tax || 0,
    //   shippingCost:       formData.shippingCost || 0,
    
    //   // Flags (all boolean feature flags)
    //   isAvailable:        formData.isAvailable || false,
    //   isOnOffer:          formData.isOnOffer || false,
    //   isFlashDeal:        formData.isFlashDeal || false,
    //   isNewArrival:       formData.isNewArrival || false,
    //   isDiscounted:       formData.isDiscounted || false,
    //   isFeatured:         formData.isFeatured || false,
    
    //   // Marketplace‐only fields
    //   delivery:           formData.delivery || false,      // (already there)
    //   paymentOption:      formData.paymentOption || "AT SHOP", // (already there)
    //   showOnGhuba:        formData.showOnGhuba,            // (already there)
    
    //   // (Optional) If you want to attach to an existing “Collection”
    //   collectionId:       formData.collectionId,           // ← (new, only if you use Collections)
    
    //   // (Optional) Only if you want to control status from UI
    //   status:             formData.status,                 // ← (new, only if you let sellers pick it)
    
    //   quantity: formData.quantity,
    
    //   image: [], // on front end you could push updatedImages.map(i => i.url)
      
    //   commissionRate: formData.commissionRate || 0,
    //   commissionType: formData.commissionType || "COST",
            
    //   features: formData.features || [],
      
    // };
    

    try {
      const resp = await fetch(`${apiUrl}/admin/post-product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listing),
      });
      if (resp.ok) {
        const json = await resp.json();
        alert("Listing created successfully.");
        setShowRequestProductModal(false);
        setImages([]);
        setNewImages([]);
      } else {
        console.error("Error:", resp.statusText);
        alert("Error creating listing. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating listing. Please try again.");
    }
  };

  return (
    <Modal
      isOpen={showRequestProductModal}
      onClose={() => setShowRequestProductModal(false)}
    >
      <div className="p-6 bg-white rounded-xl shadow-lg text-gray-900 w-full max-w-4xl mx-auto h-[90vh] flex flex-col">
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
          <div className="overflow-y-auto flex-grow p-4">
            {FormComponent ? (
              <FormComponent
                formData={formData}
                setFormData={setFormData}
                images={images}
                setImages={setImages}
                categories={categories}
                filteredSubCategories={filteredSubCategories}
                filteredBrands={filteredBrands}
                handleInputChange={handleInputChange}
                newImages={newImages}
                setNewImages={setNewImages}
              />
            ) : (
              <p>No form available for this step.</p>
            )}
          </div>
        </motion.div>
        <div className="flex justify-between pt-4 border-t">
          {step > 1 && (
            <button
              className="bg-gray-400 text-white py-2 px-4 rounded-lg flex items-center"
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" /> Back
            </button>
          )}
          {step < stepsForCategory.length ? (
            <button
              className="bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center"
              onClick={() => setStep(step + 1)}
            >
              Next <ArrowRightIcon className="h-5 w-5 ml-1" />
            </button>
          ) : (
            <button
              className="bg-green-600 text-white py-2 px-4 rounded-lg flex items-center"
              onClick={handleCreateListing}
            >
              Submit <CheckCircleIcon className="h-5 w-5 ml-1" />
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AddProductModal;
