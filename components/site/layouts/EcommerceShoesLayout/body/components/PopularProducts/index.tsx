'use client';

import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { MinusIcon, PlusIcon, StarIcon, TrashIcon } from '@heroicons/react/24/solid';
import { MarketListingForm } from '@/types/typings';

// Loader for Next.js image optimization
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Fallback dummy products that match the MarketListingForm structure
const dummyProducts: MarketListingForm[] = [
  {
    id: '1',
    name: 'Nike Air Force 1 LV5',
    // slug: { current: 'nike-air-force-1-lv5' },
    category: "Men's Shoes",
    images: [{ _key: 'img1', url: 'https://via.placeholder.com/300' }],
    finalPrice: 99.95,
    sellingPrice: 119.95,
    duration: undefined,
    productCategoryId: '',
    subCategory: undefined,
    tags: [],
    option: [],
    color: [],
    size: [],
    weight: [],
    material: [],
    quantity: 0,
    buyingPrice: 0,
    pricingTiers: [],
    isAvailable: false,
    isOnOffer: false,
    isFlashDeal: false,
    isNewArrival: false,
    isDiscounted: false,
    isFeatured: false,
    bedrooms: [],
    studios: [],
    features: [],
    bookingSlots: [],
    requiredClientInfo: [],
    amenities: [],
    delivery: false,
    paymentOption: '',
    status: 'ACTIVE',
    location: null
  },
  {
    id: '2',
    name: 'Red Runner Sneakers',
    // slug: { current: 'red-runner-sneakers' },
    category: "Men's Shoes",
    images: [{ _key: 'img2', url: 'https://via.placeholder.com/300' }],
    finalPrice: 159.95,
    sellingPrice: 180.00,
    duration: undefined,
    productCategoryId: '',
    subCategory: undefined,
    tags: [],
    option: [],
    color: [],
    size: [],
    weight: [],
    material: [],
    quantity: 0,
    buyingPrice: 0,
    pricingTiers: [],
    isAvailable: false,
    isOnOffer: false,
    isFlashDeal: false,
    isNewArrival: false,
    isDiscounted: false,
    isFeatured: false,
    bedrooms: [],
    studios: [],
    features: [],
    bookingSlots: [],
    requiredClientInfo: [],
    amenities: [],
    delivery: false,
    paymentOption: '',
    status: 'ACTIVE',
    location: null
  },
  {
    id: '3',
    name: 'Classic Black Trainers',
    // slug: { current: 'classic-black-trainers' },
    category: "Men's Shoes",
    images: [{ _key: 'img3', url: 'https://via.placeholder.com/300' }],
    finalPrice: 110.00,
    sellingPrice: 180.00,
    duration: undefined,
    productCategoryId: '',
    subCategory: undefined,
    tags: [],
    option: [],
    color: [],
    size: [],
    weight: [],
    material: [],
    quantity: 0,
    buyingPrice: 0,
    pricingTiers: [],
    isAvailable: false,
    isOnOffer: false,
    isFlashDeal: false,
    isNewArrival: false,
    isDiscounted: false,
    isFeatured: false,
    bedrooms: [],
    studios: [],
    features: [],
    bookingSlots: [],
    requiredClientInfo: [],
    amenities: [],
    delivery: false,
    paymentOption: '',
    status: 'ACTIVE',
    location: null
  },
  {
    id: '4',
    name: 'Blue Sky Trainers',
    // slug: { current: 'blue-sky-trainers' },
    category: "Men's Shoes",
    images: [{ _key: 'img4', url: 'https://via.placeholder.com/300' }],
    finalPrice: 135.00,
    sellingPrice: 180.00,
    duration: undefined,
    productCategoryId: '',
    subCategory: undefined,
    tags: [],
    option: [],
    color: [],
    size: [],
    weight: [],
    material: [],
    quantity: 0,
    buyingPrice: 0,
    pricingTiers: [],
    isAvailable: false,
    isOnOffer: false,
    isFlashDeal: false,
    isNewArrival: false,
    isDiscounted: false,
    isFeatured: false,
    bedrooms: [],
    studios: [],
    features: [],
    bookingSlots: [],
    requiredClientInfo: [],
    amenities: [],
    delivery: false,
    paymentOption: '',
    status: 'ACTIVE',
    location: null
  },
  {
    id: '5',
    name: 'Gray Casual Loafers',
    // slug: { current: 'gray-casual-loafers' },
    category: "Men's Shoes",
    images: [{ _key: 'img5', url: 'https://via.placeholder.com/300' }],
    finalPrice: 85.00,
    sellingPrice: 95.00,
    duration: undefined,
    productCategoryId: '',
    subCategory: undefined,
    tags: [],
    option: [],
    color: [],
    size: [],
    weight: [],
    material: [],
    quantity: 0,
    buyingPrice: 0,
    pricingTiers: [],
    isAvailable: false,
    isOnOffer: false,
    isFlashDeal: false,
    isNewArrival: false,
    isDiscounted: false,
    isFeatured: false,
    bedrooms: [],
    studios: [],
    features: [],
    bookingSlots: [],
    requiredClientInfo: [],
    amenities: [],
    delivery: false,
    paymentOption: '',
    status: 'ACTIVE',
    location: null
  },
  {
    id: '6',
    name: 'High-Top Sneakers',
    // slug: { current: 'high-top-sneakers' },
    category: "Men's Shoes",
    images: [{ _key: 'img6', url: 'https://via.placeholder.com/300' }],
    finalPrice: 165.00,
    sellingPrice: 180.00,
    duration: undefined,
    productCategoryId: '',
    subCategory: undefined,
    tags: [],
    option: [],
    color: [],
    size: [],
    weight: [],
    material: [],
    quantity: 0,
    buyingPrice: 0,
    pricingTiers: [],
    isAvailable: false,
    isOnOffer: false,
    isFlashDeal: false,
    isNewArrival: false,
    isDiscounted: false,
    isFeatured: false,
    bedrooms: [],
    studios: [],
    features: [],
    bookingSlots: [],
    requiredClientInfo: [],
    amenities: [],
    delivery: false,
    paymentOption: '',
    status: 'ACTIVE',
    location: null
  },
];

const staggerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const productVariants = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
};

// Internal component for rendering a single product card
const ProductGridItem = ({ product, isFeatured = false, primary, secondary, slug }: { product: MarketListingForm, isFeatured?: boolean, primary: string, secondary: string, slug: string }) => {
  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  const quantity = cart.find((item: MarketListingForm) => item.id === product.id)?.quantity || 0;

  const discount = product.sellingPrice && product.finalPrice && product.sellingPrice > product.finalPrice
    ? Math.round(((product.sellingPrice - product.finalPrice) / product.sellingPrice) * 100)
    : null;

  const { name, images, finalPrice, sellingPrice } = product;
  const rating = 4.5; // Example static value
  const reviews = 149; // Example static value

  // ✅ Safe image source (no empty strings)
  // ✅ Safe image source (handles non-string values)
  const rawImage = images && images.length > 0 ? images[0] : null;
  const imageSrc =
    typeof rawImage === 'string' && rawImage.trim() !== ''
      ? rawImage
      : 'https://via.placeholder.com/300';
      

  return (
    <motion.div
      className={`relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 ${isFeatured ? 'md:col-span-2' : ''}`}
      variants={productVariants}
    >
      {/* Product Image */}
      <Link href={`/site/${slug}/ecommerce/products/${product.id}`} className="relative block w-full" style={{ height: isFeatured ? '500px' : '300px' }}>
        {product.images && product.images.length > 0 && (
          <Image
            src={imageSrc}
            alt={product.name}
            layout="fill"
            objectFit={isFeatured ? 'cover' : 'contain'}
            className="transition-transform duration-500 group-hover:scale-110"
            loader={loader}
          />
        )}
        {/* Image Overlay on Hover */}
        <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-white text-md font-semibold px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            View Details
          </motion.span>
        </div>
        {discount !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute top-3 left-3 z-10 text-white text-sm font-bold px-3 py-1 rounded-lg shadow-md"
            style={{ backgroundColor: secondary }}
          >
            -{discount}% OFF
          </motion.div>
        )}
      </Link>

      {/* Product Details */}
      <div className="p-5 flex flex-col justify-between flex-grow">
        <h4 className="text-xl font-bold text-gray-900 mb-2 truncate" title={product.name}>
          {product.name}
        </h4>

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold" style={{ color: primary }}>
            ${(product.finalPrice ?? 0).toFixed(2)}
          </span>
          {product.sellingPrice && product.finalPrice && product.sellingPrice > product.finalPrice && (
            <span className="text-base line-through text-gray-500">
              ${product.sellingPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Rating & Reviews */}
        <div className="mt-2 flex items-center gap-1 text-yellow-500 text-sm">
          <StarIcon className="w-5 h-5" />
          <span className="font-semibold">4.5</span>
          <span className="text-gray-500 ml-1">(149 reviews)</span>
        </div>
      </div>
    </motion.div>
  );
};

interface PopularProductsProps {
  themeSettings?: any;
  marketplaceListings?: any[];
  slug?: string;
}

export default function PopularProducts({themeSettings, marketplaceListings, slug}: PopularProductsProps) {
  // const { storeFormData } = useStoreContext();
  // const { themeSettings = {}, marketplaceListings = [], slug } = storeFormData || {};
  const primary = themeSettings?.primaryColor || '#f97316';
  const secondary = themeSettings?.secondaryColor || '#3b82f6';
  const productsToShow = marketplaceListings && marketplaceListings?.length > 0 ? marketplaceListings : dummyProducts;

  

  return (
    <section className="py-20 bg-gray-100 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        {/* Section Header */}
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          Top Picks, <br /> Just for You
        </h2>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          Explore our most sought-after products, hand-picked for their style, comfort, and quality.
        </p>

        {/* Product Grid with dynamic layout */}
        <motion.div
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10"
          variants={staggerVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
        >
          {productsToShow.slice(0, 5).map((product, index) => (
            <ProductGridItem
              key={product.id}
              product={product}
              isFeatured={index === 0}
              primary={primary}
              secondary={secondary}
              slug={slug || 'your-store'}
            />
          ))}
        </motion.div>

        {/* See More Button */}
        <div className="mt-20">
          {/* <Link href="/products" passHref> */}
            <motion.a
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              style={{ backgroundColor: primary }}
              className="inline-block px-10 py-4 text-white rounded-full font-semibold shadow-xl"
            >
              View All Products
            </motion.a>
          {/* </Link> */}
        </div>
      </div>
    </section>
  );
}