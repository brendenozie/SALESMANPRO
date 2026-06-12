'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { 
  HeartIcon, 
  MinusIcon, 
  PlusIcon, 
  TrashIcon,
  CubeIcon,
  ChevronRightIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { MarketListingForm, VariantOptionItem } from '@/types/typings';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';

const loader = ({ src }: { src: string }) => src;

// Custom WhatsApp Icon for architectural style
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface ProductCardProps {
  product: MarketListingForm;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isSelectingOptions, setIsSelectingOptions] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();

  const primary = storeFormData?.themeSettings?.primaryColor || '#18181b';

  // 1. Group custom variants (e.g. Finish, Wood Type, Dimensions) safely
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

  // 2. Compute dynamic pricing adjustments based on options selected
  const calculatedPrices = useMemo(() => {
    const baseFinalPrice = product.finalPrice ?? product.sellingPrice ?? 0;
    const baseSellingPrice = product.sellingPrice ?? 0;
    
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
  }, [selectedOptions, groupedVariants, product.finalPrice, product.sellingPrice]);

  // 3. Exact matching logic for items inside global cart context
  const quantity = cart.find((item: any) => {
    if (item.id !== product.id) return false;
    if (hasVariants) {
      if (!item.selectedOptions) return false;
      return Object.entries(selectedOptions).every(([cat, val]) => item.selectedOptions[cat] === val);
    }
    return true;
  })?.quantity || 0;

  // WhatsApp Concierge Config
  const optionsSummary = Object.entries(selectedOptions)
    .map(([cat, val]) => `${cat}: ${val}`)
    .join(', ');

  const whatsappNumber = `${storeFormData?.contactPhone || "254732771353"}`.replace(/\D/g, '');
  const message = encodeURIComponent(
    `I am interested in commissioning the "${product.name}" piece${product.brand ? ` by ${product.brand}` : ''}${optionsSummary ? ` with customization (${optionsSummary})` : ''} priced at KES ${calculatedPrices.finalPrice.toLocaleString()}. Could you provide more details on lead times and materials?`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const discount =
    product.sellingPrice && product.finalPrice != null && product.sellingPrice > product.finalPrice
      ? Math.round(((product.sellingPrice - product.finalPrice) / product.sellingPrice) * 100)
      : null;

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
      className="group relative flex flex-col bg-white dark:bg-[#080808] transition-all duration-700"
    >
      {/* --- ARCHITECTURAL IMAGE FRAME --- */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-[#F7F7F7] dark:bg-zinc-900 border border-transparent dark:border-zinc-800/50 group-hover:shadow-[0_30px_100px_-20px_rgba(0,0,0,0.15)] transition-all duration-700">
        
        <Link href={`/furnitureecommerce/products/${product.id}`} className="block w-full h-full">
          <Image
            src={product.images?.[0] || "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1000"}
            alt={product.name}
            loader={loader}
            fill
            className="object-cover transition-transform duration-[2s] ease-[0.16, 1, 0.3, 1] group-hover:scale-110"
          />
        </Link>

        {/* ELEGANT BADGES */}
        <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
          {product.isNewArrival && (
            <span className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-zinc-900 dark:text-white text-[8px] font-black px-3 py-1.5 uppercase tracking-[0.3em] rounded-full shadow-sm border border-white/20">
              Limited Edition
            </span>
          )}
          {discount && (
            <span 
              className="text-white text-[8px] font-black px-3 py-1.5 uppercase tracking-[0.3em] rounded-full shadow-lg"
              style={{ backgroundColor: primary }}
            >
              -{discount}% Off
            </span>
          )}
        </div>

        {/* TOP RIGHT ACTIONS */}
        <div className="absolute top-6 right-6 z-10 flex flex-col gap-3">
          <button className="p-3 rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-xl text-zinc-900 dark:text-white hover:bg-white dark:hover:bg-white dark:hover:text-black transition-all shadow-xl">
            <HeartIcon className="w-4 h-4" />
          </button>
          
          {/* Subtle Mobile WhatsApp Float */}
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="md:hidden p-3 rounded-full bg-[#25D366]/90 backdrop-blur-xl text-white shadow-xl active:scale-90 transition-transform"
          >
            <WhatsAppIcon className="w-4 h-4" />
          </a>
        </div>

        {/* --- DUAL ACTION HUD --- */}
        <div className="absolute inset-x-6 bottom-6 z-20">
          <AnimatePresence mode="wait">
            {quantity === 0 ? (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="flex gap-2 group-hover:opacity-100 transition-all duration-500 lg:opacity-0 md:opacity-100"
              >
                {/* Main Reserve Button */}
                <button
                  onClick={() => handleAddToCart()}
                  className="flex-[3] h-14 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl text-zinc-900 dark:text-white text-[9px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 rounded-2xl shadow-2xl border border-white/20 hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900 transition-all"
                >
                  <PlusIcon className="w-4 h-4" />
                  {hasVariants && !allOptionsSelected ? "Select Setup" : "Reserve Piece"}
                </button>

                {/* Desktop Concierge Button */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-14 bg-white/40 dark:bg-black/40 backdrop-blur-2xl text-zinc-900 dark:text-white flex items-center justify-center rounded-2xl shadow-2xl border border-white/10 hover:bg-[#25D366] hover:text-white transition-all hidden md:flex"
                  title="Consult Designer"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                </a>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center justify-between bg-white dark:bg-zinc-800 p-1 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-zinc-100 dark:border-zinc-700"
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    decreaseQuantity(product.id);
                  }}
                  className="p-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  {quantity === 1 ? <TrashIcon className="h-4 w-4 text-red-500" /> : <MinusIcon className="h-4 w-4 text-zinc-400" />}
                </button>
                <div className="flex flex-col items-center">
                   <span className="text-[10px] font-black dark:text-white">{quantity}</span>
                   <span className="text-[7px] font-bold text-zinc-400 uppercase tracking-tighter">In Cart</span>
                </div>
                <button
                  onClick={() => handleAddToCart()}
                  className="p-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 text-zinc-900 dark:text-white" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- INFO PANEL --- */}
      <div className="mt-8 px-2 space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-500">
                {product.brand || 'Handcrafted Artisan'}
              </span>
              <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-emerald-500">
                In Stock
              </span>
            </div>
            
            <Link href={`/furnitureecommerce/products/${product.id}`}>
              <h2 className="text-xl font-serif font-medium tracking-tight text-zinc-900 dark:text-white leading-tight">
                {product.name}
              </h2>
            </Link>
          </div>

          <div className="text-right">
            {discount && calculatedPrices.sellingPrice ? (
              <div className="flex flex-col items-end">
                <span className="text-xs text-zinc-400 line-through tracking-tighter mb-0.5">
                  KES {calculatedPrices.sellingPrice.toLocaleString()}
                </span>
                <span className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter">
                  KES {calculatedPrices.finalPrice.toLocaleString()}
                </span>
              </div>
            ) : (
              <span className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter">
                KES {calculatedPrices.finalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* SPEC TILES */}
        <div className="flex items-center gap-6 pt-6 border-t border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900">
              <CubeIcon className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div>
              <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none">Material</p>
              <p className="text-[10px] font-bold dark:text-zinc-300 tracking-tight mt-1 truncate max-w-[80px]">Solid Oak</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900">
              <SparklesIcon className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div>
              <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none">Inquiry</p>
              <a 
                href={whatsappUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex mt-1 text-[8px] uppercase tracking-[0.25em] text-green-500 hover:text-zinc-900 dark:hover:text-white transition-colors py-1.5 px-3 rounded-lg bg-green-50/50 hover:bg-green-100/50 dark:bg-green-900/10 dark:hover:bg-green-900/20 gap-1.5 items-center font-bold"
              >
                <WhatsAppIcon className="w-3 h-3" /> Connect
              </a>
            </div>
          </div>

          <Link href={`/furnitureecommerce/products/${product.id}`} className="ml-auto p-2 hover:translate-x-1 transition-transform">
              <ChevronRightIcon className="w-5 h-5 text-zinc-300 dark:text-zinc-700" />
          </Link>
        </div>
      </div>

      {/* ================= DYNAMIC SPECIFICATION ARCHITECTURAL ATRIBUTES MODAL SHEET ================= */}
      <AnimatePresence>
        {isSelectingOptions && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="absolute inset-0 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md flex flex-col justify-end p-6 overflow-y-auto no-scrollbar rounded-[2.5rem]"
          >
            <button
              onClick={() => setIsSelectingOptions(false)}
              className="absolute top-6 right-6 p-2 bg-zinc-50 dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>

            <div className="w-full space-y-5 pt-4">
              {Object.entries(groupedVariants).map(([category, items]) => (
                <div key={category} className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400 text-center">
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
                          {opt.extraPrice > 0 && ` (+KES ${opt.extraPrice.toLocaleString()})`}
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
                Confirm Specifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductCard;