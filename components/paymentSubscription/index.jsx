import React from 'react';
import { PlusIcon, MinusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '../../contexts/ContextProvider';
import { useRouter } from 'next/router';

const PaymentSubscription = () => {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeItem,cartSubtotal } = useStateContext();
  const router = useRouter();

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

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
            className="bg-white dark:bg-gray-900 h-full w-80 p-6 shadow-2xl rounded-l-2xl overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Shopping Cart</h2>
              <XMarkIcon
                className="w-6 h-6 text-gray-500 hover:text-red-500 cursor-pointer transition-transform transform hover:rotate-90"
                onClick={() => setIsCartOpen(false)}
              />
            </div>

            {cart.length === 0 ? (
              <p className="text-center text-gray-500">Your cart is empty.</p>
            ) : (
              cart.map((item, index) => (
                <div key={index} className="flex items-center gap-4 border-b border-gray-300 dark:border-gray-700 py-4">
                  <img className="h-20 w-20 object-cover rounded-lg" src={item.image} alt={item.newName} />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{item.newName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <MinusIcon
                        className="w-5 h-5 text-red-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      />
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-800 dark:text-gray-200">
                        {item.quantity}
                      </span>
                      <PlusIcon
                        className="w-5 h-5 text-green-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="font-bold text-gray-800 dark:text-gray-200">${(item.sellingPrice * item.quantity).toFixed(2)}</p>
                    <TrashIcon
                      className="w-5 h-5 text-gray-400 hover:text-red-600 cursor-pointer mt-1 transition"
                      onClick={() => removeItem(item.id)}
                    />
                  </div>
                </div>
              ))
            )}

            {cart.length > 0 && (
              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-lg font-semibold text-gray-800 dark:text-gray-200">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal()}</span>
                </div>
                <button
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3 rounded-xl shadow-md transition duration-300"
                  onClick={() => {
                    setIsCartOpen(false);
                    router.push("/shop/checkout");
                  }}
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentSubscription;
