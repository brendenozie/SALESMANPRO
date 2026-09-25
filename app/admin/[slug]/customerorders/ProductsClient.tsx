// app/admin/products/ProductsClient.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { 
  MagnifyingGlassIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CalendarIcon,
  UserIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ClockIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function ProductsClient({ initialOrders, initialRiders, pagination, revenue, companyId }:any) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [bulkRiderId, setBulkRiderId] = useState("");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [orders, setOrders] = useState(initialOrders);

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync with Server Props
  useEffect(() => { setOrders(initialOrders); }, [initialOrders]);

  const handleUpdateStatus = async (orderId: string,itemId: string, newStatus: string, riderId?: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(
        `/api/admin/orders/${orderId}/order-items/${itemId}?status=${newStatus}&companyId=${companyId}${riderId ? `&riderId=${riderId}` : ""}`,
        { method: "PUT" }
      );
      
      if (res.ok) {
        toast.success("Order updated successfully");
        router.refresh(); // Triggers Server Component to re-fetch and clear cache
        setSelectedOrder(null);
      } else {
        toast.error("Failed to update order");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchTerm) params.set("search", searchTerm);
    else params.delete("search");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const changePage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleBulkUpdate = async (newStatus: string) => {
    if (!selectedOrder) return;
    setIsUpdating(true);

    try {
      // Calling the refactored API with the Order ID
      const res = await fetch(
        `/api/admin/orders/${selectedOrder.id}?status=${newStatus}&companyId=${companyId}&riderId=${bulkRiderId}`,
        { method: "PUT" }
      );

      if (res.ok) {
        toast.success(`Whole order set to ${newStatus}`);
        router.refresh();
        setSelectedOrder(null);
        setBulkRiderId(""); // Reset
      } else {
        toast.error("Bulk update failed");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  const currentStatus = searchParams.get("status") || "ALL";

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status === "ALL") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return "bg-green-100 text-green-700 border-green-200";
      case "PAID":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "CANCELLED":
        return "bg-rose-100 text-rose-700 border-rose-200";
      case "SHIPPED":
      case "OUT_FOR_DELIVERY":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      {/* 1. TOP STATS SECTION */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl">
            <CurrencyDollarIcon className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">${revenue.total.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-xl">
            <ClockIcon className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending Payouts</p>
            <p className="text-2xl font-bold text-gray-900">${revenue.pending.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-xl">
            <ShoppingBagIcon className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{pagination.totalItems}</p>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & CONTROLS */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {["ALL", "PENDING", "PAID", "COMPLETED", "CANCELLED"].map((s) => (
            <button
              key={s}
              onClick={() => handleStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                currentStatus.toUpperCase() === s
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="relative max-w-md w-full">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders, customers, tracking..."
            className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
      </div>

      {/* 3. ORDER LIST */}
      <div className="max-w-7xl mx-auto space-y-6">
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <ShoppingBagIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No orders found for this selection.</p>
          </div>
        ) : (
          orders.map((order: any) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              {/* Order Header */}
              <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center border border-gray-200 font-bold text-gray-700">
                    #{order.id.slice(-4).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-gray-900">{order.name || "Customer"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusBadge(order.status)}`}>
                    {order.status}
                  </span>
                  <button onClick={() => setSelectedOrder(order)} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 px-4 py-2 bg-indigo-50 rounded-lg transition-colors">
                    Manage Order
                  </button>
                </div>
              </div>

              {/* Nested Items Table */}
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white text-xs uppercase text-gray-400 font-semibold">
                    <tr>
                      <th className="px-6 py-3">Product Details</th>
                      <th className="px-6 py-3 text-center">Qty</th>
                      <th className="px-6 py-3 text-right">Unit Price</th>
                      <th className="px-6 py-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(order.items || []).map((item: any) => (
                      <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                               <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-400">
                                  <ShoppingBagIcon className="w-6 h-6" />
                               </div>
                            </div>
                            <span className="font-medium text-gray-800">{item.marketplaceListing?.name || item.name || "Item"}</span>
                            <span className="text-xs text-gray-400">
                              {item.selectedOptions && item.selectedOptions.length > 0 ? (
                                <span>
                                  {item.selectedOptions.map((option: any, idx: number) => (
                                    <span key={idx} className="inline-block bg-gray-200 text-gray-600 px-2 py-1 rounded-md mr-2">
                                      {option.name}
                                    </span>
                                  ))}
                                </span>
                              ) : null}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-gray-600">x{item.quantity}</td>
                        <td className="px-6 py-4 text-right text-gray-600">${item.price.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                          ${(item.price * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50/30">
                    <tr>
                      <td colSpan={3} className="px-6 py-3 text-right text-sm text-gray-500 font-medium">Order Payout:</td>
                      <td className="px-6 py-3 text-right font-black text-lg text-indigo-600">
                        ${order.items.reduce((acc:any, item:any) => acc + (item.price * item.quantity), 0).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. PAGINATION CONTROLS */}
      {pagination.totalPages > 1 && (
        <div className="max-w-7xl mx-auto mt-12 flex items-center justify-center gap-2 pb-10">
          <button
            onClick={() => changePage(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="p-2 rounded-xl bg-white border border-gray-200 disabled:opacity-30 shadow-sm hover:bg-gray-50 transition-all"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          
          <div className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-bold text-gray-700">
            {pagination.currentPage} / {pagination.totalPages}
          </div>

          <button
            onClick={() => changePage(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="p-2 rounded-xl bg-white border border-gray-200 disabled:opacity-30 shadow-sm hover:bg-gray-50 transition-all"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </div>
      )}


      {/* 4. MANAGEMENT MODAL */}
      {selectedOrder && (
       <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl max-h-[calc(100vh-2rem)] rounded-3xl shadow-2xl overflow-hidden border border-white/20 flex flex-col">
            
            {/* Header - Stays fixed at the top */}
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Manage Order #{selectedOrder.id.slice(-4)}</h2>
                <p className="text-sm text-gray-500">Customer: {selectedOrder.name}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Form Body - This section will now scroll independently if content overflows */}
            <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
              {/* --- BULK UPDATE SECTION WITH RIDER --- */}
              <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-4">
                <div>
                  <label className="block text-xs font-black text-indigo-600 uppercase tracking-widest mb-3">
                    1. Assign Rider to all items (Optional)
                  </label>
                  <select 
                    className="w-full bg-white text-sm border-gray-200 rounded-xl focus:ring-indigo-500 py-3 px-4 shadow-sm"
                    value={bulkRiderId}
                    onChange={(e) => setBulkRiderId(e.target.value)}
                  >
                    <option value="">No Rider Assigned</option>
                    {initialRiders.map((r: any) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-indigo-600 uppercase tracking-widest mb-3">
                    2. Set Order & Items Status
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {['PENDING', 'PAID', 'COMPLETED', 'CANCELLED'].map((s) => (
                      <button
                        key={s}
                        disabled={isUpdating}
                        onClick={() => handleBulkUpdate(s)}
                        className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${
                          selectedOrder.status === s
                            ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                            : "bg-white text-gray-600 hover:bg-gray-100 hover:shadow-md"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Individual Item List */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Individual Items</h3>
                {(selectedOrder.items || []).map((item: any) => (
                  <div key={item.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                        <ShoppingBagIcon className="w-6 h-6 text-indigo-500" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{item.marketplaceListing?.name || item.name || "Item"}</p>
                        <p className="text-xs text-gray-500">Price: ${item.price}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Rider Selection */}
                      <select 
                        className="text-sm border-gray-200 rounded-xl focus:ring-indigo-500 py-2 pl-3 pr-8"
                        defaultValue={item.riderId || ""}
                        onChange={(e) => item.tempRider = e.target.value}
                      >
                        <option value="">Assign Rider</option>
                        {initialRiders.map((r: any) => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>

                      {/* Status Update Buttons */}
                      <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                        {['PENDING', 'PAID', 'COMPLETED', 'CANCELLED'].map((s) => (
                          <button
                            key={s}
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(selectedOrder.id, item.id, s, item.tempRider)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                              selectedOrder.status === s 
                                ? "bg-indigo-600 text-white shadow-md scale-105" 
                                : "text-gray-400 hover:text-gray-600"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer - Stays fixed at the bottom */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}