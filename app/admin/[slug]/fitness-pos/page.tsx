"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProgramsData, SaleItem } from '@/constant/Data';
import { CreditCardIcon, MagnifyingGlassCircleIcon, MinusCircleIcon, PlusCircleIcon, ShoppingBagIcon, TrashIcon } from '@heroicons/react/24/outline';

const productCardVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  hover: { scale: 1.05, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.4)", transition: { duration: 0.2 } },
  tap: { scale: 0.95 },
};

const ProductCard = ({ product, onAdd }) => (
  <motion.div
    variants={productCardVariants}
    initial="initial"
    animate="animate"
    whileHover="hover"
    whileTap="tap"
    onClick={() => onAdd(product)}
    className="bg-gray-800 rounded-xl p-5 cursor-pointer shadow-lg border border-gray-700 relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-gray-800 opacity-20 z-0"></div>
    <div className="relative z-10 flex flex-col h-full">
      <h4 className="font-extrabold text-xl text-white mb-2 leading-tight">{product.name}</h4>
      <p className="text-sm text-gray-400 mb-4 flex-grow">{product.description}</p>
      <div className="flex justify-between items-center mt-auto">
        <p className="text-2xl font-bold text-indigo-400">${product.price.toFixed(2)}</p>
        <div className="bg-indigo-600 rounded-full w-10 h-10 flex items-center justify-center text-white text-xl">
          <PlusCircleIcon className='w-6 h-6' />
        </div>
      </div>
    </div>
  </motion.div>
);

const CartItem = ({ item, onRemove, onUpdateQuantity }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50, transition: { duration: 0.3 } }}
      className="flex justify-between items-center bg-gray-700 p-4 rounded-xl mb-3 shadow-md"
    >
      <div>
        <p className="font-semibold text-white">{item.name}</p>
        <p className="text-sm text-gray-400">${item.price.toFixed(2)}</p>
      </div>
      
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          className="p-2 text-indigo-400 hover:text-indigo-300"
        >
          <MinusCircleIcon className='w-6 h-6' />
        </motion.button>
        <span className="font-bold text-lg text-white">{item.quantity}</span>
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          className="p-2 text-indigo-400 hover:text-indigo-300"
        >
          <PlusCircleIcon className='w-6 h-6' />
        </motion.button>
        <p className="font-bold text-xl text-indigo-400 ml-4">${item.total.toFixed(2)}</p>
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => onRemove(item.id)}
          className="ml-4 p-2 text-red-400 hover:text-red-300 transition-colors"
        >
          <TrashIcon className='w-6 h-6' />
        </motion.button>
      </div>
    </motion.div>
  );
};

const POSPage = () => {
  const [cart, setCart] = useState([]);
  const products = getProgramsData("");

  const handleAddToCart = (product) => {
    const existingItemIndex = cart.findIndex((item) => item.id === product.id);
    if (existingItemIndex > -1) {
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += 1;
      newCart[existingItemIndex].total = newCart[existingItemIndex].quantity * newCart[existingItemIndex].price;
      setCart(newCart);
    } else {
      setCart([...cart, { ...product, quantity: 1, total: product.price }]);
    }
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity: newQuantity, total: newQuantity * item.price } : item
      ));
    }
  };
  
  const handleRemoveFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100 p-10 space-x-10">
      {/* Product & Search Panel */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col bg-gray-900 rounded-2xl p-6"
      >
        <h2 className="text-4xl font-extrabold mb-6 text-white">Products & Services</h2>
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search items or members..."
            className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
          <MagnifyingGlassCircleIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-6 h-6" />
        </div>
        
        {/* Product Grid */}
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto custom-scrollbar"
        >
          <AnimatePresence>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={handleAddToCart} />
            ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Transaction Cart Panel */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-1/3 flex flex-col bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-700"
      >
        <div className="flex items-center gap-4 mb-6">
          <ShoppingBagIcon className="text-3xl text-indigo-400 w-6 h-6" />
          <h3 className="text-3xl font-extrabold text-white">Current Order</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence>
            {cart.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="h-full flex items-center justify-center text-gray-500 text-center"
              >
                <p className="text-lg">Add items to start a new transaction.</p>
              </motion.div>
            ) : (
              cart.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onRemove={handleRemoveFromCart}
                  onUpdateQuantity={handleUpdateQuantity}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Totals and Actions */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="flex justify-between items-center text-xl font-bold mb-4">
            <span>Total:</span>
            <span className="text-indigo-400 text-3xl">${totalAmount.toFixed(2)}</span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold text-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <CreditCardIcon className='w-6 h-6' />
            Process Payment
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-4 py-3 rounded-xl bg-gray-700 text-gray-400 font-semibold hover:bg-gray-600 transition-colors"
            onClick={() => setCart([])}
          >
            Clear Cart
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default POSPage;