'use client';

import { MinusIcon, PlusIcon, StarIcon, ShoppingCartIcon, ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/solid';
import React, { useState, useEffect, useMemo } from 'react';
import { MarketListingForm, VariantOptionItem } from '@/types/typings';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

const loader = ({ src }: { src: string }) => src;

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ProductCard: React.FC<{ product: MarketListingForm }> = ({ product }) => {
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState('');

  const primary = storeFormData?.themeSettings?.primaryColor || '#16a34a';

  // 1. Reconstruct flat variant options array back into categorical structural row records
  const optionGroups = useMemo(() => {
    const rawOptions = (product.option || []) as VariantOptionItem[];
    if (!Array.isArray(rawOptions) || rawOptions.length === 0) return null;

    const groups: Record<string, VariantOptionItem[]> = {};
    rawOptions.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [product.option]);

  const hasOptions = optionGroups && Object.keys(optionGroups).length > 0;

  // 2. Safely parse active variations to determine exact matching price additions
  const activePrice = useMemo(() => {
    let basePrice = product.finalPrice ?? 0;
    const rawOptions = (product.option || []) as VariantOptionItem[];

    Object.entries(selectedOptions).forEach(([category, name]) => {
      const match = rawOptions.find(v => v.category === category && v.name === name);
      if (match?.extraPrice) {
        basePrice += match.extraPrice;
      }
    });
    return basePrice;
  }, [selectedOptions, product.finalPrice, product.option]);

  // 3. Create predictable composite keys for unique variation line items in cart
  const generateCartItemId = (options: Record<string, string>) => {
    if (!options || Object.keys(options).length === 0) return product.id;
    const sortedOptionsQuery = Object.entries(options)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => `${key}:${val}`)
      .join('|');
    return `${product.id}-${sortedOptionsQuery}`;
  };

  const quantity = useMemo(() => {
    if (hasOptions) {
      return cart
        .filter((item: any) => item.id === product.id)
        .reduce((acc: number, cur: any) => acc + cur.quantity, 0);
    }
    return cart.find((item: any) => item.id === product.id)?.quantity || 0;
  }, [cart, hasOptions, product.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    if (isModalOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const handleActionClick = () => {
    if (hasOptions && optionGroups) {
      const initial: Record<string, string> = {};
      Object.entries(optionGroups).forEach(([category, items]) => {
        if (items.length === 1) {
          initial[category] = items[0].name;
        }
      });
      setSelectedOptions(initial);
      setErrorMsg('');
      setIsModalOpen(true);
    } else {
      addToCart({
        ...product,
        cartItemId: product.id,
        calculatedPrice: product.finalPrice ?? 0
      });
    }
  };

  const handleOptionSelect = (groupKey: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [groupKey]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleConfirmOptions = () => {
    if (!optionGroups) return;
    const missingKeys = Object.keys(optionGroups).filter(key => !selectedOptions[key]);
    
    if (missingKeys.length > 0) {
      setErrorMsg(`Please select: ${missingKeys.join(', ')}`);
      return;
    }

    const uniqueCartItemId = generateCartItemId(selectedOptions);

    const customPayload = {
      ...product,
      id: product.id,
      cartItemId: uniqueCartItemId,
      selectedOptions,
      calculatedPrice: activePrice
    };

    addToCart(customPayload);
    setIsModalOpen(false);
  };

  const whatsappNumber = `${storeFormData?.contactPhone || "254732 771 353"}`;
  const message = encodeURIComponent(`Hi! I'm ordering "${product.name}". Can you ensure I get the freshest ones available today?`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const discount = product.sellingPrice && product.finalPrice && product.sellingPrice > product.finalPrice
    ? Math.round(((product.sellingPrice - product.finalPrice) / product.sellingPrice) * 100)
    : null;

  return (
    <>
      <motion.div 
        className="relative flex flex-col h-full bg-white rounded-[2rem] border border-gray-100 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] group"
      >
        {/* Image Wrapper */}
        <div className="relative h-64 w-full p-4 overflow-hidden">
          <Link href={`/groceriesecommerce/products/${product.id}`} className="block h-full w-full relative rounded-2xl overflow-hidden bg-gray-50">
            <Image
              src={product.images?.[0] || 'https://via.placeholder.com/300'}
              alt={product.name}
              loader={loader}
              fill
              className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
            
            <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
              {discount && (
                <motion.span 
                  initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                  className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg"
                >
                  SAVE {discount}%
                </motion.span>
              )}
              <span className="bg-green-600 text-white text-[9px] font-bold px-2 py-1 rounded-md shadow-sm uppercase">
                Farm Fresh
              </span>
            </div>

            {/* WhatsApp Freshness Check */}
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-3 right-3 z-20 p-2 bg-white/90 backdrop-blur-md text-[#25D366] rounded-full shadow-sm transition-all duration-300 hover:scale-110"
              title="Check Freshness"
              onClick={(e) => e.stopPropagation()}
            >
              <WhatsAppIcon className="w-4 h-4" />
            </a>
          </Link>
        </div>

        {/* Info Wrapper */}
        <div className="px-6 pb-6 flex flex-col flex-grow text-gray-900">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1 text-yellow-400">
                <StarIcon className="w-3.5 h-3.5" />
                <span className="text-xs font-bold text-gray-500">4.8</span>
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {hasOptions ? `Total Qty: ${quantity}` : 'Qty: 1 Unit'}
              </span>
            </div>
            
            <Link href={`/groceriesecommerce/products/${product.id}`}>
              <h4 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-green-600 transition-colors">
                {product.name}
              </h4>
            </Link>
            <p className="text-[11px] text-gray-400 font-medium">Organic • Locally Sourced</p>
          </div>

          <div className="mt-auto flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-gray-900 leading-none">
                Kes {(product.finalPrice ?? 0).toLocaleString()}
              </span>
              {product.sellingPrice && product.sellingPrice > (product.finalPrice ?? 0) && (
                <span className="text-sm text-gray-400 line-through font-medium mt-1">
                  Kes {product.sellingPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Contextual Action Button */}
            <div className="relative h-12 w-32 flex items-center justify-end">
              <AnimatePresence mode="wait">
                {quantity === 0 || hasOptions ? (
                  <motion.button
                    key="add"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={handleActionClick}
                    className="h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
                    style={{ backgroundColor: primary }}
                  >
                    <PlusIcon className="w-6 h-6" />
                  </motion.button>
                ) : (
                  <motion.div
                    key="stepper"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: '100%' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex items-center justify-between bg-gray-100 rounded-2xl p-1 w-full"
                  >
                    <button 
                      onClick={() => decreaseQuantity(product.id)}
                      className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-white transition-colors text-gray-600"
                    >
                      <MinusIcon className="w-4 h-4" />
                    </button>
                    <span className="font-black text-gray-900 text-sm">{quantity}</span>
                    <button 
                      onClick={() => addToCart({ ...product, cartItemId: product.id, calculatedPrice: product.finalPrice ?? 0 })}
                      className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-white transition-colors text-gray-600"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Express Delivery Badge */}
          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Available for Express Delivery</span>
          </div>

          {/* Order via WhatsApp */}
          <div className="mt-2 pt-2 border-t border-gray-50 flex items-center gap-2">
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex uppercase text-[10px] items-center gap-2 text-[#25D366] font-bold transition-all duration-300 hover:scale-105"
            >
              <WhatsAppIcon className="w-4 h-4" />
              Order via WhatsApp
            </a>
          </div>
          
        </div>
      </motion.div>

      {/* Options Selection Portal Backdrop Modal */}
      <AnimatePresence>
        {isModalOpen && optionGroups && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden border border-gray-100 text-gray-900"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-gray-50 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <span className="text-[10px] font-bold tracking-widest text-green-600 uppercase">Configuration required</span>
                <h3 className="text-xl font-black text-gray-900 mt-1">{product.name}</h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Select preferred specification options below</p>
              </div>

              {/* Dynamic Group Rendering */}
              <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-1">
                {Object.entries(optionGroups).map(([groupKey, variantItems]) => (
                  <div key={groupKey} className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                      Choose {groupKey} :
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {variantItems.map((item) => {
                        const isSelected = selectedOptions[groupKey] === item.name;
                        return (
                          <button
                            key={item.name}
                            onClick={() => handleOptionSelect(groupKey, item.name)}
                            className={`px-4 py-2 text-xs font-bold transition-all border rounded-xl flex items-center gap-1 ${
                              isSelected 
                                ? 'text-white border-transparent shadow-md scale-105' 
                                : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'
                            }`}
                            style={{ backgroundColor: isSelected ? primary : undefined }}
                          >
                            <span>{item.name}</span>
                            {item.extraPrice > 0 && (
                              <span className={`text-[10px] ml-0.5 ${isSelected ? 'text-white/80' : 'text-blue-500'}`}>
                                (+Kes {item.extraPrice})
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {errorMsg && (
                <motion.p 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mt-4 text-xs font-bold text-red-500"
                >
                  {errorMsg}
                </motion.p>
              )}

              {/* Action Button Container */}
              <div className="mt-8 pt-4 border-t border-gray-50 flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Unit Estimate</span>
                  <span className="text-xl font-black text-gray-900">
                    Kes {activePrice.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={handleConfirmOptions}
                  className="px-6 h-12 rounded-xl text-xs font-black uppercase text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                  style={{ backgroundColor: primary }}
                >
                  Add Variant to Loadout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductCard;