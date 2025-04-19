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

const EnginePerformance = ({ formData, setFormData }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl space-y-6 border border-gray-200">
      <h3 className="section-title">Engine & Performance</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" name="engineType" placeholder="Engine Type" value={formData.engineType} onChange={handleChange} className="input-field" />
        <input type="text" name="engineSize" placeholder="Engine Size" value={formData.engineSize} onChange={handleChange} className="input-field" />
        <input type="text" name="transmission" placeholder="Transmission" value={formData.transmission} onChange={handleChange} className="input-field" />
        <input type="text" name="drivetrain" placeholder="Drivetrain (AWD, FWD)" value={formData.drivetrain} onChange={handleChange} className="input-field" />
      </div>
    </div>
  );
};

export default EnginePerformance;
