"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';


const apiBaseUrl = "/api";//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';


// Define the types (important for clarity, matching the server component)
type Order = {
  id: string;
  eventId: string;
  userId: string;
  customerName?: string;
  customerEmail?: string;
  totalPrice: number;
  status: 'COMPLETED' | 'PENDING' | 'REFUNDED' | 'CANCELLED' | string;
  createdAt: string;
  paymentMethod?: string;
  paymentTransactionId?: string;
  items?: any[]; // For modal details
};

type Agent = {
  id: string;
  name: string;
  email: string;
};

// Framer Motion variants (unchanged)
const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const tableRowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

// Component now accepts initial data from the Server Component
interface AdminOrdersClientProps {
  adminSlug: string;
  initialOrders: Order[]; // Initial data passed from server
  allOrganizers: Agent[]; // Passed from server
}

export default function AdminOrdersClient({ adminSlug, initialOrders, allOrganizers }: AdminOrdersClientProps) {
  // allData holds the master list (for filtering/refreshing against)
  const [allData, setAllData] = useState<Order[]>(initialOrders); 
  // orders holds the currently displayed (filtered/searched) list
  const [orders, setOrders] = useState<Order[]>(initialOrders); 

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Initial data is already here
  const [error, setError] = useState<string | null>(null);

  // --- Core Client-Side Filtering Logic (Immediate UI update) ---
  const filterAndSearchOrders = useCallback(() => {
    let filtered = allData;

    // 1. Filter by Status
    if (filterStatus) {
      filtered = filtered.filter(order => order.status === filterStatus);
    }

    // 2. Search by Term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(lowerSearchTerm) ||
        order.customerName?.toLowerCase().includes(lowerSearchTerm) ||
        order.customerEmail?.toLowerCase().includes(lowerSearchTerm)
      );
    }

    setOrders(filtered);
  }, [allData, filterStatus, searchTerm]);


  useEffect(() => {
    // This runs on mount and whenever search/filter/allData changes.
    // This REPLACES the original `useEffect` that did initial/filter fetching.
    filterAndSearchOrders();
  }, [searchTerm, filterStatus, allData, filterAndSearchOrders]);


  // --- Data Refetching Function (Only for mutations/manual refresh) ---
  const refetchAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Endpoint used by the client for a full refresh
      const response = await fetch(`${apiBaseUrl}/admin/${adminSlug}/orders`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Update the master data list, which triggers the filterAndSearchOrders effect
      setAllData(data.orders);

    } catch (err: any) {
      setError(err.message || "Failed to refresh all orders.");
      console.error("Orders refresh error:", err);
    } finally {
      setIsLoading(false);
    }
  };


  // --- CRUD/Action Handlers ---

  const handleRefundCancel = async (orderId: string, currentStatus: string) => {
    // NOTE: Updated status checks to use the uppercase values defined in the <select>
    let newStatus: string;
    let confirmMessage: string;

    if (currentStatus === 'COMPLETED') {
      newStatus = 'REFUNDED';
      confirmMessage = `Are you sure you want to refund order ${orderId}? This action cannot be undone.`;
    } else if (currentStatus === 'PENDING') {
      newStatus = 'CANCELLED';
      confirmMessage = `Are you sure you want to cancel order ${orderId}?`;
    } else {
      alert(`Order ${orderId} cannot be refunded/cancelled as it is already ${currentStatus}.`);
      return;
    }

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/${adminSlug}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      // After mutation, trigger a full data refresh to keep everything consistent
      await refetchAllData();
    } catch (err: any) {
      setError(err.message || "Failed to update order status.");
      console.error("Update order status error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (orderId: string) => {
    // Use the data already loaded in the client state for the basic modal view
    const existingOrder = allData.find(o => o.id === orderId);

    // If you need *detailed* information not in the initial fetch, keep the API call:
    if (existingOrder && existingOrder.items) { // Check for existing item details
      setSelectedOrder(existingOrder);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Fetch detailed order data
      const response = await fetch(`${apiBaseUrl}/admin/${adminSlug}/orders/${orderId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSelectedOrder(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch order details.");
      console.error("Fetch order details error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
  };

  const handleExport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use the current client-side filters/search terms for the export request
      const query = new URLSearchParams({
        search: searchTerm,
        status: filterStatus,
        export: 'csv'
      }).toString();

      const response = await fetch(`${apiBaseUrl}/admin/${adminSlug}/orders?${query}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Handle Blob response for CSV
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders_${adminSlug}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      alert('Orders data exported successfully!');

    } catch (err: any) {
      setError(err.message || "Failed to export orders data.");
      console.error("Export error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-8 sm:p-12 font-sans relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-1000"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-3000"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="text-4xl sm:text-5xl font-black tracking-tighter text-white mb-4"
        >
          Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Orders</span>
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-300 mb-12"
        >
          Track and manage all customer orders and transactions.
        </motion.p>

        <div className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Search by order ID, customer name or email..."
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-2/3 justify-end">
              {/* Status Filter */}
              <select
                className="w-full sm:w-auto bg-gray-900 border border-gray-700 text-white py-3 px-4 rounded-lg focus:outline-none focus:bg-gray-700 focus:border-indigo-500 appearance-none pr-8"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="REFUNDED">Refunded</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              {/* Export Button */}
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                onClick={handleExport}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 w-full sm:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={orders.length === 0 || isLoading}
              >
                <ArrowDownTrayIcon className="w-5 h-5 mr-2" /> Export CSV
              </motion.button>

              {/* Manual Refresh Button */}
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                onClick={refetchAllData}
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 w-full sm:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
                title="Refresh All Data from Server"
              >
                <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''} mr-2`} /> Refresh
              </motion.button>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/50 text-red-300 border border-red-700 p-4 rounded-lg mb-6 flex items-center gap-3">
              <ExclamationCircleIcon className="w-6 h-6" />
              <p>{error}</p>
            </div>
          )}

          {isLoading && allData.length === 0 ? ( // Only show large spinner on initial load if no data exists
            <div className="text-center py-10">
              <ArrowPathIcon className="w-16 h-16 animate-spin text-indigo-500 mx-auto" />
              <p className="mt-4 text-xl text-gray-400">Loading orders...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider rounded-tl-lg">Order ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Customer</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-center text-gray-400 italic">
                        <div className="flex flex-col items-center justify-center py-8">
                          <ExclamationCircleIcon className="w-12 h-12 mb-4 text-gray-600" />
                          <p>No orders found matching your criteria.</p>
                          <p className="text-sm">Try adjusting your search or filters.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                  orders.length > 0 &&  orders.map((order, index) => (
                      <motion.tr
                        key={order.id}
                        variants={tableRowVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-700/50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{order.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{order.customerName} ({order.customerEmail})</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${order.totalPrice ? order.totalPrice.toFixed(2) : 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleViewDetails(order.id)}
                              className="text-indigo-400 hover:text-indigo-300 p-2 rounded-full hover:bg-gray-700/50 transition"
                              title="View Details"
                              disabled={isLoading}
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleRefundCancel(order.id, order.status)}
                              // Use COMPLETED/PENDING from props for comparison
                              className={`${(order.status === 'COMPLETED' || order.status === 'PENDING') ? 'text-red-400 hover:text-red-300' : 'text-gray-500 cursor-not-allowed'} p-2 rounded-full hover:bg-gray-700/50 transition`}
                              title={order.status === 'COMPLETED' ? "Refund Order" : order.status === 'PENDING' ? "Cancel Order" : "Action not available"}
                              disabled={!(order.status === 'COMPLETED' || order.status === 'PENDING') || isLoading}
                            >
                              <ArrowPathIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700 w-full max-w-lg"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Order Details: {selectedOrder.id}</h3>
              <div className="space-y-4 text-gray-300">
                <p><strong>Customer:</strong> {selectedOrder.customerName} ({selectedOrder.customerEmail})</p>
                <p><strong>Total:</strong> ${selectedOrder.totalPrice.toFixed(2)}</p>
                <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                <p><strong>Status:</strong> <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  selectedOrder.status === 'COMPLETED' ? 'bg-green-900/30 text-green-400' :
                  selectedOrder.status === 'PENDING' ? 'bg-yellow-900/30 text-yellow-400' :
                  'bg-red-900/30 text-red-400'
                }`}>{selectedOrder.status}</span></p>
                <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod || 'N/A'}</p>
                {selectedOrder.paymentTransactionId && <p><strong>Transaction ID:</strong> {selectedOrder.paymentTransactionId}</p>}
                <div>
                  <h4 className="text-lg font-semibold text-white mt-4 mb-2">Items:</h4>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {selectedOrder.items.map((item: any, idx: number) => (
                        <li key={idx}>{item.quantity}x {item.ticketType || 'Ticket'} for {item.eventName || 'Event'} (${item.price.toFixed(2)} each)</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="italic text-gray-400">No items in this order.</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end mt-8">
                <button
                  type="button"
                  onClick={handleCloseDetails}
                  className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors duration-300"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}