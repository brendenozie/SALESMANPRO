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

const ContactLocation = ({ formData, setFormData }: any) => {
  const subCat = formData.subCategory;
  const isDigital =
    ["Software Licenses", "E-books", "Online Courses", "Streaming Subscriptions", "Mobile App Credits"].includes(
      subCat
    );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl space-y-6 border border-gray-200">
      <h3 className="section-title">Contact & Location</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {!isDigital && (
        <>
          <div>
            <label className="block text-sm font-medium">Location / Address</label>
            <input
              name="location"
              type="text"
              value={formData.location}
              // onChange={handleInputChange}
              placeholder="e.g. Nairobi, Kenya"
              className="mt-1 block w-full border-gray-300 rounded-md"
            />
          </div>
        </>
      )}
        <div className="relative">
          <MapPinIcon className="input-icon w-6 h-6" />
          <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} className="input-field pl-10" required />
        </div>
        <div className="relative">
          <PhoneIcon className="input-icon w-6 h-6" />
          <input type="text" name="contact" placeholder="Contact Number" value={formData.contact} onChange={handleChange} className="input-field pl-10" required />
        </div>
      </div>
    </div>
  );
};


export default ContactLocation;
