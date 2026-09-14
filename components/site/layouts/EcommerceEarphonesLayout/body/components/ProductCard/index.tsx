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

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#10B981';

  // Group dynamic variants by their designated category key
  const groupedCategories = useMemo(() => {
    const optionsArray = (product.option || []) as VariantOptionItem[];
    const groups: Record<string, VariantOptionItem[]> = {};
    
    optionsArray.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [product.option]);

  const hasOptions = Object.keys(groupedCategories).length > 0;

  // Initialize selected configuration values cleanly
  useEffect(() => {
    if (hasOptions) {
      const initialSelection: Record<string, string> = {};
      Object.entries(groupedCategories).forEach(([category, items]) => {
        if (items.length > 0) {
          initialSelection[category] = items[0].name;
        }
      });
      setSelectedOptions(initialSelection);
    }
  }, [groupedCategories, hasOptions]);

  // Compute calculated pricing matrix based on active variant extra choices
  const currentTotalPrice = useMemo(() => {
    const basePrice = product.finalPrice ?? 0;
    let surcharge = 0;

    Object.entries(selectedOptions).forEach(([category, chosenValue]) => {
      const match = (product.option || []).find(
        (v: VariantOptionItem) => v.category === category && v.name === chosenValue
      );
      if (match) {
        surcharge += match.extraPrice || 0;
      }
    });

    return basePrice + surcharge;
  }, [product.finalPrice, product.option, selectedOptions]);

  // Track unique configuration patterns to keep item counters accurately sync'd
  const currentConfigUniqueSignature = useMemo(() => {
    const sortedSpecs = Object.entries(selectedOptions)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([cat, val]) => `${cat}:${val}`)
      .join('|');
    return sortedSpecs ? `${product.id}-${sortedSpecs}` : product.id;
  }, [product.id, selectedOptions]);

  // Find dynamic cart match strictly based on the configured structural signature
  const currentVariantQuantity = useMemo(() => {
    const match = cart.find((item: any) => item.cartItemId === currentConfigUniqueSignature);
    return match?.quantity || 0;
  }, [cart, currentConfigUniqueSignature]);

  // Calculate the total global quantity of this product across all variant configurations combined
  const totalProductQuantityInCart = useMemo(() => {
    return cart
      .filter((item: any) => item.id === product.id)
      .reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
  }, [cart, product.id]);

  // Fallback signature match for non-variant item cards
  const standardCartItemMatch = useMemo(() => {
    return cart.find((item: any) => item.id === product.id && (!item.selectedOptions || Object.keys(item.selectedOptions).length === 0));
  }, [cart, product.id]);

  const standardQuantity = standardCartItemMatch?.quantity || 0;

  const whatsappNumber = `${storeFormData?.contactPhone || "254732 771 353"}`;
  const message = encodeURIComponent(`Hi! I'm interested in the "${product.name}". Is it currently available in stock, and what are the delivery timelines?`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const resolvedMedia = useMemo(() => resolveProductMedia(product), [product]);
  const imageSrc = resolvedMedia.primaryImageUrl || 'https://via.placeholder.com/600x800';

  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasOptions) {
      setIsModalOpen(true);
    } else {
      addToCart({
        ...product,
        cartItemId: product.id,
        selectedOptions: {},
        calculatedPrice: product.finalPrice
      });
    }
  };

  const handleConfirmOptions = () => {
    const customizedProduct = {
      ...product,
      cartItemId: currentConfigUniqueSignature,
      selectedOptions: { ...selectedOptions },
      calculatedPrice: currentTotalPrice
    };
    addToCart(customizedProduct);
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
          <Link href={`/products/${product.id}`} className="block h-full w-full">
            <Image
              src={imageSrc}
              alt={product.name}
              loader={loader}
              fill
              className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          </Link>
          
          {/* Status Tags */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            {resolvedMedia.hasVideo && (
              <div className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-md flex items-center gap-1 text-white">
                <VideoCameraIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Video</span>
              </div>
            )}
            {product.sellingPrice! > product.finalPrice! && (
              <div className="bg-rose-50/90 backdrop-blur-md px-3 py-1 rounded-full border border-rose-100 shadow-sm">
                <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">
                  Special Offer
                </span>
              </div>
            )}
            <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-[9px] font-medium text-slate-600 uppercase tracking-widest">
                Official Warranty
              </span>
            </div>
          </div>

          {/* WhatsApp Icon Float */}
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-4 right-4 z-20 p-2.5 bg-white/90 backdrop-blur-md text-[#25D366] rounded-full shadow-sm transition-all duration-300 hover:bg-white hover:scale-110"
            title="Inquire on WhatsApp"
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
                className="absolute inset-0 bg-black/10 flex items-center justify-center p-6"
              >
                {!hasOptions && standardQuantity > 0 ? (
                  /* Standard Quantity adjustments for variant-less items */
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-full bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl flex items-center justify-between p-1.5"
                  >
                    <button 
                      onClick={() => decreaseQuantity(product.id)} 
                      className="p-3 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <MinusIcon className="w-4 h-4 text-slate-600" />
                    </button>
                    <span className="font-bold text-slate-900 text-sm">{standardQuantity}</span>
                    <button 
                      onClick={handleAddClick} 
                      className="p-3 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <PlusIcon className="w-4 h-4 text-slate-600" />
                    </button>
                  </motion.div>
                ) : (
                  /* Call to Action Button. Routes through modal prioritization if product has options */
                  <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    onClick={handleAddClick}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-2xl hover:bg-slate-800 transition-all active:scale-95"
                  >
                    <ShoppingBagIcon className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      {hasOptions 
                        ? totalProductQuantityInCart > 0 
                          ? `Configure (${totalProductQuantityInCart})` 
                          : 'Configure'
                        : 'Add to Bag'
                      }
                    </span>
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Details Section */}
        <div className="mt-6 flex flex-col items-center text-center">
          <Link href={`/products/${product.id}`}>
            <h4 className="text-base font-semibold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors duration-300">
              {product.name}
            </h4>
          </Link>
          
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-slate-900 font-bold tracking-tight">
              Kes {(product.finalPrice ?? 0).toLocaleString()}
            </span>
            {product.sellingPrice! > product.finalPrice! && (
              <span className="text-slate-300 line-through text-xs font-medium">
                Kes {product.sellingPrice?.toLocaleString()}
              </span>
            )}
          </div>

          {/* Interactive Action Indicator */}
          <div className="flex items-center gap-4 mt-4 group-hover:gap-6 transition-all duration-500">
            <div className="h-[1px] w-4 bg-slate-200" />
            <a 
              href={whatsappUrl}
              target="_blank"
              className="text-[9px] font-black uppercase tracking-[0.2em] text-green-500 hover:text-slate-900 transition-colors flex items-center gap-1.5"
            >
              <WhatsAppIcon className="w-3 h-3" /> Order Via WhatsApp
            </a>
            <div className="h-[1px] w-4 bg-slate-200" />
          </div>
        </div>
      </div>

      {/* Configuration Drawer / Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Layer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 z-10 overflow-hidden"
            >
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 block mb-1">Product Options</span>
                <h3 className="text-xl font-bold tracking-tight text-slate-900">{product.name}</h3>
                <p className="text-sm text-slate-500 mt-1">Select your preferred specifications below.</p>
              </div>

              {/* Render structural options mapped cleanly by categories */}
              <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-1">
                {Object.entries(groupedCategories).map(([categoryName, variants]) => (
                  <div key={categoryName} className="flex flex-col gap-2.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {categoryName}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((variant) => {
                        const isSelected = selectedOptions[categoryName] === variant.name;
                        return (
                          <button
                            key={variant.name}
                            type="button"
                            onClick={() => setSelectedOptions(prev => ({ ...prev, [categoryName]: variant.name }))}
                            className={`px-4 py-2 text-xs rounded-xl border transition-all duration-300 font-medium flex flex-col items-start ${
                              isSelected 
                                ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            <span>{variant.name}</span>
                            {variant.extraPrice > 0 && (
                              <span className={`text-[9px] mt-0.5 font-bold ${isSelected ? 'text-blue-300' : 'text-slate-400'}`}>
                                +Kes {variant.extraPrice.toLocaleString()}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Footer Actions - Prioritizes option selection quantities */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">Total Price</span>
                  <span className="text-lg font-black text-slate-900">Kes {currentTotalPrice.toLocaleString()}</span>
                </div>
                
                {currentVariantQuantity === 0 ? (
                  <button
                    type="button"
                    onClick={handleConfirmOptions}
                    className="flex-grow max-w-[200px] bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg transition-all active:scale-95"
                  >
                    Add to Bag
                  </button>
                ) : (
                  <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-3 border border-slate-200/60 flex-grow max-w-[200px] justify-between">
                    <button
                      type="button"
                      onClick={() => decreaseQuantity(currentConfigUniqueSignature)}
                      className="p-2.5 hover:bg-white rounded-lg transition-all shadow-sm active:scale-90"
                    >
                      <MinusIcon className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                    <span className="font-bold text-slate-900 text-sm min-w-[24px] text-center">
                      {currentVariantQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={handleConfirmOptions}
                      className="p-2.5 hover:bg-white rounded-lg transition-all shadow-sm active:scale-90"
                    >
                      <PlusIcon className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductCard;