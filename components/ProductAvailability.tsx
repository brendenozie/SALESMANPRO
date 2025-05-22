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
  PhoneIcon
} from "@heroicons/react/24/solid";


const ProductAvailability = ({ formData, setFormData }: any) => {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl space-y-6 border border-gray-200">
      <div>
        <label className="block text-gray-800 font-semibold">Availability</label>
        <div className="flex gap-4 mt-2">
          {["In Stock", "Out of Stock"].map((status) => {
            const isAvailable = formData.isAvailable ?? true; // Default to true if undefined
            const isSelected =
              (isAvailable && status === "In Stock") ||
              (!isAvailable && status === "Out of Stock");

            return (
              <button
                key={status}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setFormData({ ...formData, isAvailable: status === "In Stock" })}
              >
                {status}
              </button>
            );
          })}
        </div>

      </div>
      <div className="space-y-4">
        {[
          { label: "Is Featured?", key: "isFeatured" },
          { label: "Is New Arrival?", key: "isNewArrival" },
          { label: "Is On Offer?", key: "isOnOffer" },
          { label: "Is Discounted?", key: "isDiscounted" },
          { label: "Is Flash Deal?", key: "isFlashDeal" }
        ].map(({ label, key }) => (
          <div key={key} className="flex justify-between items-center">
            <span className="text-gray-800 font-semibold">{label}</span>
            <button
              onClick={() => setFormData({ ...formData, [key]: !formData[key] })}
              className={`relative w-12 h-6 rounded-full transition-colors ${formData[key] ? "bg-green-500" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform transform ${
                  formData[key] ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};


export default ProductAvailability;
