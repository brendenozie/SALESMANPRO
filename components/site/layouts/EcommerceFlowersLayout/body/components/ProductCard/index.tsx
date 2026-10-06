'use client';

import { MinusIcon, PlusIcon, ShoppingBagIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { VideoCameraIcon } from '@heroicons/react/24/solid';
import React, { useState, useEffect, useMemo } from 'react';
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

interface ProductCardProps {
  product: MarketListingForm;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [cardMessage, setCardMessage] = useState('');

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#10B981';
  
  const optionsList = (product.option || []) as VariantOptionItem[];
  const hasOptions = optionsList.length > 0;

  // Group options cleanly by category
  const groupedOptions = useMemo(() => {
    const groups: Record<string, VariantOptionItem[]> = {};
    optionsList.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [optionsList]);

  // Track dynamic price adjustments for selected variants
  const dynamicExtraSurcharge = useMemo(() => {
    let surcharge = 0;
    Object.entries(selectedOptions).forEach(([category, chosenValue]) => {
      const match = optionsList.find(
        (opt) => opt.category === category && String(opt.name).trim().toUpperCase() === String(chosenValue).trim().toUpperCase()
      );
      if (match) surcharge += match.extraPrice;
    });
    return surcharge;
  }, [selectedOptions, optionsList]);

  const computedFinalPrice = (product.finalPrice ?? 0) + dynamicExtraSurcharge;

  // Aggregate quantity for this core product ID across all variants
  const totalProductQuantityInCart = useMemo(() => {
    return cart
      .filter((item: any) => item.id === product.id)
      .reduce((acc: number, item: any) => acc + item.quantity, 0);
  }, [cart, product.id]);

  // Determine payload composition for the current layout state
  const normalizedPayloadOptions = useMemo(() => {
    const payload: Record<string, string> = { ...selectedOptions };
    if (cardMessage.trim()) {
      payload.message = cardMessage.trim();
    }
    return payload;
  }, [selectedOptions, cardMessage]);

  // Track if the exact variation selection currently chosen already exists in the cart
  const currentVariantCartItem = useMemo(() => {
    return cart.find((item: any) => {
      if (item.id !== product.id) return false;
      return JSON.stringify(item.selectedOptions || {}) === JSON.stringify(normalizedPayloadOptions);
    });
  }, [cart, product.id, normalizedPayloadOptions]);

  const currentVariantQuantity = currentVariantCartItem ? currentVariantCartItem.quantity : 0;

  const whatsappNumber = `${storeFormData?.contactPhone || "254732 771 353"}`;
  const message = encodeURIComponent(`Hi! I'm interested in the "${product.name}" bouquet. Do you offer same-day delivery, and can I include a custom handwritten note?`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const resolvedMedia = useMemo(() => resolveProductMedia(product), [product]);
  const imageSrc = resolvedMedia.primaryImageUrl || 'https://via.placeholder.com/600x800';

  // Initialize variant options default values
  useEffect(() => {
    if (hasOptions) {
      const initial: Record<string, string> = {};
      Object.entries(groupedOptions).forEach(([category, items]) => {
        if (items.length > 0) {
          initial[category] = items[0].name;
        }
      });
      setSelectedOptions(initial);
    }
  }, [groupedOptions, hasOptions]);

  const handleSelectOption = (category: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [category]: String(value)
    }));
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToCart({
      ...product,
      selectedOptions: normalizedPayloadOptions,
      finalPrice: computedFinalPrice
    });
  };

  return (
    <>
      <div 
        className="group relative flex flex-col bg-transparent"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-slate-50">
          <Link href={`/flowersecommerce/products/${product.id}`} className="block h-full w-full">
            <Image decoding="async"
              src={imageSrc}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          </Link>
          
          {/* Status Tags */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            {resolvedMedia.hasVideo && (
              <div className="bg-black/90 shadow-sm px-2.5 py-1 rounded-full border border-white/20 shadow-md flex items-center gap-1 text-white">
                <VideoCameraIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Video</span>
              </div>
            )}
            {product.sellingPrice! > product.finalPrice! && (
              <div className="bg-rose-50/90 backdrop-blur-md px-3 py-1 rounded-full border border-rose-100 shadow-sm">
                <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">
                  Seasonal Offer
                </span>
              </div>
            )}
            <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-[9px] font-medium text-slate-600 uppercase tracking-widest">
                Freshly Picked
              </span>
            </div>
          </div>

          {/* WhatsApp Action Link */}
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-4 right-4 z-20 p-2.5 bg-white/90 backdrop-blur-md text-[#25D366] rounded-full shadow-sm transition-all duration-300 hover:bg-white hover:scale-110"
            title="Ask the Florist"
          >
            <WhatsAppIcon className="w-4 h-4" />
          </a>

          {/* Action Overlay */}
          <AnimatePresence>
            {isHovered && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/10 flex items-center justify-center p-6"
              >
                {hasOptions ? (
                  /* Prioritize the choice modal configuration interface for multi-variant products */
                  <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    onClick={(e) => { 
                      e.preventDefault(); 
                      setIsModalOpen(true);
                    }}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-2xl hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
                  >
                    <ShoppingBagIcon className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      {totalProductQuantityInCart > 0 ? `Configure Options (${totalProductQuantityInCart})` : 'Configure Options'}
                    </span>
                  </motion.button>
                ) : (
                  /* Standard items use the simplified inline addition/subtraction mechanism directly */
                  totalProductQuantityInCart === 0 ? (
                    <motion.button
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      onClick={(e) => { 
                        e.preventDefault(); 
                        addToCart({ ...product, selectedOptions: {}, finalPrice: product.finalPrice });
                      }}
                      className="w-full bg-slate-900 text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-2xl hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
                    >
                      <ShoppingBagIcon className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-widest">Add to Bag</span>
                    </motion.button>
                  ) : (
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="w-full bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl flex items-center justify-between p-1.5"
                    >
                      <button 
                        onClick={() => decreaseQuantity(product.id)} 
                        className="p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <MinusIcon className="w-4 h-4 text-slate-600" />
                      </button>
                      <span className="font-bold text-slate-900 text-sm">{totalProductQuantityInCart}</span>
                      <button 
                        onClick={() => addToCart({ ...product, selectedOptions: {}, finalPrice: product.finalPrice })} 
                        className="p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <PlusIcon className="w-4 h-4 text-slate-600" />
                      </button>
                    </motion.div>
                  )
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Product Details Area */}
        <div className="mt-6 flex flex-col items-center text-center">
          <Link href={`/flowersecommerce/products/${product.id}`}>
            <h4 className="text-lg font-serif italic text-slate-900 group-hover:text-rose-500 transition-colors duration-500">
              {product.name}
            </h4>
          </Link>
          
          <div className="flex items-center gap-3 mt-2">
            <span className="text-slate-900 font-bold tracking-tight">
              Kes {(product.finalPrice ?? 0).toLocaleString()}
            </span>
            {product.sellingPrice! > product.finalPrice! && (
              <span className="text-slate-300 line-through text-xs font-medium">
                Kes {product.sellingPrice?.toLocaleString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 mt-5 group-hover:gap-8 transition-all duration-700">
            <div className="h-[1px] w-6 bg-slate-200 group-hover:bg-rose-200" />
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] font-black uppercase tracking-[0.2em] text-green-500 hover:text-rose-500 transition-colors flex items-center gap-1"
            >
              <WhatsAppIcon className="w-3 h-3" /> Order Via WhatsApp
            </a>
            <div className="h-[1px] w-6 bg-slate-200 group-hover:bg-rose-200" />
          </div>
        </div>
      </div>

      {/* Flower Customization Dialog Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 overflow-hidden"
            >
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-rose-400">Custom Arrangement</span>
                <h3 className="text-2xl font-serif italic text-slate-900 mt-1">{product.name}</h3>
                <p className="text-sm text-slate-500 mt-2">Tailor your seasonal stems before adding them to your delivery configuration bag.</p>
              </div>

              <form onSubmit={handleModalSubmit} className="space-y-6">
                
                {/* Dynamically Unrolled Group Category Form Fields */}
                <div className="space-y-6 max-h-[35vh] overflow-y-auto pr-1">
                  {Object.entries(groupedOptions).map(([category, items]) => (
                    <div key={category} className="flex flex-col gap-2.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {category}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {items.map((item) => {
                          const isSelected = String(selectedOptions[category]).trim().toUpperCase() === String(item.name).trim().toUpperCase();
                          return (
                            <button
                              key={item.name}
                              type="button"
                              onClick={() => handleSelectOption(category, item.name)}
                              className={`px-4 py-2 text-xs rounded-xl border transition-all duration-200 font-medium cursor-pointer ${
                                isSelected 
                                  ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                              }`}
                            >
                              <span className="mr-1">{item.name}</span>
                              {item.extraPrice > 0 && (
                                <span className={`text-[10px] ml-0.5 font-bold ${isSelected ? 'text-rose-300' : 'text-rose-500'}`}>
                                  (+ Kes {item.extraPrice})
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Optional Handwritten Card Note */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Handwritten Note (Optional)
                    </label>
                    <span className="text-[10px] font-mono text-slate-300">Envelope Included</span>
                  </div>
                  <textarea
                    rows={2}
                    value={cardMessage}
                    onChange={(e) => setCardMessage(e.target.value)}
                    placeholder="Write a warm note to be carefully included in the arrangement envelopes..."
                    className="w-full text-sm rounded-xl border-slate-200 border p-4 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 placeholder:text-slate-300 resize-none outline-none text-slate-700"
                  />
                </div>

                {/* Absolute Pricing Breakdowns Summary */}
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
                  <span className="text-xs font-medium text-slate-500">Estimated Total:</span>
                  <div className="text-right">
                    <span className="text-xl font-bold text-slate-900">
                      Kes {computedFinalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Submission & Variation Quantity Control Blocks */}
                {currentVariantQuantity > 0 ? (
                  <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        if (currentVariantCartItem) {
                          const sigId = `${product.id}-${JSON.stringify(currentVariantCartItem.selectedOptions)}`;
                          decreaseQuantity(sigId);
                        }
                      }}
                      className="p-3 bg-white hover:bg-slate-100 rounded-lg transition-all shadow-sm cursor-pointer text-slate-600"
                    >
                      <MinusIcon className="w-4 h-4" />
                    </button>
                    <div className="text-center">
                      <span className="font-bold text-slate-900 text-sm block">{currentVariantQuantity}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">This Variant In Bag</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        addToCart({
                          ...product,
                          selectedOptions: normalizedPayloadOptions,
                          finalPrice: computedFinalPrice
                        });
                      }}
                      className="p-3 bg-white hover:bg-slate-100 rounded-lg transition-all shadow-sm cursor-pointer text-slate-600"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-slate-900 text-white py-4 rounded-xl flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-xs shadow-xl hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
                  >
                    <ShoppingBagIcon className="w-4 h-4" />
                    Add This Arrangement Variant
                  </button>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductCard;