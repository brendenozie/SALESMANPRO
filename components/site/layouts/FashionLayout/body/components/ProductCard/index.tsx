'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MarketListingForm, VariantOptionItem } from '@/types/typings';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBagIcon,
  HeartIcon,
  PlusIcon,
  MinusIcon,
  EyeIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const loader = ({ src }: { src: string }) => src;

// Custom WhatsApp Icon Component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface ProductCardProps {
  product: MarketListingForm;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    id,
    name,
    images = [],
    brand,
    sellingPrice,
    finalPrice,
    isNewArrival,
    isDiscounted,
  } = product;

  const [isSelectingOptions, setIsSelectingOptions] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const { addToCart, decreaseQuantity, cart } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#000000';

  // 1. Group dynamic parameters by category types safely
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

  // 2. Continuous surcharge compilation matching selected variants
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

  // 3. Exact matching verification within the global cart storage instance
  const quantity = cart.find((item: any) => {
    if (item.id !== id) return false;
    if (hasVariants) {
      if (!item.selectedOptions) return false;
      return Object.entries(selectedOptions).every(([cat, val]) => item.selectedOptions[cat] === val);
    }
    return true;
  })?.quantity || 0;

  const img = images?.[0] || (images?.[0] as any)?.url || 'https://via.placeholder.com/400x600';

  // ---------- WHATSAPP ----------
  const optionsSummary = Object.entries(selectedOptions)
    .map(([cat, val]) => `${cat}: ${val}`)
    .join(', ');

  const whatsappNumber = `${storeFormData?.contactPhone || "254732771353"}`.replace(/\D/g, '');
  const message = encodeURIComponent(
    `Hi! I'm interested in "${name}"${brand ? ` [${brand}]` : ''}${optionsSummary ? ` (${optionsSummary})` : ''} priced at KES ${calculatedPrices.finalPrice.toLocaleString()}. Is it available?`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const discount =
    sellingPrice && finalPrice != null && sellingPrice > finalPrice
      ? Math.round(((sellingPrice - finalPrice) / sellingPrice) * 100)
      : null;

  // ---------- ADD TO CART ----------
  const handleAddToCart = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (hasVariants && !allOptionsSelected) {
      setIsSelectingOptions(true);
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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className="group relative flex flex-col w-full bg-white dark:bg-zinc-950 transition-colors duration-500"
    >
      {/* --- IMAGE CONTAINER --- */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[2rem] bg-zinc-100 dark:bg-zinc-900 shadow-sm group-hover:shadow-2xl transition-all duration-700 ease-[0.16, 1, 0.3, 1]">
        
        <Link href={`/fashionecommerce/products/${id}`} className="block w-full h-full">
          <Image
            src={img}
            alt={name}
            fill
            loader={loader}
            className="object-cover transition-transform duration-[2s] scale-100 group-hover:scale-110 group-active:scale-105"
            priority
          />
        </Link>

        {/* --- DYNAMIC BADGES --- */}
        <div className="absolute top-5 left-5 flex flex-col gap-2 z-10">
          {isNewArrival && (
            <motion.span 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl text-zinc-900 dark:text-white text-[8px] font-black px-3 py-1.5 uppercase tracking-[0.25em] rounded-full border border-white/20 shadow-xl"
            >
              New Season
            </motion.span>
          )}
          {isDiscounted && discount && (
            <span 
              className="text-white text-[8px] font-black px-3 py-1.5 uppercase tracking-[0.25em] rounded-full shadow-lg"
              style={{ backgroundColor: primary }}
            >
              -{discount}%
            </span>
          )}
        </div>

        {/* --- DESKTOP ACTIONS (Side Hover Overlay) --- */}
        <div className="absolute top-5 right-5 flex flex-col gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 z-10 lg:flex hidden">
          <button className="p-3 bg-white dark:bg-zinc-900/90 backdrop-blur-xl rounded-full text-zinc-900 dark:text-white hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900 transition-all shadow-xl">
            <HeartIcon className="w-4 h-4" />
          </button>
          
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-white dark:bg-zinc-900/90 backdrop-blur-xl rounded-full text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all shadow-xl"
          >
            <WhatsAppIcon className="w-4 h-4" />
          </a>
          
          <button className="p-3 bg-white dark:bg-zinc-900/90 backdrop-blur-xl rounded-full text-zinc-900 dark:text-white hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900 transition-all shadow-xl">
            <EyeIcon className="w-4 h-4" />
          </button>
        </div>

        {/* --- MOBILE ACTIONS --- */}
        <div className="absolute bottom-4 right-4 lg:hidden z-10 flex flex-col gap-3">
          <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="p-4 rounded-2xl shadow-2xl backdrop-blur-2xl border border-white/20 bg-white/10 text-white flex items-center justify-center"
          >
            <WhatsAppIcon className="w-6 h-6" />
          </motion.a>

          <button 
            onClick={() => handleAddToCart()}
            className="relative p-4 rounded-2xl shadow-2xl backdrop-blur-2xl border border-white/20 active:scale-90 transition-transform flex items-center justify-center"
            style={{ backgroundColor: `${primary}dd`, color: '#fff' }}
          >
            <PlusIcon className="w-6 h-6" />
            <AnimatePresence>
              {quantity > 0 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-white text-zinc-900 text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border border-zinc-100"
                >
                  {quantity}
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* --- DESKTOP QUICK-ADD OVERLAY --- */}
        <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[0.16, 1, 0.3, 1] lg:block hidden">
          <button
            onClick={() => handleAddToCart()}
            className="w-full py-5 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white text-[10px] font-black uppercase tracking-[0.35em] flex items-center justify-center gap-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-2xl"
          >
            {quantity > 0 ? (
              <>
                <ShoppingBagIcon className="w-4 h-4" />
                In Wardrobe ({quantity})
              </>
            ) : (
              hasVariants && !allOptionsSelected ? "Select Customization" : "Add To Wardrobe"
            )}
          </button>
        </div>
      </div>

      {/* --- INFO AREA --- */}
      <div className="mt-6 flex flex-col items-center text-center px-2">
        {brand && (
          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-[0.5em] mb-2.5">
            {brand}
          </span>
        )}
        
        <Link href={`/fashionecommerce/products/${id}`} className="max-w-[85%]">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:text-zinc-500 transition-colors mb-3 tracking-wide leading-tight uppercase truncate">
            {name}
          </h3>
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-base font-black text-zinc-950 dark:text-white tracking-tighter">
            KES {calculatedPrices.finalPrice.toLocaleString()}
          </span>
          {isDiscounted && calculatedPrices.sellingPrice && (
            <span className="text-xs text-zinc-400 line-through font-medium opacity-60">
              KES {calculatedPrices.sellingPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Inquire link - Subtle text addition */}
        <a 
          href={whatsappUrl}
          target="_blank" 
          rel="noopener noreferrer"
          className="flex mt-3 text-[10px] uppercase tracking-[0.3em] text-green-500 hover:text-zinc-900 dark:hover:text-white transition-colors p-4 rounded-2xl shadow-lg bg-green-50/50 hover:bg-green-100/50 dark:bg-green-900/10 dark:hover:bg-green-900/20 gap-2"
        >
          <WhatsAppIcon className="w-4 h-4" /> Order Via WhatsApp
        </a>

        {/* Dynamic Quantity Management Controls */}
        {quantity > 0 && (
          <div className="mt-3 flex items-center gap-4 bg-zinc-100 dark:bg-zinc-900 py-1.5 px-3 rounded-xl border border-zinc-200/20 shadow-inner">
            <button
              onClick={(e) => {
                e.preventDefault();
                decreaseQuantity(id);
              }}
              className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white p-1"
            >
              <MinusIcon className="w-3 h-3" />
            </button>
            <span className="text-xs font-black text-zinc-800 dark:text-zinc-200">{quantity}</span>
            <button
              onClick={() => handleAddToCart()}
              className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white p-1"
            >
              <PlusIcon className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Status Indicator Bar */}
        <div className="mt-5 w-10 h-[2px] bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
          <AnimatePresence>
            {quantity > 0 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                exit={{ width: 0 }}
                className="h-full"
                style={{ backgroundColor: primary }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ================= DYNAMIC PRODUCT ATTRIBUTE CUSTOMIZATION MODAL SHEET ================= */}
      <AnimatePresence>
        {isSelectingOptions && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 210 }}
            className="absolute inset-0 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md flex flex-col justify-end p-6 overflow-y-auto no-scrollbar rounded-[2rem]"
          >
            <button
              onClick={() => setIsSelectingOptions(false)}
              className="absolute top-5 right-5 p-2 bg-zinc-50 dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>

            <div className="w-full space-y-5 pt-4">
              {Object.entries(groupedVariants).map(([category, items]) => (
                <div key={category} className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 text-center">
                    Select {category}
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {items.map((opt) => {
                      const isSelected = selectedOptions[category] === opt.name;
                      return (
                        <button
                          key={opt.name}
                          type="button"
                          onClick={() => setSelectedOptions({ ...selectedOptions, [category]: opt.name })}
                          style={{ 
                            borderColor: isSelected ? primary : undefined,
                            backgroundColor: isSelected ? primary : undefined 
                          }}
                          className={`px-3.5 py-2 rounded-xl border text-[11px] font-black transition-all ${
                            isSelected 
                              ? "text-white shadow-md scale-[1.02]" 
                              : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-800 dark:text-zinc-200 active:bg-zinc-100"
                          }`}
                        >
                          {opt.name}
                          {opt.extraPrice > 0 && ` (+KES ${opt.extraPrice})`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <button
                disabled={!allOptionsSelected}
                onClick={() => {
                  handleAddToCart();
                  setIsSelectingOptions(false);
                }}
                style={{ backgroundColor: allOptionsSelected ? primary : undefined }}
                className="mt-4 w-full py-4 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-40 transition-opacity shadow-lg"
              >
                Confirm Customization
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductCard;