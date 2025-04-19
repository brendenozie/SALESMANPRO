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
    [key: string]: any;
  };
  setFormData: (data: Record<string, any>) => void;
}

const GeneralDetails: React.FC<GeneralDetailsProps> = ({ formData, setFormData }) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev : any) => ({ ...prev, [name]: value }));
    },
    [setFormData]
  );

  return (
    <section className="p-6 bg-white rounded-2xl shadow-xl space-y-6 border border-gray-200">
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
        <div>
          <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
            Condition
          </label>
          <select
            id="condition"
            name="condition"
            value={formData.condition ?? ""}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
            required
          >
            <option value="" disabled>
              Select condition
            </option>
            <option value="New">New</option>
            <option value="Used">Used</option>
            <option value="Certified Pre-Owned">Certified Pre-Owned</option>
          </select>
        </div>
      </div>

      <CommissionSection formData={formData} onChange={handleChange} />
    </section>
  );
};

export default GeneralDetails;
