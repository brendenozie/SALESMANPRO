import React, { useCallback } from "react";
import InputField from "./InputField";

interface OwnershipPricingProps {
  formData: {
    vin?: string;
    logbookStatus?: string;
    price?: number | string;
    negotiable?: boolean;
    financingAvailable?: boolean;
    tradeIn?: boolean;
    serviceHistory?: string;
    [key: string]: any;
  };
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

const OwnershipPricing: React.FC<OwnershipPricingProps> = ({ formData, setFormData }) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type, checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    },
    [setFormData]
  );

  const selectClasses =
    "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200";
  const checkboxClasses = "h-5 w-5 text-blue-600 border-gray-300 rounded";

  return (
    <section className="p-6 bg-white rounded-2xl shadow-xl border border-gray-200 space-y-8">
      {/* ── Section Header ── */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-800">Ownership & Pricing</h3>
        <p className="text-gray-500 mt-1">
          Fill in vehicle ownership details and set your pricing preferences.
        </p>
      </div>

      {/* ── Subsection: Vehicle ID & Logbook ── */}
      <div className="bg-gray-50 p-5 rounded-lg space-y-4">
        <h4 className="text-lg font-medium text-gray-700">Vehicle Identification</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="VIN Number"
            name="vin"
            value={formData.vin ?? ""}
            onChange={handleChange}
            placeholder="e.g. 1HGCM82633A004352"
            required
          />
          <div>
            <label
              htmlFor="logbookStatus"
              className="block text-sm font-medium text-gray-700"
            >
              Logbook Status
            </label>
            <select
              id="logbookStatus"
              name="logbookStatus"
              value={formData.logbookStatus ?? ""}
              onChange={handleChange}
              className={selectClasses}
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
        </div>
      </div>

      {/* ── Subsection: Pricing & Negotiation ── */}
      <div className="bg-gray-50 p-5 rounded-lg space-y-4">
        <h4 className="text-lg font-medium text-gray-700">Pricing Options</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <InputField
            label="Asking Price (USD)"
            name="price"
            type="number"
            value={formData.price ?? ""}
            onChange={handleChange}
            placeholder="e.g. 15000"
            required
          />
          <label className="flex items-center space-x-2 mt-4 md:mt-0">
            <input
              type="checkbox"
              name="negotiable"
              checked={!!formData.negotiable}
              onChange={handleChange}
              className={checkboxClasses}
            />
            <span className="text-sm text-gray-700">Price Negotiable</span>
          </label>
        </div>
      </div>

      {/* ── Subsection: Additional Options ── */}
      <div className="bg-gray-50 p-5 rounded-lg space-y-4">
        <h4 className="text-lg font-medium text-gray-700">Additional Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="financingAvailable"
              checked={!!formData.financingAvailable}
              onChange={handleChange}
              className={checkboxClasses}
            />
            <span className="text-sm text-gray-700">Financing Available</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="tradeIn"
              checked={!!formData.tradeIn}
              onChange={handleChange}
              className={checkboxClasses}
            />
            <span className="text-sm text-gray-700">Trade‐in Accepted</span>
          </label>

          <div>
            <label
              htmlFor="serviceHistory"
              className="block text-sm font-medium text-gray-700"
            >
              Service History
            </label>
            <select
              id="serviceHistory"
              name="serviceHistory"
              value={formData.serviceHistory ?? ""}
              onChange={handleChange}
              className={selectClasses}
            >
              <option value="" disabled>
                Select history
              </option>
              <option value="Full">Full</option>
              <option value="Partial">Partial</option>
              <option value="None">None</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OwnershipPricing;
