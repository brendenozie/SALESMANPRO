'use client'; // For Next.js App Router

import React, { useCallback } from "react";
import InputField from "./InputField"; // Assuming InputField is a generic component for text/number inputs
import CommissionSection from "./CommissionSection"; // Assuming CommissionSection is a component for commission settings
// import { ProductForm } from "./AddProductModal";
import { ProductForm } from '@/types/typings'; // Assuming ProductForm is the comprehensive type for your main form data

interface GeneralDetailsProps {
  formData: ProductForm; // Use the comprehensive form type for better type safety
  updateField: (field: string, value: any) => void; // Renamed from setFormData
}

const GeneralDetails: React.FC<GeneralDetailsProps> = ({ formData, updateField }) => {

  // Centralized change handler using updateField
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type, checked } = e.target as HTMLInputElement; // Type assertion for checked property
      
      if (type === "checkbox") {
        updateField(name, checked);
      } else {
        updateField(name, type === "number" ? parseFloat(value) || "" : value);
      }
    },
    [updateField] // Dependency on updateField ensures memoization works correctly
  );

  // Common Tailwind CSS classes
  const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm";
  const selectClasses = inputClasses; // Reusing inputClasses for select for consistency
  const textareaClasses = `${inputClasses} h-28 resize-y`; // Added resize-y for vertical resizing, default height

  return (
    <section className="p-6 bg-white rounded-2xl shadow-xl border border-gray-200 space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">General Product Information ⚙️</h2>
      
      {/* ── Basic Info Section ── */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-5 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-700">Essential Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {([
            { label: "Make/Manufacturer", name: "make", required: true, placeholder: "e.g., Toyota, Samsung, Nike" },
            { label: "Model Name", name: "model", required: true, placeholder: "e.g., Camry, Galaxy S24, Air Max 90" },
            { label: "Manufacture Year", name: "year", type: "number", required: true, placeholder: "e.g., 2023" },
            { label: "Trim/Edition (Optional)", name: "trim", placeholder: "e.g., SE, Pro, Limited Edition" },
            { label: "Product Type", name: "type", required: true, placeholder: "e.g., SUV, Smartphone, T-shirt" },
            { label: "Color", name: "color", placeholder: "e.g., Black, Space Gray, Navy Blue" },
            { label: "Mileage (km) (For Vehicles)", name: "mileage", type: "number", placeholder: "e.g., 50000" },
            // Add more fields if needed, e.g., 'SKU', 'UPC'
          ] as Array<{
            label: string;
            name: string;
            type?: string;
            required?: boolean;
            placeholder?: string;
          }>).map(({ label, name, type = "text", required, placeholder }) => (
            
            <InputField
              key={name}
              label={label}
              name={name}
              type={type}
              value={formData[name as keyof ProductForm] ?? ""} // Use type assertion for safe access
              handleInputChange={handleChange} // Pass the internal handleChange to InputField
              required={required}
              placeholder={placeholder}
              className={inputClasses} // Pass the common input styles
            />
            
          ))}
        </div>
      </div>

      {/* ── Condition & Description Section ── */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-5 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-700">Condition & Detailed Description</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
              Condition <span className="text-red-500">*</span>
            </label>
            <select
              id="condition"
              name="condition"
              value={formData.condition ?? ""}
              onChange={handleChange}
              className={selectClasses}
              required
            >
              <option value="" disabled>Select product condition</option>
              <option value="New">New (Unused, original packaging)</option>
              <option value="Used - Like New">Used - Like New (Minimal signs of wear)</option>
              <option value="Used - Very Good">Used - Very Good (Minor cosmetic imperfections)</option>
              <option value="Used - Good">Used - Good (Visible wear, fully functional)</option>
              <option value="Used - Acceptable">Used - Acceptable (Significant wear, functional)</option>
              <option value="Certified Pre-Owned">Certified Pre-Owned (Manufacturer/dealer certified)</option>
              <option value="Refurbished">Refurbished (Professionally restored to working order)</option>
            </select>
          </div>
          <div className="md:col-span-2"> {/* Make description span full width on medium screens */}
            <label htmlFor="longDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Detailed Description / Specifications
            </label>
            <textarea
              id="longDescription"
              name="longDescription"
              rows={5} // Increased rows for more space
              value={formData.longDescription ?? ""}
              onChange={handleChange}
              placeholder="Provide a comprehensive description including features, benefits, usage, and any specific specifications (e.g., engine size, battery life, material details)."
              className={`${textareaClasses} h-36`} // Adjusted height for more text
            />
            <p className="text-xs text-gray-500 mt-1">
              Highlight unique selling points and include all relevant details.
            </p>
          </div>
        </div>
      </div>

      {/* ── Material & Size Section ── */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-5 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-700">Physical Attributes (Material, Size, Weight)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-1">
              Material(s)
            </label>
            <input
              id="material"
              name="material"
              type="text"
              value={formData.material ?? ""}
              onChange={handleChange}
              placeholder="e.g., Aluminum, Leather, Cotton, Plastic"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
              Weight (kg)
            </label>
            <input
              id="weight"
              name="weight"
              type="number"
              value={formData.weight ?? ""}
              onChange={handleChange}
              placeholder="e.g., 1.5 (for 1.5 kg)"
              className={inputClasses}
              step="0.01" // Allow decimal values for weight
              min="0"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700 mb-1">
              Dimensions (L x W x H in cm)
            </label>
            <input
              id="dimensions"
              name="dimensions"
              type="text"
              value={formData.dimensions ?? ""}
              onChange={handleChange}
              placeholder="e.g., 10x5x2 cm, 50x30x20 cm"
              className={inputClasses}
            />
            <p className="text-xs text-gray-500 mt-1">
              Use 'x' to separate length, width, and height. Specify units (e.g., cm, inches).
            </p>
          </div>
        </div>
      </div>

      {/* ── Commission & Pricing Section ── */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-5 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-700">Commission & Pricing Settings 💰</h3>
        {/* CommissionSection will handle its own inputs and update using the provided handleChange */}
        <CommissionSection formData={formData} handleChange={handleChange} />
      </div>
    </section>
  );
};

export default GeneralDetails;