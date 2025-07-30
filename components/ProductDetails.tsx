'use client'; // For Next.js App Router

import React, { useCallback, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ProductForm } from "@/types/typings";

// --- TagInput Component (Improved) ---
interface TagInputProps {
  label: string;
  placeholder: string;
  tags: string[];
  onTagsChange: (newTags: string[]) => void;
  // Adjusted for consistency with ProductDetails input styling
  inputClasses?: string;
  // Added for better visual feedback
  tagClasses?: string;
}

const TagInput: React.FC<TagInputProps> = ({
  label,
  placeholder,
  tags,
  onTagsChange,
  inputClasses = "w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm",
  tagClasses = "flex items-center bg-indigo-500 text-white text-sm px-3 py-1 rounded-full shadow-md transition-all duration-200 hover:bg-indigo-600 active:scale-95",
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !tags.includes(newTag)) {
        onTagsChange([...tags, newTag]);
        setInputValue('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <section className="space-y-3"> {/* Increased space-y for better visual separation */}
      <label className="block text-gray-700 font-semibold text-sm">{label}</label> {/* Stronger label */}
      <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] items-center"> {/* Added min-h and align-items */}
        {tags && tags.length > 0 ? (
          tags.map((tag, index) => (
            <span
              key={index}
              className={tagClasses}
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-2 text-white hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded-full p-0.5" // Improved button focus and padding
                aria-label={`Remove tag ${tag}`}
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </span>
          ))
        ) : (
          <p className="text-gray-500 text-sm italic">No tags added yet. Start typing!</p> // Placeholder when no tags
        )}
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className={inputClasses}
        aria-label={label}
      />
      <p className="text-xs text-gray-500 mt-1">
        Type a tag and press <kbd className="px-1 py-0.5 border rounded bg-gray-200 text-gray-700 text-xs">Enter</kbd> or <kbd className="px-1 py-0.5 border rounded bg-gray-200 text-gray-700 text-xs">comma</kbd> to add it.
      </p>
    </section>
  );
};

// --- ProductDetails Component (Improved) ---
// interface ProductForm {
//   name: string;
//   description: string;
//   category: { name: string; displayName: string } | null;
//   subCategoryName: string;
//   tags: string[];
//   author?: string;
//   publisher?: string;
//   isbn?: string;
//   fabricComposition?: string;
//   careInstructions?: string;
//   energyRating?: string;
//   warrantyPeriod?: string;
//   dimensions?: string;
//   ingredients?: string;
//   usageInstructions?: string;
//   expirationDate?: string;
//   autoDeliver?: boolean;
//   travelDetail?: string;
//   model?: string;
// }

interface ProductDetailsProps {
  formData: ProductForm;
  setFormData: (name: string, value: any) => void;
  // filteredSubCategories: string[]; // Keep if still needed, otherwise remove
  // filteredBrands: string[]; // Keep if still needed, otherwise remove
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  formData,
  setFormData,
  handleInputChange,
}) => {
  const subCategoryName: string = formData.subCategoryName || "";
  const categoryDisplayName: string = formData.category?.displayName || "";

  console.log(`${subCategoryName} | ${categoryDisplayName} | ${subCategoryName} | `)
  // Determine product types based on subCategoryName or categoryDisplayName
  const isService = [
    "Cleaning", "Plumbing", "Electrical", "Landscaping", "Catering", "Transportation",
    "IT Services", "Beauty Services", "Tutoring", "Event Planning", "Real Estate", "Property"
  ].includes(subCategoryName || categoryDisplayName);

  const isDigital = [
    "Software Licenses", "E-books", "Online Courses", "Streaming Subscriptions", "Mobile App Credits"
  ].includes(subCategoryName || categoryDisplayName);

  const isTravel = [
    "Flight Tickets", "Hotel Bookings", "Tour Packages", "Event Tickets", "Travel Insurance"
  ].includes(subCategoryName || categoryDisplayName);

  const isPhysical = !isService && !isDigital && !isTravel;

  // Dynamic header label based on main category
  const headerLabel = (() => {
    if (categoryDisplayName === "Books") return "Book Details";
    if (["Clothing", "Fashion"].includes(categoryDisplayName)) return "Clothing Details";
    if (categoryDisplayName === "Home Appliances") return "Appliance Details";
    if (["Beauty Products", "Skincare", "Haircare"].includes(categoryDisplayName)) return "Beauty Product Details";
    if (isService) return "Service Details";
    if (isDigital) return "Digital Product Details";
    if (isTravel) return "Travel Experience Details";
    return "Product Details";
  })();

  // Dynamic primary input label
  const primaryLabel = isService
    ? "Service Title"
    : isDigital
    ? "Product Title"
    : isTravel
    ? "Experience Title"
    : categoryDisplayName === "Books"
    ? "Book Title"
    : "Product Title";

  // Unified input styling for consistency and appeal
  const inputClasses =
    "mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200 hover:border-blue-400";

  // Memoized callback for tag changes to prevent unnecessary re-renders
  const handleTagsChange = useCallback(
    (newTags: string[]) => {
      setFormData('tags', newTags);
    },
    [setFormData]
  );

  return (
    <div className="mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-200 space-y-8 animate-fade-in"> {/* Added animation and subtle shadow */}
      <h2 className="text-3xl font-extrabold text-gray-900 text-center leading-tight">
        {headerLabel}
      </h2>
      <p className="text-center text-gray-600 mb-6">
        Provide accurate and detailed information for your listing.
      </p>

      {/* --- Main Product Information --- */}
      <section className="space-y-4 bg-gray-50 p-5 rounded-lg border border-gray-100 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">Basic Information</h3>
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium text-sm">
            {primaryLabel} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            placeholder={
              isService
                ? "e.g. Professional House Cleaning Service"
                : isDigital
                ? "e.g. Adobe Photoshop CC 2024 License"
                : isTravel
                ? "e.g. 7-Day Luxury Safari to Masai Mara"
                : "e.g. Sony WH-1000XM5 Wireless Noise-Cancelling Headphones"
            }
            className={inputClasses}
            value={formData.name || ""}
            onChange={handleInputChange}
            required
            aria-required="true"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-gray-700 font-medium text-sm">Description <span className="text-red-500">*</span></label>
          <textarea
            name="description"
            placeholder="Enter a comprehensive description (max 500 characters) outlining features, benefits, specifications, and any unique selling points."
            maxLength={500}
            className={`${inputClasses} h-32 resize-y`}
            value={formData.description || ""}
            onChange={handleInputChange}
            required
            aria-required="true"
          />
          <p className="text-sm text-gray-500 text-right">
            {(formData.description || "").length}/500 characters
          </p>
        </div>
      </section>

      {/* --- Conditional Sections based on Category --- */}

      {categoryDisplayName === "Books" && (
        <section className="space-y-4 p-5 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">Book Metadata</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["author", "publisher", "isbn"].map((field) => (
              <div className="space-y-2" key={field}>
                <label className="block text-gray-700 text-sm font-medium capitalize">
                  {field.replace(/([A-Z])/g, " $1")}
                </label>
                <input
                  type="text"
                  name={field}
                  placeholder={`Enter book ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`}
                  className={inputClasses}
                  value={typeof formData[field as keyof ProductForm] === "string" ? formData[field as keyof ProductForm] as string : ""}
                  onChange={handleInputChange}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {["Clothing", "Fashion"].includes(categoryDisplayName) && (
        <section className="space-y-4 p-5 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">Clothing Details</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="block text-gray-700 text-sm font-medium">Fabric Composition</label>
              <input
                type="text"
                name="fabricComposition"
                className={inputClasses}
                value={formData.fabricComposition || ""}
                onChange={handleInputChange}
                placeholder="e.g., 100% Cotton, 60% Polyester 40% Viscose"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-gray-700 text-sm font-medium">Care Instructions</label>
              <textarea
                name="careInstructions"
                className={`${inputClasses} h-24 resize-y`}
                value={formData.careInstructions || ""}
                onChange={handleInputChange}
                placeholder="e.g., Machine wash cold, Tumble dry low, Do not bleach. Refer to garment tag."
              />
            </div>
          </div>
        </section>
      )}

      {categoryDisplayName === "Home Appliances" && (
        <section className="space-y-4 p-5 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">Appliance Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["energyRating", "warrantyPeriod", "dimensions"].map((field) => (
              <div className="space-y-2" key={field}>
                <label className="block text-gray-700 text-sm font-medium capitalize">
                  {field.replace(/([A-Z])/g, " $1")}
                </label>
                <input
                  type="text"
                  name={field}
                  className={inputClasses}
                  value={typeof formData[field as keyof ProductForm] === "string" ? formData[field as keyof ProductForm] as string : ""}
                  // value={formData[field as keyof ProductForm] || ""}
                  onChange={handleInputChange}
                  placeholder={`Enter ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {["Beauty Products", "Skincare", "Haircare"].includes(categoryDisplayName) && (
        <section className="space-y-4 p-5 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">Beauty Product Details</h3>
          <div className="space-y-3">
            {["ingredients", "usageInstructions"].map((field) => (
              <div className="space-y-2" key={field}>
                <label className="block text-gray-700 text-sm font-medium capitalize">
                  {field.replace(/([A-Z])/g, " $1")}
                </label>
                <textarea
                  name={field}
                  className={`${inputClasses} h-24 resize-y`}
                  value={typeof formData[field as keyof ProductForm] === "string" ? formData[field as keyof ProductForm] as string : ""}
                  // value={formData[field as keyof ProductForm] || ""}
                  onChange={handleInputChange}
                  placeholder={`Enter product ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`}
                />
              </div>
            ))}
            <div className="space-y-2">
              <label className="block text-gray-700 text-sm font-medium">Expiration Date</label>
              <input
                type="date"
                name="expirationDate"
                className={inputClasses}
                value={formData.expirationDate || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </section>
      )}

      {isDigital && (
        <section className="space-y-4 p-5 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">Digital Product Options</h3>
          <div className="flex items-center space-x-3 py-2"> {/* Added vertical padding */}
            <input
              id="autoDeliver"
              name="autoDeliver"
              type="checkbox"
              checked={formData.autoDeliver || false}
              onChange={handleInputChange}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" // Larger, more prominent checkbox
            />
            <label htmlFor="autoDeliver" className="text-gray-700 text-base font-medium cursor-pointer">
              Auto-deliver digital product upon purchase
            </label>
          </div>
          <p className="text-sm text-gray-500">
            If checked, the digital product will be automatically delivered to the customer after a successful purchase.
          </p>
        </section>
      )}

      {isTravel && (
        <section className="space-y-4 p-5 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">Travel Specifics</h3>
          <div className="space-y-2">
            <label className="block text-gray-700 text-sm font-medium">
              {subCategoryName === "Flight Tickets"
                ? "Seat Class (e.g., Economy, Business, First)"
                : subCategoryName === "Hotel Bookings"
                ? "Room Type (e.g., Standard, Deluxe, Suite)"
                : "Package Details (e.g., 7-day all-inclusive, Weekend getaway)"}
            </label>
            <input
              type="text"
              name="travelDetail"
              className={inputClasses}
              value={formData.travelDetail || ""}
              onChange={handleInputChange}
              placeholder="Enter relevant travel detail for this booking or package"
            />
          </div>
        </section>
      )}

      {isPhysical && (
        <section className="space-y-4 p-5 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">Product Specifications</h3>
          <div className="space-y-2">
            <label className="block text-gray-700 text-sm font-medium">Model / SKU</label>
            <input
              type="text"
              name="model"
              className={inputClasses}
              value={formData.model || ""}
              onChange={handleInputChange}
              placeholder="e.g., XYZ-123, Pro-Max 2000, PN: 987654"
            />
            <p className="text-sm text-gray-500">
              A unique identifier for your product, helpful for inventory management.
            </p>
          </div>
        </section>
      )}

       {isPhysical && (
        <section className="space-y-4 p-5 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4"></h3>
          <div className="space-y-2">
            <label className="block text-gray-700 text-sm font-medium">Bathrooms</label>
            <input
              type="number"
              name="bathrooms"
              className={inputClasses}
              value={formData.bathrooms || ""}
              onChange={handleInputChange}
              placeholder="4"
            />
            <p className="text-sm text-gray-500">
             How Many bathrooms are there?
            </p>
          </div>
        </section>
      )}

      {/* --- Tags Section (Using the improved TagInput component) --- */}
      <section className="space-y-2 p-5 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
        <TagInput
          label="Product Tags"
          placeholder="Add keywords like 'new', 'sale', 'popular', 'electronics', 'outdoor'"
          tags={formData.tags || []} // Ensure tags is always an array
          onTagsChange={handleTagsChange}
          inputClasses={inputClasses} // Pass the consistent input styling
        />
        <p className="mt-1 text-sm text-gray-500">
          Tags help customers find your product through search and improve categorization.
        </p>
      </section>
    </div>
  );
};

export default ProductDetails;