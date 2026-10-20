"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  HiShieldCheck,
  HiCheckBadge,
  HiMapPin,
  HiPhone,
  HiChatBubbleLeftRight,
  HiCheck,
  HiArrowPath,
  HiMagnifyingGlass,
  HiArrowLeft,
  HiTruck,
  HiStar,
  HiCheckCircle,
  HiClock,
} from "react-icons/hi2";
import { tracker } from "@/lib/analytics/tracker";
import { InteractionEventType, InteractionChannel } from "@/lib/analytics/types";

interface Milestone {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
  current: boolean;
}

interface OrderData {
  id: string;
  trackingNumber: string;
  createdAt: string;
  status: string;
  deliveryStatus: string;
  paymentStatus: string;
  escrowStatus: string;
  escrowGuaranteed: boolean;
  customer: {
    name: string;
    phone: string;
    shippingAddress: string;
    shippingMethod: string;
  };
  merchant: {
    id: string;
    name: string;
    slug: string;
    address: string;
    phone: string;
    verified: boolean;
  };
  rider: {
    id: string;
    name: string;
    phone: string;
    vehicle: string;
    rating: number;
    tripsCompleted: number;
    currentLocation: string;
  };
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    price: number;
    totalPrice: number;
    image: string;
  }>;
  totals: {
    subtotal: number;
    deliveryFee: number;
    grandTotal: number;
    currency: string;
  };
  milestones: Milestone[];
}

export default function GhubaOrderTrackingClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialOrderId = searchParams.get("orderId") || "";
  const [searchQuery, setSearchQuery] = useState<string>(initialOrderId || "GHUBA-894102");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isReleasing, setIsReleasing] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [inspectionChecked, setInspectionChecked] = useState<boolean>(false);
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false);
  const [selectedStars, setSelectedStars] = useState<number>(5);

  const fetchOrder = useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/ghuba/orders/track?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        toast.error(data.error || "Order not found");
      }
    } catch {
      toast.error("Network error fetching tracking status");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialOrderId) {
      setSearchQuery(initialOrderId);
      fetchOrder(initialOrderId);
    } else {
      fetchOrder("GHUBA-894102");
    }
  }, [initialOrderId, fetchOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/ghuba/orderTracking?orderId=${encodeURIComponent(searchQuery.trim())}`);
    fetchOrder(searchQuery.trim());
  };

  const handleReleaseEscrow = async () => {
    if (!order) return;
    setIsReleasing(true);

    try {
      const res = await fetch("/api/ghuba/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to release escrow funds");
      }

      // Update state locally
      setOrder((prev) => {
        if (!prev) return null;
        const updatedMilestones = prev.milestones.map((m, idx) => ({
          ...m,
          completed: true,
          current: idx === prev.milestones.length - 1,
          timestamp: idx === prev.milestones.length - 1 ? "Just now" : m.timestamp,
        }));
        return {
          ...prev,
          status: "COMPLETED",
          deliveryStatus: "Delivered",
          paymentStatus: "COMPLETED",
          escrowStatus: "RELEASED",
          milestones: updatedMilestones,
        };
      });

      setShowConfirmModal(false);
      toast.success("🎉 Escrow released! Merchant has been credited via M-Pesa.", {
        icon: "✅",
        duration: 5000,
      });

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate([40, 60, 100]);
        } catch {}
      }

      tracker.track({
        eventType: InteractionEventType.PURCHASE,
        channel: InteractionChannel.GHUBA,
        metadata: {
          orderId: order.id,
          grandTotal: order.totals.grandTotal,
          action: "escrow_released_by_buyer",
        },
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to release escrow");
    } finally {
      setIsReleasing(false);
    }
  };

  const copyOrderNumber = () => {
    if (!order) return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(order.id);
      toast.success("Order ID copied to clipboard!");
    }
  };

  const isEscrowReleased = order?.escrowStatus === "RELEASED" || order?.status === "COMPLETED";

  const riderWhatsAppUrl = order
    ? `https://wa.me/${order.rider.phone}?text=${encodeURIComponent(
        `Hello ${order.rider.name}, I am tracking my Ghuba order #${order.id}. Could you please confirm your current location and ETA?`
      )}`
    : "#";

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/site/ghuba"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
          >
            <HiArrowLeft className="h-4 w-4" />
            <span>Back to Marketplace</span>
          </Link>

          <Link
            href="/ghuba/feed"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-black uppercase tracking-wider hover:bg-rose-500/20 transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>Live Reels</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* 1. Track Any Order Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by Order ID (e.g. GHUBA-894102) or Phone Number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider transition-all shrink-0 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? <HiArrowPath className="h-4 w-4 animate-spin" /> : "Track"}
          </button>
        </form>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-400 border-t-transparent mb-4" />
            <p className="text-sm font-bold text-white">Fetching live order status...</p>
            <p className="text-xs text-zinc-400 mt-1">Connecting to Ghuba Escrow & Rider Dispatch Network</p>
          </div>
        ) : order ? (
          <>
            {/* 2. Order Header & Live Escrow Badge */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
              {/* Background Glow */}
              <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black uppercase tracking-wider text-zinc-400">Order</span>
                    <button
                      type="button"
                      onClick={copyOrderNumber}
                      className="font-mono text-sm sm:text-base font-black text-amber-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>#{order.id}</span>
                      <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">Copy</span>
                    </button>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Placed on {new Date(order.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })} at{" "}
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {isEscrowReleased ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <HiCheckCircle className="h-4 w-4" />
                      <span>Order Delivered • Escrow Released</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <HiShieldCheck className="h-4 w-4" />
                      <span>M-Pesa Escrow Held (Safely Protected)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Escrow Guarantee Statement */}
              <div className="mt-4 flex items-center gap-3 bg-emerald-950/30 border border-emerald-500/30 p-3.5 rounded-2xl">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <HiShieldCheck className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="text-xs">
                  <strong className="text-emerald-300 block font-bold">100% Escrow Buyer Protection</strong>
                  <span className="text-emerald-400/80">
                    Your payment of <strong className="text-white">KES {order.totals.grandTotal.toLocaleString()}</strong> is held in Ghuba’s secure vault. Funds are only paid to the merchant after you confirm delivery below.
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Visual 4-Step Milestone Stepper */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl">
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-300 mb-6 flex items-center gap-2">
                <HiTruck className="h-5 w-5 text-amber-400" />
                <span>Delivery Timeline & Milestones</span>
              </h3>

              <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-800">
                {order.milestones.map((m) => {
                  return (
                    <div key={m.id} className="relative flex items-start gap-4">
                      {/* Milestone Icon Bullet */}
                      <div
                        className={`absolute -left-6 sm:-left-8 top-0 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border-2 transition-all ${
                          m.completed
                            ? "bg-emerald-500 border-emerald-400 text-black shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                            : m.current
                            ? "bg-amber-500 border-amber-300 text-black animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                            : "bg-zinc-950 border-zinc-800 text-zinc-600"
                        }`}
                      >
                        {m.completed ? (
                          <HiCheck className="h-4 w-4 stroke-[3]" />
                        ) : m.current ? (
                          <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4 transition-all hover:border-zinc-700">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <h4
                            className={`text-sm font-bold ${
                              m.completed ? "text-white" : m.current ? "text-amber-400 font-extrabold" : "text-zinc-500"
                            }`}
                          >
                            {m.title}
                          </h4>
                          <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                            <HiClock className="h-3 w-3" />
                            {m.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed">{m.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Live Rider Card & 1-Tap WhatsApp / Call Actions */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-black font-black text-xl flex items-center justify-center shadow-lg ring-4 ring-black shrink-0">
                    JM
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-white">{order.rider.name}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                        Verified Rider
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      {order.rider.vehicle} • {order.rider.tripsCompleted} successful deliveries
                    </p>
                    <p className="text-xs text-amber-400 font-bold mt-0.5 flex items-center gap-1">
                      <HiMapPin className="h-3.5 w-3.5" />
                      <span>{order.rider.currentLocation}</span>
                    </p>
                  </div>
                </div>

                {/* 1-Tap Rider Contact Actions */}
                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center shrink-0">
                  <a
                    href={riderWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95"
                  >
                    <HiChatBubbleLeftRight className="h-4 w-4" />
                    <span>WhatsApp Rider</span>
                  </a>

                  <a
                    href={`tel:${order.rider.phone}`}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border border-zinc-700 active:scale-95"
                  >
                    <HiPhone className="h-4 w-4" />
                    <span>Call Rider</span>
                  </a>
                </div>
              </div>
            </div>

            {/* 5. Buyer Escrow Release Action Card */}
            <div className="bg-zinc-900 border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
              {isEscrowReleased ? (
                <div className="text-center py-4 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                    <HiCheckBadge className="h-8 w-8" />
                  </div>
                  <h4 className="text-lg font-black text-white">Escrow Released & Order Completed</h4>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">
                    You have confirmed delivery and released funds to <strong>@{order.merchant.name}</strong>. Thank you for building trust on Ghuba Marketplace!
                  </p>

                  {/* Rating Seller Prompt */}
                  {!ratingSubmitted ? (
                    <div className="pt-3 max-w-sm mx-auto bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800">
                      <span className="text-xs font-bold text-zinc-300 block mb-2">Rate your merchant experience</span>
                      <div className="flex justify-center gap-2 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setSelectedStars(star)}
                            className="p-1 text-amber-400 hover:scale-110 transition-transform"
                          >
                            <HiStar className={`h-6 w-6 ${star <= selectedStars ? "text-amber-400 fill-amber-400" : "text-zinc-700"}`} />
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setRatingSubmitted(true);
                          toast.success("Thank you for your rating!");
                        }}
                        className="w-full py-2 rounded-xl bg-amber-500 text-black font-black text-xs uppercase tracking-wider hover:bg-amber-400 transition-all"
                      >
                        Submit {selectedStars}-Star Rating
                      </button>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-500/20">
                      <HiCheck className="h-4 w-4" />
                      <span>Rating submitted!</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                      Buyer Escrow Action Required
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-white">Have you received your package?</h4>
                    <p className="text-xs text-zinc-400 max-w-lg leading-relaxed">
                      Inspect your items upon handover from the rider. Once satisfied, release the M-Pesa escrow funds so the merchant gets credited immediately.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(true)}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-95 transition-all shrink-0 flex items-center justify-center gap-2 text-center"
                  >
                    <HiShieldCheck className="h-5 w-5" />
                    <span>Confirm & Release Escrow</span>
                  </button>
                </div>
              )}
            </div>

            {/* 6. Order Items & Receipt Breakdown */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-300">Order Items</h3>
              <div className="divide-y divide-zinc-800">
                {order.items.map((it) => (
                  <div key={it.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-white/10">
                        <Image src={it.image} alt={it.title} fill sizes="48px" className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-white truncate">{it.title}</h5>
                        <span className="text-[11px] text-zinc-400 font-medium">Qty: {it.quantity}</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-white shrink-0">
                      {order.totals.currency} {it.totalPrice.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-zinc-800 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span>KES {order.totals.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Express Rider Delivery</span>
                  <span>KES {order.totals.deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-zinc-800">
                  <span>Total Paid via M-Pesa</span>
                  <span className="text-amber-400">KES {order.totals.grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* 7. Merchant Information */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-xl flex items-center justify-between gap-4 flex-wrap">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-black text-white">{order.merchant.name}</h4>
                  <HiCheckBadge className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="text-xs text-zinc-400 flex items-center gap-1">
                  <HiMapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span>{order.merchant.address}</span>
                </p>
              </div>

              <a
                href={`https://wa.me/${order.merchant.phone}?text=${encodeURIComponent(
                  `Hello ${order.merchant.name}, I am tracking my Ghuba order #${order.id}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
              >
                <HiChatBubbleLeftRight className="h-4 w-4 text-emerald-400" />
                <span>Message Store</span>
              </a>
            </div>
          </>
        ) : null}
      </main>

      {/* Confirmation Modal for Escrow Release */}
      {showConfirmModal && order && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-zinc-950 border border-zinc-800 p-6 text-white shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <HiShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Release Escrow Funds?</h3>
                <span className="text-xs text-zinc-400">Order #{order.id}</span>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              By confirming, you verify that you have received your parcel from rider <strong>{order.rider.name}</strong> and that all items match your expectations.
            </p>

            {/* Checklist */}
            <label className="flex items-start gap-2.5 bg-zinc-900 p-3 rounded-xl border border-zinc-800 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inspectionChecked}
                onChange={(e) => setInspectionChecked(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-zinc-700 text-amber-500 focus:ring-amber-400"
              />
              <span className="text-xs text-zinc-200">
                I have inspected the items and confirm they are in satisfactory condition.
              </span>
            </label>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!inspectionChecked || isReleasing}
                onClick={handleReleaseEscrow}
                className="py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                {isReleasing ? (
                  <>
                    <HiArrowPath className="h-4 w-4 animate-spin" />
                    <span>Releasing...</span>
                  </>
                ) : (
                  <span>Release KES {order.totals.grandTotal.toLocaleString()}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
