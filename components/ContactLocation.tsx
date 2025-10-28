'use client';

import React, { useCallback } from "react";
import { motion } from "framer-motion";
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

// It's highly recommended to import ProductForm from AddProductModal.tsx for better type safety
// For simplicity in this example, we'll use a generic Record<string, any> for updateField's 'name'
interface ContactLocationProps {
  formData: Record<string, any>;
  // Corrected type to match the updateField function from the parent
  setFormData: (name: string, value: any) => void;
}

const DIGITAL_SUBCATEGORIES = [
  "Software Licenses",
  "E-books",
  "Online Courses",
  "Streaming Subscriptions",
  "Mobile App Credits",
];

const ContactLocation: React.FC<ContactLocationProps> = ({
  formData,
  setFormData, // Renamed from setFormData
}) => {
  // Accessing subCategoryName from formData for consistency with ProductForm
  const subCat = formData.subCategoryName || ""; // Use subCategoryName as per ProductForm
  const isDigital = DIGITAL_SUBCATEGORIES.includes(subCat);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(name, value); // Call updateField directly
    },
    [setFormData] // Dependency: updateField
  );

  const fillCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        setFormData('latitude', latitude);
        setFormData('longitude', longitude);
        // Optionally, update a displayable location name based on coordinates
        setFormData('locationName', `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        // If formData.location is intended to be a complex object, you'd update it differently.
        // For now, assuming locationName, latitude, longitude are the target fields.
      },
      (err) => {
        console.error("Geolocation error:", err.message);
        alert("Failed to fetch location.");
      }
    );
  };

  return (
    <section className="p-6 bg-white rounded-2xl shadow-xl border border-gray-200 space-y-8">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-800">Contact & Location</h3>
        <p className="text-gray-500 mt-1">
          Provide how customers can reach you and where you’re located.
        </p>
      </div>

      {/* Form Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location Name / Physical Location */}
        {!isDigital && (
          <div className="relative">
            <MapPinIcon className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="locationName" // Changed name to locationName as per ProductForm
              value={formData.locationName || ""} // Use locationName from formData
              onChange={handleChange}
              placeholder="Enter address or city"
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <motion.button
              type="button"
              onClick={fillCurrentLocation}
              whileHover={{ scale: 1.05 }}
              className="absolute top-1/2 right-3 -translate-y-1/2 inline-flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md text-sm"
            >
              <GlobeAltIcon className="w-4 h-4" />
              <span>Use My Location</span>
            </motion.button>
          </div>
        )}

        {/* Digital Product URL */}
        {/* {isDigital && (
          <div className="relative col-span-full">
            <GlobeAltIcon className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="url"
              name="digitalUrl"
              value={formData.digitalUrl || ""}
              onChange={handleChange}
              placeholder="e.g. https://yourproduct.com/download"
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )} */}
        
        {/* Contact Name */}
        <div className="relative">
          <input
            type="text"
            name="contactName"
            value={formData.contactName || ""}
            onChange={handleChange}
            placeholder="Contact Person's Name"
            className="w-full pl-3 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Contact Number */}
        <div className="relative">
          <PhoneIcon className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="tel"
            name="contact"
            value={formData.contact || ""}
            onChange={handleChange}
            placeholder="e.g. +254712345678"
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            pattern="^\+?\d{9,15}$"
            inputMode="tel"
          />
        </div>

        {/* Email Address */}
        <div className="relative col-span-full">
          <EnvelopeIcon className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            placeholder="e.g. you@example.com"
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="email"
          />
        </div>
      </div>
    </section>
  );
};

export default ContactLocation;