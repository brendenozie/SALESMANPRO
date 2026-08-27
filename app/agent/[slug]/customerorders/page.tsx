"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import UserNav from "@/components/AdminNav";
import UserLayout from "@/components/UserLayout";
import {
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const ProductsPage = () => {
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [rider, setRider] = useState("");
  const url = process.env.NEXT_PUBLIC_API_URL;

  // --- Fetch Orders ---
  useEffect(() => {
    const fetchOrderItems = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${url}/clients/orders?sellerId=63f7c9e2d91b1b2a5e80b007`
        );
        if (!response.ok) throw new Error("Failed to fetch order items");
        const data = await response.json();
        setOrderItems(data.orderItems || []);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchOrderItems();
  }, [url]);

  // --- Helpers ---
  const openModal = (order: any) => {
    setSelectedOrder(order);
    setStatus(order.order?.status || "");
    setRider(order.order?.rider || "");
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setStatus("");
    setRider("");
  };

  const updateOrder = async () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1200)), // simulate delay
      {
        loading: "Updating order...",
        success: `Status updated to "${status}" — Rider: ${rider}`,
        error: "Failed to update order",
      }
    );
    closeModal();
  };

  const getStatusBadge = (status: string) => {
    const badgeStyles: Record<string, string> = {
      COMPLETED:
        "bg-gradient-to-r from-green-400 to-green-600 text-white border-none",
      PENDING:
        "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-none",
      FAILED:
        "bg-gradient-to-r from-red-400 to-red-600 text-white border-none",
    };

    const icons: Record<string, JSX.Element> = {
      COMPLETED: <CheckCircleIcon className="w-4 h-4" />,
      PENDING: <ClockIcon className="w-4 h-4" />,
      FAILED: <XMarkIcon className="w-4 h-4" />,
    };

    const label =
      status === "COMPLETED"
        ? "Completed"
        : status === "PENDING"
        ? "Pending"
        : "Failed";

    return (
      <span
        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badgeStyles[status] || badgeStyles.FAILED}`}
      >
        {icons[status] || icons.FAILED} {label}
      </span>
    );
  };

  return (
    <UserLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white w-full relative overflow-hidden">
        <UserNav />
        <Toaster position="top-right" />
        <div className="container mx-auto py-10 px-4">
          <h1 className="text-4xl font-extrabold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
            Order Items
          </h1>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-300 text-lg font-semibold animate-pulse">
                Loading...
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-red-400 text-lg font-semibold">{error}</div>
            </div>
          ) : orderItems.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-400 text-lg font-semibold">
                No order items found.
              </div>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {orderItems.map((item: any) => (
                <motion.div
                  key={item.id}
                  layout
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gray-800/60 border border-gray-700 shadow-xl rounded-2xl p-6 cursor-pointer backdrop-blur-sm transition"
                  onClick={() => openModal(item)}
                >
                  <h2 className="text-xl font-bold text-indigo-300 mb-2">
                    {item.marketplaceListing?.title || "N/A"}
                  </h2>
                  <p className="text-gray-300">
                    <strong>Customer:</strong>{" "}
                    {item.order?.consumer?.name || "N/A"}
                  </p>
                  <p className="text-gray-300">
                    <strong>Quantity:</strong> {item.quantity}
                  </p>
                  <p className="text-gray-100 font-semibold">
                    <strong>Total:</strong> $
                    {(item.price * item.quantity).toFixed(2)}
                  </p>
                  <div className="my-3">{getStatusBadge(item.order?.status)}</div>
                  <p className="text-gray-500 text-sm">
                    Ordered on:{" "}
                    {item.order?.createdAt
                      ? new Date(item.order.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* --- Modal --- */}
          <AnimatePresence>
            {selectedOrder && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-2xl p-6 w-full max-w-lg text-gray-900 shadow-2xl"
                >
                  <h2 className="text-2xl font-bold mb-4 text-indigo-600">
                    Order Details
                  </h2>
                  <div className="space-y-2">
                    <p>
                      <strong>Product:</strong>{" "}
                      {selectedOrder.marketplaceListing?.title}
                    </p>
                    <p>
                      <strong>Customer:</strong>{" "}
                      {selectedOrder.order?.consumer?.name}
                    </p>
                    <p>
                      <strong>Quantity:</strong> {selectedOrder.quantity}
                    </p>
                    <p>
                      <strong>Total:</strong> $
                      {(selectedOrder.price * selectedOrder.quantity).toFixed(2)}
                    </p>
                  </div>

                  <div className="mt-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Update Status
                    </label>
                    <select
                      className="w-full p-2 border rounded-lg bg-gray-100 focus:ring-2 focus:ring-indigo-500"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assign Rider
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg bg-gray-100 focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter rider name or ID"
                      value={rider}
                      onChange={(e) => setRider(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      onClick={closeModal}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={updateOrder}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
                    >
                      Update
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </UserLayout>
  );
};

export default ProductsPage;
