import React, { useCallback } from "react";
import InputField from "./InputField";
import CommissionSection from "./CommissionSection";

interface GeneralDetailsProps {
  formData: {
    make?: string;
    model?: string;
    year?: number | string;
    trim?: string;
    type?: string;
    color?: string;
    mileage?: number | string;
    condition?: string;
    material?: string;
    weight?: number | string;
    dimensions?: string;
    longDescription?: string;
    [key: string]: any;
  };
  setFormData: (data: Record<string, any>) => void;
}

const GeneralDetails: React.FC<GeneralDetailsProps> = ({ formData, setFormData }) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    },
    [setFormData]
  );

  // Common Tailwind classes for selects and textareas
  const selectClasses =
    "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200";
  const textareaClasses =
    "mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none";

  return (
    <section className="p-6 bg-white rounded-2xl shadow-xl border border-gray-200 space-y-8">
      {/* ── Section 1: Basic Info ── */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Basic Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Make"
            name="make"
            value={formData.make ?? ""}
            onChange={handleChange}
            required
          />
          <InputField
            label="Model"
            name="model"
            value={formData.model ?? ""}
            onChange={handleChange}
            required
          />
          <InputField
            label="Year"
            name="year"
            type="number"
            value={formData.year ?? ""}
            onChange={handleChange}
            required
          />
          <InputField
            label="Trim"
            name="trim"
            value={formData.trim ?? ""}
            onChange={handleChange}
          />
          <InputField
            label="Type (SUV, Sedan, etc.)"
            name="type"
            value={formData.type ?? ""}
            onChange={handleChange}
            required
          />
          <InputField
            label="Color"
            name="color"
            value={formData.color ?? ""}
            onChange={handleChange}
          />
          <InputField
            label="Mileage (km)"
            name="mileage"
            type="number"
            value={formData.mileage ?? ""}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* ── Section 2: Condition & Description ── */}
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
              <option value="" disabled>
                Select condition
              </option>
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

      {/* ── Section 3: Material, Weight & Dimensions ── */}
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

      {/* ── Section 4: Commission & Pricing ── */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Commission & Pricing</h3>
        <CommissionSection formData={formData} onChange={handleChange} />
      </div>
    </section>
  );
};

export default GeneralDetails;
