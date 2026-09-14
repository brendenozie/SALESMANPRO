'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

// Contexts
import { useStoreContext } from '@/contexts/StoreContext';
import { useStateContext } from '@/contexts/ContextProvider';

// Icons
import {
  HeartIcon, StarIcon, BoltIcon, TrashIcon, MinusIcon, PlusIcon,
  ShoppingBagIcon, XMarkIcon, HomeIcon, BeakerIcon, KeyIcon,
  CalendarDaysIcon, MagnifyingGlassIcon, VideoCameraIcon
} from '@heroicons/react/24/solid';
import {
  Square2StackIcon, MapPinIcon, CalendarIcon
} from '@heroicons/react/24/outline';

import { resolveProductType } from '@/lib/ghuba-product-type';
import { getListingPublicUrl } from '@/lib/ghuba-slug';
import { resolveProductMedia } from '@/lib/product-media-resolver';

const loaderProp = ({ src, width, quality }: any) => {
  if (src.startsWith('data:')) return src;
  const separator = src.includes('?') ? '&' : '?';
  const params = [`w=${width || 400}`];
  if (quality) params.push(`q=${quality}`);
  return `${src}${separator}${params.join('&')}`;
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

  const itemType = useMemo(() => resolveProductType(product), [product]);

  // Resolve media using universal media engine (guaranteed poster, responsive WebP variants, video detection)
  const resolvedMedia = useMemo(() => resolveProductMedia(product), [product]);
  const primaryImage = resolvedMedia.primaryImageUrl;

  // Both ECOMMERCE and AUTO can be added to cart
  const canAddToCart = itemType === "ECOMMERCE" || itemType === "AUTO";

  const hasOptions = canAddToCart && (product.hasOptions || (product.options && product.options.length > 0));

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

    if (!canAddToCart) {
      router.push(getListingPublicUrl(product));
      return;
    }

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

  const displayTitle = itemType === "AUTO" && product.make ? `${product.make} ${product.model}` : product.name || product.title;

  const whatsappNumber = `${storeFormData?.contactPhone || "254700000000"}`;
  const message = encodeURIComponent(`I'm interested in: ${displayTitle}. Could you provide more details?`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const renderBadge = () => {
    if (itemType === "PROPERTY") {
      return (
        <div className="absolute top-3 left-0 z-20 bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-r-full shadow-md uppercase tracking-widest">
          {product.status === 'ACTIVE' ? 'Available' : 'Listing'}
        </div>
      );
    }
    if (itemType === "AUTO") {
      return (
        <div className="absolute top-3 left-0 z-20 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white text-[10px] font-black px-3 py-1 rounded-r-full shadow-md uppercase tracking-widest">
          {product.condition || 'Vehicle'}
        </div>
      );
    }
    if (itemType === "SERVICE") {
      return (
        <div className="absolute top-3 left-0 z-20 bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-r-full shadow-md uppercase tracking-widest">
          Service
        </div>
      );
    }
    if (product.discount > 0) {
      return (
        <div className="absolute top-3 left-0 z-20 bg-[#E63946] text-white text-[10px] font-black px-3 py-1 rounded-r-full shadow-md">
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
        <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 font-bold">
          <span className="flex items-center gap-1"><HomeIcon className="w-3 h-3" /> {beds}</span>
          <span className="flex items-center gap-1"><BeakerIcon className="w-3 h-3" /> {product.bathrooms || '-'}</span>
          <span className="flex items-center gap-1"><Square2StackIcon className="w-3 h-3" /> {product.area ? `${product.area} sqft` : '-'}</span>
        </div>
      );
    }
    if (itemType === "AUTO") {
      return (
        <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 font-bold">
          <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> {product.year || '-'}</span>
          <span className="flex items-center gap-1"><KeyIcon className="w-3 h-3" /> {product.transmission?.substring(0, 4) || '-'}</span>
          <span className="flex items-center gap-1"><MapPinIcon className="w-3 h-3" /> {product.mileage ? `${(product.mileage / 1000).toFixed(0)}k` : '-'}</span>
        </div>
      );
    }
    if (itemType === "SERVICE") {
      return (
        <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 font-bold">
          <span className="flex items-center gap-1"><CalendarDaysIcon className="w-3 h-3" /> {product.duration || 'Flexible'}</span>
          <span className="flex items-center gap-1"><MapPinIcon className="w-3 h-3" /> {product.location || 'Local'}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-0.5">
        {[...Array(5)].map((_, i) => (
          <StarIcon key={i} className={`h-3 w-3 ${i < (product.rating || 5) ? "text-amber-400" : "text-zinc-200 dark:text-zinc-700"}`} />
        ))}
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold ml-2 uppercase">({product.reviews || 24})</span>
      </div>
    );
  };

  const actionConfig = (() => {
    switch (itemType) {
      case "PROPERTY": return { icon: <HomeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: "Details" };
      case "AUTO": return { icon: <ShoppingBagIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: "Add to Cart" };
      case "SERVICE": return { icon: <CalendarDaysIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: "Book" };
      case "ECOMMERCE":
      default: return { icon: <ShoppingBagIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: hasOptions ? "Options" : "Add to Cart" };
    }
  })();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative group h-full"
      >
        <div
          onClick={() => router.push(getListingPublicUrl(product))}
          className="relative h-full cursor-pointer bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col"
        >
          {/* --- IMAGE HEADER --- */}
          <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-950 shrink-0">
            {renderBadge()}

            <Image
              width={400}
              height={400}
              loader={loaderProp}
              src={imageError ? 'https://via.placeholder.com/400x400?text=No+Image' : primaryImage}
              alt={displayTitle}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={() => setImageError(true)}
            />

            {/* Subtle overlay for hover details */}
            <div className="absolute inset-0 bg-black/20 dark:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
              <span className="bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-zinc-100 font-bold text-[10px] uppercase tracking-widest px-5 py-2.5 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                View Details
              </span>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); toggleLike(product.id); }}
              className={`absolute top-3 right-3 z-20 p-2 rounded-full backdrop-blur-md transition-all hover:scale-110 active:scale-95 ${likedItems?.[product.id]
                  ? "bg-red-50 text-[#E63946] dark:bg-red-500/20 dark:text-red-400"
                  : "bg-white/70 text-zinc-600 dark:bg-black/50 dark:text-zinc-300 hover:bg-white dark:hover:bg-black/80"
                }`}
            >
              <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {resolvedMedia.hasVideo && (
              <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg border border-white/10 tracking-wide uppercase pointer-events-none">
                <VideoCameraIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Video</span>
              </div>
            )}
          </div>

          {/* --- PRODUCT INFO --- */}
          <div className="p-2.5 sm:p-3.5 md:p-5 flex flex-col flex-grow justify-between gap-2 sm:gap-3.5">
            <div className="space-y-1.5 sm:space-y-2.5">
              <div className="flex justify-between items-start gap-1 sm:gap-2">
                <h3 className="text-xs sm:text-sm md:text-base font-bold sm:font-black tracking-tight text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-tight sm:leading-snug">
                  {displayTitle}
                </h3>
                {itemType === "ECOMMERCE" && (
                  <div className="flex items-center gap-0.5 sm:gap-1 bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.5 rounded shrink-0">
                    <BoltIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#E63946]" />
                    <span className="text-[8px] sm:text-[9px] font-black text-[#E63946] uppercase tracking-wider">New</span>
                  </div>
                )}
              </div>

              {renderQuickStats()}

              {product.company && (
                <div className="flex items-center gap-1 text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  <span className="shrink-0">By</span>
                  <span
                    onClick={(e) => {
                      if (product.company?.slug) {
                        e.stopPropagation();
                        router.push(`/site/${product.company.slug}`);
                      }
                    }}
                    className="text-zinc-900 dark:text-zinc-200 font-bold hover:underline truncate cursor-pointer"
                  >
                    {product.company.name || "Verified Store"}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Actions & Price */}
            <div className="mt-auto pt-2 sm:pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2 sm:space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1.5 sm:gap-2">
                <div className="flex flex-col">
                  <span className="text-[9px] sm:text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Price</span>
                  <span className="text-sm sm:text-base md:text-lg font-black text-zinc-900 dark:text-white leading-none">
                    <span className="text-[10px] mr-1 font-bold text-zinc-400 dark:text-zinc-500">KES</span>
                    {(product.finalPrice || product.sellingPrice || 0).toLocaleString()}
                  </span>
                </div>

                <div className="w-full sm:w-auto shrink-0">
                  <AnimatePresence mode="wait">
                    {canAddToCart && quantity > 0 ? (
                      <motion.div
                        key="in-cart"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center justify-between bg-zinc-900 dark:bg-zinc-100 rounded-lg sm:rounded-xl p-0.5 sm:p-1 shadow-md h-8 sm:h-9 md:h-10 w-full sm:w-28"
                        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                      >
                        <button onClick={() => decreaseQuantity(currentItemSignature)} className="p-1 sm:p-2 text-white dark:text-zinc-900 hover:bg-white/20 dark:hover:bg-black/10 rounded-md sm:rounded-lg transition-colors">
                          {quantity === 1 ? <TrashIcon className="w-3.5 h-3.5 text-red-400 dark:text-red-500" /> : <MinusIcon className="w-3.5 h-3.5" />}
                        </button>
                        <span className="text-white dark:text-zinc-900 font-black text-xs sm:text-sm">{quantity}</span>
                        <button onClick={() => addToCart({ ...product, selectedOptions })} className="p-1 sm:p-2 text-white dark:text-zinc-900 hover:bg-white/20 dark:hover:bg-black/10 rounded-md sm:rounded-lg transition-colors">
                          <PlusIcon className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-500" />
                        </button>
                      </motion.div>
                    ) : (
                      <motion.button
                        key="add-btn"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleActionClick}
                        className={`h-8 sm:h-9 md:h-10 px-2.5 sm:px-3.5 w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-[11px] uppercase tracking-wider transition-all duration-300 shadow-sm
                          ${canAddToCart
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                            : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white'
                          }`}
                      >
                        {actionConfig.icon}
                        <span className="truncate">{actionConfig.text}</span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Refined Quick Contact Overlay */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-[#25D366]/10 dark:bg-[#25D366]/20 text-[#1da851] dark:text-[#25D366] hover:bg-[#25D366] hover:text-white py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-colors duration-300"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Quick Inquire
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Options Selection Modal */}
      <AnimatePresence>
        {isModalOpen && canAddToCart && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative bg-white dark:bg-zinc-900 w-full max-w-md p-6 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 z-10 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Configure Item</h4>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Specify preferences below to continue.</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="text-sm bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 px-4 py-3 rounded-xl font-medium">
                  {formError}
                </div>
              )}

              <div className="space-y-5">
                {product.options?.map((option: any) => (
                  <div key={option.name} className="space-y-3">
                    <label className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400 tracking-wider">
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
                            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${isSelected
                                ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100 text-white dark:text-zinc-900 shadow-md'
                                : 'bg-transparent border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-500'
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

              <div className="pt-4">
                <button
                  onClick={handleConfirmOptions}
                  className="w-full bg-[#E63946] hover:bg-[#d62d3a] text-white py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-colors shadow-lg shadow-[#E63946]/20"
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