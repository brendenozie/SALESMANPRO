import { XMarkIcon } from "@heroicons/react/24/outline";
import React, { useCallback, useState } from "react";


// -----------------------------------------------------------------------------
// NEW: TagInput Component
// -----------------------------------------------------------------------------
interface TagInputProps {
  label: string;
  placeholder: string;
  tags: string[];
  onTagsChange: (newTags: string[]) => void;
  inputClasses?: string; // For Tailwind classes to match form styling
}

const TagInput: React.FC<TagInputProps> = ({
  label,
  placeholder,
  tags,
  onTagsChange,
  inputClasses = "w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault(); // Prevent form submission or comma from appearing in input
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
    <section className="space-y-2">
      <label className="block text-gray-300 font-medium text-sm">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags && tags.map((tag, index) => (
          <span
            key={index}
            className="flex items-center bg-indigo-600 text-white text-sm px-3 py-1 rounded-full shadow-md transition-all duration-200 hover:bg-indigo-700"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="ml-2 text-white hover:text-gray-200 focus:outline-none"
              aria-label={`Remove tag ${tag}`}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </span>
        ))}
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
      <p className="text-xs text-gray-400 mt-1">Type a tag and press Enter or comma to add.</p>
    </section>
  );
};


interface ProductDetailsProps {
  formData: any;
  setFormData: (name: string, value: any) => void;
  filteredSubCategories: string[];
  filteredBrands: string[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  formData,
  setFormData,
  filteredSubCategories,
  filteredBrands,
  handleInputChange,
}) => {
  const subCat: any = formData.subCategory || {};
  const subCategoryName: string = formData.subCategoryName || "";

  const isService = [
    "Cleaning", "Plumbing", "Electrical", "Landscaping", "Catering", "Transportation",
    "IT Services", "Beauty Services", "Tutoring", "Event Planning", "Landscaping"
  ].includes(subCategoryName || subCat.name);

  const isDigital = [
    "Software Licenses", "E-books", "Online Courses", "Streaming Subscriptions", "Mobile App Credits"
  ].includes(subCategoryName || subCat.name);

  const isTravel = [
    "Flight Tickets", "Hotel Bookings", "Tour Packages", "Event Tickets", "Travel Insurance"
  ].includes(subCategoryName || subCat.name);

  const isPhysical = !isService && !isDigital && !isTravel;

  const headerLabel = (() => {
    const cat = formData.category?.name || "";
    if (cat === "Books") return "Book Details";
    if (["Clothing", "Fashion"].includes(cat)) return "Clothing Details";
    if (cat === "Home Appliances") return "Appliance Details";
    if (["Beauty Products", "Skincare", "Haircare"].includes(cat)) return "Beauty Product Details";
    return "Product Details";
  })();

  const primaryLabel = formData.category?.name === "Books" ? "Book Title" : "Product Title";

  const inputClasses = "mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";
  
  // NEW: Tag input handler
    const handleTagsChange = useCallback(
      (newTags: string[]) => {
        setFormData('tags', newTags);
      },
      [setFormData]
    );

  return (
    <div className="mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-200 space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">{headerLabel}</h2>

      <section className="space-y-2">
        <label className="block text-gray-600 font-medium">
          {isService ? "Service Title" : isDigital ? "Product Title" : isTravel ? "Experience Title" : primaryLabel}
        </label>
        <input
          type="text"
          name="name"
          placeholder={
            isService
              ? "e.g. House Cleaning"
              : isDigital
              ? "e.g. Photoshop License"
              : isTravel
              ? "e.g. Nairobi to Paris Return Ticket"
              : "e.g. Wireless Headphones"
          }
          className={inputClasses}
          value={formData.name || ""}
          onChange={handleInputChange}
        />
      </section>

      <section className="space-y-2">
        <label className="block text-gray-600 font-medium">Description</label>
        <textarea
          name="description"
          placeholder="Enter a brief description (max 500 characters)"
          maxLength={500}
          className={`${inputClasses} h-28 resize-none`}
          value={formData.description || ""}
          onChange={handleInputChange}
        />
        <p className="text-sm text-gray-500">{(formData.description || "").length}/500 characters</p>
      </section>

      {formData.category?.name === "Books" && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Book Metadata</h3>
          <div className="space-y-3">
            {["author", "publisher", "isbn"].map((field) => (
              <div className="space-y-1" key={field}>
                <label className="block text-gray-600 text-sm capitalize">{field}</label>
                <input
                  type="text"
                  name={field}
                  placeholder={`Enter ${field}`}
                  className={inputClasses}
                  value={formData[field] || ""}
                  onChange={handleInputChange}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {["Clothing", "Fashion"].includes(formData.category?.name) && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Clothing Details</h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-gray-600 text-sm">Fabric Composition</label>
              <input
                type="text"
                name="fabricComposition"
                className={inputClasses}
                value={formData.fabricComposition || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-gray-600 text-sm">Care Instructions</label>
              <textarea
                name="careInstructions"
                className={`${inputClasses} h-20 resize-none`}
                value={formData.careInstructions || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </section>
      )}

      {formData.category?.name === "Home Appliances" && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Appliance Details</h3>
          {["energyRating", "warrantyPeriod", "dimensions"].map((field) => (
            <div className="space-y-1" key={field}>
              <label className="block text-gray-600 text-sm capitalize">{field.replace(/([A-Z])/g, " $1")}</label>
              <input
                type="text"
                name={field}
                className={inputClasses}
                value={formData[field] || ""}
                onChange={handleInputChange}
              />
            </div>
          ))}
        </section>
      )}

      {["Beauty Products", "Skincare", "Haircare"].includes(formData.category?.name) && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Beauty Product Details</h3>
          {["ingredients", "usageInstructions"].map((field) => (
            <div className="space-y-1" key={field}>
              <label className="block text-gray-600 text-sm capitalize">{field.replace(/([A-Z])/g, " $1")}</label>
              <textarea
                name={field}
                className={`${inputClasses} h-20 resize-none`}
                value={formData[field] || ""}
                onChange={handleInputChange}
              />
            </div>
          ))}
          <div className="space-y-1">
            <label className="block text-gray-600 text-sm">Expiration Date</label>
            <input
              type="date"
              name="expirationDate"
              className={inputClasses}
              value={formData.expirationDate || ""}
              onChange={handleInputChange}
            />
          </div>
        </section>
      )}

      {isDigital && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Digital Product Details</h3>
          <div className="flex items-center space-x-2">
            <input
              id="autoDeliver"
              name="autoDeliver"
              type="checkbox"
              checked={formData.autoDeliver || false}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="autoDeliver" className="text-gray-600 text-sm">
              Auto‐deliver upon purchase
            </label>
          </div>
        </section>
      )}

      {isTravel && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Travel Details</h3>
          <div className="space-y-1">
            <label className="block text-gray-600 text-sm">
              {subCat === "Flight Tickets"
                ? "Seat Class"
                : subCat === "Hotel Bookings"
                ? "Room Type"
                : "Package Details"}
            </label>
            <input
              type="text"
              name="travelDetail"
              className={inputClasses}
              value={formData.travelDetail || ""}
              onChange={handleInputChange}
            />
          </div>
        </section>
      )}

      {isPhysical && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Product Specifications</h3>
          <div className="space-y-1">
            <label className="block text-gray-600 text-sm">Model / SKU</label>
            <input
              type="text"
              name="model"
              className={inputClasses}
              value={formData.model || ""}
              onChange={handleInputChange}
            />
          </div>
        </section>
      )}

      <section className="space-y-2">
        <TagInput
          label="Product Tags"
          placeholder="e.g. new, sale, popular"
          tags={formData.tags}
          onTagsChange={handleTagsChange}
          inputClasses="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </section>
    </div>
  );
};

export default ProductDetails;


//Newer piece of code to be reviewed
// 'use client'; // For Next.js App Router

// import React from "react";
// import { ProductForm } from "./AddProductModal";
// // import { ProductForm } from '@/types/typings'; // Assuming ProductForm is the comprehensive type

// interface ProductDetailsProps {
//   formData: ProductForm; // Use the actual comprehensive form type
//   setFormData: (name: string, value: any) => void; // Renamed from setFormData to match parent
//   filteredSubCategories: string[]; // Keep if still needed, otherwise remove
//   filteredBrands: string[]; // Keep if still needed, otherwise remove
//   handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
// }

// const ProductDetails: React.FC<ProductDetailsProps> = ({
//   formData,
//   setFormData, // Renamed from setFormData
//   // filteredSubCategories, // Removed if not directly used in this component
//   // filteredBrands,       // Removed if not directly used in this component
//   handleInputChange,
// }) => {
//   // Use subCategoryName directly from formData for consistency
//   const subCategoryName: string = formData.subCategoryName || "";

//   // Determine product types based on subCategoryName
//   const isService = [
//     "Cleaning", "Plumbing", "Electrical", "Landscaping", "Catering", "Transportation",
//     "IT Services", "Beauty Services", "Tutoring", "Event Planning" // Removed duplicate Landscaping
//   ].includes(subCategoryName);

//   const isDigital = [
//     "Software Licenses", "E-books", "Online Courses", "Streaming Subscriptions", "Mobile App Credits"
//   ].includes(subCategoryName);

//   const isTravel = [
//     "Flight Tickets", "Hotel Bookings", "Tour Packages", "Event Tickets", "Travel Insurance"
//   ].includes(subCategoryName);

//   const isPhysical = !isService && !isDigital && !isTravel;

//   // Dynamic header label based on main category
//   const headerLabel = (() => {
//     const cat = formData.category?.displayName || ""; // Use displayName for category name
//     if (cat === "Books") return "Book Details";
//     if (["Clothing", "Fashion"].includes(cat)) return "Clothing Details";
//     if (cat === "Home Appliances") return "Appliance Details";
//     if (["Beauty Products", "Skincare", "Haircare"].includes(cat)) return "Beauty Product Details";
//     // For services, digital, travel, use a more specific header
//     if (isService) return "Service Details";
//     if (isDigital) return "Digital Product Details";
//     if (isTravel) return "Travel Experience Details";
//     return "Product Details";
//   })();

//   // Dynamic primary input label
//   const primaryLabel = isService
//     ? "Service Title"
//     : isDigital
//     ? "Product Title"
//     : isTravel
//     ? "Experience Title"
//     : formData.category?.displayName === "Books" // Use displayName
//     ? "Book Title"
//     : "Product Title";

//   const inputClasses =
//     "mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"; // Added shadow-sm for consistency

//   return (
//     <div className="mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-200 space-y-8">
//       <h2 className="text-2xl font-bold text-gray-800">{headerLabel}</h2>

//       <section className="space-y-2">
//         <label className="block text-gray-700 font-medium text-sm"> {/* Adjusted label styling */}
//           {primaryLabel}
//         </label>
//         <input
//           type="text"
//           name="name"
//           placeholder={
//             isService
//               ? "e.g. House Cleaning Service"
//               : isDigital
//               ? "e.g. Photoshop License Key"
//               : isTravel
//               ? "e.g. Nairobi to Paris Return Ticket"
//               : "e.g. Wireless Noise-Cancelling Headphones"
//           }
//           className={inputClasses}
//           value={formData.name || ""}
//           onChange={handleInputChange}
//         />
//       </section>

//       <section className="space-y-2">
//         <label className="block text-gray-700 font-medium text-sm">Description</label>
//         <textarea
//           name="description"
//           placeholder="Enter a brief description (max 500 characters) outlining features, benefits, and key information."
//           maxLength={500}
//           className={`${inputClasses} h-28 resize-y`} {/* Changed resize-none to resize-y */}
//           value={formData.description || ""}
//           onChange={handleInputChange}
//         />
//         <p className="text-sm text-gray-500 text-right">
//           {(formData.description || "").length}/500 characters
//         </p>
//       </section>

//       {/* Conditional Sections based on Category */}

//       {/* Books Details */}
//       {formData.category?.displayName === "Books" && (
//         <section className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50"> {/* Added section styling */}
//           <h3 className="text-lg font-semibold text-gray-700">Book Metadata</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Grid layout for book fields */}
//             {["author", "publisher", "isbn"].map((field) => (
//               <div className="space-y-1" key={field}>
//                 <label className="block text-gray-700 text-sm font-medium capitalize">
//                   {field.replace(/([A-Z])/g, " $1")} {/* Capitalize and add space */}
//                 </label>
//                 <input
//                   type="text"
//                   name={field}
//                   placeholder={`Enter ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`}
//                   className={inputClasses}
//                   value={formData[field] || ""}
//                   onChange={handleInputChange}
//                 />
//               </div>
//             ))}
//           </div>
//         </section>
//       )}

//       {/* Clothing/Fashion Details */}
//       {["Clothing", "Fashion"].includes(formData.category?.displayName) && (
//         <section className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
//           <h3 className="text-lg font-semibold text-gray-700">Clothing Details</h3>
//           <div className="space-y-3">
//             <div className="space-y-1">
//               <label className="block text-gray-700 text-sm font-medium">Fabric Composition</label>
//               <input
//                 type="text"
//                 name="fabricComposition"
//                 className={inputClasses}
//                 value={formData.fabricComposition || ""}
//                 onChange={handleInputChange}
//                 placeholder="e.g., 100% Cotton, 60% Polyester 40% Viscose"
//               />
//             </div>
//             <div className="space-y-1">
//               <label className="block text-gray-700 text-sm font-medium">Care Instructions</label>
//               <textarea
//                 name="careInstructions"
//                 className={`${inputClasses} h-20 resize-y`}
//                 value={formData.careInstructions || ""}
//                 onChange={handleInputChange}
//                 placeholder="e.g., Machine wash cold, Tumble dry low, Do not bleach"
//               />
//             </div>
//           </div>
//         </section>
//       )}

//       {/* Home Appliances Details */}
//       {formData.category?.displayName === "Home Appliances" && (
//         <section className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
//           <h3 className="text-lg font-semibold text-gray-700">Appliance Details</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {["energyRating", "warrantyPeriod", "dimensions"].map((field) => (
//               <div className="space-y-1" key={field}>
//                 <label className="block text-gray-700 text-sm font-medium capitalize">
//                   {field.replace(/([A-Z])/g, " $1")}
//                 </label>
//                 <input
//                   type="text"
//                   name={field}
//                   className={inputClasses}
//                   value={formData[field] || ""}
//                   onChange={handleInputChange}
//                   placeholder={`Enter ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`}
//                 />
//               </div>
//             ))}
//           </div>
//         </section>
//       )}

//       {/* Beauty Products Details */}
//       {["Beauty Products", "Skincare", "Haircare"].includes(formData.category?.displayName) && (
//         <section className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
//           <h3 className="text-lg font-semibold text-gray-700">Beauty Product Details</h3>
//           <div className="space-y-3">
//             {["ingredients", "usageInstructions"].map((field) => (
//               <div className="space-y-1" key={field}>
//                 <label className="block text-gray-700 text-sm font-medium capitalize">
//                   {field.replace(/([A-Z])/g, " $1")}
//                 </label>
//                 <textarea
//                   name={field}
//                   className={`${inputClasses} h-20 resize-y`}
//                   value={formData[field] || ""}
//                   onChange={handleInputChange}
//                   placeholder={`Enter ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`}
//                 />
//               </div>
//             ))}
//             <div className="space-y-1">
//               <label className="block text-gray-700 text-sm font-medium">Expiration Date</label>
//               <input
//                 type="date"
//                 name="expirationDate"
//                 className={inputClasses}
//                 value={formData.expirationDate || ""}
//                 onChange={handleInputChange}
//               />
//             </div>
//           </div>
//         </section>
//       )}

//       {/* Digital Product Details */}
//       {isDigital && (
//         <section className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
//           <h3 className="text-lg font-semibold text-gray-700">Digital Product Options</h3>
//           <div className="flex items-center space-x-2">
//             <input
//               id="autoDeliver"
//               name="autoDeliver"
//               type="checkbox"
//               checked={formData.autoDeliver || false}
//               onChange={handleInputChange}
//               className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//             />
//             <label htmlFor="autoDeliver" className="text-gray-700 text-sm font-medium">
//               Auto-deliver digital product upon purchase
//             </label>
//           </div>
//         </section>
//       )}

//       {/* Travel Details */}
//       {isTravel && (
//         <section className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
//           <h3 className="text-lg font-semibold text-gray-700">Travel Specifics</h3>
//           <div className="space-y-1">
//             <label className="block text-gray-700 text-sm font-medium">
//               {subCategoryName === "Flight Tickets"
//                 ? "Seat Class (e.g., Economy, Business, First)"
//                 : subCategoryName === "Hotel Bookings"
//                 ? "Room Type (e.g., Standard, Deluxe, Suite)"
//                 : "Package Details (e.g., 7-day all-inclusive, Weekend getaway)"}
//             </label>
//             <input
//               type="text"
//               name="travelDetail"
//               className={inputClasses}
//               value={formData.travelDetail || ""}
//               onChange={handleInputChange}
//               placeholder="Enter relevant travel detail"
//             />
//           </div>
//         </section>
//       )}

//       {/* Physical Product Specifications (if not service, digital, or travel) */}
//       {isPhysical && (
//         <section className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
//           <h3 className="text-lg font-semibold text-gray-700">Product Specifications</h3>
//           <div className="space-y-1">
//             <label className="block text-gray-700 text-sm font-medium">Model / SKU</label>
//             <input
//               type="text"
//               name="model"
//               className={inputClasses}
//               value={formData.model || ""}
//               onChange={handleInputChange}
//               placeholder="e.g., XYZ-123, Pro-Max 2000"
//             />
//           </div>
//         </section>
//       )}

//       {/* Tags Section */}
//       <section className="space-y-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
//         <label className="block text-gray-700 font-medium text-sm">
//           Tags (comma-separated keywords)
//         </label>
//         <input
//           type="text"
//           name="tags"
//           placeholder="e.g., new, sale, popular, electronics, outdoor"
//           className={inputClasses}
//           value={Array.isArray(formData.tags) ? formData.tags.join(", ") : ""}
//           onChange={(e) => {
//             const tags = e.target.value
//               .split(",")
//               .map((t) => t.trim())
//               .filter(Boolean);
//             setFormData("tags", tags); // Changed to updateField
//           }}
//         />
//         <p className="mt-1 text-xs text-gray-500">
//           Add keywords that describe your product. These help with search and categorization.
//         </p>
//       </section>
//     </div>
//   );
// };

// export default ProductDetails;