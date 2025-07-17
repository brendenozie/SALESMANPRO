import React, { useCallback } from "react";
import { motion } from "framer-motion";
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

interface ContactLocationProps {
  formData: Record<string, any>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
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
  setFormData,
}) => {
  const subCat = formData.subCategory || "";
  const isDigital = DIGITAL_SUBCATEGORIES.includes(subCat);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    [setFormData]
  );

  const fillCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
        setFormData((prev) => ({ ...prev, location: coords }));
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
        {/* Location */}
        {!isDigital && (
          <div className="relative">
            <MapPinIcon className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="location"
              value={formData.location || ""}
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
