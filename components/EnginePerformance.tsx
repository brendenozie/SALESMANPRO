import React, { useCallback } from "react";
import InputField from "./InputField";

interface EnginePerformanceProps {
  formData: Record<string, string>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const EnginePerformance: React.FC<EnginePerformanceProps> = ({ formData, setFormData }) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    },
    [setFormData]
  );

  return (
    <section className="p-6 bg-white rounded-2xl shadow-xl space-y-6 border border-gray-200">
      <h3 className="section-title text-xl font-semibold">Engine & Performance</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Engine Type"
          name="engineType"
          value={formData.engineType ?? ''}
          onChange={handleChange}
        />
        <InputField
          label="Engine Size"
          name="engineSize"
          value={formData.engineSize ?? ''}
          onChange={handleChange}
        />
         <div>
        <label className="block text-sm font-medium">Transmission</label>
        <select
          name="transmission"
          value={formData.transmission}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md"
        >
          <option value="">— Select transmission —</option>
          <option value="Automatic">Automatic</option>
          <option value="Manual">Manual</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Drivetrain</label>
        <select
          name="drivetrain"
          value={formData.drivetrain}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md"
        >
          <option value="">— Select drivetrain —</option>
          <option value="FWD">FWD</option>
          <option value="RWD">RWD</option>
          <option value="AWD">AWD</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Mileage (km)</label>
        <input
          name="mileage"
          type="number"
          value={formData.mileage}
          onChange={handleChange}
          placeholder="e.g. 50000"
          className="mt-1 block w-full border-gray-300 rounded-md"
        />
      </div>
        <InputField
          label="Transmission"
          name="transmission"
          value={formData.transmission ?? ''}
          onChange={handleChange}
        />
        <InputField
          label="Drivetrain (AWD, FWD, RWD)"
          name="drivetrain"
          value={formData.drivetrain ?? ''}
          onChange={handleChange}
        />
      </div>
    </section>
  );
};

export default EnginePerformance;
