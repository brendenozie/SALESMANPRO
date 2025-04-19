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

const FinalReview = ({ formData }: any) => {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl space-y-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800">Final Review</h2>
      <p className="text-sm text-gray-600">Double-check all details before submitting.</p>
      
      <div className="space-y-4">
        {/* Basic Information */}
        <div className="p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">Basic Information</h3>
          <p><strong>Title:</strong> {formData.name || "N/A"}</p>
          <p><strong>Description:</strong> {formData.description || "N/A"}</p>
          <p><strong>Category:</strong> {formData.category?.name || "N/A"}</p>
        </div>

        {/* Pricing Information */}
        <div className="p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">Pricing Information</h3>
          <p><strong>Cost Price:</strong> {formData.costPrice || "N/A"}</p>
          <p><strong>Selling Price:</strong> {formData.salesPrice || "N/A"}</p>
          <p><strong>Discount (%):</strong> {formData.discount || "0"}</p>
          <p><strong>Final Price:</strong> {formData.finalPrice || "N/A"}</p>
          <p><strong>Profit Margin (%):</strong> {formData.profitMargin || "N/A"}</p>
        </div>

        {/* Availability & Feature Toggles */}
        <div className="p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">Availability & Features</h3>
          <p><strong>Availability:</strong> {formData.isAvailable ? "In Stock" : "Out of Stock"}</p>
          <p><strong>Featured:</strong> {formData.isFeatured ? "Yes" : "No"}</p>
          <p><strong>New Arrival:</strong> {formData.isNewArrival ? "Yes" : "No"}</p>
          <p><strong>On Offer:</strong> {formData.isOnOffer ? "Yes" : "No"}</p>
          <p><strong>On Discount:</strong> {formData.isDiscounted ? "Yes" : "No"}</p>
          <p><strong>On Flash Sale:</strong> {formData.isFlashDeal ? "Yes" : "No"}</p>
        </div>

        {/* Category-Specific Details */}
        {formData.category?.name === "Books" && (
          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Book Details</h3>
            <p><strong>Author:</strong> {formData.author || "N/A"}</p>
            <p><strong>Publisher:</strong> {formData.publisher || "N/A"}</p>
            <p><strong>ISBN:</strong> {formData.isbn || "N/A"}</p>
          </div>
        )}

        {["Clothing", "Fashion"].includes(formData.category?.name) && (
          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Clothing Details</h3>
            <p><strong>Fabric Composition:</strong> {formData.fabricComposition || "N/A"}</p>
            <p><strong>Care Instructions:</strong> {formData.careInstructions || "N/A"}</p>
          </div>
        )}

        {formData.category?.name === "Home Appliances" && (
          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Home Appliance Details</h3>
            <p><strong>Energy Rating:</strong> {formData.energyRating || "N/A"}</p>
            <p><strong>Warranty Period:</strong> {formData.warrantyPeriod || "N/A"}</p>
            <p><strong>Dimensions:</strong> {formData.dimensions || "N/A"}</p>
          </div>
        )}

        {["Beauty Products", "Skincare", "Haircare"].includes(formData.category?.name) && (
          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Beauty Product Details</h3>
            <p><strong>Ingredients:</strong> {formData.ingredients || "N/A"}</p>
            <p><strong>Usage Instructions:</strong> {formData.usageInstructions || "N/A"}</p>
            <p><strong>Expiration Date:</strong> {formData.expirationDate || "N/A"}</p>
          </div>
        )}

        {/* Vehicle Details (if applicable) */}
        {["Automotive", "Cars", "Car Accessories", "Tools", "Hardware"].includes(formData.category?.name) && (
          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Vehicle Details</h3>
            <p><strong>Make:</strong> {formData.make || "N/A"}</p>
            <p><strong>Model:</strong> {formData.model || "N/A"}</p>
            <p><strong>Year:</strong> {formData.year || "N/A"}</p>
            <p><strong>Trim:</strong> {formData.trim || "N/A"}</p>
            <p><strong>Type:</strong> {formData.type || "N/A"}</p>
            <p><strong>Mileage:</strong> {formData.mileage || "N/A"}</p>
            <p><strong>Condition:</strong> {formData.condition || "N/A"}</p>
          </div>
        )}

        {/* Contact & Location */}
        <div className="p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">Contact & Location</h3>
          <p><strong>Location:</strong> {formData.location || "N/A"}</p>
          <p><strong>Contact Number:</strong> {formData.contact || "N/A"}</p>
        </div>
      </div>
    </div>
  );
};

export default FinalReview;
