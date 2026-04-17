"use client";

import React, { useState, useCallback, memo, useMemo } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  XMarkIcon,
  ShoppingCartIcon,
  ShieldCheckIcon,
  TruckIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { useStateContext } from "@/contexts/ContextProvider";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import load from "@/assets/load.png";
import PropTypes from "prop-types";

import GhubaProductCard from "@/components/site/layouts/GhubaLayout/body/components/GhubaProductCard";
import Modal from "@/components/Modal";

// next/image loader
const loaderProp = ({ src, width, quality }) => {
  const params = [`w=${width}`];
  if (quality) params.push(`q=${quality}`);
  return `${src}?${params.join("&")}`;
};

const ProductPageClient = ({ listing, similarListings }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, decreaseQuantity } = useStateContext();
  const [isZoomed, setIsZoomed] = useState(false);
  const prevImage = () => setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const nextImage = () => setCurrentImage((prev) => prev === images.length - 1 ? 0 : prev + 1  );

  const images = listing.images ? listing.images: [
    "/images/placeholder-1.png",
    "/images/placeholder-2.png",
  ];

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      {/* Breadcrumbs - Minimalist */}
      <nav className="max-w-7xl mx-auto px-6 py-6 text-xs uppercase tracking-widest text-gray-400">
        <span className="hover:text-yellow-600 cursor-pointer transition">Home</span> / 
        <span className="hover:text-yellow-600 cursor-pointer transition ml-2 uppercase">{listing.category}</span> / 
        <span className="text-gray-900 dark:text-white font-bold ml-2">{listing.title}</span>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 pb-20">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* LEFT: Media Gallery */}
          <div className="w-full lg:w-3/5  top-6">
            <ProductImages 
              images={images} 
              currentImageIndex={currentImage} 
              setCurrentImageIndex={setCurrentImage} 
              prevImage={prevImage}
              nextImage={nextImage}
              isZoomed={isZoomed}
              setIsZoomed={setIsZoomed}
            />
          </div>

          {/* RIGHT: Product Details */}
          <div className="w-full lg:w-2/5 space-y-8">
            <ProductHeader listing={listing} />
            
            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800">
              <ProductPricing listing={listing} />
              <ColorOptions />
              
              <div className="mt-8 flex flex-col gap-4">
                <QuantitySelector 
                  quantity={quantity} 
                  setQuantity={setQuantity} 
                  listing={listing}
                  addToCart={addToCart}
                  decreaseQuantity={decreaseQuantity}
                />
                
                <div className="flex gap-4">
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 rounded-2xl transition shadow-xl shadow-yellow-500/20"
                  >
                    Buy Now
                  </motion.button>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addToCart(listing)}
                    className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <ShoppingCartIcon className="h-6 w-6" />
                  </motion.button>
                </div>
              </div>
            </div>

            <TrustBadges />
          </div>
        </div>

        {/* Technical Sections */}
        <div className="mt-24 space-y-24">
          <section>
            <h2 className="text-3xl font-bold mb-10 text-center">Specifications</h2>
            <ProductSpecifications listing={listing} />
          </section>

          <ExtendedDetails listing={listing} />

          <section>
            <div className="flex justify-between items-end mb-8">
              <h2 className="text-3xl font-bold">Recommended for You</h2>
              <button className="text-yellow-600 font-semibold hover:underline">View All</button>
            </div>
            <SimilarItems similarListings={similarListings} addToCart={addToCart} />
          </section>
        </div>
      </main>

       {isZoomed && (
        <Modal isOpen={isZoomed} onClose={() => setIsZoomed(false)}  showCloseButton={false}>
          <div className="flex justify-center items-center ">
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-5 right-5 text-white bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <button
              onClick={prevImage}
              className="absolute left-5 top-1/2 transform -translate-y-1/2 text-white bg-gray-700 p-3 rounded-full hover:bg-gray-600 transition"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <Image
              width={800}
              height={800}
              loader={loaderProp}
              src={images[currentImage] || images[currentImage].url || 'https://image.unsplash.com/photo-1559526324-551c9e75d510'}
              alt={`Enlarged Product Image ${currentImage + 1}`}
              className="max-h-[80vh] max-w-[90vw] object-contain rounded-2xl shadow-lg"
            />
            <button
              onClick={nextImage}
              className="absolute right-5 top-1/2 transform -translate-y-1/2 text-white bg-gray-700 p-3 rounded-full hover:bg-gray-600 transition"
            >
              <ArrowRightIcon className="h-6 w-6" />
            </button>
          </div>
        </Modal>
      )}

    </div>
  );
};

/* --- SUB-COMPONENTS --- */


const ProductImages = ({ images, currentImageIndex, setCurrentImageIndex, setIsZoomed }) => {
  
  // Helper to get URL regardless of object or string structure
  const getImageUrl = (img) => (typeof img === 'string' ? img : img?.url) || 'https://image.unsplash.com/photo-1559526324-551c9e75d510';

  return (
    <div className="space-y-4">
      {/* --- MAIN FEATURED IMAGE --- */}
      <div className="relative aspect-square rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-gray-100 dark:bg-gray-900 group">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <Image
              fill
              priority // Tells Next.js to load this immediately (LCP optimization)
              loader={loaderProp}
              src={getImageUrl(images[currentImageIndex])}
              alt={`Product Image ${currentImageIndex + 1}`}
              className="object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-105"
              onClick={() => setIsZoomed(true)}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Scarcity Overlay */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-white/90 dark:bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black text-red-600 shadow-sm z-10">
          🔥 Limited Stock
        </div>
      </div>

      {/* --- THUMBNAIL GALLERY --- */}
      <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {images.map((img , i) => (
          <button
            key={i}
            onClick={() => setCurrentImageIndex(i)}
            className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all ${
              i === currentImageIndex 
                ? "border-amber-500 scale-105 shadow-lg" 
                : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            <Image
              fill
              loader={loaderProp}
              src={getImageUrl(img)}
              alt={`Thumbnail ${i + 1}`}
              className="object-cover"
              sizes="80px"
            />
          </button>
        ))}
      </div>
    </div>
  );
};


const ProductHeader = ({ listing }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-start">
      <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold uppercase rounded-md">
        {listing.brand || 'Premium'}
      </span>
      <button className="text-gray-400 hover:text-red-500 transition">
        <HeartIcon className="h-7 w-7" />
      </button>
    </div>
    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
      {listing.title}
    </h1>
    <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-lg">
      {listing.description}
    </p>
  </div>
);

const ProductPricing = ({ listing }) => (
  <div className="mb-6">
    <div className="flex items-baseline gap-3">
      <span className="text-4xl font-black text-gray-900 dark:text-white">
        KSh {listing.finalPrice?.toLocaleString()}
      </span>
      {listing.oldPrice && (
        <span className="text-xl text-gray-400 line-through">
          KSh {listing.oldPrice.toLocaleString()}
        </span>
      )}
    </div>
    <p className="text-xs text-green-600 font-bold mt-1 uppercase tracking-tighter">
      In Stock - Ready for delivery
    </p>
  </div>
);

const TrustBadges = () => (
  <div className="grid grid-cols-3 gap-4 py-6 border-t border-gray-100 dark:border-gray-800">
    <div className="flex flex-col items-center text-center gap-2">
      <TruckIcon className="h-6 w-6 text-yellow-600" />
      <span className="text-[10px] font-bold text-gray-500 uppercase">Fast Delivery</span>
    </div>
    <div className="flex flex-col items-center text-center gap-2">
      <ShieldCheckIcon className="h-6 w-6 text-yellow-600" />
      <span className="text-[10px] font-bold text-gray-500 uppercase">Secure Payment</span>
    </div>
    <div className="flex flex-col items-center text-center gap-2">
      <ArrowPathIcon className="h-6 w-6 text-yellow-600" />
      <span className="text-[10px] font-bold text-gray-500 uppercase">Easy Returns</span>
    </div>
  </div>
);

const QuantitySelector = ({ quantity, setQuantity, listing, addToCart, decreaseQuantity }) => (
  <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded-2xl border border-gray-200 dark:border-gray-700">
    <div className="flex items-center gap-6 px-4">
      <button 
        onClick={() => { setQuantity(Math.max(1, quantity - 1)); decreaseQuantity(listing); }}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 font-bold text-xl"
      >
        −
      </button>
      <span className="font-bold text-lg w-4 text-center">{quantity}</span>
      <button 
        onClick={() => { setQuantity(quantity + 1); addToCart(listing); }}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 font-bold text-xl"
      >
        +
      </button>
    </div>
    <span className="text-[10px] pr-4 font-bold text-gray-400 uppercase italic">
      Max 5 per customer
    </span>
  </div>
);

const ProductSpecifications = memo(({ listing }) => {
  const specs = [
    { label: "Condition", value: listing.condition || "New" },
    { label: "Material", value: listing.material?.join(", ") || "N/A" },
    { label: "Dimensions", value: listing.dimension || "Standard" },
    { label: "Weight", value: listing.weight || "N/A" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
      {specs.map((spec, idx) => (
        <div key={idx} className="flex justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40">
          <span className="text-gray-500 font-medium">{spec.label}</span>
          <span className="text-gray-900 dark:text-white font-bold">{spec.value}</span>
        </div>
      ))}
    </div>
  );
});

const SimilarItems = ({ similarListings, addToCart }) => {
    const [likedItems, setLikedItems] = useState({});
    const toggleLike = (id) => setLikedItems(prev => ({ ...prev, [id]: !prev[id] }));

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {similarListings?.map((product) => (
                <GhubaProductCard 
                    key={product.id}
                    product={product} 
                    toggleLike={toggleLike} 
                    likedItems={likedItems} 
                    addToCart={addToCart} 
                />
            ))}
        </div>
    );
};


export default ProductPageClient;

const categoryConfigs = {
  Books: {
    title: "Book Details",
    fields: [
      { key: "author", label: "Author" },
      { key: "publisher", label: "Publisher" },
      { key: "isbn", label: "ISBN" },
    ],
  },
  Clothing: {
    title: "Clothing Details",
    fields: [
      { key: "fabricComposition", label: "Fabric Composition" },
      { key: "careInstructions", label: "Care Instructions" },
    ],
  },
  Fashion: "Clothing",
  "Home Appliances": {
    title: "Home Appliance Details",
    fields: [
      { key: "energyRating", label: "Energy Rating" },
      { key: "warrantyPeriod", label: "Warranty Period" },
      { key: "applianceDimensions", label: "Dimensions" },
    ],
  },
  "Beauty Products": {
    title: "Beauty Product Details",
    fields: [
      { key: "ingredients", label: "Ingredients" },
      { key: "usageInstructions", label: "Usage Instructions" },
      { key: "expirationDate", label: "Expiration Date", isDate: true },
    ],
  },
  Skincare: "Beauty Products",
  Haircare: "Beauty Products",
  Electronics: {
    title: "Electronics Details",
    fields: [
      { key: "batteryLife", label: "Battery Life" },
      { key: "warrantyPeriod", label: "Warranty Period" },
      { key: "features", label: "Features" },
    ],
  },
  "Mobile Phones": "Electronics",
  "Laptops & Computers": "Electronics",
  "Home & Kitchen": {
    title: "Home & Kitchen Details",
    fields: [
      { key: "material", label: "Material" },
      { key: "dimensions", label: "Dimensions" },
      { key: "careInstructions", label: "Care Instructions" },
    ],
  },
  "Sports & Outdoors": {
    title: "Sports & Outdoors Details",
    fields: [
      { key: "material", label: "Material" },
      { key: "dimensions", label: "Dimensions" },
      { key: "careInstructions", label: "Care Instructions" },
    ],
  },
  "Toys & Games": {
    title: "Toys & Games Details",
    fields: [
      { key: "recommendedAge", label: "Recommended Age" },
      { key: "material", label: "Material" },
      { key: "safetyCertifications", label: "Safety Certifications" },
    ],
  },
  "Automotive": {
    title: "Automotive Details",
    fields: [
      { key: "vehicleCompatibility", label: "Vehicle Compatibility" },
      { key: "installationInstructions", label: "Installation Instructions" },
      { key: "warrantyPeriod", label: "Warranty Period" },
    ],
  },
  "Sports Equipment": {
    title: "Sports Equipment Details",
    fields: [
      { key: "material", label: "Material" },
      { key: "dimensions", label: "Dimensions" },
      { key: "careInstructions", label: "Care Instructions" },
    ],
  },
  "Health & Personal Care": {
    title: "Health & Personal Care Details",
    fields: [
      { key: "ingredients", label: "Ingredients" },
      { key: "usageInstructions", label: "Usage Instructions" },
      { key: "expirationDate", label: "Expiration Date", isDate: true },
    ],
  },
  "Pet Supplies": {
    title: "Pet Supplies Details",
    fields: [
      { key: "material", label: "Material" },
      { key: "dimensions", label: "Dimensions" },
      { key: "careInstructions", label: "Care Instructions" },
    ],
  },
  "Office Supplies": {
    title: "Office Supplies Details",
    fields: [
      { key: "material", label: "Material" },
      { key: "dimensions", label: "Dimensions" },
      { key: "careInstructions", label: "Care Instructions" },
    ],
  },
  "Grocery & Gourmet Food": {
    title: "Grocery & Gourmet Food Details",
    fields: [
      { key: "ingredients", label: "Ingredients" },
      { key: "expirationDate", label: "Expiration Date", isDate: true },
      { key: "storageInstructions", label: "Storage Instructions" },
    ],
  },
  "Arts & Crafts": {
    title: "Arts & Crafts Details",
    fields: [
      { key: "material", label: "Material" },
      { key: "dimensions", label: "Dimensions" },
      { key: "careInstructions", label: "Care Instructions" },
    ],
  },
  "Baby Products": {
    title: "Baby Products Details",
    fields: [
      { key: "recommendedAge", label: "Recommended Age" },
      { key: "material", label: "Material" },
      { key: "safetyCertifications", label: "Safety Certifications" },
    ],
  },
  "Musical Instruments": {
    title: "Musical Instruments Details",
    fields: [
      { key: "material", label: "Material" },
      { key: "dimensions", label: "Dimensions" },
      { key: "careInstructions", label: "Care Instructions" },
    ],
  },
  "Video Games": {
    title: "Video Games Details",
    fields: [
      { key: "platform", label: "Platform" },
      { key: "genre", label: "Genre" },
      { key: "releaseDate", label: "Release Date", isDate: true },
    ],
  },
  "Collectibles": {
    title: "Collectibles Details",
    fields: [
      { key: "material", label: "Material" },
      { key: "dimensions", label: "Dimensions" },
      { key: "careInstructions", label: "Care Instructions" },
    ],
  },
  "Home Decor": {
    title: "Home Decor Details",
    fields: [
      { key: "material", label: "Material" },
      { key: "dimensions", label: "Dimensions" },
      { key: "careInstructions", label: "Care Instructions" },
    ],
  },
  "Gardening Supplies": {
    title: "Gardening Supplies Details",
    fields: [
      { key: "material", label: "Material" },
      { key: "dimensions", label: "Dimensions" },
      { key: "careInstructions", label: "Care Instructions" },
    ],
  },
  "Smart Home Devices": {
    title: "Smart Home Devices Details",
    fields: [
      { key: "compatibility", label: "Compatibility" },
      { key: "features", label: "Features" },
      { key: "warrantyPeriod", label: "Warranty Period" },
    ],
  },
  "Fitness Equipment": {
    title: "Fitness Equipment Details",
    fields: [
      { key: "material", label: "Material" },
      { key: "dimensions", label: "Dimensions" },
      { key: "careInstructions", label: "Care Instructions" },
    ],
  },
  "Camping & Hiking": {
    title: "Camping & Hiking Details",
    fields: [
      { key: "material", label: "Material" },
      { key: "dimensions", label: "Dimensions" },
      { key: "careInstructions", label: "Care Instructions" },
    ],
  },
  "Travel Accessories": {
    title: "Travel Accessories Details",
    fields: [
      { key: "material", label: "Material" },
      { key: "dimensions", label: "Dimensions" },
      { key: "careInstructions", label: "Care Instructions" },
    ],
  },
  "Bags & Luggage": {
    title: "Bags & Luggage Details",
    fields: [
      { key: "material", label: "Material" },
      { key: "dimensions", label: "Dimensions" },
      { key: "careInstructions", label: "Care Instructions" },
    ],
  },
  "Watches": {
    title: "Watches Details",
    fields: [
      { key: "brand", label: "Brand" },
      { key: "model", label: "Model" },
      { key: "warrantyPeriod", label: "Warranty Period" },
    ],
  },
  "Jewelry": {
    title: "Jewelry Details",
    fields: [
      { key: "material", label: "Material" },
      { key: "dimensions", label: "Dimensions" },
      { key: "careInstructions", label: "Care Instructions" },
    ],
  },
  "Footwear": {
    title: "Footwear Details",
    fields: [
      { key: "material", label: "Material" },
      { key: "dimensions", label: "Dimensions" },
      { key: "careInstructions", label: "Care Instructions" },
    ],
  },
  "Furniture": {
    title: "Furniture Details",
    fields: [
      { key: "material", label: "Material" },
      { key: "dimensions", label: "Dimensions" },
      { key: "assemblyInstructions", label: "Assembly Instructions" },
    ],
  },
  "Home Improvement": {
    title: "Home Improvement Details",
    fields: [
      { key: "material", label: "Material" },
      { key: "dimensions", label: "Dimensions" },
      { key: "assemblyInstructions", label: "Assembly Instructions" },
    ],
  },
  "Office Furniture": {
    title: "Office Furniture Details",
    fields: [
      { key: "material", label: "Material" },
      { key: "dimensions", label: "Dimensions" },
      { key: "assemblyInstructions", label: "Assembly Instructions" },
    ],
  },
  "Outdoor Furniture": {
    title: "Outdoor Furniture Details",
    fields: [
      { key: "material", label: "Material" },
      { key: "dimensions", label: "Dimensions" },
      { key: "assemblyInstructions", label: "Assembly Instructions" },
    ],
  },
  "Kitchen Appliances": {
    title: "Kitchen Appliances Details",
    fields: [
      { key: "material", label: "Material" },
      { key: "dimensions", label: "Dimensions" },
      { key: "warrantyPeriod", label: "Warranty Period" },
    ],
  },
  "Small Appliances": {
    title: "Small Appliances Details",
    fields: [
      { key: "material", label: "Material" },
      { key: "dimensions", label: "Dimensions" },
      { key: "warrantyPeriod", label: "Warranty Period" },
    ],
  },
  "Large Appliances": {
    title: "Large Appliances Details",
    fields: [
      { key: "material", label: "Material" },
      { key: "dimensions", label: "Dimensions" },
      { key: "warrantyPeriod", label: "Warranty Period" },
    ],
  },
  "Home Electronics": {
    title: "Home Electronics Details",
    fields: [
      { key: "material", label: "Material" },
      { key: "dimensions", label: "Dimensions" },
      { key: "warrantyPeriod", label: "Warranty Period" },
    ],
  },
  "Outdoor Gear": {
    title: "Outdoor Gear Details",
    fields: [
      { key: "material", label: "Material" },
      { key: "dimensions", label: "Dimensions" },
      { key: "warrantyPeriod", label: "Warranty Period" },
    ],
  },
  "Camping Gear": {
    title: "Camping Gear Details",
    fields: [
      { key: "material", label: "Material" },
      { key: "dimensions", label: "Dimensions" },
      { key: "warrantyPeriod", label: "Warranty Period" },
    ],
  },
  "Fishing Gear": {
    title: "Fishing Gear Details",
    fields: [
      { key: "material", label: "Material" },
      { key: "dimensions", label: "Dimensions" },
      { key: "warrantyPeriod", label: "Warranty Period" },
    ],
  },
  "Hunting Gear": {
    title: "Hunting Gear Details",
    fields: [
      { key: "material", label: "Material" },
      { key: "dimensions", label: "Dimensions" },
      { key: "warrantyPeriod", label: "Warranty Period" },
    ],
  },
  "Cycling Gear": {
    title: "Cycling Gear Details",
    fields: [
      { key: "material", label: "Material" },
      { key: "dimensions", label: "Dimensions" },
      { key: "warrantyPeriod", label: "Warranty Period" },
    ],
  },
  "Running Gear": {
    title: "Running Gear Details",
    fields: [
      { key: "material", label: "Material" },
      { key: "dimensions", label: "Dimensions" },
      { key: "warrantyPeriod", label: "Warranty Period" },
    ],
  },
};

const DetailSection = ({ title, fields, data }) => (
  <div className="max-w-7xl mx-auto px-6">
    <h2 className="text-2xl mt-6 font-extrabold text-gray-800 dark:text-white mb-6 text-center">
      {title}
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {fields.map((field) => (
        <div key={field.key} className="bg-white dark:bg-gray-800 shadow-lg p-6 rounded-2xl border border-gray-200 dark:border-gray-700 transition hover:shadow-xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {field.label}
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            {field.isDate
              ? new Date(data[field.key]).toLocaleDateString()
              : data[field.key] || "N/A"}
          </p>
        </div>
      ))}
    </div>  
  </div>
);

DetailSection.propTypes = {
  title: PropTypes.string.isRequired,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      isDate: PropTypes.bool,
    })
  ).isRequired,
  data: PropTypes.object.isRequired,
};

const ExtendedDetails = memo(({ listing }) => {
  const { category } = listing;

  // Resolve config, support aliases
  const config = useMemo(() => {
    const entry = categoryConfigs[category];
    if (typeof entry === "string") {
      return categoryConfigs[entry];
    }
    return entry;
  }, [category]);

  if (!config) return null;

  return <DetailSection title={config.title} fields={config.fields} data={listing} />;
});

ExtendedDetails.propTypes = {
  listing: PropTypes.shape({
    category: PropTypes.string.isRequired,
  }).isRequired,
};



const ColorOptions = memo(() => {
  // Enhanced color data with labels for accessibility/tooltips
  const colors = [
    { id: "rose", name: "Rose Blush", class: "bg-red-300", hex: "#fda4af" },
    { id: "charcoal", name: "Charcoal", class: "bg-gray-800", hex: "#1f2937" },
    { id: "emerald", name: "Emerald", class: "bg-green-500", hex: "#10b981" },
    { id: "cloud", name: "Cloud White", class: "bg-white", hex: "#ffffff" },
    { id: "ocean", name: "Ocean Blue", class: "bg-blue-500", hex: "#3b82f6" },
  ];

  const [selectedColor, setSelectedColor] = useState(colors[1].id);

  return (
    <div className="mb-8">
      <div className="flex justify-between items-end mb-3">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white">
          Color: <span className="text-gray-500 dark:text-gray-400 font-medium ml-1">
            {colors.find(c => c.id === selectedColor)?.name}
          </span>
        </h3>
      </div>

      <div className="flex flex-wrap gap-4">
        {colors.map((color) => {
          const isActive = selectedColor === color.id;
          
          return (
            <button
              key={color.id}
              onClick={() => setSelectedColor(color.id)}
              className="relative group outline-none"
              title={color.name}
            >
              {/* Animated Outer Ring */}
              <motion.div
                animate={{
                  scale: isActive ? 1.2 : 1,
                  borderColor: isActive ? color.hex : "transparent",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`absolute -inset-1.5 rounded-full border-2 transition-colors duration-300 ${
                  isActive ? "" : "border-transparent group-hover:border-gray-200 dark:group-hover:border-gray-700"
                }`}
              />

              {/* Color Swatch */}
              <div
                className={`relative h-8 w-8 rounded-full shadow-inner transition-transform duration-300 ${color.class} ${
                  color.id === "cloud" ? "border border-gray-200" : ""
                }`}
              >
                {/* Active Checkmark (optional subtle indicator) */}
                {isActive && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className={`h-1.5 w-1.5 rounded-full ${color.id === 'cloud' ? 'bg-gray-800' : 'bg-white'}`} />
                  </motion.div>
                )}
              </div>

              {/* Tooltip on Hover */}
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {color.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

ColorOptions.displayName = "ColorOptions";

