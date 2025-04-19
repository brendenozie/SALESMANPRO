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

const OwnershipPricing = ({ formData, setFormData }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl space-y-6 border border-gray-200">
      <h3 className="section-title">Ownership & Pricing</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" name="vin" placeholder="VIN Number" value={formData.vin} onChange={handleChange} className="input-field" />
        <select name="logbookStatus" value={formData.logbookStatus} onChange={handleChange} className="input-field">
          <option value="Available">Available</option>
          <option value="Missing">Missing</option>
          <option value="Pending">Pending</option>
        </select>
        <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} className="input-field" required />
        <label className="flex items-center space-x-2 text-gray-700">
          <input type="checkbox" name="negotiable" checked={formData.negotiable} onChange={(e) => setFormData({ ...formData, negotiable: e.target.checked })} className="w-5 h-5" />
          <span>Price Negotiable</span>
        </label>
      </div>
    </div>
  );
};

export default OwnershipPricing;
