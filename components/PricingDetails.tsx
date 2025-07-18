'use client'; // For Next.js App Router compatibility

import React, { useEffect, useCallback } from "react";
import InputField from "./InputField"; // Assuming InputField is a generic component for inputs
// import { ProductForm } from "@/types/typings";


interface PricingDetailsProps {
  formData: any; // Use the comprehensive form type for better type safety
  setFormData: (name: string, value: any) => void; // Consolidated prop for updating form data
}

const PricingDetails: React.FC<PricingDetailsProps> = ({ formData, setFormData }) => {

  // Centralized change handler for all inputs in this section
  // This will be passed to InputField components and direct HTML elements
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      // For number inputs, parse to float; otherwise, keep as string.
      // Ensure empty strings don't become 0 for number inputs if the user deletes input.
      setFormData(name, type === "number" ? (value === "" ? "" : parseFloat(value)) : value);
    },
    [setFormData]
  );

  // Effect to recalculate finalPrice and profitMargin whenever relevant inputs change
  useEffect(() => {
    // Use consistent names: `sellingPrice` and `costPrice` (or `buyingPrice`)
    const sellingPrice = parseFloat(formData.sellingPrice?.toString() || "0") || 0;
    const costPrice = parseFloat(formData.costPrice?.toString() || formData.buyingPrice?.toString() || "0") || 0;
    const discount = parseFloat(formData.discount?.toString() || "0") || 0; // Discount is a percentage

    // Calculate discounted price: selling price minus (selling price * discount percentage)
    const calculatedFinalPrice = Math.max(sellingPrice - (sellingPrice * discount) / 100, 0);

    // Calculate profit margin: ((final price - cost price) / cost price) * 100
    const calculatedProfitMargin = costPrice > 0 
      ? ((calculatedFinalPrice - costPrice) / costPrice) * 100 
      : 0;

    // Update only these two fields.
    // Check if values actually changed to prevent infinite re-renders if updateField triggers an effect
    if (formData.finalPrice !== calculatedFinalPrice || formData.profitMargin !== calculatedProfitMargin) {
      setFormData('finalPrice', calculatedFinalPrice);
      setFormData('profitMargin', calculatedProfitMargin);
    }

  }, [formData.sellingPrice, formData.costPrice, formData.discount, formData.finalPrice, formData.profitMargin, setFormData]); // Dependencies for recalculation

  // Formatters
  // We'll format KSh with commas and 2 decimal places.
  // Using Intl.NumberFormat for robust currency formatting
  const formatCurrency = useCallback((value: number | undefined | null) => {
    if (value === undefined || value === null) return "0.00";
    return new Intl.NumberFormat('en-KE', { 
      style: 'currency', 
      currency: 'KSh', // Kenyan Shillings
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }, []);

  const formatPercentage = useCallback((value: number | undefined | null) => {
    if (value === undefined || value === null) return "0.00";
    return value.toFixed(2);
  }, []);

  // Common Tailwind CSS classes for consistency
  const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm";

  return (
    <section className="p-6 bg-white rounded-2xl shadow-xl border border-gray-200 space-y-8">
      {/* ── Header ── */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Pricing Details 📊</h2>
        <p className="text-gray-500 mt-1">
          Set your cost, selling price, and discount. The final price and profit margin will update automatically.
        </p>
      </div>

      {/* ── Input Card ── */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-700">Enter Costs & Discount</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Cost Price */}
          <InputField
            label="Cost Price (KSh)"
            name="costPrice"
            type="number"
            value={formData.costPrice ?? ""} // Use ?? for nullish coalescing
            handleInputChange={handleChange}
            placeholder="0.00"
            className={`${inputClasses} pl-10`} // Added pl-10 for currency symbol
            min="0"
            step="0.01"
            prefix="KSh" // Passed to InputField for dynamic prefix rendering
          />

          {/* Selling Price */}
          <InputField
            label="Selling Price (KSh)"
            name="sellingPrice" // Standardized name to sellingPrice
            type="number"
            value={formData.sellingPrice ?? ""} // Use ?? for nullish coalescing
            handleInputChange={handleChange}
            placeholder="0.00"
            className={`${inputClasses} pl-10`} // Added pl-10 for currency symbol
            min="0"
            step="0.01"
            prefix="KSh" // Passed to InputField for dynamic prefix rendering
          />

          {/* Discount */}
          <div>
            <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">
              Discount (%)
            </label>
            <div className="flex items-center space-x-2">
              <input
                id="discount"
                type="number"
                name="discount"
                value={formData.discount ?? "0"}
                onChange={handleChange}
                placeholder="0"
                className="w-20 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-center"
                min="0"
                max="100"
                step="1"
              />
              <span className="text-gray-700 font-medium">%</span>
            </div>
            {/* Range slider for discount */}
            <input
              type="range"
              name="discount"
              min="0"
              max="100"
              value={formData.discount ?? "0"}
              onChange={handleChange}
              className="mt-4 w-full accent-blue-500 h-2 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">
              Adjust the discount percentage using the slider or direct input.
            </p>
          </div>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Final Price Display */}
        <div className="bg-blue-50 p-5 rounded-lg flex justify-between items-center shadow-md border border-blue-100">
          <div>
            <p className="text-gray-700 text-sm">Calculated Final Price</p>
            <p className="text-blue-800 font-extrabold text-3xl">
              {formatCurrency(formData.finalPrice)}
            </p>
          </div>
          <span className="text-blue-600 text-3xl">💰</span>
        </div>

        {/* Profit Margin Display */}
        <div className="bg-green-50 p-5 rounded-lg flex justify-between items-center shadow-md border border-green-100">
          <div>
            <p className="text-gray-700 text-sm">Estimated Profit Margin</p>
            <p className="text-green-800 font-extrabold text-3xl">
              {formatPercentage(formData.profitMargin)}%
            </p>
          </div>
          <span className="text-green-600 text-3xl">📈</span>
        </div>
      </div>
    </section>
  );
};

export default PricingDetails;