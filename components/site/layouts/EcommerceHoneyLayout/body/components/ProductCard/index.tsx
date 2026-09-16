'use client';

import { MinusIcon, PlusIcon, StarIcon, ShoppingBagIcon, TrashIcon, XMarkIcon, VideoCameraIcon } from '@heroicons/react/24/solid';
import React, { useMemo, useState } from 'react';
import { MarketListingForm } from '@/types/typings';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';
import { resolveProductMedia } from '@/lib/product-media-resolver';

interface ProductCardProps {
  product: MarketListingForm;
}

const loader = ({ src }: { src: string }) => src;

// Custom WhatsApp Icon for Artisan/Natural vibe
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#3E2723'; 
  const { name, images, finalPrice, sellingPrice } = product;

  // 1. Group Variant Dimensions
  const groupedVariants = useMemo(() => {
    const options = (product.option || []) as any[];
    return options.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, any[]>);
  }, [product.option]);

  const hasVariants = Object.keys(groupedVariants).length > 0;
  const allOptionsSelected = Object.keys(groupedVariants).every((cat) => selectedOptions[cat]);

  // 2. Compute Total Price Aggregating Selected Option Surcharges
  const calculatedPrices = useMemo(() => {
    const baseFinalPrice = finalPrice ?? sellingPrice ?? 0;
    const baseSellingPrice = sellingPrice ?? 0;
    
    let extraSurcharge = 0;
    Object.entries(selectedOptions).forEach(([category, optionValue]) => {
      const match = groupedVariants[category]?.find((v) => v.name === optionValue);
      if (match?.extraPrice) {
        extraSurcharge += match.extraPrice;
      }
    });

    return {
      finalPrice: baseFinalPrice + extraSurcharge,
      sellingPrice: baseSellingPrice > 0 ? baseSellingPrice + extraSurcharge : undefined,
    };
  }, [selectedOptions, groupedVariants, finalPrice, sellingPrice]);

  // 3. Track Cumulative Quantity of All Configurations Combined
  const totalProductQuantity = useMemo(() => {
    return cart
      .filter((item: any) => item.id === product.id)
      .reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
  }, [cart, product.id]);

  // 4. Track Isolated Quantity for Selected Variant Options Configuration
  const currentVariantQuantity = useMemo(() => {
    if (!hasVariants) {
      return cart.find((item: any) => item.id === product.id)?.quantity || 0;
    }
    if (!allOptionsSelected) return 0;

    const match = cart.find((item: any) => {
      if (item.id !== product.id || !item.selectedOptions) return false;
      return Object.keys(groupedVariants).every(
        (cat) => item.selectedOptions[cat] === selectedOptions[cat]
      );
    });
    return match?.quantity || 0;
  }, [cart, product.id, hasVariants, selectedOptions, allOptionsSelected, groupedVariants]);

  // Global ID Tracking Signature Engine matching context logic
  const targetSignatureId = useMemo(() => {
    if (hasVariants && Object.keys(selectedOptions).length > 0) {
      const sortedOptions = Object.keys(selectedOptions)
        .sort()
        .reduce((acc, key) => ({ ...acc, [key]: selectedOptions[key] }), {});
      return `${product.id}-${JSON.stringify(sortedOptions)}`;
    }
    return product.id;
  }, [product.id, selectedOptions, hasVariants]);

  // Calculate percentage discount
  const discount = calculatedPrices.sellingPrice && calculatedPrices.sellingPrice > calculatedPrices.finalPrice
    ? Math.round(((calculatedPrices.sellingPrice - calculatedPrices.finalPrice) / calculatedPrices.sellingPrice) * 100)
    : null;
    
  const resolvedMedia = useMemo(() => resolveProductMedia(product), [product]);
  const imageSrc = resolvedMedia.primaryImageUrl || 'https://via.placeholder.com/300';

  // 5. Dynamic WhatsApp Concierge URL Formulation
  const optionsSummary = Object.entries(selectedOptions)
    .map(([cat, val]) => `${cat}: ${val}`)
    .join(', ');

  const whatsappNumber = `${storeFormData?.contactPhone || "254732771353"}`.replace(/\D/g, '');
  const message = encodeURIComponent(
    `Hello! I'm inquiring about the artisan "${name}" harvest${optionsSummary ? ` selection [${optionsSummary}]` : ''}. Is this exact variant available from recent batches?`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const handleAddToBag = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (hasVariants && !isConfiguring) {
      setIsConfiguring(true);
      return;
    }

    addToCart({
      ...product,
      finalPrice: calculatedPrices.finalPrice,
      sellingPrice: calculatedPrices.sellingPrice || product.sellingPrice,
      selectedOptions,
    });
  };

  return (
    <>
      <div className="group bg-white rounded-[2rem] p-4 border border-stone-100 relative flex flex-col h-full overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(62,39,35,0.05)]">
        {/* Image Container */}
        <div className="relative h-64 w-full rounded-[1.5rem] overflow-hidden bg-[#FAF9F6]">
          <Link href={`/honeyecommerce/products/${product.id}`} className="block h-full w-full">
            <Image
              src={imageSrc}
              alt={name}
              fill
              loader={loader}
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </Link>
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {resolvedMedia.hasVideo && (
              <div className="bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 border border-white/20 shadow-md">
                <VideoCameraIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Video</span>
              </div>
            )}
            {discount && (
              <div 
                style={{ backgroundColor: primaryColor }}
                className="text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest"
              >
                -{discount}%
              </div>
            )}
          </div>

          {/* Floating WhatsApp */}
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-3 right-3 z-10 p-2.5 bg-white/90 backdrop-blur-sm text-[#128C7E] rounded-full shadow-sm transition-all duration-300 hover:scale-110"
            title="Talk to Beekeeping Expert"
          >
            <WhatsAppIcon className="w-4 h-4" />
          </a>

          {/* Quick Add Action Control Interface Overlay */}
          <div className="absolute inset-x-0 bottom-4 px-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
            {hasVariants ? (
              /* Prioritise Configuration Modal Action Interface Path */
              <button 
                onClick={() => setIsConfiguring(true)}
                style={{ color: primaryColor }}
                className="w-full bg-white/95 backdrop-blur-md py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all hover:bg-[#3E2723] hover:!text-white"
              >
                <ShoppingBagIcon className="w-4 h-4" />
                {totalProductQuantity > 0 ? `Configure Options (${totalProductQuantity})` : "Configure Options"}
              </button>
            ) : totalProductQuantity === 0 ? (
              /* Standard Grid Add Button for Products without Variants */
              <button 
                onClick={handleAddToBag}
                style={{ color: primaryColor }}
                className="w-full bg-white/95 backdrop-blur-md py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all hover:bg-[#3E2723] hover:!text-white"
              >
                <ShoppingBagIcon className="w-4 h-4" /> Quick Add
              </button>
            ) : null}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 pb-2 flex flex-col flex-grow justify-between">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap text-left">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Premium Harvest</span>
              <div className="h-1 w-1 rounded-full bg-stone-200" />
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] font-black text-[#128C7E] uppercase hover:underline transition-colors flex items-center gap-1"
              >
                <WhatsAppIcon className="w-3 h-3" /> Order Via WhatsApp
              </a>
            </div>
            <Link href={`/honeyecommerce/products/${product.id}`} className="block text-left">
              <h4 style={{ color: primaryColor }} className="text-lg font-bold leading-tight mt-1 group-hover:text-[#F3A852] transition-colors line-clamp-2">
                {name}
              </h4>
            </Link>
          </div>

          <div className="flex items-center gap-4 mt-5 pt-2 border-t border-stone-50">
            <div className="flex flex-col text-left">
              <span style={{ color: primaryColor }} className="text-xl font-black">
                Kes {calculatedPrices.finalPrice.toLocaleString()}
              </span>
              {calculatedPrices.sellingPrice && calculatedPrices.sellingPrice > calculatedPrices.finalPrice && (
                <span className="text-xs line-through text-stone-300 font-bold">
                  Kes {calculatedPrices.sellingPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Standard Aggregate Dynamic Counter Step Bar (Only for Products with NO Variants) */}
            <AnimatePresence mode="wait">
              {!hasVariants && totalProductQuantity > 0 && (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex-grow flex items-center justify-end gap-2.5"
                >
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      decreaseQuantity(targetSignatureId);
                    }}
                    className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors"
                  >
                    {totalProductQuantity === 1 ? (
                      <TrashIcon className="w-3.5 h-3.5 text-red-500" />
                    ) : (
                      <MinusIcon style={{ color: primaryColor }} className="w-3 h-3" />
                    )}
                  </button>
                  <span style={{ color: primaryColor }} className="text-sm font-black w-5 text-center">{totalProductQuantity}</span>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddToBag();
                    }}
                    style={{ backgroundColor: primaryColor }}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-90 transition-colors"
                  >
                    <PlusIcon className="w-3 h-3 text-white" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ================= PORTAL SCREEN MODAL PANEL ================= */}
      <AnimatePresence>
        {isConfiguring && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark blur structural backdrop layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfiguring(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-md"
            />

            {/* Centered Modal Overlay layout container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-6 md:p-8 border border-stone-100 flex flex-col z-10 max-h-[90vh] overflow-hidden"
            >
              {/* Dismiss button trigger */}
              <button
                onClick={() => setIsConfiguring(false)}
                className="absolute top-5 right-5 p-2 bg-stone-50 text-stone-500 rounded-full transition-colors hover:bg-stone-100 hover:text-stone-800"
              >
                <XMarkIcon className="w-4 h-4 stroke-[3]" />
              </button>

              {/* Title & context typography */}
              <div className="border-b border-stone-100 pb-4 mb-5 text-left">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-1">
                  Artisan Selection
                </span>
                <h3 style={{ color: primaryColor }} className="text-xl font-black pr-8 leading-snug">
                  Configure {name}
                </h3>
              </div>

              {/* Scrollable layout content body row matrix */}
              <div className="space-y-6 overflow-y-auto pr-1 text-left [scrollbar-width:thin]">
                {Object.entries(groupedVariants).map(([category, variantsList]) => (
                  <div key={category} className="space-y-2.5">
                    <p className="text-[11px] font-black uppercase tracking-wider text-stone-400">
                      Select {category}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {variantsList.map((variantItem) => {
                        const isSelected = selectedOptions[category] === variantItem.name;
                        return (
                          <button
                            key={variantItem.name}
                            type="button"
                            onClick={() => setSelectedOptions({ ...selectedOptions, [category]: variantItem.name })}
                            style={isSelected ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                            className={`px-4 py-2 text-xs rounded-xl border font-bold transition-all ${
                              isSelected 
                                ? "text-white shadow-md shadow-stone-900/5" 
                                : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 hover:border-stone-300"
                            }`}
                          >
                            {variantItem.name}
                            {variantItem.extraPrice > 0 && ` (+Kes ${variantItem.extraPrice.toLocaleString()})`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Calculation footer action controls */}
              <div className="mt-6 pt-5 border-t border-stone-100 flex items-center justify-between gap-4">
                <div className="text-left">
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block mb-0.5">
                    Batch Total
                  </span>
                  <span style={{ color: primaryColor }} className="text-2xl font-black">
                    Kes {calculatedPrices.finalPrice.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center">
                  {!allOptionsSelected ? (
                    <button
                      disabled
                      className="px-6 py-3.5 bg-stone-200 text-stone-400 text-xs font-black uppercase tracking-widest rounded-xl cursor-not-allowed"
                    >
                      Make Selections
                    </button>
                  ) : currentVariantQuantity > 0 ? (
                    /* Custom Dynamic Modal Stepper: Adjusts specific matching combination quantity */
                    <div className="flex items-center bg-stone-50 border border-stone-200 p-1 rounded-xl gap-2">
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(targetSignatureId)}
                        className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center hover:bg-stone-100 transition-colors"
                      >
                        {currentVariantQuantity === 1 ? <TrashIcon className="w-3.5 h-3.5 text-red-500" /> : <MinusIcon style={{ color: primaryColor }} className="w-3 h-3" />}
                      </button>
                      <span style={{ color: primaryColor }} className="text-sm font-black min-w-[1.5rem] text-center">
                        {currentVariantQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddToBag()}
                        style={{ backgroundColor: primaryColor }}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-90 transition-colors"
                      >
                        <PlusIcon className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    /* Initial Variant Creation Flow Action Trigger Button */
                    <button
                      onClick={() => handleAddToBag()}
                      style={{ backgroundColor: primaryColor }}
                      className="px-6 py-3.5 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all hover:opacity-90"
                    >
                      Add Variant
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductCard;