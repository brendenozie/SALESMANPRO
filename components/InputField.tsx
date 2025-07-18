"use client";
import React from "react";

const InputField = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  handleInputChange,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string | number;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  required?: boolean;
}) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={handleInputChange}
      required={required}
      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
);


export default InputField;
