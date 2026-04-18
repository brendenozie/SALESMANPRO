'use client';

import { MinusIcon, PlusIcon, StarIcon, TrashIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { MarketListingForm } from '@/types/typings';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

const loader = ({ src }: { src: string }) => src;

// Custom WhatsApp Icon with a tactical/tech vibe
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ProductCard: React.FC<{ product: MarketListingForm }> = ({ product }) => {
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;
  const { name, images, finalPrice, sellingPrice } = product;

  // WhatsApp "Tech Support" Config
  const whatsappNumber = `${storeFormData?.contactPhone || "254732 771 353"}`;
  const message = encodeURIComponent(`SYSTEM_INQUIRY: I'm looking at the "${name}". Can you confirm if this is compatible with my current rig specs?`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const discount = sellingPrice && finalPrice && sellingPrice > finalPrice 
    ? Math.round(((sellingPrice - finalPrice) / sellingPrice) * 100) : null;
    
  const imageSrc = images?.[0] || 'https://via.placeholder.com/300';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="group relative flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 hover:border-red-600/50 dark:hover:border-red-600/50 transition-all duration-300 shadow-sm hover:shadow-xl overflow-hidden"
    >
      {/* Tactical Top Bar */}
      <div className="flex justify-between items-center p-3 border-b border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-black/40">
        <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter">
          SEC_ID: {product.id.slice(-8).toUpperCase()}
        </span>
        <div className="flex gap-2">
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#25D366] hover:text-white transition-colors"
            title="Request Tech Specs"
          >
            <WhatsAppIcon className="w-4 h-4" />
          </a>
          {discount && (
            <div className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 skew-x-[-12deg]">
              -{discount}%
            </div>
          )}
        </div>
      </div>

      {/* Image Section */}
      <Link href={`/gamingecommerce/products/${product.id}`} className="relative h-64 w-full overflow-hidden bg-zinc-100 dark:bg-black">
        <Image
          src={imageSrc}
          alt={name}
          fill
          loader={loader}
          className="object-contain p-4 opacity-90 dark:opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent dark:from-zinc-900 dark:via-transparent dark:to-transparent" />
      </Link>

      {/* Product Info */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h4 className="text-lg font-black italic text-zinc-900 dark:text-white uppercase tracking-tighter group-hover:text-red-500 transition-colors truncate">
            {name}
          </h4>
        </div>
        
        <div className="flex items-center justify-between mt-1 mb-4">
          <div className="flex items-center gap-2">
            <StarIcon className="w-3 h-3 text-red-600" />
            <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase">Class: Premium_Loot</span>
          </div>
          <a 
            href={whatsappUrl}
            target="_blank"
            className="text-[9px] font-mono font-bold text-[#25D366] hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <ChatBubbleLeftRightIcon className="w-3 h-3" /> COMMS_LINK
          </a>
        </div>

        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-2xl font-black italic text-zinc-900 dark:text-white">
            Kes {(finalPrice ?? 0).toLocaleString()}
          </span>
          {sellingPrice && sellingPrice > (finalPrice ?? 0) && (
            <span className="text-sm line-through text-zinc-400 dark:text-zinc-600 font-mono">
              Kes {sellingPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Action Button - Industrial Style */}
        <div className="mt-auto">
          <AnimatePresence mode="wait">
            {quantity > 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-white/10 p-1"
              >
                <button onClick={() => decreaseQuantity(product.id)} className="p-2 hover:text-red-500 text-zinc-900 dark:text-white transition-colors">
                  {quantity === 1 ? <TrashIcon className="h-4 w-4" /> : <MinusIcon className="h-4 w-4" />}
                </button>
                <div className="flex-1 text-center font-mono font-bold text-zinc-900 dark:text-white">{quantity}</div>
                <button onClick={() => addToCart(product)} className="p-2 hover:text-red-500 text-zinc-900 dark:text-white transition-colors">
                  <PlusIcon className="h-4 w-4" />
                </button>
              </motion.div>
            ) : (
              <button
                onClick={() => addToCart(product)}
                className="w-full py-3 bg-zinc-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-tighter italic hover:bg-red-600 hover:text-white transition-all shadow-md active:scale-95"
                style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
              >
                EQUIP ITEM
              </button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;