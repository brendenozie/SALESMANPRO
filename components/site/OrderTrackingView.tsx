"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  PhoneIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  BuildingStorefrontIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  PrinterIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  UserCircleIcon,
  ExclamationCircleIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

export interface TrackingEnrichedItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
  image?: string | null;
  selectedOptions?: any;
}

export interface TrackingTimelineStep {
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
  date?: string | null;
}

export interface TrackingRiderInfo {
  id: string;
  name: string;
  phone?: string | null;
  image?: string | null;
  rating?: number;
  vehicle?: string | null;
  plateNumber?: string | null;
  vehicleType?: string | null;
  currentLat?: number | null;
  currentLng?: number | null;
}

export interface TrackingEscrowFinancials {
  paymentType: string;
  escrowStatus: string;
  escrowAmount: number;
  platformFeePercent?: number;
  offeredFee?: number;
  isEscrowSecured: boolean;
}

export interface TrackingResultData {
  orderId: string;
  trackingNumber: string;
  orderNumber?: string;
  status: string;
  paymentStatus: string;
  paymentOption?: string | null;
  paymentMethod?: string | null;
  deliveryStatus: string;
  shippingMethod: string;
  shippingAddress?: any;
  deliveryInstructions?: string | null;
  createdAt: string;
  estimatedDelivery?: string | null;
  deliveredAt?: string | null;
  pricing: {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
  };
  items: TrackingEnrichedItem[];
  store: {
    name: string;
    slug?: string | null;
    phone?: string | null;
    email?: string | null;
    logoUrl?: string | null;
    address?: string | null;
  };
  steps: TrackingTimelineStep[];
  rider?: TrackingRiderInfo | null;
  escrow?: TrackingEscrowFinancials | null;
  coordinates?: {
    pickup?: { lat: number; lng: number; address?: string };
    dropoff?: { lat: number; lng: number; address?: string };
    rider?: { lat: number; lng: number };
  } | null;
}

export interface CustomerOrderSummary {
  id: string;
  trackingNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  itemCount: number;
  createdAt: string;
  storeName: string;
  storeSlug?: string | null;
}

interface OrderTrackingViewProps {
  storeSlug?: string;
  storeName?: string;
  initialTrackingNumber?: string;
}

const RECENT_SEARCHES_KEY = "salesmanpro_recent_tracking_numbers";

export default function OrderTrackingView({
  storeSlug,
  storeName,
  initialTrackingNumber = "",
}: OrderTrackingViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryParam =
    searchParams.get("trackingNumber") ||
    searchParams.get("trackingnumber") ||
    searchParams.get("query") ||
    searchParams.get("orderId") ||
    searchParams.get("ref") ||
    initialTrackingNumber ||
    "";

  const [inputQuery, setInputQuery] = useState(queryParam);
  const [activeTrackingNumber, setActiveTrackingNumber] = useState(queryParam);
  const [trackingData, setTrackingData] = useState<TrackingResultData | null>(null);
  const [multipleOrders, setMultipleOrders] = useState<CustomerOrderSummary[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored).slice(0, 5));
      }
    } catch {
      // Non-blocking
    }
  }, []);

  const saveRecentSearch = (val: string) => {
    try {
      const trimmed = val.trim();
      if (!trimmed || trimmed.length < 3) return;
      const updated = [trimmed, ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // Non-blocking
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Non-blocking
    }
  };

  // Perform tracking search
  const performSearch = useCallback(
    async (searchTerm: string, isSilentRefresh = false) => {
      const clean = searchTerm.trim();
      if (!clean) return;

      // Cancel any ongoing search request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      if (!isSilentRefresh) {
        setIsLoading(true);
        setError(null);
        setMultipleOrders(null);
      } else {
        setIsRefreshing(true);
      }

      try {
        const params = new URLSearchParams();
        params.set("query", clean);
        if (storeSlug) params.set("storeSlug", storeSlug);

        const res = await fetch(`/api/shop/orders/track?${params.toString()}`, {
          cache: "no-store",
          signal: abortControllerRef.current.signal,
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.error || "Order not found. Please verify your tracking number and try again.");
        }

        if (json.multipleOrders && json.multipleOrders.length > 0) {
          setMultipleOrders(json.multipleOrders);
          setTrackingData(null);
        } else if (json.data) {
          setTrackingData(json.data);
          setActiveTrackingNumber(json.data.trackingNumber);
          setMultipleOrders(null);
          saveRecentSearch(json.data.trackingNumber);
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        if (!isSilentRefresh) {
          setError(err.message || "Failed to load order tracking details.");
          setTrackingData(null);
          setMultipleOrders(null);
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [storeSlug],
  );

  // Auto-fetch on mount if queryParam present
  useEffect(() => {
    if (queryParam) {
      setInputQuery(queryParam);
      performSearch(queryParam);
    }
  }, [queryParam, performSearch]);

  // Live polling for in-transit or pending payment orders
  useEffect(() => {
    if (!trackingData) return;

    const isLiveActive =
      ["SEARCHING_FOR_RIDER", "OFFERED", "RIDER_ASSIGNED", "RIDER_EN_ROUTE_TO_PICKUP", "ORDER_COLLECTED", "IN_TRANSIT", "ARRIVED_AT_DROPOFF"].includes(
        trackingData.status,
      ) ||
      trackingData.paymentStatus === "PENDING" ||
      trackingData.paymentStatus === "INITIATED";

    if (!isLiveActive) return;

    const timer = setInterval(() => {
      performSearch(activeTrackingNumber, true);
    }, 12000);

    return () => clearInterval(timer);
  }, [trackingData, activeTrackingNumber, performSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) {
      setError("Please enter a tracking number, order ID, or contact number.");
      return;
    }
    performSearch(inputQuery);
  };

  const handleCopy = () => {
    if (!trackingData?.trackingNumber) return;
    navigator.clipboard.writeText(trackingData.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (typeof window === "undefined" || !trackingData) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?trackingNumber=${encodeURIComponent(
      trackingData.trackingNumber,
    )}`;

    if (navigator.share) {
      navigator
        .share({
          title: `Track Order #${trackingData.trackingNumber}`,
          text: `Real-time delivery tracking for Order #${trackingData.trackingNumber}`,
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isPaid =
    trackingData?.paymentStatus === "COMPLETED" ||
    trackingData?.status === "PAID" ||
    trackingData?.paymentOption === "cash" ||
    trackingData?.paymentOption === "cod" ||
    trackingData?.escrow?.isEscrowSecured;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 font-sans transition-colors">
      {/* Search Header Hero */}
      <section className="text-center mb-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-xs">
            <TruckIcon className="w-4 h-4" />
            {storeName ? `${storeName} Order Tracking` : "Live Order & Delivery Tracking"}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Track Your Package
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Enter your tracking code, order reference, or M-Pesa receipt to check live fulfillment status, assigned rider, and delivery ETA.
          </p>
        </motion.div>

        {/* Search Bar Input */}
        <form onSubmit={handleSubmit} className="mt-6 max-w-xl mx-auto">
          <div className="relative flex items-center shadow-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition">
            <div className="pl-4 text-slate-400">
              <MagnifyingGlassIcon className="w-5 h-5" />
            </div>

            <input
              type="text"
              placeholder="Enter Tracking #, Order #, Phone or Email..."
              value={inputQuery}
              onChange={(e) => {
                setInputQuery(e.target.value);
                if (error) setError(null);
              }}
              className="w-full px-3 py-3.5 text-sm bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />

            {inputQuery && (
              <button
                type="button"
                onClick={() => setInputQuery("")}
                className="p-1.5 mr-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mr-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
            >
              {isLoading ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" /> Searching...
                </>
              ) : (
                "Track"
              )}
            </button>
          </div>

          {/* Quick Search Tags / Recent Searches */}
          {recentSearches.length > 0 && !trackingData && !multipleOrders && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-[11px] uppercase tracking-wider">Recent:</span>
              {recentSearches.map((rec) => (
                <button
                  key={rec}
                  type="button"
                  onClick={() => {
                    setInputQuery(rec);
                    performSearch(rec);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[11px] transition flex items-center gap-1"
                >
                  {rec}
                </button>
              ))}
              <button
                type="button"
                onClick={clearRecentSearches}
                className="text-[10px] text-slate-400 hover:text-rose-500 underline ml-1"
              >
                Clear
              </button>
            </div>
          )}
        </form>

        {/* Error notification */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-xl mx-auto mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 justify-center"
            >
              <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Multiple Orders Found Selector (From Phone/Email Search) */}
      <AnimatePresence>
        {multipleOrders && multipleOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4 mb-10"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Orders Found ({multipleOrders.length})
              </h3>
              <span className="text-xs text-slate-500">Select an order to view full tracking</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {multipleOrders.map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => performSearch(ord.trackingNumber || ord.id)}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 shadow-sm hover:shadow-md cursor-pointer transition flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {ord.storeName}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">#{ord.trackingNumber}</h4>
                    <p className="text-xs text-slate-500">
                      {new Date(ord.createdAt).toLocaleDateString()} • {ord.itemCount} items
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                      KES {ord.total.toLocaleString()}
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        ord.paymentStatus === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Tracking Details View */}
      <AnimatePresence mode="wait">
        {trackingData && (
          <motion.div
            key={trackingData.trackingNumber}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* 1. Header Banner & Quick Actions */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    Live Status
                  </span>
                  {isRefreshing && (
                    <span className="text-[11px] text-indigo-500 flex items-center gap-1 animate-pulse font-medium">
                      <ArrowPathIcon className="w-3 h-3 animate-spin" /> Updating live...
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Order #{trackingData.trackingNumber}
                  </h2>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Copy Tracking Number"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4" />
                  </button>
                  {copied && <span className="text-[10px] font-bold text-emerald-500">Copied!</span>}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <BuildingStorefrontIcon className="w-4 h-4 text-slate-400" />
                  Store: <strong className="text-slate-800 dark:text-slate-200">{trackingData.store.name}</strong>
                  {trackingData.estimatedDelivery && (
                    <>
                      <span>•</span>
                      <span>ETA: {trackingData.estimatedDelivery}</span>
                    </>
                  )}
                </p>
              </div>

              {/* Status Pills & Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    isPaid
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {isPaid ? "Payment Secured" : "Payment Awaiting"}
                </span>

                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {trackingData.deliveryStatus}
                </span>

                <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2">
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition"
                    title="Share Tracking Link"
                  >
                    <ShareIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition"
                    title="Print Receipt"
                  >
                    <PrinterIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Ghuba Escrow / Payment Notice (if applicable) */}
            {trackingData.escrow && (
              <div
                className={`p-4 rounded-2xl border ${
                  trackingData.escrow.paymentType === "GHUBA_ESCROW"
                    ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-900 dark:text-emerald-300"
                    : trackingData.escrow.paymentType === "CASH_ON_PICKUP"
                    ? "bg-amber-500/5 border-amber-500/30 text-amber-900 dark:text-amber-300"
                    : "bg-blue-500/5 border-blue-500/30 text-blue-900 dark:text-blue-300"
                } flex items-start gap-3`}
              >
                <ShieldCheckIcon className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed space-y-0.5">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-bold uppercase">
                      {trackingData.escrow.paymentType === "GHUBA_ESCROW"
                        ? "Ghuba Escrow Secured"
                        : trackingData.escrow.paymentType === "CASH_ON_PICKUP"
                        ? "Cash On Pickup (COP)"
                        : "Cash On Delivery (COD)"}
                    </strong>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/30">
                      {trackingData.escrow.escrowStatus}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    {trackingData.escrow.paymentType === "GHUBA_ESCROW"
                      ? `Prepaid deposit of KES ${trackingData.escrow.escrowAmount.toLocaleString()} is locked safely in Ghuba Escrow. Funds are released to the rider upon recipient delivery confirmation.`
                      : trackingData.escrow.paymentType === "CASH_ON_PICKUP"
                      ? `Delivery fee is settled in cash directly at store pickup. The ${trackingData.escrow.platformFeePercent || 4}% platform transaction fee is handled automatically via platform ledger.`
                      : `Delivery fee is collected in cash from the recipient customer upon dropoff.`}
                  </p>
                </div>
              </div>
            )}

            {/* 3. Real-Time Delivery Journey Stepper */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Delivery Milestones</h3>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
                {trackingData.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex md:flex-col items-start md:items-center text-left md:text-center gap-3 md:gap-2 relative"
                  >
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                        step.completed
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                          : step.current
                          ? "bg-amber-500 text-white ring-4 ring-amber-100 dark:ring-amber-900/40 animate-pulse"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircleIcon className="w-5 h-5" />
                      ) : step.current ? (
                        <ClockIcon className="w-5 h-5 animate-spin" />
                      ) : (
                        <span className="text-xs font-bold">{idx + 1}</span>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <p
                        className={`text-xs font-bold ${
                          step.completed || step.current ? "text-slate-900 dark:text-white" : "text-slate-400"
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                        {step.description}
                      </p>
                      {step.date && (
                        <p className="text-[10px] text-indigo-500 font-mono">
                          {new Date(step.date).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Assigned Rider Card & Route Info (if rider assigned) */}
            {trackingData.rider && (
              <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                      <TruckIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                        Assigned Courier
                      </span>
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        {trackingData.rider.name}
                        <span className="text-xs text-amber-400 font-semibold">★ {trackingData.rider.rating || 5.0}</span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        {trackingData.rider.vehicle || "Motorbike"} •{" "}
                        <span className="font-mono text-slate-200">{trackingData.rider.plateNumber || "Pending"}</span>
                      </p>
                    </div>
                  </div>

                  {trackingData.rider.phone && (
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${trackingData.rider.phone}`}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                      >
                        <PhoneIcon className="w-4 h-4" /> Call Rider
                      </a>
                    </div>
                  )}
                </div>

                {trackingData.coordinates?.dropoff && (
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex items-center justify-between text-slate-300">
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4 text-rose-500 shrink-0" />
                      <span className="truncate max-w-sm">
                        Destination: {trackingData.coordinates.dropoff.address || trackingData.shippingAddress?.display_name || "Customer Dropoff"}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-indigo-400">GPS Live Broadcast</span>
                  </div>
                )}
              </div>
            )}

            {/* 5. Order Items & Financial Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Ordered Items */}
              <div className="md:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <ShoppingBagIcon className="w-4 h-4" /> Package Contents ({trackingData.items.length})
                  </h3>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {trackingData.items.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <ShoppingBagIcon className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</p>
                          <p className="text-xs text-slate-500">
                            Qty: {item.quantity} × KES {item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                        KES {item.totalPrice.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address & Pricing Breakdown */}
              <div className="space-y-6">
                {/* Delivery Info */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4" /> Delivery Destination
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {trackingData.shippingAddress?.display_name || "Store Direct Delivery"}
                  </p>
                  {trackingData.deliveryInstructions && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-500">
                      <strong>Notes:</strong> {trackingData.deliveryInstructions}
                    </div>
                  )}
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    Carrier: {trackingData.shippingMethod}
                  </p>
                </div>

                {/* Financial Summary */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <CreditCardIcon className="w-4 h-4" /> Financial Summary
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-mono">KES {trackingData.pricing.subtotal.toLocaleString()}</span>
                    </div>

                    {trackingData.pricing.discount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Discount</span>
                        <span className="font-mono">-KES {trackingData.pricing.discount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span className="font-mono">KES {trackingData.pricing.shipping.toLocaleString()}</span>
                    </div>

                    {trackingData.pricing.tax > 0 && (
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span className="font-mono">KES {trackingData.pricing.tax.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="border-t border-slate-200 dark:border-slate-800 pt-2 mt-2 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
                      <span>Total Price</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400">
                        KES {trackingData.pricing.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
