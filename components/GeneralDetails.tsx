import React, { useCallback } from "react";
import InputField from "./InputField";
import CommissionSection from "./CommissionSection";

interface GeneralDetailsProps {
  formData: Record<string, any>;
  setFormData: (field: string, value: any) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const GeneralDetails: React.FC<GeneralDetailsProps> = ({ formData, setFormData }) => {
  
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      setFormData(name, type === "number" ? parseFloat(value) || "" : value);
    },
    [setFormData]
  );

  const selectClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200";
  const textareaClasses =  "mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none";

  return (
    <section className="p-6 bg-white rounded-2xl shadow-xl border border-gray-200 space-y-8">
      {/* ── Basic Info ── */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Basic Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Make", name: "make", required: true },
            { label: "Model", name: "model", required: true },
            { label: "Year", name: "year", type: "number", required: true },
            { label: "Trim", name: "trim" },
            { label: "Type (SUV, Sedan, etc.)", name: "type", required: true },
            { label: "Color", name: "color" },
            { label: "Mileage (km)", name: "mileage", type: "number" },
          ].map(({ label, name, type = "text", required }) => (
            <InputField
              key={name}
              label={label}
              name={name}
              type={type}
              value={formData[name] ?? ""}
              handleInputChange={handleChange}
              required={required}
            />
          ))}
        </div>
      </div>

      {/* ── Condition & Description ── */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Condition & Description</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
              Condition
            </label>
            <select
              id="condition"
              name="condition"
              value={formData.condition ?? ""}
              onChange={handleChange}
              className={selectClasses}
              required
            >
              <option value="" disabled>Select condition</option>
              <option value="New">New</option>
              <option value="Used">Used</option>
              <option value="Certified Pre-Owned">Certified Pre-Owned</option>
              <option value="Refurbished">Refurbished</option>
            </select>
          </div>
          <div>
            <label htmlFor="longDescription" className="block text-sm font-medium text-gray-700">
              Description / Specs
            </label>
            <textarea
              id="longDescription"
              name="longDescription"
              rows={4}
              value={formData.longDescription ?? ""}
              onChange={handleChange}
              placeholder="Provide a detailed description or specifications"
              className={textareaClasses}
            />
          </div>
        </div>
      </div>

      {/* ── Material & Size ── */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Material & Size</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="material" className="block text-sm font-medium text-gray-700">
              Material
            </label>
            <input
              id="material"
              name="material"
              type="text"
              value={formData.material ?? ""}
              onChange={handleChange}
              placeholder="e.g. Aluminum, Leather"
              className={selectClasses}
            />
          </div>
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
              Weight (kg)
            </label>
            <input
              id="weight"
              name="weight"
              type="number"
              value={formData.weight ?? ""}
              onChange={handleChange}
              placeholder="e.g. 1.5"
              className={selectClasses}
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700">
              Dimensions (L×W×H)
            </label>
            <input
              id="dimensions"
              name="dimensions"
              type="text"
              value={formData.dimensions ?? ""}
              onChange={handleChange}
              placeholder="e.g. 10×5×2 cm"
              className={selectClasses}
            />
          </div>
        </div>
      </div>

      {/* ── Commission & Pricing ── */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Commission & Pricing</h3>
        <CommissionSection formData={formData} handleChange={handleChange} />
      </div>
    </section>
  );
};

export default GeneralDetails;
