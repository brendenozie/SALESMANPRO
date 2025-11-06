"use client";

import React, {
  useRef,
  ChangeEvent,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import imageCompression from "browser-image-compression";
import {
  PhotoIcon,
  PencilIcon,
  TrashIcon,
  PlusCircleIcon,
  FilmIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
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

export default function MediaAndValuesEditor({
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

  const [activeTab, setActiveTab] = useState<"media" | "values">("media");
  const [isCompressing, setIsCompressing] = useState(false);
  const [reorderValues, setReorderValues] = useState<ICoreValue[]>(coreValues || []);

  
  {/* 🔹 Icon picker state now global */}
  const [openIconPickerIndex, setOpenIconPickerIndex] = useState<number | null>(null);

  // Keep local reorderValues in sync with incoming coreValues
  useEffect(() => {
    if (coreValues && JSON.stringify(coreValues) !== JSON.stringify(reorderValues)) {
      setReorderValues(coreValues);
    }
  }, [coreValues]);

  const VIDEO_MAX_SIZE_BYTES = 5 * 1024 * 1024;
  const IMAGE_MAX_SIZE_MB = 0.48;

  const completion = useMemo(() => {
    let score = 0;
    if (logoUrl) score += 0.33;
    if (bannerUrl) score += 0.33;
    if (coreValues?.length) score += 0.34;
    return Math.min(score, 1);
  }, [logoUrl, bannerUrl, coreValues]);

  const handleFileChange = useCallback(
    async (
      field: "logoUrl" | "bannerUrl" | "videoUrl",
      e: ChangeEvent<HTMLInputElement>
    ) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (field === "logoUrl" || field === "bannerUrl") {
        setIsCompressing(true);
        toast.loading("Compressing image...", { id: "compress" });

        const maxWidth = field === "logoUrl" ? 500 : 1600;
        const options = {
          maxSizeMB: IMAGE_MAX_SIZE_MB,
          maxWidthOrHeight: maxWidth,
          useWebWorker: true,
        };

        try {
          const compressedFile = await imageCompression(file, options);
          await onUpload(field, compressedFile);
          toast.success("Image uploaded successfully!", { id: "compress" });
        } catch (error) {
          console.error(error);
          toast.error("Image compression failed.", { id: "compress" });
        } finally {
          setIsCompressing(false);
          e.target.value = "";
        }
      } else if (field === "videoUrl") {
        if (file.size > VIDEO_MAX_SIZE_BYTES) {
          toast.error("Video file must be less than 5MB.");
          e.target.value = "";
        } else {
          await onUpload(field, file);
          toast.success("Video uploaded successfully!");
        }
      }
    },
    [onUpload]
  );

  const UploadCardClasses =
    "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition duration-200 cursor-pointer text-gray-500 hover:border-indigo-500 hover:text-indigo-600 bg-gradient-to-tr from-indigo-50/60 to-white";

  const commonButtonClasses =
    "px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition disabled:opacity-50 disabled:cursor-wait";

  const renderMediaActions = useCallback(
    (
      field: "logoUrl" | "bannerUrl" | "videoUrl",
      url: string | null | undefined,
      inputRef: React.RefObject<HTMLInputElement>
    ) => (
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => inputRef.current?.click()}
          className={`${commonButtonClasses} bg-indigo-600 text-white hover:bg-indigo-700`}
          disabled={isCompressing}
        >
          <PencilIcon className="w-5 h-5" />
          {url ? "Change" : "Upload"}
        </motion.button>
        {url && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onRemove(field)}
            className={`${commonButtonClasses} bg-red-100 text-red-600 hover:bg-red-200`}
            disabled={isCompressing}
          >
            <TrashIcon className="w-5 h-5" />
            Remove
          </motion.button>
        )}
      </div>
    ),
    [isCompressing, onRemove]
  );

  // Persist reorder changes back to parent whenever order changes
  useEffect(() => {
    if (coreValues && reorderValues.length !== coreValues.length) return;
    reorderValues.forEach((cv, i) => {
      handleUpdateCoreValue(i, "title", cv.title);
      if (cv.description != null)
        handleUpdateCoreValue(i, "description", cv.description);
    });
  }, [reorderValues]);

  return (
    <section className="max-w-5xl mx-auto px-4 py-10 bg-gradient-to-tr from-white via-indigo-50 to-white rounded-3xl shadow-2xl relative">
      <Toaster position="bottom-right" />

      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-extrabold text-gray-900 text-center mb-6"
      >
        ✨ Company Media & Core Values Setup
      </motion.h2>

      <div className="w-full bg-gray-200 h-2 rounded-full mb-6">
        <motion.div
          className="h-2 bg-indigo-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${completion * 100}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-8 relative">
        {["media", "values"].map((tab) => (
          <motion.button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative py-3 px-8 rounded-xl text-lg font-semibold transition-all duration-300 ${
              activeTab === tab
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-400"
            }`}
          >
            {tab === "media" ? "🖼 Media" : "🌟 Core Values"}
          </motion.button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === "media" ? (
          <motion.div
            key="media"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4"
            >
              <div>
                <p className="font-bold text-gray-700">Company Logo</p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG/JPG — recommended 200×200px
                </p>
              </div>
              <div className="w-24 h-24 bg-gray-50 rounded-full overflow-hidden flex items-center justify-center shadow-inner">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <PhotoIcon className="w-10 h-10 text-gray-300" />
                )}
              </div>
              {renderMediaActions("logoUrl", logoUrl, logoInputRef)}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange("logoUrl", e)}
              />
            </motion.div>

            {/* Banner */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100 space-y-4"
            >
              <p className="font-bold text-gray-700">
                Company Banner / Hero Image
              </p>
              <div
                className={`${UploadCardClasses} w-full h-48 relative overflow-hidden`}
                onClick={() => bannerInputRef.current?.click()}
              >
                {bannerUrl ? (
                  <>
                    <img
                      src={bannerUrl}
                      alt="Banner"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute top-3 right-3"
                    >
                      {renderMediaActions("bannerUrl", bannerUrl, bannerInputRef)}
                    </motion.div>
                  </>
                ) : (
                  <div className="text-center">
                    <PhotoIcon className="w-10 h-10 text-gray-400 mx-auto" />
                    <p className="text-sm mt-2">
                      Click or drag a banner (Rec. 1200x300px)
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange("bannerUrl", e)}
              />
            </motion.div>

            {/* Video */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100 space-y-4"
            >
              <p className="font-bold text-gray-700">Intro Video (Optional)</p>
              <div
                className={`${UploadCardClasses} w-full h-48 relative`}
                onClick={() => videoInputRef.current?.click()}
              >
                {videoUrl ? (
                  <>
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute top-3 right-3">
                      {renderMediaActions("videoUrl", videoUrl, videoInputRef)}
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <FilmIcon className="w-10 h-10 text-gray-400 mx-auto" />
                    <p className="text-sm mt-2">Click or drop video (Max 5MB)</p>
                  </div>
                )}
              </div>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => handleFileChange("videoUrl", e)}
              />
            </motion.div>
          </motion.div>
        ) : (
         <motion.div
  key="values"
  initial={{ opacity: 0, x: -40 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: 40 }}
  transition={{ duration: 0.25 }}
  className="bg-white p-6 rounded-xl shadow-md"
>
  <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-4">
    <h3 className="text-xl font-bold text-gray-800">
      Define Your Core Principles
    </h3>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleAddCoreValue}
      className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-semibold p-2 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
    >
      <PlusCircleIcon className="h-5 w-5 mr-1" />
      Add Value
    </motion.button>
  </div>


  {/* ✅ Reorder Group */}
  <Reorder.Group
    axis="y"
    values={reorderValues}
    onReorder={setReorderValues}
    className="space-y-4"
  >
    {reorderValues.map((cv, i) => {
      // static dictionary of icons (outside React hooks)
      const availableIcons = {
        StarIcon,
        HeartIcon: require("@heroicons/react/24/outline").HeartIcon,
        FireIcon: require("@heroicons/react/24/outline").FireIcon,
        SparklesIcon: require("@heroicons/react/24/outline").SparklesIcon,
        ShieldCheckIcon: require("@heroicons/react/24/outline").ShieldCheckIcon,
        UsersIcon: require("@heroicons/react/24/outline").UsersIcon,
        GlobeAltIcon: require("@heroicons/react/24/outline").GlobeAltIcon,
        LightBulbIcon: require("@heroicons/react/24/outline").LightBulbIcon,
        HandThumbUpIcon: require("@heroicons/react/24/outline").HandThumbUpIcon,
      };

      const SelectedIcon =
        (cv.icon && availableIcons[cv.icon as keyof typeof availableIcons]) ||
        StarIcon;

      const isPickerOpen = openIconPickerIndex === i;

      return (
        <Reorder.Item key={i} value={cv}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="relative bg-gradient-to-tr from-indigo-50/70 to-white border border-indigo-100 rounded-lg p-4 shadow-sm"
          >
            {/* Remove button */}
            <button
              type="button"
              onClick={() => handleRemoveCoreValue(i)}
              className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1 rounded-full bg-white/80 hover:bg-red-50 transition"
            >
              <TrashIcon className="h-5 w-5" />
            </button>

            {/* Icon + title */}
            <div className="flex items-center gap-3">
              {/* Icon Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenIconPickerIndex(isPickerOpen ? null : i)
                  }
                  className="p-2 bg-white border border-gray-200 rounded-md hover:border-indigo-400 transition"
                >
                  <SelectedIcon className="w-6 h-6 text-indigo-500" />
                </button>

                {isPickerOpen && (
                  <div className="absolute z-30 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl p-4 w-80 max-h-64 overflow-y-auto">
                      <div className="grid grid-cols-6 gap-4">
                        {Object.entries(availableIcons).map(([name, Icon]) => (
                          <button
                            key={name}
                            type="button"
                            onClick={() => {
                              handleUpdateCoreValue(i, "icon", name);
                              setOpenIconPickerIndex(null);
                            }}
                            className="p-3 rounded-lg hover:bg-indigo-50 transition flex flex-col items-center justify-center group"
                          >
                            <Icon className="w-8 h-8 text-gray-800 group-hover:text-indigo-600 transition" />
                            <span className="text-[10px] text-gray-400 mt-1 group-hover:text-indigo-500">
                              {name.replace("Icon", "")}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                )}
              </div>

              <input
                type="text"
                placeholder="Value Title (e.g., Integrity)"
                value={cv.title}
                onChange={(e) =>
                  handleUpdateCoreValue(i, "title", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-md font-semibold text-gray-800 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <textarea
              rows={2}
              placeholder="Describe this value..."
              value={cv.description || ""}
              onChange={(e) =>
                handleUpdateCoreValue(i, "description", e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-indigo-500 focus:border-indigo-500 mt-3"
            />
          </motion.div>
        </Reorder.Item>
      );
    })}
  </Reorder.Group>

  {!reorderValues.length && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg"
    >
      Click “Add Value” to define what drives your company.
    </motion.div>
  )}
</motion.div>

        )}
      </AnimatePresence>
    </section>
  );
}
