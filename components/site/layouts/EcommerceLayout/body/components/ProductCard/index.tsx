'use client';

import { MinusIcon, PlusIcon, StarIcon, TrashIcon } from '@heroicons/react/24/solid';
import React, { useState, useMemo } from 'react';
import { MarketListingForm } from '@/types/typings';
import { motion } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';
import QuickViewModal from '@/components/site/QuickViewModal';

interface ProductCardProps {
  product: MarketListingForm;
}

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const [showQuickView, setShowQuickView] = useState(false);
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#6366f1';
  const secondary = storeFormData?.themeSettings?.secondaryColor || '#f43f5e';

  const quantity = cart.find((item) => item.id === product.id)?.quantity || 0;
  const { name, images, finalPrice, sellingPrice } = product;

  // Determine if this item has variants configured
  const hasVariants = useMemo(() => {
    return product.option && Array.isArray(product.option) && product.option.length > 0;
  }, [product.option]);

  const rawPhone = storeFormData?.contactPhone || "254732771353";
  const whatsappNumber = rawPhone.replace(/\D/g, '');
  const message = encodeURIComponent(`Hello! I'd like to order: ${name} (Price: KES ${finalPrice || sellingPrice})`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const discount = sellingPrice && finalPrice && sellingPrice > finalPrice
    ? Math.round(((sellingPrice - finalPrice) / sellingPrice) * 100)
    : null;
    
  const imageSrc = images?.[0]?.url || images?.[0] || 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=400&q=80';

  // Action execution router for card buttons
  const handleCartAction = () => {
    if (hasVariants) {
      setShowQuickView(true);
    } else {
      addToCart(product);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.4 }}
        className="relative flex flex-col bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-[2rem] shadow-sm hover:shadow-xl dark:shadow-none dark:hover:bg-zinc-800/60 transition-all duration-300 overflow-hidden group border border-slate-100 dark:border-zinc-800"
      >
        {/* IMAGE CONTAINER */}
        <div className="relative aspect-square w-full overflow-hidden bg-slate-50 dark:bg-zinc-950">
          <Link href={`/ecommerce/products/${product.id}`} className="block w-full h-full">
            <Image
              src={imageSrc}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loader={({ src }) => src}
              priority={false}
            />
          </Link>
          
          {discount && (
            <div 
              className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 z-10 text-white text-[9px] sm:text-[10px] font-black px-2 sm:px-3 py-1 rounded-full shadow-md uppercase tracking-wider"
              style={{ backgroundColor: secondary }}
            >
              {discount}% OFF
            </div>
          )}

          {/* FLOATING WHATSAPP LINK */}
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Inquire on WhatsApp"
            className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-10 bg-white/95 dark:bg-zinc-900/95 p-2 rounded-full shadow-md text-[#25D366] hover:scale-110 active:scale-95 transition-all duration-200"
          >
            <WhatsAppIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </a>

          {/* DESKTOP HOVER OVERLAY */}
          <div className="absolute inset-0 z-10 hidden lg:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/10 backdrop-blur-[2px]">
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowQuickView(true);
              }}
              className="bg-white text-black text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-full shadow-xl hover:scale-105 transition-transform"
            >
              Quick View
            </button>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="p-3.5 sm:p-5 flex flex-col flex-grow space-y-2 sm:space-y-3">
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate tracking-tight">
              {name}
            </h4>
            
            <div className="flex items-center gap-1 mt-1">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className={`w-3 h-3 ${i < 4 ? 'fill-current' : 'opacity-25'}`} />
                ))}
              </div>
              {hasVariants && (
                <span className="text-[9px] font-extrabold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider ml-1">
                  Options Available
                </span>
              )}
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              KES {(finalPrice ?? sellingPrice ?? 0).toLocaleString()}
            </span>
            {sellingPrice && sellingPrice > (finalPrice ?? 0) && (
              <span className="text-xs line-through text-slate-400 font-medium">
                {sellingPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* DYNAMIC CART FLOW SYSTEM */}
          <div className="pt-1 mt-auto">
            {quantity > 0 && !hasVariants ? (
              <div className="flex items-center justify-between bg-slate-50 dark:bg-zinc-800/50 p-1 rounded-xl border border-slate-100 dark:border-zinc-800">
                <div className="flex items-center justify-between w-full">
                  <button
                    onClick={() => decreaseQuantity(product.id)}
                    aria-label="Decrease quantity"
                    className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded-lg transition-colors text-slate-600 dark:text-zinc-300 shadow-xs"
                  >
                    {quantity === 1 ? <TrashIcon className="h-4 w-4 text-rose-500" /> : <MinusIcon className="h-4 w-4" />}
                  </button>
                  
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white px-2">{quantity}</span>
                  
                  <button
                    onClick={() => addToCart(product)}
                    aria-label="Increase quantity"
                    className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded-lg transition-colors text-slate-600 dark:text-zinc-300 shadow-xs"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="h-5 w-[1px] bg-slate-200 dark:bg-zinc-700 mx-1" />
                
                <button
                  onClick={() => removeFromCart(product.id)}
                  className="px-2.5 text-[9px] sm:text-[10px] font-black uppercase text-rose-500 hover:text-rose-600 transition-colors shrink-0"
                >
                  Clear
                </button>
              </div>
            ) : (
              <div className="flex gap-1.5 sm:gap-2">
                <button
                  onClick={handleCartAction}
                  className="flex-[3] py-2.5 sm:py-3 rounded-xl text-white font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-md active:scale-[0.98] transition-all"
                  style={{ backgroundColor: primary }}
                >
                  {hasVariants ? 'Select Options' : 'Add To Cart'}
                </button>
                
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Order this item via WhatsApp directly"
                  className="flex-1 bg-[#25D366] hover:bg-[#20ba59] flex items-center justify-center rounded-xl shadow-md active:scale-[0.98] transition-all text-white"
                >
                  <WhatsAppIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* QUICK VIEW CONTROL MODAL */}
      {showQuickView && (
        <QuickViewModal 
          isOpen={showQuickView} 
          onClose={() => setShowQuickView(false)} 
          product={product} 
          primaryColor={primary} 
        />
      )}
    </>
  );
};

export default ProductCard;