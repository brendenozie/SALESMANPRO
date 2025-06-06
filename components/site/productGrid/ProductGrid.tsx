'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { StarIcon, PlusIcon, MinusIcon, TrashIcon } from '@heroicons/react/24/solid';
import { useStateContext } from '../../../contexts/ContextProvider';
import { useStoreContext } from '../../../contexts/StoreContext';
import Section from '../Section/Section';

// Next/Image loader
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

interface ProductGridProps {
  title?: string;
}

export default function ProductGrid({ title }: ProductGridProps) {
  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const { slug, marketplaceListings = [], themeSettings = {} } = storeFormData || {};
  const primary = themeSettings.primaryColor || '#f97316';
  const secondary = themeSettings.secondaryColor || '#3b82f6';

  const getQuantity = (id: string) => cart.find((item: any) => item.id === id)?.quantity || 0;

  return (
    <Section title={title || 'Products'} background="none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {marketplaceListings.map((listing: any, idx: number) => {
          const quantity = getQuantity(listing.id);
          const productName = listing.product?.name ?? listing.title;
          const productPrice = listing.finalPrice;
          const productImage = listing.images?.[0] ?? '';

          const cartItem = {
            id: listing.id,
            name: productName,
            price: productPrice,
            imageUrl: productImage,
          };

          return (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl hover:shadow-2xl transition-shadow duration-300"
            >
              {/* "New" Badge */}
              <span
                className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white"
                style={{
                  background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                }}
              >
                New
              </span>

              {/* Product Image */}
              <Link
                href={`/${slug}/product/${listing.id}`}
                className="block relative h-56 w-full overflow-hidden"
              >
                <Image
                  loader={loader}
                  src={productImage}
                  alt={productName}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </Link>

              {/* Product Details */}
              <div className="p-6 flex flex-col justify-between h-60">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate mb-2">
                    {productName}
                  </h4>
                  {/* Rating Stars */}
                  <div className="flex items-center space-x-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon key={i} className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                    ))}
                  </div>
                  <p
                    className="text-xl font-extrabold"
                    style={{ color: primary }}
                  >
                    ${productPrice.toFixed(2)}
                  </p>
                </div>

                {/* Cart Actions */}
                {quantity > 0 ? (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => decreaseQuantity(cartItem)}
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
                        onClick={() => addToCart(cartItem)}
                        className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-green-100 transition"
                      >
                        <PlusIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                      </button>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFromCart(cartItem)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Remove
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addToCart(cartItem)}
                    className="mt-4 w-full py-2 rounded-full text-white font-medium transition"
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
        })}
      </div>
    </Section>
  );
}
