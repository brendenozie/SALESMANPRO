'use client';

import { MinusIcon, PlusIcon, StarIcon, TrashIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { MarketListingForm } from '@/types/typings';
import { motion } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

const loader = ({ src }: { src: string }) => src;

const ProductCard: React.FC<{ product: MarketListingForm }> = ({ product }) => {
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  const accent = '#FF003C'; // Empire Red

  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;
  const { name, images, finalPrice, sellingPrice } = product;
  const discount = sellingPrice && finalPrice && sellingPrice > finalPrice 
    ? Math.round(((sellingPrice - finalPrice) / sellingPrice) * 100) : null;
    
  const imageSrc = images?.[0] || 'https://via.placeholder.com/300';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className="group relative flex flex-col bg-zinc-900 border border-white/5 hover:border-red-600/50 transition-all duration-300"
    >
      {/* Tactical Top Bar */}
      <div className="flex justify-between items-center p-3 border-b border-white/5 bg-black/40">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">Item_ID: {product.id.slice(-6)}</span>
        {discount && (
          <div className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 skew-x-[-12deg]">
            -{discount}%
          </div>
        )}
      </div>

      {/* Image Section */}
      <Link href={`/ecommerce/products/${product.id}`} className="relative h-64 w-full overflow-hidden bg-black">
        <Image
          src={imageSrc}
          alt={name}
          fill
          loader={loader}
          className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
      </Link>

      {/* Product Info */}
      <div className="p-5 flex flex-col flex-grow">
        <h4 className="text-lg font-black italic text-white uppercase tracking-tighter group-hover:text-red-500 transition-colors truncate">
          {name}
        </h4>
        
        <div className="flex items-center gap-2 mt-1 mb-4">
          <StarIcon className="w-3 h-3 text-red-600" />
          <span className="text-[10px] font-mono text-zinc-400">CLASS: PREMIUM_LOOT</span>
        </div>

        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-2xl font-black italic text-white">${finalPrice?.toFixed(2)}</span>
          {sellingPrice && sellingPrice > finalPrice && (
            <span className="text-sm line-through text-zinc-600">${sellingPrice.toFixed(2)}</span>
          )}
        </div>

        {/* Action Button - Industrial Style */}
        {quantity > 0 ? (
          <div className="flex items-center bg-black border border-white/10 p-1">
            <button onClick={() => decreaseQuantity(product.id)} className="p-2 hover:text-red-500 text-white">
              {quantity === 1 ? <TrashIcon className="h-4 w-4" /> : <MinusIcon className="h-4 w-4" />}
            </button>
            <div className="flex-1 text-center font-mono font-bold text-white">{quantity}</div>
            <button onClick={() => addToCart(product)} className="p-2 hover:text-red-500 text-white">
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => addToCart(product)}
            className="w-full py-3 bg-white text-black font-black uppercase tracking-tighter italic hover:bg-red-600 hover:text-white transition-all clip-path-polygon"
            style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
          >
            EQUIP ITEM
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;