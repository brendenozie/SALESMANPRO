'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MarketListingForm, VariantOptionItem } from '@/types/typings';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';
import QuickViewModal from '../QuickViewModal'; // Ensure your path matches your directory setup
import {
  ShoppingBagIcon,
  HeartIcon,
  PlusIcon,
  MinusIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { VideoCameraIcon } from '@heroicons/react/24/solid';
import { resolveProductMedia } from '@/lib/product-media-resolver';

// Custom WhatsApp Icon Component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface ProductCardProps {
  product: MarketListingForm;
}

const ProductCard: React.FC<ProductCardProps> = React.memo(({ product }) => {
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

  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const { addToCart, decreaseQuantity, cart } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#18181b';

  // Group components for variant checks
  const groupedVariants = useMemo(() => {
    const options = (product.option || []) as VariantOptionItem[];
    return options.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, VariantOptionItem[]>);
  }, [product.option]);

  const hasVariants = Object.keys(groupedVariants).length > 0;

  // Aggregate quantity for items matching this product ID in the global cart context
  const totalQuantityInCart = useMemo(() => {
    return cart
      .filter((item: any) => item.id === id)
      .reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
  }, [cart, id]);

  const resolvedMedia = useMemo(() => resolveProductMedia(product), [product]);
  const img = resolvedMedia.primaryImageUrl;

  // ---------- WHATSAPP SETUP ----------
  const whatsappNumber = `${storeFormData?.contactPhone || "254732771353"}`.replace(/\D/g, '');
  const message = encodeURIComponent(
    `Hi! I am looking to inquire about "${name}"${brand ? ` by ${brand}` : ''} priced at KES ${(finalPrice ?? sellingPrice ?? 0).toLocaleString()}. Is this item currently available in stock?`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const discount =
    sellingPrice && finalPrice != null && sellingPrice > finalPrice
      ? Math.round(((sellingPrice - finalPrice) / sellingPrice) * 100)
      : null;

  // ---------- INTERACTION ACTIONS ----------
  const handleMainActionClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (hasVariants) {
      setIsQuickViewOpen(true);
    } else {
      addToCart({
        ...product,
        finalPrice: finalPrice ?? sellingPrice ?? 0,
        sellingPrice: sellingPrice,
        selectedOptions: {},
      });
    }
  };

  return (
    <>
      <div className="group relative flex flex-col w-full bg-white dark:bg-zinc-950 transition-colors duration-500">
        {/* --- IMAGE CONTAINER FRAME --- */}
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[2rem] bg-zinc-100 dark:bg-zinc-900 shadow-sm group-hover:shadow-2xl transition-all duration-700 ease-[0.16,1,0.3,1]">
          
          <Link href={`/fashionecommerce/products/${id}`} className="block w-full h-full">
            <Image
              src={img}
              alt={name}
              fill
              unoptimized
              loading="lazy"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-[2s] scale-100 group-hover:scale-105 group-active:scale-102"
            />
          </Link>

          {resolvedMedia.hasVideo && (
            <div className="absolute bottom-4 left-5 z-10 flex items-center gap-1.5 bg-black/70 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-md border border-white/10 uppercase tracking-wider pointer-events-none">
              <VideoCameraIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Video</span>
            </div>
          )}

          {/* --- STATUS LABEL METRICS --- */}
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
                style={{ backgroundColor: primaryColor }}
              >
                -{discount}%
              </span>
            )}
          </div>

          {/* --- ACTION OVERLAYS (DESKTOP INTERACTION) --- */}
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
            
            <button 
              onClick={() => setIsQuickViewOpen(true)}
              className="p-3 bg-white dark:bg-zinc-900/90 backdrop-blur-xl rounded-full text-zinc-900 dark:text-white hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900 transition-all shadow-xl"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
          </div>

          {/* --- MOBILE COMPACT FLOATING INTERFACES --- */}
          <div className="absolute bottom-4 right-4 lg:hidden z-10 flex flex-col gap-3">
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl shadow-2xl backdrop-blur-2xl border border-white/20 bg-white/10 text-white flex items-center justify-center"
            >
              <WhatsAppIcon className="w-5 h-5" />
            </a>

            <button 
              onClick={handleMainActionClick}
              className="relative p-4 rounded-2xl shadow-2xl backdrop-blur-2xl border border-white/20 active:scale-95 transition-transform flex items-center justify-center text-white"
              style={{ backgroundColor: `${primaryColor}e6` }}
            >
              <PlusIcon className="w-5 h-5" />
              {totalQuantityInCart > 0 && (
                <div
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white text-zinc-950 text-[9px] font-black rounded-full flex items-center justify-center shadow-md transition-transform scale-100"
                >
                  {totalQuantityInCart}
                </div>
              )}
            </button>
          </div>

          {/* --- HOVER CTA BUTTON PANEL (DESKTOP SPECIFIC) --- */}
          <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[0.16,1,0.3,1] lg:block hidden">
            <button
              onClick={handleMainActionClick}
              className="w-full py-5 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white text-[9px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.25)] rounded-2xl border border-zinc-100 dark:border-zinc-800/40"
            >
              <ShoppingBagIcon className="w-4 h-4" />
              {totalQuantityInCart > 0 
                ? `In Wardrobe (${totalQuantityInCart})` 
                : hasVariants 
                  ? "Select Size / Configuration" 
                  : "Add To Wardrobe"
              }
            </button>
          </div>
        </div>

        {/* --- TEXT CONTENT SEGMENT --- */}
        <div className="mt-5 flex flex-col items-center text-center px-1">
          {brand && (
            <span className="text-[8px] text-zinc-400 font-black uppercase tracking-[0.4em] mb-2">
              {brand}
            </span>
          )}
          
          <Link href={`/fashionecommerce/products/${id}`} className="max-w-[90%]">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:opacity-60 transition-opacity mb-2.5 tracking-wide leading-tight uppercase truncate">
              {name}
            </h3>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-sm font-black text-zinc-950 dark:text-white tracking-tight">
              KES {(finalPrice ?? sellingPrice ?? 0).toLocaleString()}
            </span>
            {isDiscounted && sellingPrice && (
              <span className="text-xs text-zinc-400 line-through font-medium opacity-50">
                KES {sellingPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* --- EXTERNAL PORTAL QUICK-VIEW SPECIFICATION PORTAL SHEET --- */}
      <QuickViewModal
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        product={product}
        primaryColor={primaryColor}
      />
    </>
  );
});

ProductCard.displayName = 'FashionProductCard';

export default ProductCard;