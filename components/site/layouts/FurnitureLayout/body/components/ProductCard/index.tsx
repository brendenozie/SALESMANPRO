'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { 
  HeartIcon, 
  ArrowRightIcon, 
  StarIcon, 
  MinusIcon, 
  PlusIcon, 
  TrashIcon 
} from '@heroicons/react/24/solid';

import { CubeIcon, SwatchIcon } from '@heroicons/react/24/outline';

import { MarketListingForm } from '@/types/typings';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';

const loader = ({ src }: { src: string }) => src;

interface ProductCardProps {
  product: MarketListingForm;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  const { storeFormData } = useStoreContext();

  const primary = storeFormData?.themeSettings?.primaryColor || '#10B981';
  const secondary = storeFormData?.themeSettings?.secondaryColor || '#3B82F6';
  const { slug } = storeFormData || {};

  const quantity = cart.find((item: MarketListingForm) => item.id === product.id)?.quantity || 0;

  const discount =
    product.sellingPrice && product.finalPrice != null && product.sellingPrice > product.finalPrice
      ? Math.round(((product.sellingPrice - product.finalPrice) / product.sellingPrice) * 100)
      : null;

  const rating = 4.5;
  const reviews = 149;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="group relative bg-white border border-stone-100 rounded-none md:rounded-sm shadow-sm hover:shadow-xl transition-all duration-500"
    >
      {/* ----------------------- IMAGE SECTION ----------------------- */}
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
        <Link href={`/site/${slug}/ecommerce/products/${product.id}`}>
          <Image
            src={product.images[0] || ""}
            alt={product.name}
            loader={loader}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>

        {/* STATUS BADGES */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.isNewArrival && (
            <span className="bg-stone-900 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider">
              New In
            </span>
          )}

          {discount !== null && (
            <span
              className="text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-sm"
              style={{ backgroundColor: secondary }}
            >
              -{discount}% OFF
            </span>
          )}
        </div>

        {/* HOVER ACTION BUTTONS */}
        <div className="absolute right-4 top-4 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
          <button className="p-2 bg-white text-stone-800 rounded-full shadow-md hover:bg-stone-900 hover:text-white transition-colors">
            <HeartIcon className="w-5 h-5" />
          </button>

          <Link
            href={`/site/${slug}/ecommerce/products/${product.id}`}
            className="p-2 bg-white text-stone-800 rounded-full shadow-md hover:bg-stone-900 hover:text-white transition-colors"
          >
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>

        {/* QUICK VIEW / ADD TO CART */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/50 to-transparent">
          {quantity === 0 ? (
            <button
              onClick={() => addToCart(product)}
              className="w-full bg-white text-stone-900 font-medium py-3 hover:bg-stone-900 hover:text-white transition-colors"
            >
              Add to Cart
            </button>
          ) : (
            <div className="flex items-center justify-between bg-white rounded-md p-2 shadow-md">
              <button
                onClick={() => decreaseQuantity(product.id)}
                className="p-2 bg-stone-100 rounded-full hover:bg-stone-200"
              >
                {quantity === 1 ? (
                  <TrashIcon className="h-4 w-4 text-red-600" />
                ) : (
                  <MinusIcon className="h-4 w-4 text-stone-600" />
                )}
              </button>

              <span className="font-bold text-stone-900">{quantity}</span>

              <button
                onClick={() => addToCart(product)}
                className="p-2 bg-stone-100 rounded-full hover:bg-stone-200"
              >
                <PlusIcon className="h-4 w-4 text-stone-600" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ----------------------- DETAILS SECTION ----------------------- */}
      <div className="p-5">
        {/* TITLE + PRICE */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-serif font-medium text-stone-900 line-clamp-1">{product.name}</h3>

          <div className="flex flex-col items-end">
            {discount !== null ? (
              <>
                <span className="text-sm text-stone-400 line-through">${product.sellingPrice}</span>
                <span className="text-lg font-bold text-orange-700">${product.finalPrice}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-stone-900">${product.sellingPrice}</span>
            )}
          </div>
        </div>

        {/* RATING */}
        <div className="flex items-center gap-1 text-yellow-500 text-xs">
          <StarIcon className="w-4 h-4" />
          <span>{rating}</span>
          <span className="text-stone-400 ml-1">({reviews})</span>
        </div>

        {/* FURNITURE DETAILS */}
        <div className="flex items-center gap-4 text-xs text-stone-500 mt-3 py-3 border-t border-stone-100">
          {product.dimensions && (
            <div className="flex items-center gap-1">
              <CubeIcon className="w-4 h-4" />
              <span>{product.dimensions}</span>
            </div>
          )}
          {product.material?.length > 0 && (
            <div className="flex items-center gap-1">
              <SwatchIcon className="w-4 h-4" />
              <span>{product.material[0]}</span>
            </div>
          )}
        </div>

        {/* DESCRIPTION */}
        <p className="text-sm text-stone-500 line-clamp-2 mt-2">{product.description}</p>
      </div>
    </motion.div>
  );
};

export default ProductCard;
