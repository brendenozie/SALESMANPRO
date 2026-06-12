'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { StarIcon, ArrowRightIcon, ShoppingBagIcon, MinusIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { MarketListingForm, VariantOptionItem } from '@/types/typings';
import useSWR from 'swr';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { useStoreContext } from '@/contexts/StoreContext';
import { useStateContext } from '@/contexts/ContextProvider';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// WhatsApp Icon for Quick Inquiries
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const productVariants = {
  initial: { y: 30, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
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
  const [isSelectingOptions, setIsSelectingOptions] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();

  const primaryColor = storeFormData?.themeSettings?.primaryColor || primary;

  // 1. Group dynamic product options safely by categories from database
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

  // 2. Real-time cost updates pooling base pricing and option surcharges
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

  // 3. Exact matching logic verifying item configuration records inside the cart array
  const quantity = cart.find((item: any) => {
    if (item.id !== product.id) return false;
    if (hasVariants) {
      if (!item.selectedOptions) return false;
      return Object.entries(selectedOptions).every(([cat, val]) => item.selectedOptions[cat] === val);
    }
    return true;
  })?.quantity || 0;

  // ---------- IMAGE ----------
  const imageSrc =
    (typeof product.images?.[0] === "string"
      ? product.images?.[0]
      : (product.images?.[0] as any)?.url) ||
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff";

  // ---------- WHATSAPP ----------
  const optionsSummary = Object.entries(selectedOptions)
    .map(([cat, val]) => `${cat}: ${val}`)
    .join(', ');

  const whatsappNumber = `${storeFormData?.contactPhone || contactPhone || "254732771353"}`.replace(/\D/g, '');

  const message = encodeURIComponent(
    `Hi! I'm interested in "${product.name}"${optionsSummary ? ` (${optionsSummary})` : ''} priced at KES ${calculatedPrices.finalPrice.toLocaleString()}. Is it available?`
  );

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  // ---------- ADD TO CART ----------
  const handleAddToCart = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation(); // Fix mobile layout navigation capture

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
      variants={productVariants}
      className={`group relative flex flex-col bg-white dark:bg-[#0c0c0c] rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 transition-all duration-500 ${
        isFeatured ? "md:col-span-2" : ""
      }`}
    >
      {/* ================= IMAGE NAVIGATION ZONE ================= */}
      <Link
        href={`/ecommerceshoes/products/${product.id}`}
        className="relative block w-full overflow-hidden rounded-t-[2.5rem]"
        style={{ height: isFeatured ? "480px" : "320px" }}
      >
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          loader={loader}
          className="object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:-rotate-3"
        />
      </Link>

      {/* ================= WHATSAPP FLOAT ================= */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="absolute top-6 right-6 z-20 p-3 bg-[#25D366] text-white rounded-2xl shadow-xl hover:scale-110 transition-transform"
      >
        <WhatsAppIcon className="w-5 h-5" />
      </a>

      {/* ================= BADGES ================= */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
        {product.isNewArrival && (
          <span className="bg-zinc-900 text-white text-[10px] font-black px-3 py-1 rounded-full">
            New
          </span>
        )}

        {product.isDiscounted && product.sellingPrice && (
          <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full">
            -{Math.round(((product.sellingPrice - (product.finalPrice || 0)) / product.sellingPrice) * 100)}%
          </span>
        )}
      </div>

      {/* ================= DETAILS ================= */}
      <div className="p-8 flex flex-col flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              {product.category?.name || "Premium Item"}
            </p>
            <h4 className="text-xl font-black text-zinc-900 dark:text-white">
              {product.name}
            </h4>
          </div>

          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">
            <StarIcon className="w-3 h-3 text-amber-500" />
            <span className="text-[10px] font-black">4.8</span>
          </div>
        </div>

        <div className="mt-4">
          <span className="text-2xl font-black text-zinc-900 dark:text-white">
            KES {calculatedPrices.finalPrice.toLocaleString()}
          </span>

          {product.isDiscounted && calculatedPrices.sellingPrice && (
            <span className="ml-2 text-sm line-through text-zinc-400">
              KES {calculatedPrices.sellingPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="mt-6">
          {quantity > 0 ? (
            <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800 p-2 rounded-2xl">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  decreaseQuantity(product.id);
                }}
                className="p-3 bg-white dark:bg-zinc-700 rounded-xl shadow-sm border border-zinc-200/40 dark:border-zinc-600"
              >
                <MinusIcon className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center">
                <span className="font-black text-zinc-900 dark:text-white">{quantity}</span>
                {optionsSummary && (
                  <span className="text-[8px] font-black text-zinc-400 max-w-[140px] truncate uppercase tracking-tight">
                    {optionsSummary}
                  </span>
                )}
              </div>

              <button
                onClick={() => handleAddToCart()}
                className="p-3 bg-white dark:bg-zinc-700 rounded-xl shadow-sm border border-zinc-200/40 dark:border-zinc-600"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => handleAddToCart()}
                style={{ backgroundColor: primaryColor }}
                className="flex-[4] flex items-center justify-center gap-2 py-4 text-white rounded-[1.5rem] font-black tracking-wide text-xs uppercase shadow-md transition-all active:brightness-95"
              >
                <ShoppingBagIcon className="w-4 h-4" />
                {hasVariants && !allOptionsSelected ? 'Select Options' : 'Add to Cart'}
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center bg-[#25D366] text-white rounded-[1.5rem] shadow-md hover:scale-[1.03] transition-transform"
              >
                <WhatsAppIcon className="w-5 h-5" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* ================= DYNAMIC SPECIFICATION VARIANT PICKER SHEET ================= */}
      <AnimatePresence>
        {isSelectingOptions && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="absolute inset-0 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md flex flex-col justify-end p-6 overflow-y-auto no-scrollbar"
          >
            <button
              onClick={() => setIsSelectingOptions(false)}
              className="absolute top-5 right-5 p-2 bg-zinc-50 dark:bg-zinc-800 rounded-full border border-zinc-200 dark:border-zinc-700"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>

            <div className="w-full space-y-5 pt-6">
              {Object.entries(groupedVariants).map(([category, items]) => (
                <div key={category} className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">
                    Choose {category}
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
                            borderColor: isSelected ? primaryColor : undefined,
                            backgroundColor: isSelected ? primaryColor : undefined 
                          }}
                          className={`px-4 py-2 rounded-xl border text-xs font-black transition-all ${
                            isSelected 
                              ? "text-white shadow-md shadow-black/10 scale-[1.02]" 
                              : "border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-800 dark:text-zinc-200 active:bg-zinc-100"
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
                style={{ backgroundColor: allOptionsSelected ? primaryColor : undefined }}
                className="mt-4 w-full py-4 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-40 transition-opacity shadow-lg"
              >
                Confirm Specification
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


export default function PopularProducts({ id, themeSettings, marketplaceListings, slug = 'store' }: any) {
  const { storeFormData } = useStoreContext();
  
  const primary = themeSettings?.primaryColor || '#6366f1'; 
  const secondary = themeSettings?.secondaryColor || '#f43f5e';

  const url = `${apiBaseUrl}/site/productsByFlag?companyId=${id}&flag=isFeatured&limit=5`;
  const { data, isLoading } = useSWR(url, createCachedFetcher(`products-${id}-featured`), {
    fallbackData: marketplaceListings?.length ? { data: marketplaceListings } : undefined,
  });

  const productsToShow: MarketListingForm[] = data?.data?.length > 0 ? data.data : [];

  if (isLoading && !productsToShow.length) {
    return (
      <section className="py-20 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6"><SkeletonGrid count={5} /></div>
      </section>
    );
  }

  return (
    <section className="py-32 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        {/* Background Decorative Blur Element */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm mb-6">
               <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primary }} />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Trending Now</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white leading-[0.9] tracking-tighter">
              DRIP OR <br /><span style={{ color: primary }}>DROWN.</span>
            </h2>
            <p className="mt-8 text-zinc-500 dark:text-zinc-400 text-lg font-medium leading-relaxed">
              Curated street essentials designed for those who walk different. Hand-picked quality, certified original.
            </p>
          </div>
          <Link href={`/ecommerceshoes/products?companyId=${id}&flag=isFeatured`} className="group flex items-center gap-4 font-black text-xs uppercase tracking-[0.3em] dark:text-white">
             Browse All <div className="w-12 h-12 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all"><ArrowRightIcon className="w-4 h-4" /></div>
          </Link>
        </div>

        {/* Products Grid Platform Layout */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.1 }}
          variants={{ animate: { transition: { staggerChildren: 0.15 } } }}
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