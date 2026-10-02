"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  XMarkIcon,
  TruckIcon,
  MapPinIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

interface RequestExternalRiderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: any[];
  companyId: string;
  onSuccess: () => void;
}

export default function RequestExternalRiderModal({
  isOpen,
  onClose,
  orders,
  companyId,
  onSuccess,
}: RequestExternalRiderModalProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [pickupAddress, setPickupAddress] = useState<string>("");
  const [pickupLat, setPickupLat] = useState<number>(-1.286389);
  const [pickupLng, setPickupLng] = useState<number>(36.817223);
  const [dropoffAddress, setDropoffAddress] = useState<string>("");
  const [dropoffLat, setDropoffLat] = useState<number>(-1.292066);
  const [dropoffLng, setDropoffLng] = useState<number>(36.821946);
  const [customerName, setCustomerName] = useState<string>("");
  const [offeredFee, setOfferedFee] = useState<number>(250);
  const [paymentType, setPaymentType] = useState<"GHUBA_ESCROW" | "CASH_ON_PICKUP" | "CASH_ON_DELIVERY">("GHUBA_ESCROW");
  const [allowBidding, setAllowBidding] = useState<boolean>(true);
  const [packageType, setPackageType] = useState<string>("Standard Box");
  const [requiredVehicle, setRequiredVehicle] = useState<string>("MOTORBIKE");
  const [priority, setPriority] = useState<string>("NORMAL");
  const [specialInstructions, setSpecialInstructions] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    if (orders && orders.length > 0) {
      const first = orders[0];
      setSelectedOrderId(first.id || first.orderId || "");
      setPickupAddress(first.pickupAddress || "Store Central Hub");
      setDropoffAddress(first.deliveryAddress || "");
      setCustomerName(first.customerName || "Customer");
      setCustomerPhone(first.customerPhone || "");
      setPackageType(first.productName || "Standard Parcel");
      if (first.lat && first.lng) {
        setDropoffLat(first.lat);
        setDropoffLng(first.lng);
      }
    }
  }, [isOpen, orders]);

  const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedOrderId(id);
    const order = orders.find((o) => (o.id || o.orderId) === id);
    if (order) {
      setPickupAddress(order.pickupAddress || "Store Central Hub");
      setDropoffAddress(order.deliveryAddress || "");
      setCustomerName(order.customerName || "Customer");
      setCustomerPhone(order.customerPhone || "");
      setPackageType(order.productName || "Standard Parcel");
      if (order.lat && order.lng) {
        setDropoffLat(order.lat);
        setDropoffLng(order.lng);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) {
      toast.error("Please select an eligible order");
      return;
    }
    if (!dropoffAddress) {
      toast.error("Drop-off address is required");
      return;
    }
    if (offeredFee < 50) {
      toast.error("Minimum offered fee is KES 50");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        companyId,
        orderId: selectedOrderId,
        pickupAddress,
        pickupLat,
        pickupLng,
        dropoffAddress,
        dropoffLat,
        dropoffLng,
        customerName,
        customerPhone,
        offeredFee: Number(offeredFee),
        paymentType,
        allowBidding,
        packageType,
        requiredVehicle,
        priority,
        specialInstructions,
      };

      const res = await fetch("/api/admin/delivery-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("External Rider Request broadcasted to nearby riders!");
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Failed to create delivery request");
      }
    } catch {
      toast.error("Network error creating request");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8 border border-slate-100">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <TruckIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">
                On-Demand Dispatch
              </span>
              <h2 className="text-xl font-black">Request External Rider</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-sm">
          {/* Order Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Customer Order to Dispatch
            </label>
            <select
              value={selectedOrderId}
              onChange={handleOrderChange}
              required
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Choose an order --</option>
              {orders.map((o) => (
                <option key={o.id || o.orderId} value={o.id || o.orderId}>
                  #{o.id?.slice(-6) || o.orderId?.slice(-6)} - {o.customerName} ({o.deliveryAddress})
                </option>
              ))}
            </select>
          </div>

          {/* Locations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                <MapPinIcon className="w-4 h-4" /> Pickup Point (Store)
              </div>
              <input
                type="text"
                required
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Store address or warehouse"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                <MapPinIcon className="w-4 h-4" /> Delivery Destination
              </div>
              <input
                type="text"
                required
                value={dropoffAddress}
                onChange={(e) => setDropoffAddress(e.target.value)}
                placeholder="Customer delivery address"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Customer Privacy & Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Customer Name</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Customer Phone</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Protected: Revealed to rider only upon assignment.
              </span>
            </div>
          </div>

          {/* Pricing & Bidding */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs uppercase tracking-wider">
                <BanknotesIcon className="w-4 h-4 text-indigo-600" /> Rider Delivery Fee & Settlement
              </div>
              <span className="text-xs font-bold text-indigo-600">KES {offeredFee}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Offered Delivery Fee (KES)</label>
                <input
                  type="number"
                  min={50}
                  step={10}
                  required
                  value={offeredFee}
                  onChange={(e) => setOfferedFee(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-indigo-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allowBidding}
                    onChange={(e) => setAllowBidding(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Allow nearby riders to submit bids
                  </span>
                </label>
              </div>
            </div>

            {/* Payment & Escrow Model Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Payment & Deposit Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentType("GHUBA_ESCROW")}
                  className={`p-3 rounded-xl border text-left transition ${
                    paymentType === "GHUBA_ESCROW"
                      ? "border-emerald-500 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-500/30"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <p className="font-bold text-xs">Deposit to Ghuba</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Escrow secured (Card / M-Pesa)</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentType("CASH_ON_PICKUP")}
                  className={`p-3 rounded-xl border text-left transition ${
                    paymentType === "CASH_ON_PICKUP"
                      ? "border-amber-500 bg-amber-50/80 text-amber-950 ring-2 ring-amber-500/30"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <p className="font-bold text-xs">Cash on Pickup</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Store pays rider directly</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentType("CASH_ON_DELIVERY")}
                  className={`p-3 rounded-xl border text-left transition ${
                    paymentType === "CASH_ON_DELIVERY"
                      ? "border-blue-500 bg-blue-50/80 text-blue-950 ring-2 ring-blue-500/30"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <p className="font-bold text-xs">Cash on Delivery</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Customer pays rider</p>
                </button>
              </div>
            </div>

            {/* Transparent Fee & Escrow Breakdown */}
            <div className="bg-white/80 p-3 rounded-xl border border-indigo-100 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Gross Delivery Fee:</span>
                <span className="font-bold text-slate-900">KES {offeredFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Ghuba Platform Transaction Cost (4%):</span>
                <span className="font-semibold text-rose-600">-KES {Math.round(offeredFee * 0.04).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold border-t border-slate-100 pt-1.5">
                <span>Rider Net Payout:</span>
                <span>KES {(offeredFee - Math.round(offeredFee * 0.04)).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-[11px] text-indigo-900/80 bg-white/70 p-2.5 rounded-xl border border-indigo-100">
              <InformationCircleIcon className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
              <span>
                {paymentType === "GHUBA_ESCROW" &&
                  `KES ${offeredFee} will be held in Ghuba Escrow. The rider is notified that payment is deposited, and funds are automatically credited upon successful handover.`}
                {paymentType === "CASH_ON_PICKUP" &&
                  `No upfront deposit to Ghuba. Your store will pay KES ${offeredFee} in cash to the rider at pickup. Ghuba deducts the 4% transaction fee from the rider.`}
                {paymentType === "CASH_ON_DELIVERY" &&
                  `The customer will pay KES ${offeredFee} in cash to the rider at dropoff. Ghuba deducts the 4% transaction fee from the rider.`}
              </span>
            </div>
          </div>

          {/* Vehicle & Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Vehicle Category</label>
              <select
                value={requiredVehicle}
                onChange={(e) => setRequiredVehicle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500"
              >
                <option value="MOTORBIKE">Motorbike (Fastest)</option>
                <option value="BICYCLE">Bicycle (Eco / Short)</option>
                <option value="CAR">Car</option>
                <option value="VAN">Van (Bulky)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Package Type</label>
              <input
                type="text"
                value={packageType}
                onChange={(e) => setPackageType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Dispatch Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500"
              >
                <option value="NORMAL">Normal Priority</option>
                <option value="URGENT">Urgent Express</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Special Rider Instructions</label>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Fragile items, deliver to gate security, call upon reaching landmark"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-7 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" /> Broadcasting...
                </>
              ) : (
                <>
                  <TruckIcon className="w-4 h-4" /> Broadcast Request to Riders
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
