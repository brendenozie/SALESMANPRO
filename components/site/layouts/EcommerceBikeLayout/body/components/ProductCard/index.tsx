'use client';

import { MinusIcon, PlusIcon, BoltIcon, XMarkIcon, TrashIcon, AdjustmentsHorizontalIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import React, { useMemo, useState, useEffect } from 'react';
import { MarketListingForm, VariantOptionItem } from '@/types/typings';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';
import { resolveProductMedia } from '@/lib/product-media-resolver';

const loader = ({ src }: { src: string }) => src;

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ProductCard: React.FC<{ product: MarketListingForm }> = ({ product }) => {
  const [isSelectingOptions, setIsSelectingOptions] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primary = storeFormData?.themeSettings?.primaryColor || "#FF6B00";
  const { name, images, finalPrice, sellingPrice } = product;

  // 1. Map Options Array into Mechanical Category Groups
  const groupedVariants = useMemo(() => {
    const options = (product.option || []) as VariantOptionItem[];
    return options.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, VariantOptionItem[]>);
  }, [product.option]);

  const hasVariants = Object.keys(groupedVariants).length > 0;
  const allOptionsSelected = Object.keys(groupedVariants).every((cat) => selectedOptions[cat]);

  // Set default configurations on mount if variations are present
  useEffect(() => {
    if (hasVariants && Object.keys(selectedOptions).length === 0) {
      const defaults: Record<string, string> = {};
      Object.entries(groupedVariants).forEach(([category, items]) => {
        if (items.length > 0) defaults[category] = items[0].name;
      });
      setSelectedOptions(defaults);
    }
  }, [groupedVariants, hasVariants, selectedOptions]);

  // 2. Computed Pricing Surcharges Block
  const calculatedPrices = useMemo(() => {
    const baseFinalPrice = finalPrice ?? sellingPrice ?? 0;
    const baseSellingPrice = sellingPrice ?? 0;
    
    let surchargeSum = 0;
    Object.entries(selectedOptions).forEach(([category, optionName]) => {
      const match = groupedVariants[category]?.find((v) => v.name === optionName);
      if (match?.extraPrice) {
        surchargeSum += match.extraPrice;
      }
    });

    return {
      finalPrice: baseFinalPrice + surchargeSum,
      sellingPrice: baseSellingPrice > 0 ? baseSellingPrice + surchargeSum : 0,
    };
  }, [selectedOptions, groupedVariants, finalPrice, sellingPrice]);

  // 3. Create a unique Cart ID signature for option selections
  const currentCartItemId = useMemo(() => {
    if (!hasVariants) return product.id;
    const sortedSpecs = Object.entries(selectedOptions)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([cat, val]) => `${cat}:${val}`)
      .join('|');
    return sortedSpecs ? `${product.id}-${sortedSpecs}` : product.id;
  }, [product.id, selectedOptions, hasVariants]);

  // 4. Resolve exact matches in quantity tracking for the active option configuration
  const currentConfigQuantity = useMemo(() => {
    const match = cart.find((item: any) => {
      const targetId = item.cartItemId || item.id;
      return targetId === currentCartItemId;
    });
    return match?.quantity || 0;
  }, [cart, currentCartItemId]);

  // 5. Track total aggregated count parameters across all configurations of this product
  const totalProductQuantity = useMemo(() => {
    return cart
      .filter((item: any) => item.id === product.id)
      .reduce((acc: number, item: any) => acc + (item.quantity || 0), 0);
  }, [cart, product.id]);
  
  // WhatsApp Summary Strings
  const optionsSummary = Object.entries(selectedOptions)
    .map(([cat, val]) => `${cat}: ${val}`)
    .join(', ');

  const whatsappNumber = `${storeFormData?.contactPhone || "254732771353"}`.replace(/\D/g, '');
  const message = encodeURIComponent(
    `BIKE_INQUIRY: I'm looking at the "${name}"${optionsSummary ? ` (${optionsSummary})` : ''}. Could you confirm configuration availability and if it comes pre-assembled? Price: Kes ${calculatedPrices.finalPrice.toLocaleString()}`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const resolvedMedia = useMemo(() => resolveProductMedia(product), [product]);
  const imageSrc = resolvedMedia.primaryImageUrl || 'https://via.placeholder.com/600';

  // Base context execution function called cleanly from card or modal execution triggers
  const executeAddToCart = () => {
    addToCart({
      ...product,
      cartItemId: currentCartItemId,
      finalPrice: calculatedPrices.finalPrice,
      sellingPrice: calculatedPrices.sellingPrice || product.sellingPrice,
      selectedOptions: hasVariants ? { ...selectedOptions } : undefined,
    });
  };

  // Direct addition pipeline handler for primary interaction button
  const handleAddToCart = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    // Prioritize the modal window if variants exist on the product layout architecture
    if (hasVariants) {
      setIsSelectingOptions(true);
      return;
    }

    executeAddToCart();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="group relative flex flex-col bg-white border border-gray-100 p-5 transition-all duration-500 hover:shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] hover:-translate-y-2 overflow-hidden"
      >
        {/* Tactical Header: ID & WhatsApp */}
        <div className="flex justify-between items-start mb-4">
          <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">
            SKU: {product.id.slice(-8).toUpperCase()}
          </span>
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-gray-50 rounded-full text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-300 shadow-sm z-10"
            title="Consult Mechanic"
          >
            <WhatsAppIcon className="w-4 h-4" />
          </a>
        </div>

        {/* Price Badge - Floating Impact */}
        <div className="absolute top-16 right-6 z-10 flex flex-col items-end pointer-events-none">
          <span className="text-2xl font-black italic tracking-tighter text-gray-900 leading-none">
            Kes {calculatedPrices.finalPrice.toLocaleString()}
          </span>
          {calculatedPrices.sellingPrice > calculatedPrices.finalPrice && (
            <span className="text-[10px] line-through text-red-500 font-bold uppercase tracking-widest mt-1">
              Kes {calculatedPrices.sellingPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Image / Mechanical Backdrop */}
        <div className="relative aspect-[4/3] w-full mb-6 overflow-hidden bg-[#FBFBFB] rounded-xl border border-gray-50">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
               style={{ backgroundImage: `radial-gradient(${primary} 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
          
          <Link href={`/bikeecommerce/products/${product.id}`} className="block h-full w-full">
            <Image
              src={imageSrc}
              alt={name}
              loader={loader}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-3"
            />
          </Link>

          {/* Video Indicator Badge */}
          {resolvedMedia.hasVideo && (
            <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur-md px-2.5 py-1 text-white flex items-center gap-1 border border-white/20 shadow-md">
              <VideoCameraIcon className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Video</span>
            </div>
          )}

          {/* Technical Callout */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-2">
             <div className="flex items-center gap-1.5 bg-black/90 backdrop-blur-sm text-[8px] text-white px-2.5 py-1.5 rounded-none font-black uppercase tracking-widest">
               <BoltIcon className="w-3 h-3 text-yellow-400" /> Pro Grade Components
             </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col flex-grow">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: primary }}>
                2026 Racing Series
              </span>
              {totalProductQuantity > 0 && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded">
                  {totalProductQuantity} in Build
                </span>
              )}
            </div>
            <a 
              href={whatsappUrl}
              target="_blank"
              className="text-[8px] font-bold text-green-500 flex items-center gap-1 hover:text-black transition-colors"
            >
              <WhatsAppIcon className="w-3 h-3" /> ORDER VIA WHATSAPP
            </a>
          </div>
          
          <Link href={`/bikeecommerce/products/${product.id}`}>
            <h4 className="text-xl font-black italic uppercase tracking-tighter text-gray-900 leading-tight mt-1 group-hover:underline decoration-2" style={{ textDecorationColor: primary }}>
              {name}
            </h4>
          </Link>

          {/* Aggregated build spec logs for variant indicators */}
          {hasVariants && totalProductQuantity > 0 && (
            <div className="mt-2 text-[9px] font-mono font-semibold text-gray-500 uppercase tracking-tight">
              Active Builds configuration running in background setup modules.
            </div>
          )}

          {/* Functional Actions Module: Modal Prioritized */}
          <div className="mt-auto pt-6 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              {hasVariants ? (
                /* Variant Action Mode: Routes into Modal Manager */
                <button
                  onClick={() => setIsSelectingOptions(true)}
                  className="flex items-center justify-between w-full border-2 border-gray-900 hover:bg-gray-900 hover:text-white p-3 font-black text-xs uppercase tracking-widest transition-all rounded-none group/variantBtn"
                >
                  <span className="flex items-center gap-2">
                    <AdjustmentsHorizontalIcon className="w-4 h-4 text-gray-900 group-hover/variantBtn:text-white" />
                    {totalProductQuantity > 0 ? "Manage Options / Add Variation" : "Configure Specs"}
                  </span>
                  {totalProductQuantity > 0 ? (
                    <span className="bg-gray-900 text-white group-hover/variantBtn:bg-white group-hover/variantBtn:text-gray-900 px-2 py-0.5 text-[9px] font-black tracking-tighter">
                      {totalProductQuantity} Active
                    </span>
                  ) : (
                    <PlusIcon className="w-4 h-4 transition-transform group-hover/variantBtn:rotate-90" />
                  )}
                </button>
              ) : (
                /* Standard Action Mode: Inline quantity adjustments for regular standalone items */
                <AnimatePresence mode="wait">
                  {currentConfigQuantity === 0 ? (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={handleAddToCart}
                      className="flex items-center gap-4 group/btn w-full text-left"
                    >
                      <div 
                        style={{ '--hover-bg': primary } as React.CSSProperties}
                        className="w-12 h-12 rounded-full border-2 border-gray-900 flex items-center justify-center transition-all group-hover/btn:border-[var(--hover-bg)] group-hover/btn:bg-[var(--hover-bg)] group-hover/btn:text-white group-hover/btn:scale-110"
                      >
                        <PlusIcon className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 leading-none">
                          Add to Build
                        </span>
                        <span className="text-[8px] text-gray-400 uppercase mt-1">In Stock • Ready to Ride</span>
                      </div>
                    </motion.button>
                  ) : (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center bg-gray-900 text-white rounded-full p-1.5 w-full justify-between shadow-lg"
                    >
                      <button 
                        onClick={() => decreaseQuantity(currentCartItemId, selectedOptions)} 
                        className="p-2.5 hover:bg-white/10 rounded-full transition-colors"
                      >
                        {currentConfigQuantity === 1 ? <TrashIcon className="w-4 h-4 text-red-400" /> : <MinusIcon className="w-4 h-4" />}
                      </button>
                      <span className="font-black text-sm tracking-tighter">QTY: {currentConfigQuantity}</span>
                      <button 
                        onClick={() => executeAddToCart()} 
                        className="p-2.5 hover:bg-white/10 rounded-full transition-colors"
                      >
                        <PlusIcon className="w-4 h-4 text-emerald-400" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ================= GLOBAL FIXED SCREEN MODAL MODULE ================= */}
      <AnimatePresence>
        {isSelectingOptions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSelectingOptions(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-lg bg-white shadow-2xl border-t-4 flex flex-col overflow-hidden max-h-[90vh]"
              style={{ borderTopColor: primary }}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsSelectingOptions(false)}
                className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 text-gray-900 transition-colors rounded-none z-10"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>

              {/* Header Details */}
              <div className="p-6 border-b border-gray-100 text-center bg-gray-50/50">
                <span className="text-[10px] font-mono tracking-widest text-gray-400 block uppercase mb-1">
                  Custom Mechanical Configuration
                </span>
                <h5 className="text-xl font-black italic uppercase tracking-tight text-gray-900">
                  {name}
                </h5>
                <p className="text-sm font-bold mt-2" style={{ color: primary }}>
                  Running Total: Kes {calculatedPrices.finalPrice.toLocaleString()}
                </p>
              </div>

              {/* Scrollable Build Variants */}
              <div className="p-6 overflow-y-auto space-y-6 flex-grow">
                {Object.entries(groupedVariants).map(([category, items]) => (
                  <div key={category} className="space-y-3">
                    <p className="text-[11px] font-black uppercase tracking-wider text-gray-900 border-l-2 pl-2" style={{ borderColor: primary }}>
                      Choose {category}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {items.map((opt) => {
                        const isSelected = selectedOptions[category] === opt.name;
                        return (
                          <button
                            key={opt.name}
                            type="button"
                            onClick={() => setSelectedOptions({ ...selectedOptions, [category]: opt.name })}
                            style={{ 
                              borderColor: isSelected ? primary : undefined,
                              backgroundColor: isSelected ? `${primary}10` : undefined
                            }}
                            className={`p-3 text-left text-xs font-black tracking-tight uppercase transition-all border flex flex-col justify-center rounded-none relative ${
                              isSelected 
                                ? "text-gray-900 font-bold border-2" 
                                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                            }`}
                          >
                            <span className="flex items-center justify-between w-full">
                              <span>{opt.name}</span>
                              {isSelected && (
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primary }} />
                              )}
                            </span>
                            {opt.extraPrice > 0 && (
                              <span className="text-[10px] font-mono text-gray-400 mt-1 normal-case">
                                + Kes {opt.extraPrice.toLocaleString()}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Sticky Action Footer: Manages Addition / Subtraction dynamically for the specified combination */}
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <AnimatePresence mode="wait">
                  {currentConfigQuantity === 0 ? (
                    <motion.button
                      key="add-new-variant"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      disabled={!allOptionsSelected}
                      onClick={executeAddToCart}
                      style={{ backgroundColor: allOptionsSelected ? primary : '#9CA3AF' }}
                      className="w-full py-4 text-white font-black text-xs uppercase tracking-widest transition-opacity shadow-lg rounded-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <PlusIcon className="w-4 h-4" /> Lock In & Add Variant
                    </motion.button>
                  ) : (
                    <motion.div
                      key="variant-qty-counter"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center bg-gray-900 text-white p-1.5 w-full justify-between shadow-xl"
                    >
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(currentCartItemId, selectedOptions)}
                        className="p-3 hover:bg-white/10 rounded-none transition-colors"
                      >
                        {currentConfigQuantity === 1 ? (
                          <TrashIcon className="w-4 h-4 text-red-400" />
                        ) : (
                          <MinusIcon className="w-4 h-4" />
                        )}
                      </button>
                      
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] font-mono uppercase tracking-widest text-gray-400">
                          Active Variant Quantity
                        </span>
                        <span className="font-black text-sm tracking-tight">
                          {currentConfigQuantity} in Build
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={executeAddToCart}
                        className="p-3 hover:bg-white/10 rounded-none transition-colors"
                      >
                        <PlusIcon className="w-4 h-4 text-emerald-400" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductCard;