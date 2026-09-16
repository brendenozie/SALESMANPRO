'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MinusIcon, 
  PlusIcon, 
  StarIcon, 
  TrashIcon, 
  ShoppingBagIcon,
  HeartIcon,
  XMarkIcon,
  VideoCameraIcon
} from '@heroicons/react/24/solid';
import { MarketListingForm, VariantOptionItem } from '@/types/typings';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';
import { resolveProductMedia } from '@/lib/product-media-resolver';

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
  const [isOpenQuickView, setIsOpenQuickView] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#F472B6';
  const secondary = storeFormData?.themeSettings?.secondaryColor || '#3B82F6';

  const { name, images, finalPrice, sellingPrice } = product;

  // Group variants cleanly from options array
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

  // Set initial selections automatically from the variants schema structure
  useEffect(() => {
    const initialSelections: Record<string, string> = {};
    Object.entries(groupedVariants).forEach(([category, items]) => {
      if (items.length > 0) {
        initialSelections[category] = items[0].name;
      }
    });
    setSelectedOptions(initialSelections);
  }, [groupedVariants]);

  // Continuous pricing calculation including specific multi-variant surcharges
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

  // Structural variant lookup optimization within global cart state for CURRENT selection
  const currentVariantQuantity = useMemo(() => {
    const match = cart.find((item: any) => {
      if (item.id !== product.id) return false;
      if (hasVariants) {
        if (!item.selectedOptions) return false;
        return Object.entries(selectedOptions).every(([cat, val]) => item.selectedOptions[cat] === val);
      }
      return true;
    });
    return match?.quantity || 0;
  }, [cart, product.id, selectedOptions, hasVariants]);

  // Total absolute volume of this base product in the cart across all variation sets
  const totalProductQuantity = useMemo(() => {
    return cart
      .filter((item: any) => item.id === product.id)
      .reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
  }, [cart, product.id]);

  // WhatsApp dynamic string assembly configuration
  const optionsSummary = Object.entries(selectedOptions)
    .map(([cat, val]) => `${cat}: ${val}`)
    .join(', ');

  const whatsappNumber = `${storeFormData?.contactPhone || "254700000000"}`.replace(/\D/g, '');
  const message = encodeURIComponent(
    `Hi! I'm looking at the "${name}"${optionsSummary ? ` (${optionsSummary})` : ''} priced at KSh ${calculatedPrices.finalPrice.toLocaleString()} for my little one. Could you tell me more about its availability and delivery options?`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const discount = sellingPrice && finalPrice && sellingPrice > finalPrice
    ? Math.round(((sellingPrice - finalPrice) / sellingPrice) * 100)
    : null;
    
  const resolvedMedia = useMemo(() => resolveProductMedia(product), [product]);
  const imageSrc = resolvedMedia.primaryImageUrl || 'https://images.unsplash.com/photo-1519408230728-0c7c8f0b2c5f';

  const handleAddToCart = (e?: React.MouseEvent, bypassModalCheck = false) => {
    e?.preventDefault();
    e?.stopPropagation();

    // Prioritize the setup modal if variants exist and we aren't executing directly inside it
    if (hasVariants && !bypassModalCheck) {
      setIsOpenQuickView(true);
      return;
    }

    addToCart({
      ...product,
      finalPrice: calculatedPrices.finalPrice,
      sellingPrice: calculatedPrices.sellingPrice || product.sellingPrice,
      selectedOptions: { ...selectedOptions },
    });
  };

  const handleDecreaseQuantity = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    // Pass along options fingerprint state if context matches variant footprints
    if (typeof decreaseQuantity === 'function') {
      decreaseQuantity(product.id, { selectedOptions });
    }
  };

  return (
    <>
      <div className="relative flex flex-col bg-white dark:bg-zinc-900 rounded-[2.5rem] p-4 transition-all duration-500 group border border-transparent hover:border-slate-100 dark:hover:border-zinc-800 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)]">
        {/* --- IMAGE CONTAINER --- */}
        <div className="relative h-64 w-full rounded-[2rem] overflow-hidden bg-[#F8FAFC] dark:bg-zinc-800/50">
          <Link href={`/babyecommerce/products/${product.id}`} className="block h-full w-full">
            <Image
              src={imageSrc}
              alt={name}
              fill
              loader={loader}
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </Link>

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {resolvedMedia.hasVideo && (
              <div className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/20 shadow-md">
                <VideoCameraIcon className="w-3.5 h-3.5 text-pink-400" />
                <span>Video</span>
              </div>
            )}
            {discount && (
              <div 
                className="px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-wider shadow-sm"
                style={{ backgroundColor: secondary }}
              >
                {discount}% OFF
              </div>
            )}
          </div>

          {/* WhatsApp Floating Concierge */}
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-3 right-14 p-2.5 rounded-full bg-[#25D366]/90 backdrop-blur-md text-white shadow-sm hover:scale-110 transition-transform active:scale-90"
            title="Ask a Question"
          >
            <WhatsAppIcon className="w-5 h-5" />
          </a>

          {/* Heart Action */}
          <button className="absolute top-3 right-3 p-2.5 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-slate-400 dark:text-zinc-500 hover:text-pink-500 dark:hover:text-pink-400 transition-colors shadow-sm">
            <HeartIcon className="w-5 h-5" />
          </button>

          {/* Open QuickView Overlay Trigger */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpenQuickView(true)}
            className="absolute bottom-4 right-4 p-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
          >
            <ShoppingBagIcon className="w-5 h-5" />
          </motion.button>
        </div>

        {/* --- CONTENT SECTION --- */}
        <div className="px-2 pt-6 pb-2 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-1 text-amber-400">
              <StarIcon className="w-4 h-4" />
              <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">4.8</span>
            </div>
            <button 
              type="button"
              onClick={() => setIsOpenQuickView(true)}
              style={{ color: primary }}
              className="text-[10px] font-black uppercase tracking-widest hover:underline cursor-pointer"
            >
              {hasVariants ? "Configure Options" : "Quick View"}
            </button>
          </div>

          <Link href={`/babyecommerce/products/${product.id}`}>
            <h4 className="text-lg font-bold text-slate-800 dark:text-zinc-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {name}
            </h4>
          </Link>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                KSh {calculatedPrices.finalPrice.toLocaleString()}
              </span>
              {calculatedPrices.sellingPrice && calculatedPrices.sellingPrice > calculatedPrices.finalPrice && (
                <span className="text-sm line-through text-slate-300 dark:text-zinc-600 font-medium">
                  KSh {calculatedPrices.sellingPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* --- DYNAMIC FOOTER ACTIONS --- */}
          <div className="mt-6">
            <AnimatePresence mode="wait">
              {hasVariants ? (
                // If options exist, prioritize configuration modal pathway
                <motion.button
                  key="variant-trigger-state"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsOpenQuickView(true)}
                  className="w-full py-4 rounded-2xl text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
                  style={{ 
                    backgroundColor: primary,
                    boxShadow: `0 12px 24px -8px ${primary}66`
                  }}
                >
                  <ShoppingBagIcon className="w-4 h-4" />
                  {totalProductQuantity > 0 ? `Configure (${totalProductQuantity} in Cart)` : "Choose Size / Setup"}
                </motion.button>
              ) : currentVariantQuantity > 0 ? (
                // Standard inline quantity setup for completely variant-free flat items
                <motion.div 
                  key="in-cart-state"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center justify-between bg-slate-50 dark:bg-zinc-800/50 p-1 rounded-2xl border border-slate-100 dark:border-zinc-800"
                >
                  <div className="flex items-center gap-1">
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={handleDecreaseQuantity}
                      className="p-3 rounded-xl bg-white dark:bg-zinc-900 shadow-sm text-slate-600 dark:text-zinc-300 hover:text-red-500 transition-colors"
                    >
                      {currentVariantQuantity === 1 ? <TrashIcon className="h-4 w-4" /> : <MinusIcon className="h-4 w-4" />}
                    </motion.button>
                    <span className="w-10 text-center font-black text-slate-700 dark:text-zinc-200">{currentVariantQuantity}</span>
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={(e) => handleAddToCart(e, true)}
                      className="p-3 rounded-xl bg-white dark:bg-zinc-900 shadow-sm text-slate-600 dark:text-zinc-300 hover:text-blue-500 transition-colors"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </motion.button>
                  </div>
                  <div className="pr-4">
                    <span className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-tighter">In Cart</span>
                  </div>
                </motion.div>
              ) : (
                // Standard default add state for flat items
                <motion.button
                  key="add-to-cart-state"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => handleAddToCart(e, true)}
                  className="w-full py-4 rounded-2xl text-white font-bold text-sm shadow-lg transition-all active:shadow-none"
                  style={{ 
                    backgroundColor: primary,
                    boxShadow: `0 12px 24px -8px ${primary}66`
                  }}
                >
                  Add to Cart
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ================= GLOBAL HIGH-INDEX QUICKVIEW MODAL PORTAL ================= */}
      <AnimatePresence>
        {isOpenQuickView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Layer overlay wrapper blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpenQuickView(false)}
              className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
            />

            {/* Modal surface container frame element layout configuration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-zinc-800 flex flex-col max-h-[85vh]"
            >
              {/* Close Button Component */}
              <button
                onClick={() => setIsOpenQuickView(false)}
                className="absolute top-5 right-5 z-10 p-2 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 rounded-full transition-colors shadow-sm"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>

              <div className="overflow-y-auto p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden space-y-6">
                {/* Product Detail Layout Header Section */}
                <div className="flex gap-4 border-b border-slate-100 dark:border-zinc-800 pb-5 pt-2">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 dark:bg-zinc-800 border dark:border-zinc-700 flex-shrink-0">
                    <Image
                      src={imageSrc}
                      alt={name}
                      fill
                      className="object-cover"
                      loader={loader}
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-0.5">Customize Item</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">{name}</h3>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-xl font-black text-slate-900 dark:text-white">
                        KSh {calculatedPrices.finalPrice.toLocaleString()}
                      </span>
                      {calculatedPrices.sellingPrice && calculatedPrices.sellingPrice > calculatedPrices.finalPrice && (
                        <span className="text-xs line-through text-slate-300 dark:text-zinc-600 font-medium">
                          KSh {calculatedPrices.sellingPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Variant Configuration Loop Grid Option mapping blocks */}
                {hasVariants ? (
                  <div className="space-y-4">
                    {Object.entries(groupedVariants).map(([category, items]) => (
                      <div key={category} className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
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
                                    ? "text-white shadow-sm scale-[1.02]" 
                                    : "border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800"
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
                ) : (
                  <p className="text-xs text-slate-400 dark:text-zinc-500 text-center py-4">No variant adjustments required for this dynamic profile selection.</p>
                )}

                {/* Primary Global Context Action Controls Wrapper */}
                <div className="pt-2 space-y-3">
                  <AnimatePresence mode="wait">
                    {currentVariantQuantity > 0 ? (
                      /* If specific configured items already exist in the cart, prioritize modification buttons directly inside the modal */
                      <motion.div
                        key="modal-modifier-controls"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-between bg-slate-50 dark:bg-zinc-800/50 p-1.5 rounded-2xl border border-slate-100 dark:border-zinc-800 w-full"
                      >
                        <div className="flex items-center gap-1 w-full justify-between">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleDecreaseQuantity}
                            className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 shadow-sm text-slate-600 dark:text-zinc-300 hover:text-red-500 transition-colors"
                          >
                            {currentVariantQuantity === 1 ? <TrashIcon className="h-4 w-4" /> : <MinusIcon className="h-4 w-4" />}
                          </motion.button>
                          
                          <div className="text-center flex flex-col">
                            <span className="font-black text-sm text-slate-800 dark:text-zinc-100">
                              {currentVariantQuantity} in Cart
                            </span>
                            <span className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-bold">
                              This Specific Variant
                            </span>
                          </div>

                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handleAddToCart(e, true)}
                            className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 shadow-sm text-slate-600 dark:text-zinc-300 hover:text-blue-500 transition-colors"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ) : (
                      /* Fresh addition option configuration trigger button context action */
                      <motion.button
                        key="modal-add-trigger"
                        disabled={hasVariants && !allOptionsSelected}
                        onClick={(e) => handleAddToCart(e, true)}
                        style={{ 
                          backgroundColor: (hasVariants && !allOptionsSelected) ? undefined : primary,
                          boxShadow: (hasVariants && !allOptionsSelected) ? undefined : `0 12px 24px -8px ${primary}66`
                        }}
                        className="w-full py-4 bg-slate-900 dark:bg-zinc-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-30 transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <ShoppingBagIcon className="w-4 h-4" />
                        Add Selected Variant
                      </motion.button>
                    )}
                  </AnimatePresence>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 text-slate-800 dark:text-zinc-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                    Inquire via WhatsApp
                  </a>
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