import React, { useCallback } from "react";
import InputField from "./InputField";

interface OwnershipPricingProps {
  formData: {
    vin?: string;
    logbookStatus?: string;
    price?: number | string;
    negotiable?: boolean;
    [key: string]: any;
  };
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

const OwnershipPricing: React.FC<OwnershipPricingProps> = ({ formData, setFormData }) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target as HTMLInputElement;
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    },
    [setFormData]
  );

  return (
    <section className="p-6 bg-white rounded-2xl shadow-xl space-y-6 border border-gray-200">
      <h3 className="section-title text-xl font-semibold">Ownership & Pricing</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="VIN Number"
          name="vin"
          value={formData.vin ?? ""}
          onChange={handleChange}
          required
        />

        <div>
          <label htmlFor="logbookStatus" className="block text-sm font-medium text-gray-700">
            Logbook Status
          </label>
          <select
            id="logbookStatus"
            name="logbookStatus"
            value={formData.logbookStatus ?? ""}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
            required
          >
            <option value="" disabled>
              Select status
            </option>
            <option value="Available">Available</option>
            <option value="Missing">Missing</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <InputField
          label="Price"
          name="price"
          type="number"
          value={formData.price ?? ""}
          onChange={handleChange}
          required
        />

        <label className="flex items-center space-x-2 mt-2">
          <input
            type="checkbox"
            name="negotiable"
            checked={!!formData.negotiable}
            onChange={handleChange}
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">Price Negotiable</span>
        </label>
      </div>
    </section>
  );
};

export default OwnershipPricing;
