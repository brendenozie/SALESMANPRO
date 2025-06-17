import React, { useState, useEffect, useMemo, useRef } from "react";
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
import { BookingSlot } from "./stores/create/BookingSlot/BookingSlot";
import { ProductPricingAndTiers } from "./stores/create/PricingTiers/PricingTiers";
import { ServiceSpecifics } from "./stores/create/ServiceSpecifics/ServiceSpecifics";

// ..//
// -------------------
// MAPPINGS
// -------------------

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
  15: ProductPricingAndTiers,
  16: ServiceSpecifics,
  17: BookingSlot
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
  15: "Product Pricing And Tiers",
  16: "Service Specifics",
  17: "Booking Slot",
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
  "Services":            [1,2,7,15,16,17,8,9,10,12,11],
  "Cleaning":            [1,2,7,15,16,17,8,9,10,12,11],
  "Plumbing":            [1,2,7,15,16,17,8,9,10,12,11],
  "Electrical":          [1,2,7,15,16,17,8,9,10,12,11],
  "Landscaping":         [1,2,7,15,16,17,8,9,10,12,11],
  "Catering":            [1,2,7,15,16,17,8,9,10,12,11],
  "Transportation":      [1,2,7,15,16,17,8,9,10,12,11],
  "IT Services":         [1,2,7,15,16,17,8,9,10,12,11],
  "Beauty Services":     [1,2,7,15,16,17,8,9,10,12,11],
  "Tutoring":            [1,2,7,15,16,17,8,9,10,12,11],
  "Event Planning":      [1,2,7,15,16,17,8,9,10,12,11],

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



// -------------------
// MAIN MODAL COMPONENT
// -------------------

const AddToProductMarketModal = ({ showRequestProductModal, setShowRequestProductModal, product, marketListItem, companyId, categories }: any) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({

    id:                  marketListItem?.id                   || "",
    productId:           marketListItem?.productId            || product?.product?.id          || "",
    name:                marketListItem?.name                 || marketListItem?.title         || product?.product?.name  || "",
    description:         marketListItem?.description          || product?.product?.description || "",
    productCategoryId:   marketListItem?.productCategoryId    || product?.product?.productCategoryId || "",
  
    // Basic specs:
    model:               marketListItem?.model                || product?.product?.model       || "",
    color:               marketListItem?.color                || product?.product?.color       || [],
    size:                marketListItem?.size                 || product?.product?.size        || [],
    weight:              marketListItem?.weight               || product?.product?.weight      || "",
    condition:           marketListItem?.condition            || product?.product?.condition   || "",
    dimension:           marketListItem?.dimension            || product?.product?.dimension   || "",
    material:            marketListItem?.material             || product?.product?.material    || [],
  
    // Flags:
    isAvailable:         marketListItem?.isAvailable          || product?.product?.isAvailable   || false,
    isOnOffer:           marketListItem?.isOnOffer            || product?.product?.isOnOffer     || false,
    isFlashDeal:         marketListItem?.isFlashDeal          || product?.product?.isFlashDeal   || false,
    isNewArrival:        marketListItem?.isNewArrival         || product?.product?.isNewArrival  || false,
    isDiscounted:        marketListItem?.isDiscounted         || product?.product?.isDiscounted  || false,
    isFeatured:          marketListItem?.isFeatured           || product?.product?.isFeatured    || false,
  
    // Inventory / pricing:
    quantity:            marketListItem?.quantity             || 1,
    buyingPrice:         marketListItem?.buyingPrice          || product?.product?.salesPrice    || 0,
    sellingPrice:        marketListItem?.sellingPrice         || product?.product?.sellingPrice  || 0,
    discount:            marketListItem?.discount             || product?.product?.discount      || 0,
    finalPrice:          marketListItem?.finalPrice           || product?.product?.finalPrice    || 0,
    profitMargin:        marketListItem?.profitMargin         || product?.product?.profitMargin  || 0,
  
    category:            marketListItem?.productCategory      || product?.product?.productCategory || { subcategories: [], allBrands: [] },
    subCategory:         marketListItem?.subCategory          || product?.product?.subCategory    || {},
    subCategoryName:     marketListItem?.subCategoryName      || product?.product?.subCategoryName || "",
    tags:                marketListItem?.tags                 || product?.product?.tags            || [],
  
    brand:               marketListItem?.brand                || product?.product?.brand           || "",
  
    // Commission fields (DELETE these if you don’t actually store them):
    // commissionRate:      marketListItem?.commissionRate        || product?.product?.commissionRate   || 0,
    // commissionType:      marketListItem?.commissionType        || product?.product?.commissionType   || "COST",
  
    companyId:           marketListItem?.companyId  || product?.product?.companyId          || `${companyId}`,
    sellerType: product?.product?.sellerType || `ADMIN`,
  
    // Vehicle-specific:
    make:                marketListItem?.make                 || product?.product?.make            || "",
    trim:                marketListItem?.trim                 || product?.product?.trim            || "",
    type:                marketListItem?.type                 || product?.product?.type            || "",
    mileage:             marketListItem?.mileage              || product?.product?.mileage         || "",
    engineType:          marketListItem?.engineType           || product?.product?.engineType      || "",
    engineSize:          marketListItem?.engineSize           || product?.product?.engineSize      || "",
    transmission:        marketListItem?.transmission         || product?.product?.transmission    || "",
    drivetrain:          marketListItem?.drivetrain           || product?.product?.drivetrain      || "",
    vin:                 marketListItem?.vin                  || product?.product?.vin             || "",
    logbookStatus:       marketListItem?.logbookStatus        || product?.product?.logbookStatus   || "Available",
    serviceHistory:      marketListItem?.serviceHistory       || product?.product?.serviceHistory  || "Full",
    negotiable:          marketListItem?.negotiable            || product?.product?.negotiable       || false,
    financingAvailable:  marketListItem?.financingAvailable   || product?.product?.financingAvailable || false,
    tradeIn:             marketListItem?.tradeIn              || product?.product?.tradeIn            || false,
  
    // Media:
    images:              marketListItem?.images               || product?.product?.images            || [],
    video:               marketListItem?.video                || product?.product?.video             || null,
  
    // Books:
    author:              marketListItem?.author               || product?.product?.author            || "",
    publisher:           marketListItem?.publisher            || product?.product?.publisher         || "",
    isbn:                marketListItem?.isbn                 || product?.product?.isbn              || "",
  
    // Clothing/Fashion:
    fabricComposition:   marketListItem?.fabricComposition    || product?.product?.fabricComposition || "",
    careInstructions:    marketListItem?.careInstructions     || product?.product?.careInstructions  || "",
  
    // Home Appliances:
    energyRating:        marketListItem?.energyRating         || product?.product?.energyRating      || "",
    warrantyPeriod:      marketListItem?.warrantyPeriod       || product?.product?.warrantyPeriod    || "",
    applianceDimensions: marketListItem?.applianceDimensions  || product?.product?.applianceDimensions || "",
  
    // Beauty Products:
    ingredients:         marketListItem?.ingredients          || product?.product?.ingredients       || "",
    usageInstructions:   marketListItem?.usageInstructions    || product?.product?.usageInstructions || "",
    expirationDate:      marketListItem?.expirationDate       || product?.product?.expirationDate    || "",
  
    // Deals:
    startDealDate:       marketListItem?.startDealDate       || product?.product?.startDealDate     || null,
    endDealDate:         marketListItem?.endDealDate         || product?.product?.endDealDate       || null,
  
    // Amenities:
    amenities:           marketListItem?.amenities            || product?.product?.amenities         || [],
  
    // Property-specific:
    bedrooms:            marketListItem?.bedrooms            || product?.product?.bedrooms          || {},
    studios:             marketListItem?.studios             || product?.product?.studios           || {},
    bathrooms:           marketListItem?.bathrooms           || product?.product?.bathrooms         || "",
    area:                marketListItem?.area                || product?.product?.area              || "",
    serviceSchedule:     marketListItem?.serviceSchedule     || product?.product?.serviceSchedule   || "",
    
    // Scheduling    
    availabilityStart:     marketListItem?.availabilityStart     || product?.product?.availabilityStart   || "",
    availabilityEnd:     marketListItem?.availabilityEnd     || product?.product?.availabilityEnd   || "",

    bookingSlots:     marketListItem?.bookingSlots     || product?.product?.bookingSlots   || [],
    minNoticePeriod:     marketListItem?.minNoticePeriod     || product?.product?.minNoticePeriod   || "",
    maxBookingAhead:     marketListItem?.maxBookingAhead     || product?.product?.maxBookingAhead   || "",

    pricingTiers:     marketListItem?.pricingTiers     || product?.product?.pricingTiers   || [],

    requiredClientInfo:     marketListItem?.requiredClientInfo     || product?.product?.requiredClientInfo   || "",
    fulfillmentStatus:     marketListItem?.fulfillmentStatus     || product?.product?.fulfillmentStatus   || "",

    totalCapacity:     marketListItem?.totalCapacity     || product?.product?.totalCapacity   || "",
    currentBookedCount:     marketListItem?.currentBookedCount     || product?.product?.currentBookedCount   || "",

    providerRating:     marketListItem?.providerRating     || product?.product?.providerRating   || "",

    hourlyRate:     marketListItem?.hourlyRate     || product?.product?.hourlyRate   || "",
    minimumHours:     marketListItem?.minimumHours     || product?.product?.minimumHours   || "",
    deliveryMethod:     marketListItem?.deliveryMethod     || product?.product?.deliveryMethod   || "",
  
    // Digital goods:
    digitalUrl:          marketListItem?.digitalUrl           || product?.product?.digitalUrl        || "",
    autoDeliver:         marketListItem?.autoDeliver          || product?.product?.autoDeliver        || false,
  
    // Marketplace-specific defaults (if your form doesn’t collect them, you can hardcode/prisma defaults):
    delivery:            marketListItem?.delivery            || false,
    paymentOption:       marketListItem?.paymentOption       || "AT SHOP",
    showOnGhuba:         marketListItem?.showOnGhuba         || true,
  
    // Contact & location:
    contactName:         marketListItem?.contactName         || product?.product?.contactName       || "",
    contact:             marketListItem?.contact             || product?.product?.contact           || "",
    locationName:        marketListItem?.locationName        || product?.product?.locationName      || "",
    location:            marketListItem?.location            || product?.product?.location          || {},
    locationId:          marketListItem?.locationId          || product?.product?.locationId        || "",
    latitude:            marketListItem?.latitude             ? parseFloat(marketListItem.latitude.toString()) : product?.product?.latitude  || null,
    longitude:           marketListItem?.longitude            ? parseFloat(marketListItem.longitude.toString()) : product?.product?.longitude || null,
  
    // Admin/Admin-only:
    status:              marketListItem?.status             || product?.product?.status            || "ACTIVE",
  });
  
  const stepsForCategory: number[] = useMemo(() => {
    return CATEGORY_STEPS[formData.category?.name] || [];
  }, [formData.category]);

  const currentDynamicStep = stepsForCategory[step - 1];
  const FormComponent = currentDynamicStep ? FORM_COMPONENTS[currentDynamicStep] : FORM_COMPONENTS[1];

  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);

  interface BookItem {
    title?: string;
    author?: string;
    publisher?: string;
    isbn?: string;
    [key: string]: any;
  }
  const [books, setBooks] = useState<BookItem[]>([]);

  const filteredSubCategories = useMemo(() => {
    if (!formData.category) return [];
    return formData.category.subcategories;
  }, [formData.category]);
  
  const filteredBrands = useMemo(() => {
    if (!formData.category) return [];
    return formData.category.allBrands;
  }, [formData.category]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      let newValue = ["discount", "buyingPrice", "sellingPrice"].includes(name)
        ? parseFloat(value) || 0
        : value;
      let updatedData = { ...prev, [name]: newValue };
      if (["buyingPrice", "sellingPrice", "discount"].includes(name)) {
        const buyingPrice = parseFloat(updatedData.buyingPrice) || 0;
        const sellingPrice = parseFloat(updatedData.sellingPrice) || 0;
        const discount = parseFloat(updatedData.discount) || 0;
        updatedData.finalPrice = sellingPrice - (sellingPrice * discount) / 100;
        updatedData.profitMargin = buyingPrice > 0 ? ((sellingPrice - buyingPrice) / buyingPrice) * 100 : 0;
      }
      return updatedData;
    });
  };

const handleCreateListing = async () => {
  if (window.confirm("Are you sure you want to create this listing?")) {
    // Build a listing object conforming to the updated MarketplaceListing model

     // 1) First, upload all images to S3 (in parallel).
    //    We map each File in imageFiles → a fetch("/api/upload", …) promise.
    const imageUploadPromises = imageFiles.map((file) => {
      const formData = new FormData();
      formData.append("type", "image");
      formData.append("file", file);
      return fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
        .then((res) => {
          if (!res.ok) throw new Error("Image upload failed");
          return res.json();
        })
        .then((json) => json.url as string);
    });

    // 2) Then, upload all videos to S3 (in parallel).
    const videoUploadPromises = videoFiles.map((file) => {
      const formData = new FormData();
      formData.append("type", "video");
      formData.append("file", file);
      return fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
        .then((res) => {
          if (!res.ok) throw new Error("Video upload failed");
          return res.json();
        })
        .then((json) => json.url as string);
    });

    // 3) Upload all book covers (in parallel). If a BookItem.coverFile is null, we skip.
    const bookCoverUploadPromises = books.map((book) => {
      if (!book.coverFile) {
        return Promise.resolve(null); // no cover was chosen
      }
      const fd = new FormData();
      fd.append("type", "file"); // or "image" if you prefer putting covers under images/
      fd.append("file", book.coverFile);
      return fetch("/api/upload", {
        method: "POST",
        body: fd,
      })
        .then((res) => {
          if (!res.ok) throw new Error("Book cover upload failed");
          return res.json();
        })
        .then((json) => json.url as string);
    });

    // 4) Await them all together:
    const [
      imageUrls,
      videoUrls,
      bookCoverUrls,
    ] = await Promise.all([
      Promise.all(imageUploadPromises),
      Promise.all(videoUploadPromises),
      Promise.all(bookCoverUploadPromises),
    ]);

    // 5) Build the final array of BookItems, replacing coverFile with coverUrl
    const booksWithUrls = books.map((book, idx) => ({
      title: book.title,
      author: book.author,
      coverUrl: bookCoverUrls[idx] || null,
    }));


    const listing: any = {
      // — Identifiers & relations —
      id:                   formData.id,                           // String @id (for updates) or omit for create
      sellerType:           formData.sellerType || "ADMIN",         // SellerType enum
      companyId:            formData.companyId,                              // String? @db.ObjectId
      sellerId:             undefined,                              // Optional: if you know a specific sellerId
      productId:            formData.productId,                     // String? @db.ObjectId
      
      images: imageUrls,                  // array of S3 URLs

      video: videoUrls.length > 0
        ? videoUrls[0]                     // or send an array, if your schema allows multiple
        : null,

      // — Books —
      books: booksWithUrls, 
    
      // — Title & description —
      name:                formData.name,                         // String
      description:          formData.description,                   // String?
    
      // — Inventory & media —
      quantity:             formData.quantity,                      // Int
      // images:               images || [],                           // Json[]
      // video:                formData.video || null,                 // String?
    
      // — Category hierarchy & tagging —
      productCategoryId:    formData.category?.id    || "",         // String @db.ObjectId
      category:             formData.category?.name  || "",         // String?
      subCategory:          formData.subCategory      || {},         // Json
      subCategoryName:      formData.subCategoryName  || "",         // String?
      tags:                 formData.tags             || [],         // String[]
    
      // — Branding & specs —
      brand:                formData.brand            || "",         // String?
      model:                formData.model            || "",         // String?
      color:                formData.color            || [],         // String[]
      size:                 formData.size             || [],         // String[]
      weight:               formData.weight           || "",         // String?
      condition:            formData.condition        || "",         // String?
      dimension:            formData.dimension        || "",         // String?
      material:             Array.isArray(formData.material)
                             ? formData.material
                             : formData.material
                               ? [formData.material]
                               : [],                              // String[]
    
      // — Profit & pricing —
      profitMargin:         parseFloat(formData.profitMargin) || 0, // Float?
      discount:             parseInt(formData.discount)      || 0,  // Int?
      buyingPrice:          parseFloat(formData.buyingPrice) || 0, // Float
      sellingPrice:         parseFloat(formData.sellingPrice) || 0,// Float
      finalPrice:           parseFloat(formData.finalPrice)  || 0, // Float?
    
      // — Deal scheduling —
      startDealDate:        formData.startDealDate   || null,       // DateTime? 
      endDealDate:          formData.endDealDate     || null,       // DateTime?
      
      // — Category-specific details —
      author:               formData.author            || "",       // String?
      publisher:            formData.publisher         || "",       // String?
      isbn:                 formData.isbn              || "",       // String?
      fabricComposition:    formData.fabricComposition || "",       // String?
      careInstructions:     formData.careInstructions  || "",       // String?
      energyRating:         formData.energyRating      || "",       // String?
      warrantyPeriod:       formData.warrantyPeriod    || "",       // String?
      applianceDimensions:  formData.applianceDimensions|| "",      // String?
      ingredients:          formData.ingredients       || "",       // String?
      usageInstructions:    formData.usageInstructions || "",       // String?
      expirationDate:       formData.expirationDate
                             ? new Date(formData.expirationDate)
                             : null,                              // DateTime?
    
      // — Feature flags —
      isAvailable:          formData.isAvailable  || false,         // Boolean
      isOnOffer:            formData.isOnOffer    || false,         // Boolean
      isFlashDeal:          formData.isFlashDeal  || false,         // Boolean
      isNewArrival:         formData.isNewArrival || false,         // Boolean
      isDiscounted:         formData.isDiscounted || false,         // Boolean
      isFeatured:           formData.isFeatured   || false,         // Boolean
    
      // — Marketplace-specific —
      delivery:             formData.delivery       || false,         // Boolean
      paymentOption:        formData.paymentOption  || "AT SHOP",     // String
      showOnGhuba:          formData.showOnGhuba    || true,          // Boolean?
      
      // — Contact & location (embed GeoJSON or link to Location table) —
      contact:              formData.contact        || "",            // String?
      location:             formData.location       || {},            // Json?
      locationId:           formData.locationId     || "",            // String? @db.ObjectId
      locationName:         formData.locationName   || "",            // String?
      latitude:             parseFloat(formData.latitude)  || null,      // Float?
      longitude:            parseFloat(formData.longitude) || null,      // Float?
    
      // — Property-specific —
      bedrooms:             formData.bedrooms       || {},            // Json?
      studios:              formData.studios        || {},            // Json?
      bathrooms:            formData.bathrooms      || "",            // String?
      area:                 formData.area           || "",            // String?
      serviceSchedule:      formData.serviceSchedule|| "",            // String?

      // Scheduling    
      availabilityStart:    formData.availabilityStart       || {},
      availabilityEnd:    formData.availabilityEnd       || {},

      bookingSlots:     formData.bookingSlots       || {},
      minNoticePeriod:   formData.minNoticePeriod       || {},
      maxBookingAhead: formData.maxBookingAhead       || {},

      pricingTiers: formData.pricingTiers       || {},

      requiredClientInfo: formData.requiredClientInfo       || {},
      fulfillmentStatus:  formData.fulfillmentStatus       || {},

      totalCapacity:  formData.totalCapacity       || {},
      currentBookedCount: formData.currentBookedCount       || {},

      providerRating: formData.providerRating       || {},

      hourlyRate: formData.hourlyRate       || {},
      minimumHours:  formData.minimumHours       || {},
      deliveryMethod: formData.deliveryMethod       || {},
  
      // — Vehicle-specific —
      make:                 formData.make            || "",           // String?
      trim:                 formData.trim            || "",           // String?
      type:                 formData.type            || "",           // String?
      mileage:              formData.mileage         || "",           // String?
      engineType:           formData.engineType      || "",           // String?
      engineSize:           formData.engineSize      || "",           // String?
      transmission:         formData.transmission    || "",           // String?
      drivetrain:           formData.drivetrain      || "",           // String?
      vin:                  formData.vin             || "",           // String?
      logbookStatus:        formData.logbookStatus   || "",           // String?
      serviceHistory:       formData.serviceHistory  || "",           // String?
      negotiable:           formData.negotiable      || false,        // Boolean?
      financingAvailable:   formData.financingAvailable || false,      // Boolean?
      tradeIn:              formData.tradeIn         || false,        // Boolean?
    
      // — Digital goods —
      digitalUrl:           formData.digitalUrl      || "",           // String?
      autoDeliver:          !!formData.autoDeliver,                  // Boolean?
    
      // — Admin/Admin-only fields —
      status:               formData.status         || "ACTIVE",     // ListingStatus
      
    };
   
    try {

      const response = await fetch(`${apiUrl}/admin/post-market-list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(listing)
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Listing created:", data);
        alert("Marketplace listing created successfully.");
        
        // 7) Close modal + clear all file states:
        setShowRequestProductModal(false);
        setImageFiles([]);
        setImagePreviews([]);
        setVideoFiles([]);
        setVideoPreviews([]);
        setBooks([]);
      } else {
        console.error("Error creating listing:", response.statusText);
        console.error("Error creating listing:", response);
        alert("Error creating listing. Please try again.");
      }
    } catch (error) {
      console.error("Error creating listing:", error);
      alert("Error creating listing. Please try again.");
    }
  }
};


  return (
    <Modal isOpen={showRequestProductModal} onClose={() => setShowRequestProductModal(false)}>
      <div className="p-6 bg-white rounded-xl shadow-lg text-gray-900 w-full max-w-4xl mx-auto h-[90vh] flex flex-col">
        <motion.div key={step} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex-grow overflow-y-auto">
          <Stepper step={step} stepsForCategory={stepsForCategory} STEP_LABELS={STEP_LABELS} />
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
                imageFiles={imageFiles}
                setImageFiles={setImageFiles}
                imagePreviews={imagePreviews}
                setImagePreviews={setImagePreviews}
                videoFiles={videoFiles}
                setVideoFiles={setVideoFiles}
                videoPreviews={videoPreviews}
                setVideoPreviews={setVideoPreviews}
                books={books}
                setBooks={setBooks}
              />
            ) : (
              <p>No form available for this step.</p>
            )}
          </div>
        </motion.div>
        <div className="flex justify-between pt-4 border-t">
          {step > 1 && (
            <button className="bg-gray-400 text-white py-2 px-4 rounded-lg flex items-center" onClick={() => setStep(step - 1)}>
              <ArrowLeftIcon className="h-5 w-5 mr-1" /> Back
            </button>
          )}
          {step < stepsForCategory.length ? (
            <button className="bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center" onClick={() => setStep(step + 1)}>
              Next <ArrowRightIcon className="h-5 w-5 ml-1" />
            </button>
          ) : (
            <button onClick={handleCreateListing} className="bg-green-600 text-white py-2 px-4 rounded-lg flex items-center">
              Submit <CheckCircleIcon className="h-5 w-5 ml-1" />
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AddToProductMarketModal;
