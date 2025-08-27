"use client"

import React , { useMemo, useCallback }from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import CartItem from '../cartItem';
import { useRouter } from "next/navigation";

const Cart = () => {
  const { cart, isCartOpen, setIsCartOpen, addToCart, decreaseQuantity, removeFromCart, clearCart } = useStateContext();
  const router = useRouter();

  // Memoize subtotal calculation
  const calculateSubtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.finalPrice * item.quantity, 0).toFixed(2);
  }, [cart]);

  const handleCheckout = useCallback(() => {
    setIsCartOpen(false);
    router.push('/shop/checkout');
  }, [setIsCartOpen, router]);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCartOpen(false)}
        >
          <motion.div
            className="bg-white dark:bg-gray-900 h-full w-96 p-6 shadow-2xl rounded-l-2xl overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Shopping Cart</h2>
              <XMarkIcon
                className="w-6 h-6 text-gray-500 hover:text-red-500 cursor-pointer transition-transform transform hover:rotate-90"
                onClick={() => setIsCartOpen(false)}
                aria-label="Close cart"
              />
            </div>

            {/* Cart Items */}
            {cart.length === 0 ? (
              <p className="text-center text-gray-500">Your cart is empty.</p>
            ) : (
              cart.map((item) => (
                <CartItem key={item.id} item={item} addToCart={addToCart} decreaseQuantity={decreaseQuantity} removeItem={removeFromCart} />
              ))
            )}

            {/* Subtotal and Checkout */}
            {cart.length > 0 && (
              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-lg font-semibold text-gray-800 dark:text-gray-200">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal}</span>
                </div>
                <button
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3 rounded-xl shadow-md transition duration-300"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </button>
                <button
                  className="w-full mt-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 py-2 rounded-xl shadow-md transition duration-300"
                  onClick={() => setIsCartOpen(false)}
                >
                  Close Cart
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Cart;

