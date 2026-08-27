'use client'; // For Next.js App Router

import React, { useCallback } from "react";
import InputField from "./InputField"; // Ensure this component accepts an 'onChange' prop
import { ProductForm } from "@/types/typings";
// import { ProductForm } from "./AddProductModal";
// import { ProductForm } from '@/types/typings'; // Assuming ProductForm is the comprehensive type for your main form data

interface EnginePerformanceProps {
  formData: ProductForm; // Use the comprehensive form type for better type safety
  setFormData: (name: string, value: any) => void; // Consolidated prop for updating form data
}

const EnginePerformance: React.FC<EnginePerformanceProps> = ({ formData, setFormData }) => {

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

  // Common Tailwind CSS classes for inputs and selects
  const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm";

  return (
    <section className="p-6 bg-white rounded-2xl shadow-xl border border-gray-200 space-y-8">
      {/* ── Section Header ── */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Engine & Performance 🚀</h2>
        <p className="text-gray-500 mt-1">
          Provide detailed specifications about the vehicle's engine, transmission, and drivetrain.
        </p>
      </div>

      {/* ── Engine Details ── */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-5 border border-gray-100">
        <h4 className="text-xl font-semibold text-gray-700">Engine Specifications</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Engine Type"
            name="engineType"
            value={formData.engineType ?? ""}
            handleInputChange={handleChange} //{/* Use the local handleChange */}
            placeholder="e.g., V6, Inline-4, Electric"
            required
            className={inputClasses}
          />
          <InputField
            label="Engine Size (Liters)"
            name="engineSize"
            type="number"
            value={formData.engineSize ?? ""}
            handleInputChange={handleChange} //{/* Use the local handleChange */}
            placeholder="e.g., 3.5 (for 3.5L)"
            required
            className={inputClasses}
            step="0.1" // Allow decimal values for engine size
            min="0"
          />
          <InputField
            label="Horsepower (hp)"
            name="horsepower"
            type="number"
            value={formData.horsepower ?? ""}
            handleInputChange={handleChange}
            placeholder="e.g., 250"
            className={inputClasses}
            min="0"
          />
          <InputField
            label="Torque (lb-ft)"
            name="torque"
            type="number"
            value={formData.torque ?? ""}
            handleInputChange={handleChange}
            placeholder="e.g., 280"
            className={inputClasses}
            min="0"
          />
        </div>
      </div>

      {/* ── Performance Specs ── */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-5 border border-gray-100">
        <h4 className="text-xl font-semibold text-gray-700">Performance & Drivetrain</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Transmission */}
          <div>
            <label htmlFor="transmission" className="block text-sm font-medium text-gray-700 mb-1">
              Transmission <span className="text-red-500">*</span>
            </label>
            <select
              id="transmission"
              name="transmission"
              value={formData.transmission ?? ""}
              onChange={handleChange} //{/* Use the local handleChange */}
              className={inputClasses}
              required
            >
              <option value="" disabled>
                — Select transmission type —
              </option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
              <option value="Continuously Variable Transmission (CVT)">Continuously Variable Transmission (CVT)</option>
              <option value="Automated Manual Transmission (AMT)">Automated Manual Transmission (AMT)</option>
            </select>
          </div>

          {/* Drivetrain */}
          <div>
            <label htmlFor="drivetrain" className="block text-sm font-medium text-gray-700 mb-1">
              Drivetrain <span className="text-red-500">*</span>
            </label>
            <select
              id="drivetrain"
              name="drivetrain"
              value={formData.drivetrain ?? ""}
              onChange={handleChange} //{/* Use the local handleChange */}
              className={inputClasses}
              required
            >
              <option value="" disabled>
                — Select drivetrain type —
              </option>
              <option value="FWD">Front-Wheel Drive (FWD)</option>
              <option value="RWD">Rear-Wheel Drive (RWD)</option>
              <option value="AWD">All-Wheel Drive (AWD)</option>
              <option value="4WD">Four-Wheel Drive (4WD)</option>
            </select>
          </div>

          {/* Fuel Type */}
          <div>
            <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700 mb-1">
              Fuel Type <span className="text-red-500">*</span>
            </label>
            <select
              id="fuelType"
              name="fuelType"
              value={formData.fuelType ?? ""}
              onChange={handleChange}
              className={inputClasses}
              required
            >
              <option value="" disabled>
                — Select fuel type —
              </option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
              <option value="LPG">LPG (Liquefied Petroleum Gas)</option>
            </select>
          </div>

          {/* Fuel Consumption (L/100km or MPG) */}
          <InputField
            label="Fuel Economy (L/100km or MPG)"
            name="fuelEconomy"
            type="text"
            value={formData.fuelEconomy ?? ""}
            handleInputChange={handleChange}
            placeholder="e.g., 7.5 L/100km or 32 MPG"
            className={inputClasses}
          />
        </div>
      </div>
    </section>
  );
};

export default EnginePerformance;