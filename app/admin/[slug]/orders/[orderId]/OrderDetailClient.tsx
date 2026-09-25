"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  PrinterIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  UserCircleIcon,
  ShoppingBagIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  BanknotesIcon,
  DocumentTextIcon,
  SparklesIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export interface OrderItemDetail {
  id: string;
  quantity: number;
  price: number;
  totalPrice?: number;
  serviceNotes?: string | null;
  date?: string | null;
  timeSlot?: string | null;
  selectedOptions?: any;
  marketplaceListing?: {
    id?: string;
    name?: string;
    images?: { url: string }[] | string[] | any;
    finalPrice?: number | null;
  } | null;
}

export interface CustomerOrderDetail {
  id: string;
  companyId?: string | null;
  consumerId?: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  paymentStatus?: string | null;
  paymentMethod?: string | null;
  paymentOption?: string | null;
  orderSource?: string | null;
  delivery?: boolean | null;
  deliveryStatus?: string | null;
  deliveryFee?: number | null;
  trackingNumber?: string | null;
  estimatedArrival?: string | null;
  deliveryPersonName?: string | null;
  deliveryPersonContact?: string | null;
  shippingAddress?: any;
  billingAddress?: any;
  notes?: string | null;
  specialInstructions?: string | null;
  totalPrice: number;
  totalDiscount?: number | null;
  totalTax?: number | null;
  totalShipping?: number | null;
  totalFinalPrice?: number | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDetail[];
}

export interface DriverStaff {
  id: string;
  name: string;
  phone?: string;
  role?: string;
}

interface OrderDetailClientProps {
  order: CustomerOrderDetail;
  slug: string;
  currency?: string;
  companyName?: string;
  companyPhone?: string;
  companyAddress?: string;
  drivers?: DriverStaff[];
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  PENDING: {
    label: "Pending",
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500/20",
    icon: ClockIcon,
  },
  PROCESSING: {
    label: "Processing",
    bg: "bg-sky-500/10",
    text: "text-sky-500",
    border: "border-sky-500/20",
    icon: ArrowPathIcon,
  },
  SHIPPED: {
    label: "Shipped",
    bg: "bg-blue-500/10",
    text: "text-blue-500",
    border: "border-blue-500/20",
    icon: TruckIcon,
  },
  OUT_FOR_DELIVERY: {
    label: "Out For Delivery",
    bg: "bg-indigo-500/10",
    text: "text-indigo-500",
    border: "border-indigo-500/20",
    icon: TruckIcon,
  },
  COMPLETED: {
    label: "Completed",
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/20",
    icon: CheckCircleIcon,
  },
  PAID: {
    label: "Paid",
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/20",
    icon: CheckCircleIcon,
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-rose-500/10",
    text: "text-rose-500",
    border: "border-rose-500/20",
    icon: XCircleIcon,
  },
  FAILED: {
    label: "Failed",
    bg: "bg-rose-500/10",
    text: "text-rose-500",
    border: "border-rose-500/20",
    icon: ExclamationCircleIcon,
  },
};

export default function OrderDetailClient({
  order: initialOrder,
  slug,
  currency = "KES",
  companyName = "Store HQ",
  companyPhone = "+254 700 000 000",
  companyAddress = "Nairobi, Kenya",
  drivers = [],
}: OrderDetailClientProps) {
  const router = useRouter();
  const [order, setOrder] = useState<CustomerOrderDetail>(initialOrder);
  const [updating, setUpdating] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>(initialOrder.notes || "");
  const [savingNotes, setSavingNotes] = useState<boolean>(false);
  const [deliveryStatus, setDeliveryStatus] = useState<string>(initialOrder.deliveryStatus || "Pending");
  const [trackingNumber, setTrackingNumber] = useState<string>(initialOrder.trackingNumber || "");
  const [deliveryPersonName, setDeliveryPersonName] = useState<string>(initialOrder.deliveryPersonName || "");
  const [deliveryPersonContact, setDeliveryPersonContact] = useState<string>(initialOrder.deliveryPersonContact || "");

  // Match initial driver with provided company driver staff
  const initialDriverMatch = drivers.find(
    (d) =>
      d.name.toLowerCase() === (initialOrder.deliveryPersonName || "").toLowerCase() ||
      (d.phone && d.phone === initialOrder.deliveryPersonContact)
  );
  const [selectedDriverId, setSelectedDriverId] = useState<string>(
    initialDriverMatch ? initialDriverMatch.id : (initialOrder.deliveryPersonName ? "custom" : "")
  );

  const handleDriverChange = (driverId: string) => {
    setSelectedDriverId(driverId);
    if (!driverId) {
      setDeliveryPersonName("");
      setDeliveryPersonContact("");
      return;
    }
    if (driverId === "custom") {
      return;
    }
    const driver = drivers.find((d) => d.id === driverId);
    if (driver) {
      setDeliveryPersonName(driver.name);
      if (driver.phone) {
        setDeliveryPersonContact(driver.phone);
      }
    }
  };

  const formatCurrency = (val: number | null | undefined) => {
    const num = val || 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "KES",
      minimumFractionDigits: 2,
    }).format(num);
  };

  const handleStatusTransition = async (newStatus: string) => {
    if (updating || order.status === newStatus) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/customer-orders`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          status: newStatus,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || json.error || "Failed to update order status");
      }
      toast.success(`Order status updated to ${newStatus}`);
      setOrder((prev) => ({
        ...prev,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      }));
    } catch (err: any) {
      toast.error(err.message || "Status update failed");
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveFulfillment = async () => {
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/admin/customer-orders`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          notes,
          deliveryStatus,
          trackingNumber,
          deliveryPersonName,
          deliveryPersonContact,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || json.error || "Failed to update fulfillment details");
      }
      toast.success("Order fulfillment details saved");
      setOrder((prev) => ({
        ...prev,
        notes,
        deliveryStatus,
        trackingNumber,
        deliveryPersonName,
        deliveryPersonContact,
      }));
    } catch (err: any) {
      toast.error(err.message || "Failed to save details");
    } finally {
      setSavingNotes(false);
    }
  };

  const printInvoice = () => {
    window.print();
  };

  const currentStatusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = currentStatusConfig.icon;

  const shippingStr = order.shippingAddress
    ? typeof order.shippingAddress === "string"
      ? order.shippingAddress
      : `${order.shippingAddress.street || ""} ${order.shippingAddress.city || ""} ${order.shippingAddress.zip || ""} ${order.shippingAddress.country || ""}`.trim()
    : "No shipping address provided (In-Store Pickup / Service)";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-10 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/${slug}/orders`}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-slate-600 dark:text-slate-300 transition shadow-sm"
              title="Back to Orders List"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Order <span className="text-emerald-500">#{order.id.slice(-8).toUpperCase()}</span>
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${currentStatusConfig.bg} ${currentStatusConfig.text} ${currentStatusConfig.border}`}
                >
                  <StatusIcon className="w-3.5 h-3.5" />
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Placed on {new Date(order.createdAt).toLocaleString()} via{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {order.orderSource || "WEBSITE"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={printInvoice}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 rounded-xl text-xs font-bold transition shadow-sm"
            >
              <PrinterIcon className="w-4 h-4 text-slate-500" />
              <span>Print Invoice / Slip</span>
            </button>
            <Link
              href={`/admin/${slug}`}
              className="px-4 py-2.5 bg-slate-900 dark:bg-emerald-500 hover:bg-slate-800 dark:hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition shadow-sm"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* Status Lifecycle & Fulfillment Action Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-emerald-500" />
              Order Lifecycle State Machine
            </h2>
            <span className="text-xs text-slate-400">Click to transition order status</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { id: "PENDING", label: "Pending", desc: "Awaiting confirmation" },
              { id: "PROCESSING", label: "Processing", desc: "Being prepared" },
              { id: "SHIPPED", label: "Shipped", desc: "Handed to courier" },
              { id: "OUT_FOR_DELIVERY", label: "Out Delivery", desc: "En route" },
              { id: "COMPLETED", label: "Completed", desc: "Fulfilled & paid" },
              { id: "CANCELLED", label: "Cancelled", desc: "Refunded / closed" },
            ].map((st) => {
              const isCurrent = order.status === st.id;
              const cfg = STATUS_CONFIG[st.id] || STATUS_CONFIG.PENDING;
              return (
                <button
                  key={st.id}
                  disabled={updating}
                  onClick={() => handleStatusTransition(st.id)}
                  className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                    isCurrent
                      ? "bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 border-transparent shadow-md font-bold"
                      : "bg-slate-50/60 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                  } disabled:opacity-50`}
                >
                  <div className="text-xs font-black flex items-center justify-between">
                    <span>{st.label}</span>
                    {isCurrent && <CheckCircleIcon className="w-4 h-4 shrink-0 text-emerald-400 dark:text-slate-900" />}
                  </div>
                  <p className={`text-[10px] mt-0.5 truncate ${isCurrent ? "text-slate-300 dark:text-slate-800" : "text-slate-400"}`}>
                    {st.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Grid: Details + Items */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Items & Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Line Items Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBagIcon className="w-4 h-4 text-emerald-500" />
                Ordered Line Items ({order.items?.length || 0})
              </h3>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {order.items?.map((item, idx) => {
                  const listing = item.marketplaceListing;
                  const itemImg =
                    Array.isArray(listing?.images) && listing.images.length > 0
                      ? typeof listing.images[0] === "string"
                        ? listing.images[0]
                        : listing.images[0]?.url
                      : null;

                  return (
                    <div key={item.id || idx} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                          {itemImg ? (
                            <img src={itemImg} alt={listing?.name || "Product"} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBagIcon className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white uppercase">
                            {listing?.name || "Custom Line Item"}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs text-slate-500 mt-1">
                            <span>Qty: <strong className="text-slate-800 dark:text-slate-200">{item.quantity}</strong></span>
                            <span>•</span>
                            <span>Rate: {formatCurrency(item.price)}</span>
                            {item.date && (
                              <>
                                <span>•</span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                  Service Date: {item.date} {item.timeSlot || ""}
                                </span>
                              </>
                            )}
                          </div>
                          {item.serviceNotes && (
                            <p className="text-xs text-slate-400 italic mt-0.5">
                              Note: {item.serviceNotes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
                          {formatCurrency(item.totalPrice || item.price * item.quantity)}
                        </div>
                        <span className="text-[10px] text-slate-400">Total</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Financial Calculation Ledger */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">
                    {formatCurrency(order.totalPrice)}
                  </span>
                </div>
                {Boolean(order.totalDiscount && order.totalDiscount > 0) && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount</span>
                    <span className="font-mono font-medium">
                      -{formatCurrency(order.totalDiscount)}
                    </span>
                  </div>
                )}
                {Boolean(order.totalTax && order.totalTax > 0) && (
                  <div className="flex justify-between text-slate-500">
                    <span>Tax (VAT)</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">
                      +{formatCurrency(order.totalTax)}
                    </span>
                  </div>
                )}
                {Boolean(order.totalShipping && order.totalShipping > 0) && (
                  <div className="flex justify-between text-slate-500">
                    <span>Delivery / Shipping Fee</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">
                      +{formatCurrency(order.totalShipping)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Grand Total</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 text-lg">
                    {formatCurrency(order.totalFinalPrice || order.totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery & Fulfillment Details */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TruckIcon className="w-4 h-4 text-indigo-500" />
                Fulfillment, Logistics & Driver Assignment
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Shipping Address
                  </label>
                  <p className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                    {shippingStr}
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Fulfillment Status
                  </label>
                  <select
                    value={deliveryStatus}
                    onChange={(e) => setDeliveryStatus(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Pending">Pending Assignment</option>
                    <option value="Dispatched">Dispatched / En Route</option>
                    <option value="Delivered">Delivered / Handed Over</option>
                    <option value="Returned">Returned / Failed</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Tracking Number / Waybill
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. TRK-2026-99201"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Select Driver from Staff ({drivers.length} available)
                  </label>
                  <select
                    value={selectedDriverId}
                    onChange={(e) => handleDriverChange(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">-- Choose Company Driver Staff --</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} {d.phone ? `(${d.phone})` : ""} {d.role ? `• ${d.role}` : ""}
                      </option>
                    ))}
                    <option value="custom">-- Custom / External Driver --</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Assigned Driver / Rider Name
                  </label>
                  <input
                    type="text"
                    value={deliveryPersonName}
                    onChange={(e) => {
                      setDeliveryPersonName(e.target.value);
                      setSelectedDriverId("custom");
                    }}
                    placeholder="e.g. Samuel Kiprop"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Driver Contact / Phone
                  </label>
                  <input
                    type="text"
                    value={deliveryPersonContact}
                    onChange={(e) => {
                      setDeliveryPersonContact(e.target.value);
                      setSelectedDriverId("custom");
                    }}
                    placeholder="e.g. +254 712 345 678"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Internal Operational Notes & Special Instructions
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add private staff notes, gate codes, delivery instructions..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={savingNotes}
                  onClick={handleSaveFulfillment}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-2"
                >
                  {savingNotes ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <DocumentTextIcon className="w-4 h-4" />}
                  Save Fulfillment & Notes
                </button>
              </div>
            </div>
          </div>

          {/* Right 1 Col: Customer & Payment Cards */}
          <div className="space-y-6">
            
            {/* Customer Information Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCircleIcon className="w-5 h-5 text-emerald-500" />
                Customer Profile
              </h3>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Name</span>
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {order.name || "Anonymous Client"}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <EnvelopeIcon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{order.email || "No email recorded"}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <PhoneIcon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{order.phone || "No phone recorded"}</span>
                </div>

                {order.consumerId && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400">
                    Consumer ID: <span className="font-mono text-slate-500">{order.consumerId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment & Settlement Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BanknotesIcon className="w-5 h-5 text-emerald-500" />
                Payment & Settlement
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Payment Status</span>
                  <span className="font-bold uppercase text-emerald-500">
                    {order.paymentStatus || ((order.status as string) === "COMPLETED" || (order.status as string) === "PAID" ? "PAID" : "PENDING")}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Method / Channel</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {order.paymentMethod || order.paymentOption || "Direct Sale"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Total Billed</span>
                  <span className="font-black text-slate-900 dark:text-white font-mono">
                    {formatCurrency(order.totalFinalPrice || order.totalPrice)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400">Store / Seller</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{companyName}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl space-y-2">
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Need to make rapid changes?</p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-500/80">
                You can transition this order to any fulfillment stage above. Updates synchronize immediately across consumer tracking portals and inventory logs.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
