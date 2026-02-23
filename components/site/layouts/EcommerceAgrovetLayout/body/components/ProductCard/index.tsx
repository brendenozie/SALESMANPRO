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

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#059669';

  const getQuantity = (id: string) => cart.find((item: any) => item.id === id)?.quantity || 0;
  const quantity = getQuantity(product.id);

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
        <Link href={`/ecommerce/products/${product.id}`} className="block w-full h-full">
          <Image
            src={product.images?.[0] || 'https://via.placeholder.com/400'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Overlay Detail */}
          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all bg-white text-slate-900 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl">
              Quick View
            </div>
          </div>
        </Link>

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

        <div className="flex items-center gap-3 mb-6">
          <span className="text-xl font-mono font-bold text-slate-900 tracking-tighter">
            KSh {product.finalPrice?.toLocaleString()}
          </span>
          {product.sellingPrice && product.sellingPrice > (product.finalPrice ?? 0) && (
            <span className="text-xs line-through text-slate-300 font-medium">
              {product.sellingPrice.toLocaleString()}
            </span>
          )}
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
                className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-300"
              >
                <ShoppingBagIcon className="w-4 h-4" />
                Harvest to Cart
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;