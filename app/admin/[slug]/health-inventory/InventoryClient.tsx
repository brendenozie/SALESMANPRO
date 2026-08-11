// app/inventory/InventoryClient.tsx
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusCircleIcon, 
  MagnifyingGlassIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowPathIcon 
} from '@heroicons/react/24/solid';

const fadeIn = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  lastUpdated: string;
}

const sampleInventory: InventoryItem[] = [
  { id: 'inv001', name: 'Surgical Gloves (Box)', category: 'Medical Supplies', stock: 150, minStock: 50, lastUpdated: '2023-07-10' },
  { id: 'inv002', name: 'Paracetamol 500mg (Pack)', category: 'Medication', stock: 75, minStock: 30, lastUpdated: '2023-07-12' },
  { id: 'inv003', name: 'Blood Pressure Monitor', category: 'Equipment', stock: 10, minStock: 5, lastUpdated: '2023-07-08' },
  { id: 'inv004', name: 'Syringes (Pack of 100)', category: 'Medical Supplies', stock: 200, minStock: 100, lastUpdated: '2023-07-11' },
  { id: 'inv005', name: 'Antiseptic Wipes (Pack)', category: 'Disposables', stock: 40, minStock: 20, lastUpdated: '2023-07-09' },
];

interface InventoryClientProps {
  companyId: string;
  slug: string;
}

export default function InventoryClient({ companyId, slug }: InventoryClientProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>(sampleInventory);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const filteredInventory = inventory.filter(item =>
    (filterCategory === 'All' || item.category === filterCategory) &&
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (id: string) => {
    alert(`Editing inventory item: ${id} (Mock Action)`);
  };

  const handleDelete = (id: string) => {
    if (confirm(`Are you sure you want to delete inventory item ${id}?`)) {
      setInventory(prev => prev.filter(item => item.id !== id));
      alert(`Inventory item ${id} deleted.`);
    }
  };

  const handleRestock = (id: string) => {
    alert(`Restocking item: ${id} (Mock Action)`);
  };

  const getStockStatusColor = (stock: number, minStock: number) => {
    if (stock <= minStock) return 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900';
    if (stock < minStock * 2) return 'text-orange-600 bg-orange-100 dark:text-orange-300 dark:bg-orange-900';
    return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900';
  };

  const categories = ['All', ...Array.from(new Set(sampleInventory.map(item => item.category)))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 drop-shadow-lg"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          Inventory Management
        </motion.h1>
        <motion.p
          className="text-xl text-gray-700 dark:text-gray-300 mb-12"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.2 }}
        >
          Track and manage medical supplies and equipment.
        </motion.p>

        <motion.div
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative flex-grow w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search items..."
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
            <select
              className="px-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button
              onClick={() => alert('Add new inventory item form (Mock Action)')}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-full font-bold shadow-md hover:from-cyan-600 hover:to-teal-700 transition-all duration-300"
            >
              <PlusCircleIcon className="w-5 h-5 mr-2" /> Add New Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tl-xl">Item Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stock</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Min Stock</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Updated</th>
                  <th scope="col" className="relative px-6 py-3 rounded-tr-xl">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">
                      No inventory items found.
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{item.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockStatusColor(item.stock, item.minStock)}`}>
                          {item.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {item.minStock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {item.lastUpdated}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleRestock(item.id)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                            aria-label={`Restock ${item.name}`}
                          >
                            <ArrowPathIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(item.id)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
                            aria-label={`Edit ${item.name}`}
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 p-2 rounded-full hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"
                            aria-label={`Delete ${item.name}`}
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}