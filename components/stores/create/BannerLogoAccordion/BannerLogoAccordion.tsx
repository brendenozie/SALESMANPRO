"use client";

import React, {
  useRef,
  ChangeEvent,
  DragEvent,
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
  HeartIcon,
  FireIcon,
  SparklesIcon,
  ShieldCheckIcon,
  UsersIcon,
  GlobeAltIcon,
  LightBulbIcon,
  HandThumbUpIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { ICoreValue } from "@/types/typings";

export interface MediaAndValuesEditorProps {
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

const AVAILABLE_ICONS = {
  StarIcon,
  HeartIcon,
  FireIcon,
  SparklesIcon,
  ShieldCheckIcon,
  UsersIcon,
  GlobeAltIcon,
  LightBulbIcon,
  HandThumbUpIcon,
};

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
}: MediaAndValuesEditorProps) {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"media" | "values">("media");
  const [isCompressing, setIsCompressing] = useState(false);
  const [reorderValues, setReorderValues] = useState<ICoreValue[]>(coreValues || []);
  const [openIconPickerIndex, setOpenIconPickerIndex] = useState<number | null>(null);
  const [dragOverField, setDragOverField] = useState<string | null>(null);

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

  const processAndUploadFile = useCallback(
    async (field: "logoUrl" | "bannerUrl" | "videoUrl", file: File) => {
      if (field === "logoUrl" || field === "bannerUrl") {
        setIsCompressing(true);
        toast.loading("Optimizing imagery formats...", { id: "media-upload" });

        const maxWidth = field === "logoUrl" ? 500 : 1600;
        const options = {
          maxSizeMB: IMAGE_MAX_SIZE_MB,
          maxWidthOrHeight: maxWidth,
          useWebWorker: true,
        };

        try {
          const compressedFile = await imageCompression(file, options);
          await onUpload(field, compressedFile);
          toast.success("Image assets uploaded securely!", { id: "media-upload" });
        } catch (error) {
          console.error(error);
          toast.error("Compression processing failed.", { id: "media-upload" });
        } finally {
          setIsCompressing(false);
        }
      } else if (field === "videoUrl") {
        if (file.size > VIDEO_MAX_SIZE_BYTES) {
          toast.error("Video file payload exceeds the 5MB ceiling parameters.");
        } else {
          toast.loading("Uploading presentation reels...", { id: "media-upload" });
          await onUpload(field, file);
          toast.success("Video assets configured successfully!", { id: "media-upload" });
        }
      }
    },
    [onUpload]
  );

  const handleInputChange = (
    field: "logoUrl" | "bannerUrl" | "videoUrl",
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) processAndUploadFile(field, file);
    e.target.value = "";
  };

  const handleDragOver = (field: string, e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverField(field);
  };

  const handleDragLeave = () => {
    setDragOverField(null);
  };

  const handleDrop = (field: "logoUrl" | "bannerUrl" | "videoUrl", e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverField(null);
    const file = e.dataTransfer.files?.[0];
    if (file) processAndUploadFile(field, file);
  };

  const renderMediaActions = useCallback(
    (
      field: "logoUrl" | "bannerUrl" | "videoUrl",
      url: string | null | undefined,
      inputRef: React.RefObject<HTMLInputElement>
    ) => (
      <div className="flex items-center gap-2 z-10 sm:w-auto w-full justify-end">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02, y: -0.5 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
          className="px-4 py-2 text-xs font-bold bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors cursor-pointer"
          disabled={isCompressing}
        >
          <PencilIcon className="w-3.5 h-3.5" />
          {url ? "Modify" : "Upload File"}
        </motion.button>
        {url && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.02, y: -0.5 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              onRemove(field);
            }}
            className="px-3 py-2 text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40 rounded-xl flex items-center justify-center gap-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
            disabled={isCompressing}
          >
            <TrashIcon className="w-3.5 h-3.5" />
            Remove
          </motion.button>
        )}
      </div>
    ),
    [isCompressing, onRemove]
  );

  // useEffect(() => {
  //   if (coreValues && reorderValues.length !== coreValues.length) return;
  //   reorderValues.forEach((cv, i) => {
  //     handleUpdateCoreValue(i, "title", cv.title);
  //     if (cv.description != null) {
  //       handleUpdateCoreValue(i, "description", cv.description);
  //     }
  //     if (cv.icon != null) {
  //       handleUpdateCoreValue(i, "icon", cv.icon);
  //     }
  //   });
  // }, [reorderValues]);
  
  const handleReorder = (newOrder: ICoreValue[]) => {
    setReorderValues(newOrder);
    
    // Explicitly sync the new dragged layout to the parent 
    // without using a destructive useEffect loop
    newOrder.forEach((cv, i) => {
      handleUpdateCoreValue(i, "title", cv.title);
      if (cv.description != null) {
        handleUpdateCoreValue(i, "description", cv.description);
      }
      if (cv.icon != null) {
        handleUpdateCoreValue(i, "icon", cv.icon);
      }
    });
  };

  return (
    <section className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-3xl shadow-xl dark:shadow-2xl/40 overflow-hidden relative transition-colors duration-200">
      <Toaster position="bottom-right" />

      {/* Editor Context Heading Elements */}
      <div className="px-6 py-6 sm:px-8 sm:pt-8 sm:pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-50 dark:border-zinc-800/50">
        <div className="text-left">
          <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-50 tracking-tight">
            Brand Identity Assets
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
            Synchronize workspace media frameworks and operational value configurations.
          </p>
        </div>

        {/* Analytical Dynamic Progression Counter */}
        <div className="flex items-center gap-3 justify-start sm:justify-end border-t sm:border-none pt-3 sm:pt-0 border-slate-100 dark:border-zinc-800">
          <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase text-slate-400 dark:text-zinc-500">
            Profile Completion
          </span>
          <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-700/50">
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
              {Math.round(completion * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Modern Highlighting Micro-Progress Bar Track */}
      <div className="w-full h-[3px] bg-slate-100 dark:bg-zinc-800 relative">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
          initial={{ width: 0 }}
          animate={{ width: `${completion * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      {/* Segmented Sliding Filter Ribbon Layout */}
      <div className="flex justify-center border-b border-slate-100 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/30 p-2.5">
        <div className="flex bg-slate-200/50 dark:bg-zinc-800/80 p-1 rounded-xl w-full max-w-xs sm:max-w-sm shadow-inner">
          {(["media", "values"] as const).map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`relative flex-1 py-2 text-[11px] sm:text-xs font-bold tracking-wide uppercase transition-colors outline-none rounded-lg cursor-pointer ${
                  isSelected 
                    ? "text-slate-900 dark:text-white font-extrabold" 
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-lg shadow-sm border border-slate-200/20 dark:border-zinc-600/30"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  {tab === "media" ? "🖼️ Library Media" : "🌟 Core Identity"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Workspace Display Viewports */}
      <div className="p-5 sm:p-8 min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === "media" ? (
            <motion.div
              key="media-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Logo Row Wrapper */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 bg-slate-50/40 dark:bg-zinc-800/20 border border-slate-100 dark:border-zinc-800/80 rounded-2xl">
                <div className="max-w-md text-left">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Company Identity Logo</h4>
                  <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 leading-relaxed">
                    Square ratios work best. Transparent background formats preferred.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 rounded-2xl flex items-center justify-center overflow-hidden shadow-sm relative group transition-colors">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                    ) : (
                      <PhotoIcon className="w-7 h-7 text-slate-300 dark:text-zinc-600" />
                    )}
                  </div>
                  {renderMediaActions("logoUrl", logoUrl, logoInputRef)}
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleInputChange("logoUrl", e)}
                />
              </div>

              {/* Banner Area Drag & Drop Module */}
              <div className="space-y-2 text-left">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Hero Showcase Canvas Banner
                </label>
                <div
                  onDragOver={(e) => handleDragOver("bannerUrl", e)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop("bannerUrl", e)}
                  onClick={() => !bannerUrl && bannerInputRef.current?.click()}
                  className={`w-full h-40 sm:h-44 rounded-2xl border-2 border-dashed relative overflow-hidden transition-all flex flex-col items-center justify-center group ${
                    bannerUrl 
                      ? "border-slate-200 dark:border-zinc-700/60 cursor-default" 
                      : "border-slate-300 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer bg-slate-50/30 dark:bg-zinc-800/10"
                  } ${dragOverField === "bannerUrl" ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 scale-[0.995]" : ""}`}
                >
                  {bannerUrl ? (
                    <>
                      <img src={bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-950/40 dark:bg-zinc-950/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                        {renderMediaActions("bannerUrl", bannerUrl, bannerInputRef)}
                      </div>
                    </>
                  ) : (
                    <div className="text-center pointer-events-none p-4">
                      <PhotoIcon className="w-6 h-6 text-slate-400 dark:text-zinc-500 mx-auto group-hover:text-indigo-500 transition-colors" />
                      <p className="text-xs font-semibold text-slate-600 dark:text-zinc-300 mt-2">
                        Drag canvas image here, or <span className="text-indigo-600 dark:text-indigo-400 underline">browse</span>
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">Panoramic wide formats recommended (Max 480KB)</p>
                    </div>
                  )}
                </div>
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleInputChange("bannerUrl", e)}
                />
              </div>

              {/* Video Area Drag & Drop Module */}
              <div className="space-y-2 text-left">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Brand Narrative Reel Video
                </label>
                <div
                  onDragOver={(e) => handleDragOver("videoUrl", e)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop("videoUrl", e)}
                  onClick={() => !videoUrl && videoInputRef.current?.click()}
                  className={`w-full h-40 sm:h-44 rounded-2xl border-2 border-dashed relative overflow-hidden transition-all flex flex-col items-center justify-center group ${
                    videoUrl 
                      ? "border-slate-200 dark:border-zinc-700/60 cursor-default" 
                      : "border-slate-300 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer bg-slate-50/30 dark:bg-zinc-800/10"
                  } ${dragOverField === "videoUrl" ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 scale-[0.995]" : ""}`}
                >
                  {videoUrl ? (
                    <>
                      <video src={videoUrl} className="w-full h-full object-cover" controls={false} muted loop autoPlay />
                      <div className="absolute inset-0 bg-slate-950/40 dark:bg-zinc-950/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                        {renderMediaActions("videoUrl", videoUrl, videoInputRef)}
                      </div>
                    </>
                  ) : (
                    <div className="text-center pointer-events-none p-4">
                      <FilmIcon className="w-6 h-6 text-slate-400 dark:text-zinc-500 mx-auto group-hover:text-indigo-500 transition-colors" />
                      <p className="text-xs font-semibold text-slate-600 dark:text-zinc-300 mt-2">
                        Drag corporate video track here, or <span className="text-indigo-600 dark:text-indigo-400 underline">browse</span>
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">Standard MP4 configurations accepted (Max 5MB)</p>
                    </div>
                  )}
                </div>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleInputChange("videoUrl", e)}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="values-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800/60 pb-4 text-left">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Operational Foundations</h3>
                  <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">Drag blocks vertically to prioritize internal display ranking.</p>
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleAddCoreValue}
                  className="w-full sm:w-auto px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl border border-indigo-100/80 dark:border-indigo-900/40 flex items-center justify-center gap-1.5 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
                >
                  <PlusCircleIcon className="h-4 w-4" />
                  Append Principle
                </motion.button>
              </div>

              {/* Dynamic Reorder Framework Interface Wrapper */}
              <Reorder.Group axis="y" values={reorderValues} onReorder={handleReorder} className="space-y-3">
                {reorderValues.map((cv, i) => {
                  const SelectedIcon = AVAILABLE_ICONS[cv.icon as keyof typeof AVAILABLE_ICONS] || StarIcon;
                  const isPickerOpen = openIconPickerIndex === i;

                  return (
                    <Reorder.Item key={cv.id || i} value={cv} className="outline-none">
                      <motion.div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex gap-3 sm:gap-4 items-start relative group hover:border-slate-300 dark:hover:border-zinc-700 transition-all duration-150">
                        
                        {/* Core Drag handle column block area */}
                        <div className="cursor-grab active:cursor-grabbing text-slate-300 dark:text-zinc-600 hover:text-slate-500 dark:hover:text-zinc-400 pt-2.5 transition-colors touch-none">
                          <Bars3Icon className="w-4 h-4 sm:w-5 h-5" />
                        </div>

                        {/* Text Field Content Core Node Structure Input Stack */}
                        <div className="flex-1 space-y-3 text-left">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            
                            {/* Icon Picker Popover Trigger Wrapper */}
                            <div className="relative align-middle flex">
                              <button
                                type="button"
                                onClick={() => setOpenIconPickerIndex(isPickerOpen ? null : i)}
                                className="p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                              >
                                <SelectedIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                              </button>

                              <AnimatePresence>
                                {isPickerOpen && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.97, y: 4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.97, y: 4 }}
                                    className="absolute left-0 top-full mt-2 z-30 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-xl p-3 w-60"
                                  >
                                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-zinc-500 px-1 mb-2">Select Icon Glyph</p>
                                    <div className="grid grid-cols-4 gap-1">
                                      {Object.entries(AVAILABLE_ICONS).map(([name, Icon]) => (
                                        <button
                                          key={name}
                                          type="button"
                                          onClick={() => {
                                            handleUpdateCoreValue(i, "icon", name);
                                            setOpenIconPickerIndex(null);
                                          }}
                                          className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex justify-center cursor-pointer"
                                          title={name.replace("Icon", "")}
                                        >
                                          <Icon className="w-4 h-4 sm:w-5 h-5" />
                                        </button>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            <input
                              type="text"
                              placeholder="Value Headline (e.g., Transparency)"
                              value={cv.title}
                              onChange={(e) => handleUpdateCoreValue(i, "title", e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-600 bg-slate-50/30 dark:bg-zinc-800/20 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-500 transition-all"
                            />
                          </div>

                          <textarea
                            rows={2}
                            placeholder="Detail operational workflows, core meanings or targets regarding this parameter framework context..."
                            value={cv.description || ""}
                            onChange={(e) => handleUpdateCoreValue(i, "description", e.target.value)}
                            className="w-full p-3 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-600 dark:text-zinc-300 placeholder-slate-400 dark:placeholder-zinc-600 resize-none bg-slate-50/30 dark:bg-zinc-800/20 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-500 transition-all"
                          />
                        </div>

                        {/* Right-aligned entry destruction handle button link */}
                        <button
                          type="button"
                          onClick={() => handleRemoveCoreValue(i)}
                          className="text-slate-300 dark:text-zinc-600 hover:text-rose-500 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors mt-1 cursor-pointer"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </motion.div>
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>

              {!reorderValues.length && (
                <div className="text-center py-12 sm:py-14 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-50/30 dark:bg-zinc-900/20">
                  <p className="text-xs font-semibold text-slate-400 dark:text-zinc-500">No organizational principles initialized yet.</p>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-600 mt-0.5">Click "Append Principle" above to display credentials.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}