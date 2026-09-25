"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { CustomerOrder } from "./page";
import Modal from "@/components/Modal";
import {
  CurrencyDollarIcon,
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  ShoppingBagIcon
} from "@heroicons/react/24/outline";
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface ClientProps {
  ordersData: CustomerOrder[];
  companyId: string;
  initialError: string | null;
}

const OrdersClient: React.FC<ClientProps> = ({ ordersData: initialOrdersData, companyId, initialError }) => {
  const [ordersData, setOrdersData] = useState<CustomerOrder[]>(initialOrdersData);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const itemsPerPage = 8;

  const refreshOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/customer-orders?companyId=${companyId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      const list = json?.data?.data || json?.data?.orders || json?.data || [];
      setOrdersData(Array.isArray(list) ? list : []);
      toast.success("Sync Complete");
    } catch (err) {
      toast.error("Sync Failed");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const handleOrderUpdated = useCallback((updatedOrder: CustomerOrder) => {
    setOrdersData(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    setSelectedOrder(updatedOrder);
  }, []);

  const filteredOrders = useMemo(() => {
    return ordersData.filter(order => {
      const matchesStatus = activeStatusFilter === "All" || order.status === activeStatusFilter;
      const matchesSearch = !searchTerm || [order.name, order.email, order.id].some(field => 
        field?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return matchesStatus && matchesSearch;
    });
  }, [ordersData, activeStatusFilter, searchTerm]);

  const stats = useMemo(() => ({
    total: ordersData.length,
    revenue: ordersData.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
    pending: ordersData.filter(o => o.status === 'PENDING').length,
    completed: ordersData.filter(o => o.status === 'COMPLETED' || (o.status as string) === 'PAID').length,
  }), [ordersData]);

  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 p-4 lg:p-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Responsive Header */}
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
              <span className="p-3 bg-emerald-500/10 dark:bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                <ShoppingBagIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </span>
              Orders <span className="text-emerald-600 dark:text-emerald-400">HQ</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Real-time commerce monitoring and fulfillment.</p>
          </div>
          <button 
            onClick={refreshOrders}
            className="group flex items-center gap-2 px-6 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-emerald-500 rounded-2xl transition-all shadow-sm dark:shadow-none"
          >
            <ArrowPathIcon className={`h-5 w-5 text-emerald-600 dark:text-emerald-400 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            <span className="font-bold text-sm tracking-wide">SYNC DATA</span>
          </button>
        </header>

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatBox title="Revenue" value={`$${stats.revenue.toLocaleString()}`} icon={CurrencyDollarIcon} color="text-emerald-600 dark:text-emerald-400" glow="shadow-emerald-500/10" />
          <StatBox title="Active Orders" value={stats.total} icon={ShoppingBagIcon} color="text-blue-600 dark:text-blue-400" glow="shadow-blue-500/10" />
          <StatBox title="Awaiting" value={stats.pending} icon={ClockIcon} color="text-amber-600 dark:text-amber-400" glow="shadow-amber-500/10" />
          <StatBox title="Success Rate" value={`${((stats.completed/stats.total || 0)*100).toFixed(0)}%`} icon={CheckCircleIcon} color="text-purple-600 dark:text-purple-400" glow="shadow-purple-500/10" />
        </div>

        {/* Command Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-3xl mb-8 flex flex-col lg:flex-row gap-2 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="relative flex-grow">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter by customer, ID or email..."
              className="w-full bg-transparent border-none focus:ring-0 pl-12 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex overflow-x-auto gap-1 p-1 no-scrollbar">
            {['All', 'PENDING', 'PAID', 'COMPLETED', 'SHIPPED', 'CANCELLED'].map((s) => (
              <button
                key={s}
                onClick={() => setActiveStatusFilter(s)}
                className={`px-6 py-3 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${
                  activeStatusFilter === s 
                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Order Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {paginatedOrders.map(order => (
            <OrderTile 
              key={order.id} 
              order={order} 
              companyId={companyId}
            />
          ))}
        </div>

        {/* Custom Pagination */}
        <footer className="mt-12 flex justify-center items-center gap-8 pb-10">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-20 hover:border-emerald-500 transition-colors shadow-sm"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{currentPage}</span>
              <span className="text-slate-400 font-bold">/ {totalPages}</span>
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-20 hover:border-emerald-500 transition-colors shadow-sm"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
        </footer>
      </div>

      <Modal isOpen={isOrderDetailsModalOpen} onClose={() => setIsOrderDetailsModalOpen(false)} title="">
        {selectedOrder && (
          <OrderInspector
            order={selectedOrder}
            onOrderUpdated={handleOrderUpdated}
          />
        )}
      </Modal>
    </div>
  );
};

// --- Sub-components ---

const StatBox = ({ title, value, icon: Icon, color, glow }: any) => (
  <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-lg dark:shadow-xl ${glow} transition-transform hover:-translate-y-1`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black text-slate-900 dark:text-white">{value}</p>
      </div>
      <Icon className={`h-8 w-8 ${color} opacity-60 dark:opacity-40`} />
    </div>
  </div>
);

const OrderTile = ({ order, companyId }: { order: CustomerOrder; companyId: string }) => {
  const statusConfig: any = {
    PENDING: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-400/10', border: 'border-amber-200 dark:border-amber-400/20', icon: ClockIcon },
    PROCESSING: { color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-400/10', border: 'border-sky-200 dark:border-sky-400/20', icon: ClockIcon },
    COMPLETED: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-400/10', border: 'border-emerald-200 dark:border-emerald-400/20', icon: CheckCircleIcon },
    CANCELLED: { color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-400/10', border: 'border-rose-200 dark:border-rose-400/20', icon: XCircleIcon },
    SHIPPED: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-400/10', border: 'border-blue-200 dark:border-blue-400/20', icon: TruckIcon },
    OUT_FOR_DELIVERY: { color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-400/10', border: 'border-indigo-200 dark:border-indigo-400/20', icon: TruckIcon },
  };

  const config = statusConfig[order.status] || statusConfig.PENDING;

  return (
    <Link 
      href={`/admin/${companyId}/orders/${order.id}`}
      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2.5rem] shadow-lg hover:shadow-xl hover:border-emerald-500/50 transition-all cursor-pointer relative overflow-hidden block"
    >
      <div className="flex justify-between items-start mb-6">
        <div className={`px-4 py-2 rounded-2xl border ${config.bg} ${config.border} flex items-center gap-2`}>
          <config.icon className={`h-4 w-4 ${config.color}`} />
          <span className={`text-[10px] font-black uppercase tracking-tighter ${config.color}`}>{order.status}</span>
        </div>
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{new Date(order.createdAt).toLocaleDateString()}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors uppercase truncate">
          {order.name || 'Anonymous Client'}
        </h3>
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1">ID: #{order.id.slice(-8).toUpperCase()}</p>
      </div>

      <div className="flex items-end justify-between border-t border-slate-100 dark:border-slate-800 pt-6">
        <div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">Total Amount</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">${order.totalPrice.toFixed(2)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline">Open Order &rarr;</span>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-400 group-hover:bg-emerald-600 dark:group-hover:bg-emerald-500 group-hover:text-white transition-all">
            <EyeIcon className="h-6 w-6" />
          </div>
        </div>
      </div>
    </Link>
  );
};

const OrderInspector = ({ order, onOrderUpdated }: { order: CustomerOrder; onOrderUpdated?: (o: CustomerOrder) => void }) => {
  const [updating, setUpdating] = useState<boolean>(false);

  const handleStatusTransition = async (newStatus: string) => {
    if (updating) return;
    setUpdating(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/customer-orders`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to update order status");
      }
      toast.success(`Order marked as ${newStatus}`);
      if (onOrderUpdated && json.data) {
        onOrderUpdated(json.data);
      }
    } catch (err: any) {
      toast.error(err.message || "Status update failed");
    } finally {
      setUpdating(false);
    }
  };

  const shippingInfo = order.shippingAddress ? (
    typeof order.shippingAddress === 'string' 
      ? order.shippingAddress 
      : `${(order.shippingAddress as any).street || ''}, ${(order.shippingAddress as any).city || ''} ${(order.shippingAddress as any).zip || ''}`
  ) : null;

  return (
    <div className="p-2 text-slate-900 dark:text-slate-200">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-16 w-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center">
          <SparklesIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Order Insight</h2>
          <p className="text-slate-500 font-bold">Meticulous breakdown of transaction #{order.id.slice(-8).toUpperCase()}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Status Transition Bar */}
        <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-3xl border border-slate-200 dark:border-white/5">
          <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase mb-3">Lifecycle & Fulfillment Actions</p>
          <div className="flex flex-wrap gap-2">
            {['PENDING', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                disabled={updating || order.status === st}
                onClick={() => handleStatusTransition(st)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  order.status === st
                    ? 'bg-emerald-600 text-white font-black cursor-default'
                    : 'bg-white dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10'
                } disabled:opacity-50`}
              >
                {st === order.status ? `✓ ${st}` : `Mark ${st}`}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-3xl border border-slate-200 dark:border-white/5">
          <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase mb-4">Line Items</p>
          <div className="space-y-4">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white uppercase text-sm">{item.marketplaceListing?.name || 'Item'}</p>
                  <p className="text-xs text-slate-500">{item.quantity} Unit(s) @ ${item.price}</p>
                </div>
                <p className="font-black text-emerald-600 dark:text-emerald-400">${(item.quantity * item.price).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-3xl border border-slate-200 dark:border-white/5">
            <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase mb-1">Customer</p>
            <p className="font-bold text-slate-900 dark:text-white truncate">{order.name || 'Anonymous Client'}</p>
            {order.email && <p className="text-xs text-slate-500 truncate">{order.email}</p>}
            {order.phone && <p className="text-xs text-slate-500">{order.phone}</p>}
          </div>
          <div className="bg-emerald-600 dark:bg-emerald-500 p-6 rounded-3xl">
            <p className="text-xs font-black text-emerald-100/50 dark:text-emerald-900/50 uppercase mb-1">Grand Total</p>
            <p className="text-2xl font-black text-white dark:text-emerald-950">${order.totalPrice.toFixed(2)}</p>
            <p className="text-xs font-bold text-emerald-100 dark:text-emerald-900 mt-1">Source: {order.orderSource || 'WEBSITE'}</p>
          </div>
        </div>

        {(shippingInfo || order.delivery) && (
          <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-3xl border border-slate-200 dark:border-white/5">
            <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase mb-1">Fulfillment & Shipping</p>
            {shippingInfo && <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">Address: {shippingInfo}</p>}
            {order.deliveryStatus && <p className="text-xs text-slate-500">Status: {order.deliveryStatus}</p>}
            {order.estimatedArrival && <p className="text-xs text-slate-500">ETA: {new Date(order.estimatedArrival).toLocaleDateString()}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersClient;