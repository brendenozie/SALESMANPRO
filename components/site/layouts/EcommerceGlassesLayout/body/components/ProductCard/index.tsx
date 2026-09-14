'use client';

import { MinusIcon, PlusIcon, StarIcon, ShoppingBagIcon, XMarkIcon, TrashIcon, VideoCameraIcon } from '@heroicons/react/24/solid';
import React, { useMemo, useState } from 'react';
import { MarketListingForm } from '@/types/typings';
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
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#0D4C4F';
  const resolvedMedia = useMemo(() => resolveProductMedia(product), [product]);
  const { name, images, finalPrice, sellingPrice } = product;

  // 1. Structural Categorization of Eyewear Variations
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

  // 2. Dynamic Price Synthesis Engine
  const calculatedPrices = useMemo(() => {
    const baseFinalPrice = finalPrice ?? sellingPrice ?? 0;
    const baseSellingPrice = sellingPrice ?? 0;
    
    let additiveSurcharge = 0;
    Object.entries(selectedOptions).forEach(([category, selectedValue]) => {
      const match = groupedVariants[category]?.find((v) => v.name === selectedValue);
      if (match?.extraPrice) {
        additiveSurcharge += match.extraPrice;
      }
    });

    return {
      finalPrice: baseFinalPrice + additiveSurcharge,
      sellingPrice: baseSellingPrice > 0 ? baseSellingPrice + additiveSurcharge : undefined,
    };
  }, [selectedOptions, groupedVariants, finalPrice, sellingPrice]);

  // 3. Compute Cumulative Quantity of All Configurations Combined
  const totalProductQuantity = useMemo(() => {
    return cart
      .filter((item: any) => item.id === product.id)
      .reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
  }, [cart, product.id]);

  // 4. Compute Isolated Quantity for the Explicitly Active Configuration Setup
  const currentVariantQuantity = useMemo(() => {
    if (!hasVariants) return totalProductQuantity;
    if (!allOptionsSelected) return 0;

    const match = cart.find((item: any) => {
      if (item.id !== product.id || !item.selectedOptions) return false;
      return Object.keys(groupedVariants).every(
        (cat) => item.selectedOptions[cat] === selectedOptions[cat]
      );
    });
    return match?.quantity || 0;
  }, [cart, product.id, hasVariants, selectedOptions, allOptionsSelected, groupedVariants]);

  // 5. Dynamic Couture Consultation WhatsApp Link Construction
  const optionsSummary = Object.entries(selectedOptions)
    .map(([cat, val]) => `${cat}: ${val}`)
    .join(', ');

  const whatsappNumber = `${storeFormData?.contactPhone || "254732771353"}`.replace(/\D/g, '');
  const message = encodeURIComponent(
    `Hello! I'm eyeing the "${name}" frames${optionsSummary ? ` configured with [${optionsSummary}]` : ''}. Could you tell me if these fit a round face shape? I'm also curious about prescription options.`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const discount = calculatedPrices.sellingPrice && calculatedPrices.sellingPrice > calculatedPrices.finalPrice
    ? Math.round(((calculatedPrices.sellingPrice - calculatedPrices.finalPrice) / calculatedPrices.sellingPrice) * 100)
    : null;

  const handleAddToBag = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

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
      <motion.div className="group relative flex flex-col bg-white overflow-hidden transition-all duration-500">
        {/* 1. High-Fashion Image Wrapper */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F9F6F2]">
          <Link href={`/glassesecommerce/products/${product.id}`} className="block h-full w-full">
            <Image
              src={resolvedMedia.primaryImageUrl || 'https://via.placeholder.com/600x800'}
              alt={name || 'Product Image'}
              fill
              loader={loader}
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
            />
          </Link>

          {/* Minimalist Labels */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
            {resolvedMedia.hasVideo && (
              <div className="bg-black/80 backdrop-blur-sm text-white text-[8px] font-bold px-2 py-1 uppercase tracking-[0.2em] flex items-center gap-1 border border-white/20 shadow-md">
                <VideoCameraIcon className="w-3 h-3 text-amber-400" />
                <span>Video</span>
              </div>
            )}
            {discount && (
              <span className="bg-[#F3A852] text-white text-[9px] font-black px-2 py-1 uppercase tracking-widest">
                -{discount}%
              </span>
            )}
            <span className="bg-white/80 backdrop-blur-sm text-black text-[8px] font-bold px-2 py-1 uppercase tracking-[0.2em] border border-gray-100">
              Limited Edition
            </span>
          </div>

          {/* Floating WhatsApp Stylist Button */}
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-4 right-4 z-10 p-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm text-black transition-all duration-300 hover:bg-white hover:scale-110"
            title="Consult Stylist"
          >
            <WhatsAppIcon className="w-4 h-4" />
          </a>

          {/* Quick Add Overlay Options Block */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-20">
            <AnimatePresence mode="wait">
              {hasVariants ? (
                /* Prioritize the layout configuration panel if dynamic variants are present */
                <button 
                  onClick={() => setIsConfiguring(true)}
                  style={{ backgroundColor: primary }}
                  className="w-full py-4 text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-black transition-all"
                >
                  <ShoppingBagIcon className="h-4 w-4" /> 
                  {totalProductQuantity > 0 ? `Configure Fit (${totalProductQuantity})` : "Configure Fit"}
                </button>
              ) : totalProductQuantity > 0 ? (
                /* Regular counter stepper interface for products completely without custom options */
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="flex items-center justify-between bg-white/95 backdrop-blur-xl p-2 rounded-none border border-gray-100 shadow-2xl"
                >
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      decreaseQuantity(product.id, selectedOptions);
                    }} 
                    className="p-2 hover:text-[#F3A852] transition-colors"
                  >
                    {totalProductQuantity === 1 ? <TrashIcon className="h-4 w-4 text-red-500" /> : <MinusIcon className="h-4 w-4" />}
                  </button>
                  <span className="text-xs font-black tracking-widest">{totalProductQuantity}</span>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddToBag();
                    }} 
                    className="p-2 hover:text-[#F3A852] transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </motion.div>
              ) : (
                <button 
                  onClick={handleAddToBag}
                  style={{ backgroundColor: primary }}
                  className="w-full py-4 text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-black transition-all"
                >
                  <ShoppingBagIcon className="h-4 w-4" /> Add to Bag
                </button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 2. Product Info Section */}
        <div className="pt-5 pb-10 px-1">
          <div className="flex justify-between items-baseline mb-2">
            <Link href={`/glassesecommerce/products/${product.id}`} className="flex-1 text-left">
              <h4 className="text-[14px] font-bold text-gray-900 uppercase tracking-tight group-hover:text-[#0D4C4F] transition-colors">
                {name}
              </h4>
            </Link>
            <div className="flex flex-col items-end">
               <span className="text-[15px] font-serif italic text-gray-900">
                 Kes {calculatedPrices.finalPrice.toLocaleString()}
               </span>
               {calculatedPrices.sellingPrice && calculatedPrices.sellingPrice > calculatedPrices.finalPrice && (
                 <span className="text-[10px] line-through text-gray-300">
                   Kes {calculatedPrices.sellingPrice.toLocaleString()}
                 </span>
               )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1">
              <StarIcon className="h-2.5 w-2.5 text-[#F3A852]" />
              <span className="text-[9px] text-gray-400 uppercase tracking-[0.1em] font-medium">Handcrafted Acetate</span>
            </div>
            
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[9px] font-black text-gray-800 uppercase tracking-widest hover:text-[#0D4C4F] transition-colors"
            >
              <WhatsAppIcon className="w-3 h-3" /> Order Via WhatsApp
            </a>
          </div>
        </div>
      </motion.div>

      {/* ================= OPTICAL CUSTOMIZATION OVERLAY MODAL PANEL ================= */}
      <AnimatePresence>
        {isConfiguring && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Minimalist frosted glass background context */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfiguring(false)}
              className="absolute inset-0 bg-stone-950/40 backdrop-blur-sm"
            />

            {/* Selection Framework Window */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="relative w-full max-w-md bg-white rounded-none shadow-2xl p-6 md:p-8 border border-stone-100 flex flex-col z-10 max-h-[85vh] overflow-hidden"
            >
              {/* Close Button Trigger */}
              <button
                onClick={() => setIsConfiguring(false)}
                className="absolute top-5 right-5 p-2 text-stone-400 hover:text-black transition-colors"
              >
                <XMarkIcon className="w-4 h-4 stroke-[2]" />
              </button>

              {/* Atelier Header context block */}
              <div className="border-b border-stone-100 pb-4 mb-6 text-left">
                <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-stone-400 block mb-1">
                  Bespoke Configuration
                </span>
                <h3 className="text-lg font-bold uppercase tracking-tight text-stone-900 pr-8">
                  Tailor {name}
                </h3>
              </div>

              {/* Dynamic Categorized Choice Selection Matrices */}
              <div className="space-y-6 overflow-y-auto pr-1 text-left [scrollbar-width:thin]">
                {Object.entries(groupedVariants).map(([category, itemsList]) => (
                  <div key={category} className="space-y-3">
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-stone-400">
                      Choose {category}
                    </p>
                    <div className="flex flex-col gap-2">
                      {itemsList.map((variantObj) => {
                        const isSelected = selectedOptions[category] === variantObj.name;
                        return (
                          <button
                            key={variantObj.name}
                            type="button"
                            onClick={() => setSelectedOptions({ ...selectedOptions, [category]: variantObj.name })}
                            style={isSelected ? { borderColor: primary, backgroundColor: `${primary}05` } : {}}
                            className={`w-full px-4 py-3 text-xs border text-left flex justify-between items-center transition-all ${
                              isSelected 
                                ? "font-bold text-gray-900" 
                                : "border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100"
                            }`}
                          >
                            <span className="tracking-wide">{variantObj.name}</span>
                            {variantObj.extraPrice > 0 && (
                              <span className="text-[10px] font-serif italic text-stone-400">
                                +Kes {variantObj.extraPrice.toLocaleString()}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Atelier Footer Control Section */}
              <div className="mt-8 pt-5 border-t border-stone-100 flex items-center justify-between gap-4">
                <div className="text-left">
                  <span className="text-[8px] font-bold text-stone-400 uppercase tracking-[0.2em] block mb-0.5">
                    Total Estimate
                  </span>
                  <span className="text-xl font-serif italic text-stone-900">
                    Kes {calculatedPrices.finalPrice.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center">
                  {!allOptionsSelected ? (
                    <button
                      disabled
                      className="px-6 py-4 bg-stone-200 text-stone-400 text-[9px] font-black uppercase tracking-[0.25em] cursor-not-allowed"
                    >
                      Make Selections
                    </button>
                  ) : currentVariantQuantity > 0 ? (
                    /* Inline Modal Stepper Engine: Fine-tunes the absolute stack quantity matching this setup profile */
                    <div className="h-12 bg-stone-50 border border-stone-200 flex items-center justify-between p-1 px-3 gap-4">
                      <button 
                        type="button"
                        onClick={() => decreaseQuantity(product.id, selectedOptions)} 
                        className="text-stone-400 hover:text-black transition-colors"
                      >
                        {currentVariantQuantity === 1 ? <TrashIcon className="h-3.5 w-3.5 text-red-500" /> : <MinusIcon className="h-3.5 w-3.5" />}
                      </button>
                      <span className="text-xs font-black tracking-widest text-stone-900 min-w-[12px] text-center">
                        {currentVariantQuantity}
                      </span>
                      <button 
                        type="button"
                        onClick={() => handleAddToBag()} 
                        className="text-stone-400 hover:text-black transition-colors"
                      >
                        <PlusIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    /* Add Brand-New Variant Item Configuration */
                    <button
                      onClick={() => {
                        handleAddToBag();
                        setIsConfiguring(false);
                      }}
                      style={{ backgroundColor: primary }}
                      className="px-6 py-4 text-white text-[9px] font-black uppercase tracking-[0.25em] transition-all hover:bg-black shadow-sm"
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