'use client';

import React from 'react';
import { MinusIcon, PlusIcon, StarIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';
import { MarketListingForm } from '@/types/typings';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

const ProductCard: React.FC<{ product: MarketListingForm }> = ({ product }) => {
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#0EA5E9';
  
  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;
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
        <Link href={`/ecommerce/products/${product.id}`}>
          <Image
            src={product.images?.[0] || 'https://via.placeholder.com/400'}
            alt={product.name}
            loader={({ src }) => `${src}?w=400&q=80`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </Link>
        
        {discount && (
          <div className="absolute top-4 left-4 px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm">
            <span className="text-[10px] font-black text-slate-900">-{discount}% OFF</span>
          </div>
        )}

        {/* Floating Quick Add (Only on non-zero quantity) */}
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
          <h4 className="text-lg font-black text-slate-900 leading-tight line-clamp-2">{product.name}</h4>
        </div>
        
        <div className="flex items-center gap-1 mb-4">
          <StarIcon className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold text-slate-500">4.9</span>
          <span className="text-[10px] text-slate-300 uppercase tracking-tighter ml-1">(120 Reviews)</span>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-xl font-black text-slate-900">${(product.finalPrice ?? 0).toFixed(2)}</span>
            {product.sellingPrice && <span className="text-xs text-slate-400 line-through">${product.sellingPrice.toFixed(2)}</span>}
          </div>

          <AnimatePresence mode="wait">
            {quantity > 0 ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
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