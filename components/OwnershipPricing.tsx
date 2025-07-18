'use client'; // For Next.js App Router

import React, { useCallback } from "react";
import InputField from "./InputField"; // Ensure this component accepts an 'onChange' prop
import { ProductForm } from "./AddProductModal";
// import { ProductForm } from '@/types/typings'; // Assuming ProductForm is the comprehensive type

interface OwnershipPricingProps {
  formData: ProductForm; // Use the comprehensive form type for better type safety
  setFormData: (name: string, value: any) => void; // Consolidated prop for updating form data
}

const OwnershipPricing: React.FC<OwnershipPricingProps> = ({ formData, setFormData }) => {

  // Common Tailwind CSS classes for inputs and selects
  const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm";
  const checkboxClasses = "h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500";

  // Centralized change handler for all inputs in this section
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type, checked } = e.target as HTMLInputElement; // Type assertion for 'checked'

      if (type === "checkbox") {
        setFormData(name, checked);
      } else {
        // Convert number inputs to actual numbers, otherwise keep as string
        setFormData(name, type === "number" ? parseFloat(value) || "" : value);
      }
    },
    [setFormData] // Dependency on updateField ensures memoization works correctly
  );

  return (
    <section className="p-6 bg-white rounded-2xl shadow-xl border border-gray-200 space-y-8">
      {/* ── Section Header ── */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Ownership & Pricing 💰</h2>
        <p className="text-gray-500 mt-1">
          Provide essential vehicle identification details and set your pricing preferences.
        </p>
      </div>

      {/* ── Vehicle Identification ── */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-5 border border-gray-100">
        <h4 className="text-xl font-semibold text-gray-700">Vehicle Identification Numbers</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Vehicle Identification Number (VIN)"
            name="vin"
            value={formData.vin ?? ""}
            handleInputChange={handleChange} //{/* Use the local handleChange */}
            placeholder="e.g., 1HGCM82633A004352"
            required
            className={inputClasses}
          />
          <div>
            <label htmlFor="logbookStatus" className="block text-sm font-medium text-gray-700 mb-1">
              Logbook Status <span className="text-red-500">*</span>
            </label>
            <select
              id="logbookStatus"
              name="logbookStatus"
              value={formData.logbookStatus ?? ""}
              onChange={handleChange} // {/* Use the local handleChange */}
              className={inputClasses}
              required
            >
              <option value="" disabled>
                — Select logbook status —
              </option>
              <option value="Available">Available (Present and validated)</option>
              <option value="Missing">Missing (Not available)</option>
              <option value="Pending">Pending (In process of acquisition/transfer)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Pricing Options ── */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-5 border border-gray-100">
        <h4 className="text-xl font-semibold text-gray-700">Set Your Price</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <InputField
            label="Asking Price" //{/* Updated currency to KSh */}
            name="finalPrice"
            type="number"
            value={formData.finalPrice ?? ""}
            handleInputChange={handleChange} //{/* Use the local handleChange */}
            placeholder="e.g., 1,500,000"
            required
            prefix={"(KSh)"}
            className={inputClasses}
            min="0" // Price cannot be negative
            step="1000" // Suggests common price increments
          />
          <div className="flex items-center mt-4 md:mt-0"> {/* Added wrapper div */}
            <input
              type="checkbox"
              id="negotiable" // Added id for better accessibility with label
              name="negotiable"
              checked={!!formData.negotiable} // Ensure boolean check
              onChange={handleChange} // {/* Use the local handleChange */}
              className={checkboxClasses}
            />
            <label htmlFor="negotiable" className="ml-2 text-sm text-gray-700 font-medium cursor-pointer">
              Price is Negotiable
            </label>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Set the price you are willing to sell for. Checking 'Price is Negotiable' allows buyers to offer a different amount.
        </p>
      </div>

      {/* ── Additional Sales Features ── */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-5 border border-gray-100">
        <h4 className="text-xl font-semibold text-gray-700">Sales & Ownership Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> {/* Adjusted grid layout */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="financingAvailable"
              name="financingAvailable"
              checked={!!formData.financingAvailable}
              onChange={handleChange}
              className={checkboxClasses}
            />
            <label htmlFor="financingAvailable" className="ml-2 text-sm text-gray-700 font-medium cursor-pointer">
              Financing Available
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="tradeIn"
              name="tradeIn"
              checked={!!formData.tradeIn}
              onChange={handleChange}
              className={checkboxClasses}
            />
            <label htmlFor="tradeIn" className="ml-2 text-sm text-gray-700 font-medium cursor-pointer">
              Trade-in Accepted
            </label>
          </div>

          <div>
            <label htmlFor="serviceHistory" className="block text-sm font-medium text-gray-700 mb-1">
              Service History <span className="text-red-500">*</span>
            </label>
            <select
              id="serviceHistory"
              name="serviceHistory"
              value={formData.serviceHistory ?? ""}
              onChange={handleChange} //{/* Use the local handleChange */}
              className={inputClasses}
              required
            >
              <option value="" disabled>
                — Select service history —
              </option>
              <option value="Full">Full (Comprehensive records)</option>
              <option value="Partial">Partial (Some records available)</option>
              <option value="None">None (No records available)</option>
            </select>
          </div>

          {/* New field: Number of previous owners */}
          <InputField
            label="Previous Owners"
            name="previousOwners"
            type="number"
            value={formData.previousOwners ?? ""}
            handleInputChange={handleChange}
            placeholder="e.g., 1"
            className={inputClasses}
            min="0"
            step="1"
          />

          {/* New field: Condition of tires */}
          <div>
            <label htmlFor="tireCondition" className="block text-sm font-medium text-gray-700 mb-1">
              Tire Condition
            </label>
            <select
              id="tireCondition"
              name="tireCondition"
              value={formData.tireCondition ?? ""}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value="" disabled>
                — Select tire condition —
              </option>
              <option value="New">New</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>

          {/* New field: Accidental History (Checkbox) */}
          <div className="flex items-center mt-4 md:mt-0">
            <input
              type="checkbox"
              id="accidentalHistory"
              name="accidentalHistory"
              checked={!!formData.accidentalHistory}
              onChange={handleChange}
              className={checkboxClasses}
            />
            <label htmlFor="accidentalHistory" className="ml-2 text-sm text-gray-700 font-medium cursor-pointer">
              Reported Accidental History
            </label>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OwnershipPricing;