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


// -------------------
// UPDATED PRODUCT DETAILS
// -------------------

const ProductDetails = ({ formData, setFormData }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const headerLabel = (() => {
    if (formData.category?.name === "Books") return "Book Details";
    if (["Clothing", "Fashion"].includes(formData.category?.name)) return "Clothing Details";
    if (formData.category?.name === "Home Appliances") return "Appliance Details";
    if (["Beauty Products", "Skincare", "Haircare"].includes(formData.category?.name))
      return "Beauty Product Details";
    return "Product Details";
  })();

  const primaryLabel = formData.category?.name === "Books" ? "Book Title" : "Product Name";

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl space-y-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800">{headerLabel}</h3>
      <div className="relative">
        <input
          type="text"
          name="name"
          className="peer w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder=" "
          value={formData.name || formData.title}
          onChange={handleChange}
        />
        <label className="absolute left-3 top-3 text-gray-500 text-sm transition-all">
          {primaryLabel}
        </label>
      </div>
      <div>
        <label className="block text-gray-700 font-medium mb-1">Description</label>
        <textarea
          name="description"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none h-24"
          placeholder="Enter a brief description"
          maxLength={500}
          value={formData.description}
          onChange={handleChange}
        />
        <p className="text-sm text-gray-500 mt-1">{formData.description?.length}/500 characters</p>
      </div>
      {formData.category?.name === "Books" && (
        <div className="space-y-4">
          <input type="text" name="author" placeholder="Author" value={formData.author} onChange={handleChange} className="input-field" />
          <input type="text" name="publisher" placeholder="Publisher" value={formData.publisher} onChange={handleChange} className="input-field" />
          <input type="text" name="isbn" placeholder="ISBN" value={formData.isbn} onChange={handleChange} className="input-field" />
        </div>
      )}
      {["Clothing", "Fashion"].includes(formData.category?.name) && (
        <div className="space-y-4">
          <input
            type="text"
            name="fabricComposition"
            placeholder="Fabric Composition (e.g., 100% Cotton)"
            value={formData.fabricComposition}
            onChange={handleChange}
            className="input-field"
          />
          <textarea
            name="careInstructions"
            placeholder="Care Instructions (e.g., Machine wash cold)"
            value={formData.careInstructions}
            onChange={handleChange}
            className="input-field"
          />
        </div>
      )}
      {formData.category?.name === "Home Appliances" && (
        <div className="space-y-4">
          <input
            type="text"
            name="energyRating"
            placeholder="Energy Rating (e.g., A++)"
            value={formData.energyRating}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="text"
            name="warrantyPeriod"
            placeholder="Warranty Period (e.g., 2 years)"
            value={formData.warrantyPeriod}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="text"
            name="dimensions"
            placeholder="Dimensions (LxWxH)"
            value={formData.dimensions}
            onChange={handleChange}
            className="input-field"
          />
        </div>
      )}
      {["Beauty Products", "Skincare", "Haircare"].includes(formData.category?.name) && (
        <div className="space-y-4">
          <input
            type="text"
            name="ingredients"
            placeholder="Ingredients"
            value={formData.ingredients}
            onChange={handleChange}
            className="input-field"
          />
          <textarea
            name="usageInstructions"
            placeholder="Usage Instructions"
            value={formData.usageInstructions}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="date"
            name="expirationDate"
            placeholder="Expiration Date"
            value={formData.expirationDate}
            onChange={handleChange}
            className="input-field"
          />
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
