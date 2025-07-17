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

interface VehicleAmenitiesStepProps {
  formData: { vehicleAmenities: string[] };
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

const VEHICLE_AMENITIES: AmenityCategory[] = [
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

const VehicleAmenitiesStep: React.FC<VehicleAmenitiesStepProps> = ({
  formData,
  setFormData,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customAmenity, setCustomAmenity] = useState("");

  const vehicleAmenities = formData.vehicleAmenities || [];

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return VEHICLE_AMENITIES;
    return VEHICLE_AMENITIES.map((cat) => ({
      ...cat,
      items: cat.items.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [searchTerm]);

  const toggleAmenity = useCallback(
    (value: string) => {
      const updated = vehicleAmenities.includes(value)
        ? vehicleAmenities.filter((v) => v !== value)
        : [...vehicleAmenities, value];
      setFormData((prev) => ({ ...prev, vehicleAmenities: updated }));
    },
    [vehicleAmenities, setFormData]
  );

  const addCustomAmenity = useCallback(() => {
    const trimmed = customAmenity.trim();
    if (!trimmed || vehicleAmenities.includes(trimmed)) return;
    setFormData((prev) => ({
      ...prev,
      vehicleAmenities: [...vehicleAmenities, trimmed],
    }));
    setCustomAmenity("");
  }, [customAmenity, vehicleAmenities, setFormData]);

  const predefinedSet = useMemo(
    () =>
      new Set(
        VEHICLE_AMENITIES.flatMap((cat) =>
          cat.items.map((item) => item.value)
        )
      ),
    []
  );

  const customItems = vehicleAmenities.filter((a) => !predefinedSet.has(a));

  return (
    <section className="p-6 bg-white rounded-2xl shadow-xl border border-gray-200 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Select Vehicle Features</h2>
        <p className="text-gray-500 mt-1">
          Choose from predefined vehicle amenities or add your own custom ones.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search features..."
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
              {category.items.map((item) => {
                const selected = vehicleAmenities.includes(item.value);
                return (
                  <motion.button
                    key={item.value}
                    type="button"
                    aria-label={item.name}
                    onClick={() => toggleAmenity(item.value)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center space-x-2 p-3 border rounded-lg transition-all focus:outline-none focus:ring-2 ${
                      selected
                        ? "bg-blue-500 text-white border-blue-500 shadow-md"
                        : "bg-gray-100 text-gray-800 border-gray-200 hover:bg-blue-50"
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Custom Features */}
      {customItems.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-700">Custom Features</h3>
          <div className="flex flex-wrap gap-3">
            {customItems.map((item) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full shadow-sm space-x-2"
              >
                <span>{item}</span>
                <button
                  onClick={() => toggleAmenity(item)}
                  aria-label={`Remove ${item}`}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Feature */}
      <div className="flex items-center space-x-3">
        <input
          type="text"
          placeholder="Add custom feature"
          value={customAmenity}
          onChange={(e) => setCustomAmenity(e.target.value)}
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

export default VehicleAmenitiesStep;
