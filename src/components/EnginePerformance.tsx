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
