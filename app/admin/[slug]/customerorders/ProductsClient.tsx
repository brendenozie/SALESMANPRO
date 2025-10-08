// app/admin/products/ProductsClient.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  TruckIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { MarketListingForm } from "@/types/typings";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";

// --- Type Definitions (Imported or defined from page.tsx) ---
interface RiderInfo {
  id: string;
  name: string;
}

export interface OrderItem {
  id: string;
  price: number;
  quantity: number;
  status?: string;
  marketplaceListing?: MarketListingForm | null;  
  riderId?: string; // Rider ID
  order?: {
    id: string;
    totalAmount?: number;
    status?: string;
    rider?: string; // Rider ID
    riderId?: string; // Rider ID
    createdAt?: string;
    name?: string;
    email?: string;
    phone?: string;
    consumer?: {
      name?: string;
    };
  };
}

interface ClientProps {
  initialOrderItems: OrderItem[];
  initialRiders: RiderInfo[]; // New prop for the list of riders
}

// ---------------------------------------------
// I. HELPER COMPONENTS
// ---------------------------------------------

const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
    // ... (no changes to this component)
    let Icon;
    let text = status || "UNKNOWN";
    let classes = "";

    switch (status) {
        case "COMPLETED":
            Icon = CheckCircleIcon;
            classes = "text-green-700 bg-green-100 border-green-300";
            break;
        case "PENDING":
            Icon = ClockIcon;
            classes = "text-yellow-700 bg-yellow-100 border-yellow-300";
            break;
        case "OUT_FOR_DELIVERY":
            Icon = TruckIcon;
            classes = "text-blue-700 bg-blue-100 border-blue-300";
            break;
        default:
            Icon = XMarkIcon;
            classes = "text-red-700 bg-red-100 border-red-300";
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 font-semibold rounded-full text-xs border ${classes}`}>
            <Icon className="w-4 h-4" />
            {text.replace(/_/g, ' ')}
        </span>
    );
};

// ---------------------------------------------
// II. MAIN COMPONENT & LOGIC
// ---------------------------------------------

export default function ProductsClient({ initialOrderItems, initialRiders }: ClientProps) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>(initialOrderItems);
  const [riders] = useState<RiderInfo[]>(initialRiders); // State for riders
  const [loading, setLoading] = useState<boolean>(false);
  const [error] = useState<string>(""); 
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  
  // Modal form state
  const [status, setStatus] = useState<string>("PENDING");
  const [riderId, setRiderId] = useState<string>(""); // Now explicitly rider ID
  
  const statusOptions = ["PENDING", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"];

  const updateOrder = async () => {
    if (!selectedOrder) return;
    setLoading(true);

    try {
        const res = await fetch(
            `${apiBaseUrl}/admin/orders/${selectedOrder?.id}?status=${encodeURIComponent(
                status
            )}&riderId=${encodeURIComponent(riderId)}`, // Send riderId
            { method: "PUT" }
        );
        
        const data = await res.json();
        
        if (!res.ok || !data.success) {
            throw new Error(data.message || "API update failed");
        }

        // Optimistically update UI
        setOrderItems((prev) =>
            prev.map((item) =>
                item.id === selectedOrder.id && item.order && item.order.id
                    ? {
                        ...item,
                        order: {
                            ...item.order,
                            id: item.order.id,
                            status,
                            rider: riderId, // Update the rider ID in the local state
                        },
                    }
                    : item
            ) as OrderItem[]
        );

        // toast.success("Order updated successfully!");
        closeModal();

    } catch (e) {
        console.error("Update failed:", e);
        // toast.error(`Failed to update order: ${(e as Error).message}`);
    } finally {
        setLoading(false);
    }
  };
    
  const openModal = (item: OrderItem) => {
    setSelectedOrder(item);
    setStatus(item.order?.status || "PENDING");
    setRiderId(item.riderId || item.order?.rider || item.order?.riderId || ""); // Set initial rider ID from the order data
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setStatus("PENDING");
    setRiderId("");
  };

  const summary = useMemo(() => {

    const totalOrders = orderItems.length;
    const pending = orderItems.filter(item => item.order?.status === 'PENDING').length;
    const totalRevenue = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return { totalOrders, pending, totalRevenue };
  }, [orderItems]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      
      <header className="max-w-7xl mx-auto mb-10 border-b border-gray-200 pb-6">
        <h1 className="text-4xl font-extrabold text-gray-900 leading-tight flex items-center gap-3">
          Order Fulfillment Dashboard <TruckIcon className="h-8 w-8 text-indigo-600" />
        </h1>
        <p className="text-lg text-gray-500 mt-1">
          Monitor and update real-time fulfillment status and assignments.
        </p>
      </header>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 bg-white rounded-xl shadow-lg border-l-4 border-indigo-500">
          <p className="text-sm text-gray-500 font-medium flex items-center"><ShoppingCartIcon className="w-4 h-4 mr-1"/> Total Order Items</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{summary.totalOrders}</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-lg border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500 font-medium flex items-center"><ClockIcon className="w-4 h-4 mr-1"/> Items Pending</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{summary.pending}</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-lg border-l-4 border-green-500">
          <p className="text-sm text-gray-500 font-medium flex items-center"><CurrencyDollarIcon className="w-4 h-4 mr-1"/> Total Value</p>
          <p className="text-3xl font-bold text-green-600 mt-1">${summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
      </div>
      
      {/* ... (MAIN CONTENT / LIST is unchanged) ... */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
            <div className="flex justify-center items-center h-64">
                <div className="text-indigo-600 text-lg font-semibold flex items-center gap-2">
                    <ArrowPathIcon className="w-6 h-6 animate-spin"/> Loading Order Items...
                </div>
            </div>
        ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg text-center">{error}</div>
        ) : orderItems.length === 0 ? (
            <div className="bg-white p-16 rounded-xl shadow-xl border-2 border-dashed border-gray-300 text-center">
                <ShoppingCartIcon className="w-10 h-10 text-gray-400 mx-auto mb-4"/>
                <p className="text-xl font-semibold text-gray-700">No active order items found.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orderItems.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white shadow-xl rounded-2xl p-6 border-t-4 border-indigo-400 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl cursor-pointer"
                        onClick={() => openModal(item)}
                    >
                        {/* Status Badge & Title */}
                        <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
                            <h2 className="text-xl font-extrabold text-gray-900 leading-tight">
                                {item.marketplaceListing?.name || "Unknown Product"}
                            </h2>
                            <StatusBadge status={item.order?.status} />
                        </div>
                        
                        {/* Details */}
                        <div className="space-y-2 text-sm text-gray-600">
                            <p className="flex justify-between items-center">
                                <span className="font-medium flex items-center"><UsersIcon className="w-4 h-4 mr-1 text-indigo-400"/> Customer:</span>
                                <span className="text-gray-800 font-semibold">{item.order?.consumer?.name || item.order?.name || "N/A"}</span>
                            </p>
                            <p className="flex justify-between items-center">
                                <span className="font-medium flex items-center"><ShoppingCartIcon className="w-4 h-4 mr-1 text-indigo-400"/> Quantity:</span>
                                <span className="text-gray-800 font-semibold">{item.quantity}</span>
                            </p>
                            <p className="flex justify-between items-center text-base font-bold border-t border-gray-100 pt-2 mt-2">
                                <span>Total Price:</span>
                                <span className="text-green-600">${ (item.price * item.quantity).toFixed(2) }</span>
                            </p>
                            <p className="text-xs text-gray-400 pt-1 flex items-center justify-end">
                                <CalendarDaysIcon className="w-3 h-3 mr-1"/>
                                Ordered: {item.order?.createdAt ? new Date(item.order.createdAt).toLocaleDateString() : "N/A"}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>


      {/* MODAL (Updated with Rider Dropdown) */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg text-gray-900 shadow-2xl relative">
            
            <div className="flex justify-between items-start border-b border-gray-200 pb-3 mb-5">
                <h2 className="text-2xl font-extrabold text-indigo-600">Fulfillment Update</h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 transition">
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>
            
            <div className="bg-indigo-50 p-4 rounded-xl mb-6 border border-indigo-200">
                 <p className="text-lg font-bold mb-2">
                    {selectedOrder.marketplaceListing?.name || "Product Details"}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><strong>Customer:</strong> {selectedOrder.order?.consumer?.name || selectedOrder.order?.name}</p>
                    <p><strong>Quantity:</strong> {selectedOrder.quantity}</p>
                    <p className="col-span-2"><strong>Total:</strong> <span className="text-green-600 font-bold">${(selectedOrder.price * selectedOrder.quantity).toFixed(2)}</span></p>
                </div>
            </div>

            <div className="mt-4 space-y-5">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Update Status
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition cursor-pointer"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {statusOptions.map(opt => (<option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 top-6 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>

              {/************************************/}
              {/* ***** UPDATED RIDER SELECT ***** */}
              {/************************************/}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign Rider
                </label>
                <div className="relative">
                    <UserCircleIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        value={riderId}
                        onChange={(e) => setRiderId(e.target.value)}
                    >
                        <option value="">-- Unassigned --</option>
                        {riders.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              {/* ... (no changes to action buttons) ... */}
              <button
                onClick={closeModal}
                className="px-5 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={updateOrder}
                disabled={loading}
                className="flex items-center gap-1 px-5 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-400"
              >
                {loading ? (
                    <>
                        <ArrowPathIcon className="w-5 h-5 animate-spin"/> Updating...
                    </>
                ) : (
                    <>
                        <CheckCircleIcon className="w-5 h-5"/> Save Changes
                    </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}