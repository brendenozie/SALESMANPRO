import React, { useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { PrismaClient } from '@prisma/client';
import { useRouter } from 'next/router';
import Header from "../../../components/shop/header/Header";
import Footer from "../../../components/shop/footer/Footer";
import { useStateContext } from '../../../contexts/ContextProvider';
import { motion } from "framer-motion";
import Cart from "../../../components/cart";

const prisma = new PrismaClient();

export async function getServerSideProps(context) {
  const { id } = context.params;
  const product = await prisma.clientInventory.findUnique({
    where: { id },
    include: {
      inventoryItem: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!product) {
    return {
      notFound: true,
    };
  }

  const similarProducts = await prisma.clientInventory.findMany({
    where: {
      inventoryItem: {
        product: {
          categoryId: product.inventoryItem.product.categoryId,
        },
      },
      id: {
        not: id,
      },
    },
    include: {
      inventoryItem: {
        include: {
          product: true,
        },
      },
    },
    take: 4,
  });

  const serializedProduct = {
    ...product,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    inventoryItem: {
      ...product.inventoryItem,
      createdAt: product.inventoryItem.createdAt.toISOString(),
      updatedAt: product.inventoryItem.updatedAt.toISOString(),
      product: {
        ...product.inventoryItem.product,
        createdAt: product.inventoryItem.product.createdAt.toISOString(),
        updatedAt: product.inventoryItem.product.updatedAt.toISOString(),
      },
    },
  };

  const serializedSimilarProducts = similarProducts.map((similarProduct) => ({
    ...similarProduct,
    createdAt: similarProduct.createdAt.toISOString(),
    updatedAt: similarProduct.updatedAt.toISOString(),
    inventoryItem: {
      ...similarProduct.inventoryItem,
      createdAt: similarProduct.inventoryItem.createdAt.toISOString(),
      updatedAt: similarProduct.inventoryItem.updatedAt.toISOString(),
      product: {
        ...similarProduct.inventoryItem.product,
        createdAt: similarProduct.inventoryItem.product.createdAt.toISOString(),
        updatedAt: similarProduct.inventoryItem.product.updatedAt.toISOString(),
      },
    },
  }));

  return {
    props: { product: serializedProduct, similarProducts: serializedSimilarProducts },
  };
}

const ProductPage = ({ product, similarProducts }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, removeFromCart, decreaseQuantity, cart, cartSubtotal } = useStateContext();

  const images = [
    "/images/SlideCard/slide-1.png",
    "/images/SlideCard/slide-2.png",
    "/images/SlideCard/slide-3.png",
  ];

  return (
    <>
      <Header />
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-0 md:p-6">
        <nav className="text-sm text-gray-500 dark:text-gray-400 px-6 py-4">
          Home / Products / {product.inventoryItem.product.category} / <span className="text-gray-900 dark:text-white font-semibold">{product.newName}</span>
        </nav>

        <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 md:p-8 flex flex-col lg:flex-row gap-12">
          <ProductImages images={images} currentImageIndex={currentImageIndex} setCurrentImageIndex={setCurrentImageIndex} />
          <ProductInfo quantity={quantity} setQuantity={setQuantity} product={product}  addToCart ={addToCart} removeFromCart={removeFromCart} decreaseQuantity={decreaseQuantity}/>
        </div>

        <ProductSpecifications />
        <SimilarItems similarProducts={similarProducts}/>
      </div>
      <Footer />
      <Cart />
    </>
  );
};

export default ProductPage;


const ProductImages = ({ images, currentImageIndex, setCurrentImageIndex }) => {
  const [isOpen, setIsOpen] = useState(false);

  const prevImage = () =>
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  const nextImage = () =>
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

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

      {/* Thumbnail Images */}
      <div className="flex space-x-2 mt-4">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Thumbnail ${index + 1}`}
            onClick={() => setCurrentImageIndex(index)}
            className={`h-16 w-16 object-cover rounded-lg border cursor-pointer transition ${
              index === currentImageIndex ? "border-green-500 shadow-md" : "border-gray-300"
            }`}
          />
        ))}
      </div>

      {/* Lightbox Modal */}
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


// const ProductImages = ({ images, currentImageIndex, setCurrentImageIndex }) => {
//   const prevImage = () => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
//   const nextImage = () => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

//   return (
//     <div className="relative flex-1">
//       <div className="relative flex-1">
//         <img src={images[currentImageIndex]} alt="Product" className="rounded-lg w-full object-contain h-96 shadow-lg" />
//         <button onClick={prevImage} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-700 shadow-lg rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition">
//           <ArrowLeftIcon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
//         </button>
//         <button onClick={nextImage} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-700 shadow-lg rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition">
//           <ArrowRightIcon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
//         </button>
//       </div>

//       {/* Thumbnail Images */}
//         <div className="flex space-x-2 mt-4">
//           {images.map((img, index) => (
//             <img
//               key={index}
//               src={img}
//               alt={`Thumbnail ${index + 1}`}
//               onClick={() => setCurrentImageIndex(index)}
//               className={`h-16 w-16 object-cover rounded-lg border cursor-pointer transition ${
//                 index === currentImageIndex ? "border-green-500 shadow-md" : "border-gray-300"
//               }`}
//             />
//           ))}
//         </div>
//       </div>
//   );
// };


// Product Information Section
const ProductInfo = ({ quantity, setQuantity, product, addToCart, removeFromCart, decreaseQuantity, }) => (
  <div className="flex-1">
    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">{product.newName}</h1>
    <p className="text-gray-500  mb-4 leading-relaxed">
      {product.newDescription}
    </p>
    <p className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">${product.sellingPrice}</p>
    <p className="text-sm text-gray-400 mb-6">Suggested payments with 6 months special financing</p>

    {/* Color Options */}
    <ColorOptions />

    {/* Quantity Selector */}
    <QuantitySelector quantity={quantity} setQuantity={setQuantity} product={product} addToCart ={addToCart} removeFromCart={removeFromCart} decreaseQuantity={decreaseQuantity}/>

    {/* CTA Buttons */}
    <div className="flex space-x-4">
      <button className="bg-yellow-700 text-white px-8 py-3 rounded-lg font-medium hover:bg-yellow-800 shadow-md transition">
        Buy Now
      </button>
      <button onClick={()=>{addToCart(product)}} className="border border-yellow-600 text-yellow-500 px-8 py-3 rounded-lg font-medium hover:bg-yellow-100 shadow-md transition">
        Add to Cart
      </button>
    </div>
  </div>
);

// Color Options
const ColorOptions = () => {
  const colors = ["bg-red-300", "bg-gray-700", "bg-green-500", "bg-white", "bg-blue-500"];
  return (
    <div className="mb-4">
      <h3 className="text-gray-900 dark:text-white font-medium mb-2">Choose a Color</h3>
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

// Quantity Selector with More Styling
const QuantitySelector = ({ quantity, setQuantity,product, addToCart, decreaseQuantity, }) => (
  <div className="flex items-center mb-6">
    <div className="flex items-center border rounded-lg px-4 py-2 space-x-4 bg-gray-100 shadow-md">
      <button
        onClick={() =>{setQuantity(Math.max(1, quantity - 1)); decreaseQuantity(product)}}
        className="text-gray-700 text-xl font-bold"
      >
        −
      </button>
      <span className="font-medium text-lg">{quantity}</span>
      <button
        onClick={() => {setQuantity(quantity + 1); addToCart(product)}}
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

const generalDetails = [
  { label: "Brand", value: "Apple" },
  { label: "Model", value: "AirPods Max Wireless Headphones" },
  { label: "Price", value: "$549.00" },
  { label: "Release date", value: "December 2020" },
];

const productDetails = [
  { label: "Microphone", value: "Yes" },
  { label: "Driver Type", value: "Dynamic" },
];

const ProductSpecifications = () => (
  <div className="max-w-7xl mx-auto px-6">
    <h2 className="text-2xl mt-6 font-extrabold text-gray-800 dark:text-white mb-6 text-center">Specifications</h2>
    <div className="grid md:grid-cols-2 gap-8">
      <SpecificationCard title="General" details={generalDetails} />
      <SpecificationCard title="Product Details" details={productDetails} />
    </div>
  </div>
);

const SpecificationCard = ({ title, details }) => (
  <div className="bg-white dark:bg-gray-800 shadow-lg p-6 rounded-2xl border border-gray-200 dark:border-gray-700 transition hover:shadow-xl">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
    <div className="space-y-3">
      {details.map((item, index) => (
        <div key={index} className="flex justify-between text-gray-700 dark:text-gray-300 text-sm">
          <span className="font-medium">{item.label}</span>
          <span>{item.value}</span>
        </div>
      ))}
    </div>
  </div>
);

const SimilarItems = ({ similarProducts }) => {

  const router = useRouter();
  // const similarProducts = [
  //   {
  //     id: 1,
  //     image: "/images/SlideCard/slide-1.png",
  //     name: "Wireless Headphones",
  //     price: "$199.99",
  //   },
  //   {
  //     id: 2,
  //     image: "/images/SlideCard/slide-2.png",
  //     name: "Noise Cancelling Earbuds",
  //     price: "$149.99",
  //   },
  //   {
  //     id: 3,
  //     image: "/images/SlideCard/slide-3.png",
  //     name: "Bluetooth Over-Ear",
  //     price: "$129.99",
  //   },
  //   {
  //     id: 4,
  //     image: "/images/SlideCard/slide-3.png",
  //     name: "Studio Headphones",
  //     price: "$249.99",
  //   },
  // ];

  return (
  
  <div className="mt-10 max-w-7xl mx-auto">
    <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Similar Items You Might Like</h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {similarProducts.map((product) => (
          <motion.div onClick={ () => router.push(`/shop/product/${product.id}`)} 
            key={product.id}
            className="bg-white  dark:bg-gray-800 shadow-md rounded-xl p-4 flex flex-col items-center justify-center hover:shadow-xl transition transform hover:-translate-y-1"
          >
            {/* Product Image */}
            <div className="h-36 w-36 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src={product.image}
                alt={product.newName}
                className="h-full w-full object-contain transition-transform duration-300 hover:scale-110"
              />
            </div>

            {/* Product Details */}
            <p className="text-lg font-medium text-gray-800 dark:text-white mt-4">{product.newName}</p>
            <p className="text-yellow-600 dark:text-yellow-400 font-semibold text-md mt-1">{product.sellingPrice}</p>

            {/* Add to Cart Button */}
            <button className="mt-4 px-5 py-2 bg-yellow-700 text-white rounded-lg font-medium hover:bg-yellow-800 transition">
              Add to Cart
            </button>
          </motion.div>
        ))}
    </div>
  </div>
)};
