"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCartIcon, PlusCircleIcon, MinusCircleIcon, TrashIcon, CreditCardIcon, ReceiptPercentIcon } from '@heroicons/react/24/solid';

const fadeIn = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

const sampleProducts: Product[] = [
  { id: 'p1', name: 'Bandages (Box)', price: 12.50, category: 'Supplies' },
  { id: 'p2', name: 'Pain Reliever (Bottle)', price: 8.75, category: 'Medication' },
  { id: 'p3', name: 'Antiseptic Solution', price: 15.00, category: 'Supplies' },
  { id: 'p4', name: 'Vitamin C (Bottle)', price: 10.20, category: 'Supplements' },
  { id: 'p5', name: 'First Aid Kit', price: 30.00, category: 'Kits' },
  { id: 'p6', name: 'Thermometer', price: 25.00, category: 'Equipment' },
];

export default function AdminPOSPage({ params }: { params: { adminSlug: string } }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredProducts = sampleProducts.filter(product =>
    (selectedCategory === 'All' || product.category === selectedCategory) &&
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prevCart => {
      const updatedCart = prevCart.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + delta } : item
      );
      return updatedCart.filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxRate = 0.08; // 8% tax
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const categories = ['All', ...Array.from(new Set(sampleProducts.map(p => p.category)))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 drop-shadow-lg"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          Point of Sale
        </motion.h1>
        <motion.p
          className="text-xl text-gray-700 dark:text-gray-300 mb-12"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.2 }}
        >
          Process sales for medical supplies and products.
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product List */}
          <motion.div
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Products</h2>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                type="text"
                placeholder="Search products..."
                className="flex-grow p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
              {filteredProducts.map(product => (
                <motion.div
                  key={product.id}
                  className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-md flex items-center justify-between"
                  whileHover={{ scale: 1.02, boxShadow: "0px 5px 15px rgba(0,0,0,0.1)" }}
                >
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{product.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-teal-600 dark:text-teal-400">${product.price.toFixed(2)}</span>
                    <button
                      onClick={() => addToCart(product)}
                      className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                      aria-label={`Add ${product.name} to cart`}
                    >
                      <PlusCircleIcon className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Cart Summary */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 flex flex-col"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Cart</h2>
            <div className="flex-grow max-h-72 overflow-y-auto pr-2 mb-4">
              {cart.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">Cart is empty. Add some products!</p>
              ) : (
                <ul className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-xl shadow-sm">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{item.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">${item.price.toFixed(2)} x {item.quantity}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <MinusCircleIcon className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-gray-900 dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <PlusCircleIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400 transition-colors"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2 text-gray-800 dark:text-gray-200">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({taxRate * 100}%):</span>
                <span className="font-semibold">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-2xl font-bold text-blue-600 dark:text-blue-400">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <motion.button
              onClick={() => alert('Processing payment... (This is a mock action)')}
              className="mt-6 w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4 rounded-full font-bold shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
              whileHover={{ scale: 1.02, boxShadow: "0px 8px 20px rgba(0,0,0,0.2)" }}
              whileTap={{ scale: 0.98 }}
              disabled={cart.length === 0}
            >
              <CreditCardIcon className="w-6 h-6 mr-3" /> Process Payment
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
