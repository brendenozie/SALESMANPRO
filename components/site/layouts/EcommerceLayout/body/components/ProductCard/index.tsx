'use client';

import { MinusIcon, PlusIcon, StarIcon, TrashIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { MarketListingForm } from '@/types/typings';
import { motion } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';
import classNames from 'classnames';

interface ProductCardProps {
  product: MarketListingForm;
}

const loader = ({ src }: { src: string }) => {
  return src;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const { slug } = storeFormData || {};
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#10B981';
  const secondary = storeFormData?.themeSettings?.secondaryColor || '#3B82F6';

  const getQuantity = (id: string) => cart.find((item : MarketListingForm) => item.id === id)?.quantity || 0;
  const quantity = getQuantity(product.id);

  const { name, images, finalPrice, sellingPrice } = product;
  const rating = 4.5; // Example static value
  const reviews = 149; // Example static value

  const discount =
    sellingPrice && finalPrice != null && sellingPrice > finalPrice
      ? Math.round(((sellingPrice - finalPrice) / sellingPrice) * 100)
      : null;
    
  const rawImage = images && images.length > 0 ? images[0] : null;
  const imageSrc =
    typeof rawImage === 'string' && rawImage.trim() !== ''
      ? rawImage
      : 'https://via.placeholder.com/300';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative flex flex-col bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group border border-gray-100"
    >
      {/* Product Image Section */}
      <Link
        href={`/ecommerce/products/${product.id}`}
        className="block relative h-72 w-full overflow-hidden" // Taller image section
      >
        {images && images.length > 0 && (
          <Image
            src={imageSrc}
            alt={name}
            fill
            loader={loader}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105" // Subtler, more elegant zoom
            priority
          />
        )}
        {/* Discount Badge */}
        {discount !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute top-4 left-4 z-10 text-white text-xs md:text-sm font-bold px-3 py-1 rounded-full shadow-lg"
            style={{ backgroundColor: secondary }}
          >
            -{discount}% OFF
          </motion.div>
        )}
        {/* View Details Overlay on Hover */}
        <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white text-sm md:text-lg font-semibold px-6 py-2 rounded-full backdrop-blur-sm"
            style={{ backgroundColor: `rgba(255,255,255,0.1)` }}
          >
            View Details
          </motion.span>
        </div>
      </Link>

      {/* Product Details and Actions */}
      <div className="p-6 flex flex-col justify-between flex-grow">
        {/* Product Title and Rating */}
        <div className="flex flex-col mb-3">
          <h4 className="text-xl font-extrabold text-gray-900 truncate" title={name}>
            {name}
          </h4>
          <div className="mt-1 flex items-center gap-1 text-yellow-500 text-sm">
            <StarIcon className="w-4 h-4" />
            <span className="font-semibold">{rating.toFixed(1)}</span>
            <span className="text-gray-500 ml-1 text-xs">({reviews} reviews)</span>
          </div>
        </div>

        {/* Price Section */}
        <div className="flex items-baseline gap-2 mb-4">
          <span
            className="text-2xl font-extrabold"
            style={{ color: primary }}
          >
            {(finalPrice ?? 0).toFixed(2)}
          </span>
          {sellingPrice && finalPrice && sellingPrice > finalPrice && (
            <span className="text-base line-through text-gray-400">
              {sellingPrice.toFixed(2)}
            </span>
          )}
        </div>

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
    </motion.div>
  );
};

export default ProductCard;