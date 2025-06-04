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
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    [setFormData]
  );

  // Shared classes for selects and inputs
  const selectClasses =
    "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200";
  const sectionContainer = "p-6 bg-white rounded-2xl shadow-xl border border-gray-200";

  return (
    <section className={`${sectionContainer} space-y-8`}>
      {/* ── Section Header ── */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-800">Engine & Performance</h3>
        <p className="text-gray-500 mt-1">
          Provide detailed specifications so buyers know exactly what to expect.
        </p>
      </div>

      {/* ── Engine Details ── */}
      <div className="bg-gray-50 p-5 rounded-lg space-y-4">
        <h4 className="text-lg font-medium text-gray-700">Engine Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Engine Type"
            name="engineType"
            value={formData.engineType ?? ""}
            onChange={handleChange}
            placeholder="e.g. V6, Inline-4"
            required
          />
          <InputField
            label="Engine Size (L)"
            name="engineSize"
            value={formData.engineSize ?? ""}
            onChange={handleChange}
            placeholder="e.g. 3.5"
            required
          />
        </div>
      </div>

      {/* ── Performance Specs ── */}
      <div className="bg-gray-50 p-5 rounded-lg space-y-4">
        <h4 className="text-lg font-medium text-gray-700">Performance Specs</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Transmission */}
          <div>
            <label htmlFor="transmission" className="block text-sm font-medium text-gray-700">
              Transmission
            </label>
            <select
              id="transmission"
              name="transmission"
              value={formData.transmission ?? ""}
              onChange={handleChange}
              className={selectClasses}
              required
            >
              <option value="" disabled>
                — Select transmission —
              </option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
          </div>

          {/* Drivetrain */}
          <div>
            <label htmlFor="drivetrain" className="block text-sm font-medium text-gray-700">
              Drivetrain
            </label>
            <select
              id="drivetrain"
              name="drivetrain"
              value={formData.drivetrain ?? ""}
              onChange={handleChange}
              className={selectClasses}
              required
            >
              <option value="" disabled>
                — Select drivetrain —
              </option>
              <option value="FWD">FWD</option>
              <option value="RWD">RWD</option>
              <option value="AWD">AWD</option>
            </select>
          </div>

          {/* Mileage */}
          <InputField
            label="Mileage (km)"
            name="mileage"
            type="number"
            value={formData.mileage ?? ""}
            onChange={handleChange}
            placeholder="e.g. 50,000"
          />

          {/* No duplication of Transmission/Drivetrain InputFields here */}
        </div>
      </div>
    </section>
  );
};

export default EnginePerformance;
