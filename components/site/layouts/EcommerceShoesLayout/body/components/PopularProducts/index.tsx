'use client';

import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import { motion } from 'framer-motion';
import Image from 'next/image';

// Loader for Next.js image optimization
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Fallback demo products
const dummyProducts = [
  {
    id: '1',
    name: 'Nike Air Force 1 LV5',
    category: "Men's Shoes",
    images: ['/images/popular-product-1.jpg'],
    price: 119.95,
  },
  {
    id: '2',
    name: 'Nike Air Force 1 LV5',
    category: "Men's Shoes",
    images: ['/images/popular-product-2.jpg'],
    price: 119.95,
  },
  {
    id: '3',
    name: 'Nike Air Force 1 LV5',
    category: "Men's Shoes",
    images: ['/images/popular-product-3.jpg'],
    price: 119.95,
  },
  {
    id: '4',
    name: 'Nike Air Force 1 LV5',
    category: "Men's Shoes",
    images: ['/images/popular-product-4.jpg'],
    price: 119.95,
  },
  {
    id: '5',
    name: 'Nike Air Force 1 LV5',
    category: "Men's Shoes",
    images: ['/images/popular-product-5.jpg'],
    price: 119.95,
  },
  {
    id: '6',
    name: 'Nike Air Force 1 LV5',
    category: "Men's Shoes",
    images: ['/images/popular-product-6.jpg'],
    price: 119.95,
  },
];

export default function PopularProducts() {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {}, marketplaceListings = [] } = storeFormData || {};

  const primary = themeSettings?.primaryColor || '#f97316';
  const productsToShow = marketplaceListings?.length > 0 ? marketplaceListings : dummyProducts;

  return (
    <section className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 text-center">
        {/* Section Header */}
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
          Our Satisfied <br /> Product
        </h2>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          Out too the been like hard off. Improve enquire welcome own beloved matters her.
          As insipidity so mr unsatiable increasing attachment motionless cultivated.
        </p>

        {/* Product Grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {productsToShow.map((product: any) => (
            <motion.div
              key={product.id}
              whileHover={{ scale: 1.03 }}
              className="text-center group"
            >
              <div className="relative w-full h-64 flex items-center justify-center overflow-hidden">
                <Image
                  src={product.images?.[0] || '/images/placeholder.jpg'}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                  loader={loader}
                />
              </div>
              <h3 className="mt-4 text-base font-semibold text-gray-800">
                {product.name}
              </h3>
              <p className="text-red-600 font-bold">${product.price.toFixed(2)}</p>
              <p className="text-sm text-gray-500">{product.category || "Men's Shoes"}</p>
            </motion.div>
          ))}
        </div>

        {/* See More Button */}
        <div className="mt-12">
          <motion.a
            href="#"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            style={{ backgroundColor: primary }}
            className="inline-block px-6 py-3 text-white rounded-full font-semibold shadow-lg"
          >
            See More
          </motion.a>
        </div>
      </div>
    </section>
  );
}
