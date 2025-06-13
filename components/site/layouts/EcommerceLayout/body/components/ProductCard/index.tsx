import { MinusIcon, PlusIcon, StarIcon, TrashIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { MarketplaceListingForm } from '@/types/typings';

import { motion } from 'framer-motion';
// import cartItem from '@/components/shop/cartItem';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';

interface ProductCardProps {
  product: MarketplaceListingForm;
  primary: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {

  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const { slug, marketplaceListings = [], themeSettings = {} } = storeFormData || {};
  const primary = themeSettings.primaryColor || '#f97316';
  const secondary = themeSettings.secondaryColor || '#3b82f6';
  
  const getQuantity = (id: string) => cart.find((item: any) => item.id === id)?.quantity || 0;
  const quantity = getQuantity(product.id);
    
  const { title, images, finalPrice,  } = product;
  const originalPrice=0.0;
  const rating = 4.5;
  const reviews = 149;

  const discount =
    originalPrice && originalPrice > finalPrice
      ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
      : null;

  return (
    <div className="relative flex flex-col bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
      {/* Discount Badge */}
      {discount && (
        <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[12px] font-semibold px-2 py-1 rounded-full shadow">
          -{discount}%
        </div>
      )}

      {/* Product Image */}      
      <Link
        href={`/site/${slug}/ecommerce/products/${product.id}`}
        className="block relative h-56 w-full overflow-hidden"
      >
        <img
          src={images[0]}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      {/* Product Details */}
      <div className="p-4 flex flex-col justify-between flex-grow">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate mb-2">
          {title}
        </h4>

        {/* Price */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xl font-extrabold"
                style={{ color: primary }}>
            ${finalPrice.toFixed(2)}
          </span>
          {originalPrice && originalPrice > finalPrice && (
            <span className="text-sm line-through text-gray-400">
              ${originalPrice}
              {/* .toFixed(2) */}
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="mt-1 flex items-center gap-1 text-yellow-500 text-sm">
          <StarIcon className="w-4 h-4" />
          <span>{rating}</span>
          <span className="text-gray-400">({reviews})</span>
        </div>

        {/* Add to Cart Button */}
        {/* Cart Actions */}
        {quantity > 0 ? (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => decreaseQuantity(product.id)}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-red-100 transition"
              >
                {quantity === 1 ? (
                  <TrashIcon className="h-5 w-5 text-red-500" />
                ) : (
                  <MinusIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                )}
              </button>
              <span className="text-gray-800 dark:text-gray-200 font-medium">
                {quantity}
              </span>
              <button
                onClick={() => addToCart(product)}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-green-100 transition"
              >
                <PlusIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => removeFromCart(product.id)}
              className="text-sm text-red-500 hover:underline"
            >
              Remove
            </motion.button>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => addToCart(product)}
            className="mt-4 w-full py-2 rounded-full text-white font-medium transition"
            style={{
              background: `linear-gradient(135deg, ${primary}, ${secondary})`,
            }}
          >
            Add to Cart
          </motion.button>
        )}

      </div>
    </div>
  );
};

export default ProductCard;
