// components/site/productGrid/ProductCard.tsx
'use client';
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { StarIcon, MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import { HeartIcon } from '@heroicons/react/24/outline';

interface ProductCardProps {
  product: any; // MarketListingForm-compatible shape (id, name, images[], finalPrice, sellingPrice, etc)
}

const loader = ({ src }: { src: string }) => src;

export default function ProductCard({ product }: ProductCardProps) {
  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const { slug: storeSlug } = storeFormData || {};

  const [isFavorited, setIsFavorited] = useState(false);

  const quantity = useMemo(() => cart.find((c: any) => c.id === product.id)?.quantity || 0, [cart, product.id]);

  const primary = storeFormData?.themeSettings?.primaryColor || '#10B981';
  const secondary = storeFormData?.themeSettings?.secondaryColor || '#3B82F6';

  const price = product.finalPrice ?? product.price ?? 0;
  const selling = product.sellingPrice ?? null;

  const discount = selling && selling > price ? Math.round(((selling - price) / selling) * 100) : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative flex flex-col bg-white rounded-2xl shadow-md hover:shadow-xl overflow-hidden group border border-gray-100"
      role="article"
    >
      {/* Image */}
      <Link href={`/${storeSlug || 'ecommerce'}/products/${product.slug || product.id}`} className="relative block h-64 w-full overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0] || '/placeholder.png'}
            alt={product.name}
            fill
            loader={loader}
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">No image</div>
        )}

        {/* Discount badge */}
        {discount !== null && (
          <div style={{ backgroundColor: secondary }} className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-white text-xs font-bold shadow">
            -{discount}% OFF
          </div>
        )}

        {/* Favorite button */}
        <button
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); setIsFavorited(v => !v); }}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:scale-105 transition-transform"
        >
          <HeartIcon className={`transition-colors w-5 h-5 ${isFavorited ? 'text-rose-500' : 'text-gray-700'}`} />
        </button>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-colors"></div>
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-md font-semibold text-gray-900 truncate" title={product.name}>{product.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{product.locationName ?? ''}</p>
          </div>

          <div className="ml-3 flex items-center gap-1">
            <StarIcon className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold text-gray-800">{(product.rating ?? 4.5).toFixed(1)}</span>
          </div>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <div className="text-lg font-extrabold" style={{ color: primary }}>
              {price.toFixed(2)}
            </div>
            {selling && selling > price && (
              <div className="text-sm text-gray-400 line-through">{selling.toFixed(2)}</div>
            )}
          </div>

          {/* cart controls */}
          <div className="w-36">
            {quantity > 0 ? (
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    if (quantity === 1) {
                      removeFromCart(product.id);
                    } else {
                      decreaseQuantity(product.id);
                    }
                  }}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                >
                  {quantity === 1 ? <TrashIcon className="w-4 h-4 text-red-500" /> : <MinusIcon className="w-4 h-4 text-gray-700" />}
                </button>

                <div className="text-sm font-semibold">{quantity}</div>

                <button
                  onClick={() => addToCart(product)}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                >
                  <PlusIcon className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(product)}
                className="w-full py-2 rounded-lg text-white font-semibold"
                style={{ backgroundColor: primary }}
              >
                Add to cart
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
