'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MinusIcon, 
  PlusIcon, 
  TrashIcon, 
  ShoppingBagIcon,
  HeartIcon,
  EyeIcon,
  BookOpenIcon,
  BookmarkIcon
} from '@heroicons/react/24/solid';
import { MarketListingForm } from '@/types/typings';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  product: MarketListingForm;
}

const loader = ({ src }: { src: string }) => src;

// Elegant WhatsApp Icon for a "Literary Consultant"
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#0D9488';
  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;
  const { name, images, finalPrice, sellingPrice } = product;

  // WhatsApp Librarian/Curator Config
  const whatsappNumber = `${storeFormData?.contactPhone || "254732 771 353"}`;
  const message = encodeURIComponent(`Hello Librarian! I'm interested in "${name}". Is this the hardcover edition, and do you have other titles by this author in stock?`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const discount = sellingPrice && finalPrice && sellingPrice > finalPrice
    ? Math.round(((sellingPrice - finalPrice) / sellingPrice) * 100)
    : null;
    
  const imageSrc = images?.[0]?.url || images?.[0] || 'https://images.unsplash.com/photo-1519408230728-0c7c8f0b2c5f';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="group relative bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/50 p-4 transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]"
    >
      {/* --- IMAGE CONTAINER (The "Book Cover" Display) --- */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-50 dark:bg-zinc-800/50 shadow-sm transition-transform duration-500 group-hover:-rotate-1 group-hover:scale-[1.02]">
        {/* Book Spine Detail (Subtle Left Border) */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/10 z-10" />
        
        <Link href={`/bookecommerce/products/${product.id}`} className="block h-full w-full">
          <Image
            src={imageSrc}
            alt={name}
            fill
            loader={loader}
            className="object-cover transition-all duration-1000 group-hover:brightness-110"
          />
        </Link>

        {/* Curation Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
          {discount && (
            <div className="bg-amber-500 text-black px-2 py-1 text-[9px] font-black uppercase tracking-widest shadow-xl">
              -{discount}%
            </div>
          )}
          <div className="bg-white/90 backdrop-blur-sm text-zinc-900 px-2 py-1 text-[8px] font-bold uppercase tracking-tighter flex items-center gap-1 shadow-sm">
             <BookOpenIcon className="w-3 h-3 text-teal-600" /> Collector's Pick
          </div>
        </div>

        {/* Quick Interaction Icons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-20">
          <a 
            href={whatsappUrl}
            target="_blank"
            className="p-2.5 bg-white text-[#25D366] rounded-full shadow-xl hover:scale-110 transition-transform"
            title="Ask Librarian"
          >
            <WhatsAppIcon className="w-4 h-4" />
          </a>
          <button className="p-2.5 bg-white text-zinc-400 hover:text-red-500 rounded-full shadow-xl transition-colors">
            <HeartIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Add To Cart Slide-up */}
        <div className="absolute bottom-0 inset-x-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-zinc-900/90 to-transparent z-30">
          <AnimatePresence mode="wait">
            {quantity === 0 ? (
              <button
                onClick={() => addToCart(product)}
                className="w-full py-3 bg-white text-zinc-900 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-teal-500 hover:text-white transition-all"
              >
                <ShoppingBagIcon className="w-4 h-4" /> Reserve Copy
              </button>
            ) : (
              <div className="w-full flex items-center justify-between bg-teal-600 p-1">
                <button 
                  onClick={() => decreaseQuantity(product.id)}
                  className="p-2 hover:bg-white/10 text-white transition-colors"
                >
                  {quantity === 1 ? <TrashIcon className="h-4 w-4" /> : <MinusIcon className="h-4 w-4" />}
                </button>
                <span className="font-black text-white text-xs">{quantity} in Bag</span>
                <button 
                  onClick={() => addToCart(product)}
                  className="p-2 hover:bg-white/10 text-white transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="pt-5 space-y-2 text-center">
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-teal-600 dark:text-teal-400 mb-1">
            Literary Works
          </span>
          <Link href={`/bookecommerce/products/${product.id}`}>
            <h4 className="text-lg font-serif italic text-zinc-900 dark:text-white line-clamp-1 group-hover:underline decoration-teal-500 underline-offset-4 transition-all">
              {name}
            </h4>
          </Link>
        </div>

        <div className="flex flex-col items-center gap-1">
           {discount && (
              <span className="text-[10px] line-through text-zinc-400 font-medium">
                Kes {sellingPrice?.toLocaleString()}
              </span>
           )}
           <span className="text-xl font-light tracking-tighter text-zinc-900 dark:text-white">
              Kes {(finalPrice || sellingPrice)?.toLocaleString()}
           </span>
        </div>

        {/* Metadata Footer */}
        <div className="flex items-center justify-center gap-4 pt-3 mt-2 border-t border-zinc-50 dark:border-zinc-800">
           <div className="flex items-center gap-1.5">
              <BookmarkIcon className="w-3 h-3 text-zinc-300" />
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Pristine Condition</span>
           </div>
           <span className="text-[9px] font-mono text-zinc-300 dark:text-zinc-600 tracking-tighter uppercase">ID: {product.id?.toString().slice(-6)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;