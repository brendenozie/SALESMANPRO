'use client';

import React from 'react';
import { MinusIcon, PlusIcon, StarIcon, ShoppingCartIcon, ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/solid';
import { MarketListingForm } from '@/types/typings';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

// Custom WhatsApp Icon
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ProductCard: React.FC<{ product: MarketListingForm }> = ({ product }) => {
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#0EA5E9';
  
  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;

  // WhatsApp Config
  const whatsappNumber = `${storeFormData?.contactPhone || "254732 771 353"}`;
  const message = encodeURIComponent(`Hi! I'm interested in "${product.name}" for my pet. Is this suitable for my pet's breed/age?`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const discount = product.sellingPrice && product.finalPrice 
    ? Math.round(((product.sellingPrice - product.finalPrice) / product.sellingPrice) * 100) 
    : null;

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="group bg-white rounded-[2.5rem] border border-slate-100 p-3 h-full flex flex-col transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)]"
    >
      {/* Image Area */}
      <div className="relative aspect-[10/11] rounded-[2rem] overflow-hidden bg-slate-50">
        <Link href={`/petsecommerce/products/${product.id}`}>
          <Image
            src={product.images?.[0] || 'https://via.placeholder.com/400'}
            alt={product.name}
            loader={({ src }) => `${src}?w=400&q=80`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </Link>
        
        {discount && (
          <div className="absolute top-4 left-4 px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm z-10">
            <span className="text-[10px] font-black text-slate-900">-{discount}% OFF</span>
          </div>
        )}

        {/* WhatsApp Floating Action */}
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 right-4 z-10 p-2.5 bg-[#25D366] text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
          title="Ask an Expert"
        >
          <WhatsAppIcon className="w-5 h-5" />
        </a>

        {/* Floating Quick Add */}
        <div className="absolute bottom-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button 
            onClick={() => addToCart(product)}
            className="w-12 h-12 flex items-center justify-center rounded-2xl text-white shadow-xl shadow-blue-200"
            style={{ backgroundColor: primary }}
          >
            <PlusIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/petsecommerce/products/${product.id}`}>
            <h4 className="text-lg font-black text-slate-900 leading-tight line-clamp-2 hover:text-blue-500 transition-colors">
              {product.name}
            </h4>
          </Link>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <StarIcon className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold text-slate-500">4.9</span>
            <span className="text-[10px] text-slate-300 uppercase tracking-tighter ml-1">(120 Reviews)</span>
          </div>
          
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[9px] font-black text-[#25D366] uppercase tracking-widest hover:underline"
          >
            <ChatBubbleOvalLeftEllipsisIcon className="w-3 h-3" />
            Inquire
          </a>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-xl font-black text-slate-900">
              Kes {(product.finalPrice ?? 0).toLocaleString()}
            </span>
            {product.sellingPrice && product.sellingPrice > (product.finalPrice ?? 0) && (
              <span className="text-xs text-slate-400 line-through">
                Kes {product.sellingPrice.toLocaleString()}
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {quantity > 0 ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center bg-slate-100 rounded-xl p-1"
              >
                <button onClick={() => decreaseQuantity(product.id)} className="p-1.5 hover:bg-white rounded-lg transition-colors">
                  <MinusIcon className="w-4 h-4 text-slate-600" />
                </button>
                <span className="px-3 text-sm font-black text-slate-900">{quantity}</span>
                <button onClick={() => addToCart(product)} className="p-1.5 hover:bg-white rounded-lg transition-colors">
                  <PlusIcon className="w-4 h-4 text-slate-600" />
                </button>
              </motion.div>
            ) : (
              <button 
                onClick={() => addToCart(product)}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
              >
                + Add to Cart
              </button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;