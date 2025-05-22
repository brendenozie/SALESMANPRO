import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { StarIcon, PlusIcon, MinusIcon, TrashIcon } from '@heroicons/react/24/solid';
import { useStateContext } from '../../../contexts/ContextProvider';

// interface Product {
//   id: string;
//   name: string;
//   slug: string;
//   price: number;
//   imageUrl: string;
//   rating?: number;
// }

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

interface Product { id: string; name: string; price: number; imageUrl: string; slug?: string }

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {

  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext();

  const getQuantity = (id: string) => cart.find((item:any) => item.id === id)?.quantity || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => {
        const quantity = getQuantity(product.id);

        return (
          <motion.div
            key={product.id}
            whileHover={{ scale: 1.02 }}
            className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
          >
            {/* Badge */}
            <span className="absolute top-2 left-2 bg-gradient-to-r from-blue-500 to-teal-400 text-white text-xs font-semibold px-2 py-1 rounded-full">
              New
            </span>

            {/* Image */}
            <Link href={`/site/${product.slug}/${product.id}`} className="block relative h-56 w-full overflow-hidden">
                <Image
                  loader={loader}
                  src={product.imageUrl}
                  alt={product.name}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 hover:scale-105"
                />
            </Link>

            {/* Content */}
            <div className="p-4 flex flex-col justify-between h-48">
              <div>
                <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100 truncate">
                  {product.name}
                </h4>
                {/* Rating Stars */}
                <div className="flex items-center mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon
                      key={i}                      
                      className={`h-4 w-4 text-gray-300 `}
                      // className={`h-4 w-4 ${product.rating && product.rating > i ? 'text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-lg font-bold text-blue-600 dark:text-blue-400">
                  ${product.price.toFixed(2)}
                </p>
              </div>

              {/* Actions */}
              {quantity > 0 ? (
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => decreaseQuantity(product)}
                      className="p-1 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-red-100"
                    >
                      {quantity === 1 ? <TrashIcon className="h-5 w-5 text-red-500" /> : <MinusIcon className="h-5 w-5 text-gray-600" />}
                    </button>
                    <span className="text-gray-800 dark:text-gray-200">{quantity}</span>
                    <button
                      onClick={() => addToCart(product)}
                      className="p-1 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-green-100"
                    >
                      <PlusIcon className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeFromCart(product)}
                    className="text-red-500 hover:underline text-xs"
                  >
                    Remove
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addToCart(product)}
                  className="mt-3 w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-medium py-2 px-4 rounded-full transition"
                >
                  Add to Cart
                </motion.button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ProductGrid;
