'use client';

import React, { ChangeEvent, useCallback, useState } from 'react';
import {
  PlusIcon,
  TrashIcon,
  UserIcon,
  DocumentTextIcon,
  PhotoIcon,
  SparklesIcon,
  CheckCircleIcon,
  HashtagIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import imageCompression from "browser-image-compression";
import { motion, AnimatePresence } from 'framer-motion';

export interface StoreProfileInfoProps {
  partnerLogos?: { src: string; alt: string }[] | null | undefined;
  founderName?: string | null | undefined;
  founderQuote?: string | null | undefined;
  founderImage?: string | File | null | undefined; // Accepts base64 data strings, remote URLs, or native file object references
  sectionSubtitle?: string | null | undefined;
  sectionTitle?: string | null | undefined;
  sectionDescription?: string | null | undefined;
  
  onUpload: (field: "founderImage" , file: File) => void;
  onRemove: (field: "founderImage" ) => void;

  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  handleArrayChange: (
    field: 'partnerLogos',
    index: number,
    key: string,
    value: string | number
  ) => void;
  addItem: (field: 'partnerLogos') => void;
  removeItem: (field: 'partnerLogos', index: number) => void;
}

interface CompressingState {
  index: number;
  field: "imageUrl" | "productImageUrl" | "founderImage";
}

/* ============================
   PREMIUM MEMOIZED INPUT FIELD
============================ */
const InputField = React.memo(
  ({
    label,
    name,
    value,
    onChange,
    placeholder,
    type = 'text',
    rows = 3,
  }: {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    placeholder: string;
    type?: string;
    rows?: number;
  }) => {
    const isFilled = value.trim().length > 0;

    return (
      <div className="space-y-1.5 relative group w-full">
        <div className="flex justify-between items-center px-1">
          <label
            htmlFor={name}
            className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors"
          >
            {label}
          </label>
          {isFilled && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-500">
              <CheckCircleIcon className="w-4 h-4 stroke-[2.5]" />
            </motion.span>
          )}
        </div>
        
        <div className="relative">
          {type === 'textarea' ? (
            <textarea
              id={name}
              name={name}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              rows={rows}
              className="w-full p-3.5 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm placeholder-zinc-400 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all shadow-sm resize-none"
            />
          ) : (
            <input
              id={name}
              type={type}
              name={name}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              className="w-full p-3.5 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm placeholder-zinc-400 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all shadow-sm"
            />
          )}
          <div className="absolute inset-0 rounded-xl bg-indigo-500/[0.02] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
        </div>
      </div>
    );
  }
);
InputField.displayName = 'InputField';

/* ============================
   PREMIUM ARRAY STAGE PANEL
============================ */
const ArraySection = React.memo(
  ({
    items,
    field,
    itemFields,
    handleArrayChange,
    addItem,
    removeItem,
  }: {
    items: { src: string; alt: string }[] | null | undefined;
    field: 'partnerLogos';
    itemFields: { key: string; placeholder: string; type: string; icon: React.ElementType }[];
    handleArrayChange: StoreProfileInfoProps['handleArrayChange'];
    addItem: StoreProfileInfoProps['addItem'];
    removeItem: StoreProfileInfoProps['removeItem'];
  }) => {
    const handleInputChange = useCallback(
      (idx: number, key: string, value: string) => {
        handleArrayChange(field, idx, key, value);
      },
      [field, handleArrayChange]
    );

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200/60 dark:border-zinc-800">
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Asset Registry</h4>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Manage partner branding logos and access metrics.</p>
          </div>
          <button
            onClick={() => addItem(field)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-950/70 transition-colors text-xs font-bold uppercase tracking-wider active:scale-95"
          >
            <PlusIcon className="w-3.5 h-3.5 stroke-[3]" /> Add Logo
          </button>
        </div>

        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin dark:scrollbar-thumb-zinc-800 scrollbar-thumb-zinc-200">
          <AnimatePresence mode="popLayout">
            {items?.map((item, idx) => (
              <motion.div
                key={idx}
                layout
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl flex items-center gap-4 group/row"
              >
                <div className="h-8 w-8 rounded-xl bg-zinc-200/60 dark:bg-zinc-800 text-zinc-500 font-mono text-xs flex items-center justify-center font-bold shrink-0 shadow-inner">
                  #{idx + 1}
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {itemFields.map(({ key, placeholder, type, icon: Icon }) => (
                    <div key={key} className="relative group">
                      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                      <input
                        type={type}
                        placeholder={placeholder}
                        value={(item as any)[key] || ''}
                        onChange={(e) => handleInputChange(idx, key, e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs placeholder-zinc-400 dark:placeholder-zinc-600 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all"
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => removeItem(field, idx)}
                  className="text-zinc-400 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-all shrink-0 active:scale-90"
                  aria-label="Remove asset allocation row"
                >
                  <TrashIcon className="w-4 h-4 stroke-[2]" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {!items?.length && (
            <div className="text-center py-10 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center p-6 bg-zinc-50/50 dark:bg-zinc-900/10">
              <PhotoIcon className="w-7 h-7 text-zinc-300 dark:text-zinc-700 mb-2 stroke-[1.5]" />
              <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">No partner allocations mapped.</p>
              <p className="text-[10px] text-zinc-400/80 dark:text-zinc-600 mt-0.5">Click "Add Logo" above to inject partner branding indices.</p>
            </div>
          )}
        </div>
      </div>
    );
  }
);
ArraySection.displayName = 'ArraySection';


/* ============================
   MAIN ARCHITECTURE STUDIOS
============================ */
export default function StoreProfileInfo({
  partnerLogos,
  founderName,
  founderQuote,
  founderImage,
  sectionSubtitle,
  sectionTitle,
  sectionDescription,
  handleChange,
  handleArrayChange,
  addItem,
  removeItem,
  onUpload,
  onRemove
}: StoreProfileInfoProps) {
  const [activeTab, setActiveTab] = useState<'founder' | 'marketing' | 'logos'>('founder');
  const [loadingFields, setLoadingFields] = useState<CompressingState[]>([]);

  // Compute standard visual fallback URL path if image is a File instance vs native String data url reference
  const imagePreviewUrl = React.useMemo(() => {
    if (!founderImage) return null;
    if (typeof founderImage === 'string') return founderImage;
    if (founderImage instanceof File) {
      try {
        return URL.createObjectURL(founderImage);
      } catch (e) {
        return null;
      }
    }
    return null;
  }, [founderImage]);

  // Clean, dedicated handler for compression and updating the profile portrait state
  const handleFounderImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingFields((prev) => [...prev, { index: 0, field: "founderImage" }]);

    const IMAGE_MAX_SIZE_MB = 0.48;
    const options = {
      maxSizeMB: IMAGE_MAX_SIZE_MB,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      if (onUpload) {
        onUpload('founderImage', compressedFile);
      }
    } catch (error) {
      console.error("Founder avatar compression failed:", error);
      alert("Could not process image. Please try adjusting your dimensions.");
    } finally {
      setLoadingFields((prev) => prev.filter((item) => item.field !== "founderImage"));
      e.target.value = "";
    }
  };

  const isCompressing = loadingFields.some((item) => item.field === "founderImage");

  // Safe reset trigger context execution parameters
  const clearFounderImage = () => {
    if (onRemove) {
      onRemove('founderImage');
    }
  };

  // Calculates structural form completion parameters for interactive UI states
  const completionStats = {
    founder: (founderName ? 1 : 0) + (founderQuote ? 1 : 0) + (founderImage ? 1 : 0),
    marketing: (sectionSubtitle ? 1 : 0) + (sectionTitle ? 1 : 0) + (sectionDescription ? 1 : 0),
    logos: partnerLogos?.length || 0
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-12 relative min-h-[600px]">
      
      {/* Background Decorative Matrix Blur nodes */}
      <div className="absolute top-1/4 right-10 -z-10 w-80 h-80 bg-indigo-500/[0.03] dark:bg-indigo-500/[0.01] rounded-full blur-[100px]" />
      <div className="absolute bottom-10 left-10 -z-10 w-96 h-96 bg-purple-500/[0.03] dark:bg-purple-500/[0.01] rounded-full blur-[120px]" />

      {/* DASHBOARD PROFILE HEADER BLOCK */}
      <header className="pb-8 border-b border-zinc-200/80 dark:border-zinc-800/80 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2.5 py-0.5 rounded-md border border-zinc-200/40 dark:border-zinc-700/50">Studio Portal</span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
              <SparklesIcon className="w-3.5 h-3.5 animate-pulse" /> Live Profile sync
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-black text-zinc-900 dark:text-white tracking-tight leading-none">
            Store Profile Settings
          </h2>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 max-w-xl">
            Configure metadata parameters, corporate brand identities, and deployment configurations.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SIDEBAR NAVIGATION GRID LAYER */}
        <nav className="lg:col-span-4 w-full flex flex-col gap-1.5 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 shadow-sm backdrop-blur-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 px-3 pt-2 pb-1">Settings Categories</p>
          
          <button
            onClick={() => setActiveTab('founder')}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left transition-all relative overflow-hidden group ${
              activeTab === 'founder' 
                ? 'bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700/80' 
                : 'hover:bg-white/60 dark:hover:bg-zinc-900/40'
            }`}
          >
            <div className="flex items-center gap-3 z-10">
              <span className={`p-2 rounded-lg transition-colors ${activeTab === 'founder' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-400'}`}>
                <UserIcon className="w-4 h-4" />
              </span>
              <div>
                <p className={`text-xs font-bold tracking-tight ${activeTab === 'founder' ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-600 dark:text-zinc-400'}`}>Founder Profiles</p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Executive bio indices</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold bg-zinc-200/60 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">
              {completionStats.founder}/3
            </span>
          </button>

          <button
            onClick={() => setActiveTab('marketing')}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left transition-all relative overflow-hidden group ${
              activeTab === 'marketing' 
                ? 'bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700/80' 
                : 'hover:bg-white/60 dark:hover:bg-zinc-900/40'
            }`}
          >
            <div className="flex items-center gap-3 z-10">
              <span className={`p-2 rounded-lg transition-colors ${activeTab === 'marketing' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-400'}`}>
                <DocumentTextIcon className="w-4 h-4" />
              </span>
              <div>
                <p className={`text-xs font-bold tracking-tight ${activeTab === 'marketing' ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-600 dark:text-zinc-400'}`}>Key Marketing Copy</p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Global context tags</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold bg-zinc-200/60 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">
              {completionStats.marketing}/3
            </span>
          </button>

          <button
            onClick={() => setActiveTab('logos')}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left transition-all relative overflow-hidden group ${
              activeTab === 'logos' 
                ? 'bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700/80' 
                : 'hover:bg-white/60 dark:hover:bg-zinc-900/40'
            }`}
          >
            <div className="flex items-center gap-3 z-10">
              <span className={`p-2 rounded-lg transition-colors ${activeTab === 'logos' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-400'}`}>
                <PhotoIcon className="w-4 h-4" />
              </span>
              <div>
                <p className={`text-xs font-bold tracking-tight ${activeTab === 'logos' ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-600 dark:text-zinc-400'}`}>Partner Branding</p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Corporate client vectors</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold bg-zinc-200/60 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">
              {completionStats.logos} Alloc
            </span>
          </button>
        </nav>

        {/* WORKSPACE STAGE CONTENT MATRIX */}
        <main className="lg:col-span-8 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 lg:p-8 rounded-[2rem] relative min-h-[440px]">
          <AnimatePresence mode="wait">
            
            {/* TABS 1: EXECUTIVE FOUNDER INTERFACE */}
            {activeTab === 'founder' && (
              <motion.div
                key="founder-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">Founder Profile Data</h3>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Add a high-trust verification metric to public storefront assets.</p>
                </div>

                {/* VISUAL IMAGE UPLOADER DRAG ZONE */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-1">
                    Founder Portrait Avatar
                  </span>
                  
                  <div className="flex flex-col sm:flex-row gap-5 items-center p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl">
                    <div className="relative w-24 h-24 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-center overflow-hidden group/avatar shrink-0 shadow-inner">
                      {imagePreviewUrl ? (
                        <>
                          <img 
                            src={imagePreviewUrl} 
                            alt="Founder preview" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={clearFounderImage}
                              className="p-1.5 bg-red-600 rounded-lg text-white hover:bg-red-700 transition-colors shadow-md transform scale-90 group-hover/avatar:scale-100 duration-200"
                              title="Remove avatar Image"
                            >
                              <TrashIcon className="w-4 h-4 stroke-[2]" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          {isCompressing ? (
                            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <UserIcon className="w-10 h-10 text-zinc-300 dark:text-zinc-700 stroke-[1.5]" />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 w-full text-center sm:text-left space-y-2">
                      <div className="text-xs text-zinc-400 dark:text-zinc-500">
                        <p className="font-semibold text-zinc-700 dark:text-zinc-300">Upload portrait identity asset</p>
                        <p className="text-[11px] mt-0.5">Supports PNG, JPEG or WebP assets. Recommended square aspect ratios.</p>
                      </div>
                      
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/80 cursor-pointer shadow-sm text-xs font-bold uppercase tracking-wider transition-all active:scale-95">
                        <ArrowUpTrayIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                        {isCompressing ? "Processing..." : "Choose File"}
                        <input 
                          type="file" 
                          accept="image/*" 
                          disabled={isCompressing}
                          onChange={handleFounderImageChange} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <InputField
                    label="Founder Signature Name"
                    name="founderName"
                    value={founderName ?? ''}
                    onChange={handleChange}
                    placeholder="e.g., Coach Timon Bright"
                  />

                  <InputField
                    label="Founder Quote / Motto"
                    name="founderQuote"
                    value={founderQuote ?? ''}
                    onChange={handleChange}
                    placeholder="e.g., A nurturing space for beautiful souls committed to flourishing."
                    type="textarea"
                    rows={4}
                  />
                </div>
              </motion.div>
            )}

            {/* TAB 2: MARKETING COPY META INTERFACE */}
            {activeTab === 'marketing' && (
              <motion.div
                key="marketing-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">Key Marketing Parameters</h3>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Incorporate search-indexed typography arrays for storefront sections.</p>
                </div>

                <div className="space-y-5 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField
                      label="Hero Section Subtitle Prefix"
                      name="sectionSubtitle"
                      value={sectionSubtitle ?? ''}
                      onChange={handleChange}
                      placeholder="e.g., Our Global Impact Portfolio"
                    />
                    <InputField
                      label="Main Interactive Title Array"
                      name="sectionTitle"
                      value={sectionTitle ?? ''}
                      onChange={handleChange}
                      placeholder="e.g., Proven Expertise, Verified Results"
                    />
                  </div>
                  <InputField
                    label="Descriptive Engine Summary Block"
                    name="sectionDescription"
                    value={sectionDescription ?? ''}
                    onChange={handleChange}
                    placeholder="Write a highly engaging structural overview context paragraph..."
                    type="textarea"
                    rows={4}
                  />
                </div>
              </motion.div>
            )}

            {/* TAB 3: LOGO REGISTER ARRAY MATRIX */}
            {activeTab === 'logos' && (
              <motion.div
                key="logos-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <ArraySection
                  items={partnerLogos}
                  field="partnerLogos"
                  itemFields={[
                    { key: 'src', placeholder: 'Image asset vector CDN URL (https://...)', type: 'url', icon: SparklesIcon },
                    { key: 'alt', placeholder: 'Accessibility alt text matrix query', type: 'text', icon: HashtagIcon },
                  ]}
                  handleArrayChange={handleArrayChange}
                  addItem={addItem}
                  removeItem={removeItem}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}