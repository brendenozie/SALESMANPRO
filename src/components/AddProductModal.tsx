import React, { useState, useEffect, useMemo, useRef } from "react";
import Modal from "../components/Modal";
import { useDropzone, Accept } from "react-dropzone";
import { debounce } from "lodash";
import { motion } from "framer-motion";
import {
  ArrowUpCircleIcon,
  PhotoIcon,
  TagIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  CheckCircleIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";
import {
  ArrowUpOnSquareIcon,
  ArrowUpTrayIcon,
  CameraIcon,
  ListBulletIcon,
  PhoneIcon
} from "@heroicons/react/24/solid";
import CategoryPicker from "../components/CategoryPicker";
import Stepper from "../components/Stepper";
import ProductDetails from "../components/ProductDetails";
import GeneralDetails from "../components/GeneralDetails";
import EnginePerformance from "../components/EnginePerformance";
import OwnershipPricing from "../components/OwnershipPricing";
import PricingDetails from "../components/PricingDetails";
import ImageUploader from "../components/ImageUploader";
import ProductVariants from "../components/ProductVariants";
import ProductAvailability from "../components/ProductAvailability";
import FinalReview from "../components/FinalReview";
import ContactLocation from "../components/ContactLocation";
import AmenitiesStep from "../components/AmenitiesStep";
import VehicleAmenitiesStep from "../components/VehicleAmenitiesStep";


// -------------------
// MAPPINGS
// -------------------
// ------------------- 
// FORM → component mapping 
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

const AddProductModal = ({ showRequestProductModal, setShowRequestProductModal, product, sellerId, sellerType }: any) => {

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    id: product?.product?.id || "",
    name: product?.product?.name || "",
    description: product?.product?.description || "",
    productCategoryId: product?.product?.productCategoryId || "",
    model: product?.product?.model || "",
    color: product?.product?.color || [],
    size: product?.product?.size || [],
    weight: product?.product?.weight || "",
    condition: product?.product?.condition || "",
    dimension:  product?.product?.dimension || "",
    material:  product?.product?.material || "",
    images: product?.product?.images || [],
    isAvailable: product?.product?.isAvailable || false,
    isOnOffer: product?.product?.isOnOffer || false,
    isFlashDeal: product?.product?.isFlashDeal || false,
    isNewArrival: product?.product?.isNewArrival || false,
    isDiscounted: product?.product?.isDiscounted || false,
    isFeatured: product?.product?.isFeatured || false,
    quantity: product?.product?.companyStock || 1,
    costPrice: product?.product?.costPrice || "",
    salesPrice: product?.product?.salesPrice || 0,
    discount: product?.product?.discount || 0,
    finalPrice: product?.product?.finalPrice || 0,
    profitMargin: product?.product?.profitMargin || 0,
    category: product?.product?.productCategory || { subcategories: [], allBrands: [] },
    subCategory: product?.product?.subCategory || "",
    brand: product?.product?.brand || "",
    tags: product?.product?.tags || [],

    commissionRate: product?.product?.commissionRate || 0,
    commissionType: product?.product?.commissionType || 'COST', // Default to "Percentage"
    companyId: product?.product?.companyId || '68193adfab67ac0915b51a20',
    // Vehicle-specific keys
    make: product?.product?.make || "",
    trim: product?.product?.trim || "",
    type: product?.product?.type || "",
    mileage: product?.product?.mileage || "",
    engineType: product?.product?.engineType || "",
    engineSize: product?.product?.engineSize || "",
    transmission: product?.product?.transmission || "",
    drivetrain: product?.product?.drivetrain || "",
    
    vin: product?.product?.vin || "",
    logbookStatus: product?.product?.logbookStatus || "Available",
    serviceHistory: product?.product?.serviceHistory || "Full",
    
    negotiable: product?.product?.negotiable || false,
    financingAvailable: product?.product?.financingAvailable || false,
    tradeIn: product?.product?.tradeIn || false,
    features: product?.product?.features || [],
    location: product?.product?.location || "",
    contact: product?.product?.contact || "",
    video: product?.product?.video || null,
    // Extra fields for Books:
    author: product?.product?.author || "",
    publisher: product?.product?.publisher || "",
    isbn: product?.product?.isbn || "",
    // Extra fields for Clothing/Fashion:
    fabricComposition: product?.product?.fabricComposition || "",
    careInstructions: product?.product?.careInstructions || "",
    // Extra fields for Home Appliances:
    energyRating: product?.product?.energyRating || "",
    warrantyPeriod: product?.product?.warrantyPeriod || "",
    dimensions: product?.product?.dimensions || "",
    // Extra fields for Beauty Products:
    ingredients: product?.product?.ingredients || "",
    usageInstructions: product?.product?.usageInstructions || "",
    expirationDate: product?.product?.expirationDate || "",

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

  const [categories, setCategories] = useState([]);

  const [newImages, setNewImages] = useState<File[]>([]);

  // const [images, setImages] = useState<{name: string;  url: string; index: number }[]>(
  //   property?.images?.map((url: string, index: number) => ({ url, index: index })) || []
  // );

  const [images, setImages] = useState(
    product?.product?.images?.map((img: any, index: number) => ({ ...img, index })) || []
  );
  const [loading, setLoading] = useState(false);

  const filteredSubCategories = useMemo(() => {
    if (!formData.category) return [];
    return formData.category.subcategories;
  }, [formData.category]);

  useEffect(() => {
    if (categories.length > 0) return;
    // const cachedCategories = localStorage.getItem("categories");
    // if (cachedCategories) {
    //   setCategories(JSON.parse(cachedCategories));
    // } else {
      fetch(`${apiUrl}/admin/get-store-categories?limit=100&companyId=68193adfab67ac0915b51a20`)
        .then((res) => res.json())
        .then((data) => {
          setCategories(data.results);
          localStorage.setItem("categories", JSON.stringify(data.results));
          console.log("Fetched categories:", data);
        })
        .catch(console.error);
    // }
  }, [categories]);

  const filteredBrands = useMemo(() => {
    if (!formData.category) return [];
    return formData.category.allBrands;
  }, [formData.category]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, type, value, checked } = e.target as HTMLInputElement;

    setFormData((prev) => {
      let newValue = ["discount", "buyingPrice", "sellingPrice"].includes(name)
        ? parseFloat(value) || 0
        : value;

      let updatedData = { ...prev, [name]: type === "checkbox" ? checked : value, };

      if (["buyingPrice", "sellingPrice", "discount"].includes(name)) {
        const buyingPrice = parseFloat(updatedData.costPrice) || 0;
        const sellingPrice = parseFloat(updatedData.salesPrice) || 0;
        const discount = parseFloat(updatedData.discount) || 0;
        updatedData.finalPrice = sellingPrice - (sellingPrice * discount) / 100;
        updatedData.profitMargin = buyingPrice > 0 ? ((sellingPrice - buyingPrice) / buyingPrice) * 100 : 0;
      }

      return updatedData;
    });
  };

 // Function to attempt an upload with retries
  async function uploadWithRetry(file : any, retries = 3) {
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

  // Function to upload files to the backend or external storage
  const uploadFile = async (file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    return data.url; // URL to the uploaded file
  };

const handleCreateListing = async () => {

  if (window.confirm("Are you sure you want to create this listing?")) {
    // Filter out already uploaded image URLs

    // Ensure orderedImages remains a list of objects
    // Log initial state of images and newImages
    console.log("Initial Images:", images);
    console.log("New Images:", newImages.map((file) => file.name));
    
    // Declare updatedImages outside the block so it's accessible later
    let updatedImages = images;

    if (newImages.length > 0) {
      // Create an array of new images with unique IDs and their original index
      const newImagesWithIds = newImages.map((file, index) => ({
        id: crypto.randomUUID(), // unique identifier for reliable matching
        file,
        index, // track the original index order
      }));

      console.log("New Images with IDs:", newImagesWithIds);


      // Upload images with a retry mechanism
      const uploadedUrls = await Promise.all(
        newImagesWithIds.map(async ({ id, file, index }) => {
          const uploadedUrl = await uploadWithRetry(file);
          return uploadedUrl ? { id, url: uploadedUrl, index } : null;
        })
      );

      // Filter out successful uploads
      const successfulUploads = uploadedUrls.filter(Boolean);

      // Determine which images failed to upload
      const failedImages = newImagesWithIds.filter(
        ({ id }) => !successfulUploads.some((img) => img && img.id === id)
      );

      if (failedImages.length > 0) {
        setLoading(false);
        alert(
          `The following images failed to upload: ${failedImages
            .map((f) => f.file.name)
            .join(", ")}`
        );
        return;
      }

      // Update images while preserving the original index order
      updatedImages = images.map((img:any, index:any) => {
        // Find the upload result matching this index
        const matchedUpload = successfulUploads.find(
          (upload:any) => upload.index === index
        );
        return matchedUpload ? { ...img, url: matchedUpload.url } : img;
      });

      console.log("Updated Images after upload:", updatedImages);
      
      // Use the locally updated images array to construct the final payload later
      setImages(updatedImages);
      setNewImages([]);
    }

    // Build a listing object conforming to the updated MarketplaceListing model
    const listing = {
      id: formData.id, // If updating; otherwise backend auto-generates
      sellerType: "COMPANY", // Or "CONSUMER", as appropriate
      name: formData.name,
      description: formData.description,
      quantity: formData.quantity,
      // image: images || [], // Use the first uploaded image
      // image: images.filter((img:any) => img.url.startsWith("https://")),
      image:[],
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
      commissionRate: formData.commissionRate || 0,
      commissionType: formData.commissionType || 'COST', // Default to "Percentage"
      companyId: formData.companyId || '68193adfab67ac0915b51a20',
      material: Array.isArray(formData.material)
        ? formData.material
        : formData.material
        ? [formData.material]
        : [],
      finalPrice: parseFloat(formData.finalPrice) || 0,
      profitMargin: parseFloat(formData.profitMargin) || 0,
      discount: formData.discount,
      isAvailable: formData.isAvailable,
      isOnOffer: formData.isOnOffer,
      isFlashDeal: formData.isFlashDeal,
      isNewArrival: formData.isNewArrival,
      isDiscounted: formData.isDiscounted,
      isFeatured: formData.isFeatured,
      costPrice: parseFloat(formData.costPrice) || 0,
      salesPrice: parseFloat(formData.salesPrice) || 0,

      startDealDate: formData.startDealDate,
      endDealDate: formData.endDealDate,
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
        
      location: formData.location || "",
      contact: formData.contact || "",
      option: formData.option || [],
      amenities: formData.amenities || [],
      
      bedrooms: formData.bedrooms || [],
      studios: formData.studios || [],
      bathrooms: formData.bathrooms || "",
      area: formData.area || "",
    };

    try {
      const response = await fetch(`${apiUrl}/admin/post-product`, {
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
        setImages([]);
        setNewImages([]);
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

export default AddProductModal;
