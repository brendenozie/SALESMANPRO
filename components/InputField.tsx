// InputField.tsx (example structure)
import React from 'react';

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  required?: boolean;
  placeholder?: string;
  className?: string; // To accept custom classes
  min?: string | number;
  max?: string | number;
  step?: string | number;
  prefix?: string; // NEW PROP: For currency symbols, etc.
  rows?: number; // For textarea
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type = "text",
  value,
  handleInputChange,
  required,
  placeholder,
  className,
  min,
  max,
  step,
  prefix, // Destructure the new prefix prop
  rows
}) => {
  const isTextArea = type === "textarea";
  const InputComponent = isTextArea ? "textarea" : "input";

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative"> {/* Added relative div for prefix positioning */}
        {prefix && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 pointer-events-none">
            {prefix}
          </span>
        )}
        <InputComponent
          id={name}
          name={name}
          type={!isTextArea ? type : undefined} // Only pass type to input
          value={value}
          onChange={handleInputChange}
          required={required}
          placeholder={placeholder}
          className={className}
          min={min}
          max={max}
          step={step}
          rows={rows} // Pass rows for textarea
        />
      </div>
    </div>
    // <div>
    //   <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
    //     {label} {required && <span className="text-red-500">*</span>}
    //   </label>
    //   <InputComponent
    //     id={name}
    //     name={name}
    //     type={!isTextArea ? type : undefined} // Only pass type to input
    //     value={value}
    //     onChange={handleInputChange}
    //     required={required}
    //     placeholder={placeholder}
    //     className={className}
    //     min={min}
    //     step={step}
    //     rows={isTextArea ? 4 : undefined} // Default rows for textarea
    //   />
    // </div>
  );
};

export default InputField;