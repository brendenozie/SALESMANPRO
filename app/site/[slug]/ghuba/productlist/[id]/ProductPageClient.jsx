"use client"

import React, { useState, useCallback,  memo, useMemo } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  XMarkIcon,
  ShoppingCartIcon
} from "@heroicons/react/24/outline";
import { PrismaClient } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useStateContext } from "@/contexts/ContextProvider";
import { motion } from "framer-motion";
import load from "@/assets/load.png";
import Image from "next/image";
import PropTypes from "prop-types";

import GhubaProductCard from "@/components/site/layouts/GhubaLayout/body/components/GhubaProductCard";

// next/image loader
const loaderProp = ({ src, width, quality }) => {
  const params = [`w=${width || 800}`];
  if (quality) params.push(`q=${quality}`);
  return `${src}?${params.join("&")}`;
};

const prisma = new PrismaClient();


const ProductPageClient = ({ listing, similarListings }) => {

  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, removeFromCart, decreaseQuantity } = useStateContext();
  const router = useRouter();

  const images = listing.image
    ? [listing.image]
    : [
        "/images/SlideCard/slide-1.png",
        "/images/SlideCard/slide-2.png",
        "/images/SlideCard/slide-3.png"
      ];

  const onPrev = useCallback(
    () => setCurrentImage(idx => (idx === 0 ? images.length - 1 : idx - 1)),
    [images.length]
  );
  const onNext = useCallback(
    () => setCurrentImage(idx => (idx === images.length - 1 ? 0 : idx + 1)),
    [images.length]
  );

  const increase = useCallback(() => {
    setQuantity(q => q + 1);
    addToCart(listing);
  }, [addToCart, listing]);

  const decrease = useCallback(() => {
    setQuantity(q => Math.max(1, q - 1));
    decreaseQuantity(listing);
  }, [decreaseQuantity, listing]);

  return (
    <>    
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-0 md:p-6">
        <nav className="text-sm text-gray-500 dark:text-gray-400 px-6 py-4">
          Home / Marketplace / {listing.category} / {listing.subCategory.name} / {listing.brand} / {" "}
          <span className="text-gray-900 dark:text-white font-semibold">
            {listing.title}
          </span>
        </nav>

        <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 md:p-8 flex flex-col lg:flex-row gap-12">
          <ProductImages
            images={images}
            currentImageIndex={currentImage}
            setCurrentImageIndex={setCurrentImage}
          />
          <ProductInfo
            quantity={quantity}
            setQuantity={setQuantity}
            listing={listing}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            decreaseQuantity={decreaseQuantity}
          />
        </div>

        {/* Extended details based on category */}
        <ExtendedDetails listing={listing} />

        <ProductSpecifications listing={listing} />

        <SimilarItems similarListings={similarListings} addToCart={addToCart} />
      </div>
      
    </>
  );
};

export default ProductPageClient;

const ProductImages = memo(({ images, currentImageIndex, setCurrentImageIndex }) => {
  const [isOpen, setIsOpen] = useState(false);
  const prevImage = () =>
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const nextImage = () =>
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );

  return (
    <div className="relative flex-1">
      <div className="relative flex-1">
        <img
          src={images[currentImageIndex]}
          alt="Product"
          className="rounded-lg w-full object-contain h-96 shadow-lg cursor-pointer"
          onClick={() => setIsOpen(true)}
        />
        <button
          onClick={prevImage}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-700 shadow-lg rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
        >
          <ArrowLeftIcon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-700 shadow-lg rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
        >
          <ArrowRightIcon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
        </button>
      </div>
      <div className="flex space-x-2 mt-4">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Thumbnail ${index + 1}`}
            onClick={() => setCurrentImageIndex(index)}
            className={`h-16 w-16 object-cover rounded-lg border cursor-pointer transition ${
              index === currentImageIndex
                ? "border-green-500 shadow-md"
                : "border-gray-300"
            }`}
          />
        ))}
      </div>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50">
          <button
            onClick={() => setIsOpen(false)}
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
          <img
            src={images[currentImageIndex]}
            alt="Enlarged Product"
            className="max-h-[80vh] max-w-[90vw] object-contain"
          />
          <button
            onClick={nextImage}
            className="absolute right-5 top-1/2 transform -translate-y-1/2 text-white bg-gray-700 p-3 rounded-full hover:bg-gray-600 transition"
          >
            <ArrowRightIcon className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
});

const ProductInfo = memo(({
  quantity,
  setQuantity,
  listing,
  addToCart,
  removeFromCart,
  decreaseQuantity
}) => {
  return (
    <div className="flex-1">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
        {listing.title}
      </h1>
      <p className="text-gray-500 mb-4 leading-relaxed">
        {listing.description}
      </p>
      <p className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">
        ${listing.finalPrice}
      </p>
      <p className="text-sm text-gray-400 mb-6">
        Suggested payments with 6 months special financing
      </p>
      <ColorOptions />
      <QuantitySelector
        quantity={quantity}
        setQuantity={setQuantity}
        listing={listing}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
        decreaseQuantity={decreaseQuantity}
      />
      <div className="flex space-x-4">
        <button className="bg-yellow-700 text-white px-8 py-3 rounded-lg font-medium hover:bg-yellow-800 shadow-md transition">
          Buy Now
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            addToCart(listing);
          }}
          className="border border-yellow-600 text-yellow-500 px-8 py-3 rounded-lg font-medium hover:bg-yellow-100 shadow-md transition"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
});

const ColorOptions = memo(() => {
  const colors = [
    "bg-red-300",
    "bg-gray-700",
    "bg-green-500",
    "bg-white",
    "bg-blue-500"
  ];
  return (
    <div className="mb-4">
      <h3 className="text-gray-900 dark:text-white font-medium mb-2">
        Choose a Color
      </h3>
      <div className="flex space-x-3">
        {colors.map((color, index) => (
          <button
            key={index}
            className={`h-10 w-10 rounded-full border border-gray-300 transition hover:shadow-lg ${color}`}
          />
        ))}
      </div>
    </div>
  );
});

const QuantitySelector = memo(({
  quantity,
  setQuantity,
  listing,
  addToCart,
  decreaseQuantity
}) => (
  <div className="flex items-center mb-6">
    <div className="flex items-center border rounded-lg px-4 py-2 space-x-4 bg-gray-100 shadow-md">
      <button
        onClick={() => {
          setQuantity(Math.max(1, quantity - 1));
          decreaseQuantity(listing);
        }}
        className="text-gray-700 text-xl font-bold"
      >
        −
      </button>
      <span className="font-medium text-lg">{quantity}</span>
      <button
        onClick={() => {
          setQuantity(quantity + 1);
          addToCart(listing);
        }}
        className="text-gray-700 text-xl font-bold"
      >
        +
      </button>
    </div>
    <span className="ml-4 text-gray-500 font-medium">
      Only <span className="text-red-500">12 Items Left!</span> Don’t miss it
    </span>
  </div>
));

const SpecificationCard = memo(({ title, details }) => (
  <div className="bg-white dark:bg-gray-800 shadow-lg p-6 rounded-2xl border border-gray-200 dark:border-gray-700 transition hover:shadow-xl">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      {title}
    </h3>
    <div className="space-y-3">
      {details.map((item, index) => (
        <div
          key={index}
          className="flex justify-between text-gray-700 dark:text-gray-300 text-sm"
        >
          <span className="font-medium">{item.label}</span>
          <span>{item.value}</span>
        </div>
      ))}
    </div>
  </div>
));

const ProductSpecifications = memo(({ listing }) => {
  const prod = listing.product || {};
  const generalDetails = [
    { label: "Brand", value: prod.brand ? prod.brand : "N/A" },
    { label: "Model", value: prod.model || "N/A" },
    { label: "Price", value: `$${listing.finalPrice}` },
    { label: "Release Date", value: prod.releaseDate ? new Date(prod.releaseDate).toLocaleDateString() : "N/A" }
  ];

  const productDetails = [
    { label: "Condition", value: listing.condition || "N/A" },
    { label: "Dimension", value: listing.dimension || "N/A" },
    { label: "Material", value: listing.material ? listing.material.join(", ") : "N/A" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6">
      <h2 className="text-2xl mt-6 font-extrabold text-gray-800 dark:text-white mb-6 text-center">
        Specifications
      </h2>
      <div className="grid md:grid-cols-2 gap-8">
        <SpecificationCard title="General" details={generalDetails} />
        <SpecificationCard title="Product Details" details={productDetails} />
      </div>
    </div>
  );
});

const SimilarItems = memo(({ similarListings, addToCart }) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
   const [likedItems, setLikedItems] = useState({});
    
    const toggleLike = (id) => {
      setLikedItems((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    };
    
  return (
    <div className="mt-10 max-w-7xl mx-auto px-4">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Similar Items You Might Like
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {similarListings &&  similarListings.length > 0 &&  similarListings.map((product) => (
        //   <ProductCard  key={product.id} product={product} addToCart={addToCart}/>
                        <GhubaProductCard 
                                      // key={index}
                                      product={product} 
                                      toggleLike={toggleLike} 
                                      likedItems={likedItems} 
                                      addToCart={addToCart} 
                                    />
        ))}
      </div>
    </div>
  );
});

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

const ProductCard = memo(({ product,addToCart }) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      onClick={() => router.push(`/shop/product/${product.id}`)}
      whileHover={{ scale: 1.03 }}
      className="relative bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl shadow-xl transition-all cursor-pointer hover:shadow-2xl hover:-translate-y-1 hover:ring-2 hover:ring-yellow-500 dark:hover:ring-yellow-400 mb-4 break-inside-avoid"
    >
      {/* Product Image */}
      <div className="relative w-full h-44 md:h-52 rounded-xl overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-700 shadow-md">
        <Image
            width={300}
            height={300}
            loader = {loaderProp}
            src={imageError ? load.src : product.image}
            alt={`Product image of ${product.title}`}
            className="w-full h-56 object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
      </div>

      {/* Product Info */}
      <div className="w-full mt-3 flex flex-col items-center">
        <h3 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white text-center truncate w-full">
          {product.title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center truncate w-full">
          {product.description || "No description available"}
        </p>

        {/* Price & Add to Cart Button */}
        <div className="flex justify-between items-center w-full mt-2">
          <span className="text-yellow-600 dark:text-yellow-400 font-bold text-xs md:text-xl">
            ${product.finalPrice ? product.finalPrice.toFixed(2) : 0}
          </span>

           <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => addToCart(product)}
              className="flex items-center bg-yellow-500 text-black p-3 rounded-xl shadow-lg hover:shadow-xl transition"
              aria-label="Add to Cart"
            >
              <ShoppingCartIcon className="w-5 h-5 mr-1" /> Add
            </motion.button>
        </div>
      </div>
    </motion.div>
  );
});
