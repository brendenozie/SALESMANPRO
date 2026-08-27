'use client'; // For Next.js App Router

import React, { useCallback } from "react";
// import InputField from "./InputField"; // Assuming InputField is a generic component for text/number inputs
// import CommissionSection from "./CommissionSection"; // Assuming CommissionSection is a component for commission settings
// import { ProductForm } from "./AddProductModal";
import { ProductForm } from '@/types/typings'; // Assuming ProductForm is the comprehensive type for your main form data

// Assuming InputField is a generic component for text/number inputs
// Assuming CommissionSection is a component for commission settings
// Assuming ProductForm is the comprehensive type for your main form data

// Mocking InputField and CommissionSection for a self-contained example
// In your actual project, these would be imported from their respective files.

// Mock ProductForm type for demonstration
// interface ProductForm {
  
// }

// Mock InputField Component
interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode; // Added for visual appeal
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type = "text",
  value,
  handleInputChange,
  required,
  placeholder,
  className,
  icon,
}) => (
  <div className="relative group"> {/* Added group for hover effects */}
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
      {icon && <span className="mr-2 text-blue-500">{icon}</span>} {/* Icon next to label */}
      {label} {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={handleInputChange}
      placeholder={placeholder}
      required={required}
      className={`${className} transition-all duration-300 ease-in-out group-hover:border-blue-400 group-focus-within:border-blue-500 group-focus-within:ring-2 group-focus-within:ring-blue-200`}
    />
  </div>
);

// Mock CommissionSection Component
interface CommissionSectionProps {
  formData: ProductForm;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const CommissionSection: React.FC<CommissionSectionProps> = ({ formData, handleInputChange }) => {
  const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* <InputField
        label="Commission Rate (%)"
        name="commissionRate"
        type="number"
        value={formData.commissionRate ?? ""}
        handleInputChange={handleChange}
        required
        placeholder="e.g., 10 (for 10%)"
        className={inputClasses}
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
      /> */}
      <div className="md:col-span-2 flex items-center mt-2">
        <input
          id="isFeatured"
          name="isFeatured"
          type="checkbox"
          checked={formData.isFeatured ?? false}
          onChange={handleInputChange}
          className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
        />
        <label htmlFor="isFeatured" className="ml-2 block text-sm font-medium text-gray-700">
          Feature this product on homepage
        </label>
      </div>
    </div>
  );
};


interface GeneralDetailsProps {
  formData: ProductForm; // Use the comprehensive form type for better type safety
  // updateField: (field: string, value: any) => void; // Renamed from setFormData
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;

}

const GeneralDetails: React.FC<GeneralDetailsProps> = ({ formData, handleInputChange }) => {

  // Centralized change handler using updateField
  // const handleChange = useCallback(
  //   (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  //     const { name, value, type, checked } = e.target as HTMLInputElement; // Type assertion for checked property

  //     if (type === "checkbox") {
  //       updateField(name, checked);
  //     } else {
  //       updateField(name, type === "number" ? parseFloat(value) || "" : value);
  //     }
  //   },
  //   [updateField] // Dependency on updateField ensures memoization works correctly
  // );

  // Common Tailwind CSS classes for consistent styling
  const baseInputClasses = "mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-300 shadow-sm transition-all duration-200 ease-in-out text-gray-800 placeholder-gray-400";
  const selectClasses = `${baseInputClasses} appearance-none bg-white pr-8`; // Added appearance-none for custom arrow
  const textareaClasses = `${baseInputClasses} h-36 resize-y`; // Adjusted default height for textarea

  return (
    <section className="p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl shadow-2xl border border-blue-200 space-y-10 font-inter">
      <h2 className="text-3xl font-extrabold text-blue-800 mb-6 flex items-center justify-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        General Product Information
      </h2>

      {/* ── Basic Info Section ── */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 space-y-6 transform transition-transform duration-300 hover:scale-[1.005]">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
          Essential Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {([
            { label: "Make/Manufacturer", name: "make", required: true, placeholder: "e.g., Toyota, Samsung, Nike", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
            { label: "Model Name", name: "model", required: true, placeholder: "e.g., Camry, Galaxy S24, Air Max 90", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h10M7 16h10M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            { label: "Manufacture Year", name: "year", type: "number", required: true, placeholder: "e.g., 2023", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
            { label: "Trim/Edition (Optional)", name: "trim", placeholder: "e.g., SE, Pro, Limited Edition", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> },
            { label: "Product Type", name: "type", required: true, placeholder: "e.g., SUV, Smartphone, T-shirt", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg> },
            { label: "Color", name: "color", placeholder: "e.g., Black, Space Gray, Navy Blue", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v12a4 4 0 004 4h.01M17 16V9a2 2 0 00-2-2h-4" /></svg> },
            { label: "Mileage (km) (For Vehicles)", name: "mileage", type: "number", placeholder: "e.g., 50000", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0h7m-7 0h-1v-9a2 2 0 012-2h2a2 2 0 012 2v9m-4 0h4m-4 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-9-9h.01M7 11H5a2 2 0 00-2 2v6a2 2 0 002 2h2" /></svg> },
          ] as Array<{
            label: string;
            name: string;
            type?: string;
            required?: boolean;
            placeholder?: string;
            icon?: React.ReactNode;
          }>).map(({ label, name, type = "text", required, placeholder, icon }) => (

            <InputField
              key={name}
              label={label}
              name={name}
              type={type}
              value={
                typeof formData[name as keyof ProductForm] === "boolean"
                  ? ""
                  : (formData[name as keyof ProductForm] as string | number) ?? ""
              }
              handleInputChange={handleInputChange}
              required={required}
              placeholder={placeholder}
              className={baseInputClasses} // Pass the common input styles
              icon={icon}
            />

          ))}
        </div>
      </div>

      {/* ── Condition & Description Section ── */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 space-y-6 transform transition-transform duration-300 hover:scale-[1.005]">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.007 12.007 0 002.928 12c.792 3.404 2.587 6.38 4.971 8.243a12.007 12.007 0 0014.102-14.102M12 21.072a11.95 11.95 0 01-5.618-1.516" /></svg>
          Condition & Detailed Description
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative"> {/* Added relative for custom arrow */}
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <span className="mr-2 text-blue-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.007 12.007 0 002.928 12c.792 3.404 2.587 6.38 4.971 8.243a12.007 12.007 0 0014.102-14.102M12 21.072a11.95 11.95 0 01-5.618-1.516" /></svg></span>
              Condition <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              id="condition"
              name="condition"
              value={formData.condition ?? ""}
              onChange={handleInputChange}
              className={`${selectClasses} transition-all duration-300 ease-in-out hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
              required
            >
              <option value="" disabled>Select product condition</option>
              <option value="New">✨ New (Unused, original packaging)</option>
              <option value="Used - Like New">🌟 Used - Like New (Minimal signs of wear)</option>
              <option value="Used - Very Good">👍 Used - Very Good (Minor cosmetic imperfections)</option>
              <option value="Used - Good">👌 Used - Good (Visible wear, fully functional)</option>
              <option value="Used - Acceptable">⚙️ Used - Acceptable (Significant wear, functional)</option>
              <option value="Certified Pre-Owned">✅ Certified Pre-Owned (Manufacturer/dealer certified)</option>
              <option value="Refurbished">♻️ Refurbished (Professionally restored to working order)</option>
            </select>
            {/* Custom arrow for select */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 mt-6">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z"/></svg>
            </div>
          </div>
          <div className="md:col-span-2"> {/* Make description span full width on medium screens */}
<<<<<<< HEAD
            <label htmlFor="longDescription" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <span className="mr-2 text-blue-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></span>
              Detailed Description / Specifications
            </label>
=======
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="longDescription" className="block text-sm font-medium text-gray-700 flex items-center">
                <span className="mr-2 text-blue-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></span>
                Detailed Description / Specifications
              </label>
              <button
                type="button"
                onClick={async () => {
                  const name = formData.name || formData.title;
                  if (!name) {
                    alert("Please enter a product name first");
                    return;
                  }
                  try {
                    const res = await fetch("/api/ai/product", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        action: "DESCRIPTION",
                        name,
                        category: formData.category,
                        brand: formData.brand,
                      }),
                    });
                    const data = await res.json();
                    if (data.success && data.data) {
                      const desc = data.data.longDescription || data.data.text || "";
                      const bullets = Array.isArray(data.data.bulletPoints) ? "\n\nKey Highlights:\n" + data.data.bulletPoints.join("\n") : "";
                      const combined = `${desc}${bullets}`;
                      handleInputChange({
                        target: { name: "longDescription", value: combined },
                      } as any);
                    }
                  } catch (e) {
                    console.error("AI Generation error", e);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm transition active:scale-95"
              >
                <span>✨ AI Write Description</span>
              </button>
            </div>
>>>>>>> c00ac535 (Fresh initialization and recovery)
            <textarea
              id="longDescription"
              name="longDescription"
              rows={5} // Increased rows for more space
              value={formData.longDescription ?? ""}
              onChange={handleInputChange}
              placeholder="Provide a comprehensive description including features, benefits, usage, and any specific specifications (e.g., engine size, battery life, material details)."
              className={`${textareaClasses} h-48`} // Adjusted height for more text
            />
            <p className="text-xs text-gray-500 mt-2 pl-1">
              💡 Highlight unique selling points and include all relevant details to attract buyers.
            </p>
          </div>
        </div>
      </div>

      {/* ── Commission & Pricing Section ── */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 space-y-6 transform transition-transform duration-300 hover:scale-[1.005]">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          {/* Commission & Pricing Settings */}
          Feature On Homepage
        </h3>
        {/* CommissionSection will handle its own inputs and update using the provided handleChange */}
        <CommissionSection formData={formData} handleInputChange={handleInputChange} />
      </div>
    </section>
  );
};

export default GeneralDetails;
