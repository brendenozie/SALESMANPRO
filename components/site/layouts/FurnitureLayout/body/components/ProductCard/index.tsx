'use client';

import React from 'react';
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
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { MarketListingForm } from '@/types/typings';
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
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();

  const primary = storeFormData?.themeSettings?.primaryColor || '#18181b';
  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;

  // WhatsApp Concierge Config
  const whatsappNumber = "1234567890";
  const message = encodeURIComponent(`I am interested in commissioning the "${product.name}" piece. Could you provide more details on lead times and materials?`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const discount =
    product.sellingPrice && product.finalPrice != null && product.sellingPrice > product.finalPrice
      ? Math.round(((product.sellingPrice - product.finalPrice) / product.sellingPrice) * 100)
      : null;

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
            src={product.images[0] || "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1000"}
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
                  onClick={() => addToCart({...product, finalPrice: product.finalPrice || product.sellingPrice})}
                  className="flex-[3] h-14 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl text-zinc-900 dark:text-white text-[9px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 rounded-2xl shadow-2xl border border-white/20 hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900 transition-all"
                >
                  <PlusIcon className="w-4 h-4" />
                  Reserve Piece
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
                  onClick={() => decreaseQuantity(product.id)}
                  className="p-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  {quantity === 1 ? <TrashIcon className="h-4 w-4 text-red-500" /> : <MinusIcon className="h-4 w-4 text-zinc-400" />}
                </button>
                <div className="flex flex-col items-center">
                   <span className="text-[10px] font-black dark:text-white">{quantity}</span>
                   <span className="text-[7px] font-bold text-zinc-400 uppercase tracking-tighter">In Cart</span>
                </div>
                <button
                  onClick={() => addToCart({...product, finalPrice: product.finalPrice || product.sellingPrice})}
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
            {discount ? (
              <div className="flex flex-col items-end">
                <span className="text-xs text-zinc-400 line-through tracking-tighter mb-0.5">${product.sellingPrice}</span>
                <span className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter">${product.finalPrice}</span>
              </div>
            ) : (
              <span className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter">${product.sellingPrice}</span>
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
                className="text-[10px] font-bold dark:text-[#25D366] text-[#128C7E] tracking-tight mt-1 hover:underline"
              >
                Ask Designer
              </a>
            </div>
          </div>

          <Link href={`/furnitureecommerce/products/${product.id}`} className="ml-auto p-2 hover:translate-x-1 transition-transform">
              <ChevronRightIcon className="w-5 h-5 text-zinc-300 dark:text-zinc-700" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;