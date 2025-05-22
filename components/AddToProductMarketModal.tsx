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
  14: VehicleAmenitiesStep
};

const STEP_LABELS: Record<number, string> = {
  1: "Category",
  2: "Product Details",
  3: "General Details",
  4: "Engine Performance",
  5: "Ownership Pricing",
  7: "Pricing",
  8: "Images",
  9: "Product Variants",
  10: "Availability",
  11: "Final Review",
  12: "Contact Location",
  13: "Property Amenities",
  14: "Vehicle Amenities"
};

// ------------------- 
// CATEGORY_STEPS  
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
  "Houses":              [1,3,7,8,10,12,13,11],
  "Apartments":          [1,3,7,8,10,12,13,11],
  "Land":                [1,3,7,8,10,12,13,11],

  // — Automotive & tools flow —
  "Automotive":          [1,3,4,5,7,8,10,12,14,11],
  "Cars":                [1,3,4,5,7,8,10,12,14,11],
  "Car Accessories":     [1,3,4,5,7,8,10,12,14,11],
  "Tools":               [1,3,4,5,7,8,10,12,14,11],
  "Hardware":            [1,3,4,5,7,8,10,12,14,11]
};


// -------------------
// MAIN MODAL COMPONENT
// -------------------

const AddToProductMarketModal = ({ showRequestProductModal, setShowRequestProductModal, product, marketListItem, companyId, categories }: any) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    id: marketListItem?.id || "",
    productId: marketListItem?.productId || product?.product?.id || "",
    title: marketListItem?.title || product?.product?.name || "",
    description: marketListItem?.description || product?.product?.description || "",
    productCategoryId: marketListItem?.productCategoryId || product?.product?.productCategoryId || "",

    model: marketListItem?.model || product?.product?.model || "",
    color: marketListItem?.color || product?.product?.color || "",
    size: marketListItem?.size || product?.product?.size || "",
    weight: marketListItem?.weight || product?.product?.weight || "",

    condition: marketListItem?.condition || product?.product?.condition || "",
    dimension: marketListItem?.dimension || product?.product?.dimension || "",
    material: marketListItem?.material || product?.product?.material || "",
    images: marketListItem?.image || product?.product?.image || "",

    isAvailable: marketListItem?.isAvailable || product?.product?.isAvailable || false,
    isOnOffer: marketListItem?.isOnOffer || product?.product?.isOnOffer || false,
    isFlashDeal: marketListItem?.isFlashDeal || product?.product?.isFlashDeal || false,
    isNewArrival: marketListItem?.isNewArrival || product?.product?.isNewArrival || false,
    isDiscounted: marketListItem?.isDiscounted || product?.product?.isDiscounted || false,
    isFeatured: marketListItem?.isFeatured || product?.product?.isFeatured || false,

    quantity: product?.quantityPurchased || 1,
    buyingPrice: marketListItem?.buyingPrice || product?.product?.salesPrice || "",
    sellingPrice: marketListItem?.sellingPrice || 0,
    discount: marketListItem?.discount  || 0,
    finalPrice: marketListItem?.finalPrice || 0,
    profitMargin: marketListItem?.profitMargin || 0,
    category: marketListItem?.productCategory || product?.product?.productCategory || { subcategories: [], allBrands: [] },
    subCategory: marketListItem?.subCategory || product?.product?.subCategory || "",
    brand: marketListItem?.brand || product?.product?.brand || "",
    tags:marketListItem?.tags || product?.product?.tags || [],

    commissionRate: product?.product?.commissionRate || 0,
    commissionType: product?.product?.commissionType || 'COST', // Default to "Percentage"
    companyId: product?.product?.companyId || `${companyId}`,
    // Vehicle-specific keys
    make:  marketListItem?.make || product?.product?.make || "",
    trim:  marketListItem?.trim || product?.product?.trim || "",
    type:  marketListItem?.type || product?.product?.type || "",
    mileage:  marketListItem?.mileage || product?.product?.mileage || "",
    engineType:  marketListItem?.engineType || product?.product?.engineType || "",
    engineSize:  marketListItem?.engineSize || product?.product?.engineSize || "",
    transmission:  marketListItem?.transmission || product?.product?.transmission || "",
    drivetrain:  marketListItem?.drivetrain || product?.product?.drivetrain || "",

    vin:  marketListItem?.vin || product?.product?.vin || "",
    logbookStatus:  marketListItem?.logbookStatus || product?.product?.logbookStatus || "Available",
    serviceHistory:  marketListItem?.serviceHistory || product?.product?.serviceHistory || "Full",

    price:  marketListItem?.price || product?.product?.price || "",

    negotiable:  marketListItem?.negotiable || product?.product?.negotiable || false,
    financingAvailable:  marketListItem?.financingAvailable || product?.product?.financingAvailable || false,
    tradeIn:  marketListItem?.tradeIn || product?.product?.tradeIn || false,
    features:  marketListItem?.features || product?.product?.features || [],
    location:  marketListItem?.location || product?.product?.location || "",
    contact:  marketListItem?.contact || product?.product?.contact || "",
    video:  marketListItem?.video || product?.product?.video || null,
    // Extra fields for Books:
    author:  marketListItem?.author || product?.product?.author || "",
    publisher:  marketListItem?.publisher || product?.product?.publisher || "",
    isbn:  marketListItem?.isbn || product?.product?.isbn || "",
    // Extra fields for Clothing/Fashion:
    fabricComposition:  marketListItem?.fabricComposition || product?.product?.fabricComposition || "",
    careInstructions:  marketListItem?.careInstructions || product?.product?.careInstructions || "",
    // Extra fields for Home Appliances:
    energyRating:  marketListItem?.energyRating || product?.product?.energyRating || "",
    warrantyPeriod:  marketListItem?.warrantyPeriod || product?.product?.warrantyPeriod || "",
    dimensions:  marketListItem?.dimensions || product?.product?.dimensions || "",
    // Extra fields for Beauty Products:
    ingredients:  marketListItem?.ingredients || product?.product?.ingredients || "",
    usageInstructions:  marketListItem?.usageInstructions || product?.product?.usageInstructions || "",
    expirationDate:  marketListItem?.expirationDate || product?.product?.expirationDate || "",

    startDealDate: product?.product?.startDealDate,
    endDealDate: product?.product?.endDealDate,

    option: product?.product?.option || [],
    amenities: product?.product?.amenities || [],
    featured: product?.product?.featured || false,

    bedrooms: product?.product?.bedrooms || [],
    studios: product?.product?.studios || [],
    bathrooms: product?.product?.bathrooms || "",
    area: product?.product?.area || "",
  });

  const stepsForCategory: number[] = useMemo(() => {
    return CATEGORY_STEPS[formData.category?.name] || [];
  }, [formData.category]);

  const currentDynamicStep = stepsForCategory[step - 1];
  const FormComponent = currentDynamicStep ? FORM_COMPONENTS[currentDynamicStep] : FORM_COMPONENTS[1];

  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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
    const listing = {
      id: formData.id, // If updating; otherwise backend auto-generates
      // sellerId: "63f7c9e2d91b1b2a5e80b007", // Replace with actual seller ID
      sellerType: "ADMIN", // Or "CONSUMER", as appropriate
      companyId: companyId, // Replace with actual seller ID
      // sellerType: "CLIENT", // Or "CONSUMER", as appropriate
      productId: formData.productId,
      title: formData.title,
      description: formData.description,
      quantity: formData.quantity,
      image: images || [], // Use the first uploaded image
      productCategoryId: formData.category?.id || "", // Assuming category is an object with an id
      category: formData.category?.name || "",
      subCategory:formData.subCategory,
      tags: formData.tags || [],
      brand: formData.brand,
      model: formData.model,
      color: formData.color,
      size: formData.size,
      weight: formData.weight,
      condition: formData.condition,
      dimension: formData.dimension,
      material: Array.isArray(formData.material)
        ? formData.material
        : formData.material
        ? [formData.material]
        : [],
      salesPrice: parseFloat(formData.sellingPrice) || 0,
      discount: formData.discount,
      isAvailable: formData.isAvailable,
      isOnOffer: formData.isOnOffer,
      isFlashDeal: formData.isFlashDeal,
      isNewArrival: formData.isNewArrival,
      isDiscounted: formData.isDiscounted,
      isFeatured: formData.isFeatured,
      buyingPrice: parseFloat(formData.buyingPrice) || 0,
      sellingPrice: parseFloat(formData.sellingPrice) || 0,
      startDealDate: null,
      finalPrice:parseFloat(formData.finalPrice) || 0,
      contact:formData.contact,
      location:formData.location,
      endDealDate: null,
      // Category-specific fields for Books
      author: formData.author || "",
      publisher: formData.publisher || "",
      isbn: formData.isbn || "",
      // Category-specific fields for Clothing/Fashion
      fabricComposition: formData.fabricComposition || "",
      careInstructions: formData.careInstructions || "",
      // Category-specific fields for Home Appliances
      energyRating: formData.energyRating || "",
      warrantyPeriod: formData.warrantyPeriod || "",
      applianceDimensions: formData.dimensions || "",
      // Category-specific fields for Beauty Products
      ingredients: formData.ingredients || "",
      usageInstructions: formData.usageInstructions || "",
      expirationDate: formData.expirationDate
        ? new Date(formData.expirationDate)
        : null,
    };

    try {
      const response = await fetch(`${apiUrl}/admin/addToMarketList`, {
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
        setShowRequestProductModal(false);
      } else {
        console.error("Error creating listing:", response.statusText);
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
