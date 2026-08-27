"use client";

import React, { useCallback, useMemo, useState } from "react";
import { XMarkIcon, TagIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { ProductForm } from "@/types/typings";

// ---------------------------
// FILE: _config/categoryTypes.ts
// ---------------------------
export const CATEGORY_TYPES = {
  service: [
    "Cleaning",
    "Plumbing",
    "Electrical",
    "Landscaping",
    "Catering",
    "Transportation",
    "IT Services",
    "Beauty Services",
    "Tutoring",
    "Event Planning",
    "Real Estate",
    "Property",
  ],
  digital: [
    "Software Licenses",
    "E-books",
    "Online Courses",
    "Streaming Subscriptions",
    "Mobile App Credits",
  ],
  travel: [
    "Flight Tickets",
    "Hotel Bookings",
    "Tour Packages",
    "Event Tickets",
    "Travel Insurance",
  ],
  property: [
    "Real Estate",
    "Property",
    "Houses",
    "Land",
    "Commercial",
    "Apartments",
    "Vacation Rentals",
    "Warehouses",
    "Gated Communities",
    "Offices",
    "Serviced Apartments",
    "Hostels",
    "Shared Housing",
    "Shops",
    "Farms",
    "Hotels",
    "Event Spaces",
  ],
};

export const getCategoryFlags = (category?: string, subCategory?: string) => {
  const key = (subCategory || category || "") as string;
  const isService = CATEGORY_TYPES.service.includes(key);
  const isDigital = CATEGORY_TYPES.digital.includes(key);
  const isTravel = CATEGORY_TYPES.travel.includes(key);
  const isProperty = CATEGORY_TYPES.property.includes(key);
  const isPhysical = !isService && !isDigital && !isTravel;

  return { isService, isDigital, isTravel, isProperty, isPhysical };
};

// ---------------------------
// FILE: _components/Field.tsx
// ---------------------------

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helper?: string;
  textarea?: boolean;
}

export const Field: React.FC<FieldProps> = ({ label, helper, textarea, ...rest }) => {
  const base = "mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200 hover:border-blue-400";

  return (
    <div className="space-y-1">
      <label className="block text-gray-700 text-sm font-medium">{label}</label>
      {textarea ? (
        <textarea {...(rest as any)} className={`${base} h-24 resize-y`} />
      ) : (
        <input {...(rest as any)} className={base} />
      )}
      {helper && <p className="text-xs text-gray-500">{helper}</p>}
    </div>
  );
};

export const SectionWrapper: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-4 p-5 border border-gray-200 rounded-lg bg-gray-50 shadow-sm"
    >
      {title ? <h3 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">{title}</h3> : null}
      {children}
    </motion.section>
  );
};

interface TagInputProps {
  label: string;
  placeholder?: string;
  tags: string[];
  onTagsChange: (t: string[]) => void;
}

export const TagInput: React.FC<TagInputProps> = ({ label, placeholder = "Add tag...", tags, onTagsChange }) => {
  const [inputValue, setInputValue] = useState("");

  const addTag = (raw: string) => {
    const v = raw.trim();
    if (!v) return;
    if (tags.includes(v)) return;
    onTagsChange([...tags, v]);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  const removeTag = (t: string) => onTagsChange(tags.filter((x) => x !== t));

  return (
    <div className="space-y-2">
      <label className="block text-gray-700 font-semibold text-sm">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] items-center">
        <AnimatePresence initial={false}>
          {tags.length > 0 ? (
            tags.map((tag) => (
              <motion.span
                key={tag}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex items-center bg-indigo-500 text-white text-sm px-3 py-1 rounded-full shadow-md transition-all duration-200"
              >
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="ml-2 text-white hover:text-gray-100 focus:outline-none rounded-full p-0.5">
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </motion.span>
            ))
          ) : (
            <p className="text-gray-500 text-sm italic">No tags yet. Start typing.</p>
          )}
        </AnimatePresence>
      </div>
      <input
        className="w-full p-3 rounded-lg bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label={label}
      />
      <p className="text-xs text-gray-500 mt-1">
        Press <kbd className="px-1 py-0.5 border rounded bg-gray-200 text-gray-700 text-xs">Enter</kbd> or <kbd className="px-1 py-0.5 border rounded bg-gray-200 text-gray-700 text-xs">,</kbd> to add.
      </p>
    </div>
  );
};

// Renamed to avoid duplicate identifier conflict
interface BasicInfoProps {
  formData: ProductForm;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setFormData: (name: string, value: any) => void;
}

export const BasicInfo: React.FC<BasicInfoProps> = ({ formData, handleInputChange, setFormData }) => {
  // Default to "buy" if not set in your ProductForm type yet
  const listingType = (formData as any).listingTransactionType || "SALE";

  return (
    <SectionWrapper title="Basic Information">
      <div className="space-y-5">
        
        {/* === Buy / Rent Toggle Segmented Control === */}
        <div className="space-y-2">
          <label className="block text-gray-700 text-sm font-medium">Listing Intent</label>
          <div className="flex bg-gray-200/70 p-1 rounded-xl w-full sm:w-72">
            <button
              type="button"
              onClick={() => setFormData("listingTransactionType", "SALE")}
              className={`flex-1 flex items-center justify-center py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                listingType === "SALE"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <TagIcon className="w-4 h-4 mr-2" />
              For Sale
            </button>
            <button
              type="button"
              onClick={() => setFormData("listingTransactionType", "RENT")}
              className={`flex-1 flex items-center justify-center py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                listingType === "RENT"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <CalendarDaysIcon className="w-4 h-4 mr-2" />
              For Rent
            </button>
          </div>
        </div>

        {/* Existing Fields */}
        <Field
          label="Product Title"
          name="name"
          placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
          value={formData.name || ""}
          onChange={handleInputChange}
        />
        <div>
          <Field
            label="Description"
            name="description"
            textarea
            placeholder="Enter a comprehensive description (max 500 characters)."
            maxLength={500}
            value={formData.description || ""}
            onChange={handleInputChange}
          />
          <p className="text-sm text-gray-500 text-right mt-1">{(formData.description || "").length}/500 characters</p>
        </div>
      </div>
    </SectionWrapper>
  );
};

export const BookMetadata: React.FC<{ formData: ProductForm; handleInputChange: any }> = ({ formData, handleInputChange }) => {
  return (
    <SectionWrapper title="Book Metadata">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: "author", label: "Author" },
          { name: "publisher", label: "Publisher" },
          { name: "isbn", label: "ISBN" },
        ].map((f) => (
          <Field
            key={f.name}
            label={f.label}
            name={f.name}
            placeholder={`Enter ${f.label}`}
            value={typeof formData[f.name as keyof ProductForm] === "string" ? (formData[f.name as keyof ProductForm] as string) : ""}
            onChange={handleInputChange}
          />
        ))}
      </div>
    </SectionWrapper>
  );
};

export const ClothingDetails: React.FC<{ formData: ProductForm; handleInputChange: any }> = ({ formData, handleInputChange }) => {
  return (
    <SectionWrapper title="Clothing Details">
      <div className="space-y-3">
        <Field label="Fabric Composition" name="fabricComposition" placeholder="e.g., 100% Cotton" value={formData.fabricComposition || ""} onChange={handleInputChange} />
        <Field textarea label="Care Instructions" name="careInstructions" placeholder="Care instructions" value={formData.careInstructions || ""} onChange={handleInputChange} />
      </div>
    </SectionWrapper>
  );
};

export const ApplianceDetails: React.FC<{ formData: ProductForm; handleInputChange: any }> = ({ formData, handleInputChange }) => {
  const fields = [
    { name: "energyRating", label: "Energy Rating" },
    { name: "warrantyPeriod", label: "Warranty Period" },
    { name: "dimensions", label: "Dimensions" },
  ];

  return (
    <SectionWrapper title="Appliance Specifications">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((f) => (
          <Field key={f.name} label={f.label} name={f.name} placeholder={`Enter ${f.label.toLowerCase()}`} value={formData[f.name as keyof ProductForm] || ""} onChange={handleInputChange} />
        ))}
      </div>
    </SectionWrapper>
  );
};

export const BeautyDetails: React.FC<{ formData: ProductForm; handleInputChange: any }> = ({ formData, handleInputChange }) => {
  return (
    <SectionWrapper title="Beauty Product Details">
      <div className="space-y-3">
        <Field textarea label="Ingredients" name="ingredients" placeholder="List of ingredients" value={formData.ingredients || ""} onChange={handleInputChange} />
        <Field textarea label="Usage Instructions" name="usageInstructions" placeholder="How to use" value={formData.usageInstructions || ""} onChange={handleInputChange} />
        <Field
          label="Expiration Date"
          name="expirationDate"
          type="date"
          value={
            formData.expirationDate
              ? typeof formData.expirationDate === "string"
                ? formData.expirationDate
                : (formData.expirationDate as Date).toISOString().slice(0, 10)
              : ""
          }
          onChange={handleInputChange}
        />
      </div>
    </SectionWrapper>
  );
};

export const PropertyDetails: React.FC<{ formData: ProductForm; handleInputChange: any }> = ({ formData, handleInputChange }) => {
  return (
    <SectionWrapper title="Property Details">
      <div className="space-y-2">
        <Field label="Bathrooms" name="bathrooms" type="number" placeholder="e.g., 2" value={formData.bathrooms || ""} onChange={handleInputChange} />
        <Field label="Bedrooms" name="bedrooms" type="number" placeholder="e.g., 3" value={formData.bedrooms || ""} onChange={handleInputChange} />
        <Field label="Plot Size" name="plotSize" placeholder="e.g., 500 sqm" value={""} onChange={handleInputChange} />
      </div>
    </SectionWrapper>
  );
};

export const DigitalOptions: React.FC<{ formData: ProductForm; handleInputChange: any }> = ({ formData, handleInputChange }) => {
  return (
    <SectionWrapper title="Digital Product Options">
      <div className="space-y-2">
        <label className="inline-flex items-center">
          <input id="autoDeliver" name="autoDeliver" type="checkbox" checked={formData.autoDeliver || false} onChange={handleInputChange} className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2" />
          <span className="text-gray-700 font-medium">Auto-deliver digital product upon purchase</span>
        </label>
        <p className="text-sm text-gray-500">If checked, the product will be automatically delivered after purchase.</p>
      </div>
    </SectionWrapper>
  );
};

export const TravelDetails: React.FC<{ formData: ProductForm; handleInputChange: any; subCategoryName?: string }> = ({ formData, handleInputChange, subCategoryName }) => {
  const label = subCategoryName === "Flight Tickets" ? "Seat Class (Economy, Business)" : subCategoryName === "Hotel Bookings" ? "Room Type" : "Package Details";

  return (
    <SectionWrapper title="Travel Specifics">
      <Field label={label} name="travelDetail" placeholder="Enter travel detail" value={""} onChange={handleInputChange} />
    </SectionWrapper>
  );
};

export const PhysicalSpecs: React.FC<{ formData: ProductForm; handleInputChange: any }> = ({ formData, handleInputChange }) => {
  return (
    <SectionWrapper title="Product Specifications">
      <div className="space-y-2">
        <Field label="Model / SKU" name="model" placeholder="e.g., XYZ-123" value={formData.model || ""} onChange={handleInputChange} />
        <p className="text-sm text-gray-500">A unique identifier useful for inventory management.</p>
      </div>
    </SectionWrapper>
  );
};

// Renamed to avoid duplicate identifier conflict
interface ProductDetailsProps {
  formData: ProductForm;
  setFormData: (name: string, value: any) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

export const ProductDetails: React.FC<ProductDetailsProps> = ({ formData, setFormData, handleInputChange }) => {
  const subCategoryName = formData.subCategoryName || "";
  const categoryDisplayName = formData.category?.displayName || "";

  const { isService, isDigital, isTravel, isProperty, isPhysical } = useMemo(() => getCategoryFlags(categoryDisplayName, subCategoryName), [categoryDisplayName, subCategoryName]);

  const handleTagsChange = useCallback((newTags: string[]) => setFormData("tags", newTags), [setFormData]);

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-200 space-y-8">
      <motion.div className="text-center" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h2 className="text-3xl font-extrabold text-gray-900">{(categoryDisplayName || "Product")} Details</h2>
        <p className="text-gray-600">Provide accurate and detailed information for your listing.</p>
      </motion.div>

      <BasicInfo formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} />

      {categoryDisplayName === "Books" && <BookMetadata formData={formData} handleInputChange={handleInputChange} />}

      { ["Clothing", "Fashion"].includes(categoryDisplayName) && <ClothingDetails formData={formData} handleInputChange={handleInputChange} /> }

      {categoryDisplayName === "Home Appliances" && <ApplianceDetails formData={formData} handleInputChange={handleInputChange} />}

      { ["Beauty Products", "Skincare", "Haircare"].includes(categoryDisplayName) && <BeautyDetails formData={formData} handleInputChange={handleInputChange} /> }

      {isDigital && <DigitalOptions formData={formData} handleInputChange={handleInputChange} />}

      {isTravel && <TravelDetails formData={formData} handleInputChange={handleInputChange} subCategoryName={subCategoryName} />}

      {isPhysical && <PhysicalSpecs formData={formData} handleInputChange={handleInputChange} />}

      <motion.section initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-2 p-5 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
        <TagInput label="Product Tags" placeholder="Add keywords like 'new', 'sale', 'electronics'" tags={formData.tags || []} onTagsChange={handleTagsChange} />
        <p className="mt-1 text-sm text-gray-500">Tags help customers find your product through search and improve categorization.</p>
      </motion.section>
    </motion.div>
  );
};

export default ProductDetails;