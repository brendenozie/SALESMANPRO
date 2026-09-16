'use client';

import { MinusIcon, PlusIcon, StarIcon, ShoppingBagIcon, TrashIcon, XMarkIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import React, { useMemo, useState } from 'react';
import { MarketListingForm } from '@/types/typings';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';
import { resolveProductMedia } from '@/lib/product-media-resolver';

// Custom WhatsApp Icon Component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ProductCard: React.FC<{ product: MarketListingForm }> = ({ product }) => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();

  const { name, images, finalPrice, sellingPrice } = product;

  // 1. Group Premium Horology Options
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

  // 2. Compute Luxury Item Configuration Pricing Engine
  const calculatedPrices = useMemo(() => {
    const baseFinalPrice = finalPrice ?? sellingPrice ?? 0;
    const baseSellingPrice = sellingPrice ?? 0;
    
    let totalSurcharge = 0;
    Object.entries(selectedOptions).forEach(([category, optionName]) => {
      const match = groupedVariants[category]?.find((v) => v.name === optionName);
      if (match?.extraPrice) {
        totalSurcharge += match.extraPrice;
      }
    });

    return {
      finalPrice: baseFinalPrice + totalSurcharge,
      sellingPrice: baseSellingPrice > 0 ? baseSellingPrice + totalSurcharge : undefined,
    };
  }, [selectedOptions, groupedVariants, finalPrice, sellingPrice]);

  // 3. Track cumulative quantity of all combined configurations for this product
  const totalProductQuantity = useMemo(() => {
    return cart
      .filter((item: any) => item.id === product.id)
      .reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
  }, [cart, product.id]);

  // 4. Isolated quantity evaluation for the current unique option selection profile
  const currentVariantQuantity = useMemo(() => {
    if (!hasVariants) {
      return cart.find((item: any) => item.id === product.id)?.quantity || 0;
    }
    if (!allOptionsSelected) return 0;

    return cart.find((item: any) => {
      if (item.id !== product.id || !item.selectedOptions) return false;
      return Object.keys(groupedVariants).every(
        (cat) => item.selectedOptions[cat] === selectedOptions[cat]
      );
    })?.quantity || 0;
  }, [cart, product.id, hasVariants, selectedOptions, allOptionsSelected, groupedVariants]);

  // Global identifier tracking calculation to sync mutations smoothly with actions
  const targetSignatureId = useMemo(() => {
    if (hasVariants && Object.keys(selectedOptions).length > 0) {
      // Sort keys to maintain a perfectly predictable structure signature
      const sortedOptions = Object.keys(selectedOptions)
        .sort()
        .reduce((acc, key) => ({ ...acc, [key]: selectedOptions[key] }), {});
      return `${product.id}-${JSON.stringify(sortedOptions)}`;
    }
    return product.id;
  }, [product.id, selectedOptions, hasVariants]);

  const resolvedMedia = useMemo(() => resolveProductMedia(product), [product]);
  const imageSrc = resolvedMedia.primaryImageUrl || 'https://via.placeholder.com/600';

  // 5. Bespoke Concierge WhatsApp Link Configuration
  const optionsSummary = Object.entries(selectedOptions)
    .map(([cat, val]) => `${cat}: ${val}`)
    .join(', ');

  const whatsappNumber = `${storeFormData?.contactPhone || "254732771353"}`.replace(/\D/g, '');
  const message = encodeURIComponent(
    `Hi! I'm inquiring about the "${name}" timepiece${optionsSummary ? ` configured with [${optionsSummary}]` : ''} listed at Kes ${calculatedPrices.finalPrice.toLocaleString()}. Is this specific configuration available for immediate dispatch?`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const handleAddToBag = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (hasVariants && !allOptionsSelected) {
      setIsConfiguring(true);
      return;
    }

    addToCart({
      ...product,
      finalPrice: calculatedPrices.finalPrice,
      sellingPrice: calculatedPrices.sellingPrice || product.sellingPrice,
      selectedOptions: { ...selectedOptions }
    });
  };

  const handleDecreaseQuantity = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (typeof decreaseQuantity === 'function') {
      decreaseQuantity(product.id, { selectedOptions });
    }
  };

  return (
    <>
      <div className="group bg-transparent relative flex flex-col h-full overflow-hidden">
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-[#f3f3f3] rounded-sm mb-6">
          <Link href={`/watchecommerce/products/${product.id}`}>
            <Image
              src={imageSrc}
              alt={name}
              loader={({ src }) => src}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          </Link>

          {/* Video Indicator Badge */}
          {resolvedMedia.hasVideo && (
            <div className="absolute top-4 left-4 z-10 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/20 shadow-md">
              <VideoCameraIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Video</span>
            </div>
          )}

          {/* WhatsApp Floating Button (Top Right) */}
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-md duration-300 hover:bg-[#25D366] hover:text-white text-[#25D366] z-10"
          >
            <WhatsAppIcon className="w-5 h-5" />
          </a>

          {/* Floating Badges */}
          {sellingPrice > (finalPrice || 0) && (
            <div className={`absolute ${resolvedMedia.hasVideo ? 'top-12' : 'top-4'} left-4 bg-white px-3 py-1 shadow-sm`}>
              <p className="text-[10px] font-bold tracking-tighter uppercase text-red-600">
                Limited Edition
              </p>
            </div>
          )}

          {/* Quick Add Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent z-10">
            {hasVariants ? (
              /* Prioritize Configuration Modal Access Screen Path if Variants Exist */
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setIsConfiguring(true)}
                  className="w-full bg-white text-black py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-colors"
                >
                  <ShoppingBagIcon className="w-4 h-4" /> 
                  {totalProductQuantity > 0 ? `Configure Options (${totalProductQuantity})` : "Configure Options"}
                </button>
              </div>
            ) : totalProductQuantity === 0 ? (
              /* Standard Non-Variant View Action */
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleAddToBag}
                  className="w-full bg-white text-black py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-colors"
                >
                  <ShoppingBagIcon className="w-4 h-4" /> Add to Bag
                </button>
              </div>
            ) : (
              /* Simple Counter Interface for Non-Variant Line Items Only */
              <div className="flex items-center justify-between bg-white p-1">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    decreaseQuantity(targetSignatureId);
                  }} 
                  className="p-2 hover:bg-gray-100 transition-colors"
                >
                  {totalProductQuantity === 1 ? <TrashIcon className="w-4 h-4 text-red-600" /> : <MinusIcon className="w-4 h-4 text-gray-700" />}
                </button>
                <span className="font-bold text-sm text-gray-900">{totalProductQuantity}</span>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddToBag();
                  }} 
                  className="p-2 hover:bg-gray-100 transition-colors"
                >
                  <PlusIcon className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Info Container */}
        <div className="text-center mt-auto flex flex-col flex-grow justify-between">
          <div>
            <div className="flex justify-center mb-2">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-3 h-3 fill-current" />)}
              </div>
            </div>

            <Link href={`/watchecommerce/products/${product.id}`}>
              <h4 className="text-lg font-serif italic text-gray-900 group-hover:text-[#c5a059] transition-colors line-clamp-1 px-2">
                {name}
              </h4>
            </Link>
          </div>

          <div className="mt-2 flex flex-col items-center gap-1">
            <div className="flex items-center justify-center gap-3">
              <span className="text-xl font-light tracking-wider text-gray-900">
                Kes {calculatedPrices.finalPrice.toLocaleString()}
              </span>
              {calculatedPrices.sellingPrice && calculatedPrices.sellingPrice > calculatedPrices.finalPrice && (
                <span className="text-sm line-through text-gray-400">
                  Kes {calculatedPrices.sellingPrice.toLocaleString()}
                </span>
              )}
            </div>
            
            {/* Subtle Inquire Link */}
            <a 
              href={whatsappUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-emerald-600 hover:text-[#c5a059] transition-colors mt-1 font-medium"
            >
              <WhatsAppIcon className='w-3.5 h-3.5'/> Order via WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* ================= THE ATELIER CONFIGURATION SCREEN-PORTAL MODAL ================= */}
      <AnimatePresence>
        {isConfiguring && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Absolute Frosted Glass Overlay Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfiguring(false)}
              className="absolute inset-0 bg-neutral-950/40 backdrop-blur-md"
            />

            {/* Centered Modal Dialogue Structural Frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-lg bg-white rounded-sm shadow-2xl overflow-hidden border border-neutral-100 flex flex-col z-10"
            >
              {/* Close Overlay Trigger */}
              <button
                onClick={() => setIsConfiguring(false)}
                className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-neutral-900 transition-colors bg-neutral-50 hover:bg-neutral-100 rounded-full"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>

              <div className="p-6 md:p-8 space-y-6">
                {/* Header Context Typography */}
                <div className="border-b border-neutral-100 pb-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#c5a059] mb-1">
                    Bespoke Atelier Commission
                  </p>
                  <h3 className="font-serif italic text-2xl text-neutral-900 pr-8 leading-snug">
                    Configure {name}
                  </h3>
                </div>

                {/* Left-Aligned Structured Specification Row Scroller */}
                <div className="space-y-6 overflow-y-auto max-h-[50vh] pr-1 [scrollbar-width:thin] text-left">
                  {Object.entries(groupedVariants).map(([category, items]) => (
                    <div key={category} className="space-y-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400">
                        {category}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {items.map((opt) => {
                          const isSelected = selectedOptions[category] === opt.name;
                          return (
                            <button
                              key={opt.name}
                              type="button"
                              onClick={() => setSelectedOptions({ ...selectedOptions, [category]: opt.name })}
                              className={`px-4 py-2 text-xs uppercase tracking-wider border transition-all font-medium ${
                                isSelected 
                                  ? "bg-neutral-900 text-white border-neutral-900 shadow-sm" 
                                  : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 hover:border-neutral-300"
                              }`}
                            >
                              {opt.name}
                              {opt.extraPrice > 0 && ` (+Kes ${opt.extraPrice.toLocaleString()})`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Totalizer Line & Action Submit Panel */}
                <div className="pt-5 border-t border-neutral-100 flex items-center justify-between gap-4">
                  <div className="text-left leading-tight">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-0.5">
                      Total Valuation
                    </span>
                    <span className="text-2xl font-light tracking-wider text-neutral-900">
                      Kes {calculatedPrices.finalPrice.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center">
                    {!allOptionsSelected ? (
                      <button
                        disabled
                        className="px-6 py-3.5 bg-neutral-200 text-neutral-400 text-[10px] font-bold uppercase tracking-[0.2em] cursor-not-allowed"
                      >
                        Make Selections
                      </button>
                    ) : currentVariantQuantity > 0 ? (
                      /* Integrated Variant Stepper to adjust item quantities matching this identical combination profile */
                      <div className="flex items-center bg-neutral-50 border border-neutral-200 p-1 rounded-sm">
                        <button
                          type="button"
                          onClick={() => decreaseQuantity(targetSignatureId)}
                          className="p-2 hover:bg-neutral-200 text-neutral-700 transition-colors"
                        >
                          {currentVariantQuantity === 1 ? <TrashIcon className="w-4 h-4 text-red-600" /> : <MinusIcon className="w-4 h-4" />}
                        </button>
                        <span className="px-4 text-xs font-bold text-neutral-900 min-w-[2rem] text-center">
                          {currentVariantQuantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddToBag()}
                          className="p-2 hover:bg-neutral-200 text-neutral-700 transition-colors"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      /* Create Fresh Combination Variant Path Trigger */
                      <button
                        onClick={() => handleAddToBag()}
                        className="px-6 py-3.5 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:bg-[#c5a059]"
                      >
                        Add Combination
                      </button>
                    )}
                  </div>
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