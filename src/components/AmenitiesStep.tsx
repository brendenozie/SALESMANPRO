import React, { useState, useEffect, useMemo, useRef } from "react";
import Modal from "../components/Modal";
import { useDropzone, Accept } from "react-dropzone";
import { debounce } from "lodash";
import { motion } from "framer-motion";
import {
  ArrowUpCircleIcon,
  PhotoIcon,
  TagIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  CheckCircleIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";
import {
  ArrowUpOnSquareIcon,
  ArrowUpTrayIcon,
  CameraIcon,
  ListBulletIcon,
  PhoneIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/solid";

//step 13: Amenities
const AmenitiesStep = ({ formData, setFormData }: any) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customAmenity, setCustomAmenity] = useState("");

  const amenitiesCategories = [
    {
        category: "General",
        items: [
            { name: "Air Conditioning", value: "air_conditioning", icon: "🌡" },
            { name: "Heating", value: "heating", icon: "🔥" },
            { name: "Backup Generator", value: "backup_generator", icon: "🔌" },
            { name: "Elevator", value: "elevator", icon: "🏗" },
            { name: "Ceiling Fans", value: "ceiling_fans", icon: "🌬" },
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
            { name: "Swimming Pool", value: "pool", icon: "🏊" },
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
            { name: "Rooftop Lounge", value: "rooftop", icon: "🏕" },
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
            { name: "On-Site Daycare", value: "daycare", icon: "👩‍⚕️" },
            { name: "Nearby Schools", value: "nearby_schools", icon: "🏫" },
        ],
    },
    {
        category: "Business & Workspaces",
        items: [
            { name: "Co-Working Space", value: "coworking_space", icon: "🏢" },
            { name: "Business Center", value: "business_center", icon: "🖥" },
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
            { name: "Fully Equipped Kitchen", value: "kitchen", icon: "🍽" },
            { name: "In-Unit Laundry", value: "laundry", icon: "🏠" },
            { name: "Wine Cellar", value: "wine_cellar", icon: "🥂" },
        ],
    },
];
 // Filtered amenities based on search
  const filteredCategories = amenitiesCategories.map((category) => ({
    ...category,
    items: category.items.filter((amenity) =>
      amenity.name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  }));

  const toggleAmenity = (value: string) => {
    const updatedAmenities = formData.amenities.includes(value)
      ? formData.amenities.filter((item: string) => item !== value)
      : [...formData.amenities, value];

    setFormData((prev: any) => ({ ...prev, amenities: updatedAmenities }));
  };

  const addCustomAmenity = () => {
    if (customAmenity.trim() !== "") {
      setFormData((prev: any) => ({
        ...prev,
        amenities: [...prev.amenities, customAmenity.trim()],
      }));
      setCustomAmenity("");
    }
  };

  // Extract predefined amenity values
const predefinedAmenities = new Set(
  amenitiesCategories.flatMap((category) => category.items.map((item) => item.value))
);

// Find custom amenities
const customAmenities = formData.amenities.filter((amenity: string) => !predefinedAmenities.has(amenity));


  return (
    <div className="p-6 space-y-6">
      <h3 className="text-xl font-bold text-gray-800">Select Property Amenities</h3>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search amenities..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 border rounded-lg shadow-sm focus:ring focus:ring-blue-300"
      />

      {/* Amenity Categories */}
      <div className="space-y-6">
        {filteredCategories.map(
          (category) =>
            category.items.length > 0 && (
              <div key={category.category}>
                <h4 className="text-lg font-semibold text-gray-700">{category.category}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                  {category.items.map((amenity) => (
                    <button
                      key={amenity.value}
                      onClick={() => toggleAmenity(amenity.value)}
                      className={`flex items-center justify-center p-4 border rounded-lg shadow-sm transition-all 
                        ${
                          formData.amenities.includes(amenity.value)
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-800 hover:bg-blue-100"
                        }`}
                    >
                      <span className="text-lg">{amenity.icon}</span>
                      <span className="ml-2">{amenity.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )
        )}
      </div>

      {/* Custom Amenities (Added by the User) */}
        {customAmenities.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-700 mt-4">Custom Amenities</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
              {customAmenities.map((amenity: string) => (
                <button
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className="flex items-center justify-center p-4 border rounded-lg shadow-sm bg-green-200 text-green-800"
                >
                  <span className="ml-2">{amenity}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      
      {/* Custom Amenity */}
      <div className="flex items-center space-x-3">
        <input
          type="text"
          placeholder="Add Custom Amenity"
          value={customAmenity}
          onChange={(e) => setCustomAmenity(e.target.value)}
          className="input-field"
        />
        <button
          onClick={addCustomAmenity}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg flex items-center"
        >
          <PlusCircleIcon className="h-5 w-5 mr-1" /> Add Amenity
        </button>
      </div>

    </div>
  );

}

export default AmenitiesStep;
