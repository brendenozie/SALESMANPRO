"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useStateContext } from "@/contexts/ContextProvider";
import { useStoreContext } from "@/contexts/StoreContext";
import ShippingAddress from "@/components/shippingAddress";
import {
  CreditCardIcon,
  TruckIcon,
  CheckCircleIcon,
  CalendarIcon,
  XCircleIcon,
  ArrowLeftIcon,
  BuildingLibraryIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  ChevronRightIcon,
  SparklesIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import {
  CheckIcon,
} from "@heroicons/react/24/solid";
import {
  formatCreditCardNumber,
  formatExpirationDate,
  formatCVC,
} from "@/data/cardFormatter";

const steps = [
  { id: 0, name: "Billing", desc: "Contact info" },
  { id: 1, name: "Shipping", desc: "Delivery destination" },
  { id: 2, name: "Payment", desc: "Method & discounts" },
  { id: 3, name: "Review", desc: "Final verification" },
];

export default function GhubaCheckoutClient() {
  const router = useRouter();
  const { data: session } = useSession();
  const { cart, clearCart } = useStateContext();
  const { storeFormData } = useStoreContext();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: (session?.user as any)?.phone || "",
    cardNumber: (session?.user as any)?.cardNumber || "",
    expiry: (session?.user as any)?.expiry || "",
    cvv: "",
    deliveryFee: "500",
    promoCode: "",
    paymentMethod: "card",
    shippingMethod: "Shop-Pickup",
    shippingAddress: null as any,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [error, setError] = useState<Record<string, string>>({});
  const [discount, setDiscount] = useState(0);
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  // Currency
  const currency = storeFormData?.currency || "KSH";

  // Address selection handler
  const handleAddressSelect = useCallback((address: string, coords: { lat: number; lng: number }) => {
    setFormData((f) => ({
      ...f,
      shippingAddress: {
        display_name: address,
        lat: coords.lat,
        lng: coords.lng,
      },
    }));
  }, []);

  // Delivery estimation
  useEffect(() => {
    const baseDays = formData.shippingMethod === "Express" ? 2 : 5;
    const deliveryDate = new Date(Date.now() + baseDays * 24 * 60 * 60 * 1000);
    setEstimatedDelivery(deliveryDate.toDateString());
  }, [formData.shippingMethod]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formatted = value;
    if (name === "cardNumber") formatted = formatCreditCardNumber(value);
    if (name === "expiry") formatted = formatExpirationDate(value);
    if (name === "cvv") formatted = formatCVC(value);
    setFormData((fd) => ({ ...fd, [name]: formatted }));
    setError((err) => ({ ...err, [name]: "" }));
  }, []);

  const subtotal = useMemo(
    () => (cart || []).reduce((sum: number, i: any) => sum + (Number(i.finalPrice ?? i.sellingPrice ?? 0) * (i.quantity || 1)), 0),
    [cart]
  );
  const shippingCost = useMemo(
    () => (formData.shippingMethod === "Shop-Pickup" ? 0 : formData.shippingMethod === "Standard" ? 500 : 1000),
    [formData.shippingMethod]
  );
  const total = useMemo(
    () => (subtotal + shippingCost) * (1 - discount),
    [subtotal, shippingCost, discount]
  );

  // Promo code validation
  useEffect(() => {
    const id = setTimeout(() => {
      if (!formData.promoCode) {
        setDiscount(0);
        return setPromoMessage("");
      }
      if (formData.promoCode.toUpperCase() === "SAVE10") {
        setDiscount(0.1);
        setPromoMessage("10% discount applied successfully!");
      } else {
        setDiscount(0);
        setPromoMessage("Invalid promo code");
      }
    }, 400);
    return () => clearTimeout(id);
  }, [formData.promoCode]);

  const validateStep = useCallback(() => {
    const errs: Record<string, string> = {};
    if (currentStep === 0) {
      if (!formData.name) errs.name = "Full name is required";
      if (!formData.email) errs.email = "Email address is required";
      if (!formData.phone) errs.phone = "Phone number is required";
    }
    if (currentStep === 1 && !formData.shippingAddress) {
      errs.address = "Please select a valid shipping address";
    }
    
    setError(errs);
    return Object.keys(errs).length === 0;
  }, [currentStep, formData]);

  const handleNext = () => {
    if (!validateStep()) return;
    setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const handlePrev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateStep()) return;
      setIsSubmitting(true);
      try {
        const orderPayload = {
          consumerId: session?.user?.id,
          companyId: storeFormData?.id,
          items: (cart || []).map((i: any) => ({
            marketplaceListingId: i.id,
            quantity: i.quantity || 1,
            price: i.finalPrice ?? i.sellingPrice ?? 0,
            totalPrice: (i.finalPrice ?? i.sellingPrice ?? 0) * (i.quantity || 1),
            subtotal: i.subtotal,
            selectedOptions: i.selectedOptions
              ? Object.entries(i.selectedOptions).map(([category, name]) => ({
                  category,
                  name: String(name),
                }))
              : [],
          })),
          shippingAddress: {
            display_name: formData.shippingAddress?.display_name,
            lat: formData.shippingAddress?.lat,
            lng: formData.shippingAddress?.lng,
          },
          shippingMethod: formData.shippingMethod,
          delivery: formData.paymentMethod === "pickupatshop",
          paymentOption: formData.paymentMethod,
          totalPrice: parseFloat(total.toFixed(2)),
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          promoCode: formData.promoCode,
          paymentData: {
            cardNumber: (formData.cardNumber || '').replace(/\s/g, ''),
            cardExpiry: formData.expiry,
            cvv: formData.cvv,
            mpesaPhone: formData.phone,
          },
        };

        const res = await fetch(`/api/shop/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_API_SECRET_KEY || "",
          },
          body: JSON.stringify(orderPayload),
        });

        if (!res.ok) throw new Error("Failed to process order.");

        const order = await res.json();
        setTrackingNumber(order.trackingNumber || "TRK-" + Math.floor(100000 + Math.random() * 900000));
        clearCart();
        setIsOrderPlaced(true);
      } catch {
        setError({ submit: "Unable to complete order. Please try again." });
      } finally {
        setIsSubmitting(false);
      }
    },
    [cart, clearCart, formData, session?.user?.id, storeFormData?.id, total, validateStep]
  );

  if (isOrderPlaced) {
    return <OrderStatus success trackingNumber={trackingNumber} router={router} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
      {/* Header Banner */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-amber-500 transition-colors mb-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to feed / store
          </button>
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
            Ghuba <span className="text-amber-500 italic">Checkout</span>
          </h1>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="mb-10">
        <div className="grid grid-cols-4 gap-2 sm:gap-4 relative">
          {steps.map((step, i) => {
            const isDone = currentStep > i;
            const isCurrent = currentStep === i;
            return (
              <div key={step.id} className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="flex items-center w-full mb-2">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      isDone
                        ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                        : isCurrent
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md ring-4 ring-amber-500/20"
                        : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {isDone ? <CheckIcon className="w-5 h-5 stroke-[3]" /> : i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`hidden sm:block flex-1 h-1 mx-3 rounded-full transition-colors duration-300 ${
                        currentStep > i ? "bg-amber-500" : "bg-zinc-200 dark:bg-zinc-800"
                      }`}
                    />
                  )}
                </div>
                <span className={`text-xs font-extrabold uppercase tracking-wider ${isCurrent ? "text-amber-500" : "text-zinc-500"}`}>
                  {step.name}
                </span>
                <span className="hidden lg:block text-[10px] text-zinc-400 font-medium">
                  {step.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Order Summary Toggle Pill */}
      <div className="block lg:hidden mb-6">
        <button
          type="button"
          onClick={() => setShowMobileSummary(!showMobileSummary)}
          className="w-full flex items-center justify-between p-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs font-bold uppercase tracking-wider"
        >
          <div className="flex items-center gap-2">
            <ShoppingBagIcon className="w-5 h-5 text-amber-500" />
            <span>{showMobileSummary ? "Hide Order Summary" : "Show Order Summary"}</span>
          </div>
          <span className="text-amber-500 font-black text-sm">{currency} {total.toLocaleString()}</span>
        </button>

        {showMobileSummary && (
          <div className="mt-3">
            <OrderSummary currency={currency} cart={cart} estimatedDelivery={estimatedDelivery} total={total} subtotal={subtotal} shippingCost={shippingCost} discount={discount} />
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Main Interactive Form Step Window */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md">
          <form onSubmit={handleSubmit} className="touch-pan-y">
            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <motion.div
                  key="step-0"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-5"
                >
                  <div>
                    <h2 className="text-xl font-black uppercase text-zinc-900 dark:text-white tracking-tight">
                      Billing Information
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Enter your basic buyer details</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                        Full Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className={`w-full p-3.5 bg-zinc-50 dark:bg-zinc-800/50 border ${
                          error.name ? "border-rose-500" : "border-zinc-200 dark:border-zinc-700"
                        } rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-sm transition-all`}
                      />
                      {error.name && <p className="text-rose-500 text-xs font-bold mt-1">{error.name}</p>}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className={`w-full p-3.5 bg-zinc-50 dark:bg-zinc-800/50 border ${
                          error.email ? "border-rose-500" : "border-zinc-200 dark:border-zinc-700"
                        } rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-sm transition-all`}
                      />
                      {error.email && <p className="text-rose-500 text-xs font-bold mt-1">{error.email}</p>}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+254 700 000 000"
                        className={`w-full p-3.5 bg-zinc-50 dark:bg-zinc-800/50 border ${
                          error.phone ? "border-rose-500" : "border-zinc-200 dark:border-zinc-700"
                        } rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-sm transition-all`}
                      />
                      {error.phone && <p className="text-rose-500 text-xs font-bold mt-1">{error.phone}</p>}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-5"
                >
                  <div>
                    <h2 className="text-xl font-black uppercase text-zinc-900 dark:text-white tracking-tight">
                      Shipping Address
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Select your primary drop-off point</p>
                  </div>

                  <ShippingAddress onAddressSelect={handleAddressSelect} />
                  {error.address && <p className="text-rose-500 text-xs font-bold mt-1">{error.address}</p>}

                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-3">
                      Shipping Velocity
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "Shop-Pickup", title: "Shop Pickup", time: "anytime", cost: "Free" },
                        { id: "Standard", title: "Standard Delivery", time: "3-5 Business Days", cost: `${currency} 500` },
                        { id: "Express", title: "Express Courier", time: "1-2 Business Days", cost: `${currency} 1,000` },
                      ].map((method) => (
                        <div
                          key={method.id}
                          onClick={() => setFormData((f) => ({ ...f, shippingMethod: method.id }))}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                            formData.shippingMethod === method.id
                              ? "border-amber-500 bg-amber-500/10 text-zinc-900 dark:text-white"
                              : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30 text-zinc-500"
                          }`}
                        >
                          <p className="font-bold text-xs uppercase">{method.title}</p>
                          <p className="text-[10px] mt-1">{method.time}</p>
                          <p className="text-xs font-black mt-2 text-amber-500">{method.cost}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-5"
                >
                  <div>
                    <h2 className="text-xl font-black uppercase text-zinc-900 dark:text-white tracking-tight">
                      Payment & Promotions
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Choose your preferred settlement option</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: "card", label: "Card", icon: CreditCardIcon },
                      { id: "mpesa", label: "M-Pesa", icon: DevicePhoneMobileIcon },
                      { id: "cod", label: "COD", icon: TruckIcon },
                      { id: "pickupatshop", label: "Shop Pickup", icon: BuildingLibraryIcon },
                    ].map((m) => {
                      const Icon = m.icon;
                      const isSelected = formData.paymentMethod === m.id;
                      return (
                        <button
                          type="button"
                          key={m.id}
                          onClick={() => setFormData((f) => ({ ...f, paymentMethod: m.id }))}
                          className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                            isSelected
                              ? "border-amber-500 bg-amber-500/10 text-amber-500 shadow-md ring-2 ring-amber-500/20"
                              : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30 text-zinc-500 hover:border-zinc-300"
                          }`}
                        >
                          <Icon className="w-6 h-6 mb-2" />
                          <span className="text-xs font-bold uppercase">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {formData.paymentMethod === "card" && (
                    <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                      <div>
                        <input
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleChange}
                          placeholder="Card Number (0000 0000 0000 0000)"
                          className={`w-full p-3.5 bg-white dark:bg-zinc-900 border ${
                            error.cardNumber ? "border-rose-500" : "border-zinc-200 dark:border-zinc-700"
                          } rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none`}
                        />
                        {error.cardNumber && <p className="text-rose-500 text-xs font-bold mt-1">{error.cardNumber}</p>}
                      </div>
                      <div className="flex gap-3">
                        <div className="w-1/2">
                          <input
                            name="expiry"
                            value={formData.expiry}
                            onChange={handleChange}
                            placeholder="MM/YY"
                            className={`w-full p-3.5 bg-white dark:bg-zinc-900 border ${
                              error.expiry ? "border-rose-500" : "border-zinc-200 dark:border-zinc-700"
                            } rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none`}
                          />
                          {error.expiry && <p className="text-rose-500 text-xs font-bold mt-1">{error.expiry}</p>}
                        </div>
                        <div className="w-1/2">
                          <input
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleChange}
                            placeholder="CVV"
                            className={`w-full p-3.5 bg-white dark:bg-zinc-900 border ${
                              error.cvv ? "border-rose-500" : "border-zinc-200 dark:border-zinc-700"
                            } rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none`}
                          />
                          {error.cvv && <p className="text-rose-500 text-xs font-bold mt-1">{error.cvv}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <label htmlFor="promoCode" className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Have a Promo Code? (Try "SAVE10")
                    </label>
                    <div className="relative">
                      <input
                        id="promoCode"
                        name="promoCode"
                        value={formData.promoCode}
                        onChange={handleChange}
                        placeholder="ENTER CODE"
                        className="w-full p-3.5 uppercase tracking-wider bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-sm"
                      />
                      <TagIcon className="w-5 h-5 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2" />
                    </div>
                    {promoMessage && (
                      <p className={`text-xs font-bold mt-1.5 ${discount > 0 ? "text-emerald-500" : "text-rose-500"}`}>
                        {promoMessage}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-5"
                >
                  <div>
                    <h2 className="text-xl font-black uppercase text-zinc-900 dark:text-white tracking-tight">
                      Review Order Details
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Confirm everything before finalizing</p>
                  </div>

                  <div className="space-y-3 bg-zinc-50 dark:bg-zinc-800/40 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-zinc-200 dark:border-zinc-700/50">
                      <span className="font-bold text-zinc-500 uppercase">Buyer:</span>
                      <span className="font-bold text-zinc-900 dark:text-white">{formData.name} ({formData.email})</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-zinc-200 dark:border-zinc-700/50">
                      <span className="font-bold text-zinc-500 uppercase">Contact Phone:</span>
                      <span className="font-bold text-zinc-900 dark:text-white">{formData.phone}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-zinc-200 dark:border-zinc-700/50">
                      <span className="font-bold text-zinc-500 uppercase">Destination:</span>
                      <span className="font-bold text-zinc-900 dark:text-white max-w-[200px] sm:max-w-xs truncate">
                        {formData.shippingAddress?.display_name || "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-zinc-200 dark:border-zinc-700/50">
                      <span className="font-bold text-zinc-500 uppercase">Payment:</span>
                      <span className="font-bold text-amber-500 uppercase">{formData.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between py-1.5 pt-2 text-sm font-black text-zinc-900 dark:text-white">
                      <span>Total Amount:</span>
                      <span className="text-amber-500">{currency} {total.toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form Navigation Controls */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
              {currentStep > 0 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                >
                  Previous
                </button>
              ) : (
                <div />
              )}

              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 transition-all"
                >
                  <span>Continue</span>
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <SparklesIcon className="w-4 h-4" />
                  )}
                  <span>{isSubmitting ? "Processing..." : "Place Order Now"}</span>
                </button>
              )}
            </div>

            {error.submit && (
              <p className="text-rose-500 font-bold text-xs text-center mt-4 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                {error.submit}
              </p>
            )}
          </form>
        </div>

        {/* Desktop Sticky Order Summary Panel */}
        <div className="hidden lg:block lg:col-span-5 xl:col-span-4 sticky top-24">
          <OrderSummary currency={currency} cart={cart} estimatedDelivery={estimatedDelivery} total={total} subtotal={subtotal} shippingCost={shippingCost} discount={discount} />
        </div>
      </div>
    </div>
  );
}

/* --- Sub-Components --- */

const OrderSummary = ({
  currency = "KSH",
  cart = [],
  estimatedDelivery,
  total,
  subtotal,
  shippingCost,
  discount,
}: any) => (
  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xl">
    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
      <ShoppingBagIcon className="w-5 h-5 text-amber-500" />
      <h2 className="text-lg font-black uppercase text-zinc-900 dark:text-white tracking-tight">
        Order Summary
      </h2>
    </div>

    <div className="max-h-[280px] overflow-y-auto pr-2 space-y-4 scrollbar-none mb-6">
      {(cart || []).length === 0 ? (
        <p className="text-xs text-zinc-500 italic">Your cart is currently empty.</p>
      ) : (
        cart.map((item: any, idx: number) => {
          const itemKey = item.selectedOptions
            ? `${item.id}-${Object.values(item.selectedOptions).join("-")}-${idx}`
            : `${item.id}-${idx}`;

          const price = Number(item.finalPrice ?? item.sellingPrice ?? 0);
          const qty = item.quantity || 1;

          return (
            <div key={itemKey} className="flex items-center justify-between gap-3 text-xs">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-zinc-900 dark:text-white truncate">
                  {item.title || item.name}
                </p>
                {item.selectedOptions && (
                  <p className="text-[10px] text-zinc-400">
                    {Object.entries(item.selectedOptions)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(", ")}
                  </p>
                )}
                <p className="text-zinc-500 font-medium">Qty: {qty}</p>
              </div>
              <p className="font-black text-zinc-900 dark:text-zinc-100 shrink-0">
                {currency} {(price * qty).toLocaleString()}
              </p>
            </div>
          );
        })
      )}
    </div>

    <div className="space-y-2.5 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs">
      <div className="flex justify-between text-zinc-500">
        <span>Subtotal</span>
        <span className="font-bold text-zinc-900 dark:text-zinc-200">{currency} {subtotal.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-zinc-500">
        <span>Shipping</span>
        <span className="font-bold text-zinc-900 dark:text-zinc-200">{currency} {shippingCost.toLocaleString()}</span>
      </div>

      {discount > 0 && (
        <div className="flex justify-between text-emerald-500 font-bold">
          <span>Discount (10%)</span>
          <span>-{currency} {((subtotal + shippingCost) * discount).toLocaleString()}</span>
        </div>
      )}

      <div className="flex items-center gap-2 py-2 my-2 bg-amber-500/10 rounded-xl px-3 text-amber-600 dark:text-amber-400 font-bold text-[11px]">
        <CalendarIcon className="w-4 h-4 shrink-0" />
        <span>Est: {estimatedDelivery || "Calculating..."}</span>
      </div>

      <div className="flex justify-between items-center text-base font-black text-zinc-900 dark:text-white pt-2 border-t border-zinc-200 dark:border-zinc-800">
        <span>Total Due</span>
        <span className="text-amber-500">{currency} {total.toLocaleString()}</span>
      </div>
    </div>
  </div>
);

const OrderStatus = ({ success, trackingNumber, router }: any) => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", update);
    update();
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      {success && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={300} />}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 sm:p-10 rounded-3xl shadow-2xl text-center max-w-md w-full relative z-10"
      >
        {success ? (
          <>
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <CheckCircleIcon className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-black uppercase text-zinc-900 dark:text-white tracking-tight">
              Order Confirmed!
            </h2>
            <p className="mt-2 text-xs text-zinc-500 font-medium">
              Your order has been placed. Tracking Number:
            </p>
            <p className="text-sm font-black text-amber-500 my-2 tracking-wider bg-amber-500/10 py-1.5 px-3 rounded-xl inline-block border border-amber-500/20">
              {trackingNumber}
            </p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <XCircleIcon className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-black uppercase text-zinc-900 dark:text-white tracking-tight">
              Order Failed
            </h2>
            <p className="mt-2 text-xs text-zinc-500 font-medium">
              We couldn't process your transaction. Please try again.
            </p>
          </>
        )}

        <div className="mt-8 space-y-3">
          {success && (
            <button
              onClick={() => router.push(`/ghuba/orderTracking?trackingNumber=${trackingNumber}`)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all"
            >
              Track Order Status
            </button>
          )}
          <button
            onClick={() => router.push("/ghuba/feed")}
            className="w-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Return to Feed</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
