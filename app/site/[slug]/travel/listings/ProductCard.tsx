'use client';
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { MinusIcon, PlusIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { StarIcon, HeartIcon as HeartIconSolid, TrashIcon } from '@heroicons/react/24/solid';
import { HeartIcon } from '@heroicons/react/24/outline';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';

const loader = ({ src }: { src: string }) => src;

interface ProductCardProps {
  product: any;
}

// REMOVED: const loader = ... (This caused the error)

export default function ProductCard({ product }: ProductCardProps) {
  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const { slug: storeSlug } = storeFormData || {};

  const [isFavorited, setIsFavorited] = useState(false);
  const quantity = useMemo(() => cart.find((c: any) => c.id === product.id)?.quantity || 0, [cart, product.id]);

  const primary = storeFormData?.themeSettings?.primaryColor || '#14b8a6';

  const price = product.finalPrice ?? product.price ?? 0;
  const selling = product.sellingPrice ?? null;
  const discount = selling && selling > price ? Math.round(((selling - price) / selling) * 100) : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group relative flex flex-col"
    >
      {/* --- IMAGE CONTAINER --- */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-gray-200 shadow-md transition-all duration-500 group-hover:shadow-2xl">
        <Link href={`/travel/listings/${product.id}`}>
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0] || '/placeholder.png'}
              alt={product.name}
              loader={loader}
              fill
              unoptimized // <--- ADDED THIS, REMOVED loader={}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
             <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40 transition-opacity group-hover:opacity-60" />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
            {discount && (
            <span className="rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                -{discount}%
            </span>
            )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => { e.preventDefault(); setIsFavorited(!isFavorited); }}
          className="absolute right-4 top-4 rounded-full bg-white/30 p-2.5 backdrop-blur-md transition-all hover:bg-white active:scale-90"
        >
          {isFavorited ? (
            <HeartIconSolid className="h-5 w-5 text-rose-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-white" />
          )}
        </button>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-4 right-4 rounded-2xl bg-white/90 px-4 py-2 backdrop-blur-md shadow-lg">
            {selling && selling > price && (
               <p className="text-[10px] text-gray-500 line-through text-right font-medium">
                  {selling.toFixed(2)}
               </p>
            )}
            <p className="text-lg font-bold text-slate-900 leading-none">
              {price.toFixed(2)}
            </p>
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="mt-4 px-2">
        <div className="flex items-start justify-between">
           <div>
              <Link href={`/travel/listings/${product.id}`}>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-1">
                    {product.name}
                </h3>
              </Link>
              <div className="flex items-center gap-1 mt-1">
                <StarIcon className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-semibold text-slate-900">{product.rating ? product.rating.toFixed(1) : 'New'}</span>
                {product.locationName && (
                   <span className="text-sm text-gray-500 border-l border-gray-300 pl-2 ml-1">{product.locationName}</span>
                )}
              </div>
           </div>
        </div>

        {/* --- ADD TO CART ACTIONS --- */}
        <div className="mt-4">
            {/* {quantity > 0 ? (
                <div className="flex w-full items-center justify-between rounded-full bg-gray-100 p-1 pl-4 ring-1 ring-gray-200">
                     <span className="text-sm font-bold text-gray-900">{quantity} in cart</span>
                     <div className="flex items-center gap-1">
                        <button
                            onClick={() => quantity === 1 ? removeFromCart(product.id) : decreaseQuantity(product.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50 text-gray-700"
                        >
                             {quantity === 1 ? <TrashIcon className="h-4 w-4 text-rose-500" /> : <MinusIcon className="h-4 w-4" />}
                        </button>
                        <button
                            onClick={() => addToCart(product)}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm hover:bg-black"
                        >
                            <PlusIcon className="h-4 w-4" />
                        </button>
                     </div>
                </div>
            ) : ( */}
                <button
                    onClick={() => {
                      window.location.href = `/travel/checkout?productId=${product.id}&quantity=1`;
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white py-2.5 text-sm font-bold text-slate-900 transition-all hover:bg-slate-900 hover:text-white hover:border-transparent active:scale-95"
                >
                    <ShoppingBagIcon className="h-4 w-4" />
                    Book Now
                </button>
            {/* )} */}
        </div>
      </div>
    </motion.article>
  );
}