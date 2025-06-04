import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { MapPinIcon, PhoneIcon, EnvelopeIcon, GlobeAltIcon } from "@heroicons/react/24/outline";

interface ContactLocationProps {
  formData: Record<string, any>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

const ContactLocation: React.FC<ContactLocationProps> = ({ formData, setFormData }) => {
  const subCat: string = formData.subCategory || "";
  const isDigital = [
    "Software Licenses",
    "E-books",
    "Online Courses",
    "Streaming Subscriptions",
    "Mobile App Credits",
  ].includes(subCat);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    [setFormData]
  );

  const fillCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      // For demo, simply use coords; ideally reverse-geocode
      const coords = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
      setFormData((prev) => ({ ...prev, location: coords }));
    });
  };

  return (
    <section className="p-6 bg-white rounded-2xl shadow-xl border border-gray-200 space-y-8">
      <div>
        <h3 className="text-2xl font-semibold text-gray-800">Contact & Location</h3>
        <p className="text-gray-500 mt-1">
          Provide how customers can reach you and where you’re located.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <div className="relative">
          <PhoneIcon className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="contact"
            value={formData.contact || ""}
            onChange={handleChange}
            placeholder="Contact Number"
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="relative col-span-full">
          <EnvelopeIcon className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            placeholder="Email Address"
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </section>
  );
};

export default ContactLocation;
