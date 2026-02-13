'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MarketListingForm } from '@/types/typings';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';
import {
  FireIcon,
  HeartIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const loader = ({ src }: { src: string }) => src;

interface ProductCardProps {
  product: MarketListingForm;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {

  const {
    id,
    name,
    images = [],
    brand,
    sellingPrice,
    finalPrice,
    isNewArrival,
    isDiscounted,
    isFlashDeal,
    tags = [],
  } = product;

  const rating = 4.8; // static rating until API
  const img = images?.[0] || 'https://via.placeholder.com/400';

  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const { slug } = storeFormData || {};
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#10B981';
  const secondary = storeFormData?.themeSettings?.secondaryColor || '#3B82F6';

  const getQuantity = (id: string) => cart.find((item : MarketListingForm) => item.id === id)?.quantity || 0;
  const quantity = getQuantity(product.id);

  const reviews = 149; // Example static value

  const discount =
    sellingPrice && finalPrice != null && sellingPrice > finalPrice
      ? Math.round(((sellingPrice - finalPrice) / sellingPrice) * 100)
      : null;

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -8 }}
      className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100"
    >
      {/* IMAGE AREA */}
      <Link
        href={`/ecommerce/products/${id}`}
        className="relative aspect-[3/4] bg-slate-100 overflow-hidden block"
      >
        <Image
          src={img}
          alt={name}
          fill
          loader={loader}
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* BADGES */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNewArrival && (
            <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded">
              New
            </span>
          )}

          {isDiscounted && discount && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded">
              -{discount}%
            </span>
          )}

          {isFlashDeal && (
            <span className="bg-amber-400 text-slate-900 text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded flex items-center gap-1">
              <FireIcon className="w-3 h-3" /> Flash
            </span>
          )}
        </div>

        {/* WISHLIST ICON */}
        <button className="absolute top-3 right-3 p-2 bg-white/50 hover:bg-white rounded-full transition-colors text-slate-600 hover:text-red-500">
          <HeartIcon className="w-5 h-5" />
        </button>

        {/* QUICK ACTION */}
        <div className="absolute bottom-4 left-0 right-0 px-4 flex justify-between translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          {/* Cart Actions */}
        {quantity > 0 ? (
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center space-x-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => decreaseQuantity(product.id)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all duration-200"
              >
                {quantity === 1 ? (
                  <TrashIcon className="h-5 w-5 text-red-500" />
                ) : (
                  <MinusIcon className="h-5 w-5 text-gray-600" />
                )}
              </motion.button>
              <span className="text-lg text-gray-800 font-bold">{quantity}</span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => addToCart(product)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all duration-200"
              >
                <PlusIcon className="h-5 w-5 text-gray-600" />
              </motion.button>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => removeFromCart(product.id)}
              className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
            >
              Remove
            </motion.button>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => addToCart(product)}
            className="mt-auto w-full py-3 rounded-lg text-white font-semibold text-base shadow-lg transition-all duration-300 hover:shadow-xl"
            style={{
              // background: `linear-gradient(135deg, ${primary}, ${secondary})`,
              backgroundColor: primary,
            }}
          >
            Add to Cart
          </motion.button>
        )}
        </div>
      </Link>

      {/* INFO AREA */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
            {brand ?? "No Brand"}
          </p>

          {/* Static rating until backend */}
          <div className="flex items-center gap-1">
            <StarIconSolid className="w-3 h-3 text-yellow-400" />
            <span className="text-xs text-slate-600 font-semibold">
              {rating}
            </span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 truncate mb-2">
          {name}
        </h3>

        <div className="flex items-center gap-3">
          {isDiscounted ? (
            <>
              <span className="text-lg font-bold text-indigo-600">
                ${finalPrice}
              </span>
              <span className="text-sm text-slate-400 line-through">
                ${sellingPrice}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-slate-900">
              ${sellingPrice}
            </span>
          )}
        </div>

        {/* TAGS */}
        <div className="mt-3 flex flex-wrap gap-1">
          {tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
