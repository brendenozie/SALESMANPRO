import React, { useRef, ChangeEvent, useState } from "react";
import imageCompression from "browser-image-compression";
import {
  PhotoIcon,
  PencilIcon,
  TrashIcon,
  PlusCircleIcon,
  FilmIcon,
  ArrowPathIcon, // Added for loading state
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { ICoreValue } from "@/types/typings";

export interface BannerLogoAccordionProps {
  logoUrl?: string | null;
  bannerUrl?: string | null;
  videoUrl?: string | null;
  onUpload: (field: "logoUrl" | "bannerUrl" | "videoUrl", file: File) => void;
  onRemove: (field: "logoUrl" | "bannerUrl" | "videoUrl") => void;
  coreValues?: ICoreValue[] | null;
  handleUpdateCoreValue: (
    index: number,
    field: keyof ICoreValue,
    value: string
  ) => void;
  handleAddCoreValue: () => void;
  handleRemoveCoreValue: (index: number) => void;
}

export default function BannerLogoAccordion({
  logoUrl,
  bannerUrl,
  videoUrl,
  onUpload,
  onRemove,
  coreValues,
  handleUpdateCoreValue,
  handleAddCoreValue,
  handleRemoveCoreValue,
}: BannerLogoAccordionProps) {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // 1. NEW STATE: Manage compression status for visual feedback
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  // Make the function async to await compression
  const handleFileChange = async (
    field: "logoUrl" | "bannerUrl" | "videoUrl",
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Define size limits
    const VIDEO_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
    const IMAGE_MAX_SIZE_MB = 0.48; // ~480KB

    if (field === "logoUrl" || field === "bannerUrl") {
      // Start loading state
      setIsCompressing(true);

      // Define optimal resolution based on field for better visual quality
      // Logos need less resolution than banners
      const maxWidth = field === "logoUrl" ? 500 : 1600; 

      // --- Image Compression Logic ---
      console.log(`Original image size: ${(file.size / 1024).toFixed(2)} KB`);

      const options = {
        maxSizeMB: IMAGE_MAX_SIZE_MB,
        maxWidthOrHeight: maxWidth, 
        useWebWorker: true,
      };

      try {
        // This will compress the file, or return it if it's already small
        const compressedFile = await imageCompression(file, options);
        console.log(
          `Compressed image size: ${(compressedFile.size / 1024).toFixed(2)} KB`
        );
        
        // Pass the *compressed* file to the onUpload handler
        onUpload(field, compressedFile);
      } catch (error) {
        console.error("Image compression failed:", error);
        alert("Image compression failed. Please try another file.");
      } finally {
        // Stop loading state and clear input regardless of success/fail
        setIsCompressing(false);
        e.target.value = ""; 
      }
    } else if (field === "videoUrl") {
      // --- Video Validation Logic (no compression) ---
      if (file.size > VIDEO_MAX_SIZE_BYTES) {
        alert("Video file must be less than 5MB.");
        e.target.value = ""; // Clear input
      } else {
        // Pass the valid video file
        onUpload(field, file);
      }
    }
  };

  const commonButtonClasses = "px-4 py-2 rounded-xl flex items-center gap-2 shadow transition disabled:opacity-50 disabled:cursor-wait";

  return (
    <section className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-900 text-center"
      >
        Company Media & Values
      </motion.h2>

      {/* 🛑 Visual Feedback Overlay for Compression */}
      {isCompressing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-2xl flex items-center space-x-3">
            <ArrowPathIcon className="w-6 h-6 text-indigo-600 animate-spin" />
            <p className="text-lg font-medium text-gray-800">Compressing Image for Optimal Performance...</p>
          </div>
        </div>
      )}
      {/* 🛑 END Visual Feedback Overlay */}

      {/* --- Logo Upload --- */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-md p-6 flex items-center gap-6 transition"
      >
        <div className="w-28 h-28 bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo Preview"
              className="w-full h-full object-contain"
            />
          ) : (
            <PhotoIcon className="w-12 h-12 text-gray-300" />
          )}
        </div>
        
        <div className="flex-1 space-y-3">
          <p className="font-semibold text-gray-700">Company Logo</p>
          <div className="flex gap-3">
            <button
              onClick={() => logoInputRef.current?.click()}
              className={`${commonButtonClasses} bg-indigo-600 text-white hover:bg-indigo-700`}
              disabled={isCompressing} // Disabled when compressing
            >
              <PencilIcon className="w-5 h-5" />
              {logoUrl ? "Change" : "Upload"}
            </button>
            {logoUrl && (
              <button
                onClick={() => onRemove("logoUrl")}
                className={`${commonButtonClasses} bg-red-100 text-red-600 hover:bg-red-200`}
                disabled={isCompressing} // Disabled when compressing
              >
                <TrashIcon className="w-5 h-5" />
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500">
            PNG/JPG, Rec. 200×200px.
            <span className="font-medium">
              {" "}
              Images are automatically compressed.
            </span>
          </p>
        </div>
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange("logoUrl", e)}
        />
      </motion.div>

      {/* --- Banner Upload --- */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-md p-6 space-y-3"
      >
        <p className="font-semibold text-gray-700">Company Banner</p>
        <div
          className="relative w-full h-56 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer group"
          onClick={() => !isCompressing && bannerInputRef.current?.click()} // Prevent click when compressing
        >
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt="Banner Preview"
              className="w-full h-full object-cover group-hover:opacity-90 transition"
            />
          ) : (
            <div className="text-center">
              <PhotoIcon className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-gray-500">Click to upload a banner</p>
            </div>
          )}

          {bannerUrl && (
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  !isCompressing && bannerInputRef.current?.click(); // Prevent click when compressing
                }}
                className="p-2 bg-white/80 rounded-full shadow hover:bg-white transition"
                disabled={isCompressing}
              >
                <PencilIcon className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove("bannerUrl");
                }}
                className="p-2 bg-white/80 rounded-full shadow hover:bg-red-100 transition"
                disabled={isCompressing}
              >
                <TrashIcon className="w-5 h-5 text-red-600" />
              </button>
            </div>
          )}
        </div>
        
        <p className="text-xs text-gray-500">
          Rec. 1200×300px.
          <span className="font-medium">
            {" "}
            Images are automatically compressed.
          </span>
        </p>
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange("bannerUrl", e)}
        />
      </motion.div>

      {/* --- Video Upload --- */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-md p-6 space-y-3"
      >
        <p className="font-semibold text-gray-700">Company Intro Video</p>
        <div
          className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer group"
          onClick={() => !isCompressing && videoInputRef.current?.click()}
        >
          {videoUrl ? (
            <video
              src={videoUrl}
              controls
              className="w-full h-full object-cover group-hover:opacity-90 transition"
            />
          ) : (
            <div className="text-center">
              <FilmIcon className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-gray-500">Click to upload an intro video</p>
            </div>
          )}

          {videoUrl && (
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  !isCompressing && videoInputRef.current?.click();
                }}
                className="p-2 bg-white/80 rounded-full shadow hover:bg-white transition"
                disabled={isCompressing}
              >
                <PencilIcon className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove("videoUrl");
                }}
                className="p-2 bg-white/80 rounded-full shadow hover:bg-red-100 transition"
                disabled={isCompressing}
              >
                <TrashIcon className="w-5 h-5 text-red-600" />
              </button>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Recommended format: <span className="font-medium">MP4, MOV</span> —
          under 5MB (no compression applied)
        </p>
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => handleFileChange("videoUrl", e)}
        />
      </motion.div>

      {/* --- Core Values --- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-md p-6 space-y-6"
      >
        <div className="flex justify-between items-center">
          <p className="font-semibold text-gray-700">Core Values</p>
          <button
            type="button"
            onClick={handleAddCoreValue}
            className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            <PlusCircleIcon className="h-5 w-5 mr-1" />
            Add Value
          </button>
        </div>

        <div className="grid gap-4">
          {(coreValues || []).map((cv, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-gray-50 rounded-xl border shadow-sm p-4 space-y-3"
            >
              <button
                type="button"
                onClick={() => handleRemoveCoreValue(i)}
                className="absolute top-3 right-3 text-red-500 hover:text-red-700"
              >
                <TrashIcon className="h-5 w-5" />
              </button>

              <input
                type="text"
                placeholder="Value Title"
                value={cv.title}
                onChange={(e) =>
                  handleUpdateCoreValue(i, "title", e.target.value)
                }
                className="w-full p-2 border rounded-md text-sm focus:ring-indigo-400 focus:border-indigo-400"
              />
              <textarea
                rows={2}
                placeholder="Description"
                value={cv.description || ""}
                onChange={(e) =>
                  handleUpdateCoreValue(i, "description", e.target.value)
                }
                className="w-full p-2 border rounded-md text-sm focus:ring-indigo-400 focus:border-indigo-400"
              />
              <input
                type="text"
                placeholder="Icon name (e.g. StarIcon)"
                value={cv.icon || ""}
                onChange={(e) =>
                  handleUpdateCoreValue(i, "icon", e.target.value)
                }
                className="w-full p-2 border rounded-md text-sm focus:ring-indigo-400 focus:border-indigo-400"
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}