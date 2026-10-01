"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  EyeIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

export interface OrderItemData {
  id: string;
  name: string;
  quantity: number;
  price: number;
  totalPrice?: number;
}

export interface CustomerOrderData {
  id: string;
  orderNumber?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  totalPrice: number;
  status: string;
  paymentStatus?: string | null;
  createdAt: string;
  items?: OrderItemData[];
}

interface AgentOrdersClientProps {
  slug: string;
  currency: string;
  initialOrders: CustomerOrderData[];
}

export default function AgentOrdersClient({ slug, currency, initialOrders }: AgentOrdersClientProps) {
  const [orders, setOrders] = useState<CustomerOrderData[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [activeModalOrder, setActiveModalOrder] = useState<CustomerOrderData | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        !search ||
        (o.orderNumber && o.orderNumber.toLowerCase().includes(search.toLowerCase())) ||
        (o.customerName && o.customerName.toLowerCase().includes(search.toLowerCase())) ||
        o.id.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        selectedStatus === "ALL" || o.status.toUpperCase() === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, selectedStatus]);

  const statusCounts = useMemo(() => {
    const counts = { ALL: orders.length, PENDING: 0, COMPLETED: 0, CANCELLED: 0 };
    for (const o of orders) {
      const s = o.status.toUpperCase();
      if (s === "PENDING" || s === "PROCESSING") counts.PENDING++;
      else if (s === "COMPLETED" || s === "DELIVERED" || s === "PAID") counts.COMPLETED++;
      else if (s === "CANCELLED" || s === "DECLINED") counts.CANCELLED++;
    }
    return counts;
  }, [orders]);

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === "COMPLETED" || s === "DELIVERED" || s === "PAID") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
          <CheckCircleIcon className="w-3.5 h-3.5" />
          {status}
        </span>
      );
    }
    if (s === "PENDING" || s === "PROCESSING") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
          <ClockIcon className="w-3.5 h-3.5" />
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400">
        <XCircleIcon className="w-3.5 h-3.5" />
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Customer Orders</h1>
          <p className="text-sm text-slate-500">Track and inspect orders processed for this store.</p>
        </div>
        <Link
          href={`/agents/${slug}/pos`}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 transition-all"
        >
          <CreditCardIcon className="w-4 h-4" />
          <span>New Sale (POS)</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto overflow-x-auto">
          {(["ALL", "PENDING", "COMPLETED", "CANCELLED"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedStatus(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedStatus === tab
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab} ({statusCounts[tab] || 0})
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search order # or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <ShoppingCartIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-semibold">No orders match your filter criteria.</p>
            <p className="text-xs text-slate-500">Create new orders via the POS register.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-orange-600 dark:text-orange-400">
                      #{ord.orderNumber || ord.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-slate-100">
                      {ord.customerName || "Walk-in Customer"}
                      {ord.customerPhone && (
                        <div className="text-[11px] text-slate-400 font-normal">{ord.customerPhone}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(ord.createdAt).toLocaleDateString()}{" "}
                      <span className="text-[10px] text-slate-400">
                        {new Date(ord.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {currency} {ord.totalPrice.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(ord.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setActiveModalOrder(ord)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-orange-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View Details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {activeModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Order Details #{activeModalOrder.orderNumber || activeModalOrder.id.slice(-6).toUpperCase()}
                </h3>
                <p className="text-xs text-slate-400">
                  {new Date(activeModalOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setActiveModalOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer</span>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {activeModalOrder.customerName || "Walk-in Customer"}
                </p>
                {activeModalOrder.customerPhone && (
                  <p className="text-slate-500">{activeModalOrder.customerPhone}</p>
                )}
                {activeModalOrder.customerEmail && (
                  <p className="text-slate-500">{activeModalOrder.customerEmail}</p>
                )}
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                <span className="font-bold text-slate-500">Order Status:</span>
                <div>{getStatusBadge(activeModalOrder.status)}</div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                <span className="font-bold text-slate-500">Total Price:</span>
                <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                  {currency} {activeModalOrder.totalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActiveModalOrder(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
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
