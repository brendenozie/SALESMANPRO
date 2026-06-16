'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MinusIcon, 
  PlusIcon, 
  StarIcon, 
  TrashIcon, 
  ShoppingBagIcon
} from '@heroicons/react/24/solid';
import { MarketListingForm, VariantOptionItem } from '@/types/typings';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import QuickViewModal from '../QuickViewModal';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function ProductCard({ product }: { product: MarketListingForm }) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  
  // Set up default initial variants from structure arrays if present
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (product.option && Array.isArray(product.option)) {
      product.option.forEach((opt: any) => {
        if (opt.category && opt.name && !initial[opt.category]) {
          initial[opt.category] = opt.name;
        }
      });
    }
    return initial;
  });
  
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#18181b'; 

  const groupedVariants = useMemo(() => {
    const options = (product.option || []) as VariantOptionItem[];
    return options.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, VariantOptionItem[]>);
  }, [product.option]);

  const hasVariants = Object.keys(groupedVariants).length > 0;

  // Calculates matrix combination signature tokens
  const currentSignatureId = useMemo(() => {
    if (selectedOptions && Object.keys(selectedOptions).length > 0) {
      return `${product.id}-${JSON.stringify(selectedOptions)}`;
    }
    return product.id;
  }, [product.id, selectedOptions]);

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

  // Scans context state matching exactly on the structural variant criteria match
  const quantity = useMemo(() => {
    const matchedItem = cart.find((item: any) => {
      const targetSignature = item.selectedOptions && Object.keys(item.selectedOptions).length > 0
        ? `${item.id}-${JSON.stringify(item.selectedOptions)}`
        : item.id;
      return targetSignature === currentSignatureId;
    });
    return matchedItem?.quantity || 0;
  }, [cart, currentSignatureId]);

  const optionsSummary = Object.entries(selectedOptions)
    .map(([cat, val]) => `${cat}: ${val}`)
    .join(', ');

  const whatsappNumber = `${storeFormData?.contactPhone || "254732771353"}`.replace(/\D/g, '');
  const message = encodeURIComponent(
    `Hi, I'm interested in ${product.name}${optionsSummary ? ` (${optionsSummary})` : ''} (KES ${calculatedPrices.finalPrice.toLocaleString()}). Is this configuration available?`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const handleAddToCart = (e?: React.MouseEvent) => {
    e?.preventDefault(); 
    addToCart({ 
      ...product, 
      finalPrice: calculatedPrices.finalPrice, 
      sellingPrice: calculatedPrices.sellingPrice || product.sellingPrice,
      selectedOptions 
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative flex flex-col bg-white dark:bg-zinc-900 rounded-[2rem] p-3 sm:p-4 border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all duration-300 md:hover:shadow-xl md:hover:shadow-black/[0.04]"
      >
        {/* BADGE PRODUCT DATA TAGS */}
        <div className="absolute top-5 left-5 z-20 flex flex-col gap-1.5 pointer-events-none">
          {product.isNewArrival && (
            <span className="bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
              NEW
            </span>
          )}
          {product.isDiscounted && product.sellingPrice && (
            <span className="bg-red-500 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
              -{Math.round(((product.sellingPrice - (product.finalPrice || 0)) / product.sellingPrice) * 100)}%
            </span>
          )}
        </div>

        {/* PRODUCT MEDIA CONTAINER */}
        <div className="relative aspect-square w-full overflow-hidden rounded-[1.5rem] bg-zinc-50 dark:bg-zinc-800/30 group">
          <Link href={`/ecommerceshoes/products/${product.id}`} className="block w-full h-full">
            <Image
              src={(product.images?.[0] as any)?.url || product.images?.[0] || 'https://via.placeholder.com/600'}
              alt={product.name}
              loader={loader}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-contain p-4 transition-transform duration-500 md:group-hover:scale-105"
              priority={product.isNewArrival}
            />
          </Link>
        </div>

        {/* METRIC DESCRIPTIVE BLOCK */}
        <div className="pt-4 px-1 pb-1 flex flex-col flex-grow">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 truncate mb-0.5">
                {product.category?.name || "Premium Collection"}
              </p>
              <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 leading-tight line-clamp-2">
                {product.name}
              </h4>
            </div>
            
            <div className="flex items-center gap-0.5 bg-zinc-50 dark:bg-zinc-800/60 px-2 py-1 rounded-md border border-zinc-100 dark:border-zinc-700/50 flex-shrink-0">
              <StarIcon className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] font-black text-zinc-700 dark:text-zinc-300">4.8</span>
            </div>
          </div>

          {/* PRICING CONTROL INTERFACE */}
          <div className="mt-auto pt-3 flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-black text-zinc-950 dark:text-white">
              KES {calculatedPrices.finalPrice.toLocaleString()}
            </span>
            {product.isDiscounted && calculatedPrices.sellingPrice && (
              <span className="text-xs font-medium text-zinc-400 line-through">
                KES {calculatedPrices.sellingPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* TRANSACTION ACTION CONTROLLER */}
          <div className="mt-4 flex gap-2">
            <AnimatePresence mode="wait">
              {quantity > 0 ? (
                <motion.div 
                  key="qty-control"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex-1 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 p-1 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60"
                >
                  <div className="flex items-center gap-1 w-full justify-between">
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={() => decreaseQuantity(currentSignatureId)} 
                      className="p-2.5 bg-white dark:bg-zinc-700 rounded-lg shadow-sm border border-zinc-100 dark:border-zinc-600 flex items-center justify-center min-w-[36px]"
                    >
                      {quantity === 1 ? (
                        <TrashIcon className="h-3.5 w-3.5 text-red-500" />
                      ) : (
                        <MinusIcon className="h-3.5 w-3.5 text-zinc-900 dark:text-white" />
                      )}
                    </motion.button>
                    
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-black text-zinc-900 dark:text-white">{quantity}</span>
                      {optionsSummary && (
                        <span className="text-[7px] font-extrabold uppercase text-zinc-400 max-w-[120px] truncate tracking-tight px-1 text-center">
                          {optionsSummary}
                        </span>
                      )}
                    </div>
                    
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleAddToCart()} 
                      className="p-2.5 bg-white dark:bg-zinc-700 rounded-lg shadow-sm border border-zinc-100 dark:border-zinc-600 flex items-center justify-center min-w-[36px]"
                    >
                      <PlusIcon className="h-3.5 w-3.5 text-zinc-900 dark:text-white" />
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  key="add-btn"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setIsQuickViewOpen(true)}
                  style={{ backgroundColor: primaryColor }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-white rounded-xl font-black text-[11px] uppercase tracking-wider shadow-md transition-shadow active:brightness-90"
                >
                  <ShoppingBagIcon className="w-3.5 h-3.5" />
                  Quick View
                </motion.button>
              )}
            </AnimatePresence>
            
            <motion.a 
              whileTap={{ scale: 0.9 }}
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md rounded-xl shadow-md text-[#25D366] border border-zinc-100 dark:border-zinc-700 block flex items-center justify-center"
              aria-label="Inquire via WhatsApp"
            >
              <WhatsAppIcon className="w-4 h-4 sm:w-5 h-5" />
            </motion.a>
          </div>
        </div>
      </motion.div>

      {/* QUICK VIEW MODAL */}
      <QuickViewModal 
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        product={product}
        primaryColor={primaryColor}
      />
    </>
  );
}