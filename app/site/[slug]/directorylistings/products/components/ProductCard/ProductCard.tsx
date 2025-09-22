// app/[slug]/products/components/ProductCard/ProductCard.tsx
'use client';

import { MinusIcon, PlusIcon, StarIcon, TrashIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { MarketListingForm } from '@/types/typings';
import { motion } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

interface ProductCardProps {
  product: MarketListingForm;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const { slug } = storeFormData || {};

  const primary = storeFormData?.themeSettings?.primaryColor || '#10B981';
  const secondary = storeFormData?.themeSettings?.secondaryColor || '#3B82F6';

  const getQuantity = (id: string) => cart.find((item: any) => item.id === id)?.quantity || 0;
  const quantity = getQuantity(product.id);

  const { name, images, finalPrice, sellingPrice, isNewArrival, isFeatured, isOnOffer } = product;

  // Placeholder for a real rating system
  const rating = 4.5;
  const reviews = 149;

  const discount =
    sellingPrice && finalPrice != null && sellingPrice > finalPrice
      ? Math.round(((sellingPrice - finalPrice) / sellingPrice) * 100)
      : null;

  const imageSrc =
    (images && images.length > 0 && images[0].url) || 'https://via.placeholder.com/600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      className="relative flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700 transform hover:-translate-y-2"
    >
      {/* Dynamic Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col space-y-2">
        {discount !== null && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="text-white text-xs font-bold px-3 py-1 rounded-full shadow-md"
            style={{ backgroundColor: secondary }}
          >
            -{discount}% OFF
          </motion.div>
        )}
        {isNewArrival && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="text-white text-xs font-bold px-3 py-1 rounded-full shadow-md"
            style={{ backgroundColor: '#EF4444' }} // Red for New
          >
            NEW
          </motion.div>
        )}
        {isFeatured && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="text-white text-xs font-bold px-3 py-1 rounded-full shadow-md"
            style={{ backgroundColor: '#22C55E' }} // Green for Featured
          >
            FEATURED
          </motion.div>
        )}
      </div>

      {/* Product Image */}
      <Link
        href={`/site/${slug}/directorylistings/products/${product.id}`}
        className="block relative h-64 w-full overflow-hidden"
      >
        <Image
          src={imageSrc}
          alt={name || 'Product image'}
          loader={loader}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white text-md font-semibold px-4 py-2 rounded-full"
            style={{ backgroundColor: `rgba(0,0,0,0.5)` }}
          >
            Quick View
          </motion.span>
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-5 flex flex-col justify-between flex-grow">
        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 truncate" title={name}>
          {name}
        </h4>

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          <span
            className="text-3xl font-extrabold"
            style={{ color: primary }}
          >
            ${(finalPrice ?? 0).toFixed(2)}
          </span>
          {sellingPrice && finalPrice && sellingPrice > finalPrice && (
            <span className="text-base line-through text-gray-500 dark:text-gray-400">
              ${sellingPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-1 text-yellow-500 text-sm">
          <StarIcon className="w-5 h-5" />
          <span className="font-semibold">{rating.toFixed(1)}</span>
          <span className="text-gray-500 dark:text-gray-400 ml-1">({reviews} reviews)</span>
        </div>

        {/* Cart Actions */}
        {quantity > 0 ? (
          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => decreaseQuantity(product.id)}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-red-100 dark:hover:bg-red-800 transition-all duration-200 shadow-sm"
              >
                {quantity === 1 ? (
                  <TrashIcon className="h-5 w-5 text-red-500" />
                ) : (
                  <MinusIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                )}
              </motion.button>
              <span className="text-lg text-gray-800 dark:text-white font-bold">{quantity}</span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => addToCart(product)}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-green-100 dark:hover:bg-green-800 transition-all duration-200 shadow-sm"
              >
                <PlusIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </motion.button>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => removeFromCart(product.id)}
              className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-600 transition-colors"
            >
              Remove
            </motion.button>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => addToCart(product)}
            className="mt-5 w-full py-3 rounded-lg text-white font-semibold text-lg shadow-md transition-all duration-300 hover:shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${primary}, ${secondary})`,
            }}
          >
            Add to Cart
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;