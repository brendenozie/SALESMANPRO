import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStateContext } from '../../../contexts/ContextProvider';
import Confetti from 'react-confetti';
import { CreditCardIcon, EnvelopeIcon,MapPinIcon, UserIcon, BeakerIcon, TagIcon, TrashIcon } from '@heroicons/react/24/outline';
import { formatCreditCardNumber, formatExpirationDate, formatCVC } from "../../../data/cardFormatter";
import { useRouter } from "next/router";
import Image from 'next/image';
import Header from "../../../components/shop/header/Header";
import Footer from "../../../components/shop/footer/Footer";
import Cart from "../../../components/cart";

const loaderProp = ({ src, width, quality }) => {
  const params = [`w=${width || 800}`]; // Default width to 800 if not provided
  if (quality) {
    params.push(`q=${quality}`);
  }
  return `${src}?${params.join("&")}`;
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { cart, isCartOpen, setIsCartOpen, addToCart, decreaseQuantity, removeFromCart, clearCart } = useStateContext();
  const [CartItem, setCartItem] = useState([]);
  
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/shop/categories?limit=100");
        if (!response.ok) throw new Error("Failed to fetch categories.");
        const data = await response.json();
        setCategories(data.categories);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="container bg-gradient-to-br from-gray-50 to-gray-100">
        <Header CartItem={CartItem} />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
            Shop by Category
          </h1>

          {loading && (
            <p className="text-center text-gray-600 dark:text-gray-300">Loading categories...</p>
          )}

          {error && (
            <p className="text-center text-red-500 font-semibold">{error}</p>
          )}

          {!loading && !error && categories.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
              {categories.map(({ name, icon }, index) => (
                <motion.div
                  key={index}
                  onClick={() => router.push(`/shop/productlist?category=${name}`)}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative bg-gradient-to-br from-yellow-400 to-yellow-500 dark:from-yellow-500 dark:to-yellow-600 text-white p-5 rounded-2xl shadow-lg flex flex-col items-center justify-center cursor-pointer hover:shadow-2xl transition-all overflow-hidden"
                >
                  {/* Background Overlay for Depth */}
                  <div className="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-2xl z-0"></div>

                  {/* Category Icon */}
                  <motion.span
                    className="text-4xl md:text-5xl relative z-10 drop-shadow-md"
                    whileHover={{ rotate: 5 }}
                  >
                    {icon}
                  </motion.span>

                  {/* Category Name */}
                  <p className="font-bold text-center text-sm sm:text-lg relative z-10 drop-shadow-sm whitespace-normal break-words w-full mt-2">
                    {name}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>        
        <Footer />
        <Cart /> 
    </div>
  );
};

export default Categories;
