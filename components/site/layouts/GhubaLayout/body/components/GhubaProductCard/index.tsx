'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

// Contexts
import { useStoreContext } from '@/contexts/StoreContext';
import { useStateContext } from '@/contexts/ContextProvider';

// Icons (Strictly Heroicons - No Lucide)
import { 
  HeartIcon, StarIcon, BoltIcon, TrashIcon, MinusIcon, PlusIcon, 
  ShoppingBagIcon, XMarkIcon, HomeIcon, BeakerIcon, KeyIcon,
  CalendarDaysIcon, MagnifyingGlassIcon
} from '@heroicons/react/24/solid';
import { 
  Square2StackIcon, MapPinIcon, CalendarIcon 
} from '@heroicons/react/24/outline';

const loaderProp = ({ src, width, quality }: any) => {
  const params = [`w=${width || 400}`];
  if (quality) params.push(`q=${quality}`);
  return `${src}?${params.join('&')}`;
};

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function GhubaProductCard({ product, toggleLike, likedItems }: any) {
  const router = useRouter();
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();

  const [imageError, setImageError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  // --- DYNAMIC TYPE DETECTION ---
  const itemType = useMemo(() => {
    // Flatten category data for comprehensive checking
    const cat = [
      product.category, 
      product.productCategory?.name, 
      product.subCategoryName, 
      product.subCategory?.name
    ].filter(Boolean).join(" ").toLowerCase();
    
    // 1. EXPLICIT E-COMMERCE OVERRIDES (Intercepts Agricultural, Tools, Brands, etc.)
    const explicitEcommerceKeywords = [
      "seeds", "fertilizers", "animal feeds", "veterinary", "farm tools", "equipment",
      "pest control", "irrigation", "greenhouse", "agricultural", "livestock", "medicine",
      "farm machinery", "agribusiness", "farming", "agroforestry", "hydroponics",
      "aquaponics", "agro-processing", "agro-inputs", "ppe", "agro"
    ];
    
    const isExplicitEcommerce = explicitEcommerceKeywords.some(k => cat.includes(k));

    // 2. AUTO ACCESSORY OVERRIDES (Intercepts Parts, Care, etc.)
    const autoAccessoryKeywords = [
      "accessories", "performance parts", "car care", "charging stations", "tires", "wheels",
      "audio", "navigation", "interior", "exterior", "safety", "emergency", "fluids", "oils",
      "batteries", "power systems", "lighting", "bulbs", "dash cams", "cameras", "security",
      "tracking", "diagnostic", "electronics", "tools", "parts", "camper", "sunroof", "wipers",
      "washers", "steering", "pedals", "seat covers", "mats", "wraps", "decals", "towing", 
      "trailers", "exhaust", "mufflers", "transmission", "drivetrain", "cooling", "radiators", 
      "suspension", "engine"
    ];
    
    const isAutoAccessory = autoAccessoryKeywords.some(k => cat.includes(k));

    if (isExplicitEcommerce || isAutoAccessory) {
      return "ECOMMERCE";
    }

    // 3. Property Listings
    if (cat.includes("property") || cat.includes("real estate") || cat.includes("land") || cat.includes("apartments") || Boolean(product.bedrooms)) return "PROPERTY";
    
    // 4. Automotive (Stricter physical vehicle check, removed generic mileage)
    if (cat.includes("auto") || cat.includes("cars") || cat.includes("vehicle") || cat.includes("motorcycle") || Boolean(product.vin) || Boolean(product.logbookStatus)) return "AUTO";
    
    // 5. Services & Booking
    if (cat.includes("service") || cat.includes("consulting") || cat.includes("cleaning") || cat.includes("plumbing") || cat.includes("tutoring") || cat.includes("coaching") || Boolean(product.duration)) return "SERVICE";
    
    // 6. Default to Standard E-Commerce
    return "ECOMMERCE";
  }, [product]);

  // --- CART & OPTIONS LOGIC (ECOMMERCE ONLY) ---
  const hasOptions = itemType === "ECOMMERCE" && (product.hasOptions || (product.options && product.options.length > 0));

  const currentItemSignature = hasOptions && Object.keys(selectedOptions).length > 0
    ? `${product.id}-${JSON.stringify(selectedOptions)}`
    : product.id;

  const quantity = cart.find((item: any) => {
    const matchId = item.selectedOptions 
      ? `${item.id}-${JSON.stringify(item.selectedOptions)}`
      : item.id;
    return matchId === product.id || matchId === currentItemSignature;
  })?.quantity || 0;

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Route non-buyable types directly to the detail view for inquiries/booking
    if (itemType !== "ECOMMERCE") {
      router.push(`/ghuba/productlist/${product.id}`);
      return;
    }

    // Handle Ecommerce flows
    if (hasOptions) {
      const initialOptions: Record<string, string> = {};
      product.options.forEach((opt: any) => {
        initialOptions[opt.name] = opt.values?.[0] || '';
      });
      setSelectedOptions(initialOptions);
      setFormError('');
      setIsModalOpen(true);
    } else {
      addToCart({ ...product });
    }
  };

  const handleConfirmOptions = () => {
    const missingOption = product.options.find((opt: any) => !selectedOptions[opt.name]);
    if (missingOption) {
      setFormError(`Please select an option for ${missingOption.name}`);
      return;
    }
    addToCart({ ...product, selectedOptions: { ...selectedOptions } });
    setIsModalOpen(false);
  };

  // --- DATA NORMALIZATION ---
  const displayTitle = itemType === "AUTO" && product.make ? `${product.make} ${product.model}` : product.name || product.title;
  const primaryImage = product.images?.length > 0 ? product.images[0] : 'https://via.placeholder.com/400x400?text=No+Image';
  
  const whatsappNumber = `${storeFormData?.contactPhone || "254700000000"}`;
  const message = encodeURIComponent(`I'm interested in: ${displayTitle}. Could you provide more details?`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  // --- DYNAMIC RENDERING HELPERS ---
  const renderBadge = () => {
    if (itemType === "PROPERTY") {
      return (
        <div className="absolute top-2 sm:top-4 left-0 z-20 bg-indigo-600 text-white text-[8px] sm:text-[10px] font-black px-2 sm:px-4 py-0.5 sm:py-1 rounded-r-full shadow-lg uppercase tracking-widest">
          {product.status === 'ACTIVE' ? 'Available' : 'Listing'}
        </div>
      );
    }
    if (itemType === "AUTO") {
      return (
        <div className="absolute top-2 sm:top-4 left-0 z-20 bg-slate-900 text-white text-[8px] sm:text-[10px] font-black px-2 sm:px-4 py-0.5 sm:py-1 rounded-r-full shadow-lg uppercase tracking-widest">
          {product.condition || 'Vehicle'}
        </div>
      );
    }
    if (itemType === "SERVICE") {
      return (
        <div className="absolute top-2 sm:top-4 left-0 z-20 bg-emerald-600 text-white text-[8px] sm:text-[10px] font-black px-2 sm:px-4 py-0.5 sm:py-1 rounded-r-full shadow-lg uppercase tracking-widest">
          Service
        </div>
      );
    }
    if (product.discount > 0) {
      return (
        <div className="absolute top-2 sm:top-4 left-0 z-20 bg-[#E63946] text-white text-[8px] sm:text-[10px] font-black px-2 sm:px-4 py-0.5 sm:py-1 rounded-r-full shadow-lg">
          {product.discount}% OFF
        </div>
      );
    }
    return null;
  };

  const renderQuickStats = () => {
    if (itemType === "PROPERTY") {
      const beds = product.bedrooms?.length > 0 ? product.bedrooms[0].type : "N/A";
      return (
        <div className="flex items-center gap-3 text-[10px] sm:text-xs text-zinc-500 font-bold">
          <span className="flex items-center gap-1"><HomeIcon className="w-3 h-3" /> {beds}</span>
          <span className="flex items-center gap-1"><BeakerIcon className="w-3 h-3" /> {product.bathrooms || '-'}</span>
          <span className="flex items-center gap-1"><Square2StackIcon className="w-3 h-3" /> {product.area ? `${product.area} sqft` : '-'}</span>
        </div>
      );
    }
    if (itemType === "AUTO") {
      return (
        <div className="flex items-center gap-3 text-[10px] sm:text-xs text-zinc-500 font-bold">
          <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> {product.year || '-'}</span>
          <span className="flex items-center gap-1"><KeyIcon className="w-3 h-3" /> {product.transmission?.substring(0, 4) || '-'}</span>
          <span className="flex items-center gap-1"><MapPinIcon className="w-3 h-3" /> {product.mileage ? `${(product.mileage/1000).toFixed(0)}k` : '-'}</span>
        </div>
      );
    }
    if (itemType === "SERVICE") {
      return (
        <div className="flex items-center gap-3 text-[10px] sm:text-xs text-zinc-500 font-bold">
          <span className="flex items-center gap-1"><CalendarDaysIcon className="w-3 h-3" /> {product.duration || 'Flexible'}</span>
          <span className="flex items-center gap-1"><MapPinIcon className="w-3 h-3" /> {product.location || 'Local'}</span>
        </div>
      );
    }
    // ECOMMERCE Default
    return (
      <div className="flex items-center space-x-0.5">
        {[...Array(5)].map((_, i) => (
          <StarIcon key={i} className={`h-2 w-2 sm:h-3 sm:w-3 ${i < (product.rating || 5) ? "text-[#E63946]" : "text-zinc-300 dark:text-zinc-800"}`} />
        ))}
        <span className="text-[8px] text-zinc-400 font-bold ml-1 sm:ml-2 uppercase">({product.reviews || 24})</span>
      </div>
    );
  };

  const getActionConfig = () => {
    switch (itemType) {
      case "PROPERTY":
        return { icon: <HomeIcon className="w-3 h-3 sm:w-4 sm:h-4" />, text: "Details" };
      case "AUTO":
        return { icon: <MagnifyingGlassIcon className="w-3 h-3 sm:w-4 sm:h-4" />, text: "Inspect" };
      case "SERVICE":
        return { icon: <CalendarDaysIcon className="w-3 h-3 sm:w-4 sm:h-4" />, text: "Book" };
      case "ECOMMERCE":
      default:
        return { icon: <ShoppingBagIcon className="w-3 h-3 sm:w-4 sm:h-4" />, text: hasOptions ? "Options" : "Add" };
    }
  };

  const actionConfig = getActionConfig();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -5 }}
        className="relative p-1.5 sm:p-4 group h-full"
      >
        <div 
          onClick={() => router.push(`/ghuba/productlist/${product.id}`)}
          className="relative h-full cursor-pointer bg-white dark:bg-[#0F0F0F] border border-zinc-200 dark:border-zinc-800 rounded-[1.2rem] sm:rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_20px_40px_-10px_rgba(230,57,70,0.15)] flex flex-col"
        >
          {/* --- IMAGE HEADER --- */}
          <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-900 shrink-0">
            {renderBadge()}

            <Image
              width={400}
              height={400}
              loader={loaderProp}
              src={imageError ? 'https://via.placeholder.com/400x400?text=Image+Not+Found' : primaryImage}
              alt={displayTitle}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={() => setImageError(true)}
            />

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
               <span className="bg-white text-black font-black text-[8px] sm:text-[10px] uppercase tracking-widest px-4 py-2 sm:px-6 sm:py-3 rounded-full translate-y-2 group-hover:translate-y-0 transition-transform duration-500 shadow-xl">
                 View Details
               </span>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); toggleLike(product.id); }}
              className={`absolute top-2 right-2 sm:top-4 sm:right-4 z-20 p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl backdrop-blur-md border transition-all active:scale-90 ${
                likedItems?.[product.id] 
                  ? "bg-[#E63946] text-white border-transparent" 
                  : "bg-black/20 text-white border-white/20 hover:bg-black/40"
              }`}
            >
              <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          {/* --- PRODUCT INFO --- */}
          <div className="p-4 sm:p-6 flex flex-col flex-grow justify-between gap-3 sm:gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start gap-1">
                <h3 className="text-[11px] sm:text-lg font-black uppercase tracking-tighter text-zinc-900 dark:text-white line-clamp-2 leading-tight h-10 sm:h-14">
                  {displayTitle}
                </h3>
                {itemType === "ECOMMERCE" && (
                  <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md shrink-0">
                     <BoltIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#E63946]" />
                     <span className="hidden sm:block text-[8px] font-black dark:text-zinc-300 uppercase">New</span>
                  </div>
                )}
              </div>
              
              {renderQuickStats()}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/50 mt-auto">
              <div className="flex flex-col">
                <span className="text-[8px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Price</span>
                <span className="text-sm sm:text-xl font-black text-zinc-900 dark:text-white mt-0.5 sm:mt-1 italic">
                  <span className="text-[9px] sm:text-xs not-italic mr-0.5 font-bold text-zinc-400">KES</span>
                  {(product.finalPrice || product.sellingPrice || 0).toLocaleString()}
                </span>
              </div>

              {/* Action Tray */}
              <div className="mt-auto">
                <AnimatePresence mode="wait">
                  {itemType === "ECOMMERCE" && quantity > 0 ? (
                    <motion.div 
                      key="in-cart"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-between bg-slate-900 rounded-2xl p-1 shadow-xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button onClick={() => decreaseQuantity(currentItemSignature)} className="p-2 sm:p-3 text-white hover:bg-white/10 rounded-xl transition-colors">
                        {quantity === 1 ? <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" /> : <MinusIcon className="w-3 h-3 sm:w-4 sm:h-4" />}
                      </button>
                      <span className="text-white font-black text-xs sm:text-sm px-1 sm:px-2">{quantity}</span>
                      <button onClick={() => addToCart({ ...product, selectedOptions })} className="p-2 sm:p-3 text-white hover:bg-white/10 rounded-xl transition-colors">
                        <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="add-btn"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleActionClick}
                      className={`w-full flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 text-black dark:text-white border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-all duration-300 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 ${itemType !== 'ECOMMERCE' && 'bg-zinc-900 text-white dark:bg-white dark:text-black border-transparent'}`}
                    >
                      {actionConfig.icon}
                      {actionConfig.text}
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
                
            {/* Quick Contact Overlay */}
            <div className="flex items-end justify-center pt-1">
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-[#25D366] text-white py-2 sm:py-2.5 rounded-xl flex items-center justify-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#25D366]/20 transform translate-y-2 opacity-90 hover:opacity-100 hover:translate-y-0 transition-all"
              >
                <WhatsAppIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                Inquire
              </a>
            </div>
          </div>

          <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#E63946]/20 to-transparent shrink-0" />
        </div>
      </motion.div>

      {/* Options Selection Backdrop & Modal Windows (E-commerce Only) */}
      <AnimatePresence>
        {isModalOpen && itemType === "ECOMMERCE" && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative bg-white dark:bg-[#0F0F0F] w-full max-w-md p-6 rounded-[1.5rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 z-10 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight">Configure Item</h4>
                  <p className="text-xs text-zinc-400">Specify preferences below to continue.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="text-xs bg-red-500/10 text-[#E63946] border border-red-500/20 px-3 py-2 rounded-xl font-bold">
                  {formError}
                </div>
              )}

              <div className="space-y-4">
                {product.options?.map((option: any) => (
                  <div key={option.name} className="space-y-2">
                    <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">
                      {option.name} <span className="text-[#E63946]">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {option.values?.map((val: string) => {
                        const isSelected = selectedOptions[option.name] === val;
                        return (
                          <button
                            key={val}
                            onClick={() => {
                              setSelectedOptions(prev => ({ ...prev, [option.name]: val }));
                              setFormError('');
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                              isSelected
                                ? 'bg-[#E63946] border-[#E63946] text-white shadow-md'
                                : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                            }`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={handleConfirmOptions}
                  className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg hover:bg-[#E63946] dark:hover:bg-[#E63946] hover:text-white"
                >
                  Confirm Configuration
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}