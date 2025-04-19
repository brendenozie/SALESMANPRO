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
import InputField from "./InputField";
import CommissionSection from "./CommissionSection";

// -------------------
// GENERAL DETAILS (Vehicles)
// -------------------

const GeneralDetails = ({ formData, setFormData }: any) => {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl space-y-6 border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Make" name="make" value={formData.make || ""} onChange={handleChange} required />
        <InputField label="Model" name="model" value={formData.model || ""} onChange={handleChange} required />
        <InputField label="Year" name="year" type="number" value={formData.year || ""} onChange={handleChange} required />
        <InputField label="Trim" name="trim" value={formData.trim || ""} onChange={handleChange} />
        <InputField label="Type (SUV, Sedan)" name="type" value={formData.type || ""} onChange={handleChange} required />
        <InputField label="Color" name="color" value={formData.color || ""} onChange={handleChange} />
        <InputField label="Mileage (km)" name="mileage" type="number" value={formData.mileage || ""} onChange={handleChange} />

        <div>
          <label className="block text-sm font-medium text-gray-700">Condition</label>
          <select name="condition" value={formData.condition || ""} onChange={handleChange} className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
            <option value="New">New</option>
            <option value="Used">Used</option>
            <option value="Certified Pre-Owned">Certified Pre-Owned</option>
          </select>
        </div>
      </div>

      {/* Commission Section */}
      <CommissionSection formData={formData} handleChange={handleChange} />
    </div>
  );
};

const GeneralDetailsV1 = ({ formData, setFormData }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl space-y-6 border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" name="make" placeholder="Make" value={formData.make || ""} onChange={handleChange} className="input-field" required />
        <input type="text" name="model" placeholder="Model" value={formData.model || ""} onChange={handleChange} className="input-field" required />
        <input type="number" name="year" placeholder="Year" value={formData.year || ""} onChange={handleChange} className="input-field" required />
        <input type="text" name="trim" placeholder="Trim" value={formData.trim || ""} onChange={handleChange} className="input-field" />
        <input type="text" name="type" placeholder="Type (SUV, Sedan)" value={formData.type || ""} onChange={handleChange} className="input-field" required />
        <input type="text" name="color" placeholder="Color" value={formData.color || ""} onChange={handleChange} className="input-field" />
        <input type="number" name="mileage" placeholder="Mileage (km)" value={formData.mileage || ""} onChange={handleChange} className="input-field" />
        <select name="condition" value={formData.condition || ""} onChange={handleChange} className="input-field">
          <option value="New">New</option>
          <option value="Used">Used</option>
          <option value="Certified Pre-Owned">Certified Pre-Owned</option>
        </select>
        {/* Commission Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Commission Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Commission Rate (%)</label>
            <input
              type="number"
              name="commissionRate"
              value={formData.commissionRate}
              onChange={handleChange}
              // onChange={(e) => setNewProduct({ ...newProduct, commissionRate: parseFloat(e.target.value) || 0 })}
              placeholder="Enter commission rate"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Commission Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Commission Type</label>
            <select name="commissionType"
              value={formData.commissionType}
              onChange={handleChange}
              // onChange={(e) => setNewProduct({ ...newProduct, commissionType: e.target.value })}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="COST">COST</option>
              <option value="QUANTITY">QUANTITY</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralDetails;
