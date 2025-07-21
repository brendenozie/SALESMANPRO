import { MinusIcon, PlusIcon, StarIcon, TrashIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { MarketListingForm } from '@/types/typings';

import { motion } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image'; // Import Next.js Image component

interface ProductCardProps {
  product: MarketListingForm;
  primary?: string; // Optional prop, as themeSettings will provide it
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const { slug } = storeFormData || {};
  
  // Default colors, overridden by theme settings
  const primary = storeFormData && storeFormData.themeSettings?.primaryColor || '#10B981'; // Default: Emerald
  const secondary = storeFormData && storeFormData.themeSettings?.secondaryColor || '#3B82F6'; // Default: Blue

  const getQuantity = (id: string) => cart.find((item: any) => item.id === id)?.quantity || 0;
  const quantity = getQuantity(product.id);

  const { name, images, finalPrice, sellingPrice } = product;
  const rating = 4.5; // Example static value
  const reviews = 149; // Example static value

  const discount =
    sellingPrice && sellingPrice > sellingPrice
      ? Math.round(((sellingPrice - finalPrice) / sellingPrice) * 100)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative flex flex-col bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100"
    >
      {/* Discount Badge */}
      {discount !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute top-3 left-3 z-10 text-white text-sm font-bold px-3 py-1 rounded-lg shadow-md"
          style={{ backgroundColor: secondary }} // Use secondary color for a vibrant badge
        >
          -{discount}% OFF
        </motion.div>
      )}

      {/* Product Image */}
      <Link
        href={`/site/${slug}/ecommerce/products/${product.id}`}
        className="block relative h-64 w-full overflow-hidden" // Increased height for visual impact
      >
        {images && images.length > 0 && (
          <Image
            src={images[0]}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-110" // More pronounced zoom
            priority
          />
        )}
        {/* Image Overlay on Hover */}
        <div className="absolute inset-0 bg-black bg-opacity-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white text-md font-semibold px-4 py-2 rounded-full"
            style={{ backgroundColor: `rgba(0,0,0,0.5)` }}
          >
            View Details
          </motion.span>
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-5 flex flex-col justify-between flex-grow">
        <h4 className="text-xl font-bold text-gray-900 mb-2 truncate" title={name}>
          {name}
        </h4>

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          <span
            className="text-3xl font-extrabold"
            style={{ color: primary }}
          >
            ${finalPrice.toFixed(2)}
          </span>
          {sellingPrice && sellingPrice > finalPrice && (
            <span className="text-base line-through text-gray-500">
              ${sellingPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-1 text-yellow-500 text-sm">
          <StarIcon className="w-5 h-5" />
          <span className="font-semibold">{rating.toFixed(1)}</span>
          <span className="text-gray-500 ml-1">({reviews} reviews)</span>
        </div>

        {/* Cart Actions */}
        {quantity > 0 ? (
          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => decreaseQuantity(product.id)}
                className="p-2 bg-gray-100 rounded-full hover:bg-red-100 transition-all duration-200 shadow-sm"
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
                className="p-2 bg-gray-100 rounded-full hover:bg-green-100 transition-all duration-200 shadow-sm"
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