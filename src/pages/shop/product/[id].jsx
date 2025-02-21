import React, { useState } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  XMarkIcon,
  ShoppingCartIcon
} from "@heroicons/react/24/outline";
import { PrismaClient } from "@prisma/client";
import { useRouter } from "next/router";
import Header from "../../../components/shop/header/Header";
import Footer from "../../../components/shop/footer/Footer";
import { useStateContext } from "../../../contexts/ContextProvider";
import { motion } from "framer-motion";
import Cart from "../../../components/cart";
import LocationModal from "../../../components/locationManager";

const prisma = new PrismaClient();

export async function getServerSideProps(context) {
  const { id } = context.params;

  // Fetch the marketplace listing using the updated model.
  const listing = await prisma.marketplaceListing.findUnique({
    where: { id },
    include: {
      product: true,
      productCategory: true
    }
  });

  if (!listing) {
    return { notFound: true };
  }

  // Serialize listing data (including dates and extended fields)
  const serializeListing = (item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    expirationDate: item.expirationDate ? item.expirationDate.toISOString() : null,
    product: item.product
      ? {
          ...item.product,
          createdAt: item.product.createdAt.toISOString(),
          updatedAt: item.product.updatedAt.toISOString()
        }
      : null,
    productCategory: item.productCategory ? item.productCategory : null
  });

  const serializedListing = serializeListing(listing);

  // Fetch similar listings based on the same productCategoryId (excluding current one)
  const similarListings = await prisma.marketplaceListing.findMany({
    where: {
      productCategoryId: listing.productCategoryId,
      id: { not: id }
    },
    include: { product: true },
    take: 4
  });

  const serializedSimilarListings = similarListings.map(serializeListing);

  return {
    props: {
      listing: serializedListing,
      similarListings: serializedSimilarListings
    }
  };
}

const ExtendedDetails = ({ listing }) => {
  // Extended fields are stored on the listing.
  const category = listing.category;
  if (category === "Books") {
    return (
      <div className="p-4 bg-gray-100 rounded-lg mt-6">
        <h3 className="font-semibold mb-2">Book Details</h3>
        <p>
          <strong>Author:</strong> {listing.author || "N/A"}
        </p>
        <p>
          <strong>Publisher:</strong> {listing.publisher || "N/A"}
        </p>
        <p>
          <strong>ISBN:</strong> {listing.isbn || "N/A"}
        </p>
      </div>
    );
  }
  if (category === "Clothing" || category === "Fashion") {
    return (
      <div className="p-4 bg-gray-100 rounded-lg mt-6">
        <h3 className="font-semibold mb-2">Clothing Details</h3>
        <p>
          <strong>Fabric Composition:</strong>{" "}
          {listing.fabricComposition || "N/A"}
        </p>
        <p>
          <strong>Care Instructions:</strong>{" "}
          {listing.careInstructions || "N/A"}
        </p>
      </div>
    );
  }
  if (category === "Home Appliances") {
    return (
      <div className="p-4 bg-gray-100 rounded-lg mt-6">
        <h3 className="font-semibold mb-2">Home Appliance Details</h3>
        <p>
          <strong>Energy Rating:</strong> {listing.energyRating || "N/A"}
        </p>
        <p>
          <strong>Warranty Period:</strong> {listing.warrantyPeriod || "N/A"}
        </p>
        <p>
          <strong>Dimensions:</strong> {listing.applianceDimensions || "N/A"}
        </p>
      </div>
    );
  }
  if (
    category === "Beauty Products" ||
    category === "Skincare" ||
    category === "Haircare"
  ) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg mt-6">
        <h3 className="font-semibold mb-2">Beauty Product Details</h3>
        <p>
          <strong>Ingredients:</strong> {listing.ingredients || "N/A"}
        </p>
        <p>
          <strong>Usage Instructions:</strong>{" "}
          {listing.usageInstructions || "N/A"}
        </p>
        <p>
          <strong>Expiration Date:</strong>{" "}
          {listing.expirationDate
            ? new Date(listing.expirationDate).toLocaleDateString()
            : "N/A"}
        </p>
      </div>
    );
  }
  return null;
};

const ProductPage = ({ listing, similarListings }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, removeFromCart, decreaseQuantity } = useStateContext();
  const router = useRouter();

  // Use listing.product for underlying product details; fallback to listing for some fields.
  const prod = listing.product || {};
  const images = listing.image
    ? [listing.image]
    : [
        "/images/SlideCard/slide-1.png",
        "/images/SlideCard/slide-2.png",
        "/images/SlideCard/slide-3.png"
      ];

  return (
    <>
      <Header />
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-0 md:p-6">
        <nav className="text-sm text-gray-500 dark:text-gray-400 px-6 py-4">
          Home / Marketplace / {listing.category} /{" "}
          <span className="text-gray-900 dark:text-white font-semibold">
            {listing.title}
          </span>
        </nav>

        <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 md:p-8 flex flex-col lg:flex-row gap-12">
          <ProductImages
            images={images}
            currentImageIndex={currentImageIndex}
            setCurrentImageIndex={setCurrentImageIndex}
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
      <Footer />
      <Cart />
      <LocationModal />
    </>
  );
};

export default ProductPage;

const ProductImages = ({ images, currentImageIndex, setCurrentImageIndex }) => {
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
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
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
};

const ProductInfo = ({
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
        ${listing.salesPrice}
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
};

const ColorOptions = () => {
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
};

const QuantitySelector = ({
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
);

const SpecificationCard = ({ title, details }) => (
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
);

const ProductSpecifications = ({ listing }) => {
  const prod = listing.product || {};
  const generalDetails = [
    { label: "Brand", value: prod.brand ? prod.brand.join(", ") : "N/A" },
    { label: "Model", value: prod.model || "N/A" },
    { label: "Price", value: `$${listing.salesPrice}` },
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
};

const SimilarItems = ({ similarListings, addToCart }) => {
  const router = useRouter();
  return (
    <div className="mt-10 max-w-7xl mx-auto px-4">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Similar Items You Might Like
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {similarListings.map((item) => (
          <motion.div
            key={item.id}
            onClick={() => router.push(`/shop/product/${item.id}`)}
            className="relative bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-4 flex flex-col items-center transition-all cursor-pointer hover:shadow-2xl hover:-translate-y-1 hover:ring-2 hover:ring-yellow-500 dark:hover:ring-yellow-400"
            whileHover={{ scale: 1.03 }}
          >
            <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-xl overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-700 shadow-md">
              <motion.img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-contain transition-transform duration-300 hover:scale-110"
                whileHover={{ rotate: 2 }}
              />
            </div>
            <p className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mt-3 text-center truncate w-full">
              {item.title}
            </p>
            <p className="text-yellow-600 dark:text-yellow-400 font-bold text-lg md:text-xl mt-1">
              ${item.salesPrice}
            </p>
            <motion.button
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                addToCart(item);
              }}
              className="mt-3 w-[90%] md:w-full flex items-center justify-center bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-3 py-1.5 md:px-5 md:py-2.5 rounded-full shadow-lg hover:from-yellow-600 hover:to-yellow-700 transition text-sm md:text-base"
              aria-label="Add to Cart"
            >
              <ShoppingCartIcon className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" /> Add
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
