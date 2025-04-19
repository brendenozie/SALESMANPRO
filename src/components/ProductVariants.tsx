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
  PhoneIcon
} from "@heroicons/react/24/solid";

const ProductVariants = ({ formData, setFormData }: any) => {
  const options = {
    colors: ["Red", "Blue", "Green", "Black", "White"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["Cotton", "Leather", "Metal", "Plastic"],
    weights: ["Light", "Medium", "Heavy"]
  };

  const handleMultiSelect = (key: any, value: any) => {
    setFormData({
      ...formData,
      [key]: formData[key]?.includes(value)
        ? formData[key].filter((v: any) => v !== value)
        : [...(formData[key] || []), value]
    });
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl space-y-6 border border-gray-200">
      <div>
        <label className="block text-gray-800 font-semibold">Color</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {options.colors.map((color) => (
            <button
              key={color}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                formData.color?.includes(color)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => handleMultiSelect("color", color)}
            >
              {color}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-gray-800 font-semibold">Size</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {options.sizes.map((size) => (
            <button
              key={size}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                formData.size?.includes(size)
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => handleMultiSelect("size", size)}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-gray-800 font-semibold">Material</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {options.materials.map((material) => (
            <button
              key={material}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                formData.material?.includes(material)
                  ? "bg-orange-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => handleMultiSelect("material", material)}
            >
              {material}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductVariants;
