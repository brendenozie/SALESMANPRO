"use client";
import React from "react";



interface CommissionSectionProps {
  formData: Record<string, any>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const CommissionSection: React.FC<CommissionSectionProps> = ({ formData, handleChange }) => {
  const inputClasses =
    "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200";

  return (
    <div className="space-y-4">
      {/* <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Price (KES)
        </label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price ?? ""}
          onChange={handleChange}//(e) => handleChange("price", parseFloat(e.target.value) || "")}
          placeholder="e.g. 25000"
          className={inputClasses}
          required
        />
      </div> */}

      {/* <div>
        <label htmlFor="discount" className="block text-sm font-medium text-gray-700">
          Discount (%)
        </label>
        <input
          type="number"
          id="discount"
          name="discount"
          value={formData.discount ?? ""}
          onChange={handleChange}//(e) => handleChange("discount", parseFloat(e.target.value) || "")}
          placeholder="e.g. 10"
          className={inputClasses}
        />
      </div> */}

      <div>
        <label htmlFor="commissionRate" className="block text-sm font-medium text-gray-700">
          Commission Rate (%)
        </label>
        <input
          type="number"
          id="commissionRate"
          name="commissionRate"
          value={formData.commissionRate ?? ""}
          onChange={handleChange}//(e) => handleChange("commissionRate", parseFloat(e.target.value) || "")}
          placeholder="e.g. 15"
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700">
          Tax Rate (%)
        </label>
        <input
          type="number"
          id="taxRate"
          name="taxRate"
          value={formData.taxRate ?? ""}
          onChange={handleChange}//(e) => handleChange("taxRate", parseFloat(e.target.value) || "")}
          placeholder="e.g. 5"
          className={inputClasses}
        />
      </div>
    </div>
  );
};

export default CommissionSection;