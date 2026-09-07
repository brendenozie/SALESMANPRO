'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightIcon, ShoppingBagIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/solid';
import { MarketListingForm, VariantOptionItem } from '@/types/typings';
import useSWR from 'swr';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { useStoreContext } from '@/contexts/StoreContext';
import { useStateContext } from '@/contexts/ContextProvider';
import QuickViewModal from '../QuickViewModal';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}?q=${quality || 75}`;

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const productVariants = {
  initial: { y: 40, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

const ProductGridItem = ({
  product,
  isFeatured = false,
  primary,
  secondary,
  slug,
  contactPhone,
}: {
  product: MarketListingForm;
  isFeatured?: boolean;
  primary: string;
  secondary: string;
  slug: string;
  contactPhone: string;
}) => {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || primary;

  // Group options by their category (e.g., Size, Color)
  const groupedVariants = useMemo(() => {
    const options = (product.option || []) as VariantOptionItem[];
    return options.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, VariantOptionItem[]>);
  }, [product.option]);

  // Set the first item of each variant category as the fallback default state configuration
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const fallbacks: Record<string, string> = {};
    Object.entries(groupedVariants).forEach(([category, variants]) => {
      if (variants.length > 0) {
        fallbacks[category] = variants[0].name;
      }
    });
    return fallbacks;
  });

  const hasVariants = Object.keys(groupedVariants).length > 0;

  // Price calculation engine updating dynamically based on local variation choices
  const calculatedPrices = useMemo(() => {
    const baseFinalPrice = product.finalPrice ?? product.sellingPrice ?? 0;
    const baseSellingPrice = product.sellingPrice ?? 0;
    
    let totalSurcharge = 0;
    Object.entries(selectedOptions).forEach(([category, name]) => {
      const match = groupedVariants[category]?.find((v) => v.name === name);
      if (match?.extraPrice) {
        totalSurcharge += match.extraPrice;
      }
    });

    return {
      finalPrice: baseFinalPrice + totalSurcharge,
      sellingPrice: baseSellingPrice > 0 ? baseSellingPrice + totalSurcharge : undefined,
    };
  }, [selectedOptions, groupedVariants, product.finalPrice, product.sellingPrice]);

  // Read context state mapping to the exactly chosen attributes configuration combinations
  const quantity = cart.find((item: any) => {
    if (item.id !== product.id) return false;
    if (hasVariants) {
      if (!item.selectedOptions) return false;
      return Object.entries(selectedOptions).every(([cat, val]) => item.selectedOptions[cat] === val);
    }
    return true;
  })?.quantity || 0;

  const imageSrc =
    (typeof product.images?.[0] === "string"
      ? product.images?.[0]
      : (product.images?.[0] as any)?.url) ||
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff";

  const optionsSummary = Object.entries(selectedOptions)
    .map(([cat, val]) => `${cat}: ${val}`)
    .join(', ');

  const whatsappNumber = `${storeFormData?.contactPhone || contactPhone || "254732771353"}`.replace(/\D/g, '');
  const message = encodeURIComponent(
    `Hi! I'm interested in "${product.name}"${optionsSummary ? ` (${optionsSummary})` : ''} priced at KES ${calculatedPrices.finalPrice.toLocaleString()}. Is it available?`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const handleAddToCart = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    addToCart({
      ...product,
      finalPrice: calculatedPrices.finalPrice,
      sellingPrice: calculatedPrices.sellingPrice || product.sellingPrice,
      selectedOptions,
    });
  };

  const handleDecreaseQuantity = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    // Fallback if global application layer expects single parameter strings
    decreaseQuantity(product.id, selectedOptions);
  };

  return (
    <>
      <motion.div
        variants={productVariants}
        className={`group relative flex flex-col bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md rounded-[2rem] border border-zinc-100 dark:border-zinc-800/60 overflow-hidden shadow-sm hover:shadow-2xl hover:border-zinc-200 dark:hover:border-zinc-700 transition-all duration-500 min-h-[580px] ${
          isFeatured ? "md:col-span-2" : ""
        }`}
      >
        {/* ================= IMAGE AREA ================= */}
        <div 
          className="relative block w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500"
          style={{ height: isFeatured ? "360px" : "280px" }}
        >
          <Link href={`/ecommerceshoes/products/${product.id}`} className="absolute inset-0 w-full h-full block">
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              loader={loader}
              className="object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-black/20 transition-colors duration-500" />
          </Link>

          {/* QUICK VIEW BUTTON */}
          <div className="absolute inset-x-0 bottom-4 flex justify-center z-20 px-4 transform opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsQuickViewOpen(true);
              }}
              style={{ backgroundColor: primaryColor }}
              className="w-full max-w-[180px] py-2.5 text-white rounded-xl font-bold text-[12px] tracking-wider shadow-xl flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-95 transition-all duration-200"
            >
              Quick View
            </button>
          </div>

          {/* WHATSAPP BADGE */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute top-4 right-4 z-20 p-2.5 bg-[#25D366] text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-transform duration-200"
          >
            <WhatsAppIcon className="w-5 h-5" />
          </a>

          {/* BADGES */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5">
            {product.isNewArrival && (
              <span className="bg-zinc-900/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-zinc-900 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                New
              </span>
            )}
            {product.isDiscounted && product.sellingPrice && (
              <span className="bg-rose-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg tracking-wide shadow-sm">
                -{Math.round(((product.sellingPrice - (product.finalPrice || 0)) / product.sellingPrice) * 100)}%
              </span>
            )}
          </div>
        </div>

        {/* ================= DETAILS, INLINE OPTIONS & PRICING ================= */}
        <div className="p-6 flex flex-col flex-grow justify-between bg-white dark:bg-zinc-900/60">
          <div>
            <div className="flex justify-between items-baseline gap-2 mb-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                {product.category?.name || "Premium Item"}
              </p>
              
              {/* Reactive Subtotal Price Indicator */}
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold text-zinc-900 dark:text-white">
                  KES {calculatedPrices.finalPrice.toLocaleString()}
                </span>
                {product.isDiscounted && calculatedPrices.sellingPrice && (
                  <span className="text-xs line-through text-zinc-400 dark:text-zinc-500">
                    KES {calculatedPrices.sellingPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <h4 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors duration-200 line-clamp-1 mb-4">
              {product.name}
            </h4>

            {/* ================= DYNAMIC VARIANT CHIP CONTROLS ================= */}
            {hasVariants && (
              <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                {Object.entries(groupedVariants).map(([category, items]) => (
                  <div key={category} className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 dark:text-zinc-500">
                      Select {category}:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((item) => {
                        const isSelected = selectedOptions[category] === item.name;
                        return (
                          <button
                            key={item.name}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedOptions(prev => ({
                                ...prev,
                                [category]: item.name
                              }));
                            }}
                            style={{
                              borderColor: isSelected ? primaryColor : undefined,
                              backgroundColor: isSelected ? `${primaryColor}10` : undefined,
                              color: isSelected ? primaryColor : undefined
                            }}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all duration-200 ${
                              isSelected
                                ? 'border-2'
                                : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                            }`}
                          >
                            {item.name}
                            {item.extraPrice ? ` (+${item.extraPrice})` : ''}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ================= BUTTONS ACTION LAYER ================= */}
          <div className="mt-5 pt-3 border-t border-zinc-50 dark:border-zinc-800/40">
            <AnimatePresence mode="wait">
              {quantity > 0 ? (
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-950 p-1.5 rounded-xl border border-zinc-100 dark:border-zinc-800"
                >
                  <button
                    onClick={handleDecreaseQuantity}
                    className="p-2.5 bg-white dark:bg-zinc-900 rounded-lg shadow-sm hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-500 text-zinc-600 dark:text-zinc-300 transition-colors"
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>

                  <div className="flex flex-col items-center">
                    <span className="font-extrabold text-sm text-zinc-900 dark:text-white">
                      {quantity} in Cart
                    </span>
                    <span className="text-[9px] font-medium text-zinc-400 dark:text-zinc-500 max-w-[150px] truncate uppercase">
                      {optionsSummary || 'Standard config'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddToCart()}
                    className="p-2.5 bg-white dark:bg-zinc-900 rounded-lg shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart()}
                    style={{ backgroundColor: primaryColor }}
                    className="flex-[4] flex items-center justify-center gap-2 py-3.5 text-white rounded-xl font-bold tracking-wide text-xs uppercase shadow-md hover:brightness-110 active:brightness-95 transition-all duration-200"
                  >
                    <ShoppingBagIcon className="w-4 h-4" />
                    Add Selected Variant
                  </button>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800 text-[#25D366] rounded-xl transition-all duration-200"
                  >
                    <WhatsAppIcon className="w-5 h-5" />
                  </a>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <QuickViewModal 
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        product={product}
        primaryColor={primaryColor}
      />
    </>
  );
};


export default function PopularProducts({ id, themeSettings, marketplaceListings, slug = 'store' }: any) {
  const { storeFormData } = useStoreContext();
  
  const primary = themeSettings?.primaryColor || '#6366f1'; 
  const secondary = themeSettings?.secondaryColor || '#f43f5e';

  const url = `${apiBaseUrl}/productsByFlag?companyId=${id}&flag=isFeatured&limit=5`;
  const { data, isLoading } = useSWR(url, createCachedFetcher(`products-${id}-featured`), {
    fallbackData: marketplaceListings?.length ? { data: marketplaceListings } : undefined,
  });

  const productsToShow: MarketListingForm[] = data?.data?.length > 0 ? data.data : [];

  if (isLoading && !productsToShow.length) {
    return (
      <section className="py-24 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6"><SkeletonGrid count={5} /></div>
      </section>
    );
  }

  return (
    <section className="py-24 md:py-32 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[400px] h-[400px] bg-rose-500/5 dark:bg-rose-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-sm mb-5">
               <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primary }} />
               <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400">Trending Now</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white leading-[1.05] tracking-tight">
              DRIP OR <br /><span style={{ color: primary }}>DROWN.</span>
            </h2>
            <p className="mt-5 text-zinc-500 dark:text-zinc-400 text-base md:text-lg font-medium max-w-xl leading-relaxed">
              Curated street essentials designed for those who walk different. Hand-picked quality, certified original.
            </p>
          </div>
          
          <Link 
            href={`/ecommerceshoes/products?companyId=${id}&flag=isFeatured`} 
            className="group inline-flex items-center gap-3 font-bold text-xs uppercase tracking-[0.2em] text-zinc-800 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
             Browse All 
             <div className="w-11 h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:bg-zinc-900 dark:group-hover:bg-white dark:group-hover:text-zinc-950 group-hover:text-white transition-all duration-300">
               <ArrowRightIcon className="w-4 h-4" />
             </div>
          </Link>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8 relative z-10"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.05 }}
          variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
        >
          {productsToShow.slice(0, 5).map((product, index) => (
            <ProductGridItem
              key={product.id || index}
              product={product}
              isFeatured={index === 0}
              primary={primary}
              secondary={secondary}
              slug={slug}
              contactPhone={storeFormData?.contactPhone || "254732771353"}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}