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

const ImageUploader = ({ images, setImages }: any) => {
  const [loading, setLoading] = useState(false);
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] } as Accept,
    multiple: true,
    onDrop: (acceptedFiles) => {
      setLoading(true);
      setTimeout(() => {
        setImages((prev: any) => {
          const newImages = acceptedFiles.map((file) => URL.createObjectURL(file));
          return Array.from(new Set([...prev, ...newImages]));
        });
        setLoading(false);
      }, 1000);
    }
  });

  return (
    <div className="p-6 bg-white shadow-lg rounded-2xl border border-gray-200">
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 p-8 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all flex flex-col items-center justify-center"
      >
        <input {...getInputProps()} />
        {loading ? (
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
            <ArrowUpTrayIcon className="w-10 h-10 text-gray-500 animate-pulse" />
          </motion.div>
        ) : (
          <>
            <ArrowUpTrayIcon className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-500">
              Drag & drop images here, or{" "}
              <span className="text-orange-500 font-semibold">click to upload</span>
            </p>
          </>
        )}
      </div>
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((img: any, index: any) => (
            <motion.div key={index} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="relative group overflow-hidden rounded-lg shadow-lg">
                <img src={img} alt="Preview" className="h-24 w-full object-cover rounded-lg transition-transform duration-200 group-hover:scale-105" />
                <button
                  className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition-all"
                  onClick={() => setImages((prev: any) => prev.filter((_: any, i: any) => i !== index))}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
