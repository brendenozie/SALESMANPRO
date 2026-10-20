"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  HiXMark,
  HiShieldCheck,
  HiBolt,
  HiCheckBadge,
  HiMapPin,
  HiChatBubbleLeftRight,
  HiShoppingBag,
  HiCheckCircle,
  HiArrowPath,
} from "react-icons/hi2";
import { GhubaFeedItem } from "@/lib/ghuba-feed-service";
import { tracker } from "@/lib/analytics/tracker";
import { InteractionEventType, InteractionChannel } from "@/lib/analytics/types";

interface GhubaQuickBuyDrawerProps {
  isOpen: boolean;
  item: GhubaFeedItem | null;
  onClose: () => void;
}

const NAIROBI_LOCATIONS = [
  "Nairobi CBD",
  "Westlands",
  "Kilimani / Kileleshwa",
  "Eastlands",
  "Karen / Langata",
  "Mombasa Road / Syokimau",
  "Thika Road / Kasarani",
  "Upcountry / Courier",
];

export const GhubaQuickBuyDrawer: React.FC<GhubaQuickBuyDrawerProps> = ({
  isOpen,
  item,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"MPESA" | "WHATSAPP">("MPESA");
  const [quantity, setQuantity] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>("");
  const [mpesaPhone, setMpesaPhone] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("Nairobi CBD");
  const [deliveryNotes, setDeliveryNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [stkPending, setStkPending] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(60);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // Reset state when drawer opens with new item
  useEffect(() => {
    if (isOpen && item) {
      setQuantity(1);
      setIsSubmitting(false);
      setStkPending(false);
      setCountdown(60);
      setCreatedOrderId(null);

      // Pre-fill phone or name from local storage if previously used
      try {
        const savedPhone = localStorage.getItem("ghuba_checkout_phone");
        const savedName = localStorage.getItem("ghuba_checkout_name");
        if (savedPhone) setMpesaPhone(savedPhone);
        if (savedName) setCustomerName(savedName);
      } catch {}

      tracker.track({
        eventType: InteractionEventType.PRODUCT_VIEW,
        channel: InteractionChannel.REELS,
        metadata: {
          listingId: item.listingId,
          title: item.title,
          price: item.price,
          seller: item.seller.name,
          source: "reels_quick_buy_drawer",
        },
      });
    }
  }, [isOpen, item]);

  // STK Push Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (stkPending && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [stkPending, countdown]);

  if (!isOpen || !item) return null;

  const itemPrice = item.price || 0;
  const deliveryFee = selectedLocation === "Upcountry / Courier" ? 350 : 200;
  const subtotal = itemPrice * quantity;
  const grandTotal = subtotal + deliveryFee;

  const sanitizePhone = (val: string) => {
    let cleaned = val.replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "254" + cleaned.slice(1);
    } else if (cleaned.startsWith("+254")) {
      cleaned = cleaned.slice(1);
    }
    return cleaned;
  };

  const handleMpesaCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    const formattedPhone = sanitizePhone(mpesaPhone);
    if (formattedPhone.length !== 12 || !formattedPhone.startsWith("254")) {
      toast.error("Please enter a valid Safaricom number (e.g. 0712345678 or 0112345678)");
      return;
    }

    if (!customerName.trim()) {
      toast.error("Please enter your name for delivery");
      return;
    }

    setIsSubmitting(true);

    try {
      // Save credentials for fast 1-tap checkout next time
      try {
        localStorage.setItem("ghuba_checkout_phone", mpesaPhone);
        localStorage.setItem("ghuba_checkout_name", customerName);
      } catch {}

      // Call the centralized order endpoint with M-Pesa escrow payment
      const orderPayload = {
        companyId: item.seller.id,
        orderType: "PRODUCT",
        source: "REELS_FEED",
        name: customerName.trim(),
        phone: formattedPhone,
        mpesaPhone: formattedPhone,
        paymentOption: "MPESA",
        shippingAddress: `${selectedLocation}${deliveryNotes ? ` - ${deliveryNotes}` : ""}`,
        shippingMethod: "EXPRESS_RIDER",
        items: [
          {
            marketplaceListingId: item.listingId,
            quantity: quantity,
            price: item.price,
            totalPrice: subtotal,
          },
        ],
        metadata: {
          channel: "REELS_QUICK_BUY",
          listingId: item.listingId,
          sellerName: item.seller.name,
          escrowGuaranteed: true,
        },
      };

      const res = await fetch("/api/shop/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok && !data.success && !data.order) {
        throw new Error(data.message || data.error || "Failed to initiate M-Pesa payment");
      }

      const orderId = data.order?.id || data.id || `GHUBA-${Date.now()}`;
      setCreatedOrderId(orderId);
      setStkPending(true);
      setCountdown(60);

      toast.success("M-Pesa STK Prompt sent! Enter your PIN on your phone.", {
        icon: "📱",
        duration: 5000,
      });

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate([30, 50, 30]);
        } catch {}
      }
    } catch (err: any) {
      console.error("[GhubaQuickBuy] Error:", err);
      toast.error(err.message || "Failed to trigger M-Pesa prompt. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sellerPhone = item.seller.contactPhone || "254706448146";
  const whatsappUrl = `https://wa.me/${sanitizePhone(sellerPhone)}?text=${encodeURIComponent(
    `Hello ${item.seller.name}, I am watching your reel on Ghuba for "${item.title}" (KES ${item.price.toLocaleString()}). I would like to order ${quantity} unit(s) delivered to ${selectedLocation}. Is this available? Link: ${item.publicUrl}`
  )}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl bg-zinc-950 text-white border-t border-zinc-800 shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
      >
        {/* Drawer Drag Bar & Header */}
        <div className="relative pt-3 pb-2 px-5 border-b border-zinc-800/80 flex items-center justify-between shrink-0">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-zinc-700" />
          
          <div className="flex items-center gap-2 mt-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <HiBolt className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-black text-white tracking-wide">Instant Quick-Buy</h3>
              <span className="text-[10px] font-bold text-zinc-400 block -mt-0.5">Stay on video while ordering</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors mt-2"
            aria-label="Close drawer"
          >
            <HiXMark className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Drawer Content */}
        <div className="overflow-y-auto px-5 py-4 space-y-4 scrollbar-none">
          {/* 1. Product Snapshot Card */}
          <div className="flex gap-3 bg-zinc-900/80 p-3 rounded-2xl border border-zinc-800/80 items-center">
            <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-white/10">
              <Image
                src={
                  item.media.thumbnail ||
                  item.media.poster ||
                  (item.media.images && item.media.images[0]) ||
                  "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=300"
                }
                alt={item.title}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-bold mb-0.5 truncate">
                <span>@{item.seller.name}</span>
                {item.seller.isVerified && <HiCheckBadge className="h-3.5 w-3.5 text-blue-400 shrink-0" />}
                {item.location && <span>• 📍 {item.location}</span>}
              </div>
              <h4 className="text-xs font-bold text-white line-clamp-1 mb-1">{item.title}</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-amber-400">
                  {item.currency} {item.price.toLocaleString()}
                </span>
                
                {/* Quantity Selector */}
                <div className="flex items-center gap-2 bg-zinc-800 px-2 py-1 rounded-lg border border-zinc-700">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={stkPending || quantity <= 1}
                    className="text-xs font-black text-zinc-400 hover:text-white disabled:opacity-30 px-1"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold text-white min-w-[14px] text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    disabled={stkPending || quantity >= 10}
                    className="text-xs font-black text-zinc-400 hover:text-white disabled:opacity-30 px-1"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Ghuba M-Pesa Escrow Trust Assurance */}
          <div className="flex items-center gap-2.5 bg-emerald-950/40 border border-emerald-500/30 px-3.5 py-2.5 rounded-xl text-emerald-400">
            <HiShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" />
            <div className="text-[11px] leading-tight">
              <span className="font-bold text-emerald-300 block">Ghuba M-Pesa Escrow Guaranteed</span>
              <span className="text-emerald-400/80">Funds held safely in escrow until you receive and inspect your order.</span>
            </div>
          </div>

          {/* 3. STK Push In-Progress State */}
          {stkPending ? (
            <div className="bg-zinc-900 border border-amber-500/40 p-5 rounded-2xl text-center space-y-3">
              <div className="relative mx-auto w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <HiArrowPath className="h-7 w-7 text-emerald-400 animate-spin" />
              </div>
              <h4 className="text-base font-bold text-white">M-Pesa STK Prompt Sent</h4>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Check your phone for the STK push of{" "}
                <span className="text-emerald-400 font-bold">KES {grandTotal.toLocaleString()}</span> and enter your M-Pesa PIN.
              </p>
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-xs font-bold text-zinc-300">
                <span>Prompt expires in:</span>
                <span className="text-amber-400">{countdown}s</span>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                {createdOrderId && (
                  <Link
                    href={`/ghuba/orderTracking?orderId=${createdOrderId}`}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    Track Live Order #{createdOrderId.slice(-6)}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition-colors"
                >
                  Continue Watching Reels
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tab Selector */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-900 rounded-xl border border-zinc-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab("MPESA")}
                  className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "MPESA"
                      ? "bg-amber-500 text-zinc-950 shadow-md"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <HiBolt className="h-4 w-4" />
                  <span>M-Pesa Express</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("WHATSAPP")}
                  className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "WHATSAPP"
                      ? "bg-emerald-500 text-white shadow-md"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <HiChatBubbleLeftRight className="h-4 w-4" />
                  <span>WhatsApp Merchant</span>
                </button>
              </div>

              {activeTab === "MPESA" ? (
                /* Tab 1: M-Pesa Quick Checkout Form */
                <form onSubmit={handleMpesaCheckout} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Brian Ochieng"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                      M-Pesa Phone Number (Prompt will be sent here)
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0712 345 678 or 0112 345 678"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Delivery Destination
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {NAIROBI_LOCATIONS.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => setSelectedLocation(loc)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                            selectedLocation === loc
                              ? "bg-amber-500 text-black border-amber-400 font-black"
                              : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                          }`}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Specific building, street, or house number (optional)"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80 space-y-1.5 text-xs">
                    <div className="flex justify-between text-zinc-400">
                      <span>Items Subtotal ({quantity}x)</span>
                      <span>KES {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Express Rider Delivery ({selectedLocation})</span>
                      <span>KES {deliveryFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-black text-white text-sm pt-1 border-t border-zinc-800">
                      <span>Total Payable</span>
                      <span className="text-amber-400">KES {grandTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                        <span>Sending M-Pesa STK Prompt...</span>
                      </>
                    ) : (
                      <>
                        <HiBolt className="h-4 w-4" />
                        <span>Pay KES {grandTotal.toLocaleString()} via M-Pesa</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Tab 2: WhatsApp Direct Merchant Inquiry */
                <div className="space-y-4 pt-1">
                  <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-emerald-400">
                      <HiCheckCircle className="h-4 w-4" />
                      <span>Verified Kenyan Merchant Direct Line</span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed">
                      Prefer to chat, negotiate, or ask custom questions directly? Open WhatsApp with @{item.seller.name} to confirm instant pickup or custom delivery.
                    </p>
                    <div className="text-[11px] text-zinc-400 pt-1">
                      <span>Contact: </span>
                      <strong className="text-white font-mono">{sellerPhone}</strong>
                    </div>
                  </div>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      tracker.track({
                        eventType: InteractionEventType.WHATSAPP_CLICK,
                        channel: InteractionChannel.WHATSAPP,
                        metadata: {
                          listingId: item.listingId,
                          sellerName: item.seller.name,
                          source: "reels_quick_buy_drawer",
                        },
                      });
                    }}
                    className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 text-center"
                  >
                    <HiChatBubbleLeftRight className="h-4 w-4" />
                    <span>Open WhatsApp with Merchant</span>
                  </a>

                  <p className="text-[11px] text-center text-zinc-500">
                    Your reel playback is preserved when you return.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
