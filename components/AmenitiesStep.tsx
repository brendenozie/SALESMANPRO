'use client';

import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  PlusCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

interface AmenityItem {
  name: string;
  value: string;
  icon: string;
}

interface AmenityCategory {
  category: string;
  items: AmenityItem[];
}

interface AmenitiesStepProps {
  formData: { amenities?: string[] }; // amenities can be undefined initially
  // Corrected type to match the updateField function from the parent
  setFormData: (name: string, value: any) => void;
}

const AMENITIES_CATEGORIES: AmenityCategory[] = [
  {
    category: "General",
    items: [
      { name: "Air Conditioning", value: "air_conditioning", icon: "🌡️" },
      { name: "Heating", value: "heating", icon: "🔥" },
      { name: "Backup Generator", value: "backup_generator", icon: "🔌" },
      { name: "Elevator", value: "elevator", icon: "🏗️" },
      { name: "Ceiling Fans", value: "ceiling_fans", icon: "🌬️" },
      { name: "Private Entrance", value: "private_entrance", icon: "🚪" },
      { name: "Housekeeping Service", value: "housekeeping", icon: "🧹" },
    ],
  },
  {
    category: "Security & Tech",
    items: [
      { name: "Smart Locks", value: "smart_locks", icon: "🔐" },
      { name: "24/7 Security", value: "security", icon: "🚨" },
      { name: "CCTV Surveillance", value: "cctv", icon: "🎥" },
      { name: "Fire Alarm System", value: "fire_alarm", icon: "⏰" },
      { name: "High-Speed WiFi", value: "wifi", icon: "📶" },
      { name: "Smart Home System", value: "smart_home", icon: "📺" },
    ],
  },
  {
    category: "Fitness & Recreation",
    items: [
      { name: "Swimming Pool", value: "pool", icon: "🏊‍♀️" },
      { name: "Gym/Fitness Center", value: "gym", icon: "🏋️" },
      { name: "Tennis Court", value: "tennis_court", icon: "🎾" },
      { name: "Game Room", value: "game_room", icon: "🎯" },
      { name: "Basketball Court", value: "basketball_court", icon: "🏀" },
      { name: "Golf Course Access", value: "golf_course", icon: "⛳" },
    ],
  },
  {
    category: "Outdoor",
    items: [
      { name: "Garden", value: "garden", icon: "🌳" },
      { name: "BBQ Area", value: "bbq_area", icon: "🍖" },
      { name: "Rooftop Lounge", value: "rooftop", icon: "🏕️" },
      { name: "Balcony/Terrace", value: "balcony", icon: "🌅" },
      { name: "Outdoor Fireplace", value: "outdoor_fireplace", icon: "🔥" },
    ],
  },
  {
    category: "Parking & Transportation",
    items: [
      { name: "Private Parking", value: "private_parking", icon: "🚗" },
      { name: "Valet Parking", value: "valet_parking", icon: "🚙" },
      { name: "Bike Storage", value: "bike_storage", icon: "🚲" },
      { name: "EV Charging Station", value: "ev_charger", icon: "🔌" },
      { name: "Near Public Transport", value: "public_transport", icon: "🚏" },
    ],
  },
  {
    category: "Family-Friendly",
    items: [
      { name: "Children’s Play Area", value: "play_area", icon: "🎠" },
      { name: "On-Site Daycare", value: "daycare", icon: "👩‍🍼" }, // Updated emoji for daycare
      { name: "Nearby Schools", value: "nearby_schools", icon: "🏫" },
    ],
  },
  {
    category: "Business & Workspaces",
    items: [
      { name: "Co-Working Space", value: "coworking_space", icon: "🏢" },
      { name: "Business Center", value: "business_center", icon: "🖥️" },
      { name: "Conference Room", value: "conference_room", icon: "🎤" },
    ],
  },
  {
    category: "Pet-Friendly",
    items: [
      { name: "Pet-Friendly Property", value: "pet_friendly", icon: "🐕" },
      { name: "Dog Park Access", value: "dog_park", icon: "🦴" },
    ],
  },
  {
    category: "Kitchen & Dining",
    items: [
      { name: "Fully Equipped Kitchen", value: "kitchen", icon: "🍽️" },
      { name: "In-Unit Laundry", value: "laundry", icon: "🧺" },
      { name: "Wine Cellar", value: "wine_cellar", icon: "🥂" },
    ],
  },
];

const AmenitiesStep: React.FC<AmenitiesStepProps> = ({ formData, setFormData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customAmenity, setCustomAmenity] = useState("");

  // Ensure amenities is always an array, even if formData.amenities is undefined
  const amenities = formData.amenities || [];

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return AMENITIES_CATEGORIES;
    return AMENITIES_CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [searchTerm]);

  const toggleAmenity = useCallback(
    (value: string) => {
      const updated = amenities.includes(value)
        ? amenities.filter((a) => a !== value)
        : [...amenities, value];
      setFormData("amenities", updated); // Call updateField directly
    },
    [amenities, setFormData] // Dependencies: amenities and updateField
  );

  const addCustomAmenity = useCallback(() => {
    const trimmed = customAmenity.trim();
    // Only add if it's not empty and not already included (predefined or custom)
    if (!trimmed || amenities.includes(trimmed)) {
      setCustomAmenity(""); // Clear input if invalid or duplicate
      return;
    }
    const newAmenities = [...amenities, trimmed];
    setFormData("amenities", newAmenities); // Call updateField
    setCustomAmenity("");
  }, [customAmenity, amenities, setFormData]);

  const predefinedSet = useMemo(
    () =>
      new Set(
        AMENITIES_CATEGORIES.flatMap((cat) => cat.items.map((item) => item.value))
      ),
    []
  );

  // Filter out predefined amenities to show only truly custom ones
  const customAmenities = amenities.filter((a) => !predefinedSet.has(a));

  return (
    <section className="p-6 bg-white rounded-2xl shadow-xl border border-gray-200 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Select Property Amenities</h2>
        <p className="text-gray-500 mt-1">
          Choose from common amenities or add your own custom ones.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search amenities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {filteredCategories.map((category) => (
          <div key={category.category} className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-700">{category.category}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {category.items.map((amenity) => {
                const selected = amenities.includes(amenity.value);
                return (
                  <motion.button
                    key={amenity.value}
                    type="button"
                    onClick={() => toggleAmenity(amenity.value)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center space-x-2 p-3 border rounded-lg transition-all focus:outline-none focus:ring-2 ${
                      selected
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-gray-100 text-gray-800 border-gray-200 hover:bg-blue-50"
                    }`}
                  >
                    <span className="text-xl">{amenity.icon}</span>
                    <span>{amenity.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Custom Amenities Display */}
      {customAmenities.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-700">Custom Amenities</h3>
          <div className="flex flex-wrap gap-3">
            {customAmenities.map((amenity) => (
              <motion.div
                key={amenity}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full shadow-sm space-x-2"
              >
                <span>{amenity}</span>
                <button onClick={() => toggleAmenity(amenity)} className="text-green-600 hover:text-green-800 focus:outline-none">
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Input for New Custom Amenity */}
      <div className="flex items-center space-x-3">
        <input
          type="text"
          placeholder="Add custom amenity"
          value={customAmenity}
          onChange={(e) => setCustomAmenity(e.target.value)} // setSearchTerm("") || Clear search on custom input
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addCustomAmenity}
          className="inline-flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
        >
          <PlusCircleIcon className="w-5 h-5" />
          <span>Add</span>
        </button>
      </div>
    </section>
  );
};

export default AmenitiesStep;