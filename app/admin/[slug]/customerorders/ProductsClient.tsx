// app/admin/products/ProductsClient.tsx

"use client";

import React, { useState } from "react";
import { CheckCircleIcon, ClockIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { OrderItem } from "./page";

interface ClientProps {
  initialOrderItems: OrderItem[];
}

export default function ProductsClient({ initialOrderItems }: ClientProps) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>(initialOrderItems);
  const [loading] = useState<boolean>(false);
  const [error] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [status, setStatus] = useState<string>("");
  const [rider, setRider] = useState<string>("");

  const openModal = (item: OrderItem) => {
    setSelectedOrder(item);
    setStatus(item.order?.status || "");
    setRider(item.order?.rider || "");
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setStatus("");
    setRider("");
  };

  const updateOrder = () => {
    // In a real app, you would send a PUT/POST here. For now, just show an alert.
    alert(`Status updated to: ${status}\nRider assigned: ${rider}`);
    closeModal();
  };

  const getStatusBadge = (st?: string) => {
    switch (st) {
      case "COMPLETED":
        return (
          <span className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">
            <CheckCircleIcon className="w-4 h-4" /> Completed
          </span>
        );
      case "PENDING":
        return (
          <span className="flex items-center gap-1 text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs">
            <ClockIcon className="w-4 h-4" /> Pending
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs">
            <XMarkIcon className="w-4 h-4" /> Failed
          </span>
        );
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-extrabold text-center mb-10 text-white">Order Items</h1>

      {/* Loading & Error States */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-300 text-lg font-semibold animate-pulse">Loading...</div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-red-400 text-lg font-semibold">{error}</div>
        </div>
      ) : orderItems.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-400 text-lg font-semibold">No order items found.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orderItems.map((item) => (
            <div
              key={item.id}
              className="bg-white shadow-lg rounded-xl p-6 text-black transition-transform transform hover:scale-105 cursor-pointer"
              onClick={() => openModal(item)}
            >
              <h2 className="text-xl font-bold mb-2">
                {item.marketplaceListing?.title || "N/A"}
              </h2>
              <p className="text-gray-600 mb-1">
                <strong>Customer:</strong>{" "}
                {item.order?.consumer?.name || "N/A"}
              </p>
              <p className="text-gray-600 mb-1">
                <strong>Quantity:</strong> {item.quantity}
              </p>
              <p className="text-gray-800 font-medium mb-1">
                <strong>Total:</strong> ${ (item.price * item.quantity).toFixed(2) }
              </p>
              <p className="my-2">{getStatusBadge(item.order?.status)}</p>
              <p className="text-gray-500 text-sm">
                Ordered on:{" "}
                {item.order?.createdAt
                  ? new Date(item.order.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg text-black">
            <h2 className="text-2xl font-bold mb-4">Order Details</h2>
            <p className="mb-2">
              <strong>Product:</strong>{" "}
              {selectedOrder.marketplaceListing?.title}
            </p>
            <p className="mb-2">
              <strong>Customer:</strong>{" "}
              {selectedOrder.order?.consumer?.name}
            </p>
            <p className="mb-2">
              <strong>Quantity:</strong> {selectedOrder.quantity}
            </p>
            <p className="mb-4">
              <strong>Total:</strong> $
              {(selectedOrder.price * selectedOrder.quantity).toFixed(2)}
            </p>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Update Status
              </label>
              <select
                className="w-full p-2 border rounded-lg mt-1"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Assign Rider
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg mt-1"
                placeholder="Enter rider name or ID"
                value={rider}
                onChange={(e) => setRider(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={closeModal}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={updateOrder}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
