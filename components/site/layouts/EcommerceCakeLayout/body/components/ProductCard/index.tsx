'use client';

import { MinusIcon, PlusIcon, StarIcon, ShoppingBagIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/solid';
import React, { useMemo, useState } from 'react';
import { MarketListingForm, VariantOptionItem } from '@/types/typings';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  product: MarketListingForm;
}

const loader = ({ src }: { src: string }) => src;

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isSelectingOptions, setIsSelectingOptions] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#D97706';

  const { name, images, finalPrice, sellingPrice } = product;

  // 1. Structural Grouping for Confectionery Metadata
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

  // 2. Pricing Engine Matrix Subtotal Calculator
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

  // 3. Exact matching conditional checks to handle independent compound key entries
  const quantity = cart.find((item: any) => {
    if (item.id !== product.id) return false;
    if (hasVariants) {
      if (!item.selectedOptions) return false;
      return Object.entries(selectedOptions).every(([cat, val]) => item.selectedOptions[cat] === val);
    }
    return true;
  })?.quantity || 0;
  
  // WhatsApp Configuration - Built from item variant parameters
  const optionsSummary = Object.entries(selectedOptions)
    .map(([cat, val]) => `${cat}: ${val}`)
    .join(', ');

  const whatsappNumber = `${storeFormData?.contactPhone || "254732771353"}`.replace(/\D/g, ''); 
  const message = encodeURIComponent(
    `Hello! I'm interested in ordering "${name}"${optionsSummary ? ` (${optionsSummary})` : ''} priced at KSh ${calculatedPrices.finalPrice.toLocaleString()}. Could you clarify the turnaround time and delivery options?`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const discount = sellingPrice && finalPrice != null && sellingPrice > finalPrice
      ? Math.round(((sellingPrice - finalPrice) / sellingPrice) * 100)
      : null;
    
  const imageSrc = images?.[0] || 'https://via.placeholder.com/400';

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
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="group relative flex flex-col bg-white rounded-2xl transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100/50"
      >
        {/* 1. Image View Window Section */}
        <div className="relative h-80 w-full overflow-hidden bg-gray-50">
          <Link href={`/cakeecommerce/products/${product.id}`} className="block h-full w-full">
            <Image
              src={imageSrc}
              alt={name}
              fill
              loader={loader}
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          </Link>

          {/* Minimalist Promotional Labels */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            {discount !== null && (
              <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm border border-orange-50">
                <span style={{ color: primary }} className="text-[10px] font-black tracking-widest">
                  -{discount}% OFF
                </span>
              </div>
            )}
          </div>

          {/* Floating Chat Communication Action Anchor */}
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-4 right-4 z-10 p-2.5 bg-white/80 backdrop-blur-md rounded-full shadow-sm text-[#128C7E] duration-300 hover:bg-white"
            title="Inquire with Vendor"
          >
            <WhatsAppIcon className="w-4 h-4" />
          </a>

          {/* Floating Instant Sync Button */}
          {quantity === 0 && (
            <button 
              onClick={handleAddToCart}
              style={{ '--hover-bg': primary } as React.CSSProperties}
              className="absolute bottom-4 right-4 p-3 bg-white text-gray-800 rounded-full shadow-xl translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[var(--hover-bg)] hover:text-white"
            >
              <ShoppingBagIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 2. Content Info Matrix Grid */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <Link href={`/cakeecommerce/products/${product.id}`}>
                <h4 
                  style={{ '--hover-color': primary } as React.CSSProperties}
                  className="text-lg font-bold text-gray-900 tracking-tight line-clamp-1 group-hover:text-[var(--hover-color)] transition-colors"
                >
                  {name}
                </h4>
              </Link>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <StarIcon style={{ color: primary }} className="w-3 h-3" />
                  <span className="text-[11px] font-medium text-gray-400 tracking-wide uppercase">Top Choice</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-gray-200" />
                <a 
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] flex gap-1 font-black text-[#128C7E] uppercase tracking-tighter hover:underline items-center"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5" /> Order
                </a>
              </div>
            </div>
          </div>

          {/* 3. Pricing Details Frame Block */}
          <div className="mt-auto pt-4 flex items-center justify-between">
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-black text-gray-900">
                KSh {calculatedPrices.finalPrice.toLocaleString()}
              </span>

              {calculatedPrices.sellingPrice && calculatedPrices.sellingPrice > calculatedPrices.finalPrice && (
                <span className="text-xs line-through text-gray-400 font-medium">
                  KSh {calculatedPrices.sellingPrice.toLocaleString()}
                </span>
              )}
            </div>

            <div className="flex items-center">
              <AnimatePresence mode="wait">
                {quantity > 0 ? (
                  <motion.div 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 'auto', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="flex items-center bg-gray-50 rounded-full border border-gray-100 p-1"
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        decreaseQuantity(product.id, selectedOptions);
                      }}
                      style={{ '--hover-color': primary } as React.CSSProperties}
                      className="p-1.5 text-gray-400 hover:text-[var(--hover-color)] transition-colors"
                    >
                      {quantity === 1 ? <TrashIcon className="h-4 w-4 text-red-500" /> : <MinusIcon className="h-4 w-4" />}
                    </button>
                    <span className="px-3 text-sm font-bold text-gray-800">{quantity}</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddToCart();
                      }}
                      style={{ '--hover-color': primary } as React.CSSProperties}
                      className="p-1.5 text-gray-400 hover:text-[var(--hover-color)] transition-colors"
                    >
                      <PlusIcon className="h-4 w-4 text-emerald-600" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddToCart}
                    style={{ borderColor: primary, color: primary }}
                    className="px-5 py-2 rounded-full border-2 text-xs font-black uppercase tracking-widest transition-all"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = primary;
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = primary;
                    }}
                  >
                    {hasVariants && !allOptionsSelected ? "Customize" : "Add To Cart"}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ================= TRUE DIALOG MODAL BACKDROP MODULE ================= */}
      <AnimatePresence>
        {isSelectingOptions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal Screen Blocker */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSelectingOptions(false)}
              className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
            />

            {/* Modal Box Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col z-10"
            >
              {/* Dynamic Accent Header Bar */}
              <div style={{ backgroundColor: primary }} className="h-1.5 w-full" />

              {/* Close Button Trigger */}
              <button
                onClick={() => setIsSelectingOptions(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors border border-gray-100"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>

              {/* Content Panel Frame */}
              <div className="p-6 md:p-8 space-y-6">
                <div>
                  <span style={{ color: primary }} className="text-[10px] font-black uppercase tracking-widest block mb-1">
                    Custom Options Available
                  </span>
                  <h3 className="text-xl font-extrabold text-gray-900 tracking-tight leading-tight">
                    Configure {name}
                  </h3>
                </div>

                {/* Main Option Choice Loops */}
                <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-1 [scrollbar-width:thin]">
                  {Object.entries(groupedVariants).map(([category, items]) => (
                    <div key={category} className="space-y-3">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Select {category}
                      </p>
                      <div className="flex flex-wrap gap-2">
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
                              className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                                isSelected 
                                  ? "text-white shadow-md shadow-black/5 scale-[1.02]" 
                                  : "border-gray-200 bg-gray-50/70 text-gray-800 hover:bg-gray-100/70 active:scale-95"
                              }`}
                            >
                              {opt.name}
                              {opt.extraPrice > 0 && ` (+KSh ${opt.extraPrice.toLocaleString()})`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal Footer Calculator Box */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estimated Total</span>
                    <span className="text-xl font-black text-gray-900">
                      KSh {calculatedPrices.finalPrice.toLocaleString()}
                    </span>
                  </div>

                  <button
                    disabled={!allOptionsSelected}
                    onClick={() => {
                      handleAddToCart();
                      setIsSelectingOptions(false);
                    }}
                    style={{ backgroundColor: allOptionsSelected ? primary : undefined }}
                    className="px-6 py-3 bg-gray-900 text-white rounded-xl font-black text-xs uppercase tracking-widest disabled:opacity-30 disabled:pointer-events-none transition-all shadow-lg active:scale-95"
                  >
                    Confirm Order Setup
                  </button>
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