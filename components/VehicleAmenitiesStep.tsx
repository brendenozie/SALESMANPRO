import React, { useState, useEffect, useMemo, useRef } from "react";
import Modal from "./Modal";
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
  PlusCircleIcon
} from "@heroicons/react/24/solid";

const VehicleAmenitiesStep = ({ formData, setFormData }: any) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customAmenity, setCustomAmenity] = useState("");

  const vehicleAmenities = [
    {
      category: "Comfort & Interior",
      items: [
        { name: "Air Conditioning", value: "ac", icon: "🌬" },
        { name: "Leather Seats", value: "leather_seats", icon: "🛋" },
        { name: "Heated Seats", value: "heated_seats", icon: "🔥" },
        { name: "Sunroof / Moonroof", value: "sunroof", icon: "🌞" },
        { name: "Ambient Lighting", value: "ambient_lighting", icon: "💡" },
        { name: "Cruise Control", value: "cruise_control", icon: "🛣" },
      ],
    },
    {
      category: "Entertainment & Connectivity",
      items: [
        { name: "Bluetooth Audio", value: "bluetooth", icon: "📱" },
        { name: "Apple CarPlay / Android Auto", value: "carplay_android", icon: "🎧" },
        { name: "USB Charging Ports", value: "usb_ports", icon: "🔌" },
        { name: "Rear Entertainment System", value: "rear_entertainment", icon: "📺" },
        { name: "Navigation / GPS", value: "gps", icon: "🧭" },
      ],
    },
    {
      category: "Safety & Driver Assistance",
      items: [
        { name: "Reverse Camera", value: "reverse_camera", icon: "🎥" },
        { name: "Parking Sensors", value: "parking_sensors", icon: "📡" },
        { name: "Blind Spot Monitor", value: "blind_spot", icon: "👁️" },
        { name: "Adaptive Cruise Control", value: "adaptive_cruise", icon: "⚙️" },
        { name: "Lane Assist", value: "lane_assist", icon: "🛣️" },
        { name: "Emergency Braking", value: "emergency_braking", icon: "🛑" },
      ],
    },
    {
      category: "Exterior & Utility",
      items: [
        { name: "Alloy Wheels", value: "alloy_wheels", icon: "🛞" },
        { name: "Roof Rack", value: "roof_rack", icon: "🧳" },
        { name: "Tow Hitch", value: "tow_hitch", icon: "⚓" },
        { name: "Tinted Windows", value: "tinted_windows", icon: "🪟" },
        { name: "Running Boards", value: "running_boards", icon: "🪜" },
      ],
    },
    {
      category: "Performance & Tech",
      items: [
        { name: "All-Wheel Drive", value: "awd", icon: "🔧" },
        { name: "Keyless Entry", value: "keyless_entry", icon: "🔑" },
        { name: "Remote Start", value: "remote_start", icon: "📲" },
        { name: "EV Charging Port", value: "ev_port", icon: "⚡" },
        { name: "Sport/Eco Mode", value: "drive_modes", icon: "🏎️" },
      ],
    },
  ];

  const filteredCategories = vehicleAmenities.map((category) => ({
    ...category,
    items: category.items.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  }));

  const toggleAmenity = (value: string) => {
    const updated = formData.vehicleAmenities?.includes(value)
      ? formData.vehicleAmenities.filter((item: string) => item !== value)
      : [...(formData.vehicleAmenities || []), value];

    setFormData((prev: any) => ({
      ...prev,
      vehicleAmenities: updated,
    }));
  };

  const addCustomAmenity = () => {
    if (customAmenity.trim() !== "") {
      setFormData((prev: any) => ({
        ...prev,
        vehicleAmenities: [...(prev.vehicleAmenities || []), customAmenity.trim()],
      }));
      setCustomAmenity("");
    }
  };

  const predefined = new Set(
    vehicleAmenities.flatMap((cat) => cat.items.map((i) => i.value))
  );
  const customItems =
    formData.vehicleAmenities?.filter((item: string) => !predefined.has(item)) || [];

  return (
    <div className="p-6 space-y-6">
      <h3 className="text-xl font-bold text-gray-800">Select Vehicle Amenities</h3>

      <input
        type="text"
        placeholder="Search vehicle features..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 border rounded-lg shadow-sm focus:ring focus:ring-blue-300"
      />

      <div className="space-y-6">
        {filteredCategories.map(
          (category) =>
            category.items.length > 0 && (
              <div key={category.category}>
                <h4 className="text-lg font-semibold text-gray-700">{category.category}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                  {category.items.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => toggleAmenity(item.value)}
                      className={`flex items-center justify-center p-4 border rounded-lg shadow-sm transition-all ${
                        formData.vehicleAmenities?.includes(item.value)
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-800 hover:bg-blue-100"
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="ml-2">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )
        )}
      </div>

      {customItems.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-700 mt-4">Custom Features</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
            {customItems.map((item: string) => (
              <button
                key={item}
                onClick={() => toggleAmenity(item)}
                className="flex items-center justify-center p-4 border rounded-lg shadow-sm bg-green-200 text-green-800"
              >
                <span className="ml-2">{item}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center space-x-3">
        <input
          type="text"
          placeholder="Add Custom Feature"
          value={customAmenity}
          onChange={(e) => setCustomAmenity(e.target.value)}
          className="input-field"
        />
        <button
          onClick={addCustomAmenity}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg flex items-center"
        >
          <PlusCircleIcon className="h-5 w-5 mr-1" /> Add
        </button>
      </div>
    </div>
  );
};

export default VehicleAmenitiesStep;
