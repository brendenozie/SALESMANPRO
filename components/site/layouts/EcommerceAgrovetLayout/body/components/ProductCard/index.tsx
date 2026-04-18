'use client';

import React from 'react';
import { MinusIcon, PlusIcon, StarIcon, TrashIcon, ShoppingBagIcon } from '@heroicons/react/24/solid';
import { MarketListingForm } from '@/types/typings';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  product: MarketListingForm;
  index?: number;
}

const FALLBACK_IMAGE_URL = 'https://via.placeholder.com/400';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>  `${src}?w=${width}&q=${quality || 75}`;

// Custom WhatsApp Icon
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#059669';

  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;

  // WhatsApp Config
  const whatsappNumber = `${storeFormData?.contactPhone || "254732 771 353"}`; // Kenya format example
  const message = encodeURIComponent(`Hello! I am inquiring about "${product.name}" (KSh ${(product.finalPrice || product.sellingPrice)?.toLocaleString()}). Could I get professional advice on how to use this?`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const discount = product.sellingPrice && product.finalPrice 
    ? Math.round(((product.sellingPrice - product.finalPrice) / product.sellingPrice) * 100) 
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      viewport={{ once: true }}
      className="group relative flex flex-col"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] w-full rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100 mb-6">
        <Link href={`/agrovetecommerce/products/${product.id}`} className="block w-full h-full">
          <Image
            src={product.images?.[0] || FALLBACK_IMAGE_URL}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            loader={loader}
          />
          
          {/* Overlay Action Area */}
          <div className="absolute inset-0 bg-emerald-900/0 group-hover:bg-emerald-900/10 transition-colors duration-300 flex flex-col items-center justify-center gap-3">
             <div className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all bg-white text-slate-900 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-emerald-600 hover:text-white">
              View Product
            </div>
          </div>
        </Link>

        {/* WhatsApp Floating Action */}
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 right-4 z-10 p-3 bg-white/90 backdrop-blur shadow-xl rounded-2xl text-[#25D366] hover:scale-110 transition-transform active:scale-95"
          title="Consult Expert"
        >
          <WhatsAppIcon className="w-5 h-5" />
        </a>

        {discount && (
          <div className="absolute top-4 left-4 bg-emerald-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-lg">
            -{discount}% OFF
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-grow px-2">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-lg font-black text-slate-900 tracking-tighter leading-tight group-hover:text-emerald-700 transition-colors">
            {product.name}
          </h4>
          <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold">
            <StarIcon className="w-3 h-3 text-amber-400" />
            4.8
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xl font-mono font-bold text-slate-900 tracking-tighter">
              KSh {(product.finalPrice || product.sellingPrice)?.toLocaleString()}
            </span>
            {product.sellingPrice && product.sellingPrice > (product.finalPrice ?? 0) && (
              <span className="text-xs line-through text-slate-300 font-medium">
                {product.sellingPrice.toLocaleString()}
              </span>
            )}
          </div>
          
          {/* Subtle text link for advice */}
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] flex gap-2 font-black uppercase text-emerald-600 hover:text-emerald-800 underline underline-offset-4 decoration-2"
          >
           < WhatsAppIcon className="w-4 h-4" />  Order Via WhatsApp
          </a>
        </div>

        {/* Action Tray */}
        <div className="mt-auto">
          <AnimatePresence mode="wait">
            {quantity > 0 ? (
              <motion.div 
                key="in-cart"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-between bg-slate-900 rounded-2xl p-1 shadow-xl"
              >
                <button 
                  onClick={() => decreaseQuantity(product.id)}
                  className="p-3 text-white hover:bg-white/10 rounded-xl transition-colors"
                >
                  {quantity === 1 ? <TrashIcon className="w-4 h-4 text-red-400" /> : <MinusIcon className="w-4 h-4" />}
                </button>
                <span className="text-white font-black text-sm">{quantity}</span>
                <button 
                  onClick={() => addToCart(product)}
                  className="p-3 text-white hover:bg-white/10 rounded-xl transition-colors"
                >
                  <PlusIcon className="w-4 h-4 text-emerald-400" />
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="add-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => addToCart(product)}
                className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-300 shadow-sm hover:shadow-emerald-200"
              >
                <ShoppingBagIcon className="w-4 h-4" />
                Add to Cart
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;