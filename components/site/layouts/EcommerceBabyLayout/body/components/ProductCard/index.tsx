'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MinusIcon, 
  PlusIcon, 
  StarIcon, 
  TrashIcon, 
  ShoppingBagIcon,
  HeartIcon,
  XMarkIcon
} from '@heroicons/react/24/solid';
import { MarketListingForm, VariantOptionItem } from '@/types/typings';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  product: MarketListingForm;
}

const loader = ({ src }: { src: string }) => src;

// Custom WhatsApp Icon for a friendly baby-store vibe
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
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#F472B6';
  const secondary = storeFormData?.themeSettings?.secondaryColor || '#3B82F6';

  const { name, images, finalPrice, sellingPrice } = product;

  // 1. Group variants cleanly from options array (e.g., Size, Color, Age Group)
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

  // 2. Continuous pricing calculation including specific multi-variant surcharges
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

  // 3. Structural variant lookup optimization within global cart state
  const quantity = cart.find((item: any) => {
    if (item.id !== product.id) return false;
    if (hasVariants) {
      if (!item.selectedOptions) return false;
      return Object.entries(selectedOptions).every(([cat, val]) => item.selectedOptions[cat] === val);
    }
    return true;
  })?.quantity || 0;

  // WhatsApp Config - Populated with dynamic store number and variant choices
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
    
  const imageSrc = images?.[0] || 'https://images.unsplash.com/photo-1519408230728-0c7c8f0b2c5f';

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
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="relative flex flex-col bg-white dark:bg-zinc-900 rounded-[2.5rem] p-4 transition-all duration-500 group border border-transparent hover:border-slate-100 dark:hover:border-zinc-800 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)]"
    >
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
        <div className="absolute top-3 left-3 flex flex-col gap-2">
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

        {/* Quick Add Overlay */}
        {quantity === 0 && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleAddToCart()}
            className="absolute bottom-4 right-4 p-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
          >
            <ShoppingBagIcon className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="px-2 pt-6 pb-2 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-1 text-amber-400">
            <StarIcon className="w-4 h-4" />
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">4.8</span>
          </div>
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] font-black text-[#25D366] uppercase tracking-widest hover:underline"
          >
            <WhatsAppIcon className="w-3 h-3" />
            Chat Details
          </a>
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
            {quantity > 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center justify-between bg-slate-50 dark:bg-zinc-800/50 p-1 rounded-2xl border border-slate-100 dark:border-zinc-800"
              >
                <div className="flex items-center gap-1">
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={(e) => {
                      e.preventDefault();
                      decreaseQuantity(product.id);
                    }}
                    className="p-3 rounded-xl bg-white dark:bg-zinc-900 shadow-sm text-slate-600 dark:text-zinc-300 hover:text-red-500 transition-colors"
                  >
                    {quantity === 1 ? <TrashIcon className="h-4 w-4" /> : <MinusIcon className="h-4 w-4" />}
                  </motion.button>
                  <span className="w-10 text-center font-black text-slate-700 dark:text-zinc-200">{quantity}</span>
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => handleAddToCart()}
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
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAddToCart()}
                className="w-full py-4 rounded-2xl text-white font-bold text-sm shadow-lg transition-all active:shadow-none"
                style={{ 
                  backgroundColor: primary,
                  boxShadow: `0 12px 24px -8px ${primary}66`
                }}
              >
                {hasVariants && !allOptionsSelected ? "Choose Size / Setup" : "Add to Cart"}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ================= PLAYFUL SELECTION OVERLAY SHEET ================= */}
      <AnimatePresence>
        {isSelectingOptions && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 210 }}
            className="absolute inset-0 z-30 bg-white/98 dark:bg-zinc-950/98 backdrop-blur-md flex flex-col justify-end p-6 rounded-[2.5rem] border border-pink-100 dark:border-zinc-800 shadow-2xl"
          >
            <button
              onClick={() => setIsSelectingOptions(false)}
              className="absolute top-5 right-5 p-2 bg-slate-50 dark:bg-zinc-900 rounded-full border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors hover:bg-slate-100"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>

            <div className="w-full space-y-4 pt-4 overflow-y-auto no-scrollbar max-h-full">
              {Object.entries(groupedVariants).map(([category, items]) => (
                <div key={category} className="space-y-1.5 text-center">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Select Product {category}
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
                          className={`px-3.5 py-2 rounded-xl border text-[11px] font-bold transition-all ${
                            isSelected 
                              ? "text-white shadow-sm scale-[1.02]" 
                              : "border-slate-200 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-900/40 text-slate-800 dark:text-zinc-200 active:bg-slate-100"
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

              <button
                disabled={!allOptionsSelected}
                onClick={() => {
                  handleAddToCart();
                  setIsSelectingOptions(false);
                }}
                style={{ 
                  backgroundColor: allOptionsSelected ? primary : undefined,
                  boxShadow: allOptionsSelected ? `0 12px 24px -8px ${primary}66` : undefined
                }}
                className="mt-2 w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-30 transition-all shadow-md"
              >
                Confirm Selection
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductCard;