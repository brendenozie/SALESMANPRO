"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import {
  TruckIcon,
  MapPinIcon,
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  ArrowTopRightOnSquareIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
  SignalIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

interface ActiveDelivery {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerPhone?: string;
  pickupAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  dropoffAddress: string;
  dropoffLat?: number;
  dropoffLng?: number;
  riderFee: number;
  notes?: string;
  orderTotal?: number;
  createdAt: string;
  storeName?: string;
  paymentType?: "GHUBA_ESCROW" | "CASH_ON_PICKUP" | "CASH_ON_DELIVERY" | string;
  escrowStatus?: "PENDING_DEPOSIT" | "DEPOSITED" | "RELEASED_TO_RIDER" | "REFUNDED" | "NOT_APPLICABLE" | string;
  escrowAmount?: number;
  financials?: {
    agreedFee: number;
    platformCommission: number;
    netEarnings: number;
    paymentType: string;
    escrowStatus: string;
    escrowAmount: number;
  };
}

interface AvailableDelivery {
  id: string;
  storeName: string;
  pickupAddress: string;
  approxDropoffAddress: string;
  distanceKm: number;
  offeredFee: number;
  allowBidding: boolean;
  packageType: string;
  estimatedMinutes?: number;
  expiresAt?: string;
  createdAt: string;
  paymentType?: "GHUBA_ESCROW" | "CASH_ON_PICKUP" | "CASH_ON_DELIVERY" | string;
  escrowStatus?: string;
  escrowAmount?: number;
  transactionFeePercent?: number;
  netRiderPayout?: number;
}

interface EarningsSummary {
  availableBalance: number;
  totalEarned: number;
  pendingPayouts: number;
  completedDeliveriesCount: number;
  recentLedger: Array<{
    id: string;
    type: "CREDIT" | "DEBIT";
    amount: number;
    description: string;
    createdAt: string;
    status: string;
  }>;
}

interface RiderProfile {
  id: string;
  fullName: string;
  phone: string;
  verificationStatus: string;
  isOnline: boolean;
  operatingCounty: string;
  operatingCity: string;
  maxDeliveryRadiusKm: number;
  vehicle?: {
    make: string;
    model: string;
    plateNumber: string;
    vehicleType: string;
  };
}

export default function RiderDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "NEARBY" | "EARNINGS" | "SETTINGS">("ACTIVE");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<RiderProfile | null>(null);
  const [activeDelivery, setActiveDelivery] = useState<ActiveDelivery | null>(null);
  const [availableDeliveries, setAvailableDeliveries] = useState<AvailableDelivery[]>([]);
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);

  // Online / GPS Status
  const [isOnline, setIsOnline] = useState(false);
  const [togglingOnline, setTogglingOnline] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<"ACQUIRING" | "ACTIVE" | "DENIED" | "OFFLINE">("OFFLINE");
  const [lastCoords, setLastCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [lastPingTime, setLastPingTime] = useState<string | null>(null);

  // Modals
  const [biddingDelivery, setBiddingDelivery] = useState<AvailableDelivery | null>(null);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [bidEta, setBidEta] = useState<string>("20");
  const [submittingBid, setSubmittingBid] = useState(false);

  const [completingStep, setCompletingStep] = useState(false);
  const [showPodModal, setShowPodModal] = useState(false);
  const [podCode, setPodCode] = useState("");
  const [podNotes, setPodNotes] = useState("");

  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutPhone, setPayoutPhone] = useState("");
  const [submittingPayout, setSubmittingPayout] = useState(false);

  const gpsWatchId = useRef<number | null>(null);

  // 1. Fetch Profile & Active Status
  const fetchDashboardData = useCallback(async () => {
    try {
      // Profile
      const profRes = await fetch("/api/rider/profile");
      if (profRes.status === 401) {
        router.push("/auth/signin?callbackUrl=/ghuba/rider/dashboard");
        return;
      }
      const profData = await profRes.json();
      if (profData?.success && profData?.data) {
        setProfile(profData.data);
        setIsOnline(profData.data.isOnline ?? false);
        setPayoutPhone(profData.data.phone || "");
      } else if (profRes.status === 404) {
        // Not registered as rider yet
        router.push("/ghuba/rider/onboarding");
        return;
      }

      // Active Delivery
      const activeRes = await fetch("/api/rider/deliveries/active");
      const activeData = await activeRes.json();
      if (activeData?.success && (activeData?.data || activeData?.delivery)) {
        setActiveDelivery(activeData.data || activeData.delivery);
      } else {
        setActiveDelivery(null);
      }

      // Available Deliveries
      const availRes = await fetch("/api/rider/deliveries/available");
      const availData = await availRes.json();
      if (availData?.success && availData?.data) {
        setAvailableDeliveries(availData.data);
      }

      // Earnings
      const earnRes = await fetch("/api/rider/earnings");
      const earnData = await earnRes.json();
      if (earnData?.success && earnData?.data) {
        setEarnings(earnData.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 20000); // Polling every 20s
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // 2. GPS Beacon - Transmit location to server when online
  const sendLocationUpdate = useCallback(async (coords: GeolocationCoordinates) => {
    try {
      const payload = {
        lat: coords.latitude,
        lng: coords.longitude,
        speed: coords.speed ?? 0,
        heading: coords.heading ?? 0,
        accuracy: coords.accuracy,
      };
      setLastCoords({ lat: coords.latitude, lng: coords.longitude });
      setLastPingTime(new Date().toLocaleTimeString());

      await fetch("/api/rider/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setGpsStatus("ACTIVE");
    } catch {
      // Non-blocking location update
    }
  }, []);

  useEffect(() => {
    if (!isOnline) {
      setGpsStatus("OFFLINE");
      if (gpsWatchId.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchId.current);
        gpsWatchId.current = null;
      }
      return;
    }

    if (!("geolocation" in navigator)) {
      setGpsStatus("DENIED");
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setGpsStatus("ACQUIRING");

    // Single immediate fetch
    navigator.geolocation.getCurrentPosition(
      (pos) => sendLocationUpdate(pos.coords),
      () => setGpsStatus("DENIED"),
      { enableHighAccuracy: true, timeout: 10000 }
    );

    // Watch position
    gpsWatchId.current = navigator.geolocation.watchPosition(
      (pos) => sendLocationUpdate(pos.coords),
      (err) => {
        console.warn("GPS error:", err.message);
        if (err.code === 1) setGpsStatus("DENIED");
      },
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 }
    );

    return () => {
      if (gpsWatchId.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchId.current);
        gpsWatchId.current = null;
      }
    };
  }, [isOnline, sendLocationUpdate]);

  // 3. Online/Offline Toggle
  const handleToggleOnline = async () => {
    if (!profile) return;
    if (profile.verificationStatus !== "APPROVED") {
      toast.error("Account must be approved by Super Admin before going online");
      return;
    }

    setTogglingOnline(true);
    const newStatus = !isOnline;

    try {
      const res = await fetch("/api/rider/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnline: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setIsOnline(newStatus);
        toast.success(newStatus ? "You are now ONLINE and ready for jobs" : "You are now OFFLINE");
      } else {
        toast.error(data.message || "Failed to update availability");
      }
    } catch {
      toast.error("Network error toggling status");
    } finally {
      setTogglingOnline(false);
    }
  };

  // 4. Accept Delivery Request
  const handleAcceptDelivery = async (deliveryId: string) => {
    try {
      toast.loading("Accepting assignment...", { id: "accept-job" });
      const res = await fetch(`/api/rider/deliveries/${deliveryId}/accept`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Delivery accepted! Follow pickup directions.", { id: "accept-job" });
        await fetchDashboardData();
        setActiveTab("ACTIVE");
      } else {
        toast.error(data.message || "Could not claim delivery", { id: "accept-job" });
      }
    } catch {
      toast.error("Failed to accept delivery", { id: "accept-job" });
    }
  };

  // 5. Submit Bid
  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!biddingDelivery) return;

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid bid amount");
      return;
    }

    setSubmittingBid(true);
    try {
      const res = await fetch(`/api/rider/deliveries/${biddingDelivery.id}/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bidAmount: amount,
          estimatedMinutes: parseInt(bidEta) || 20,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Bid submitted! Store will review your offer.");
        setBiddingDelivery(null);
        setBidAmount("");
        fetchDashboardData();
      } else {
        toast.error(data.message || "Failed to submit bid");
      }
    } catch {
      toast.error("Network error submitting bid");
    } finally {
      setSubmittingBid(false);
    }
  };

  // 6. Advance Delivery Lifecycle
  const handleAdvanceStep = async (nextStep: string, proof?: { code?: string; notes?: string }) => {
    if (!activeDelivery) return;
    setCompletingStep(true);

    try {
      const res = await fetch(`/api/rider/deliveries/${activeDelivery.id}/step`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: nextStep,
          confirmationCode: proof?.code,
          proofNotes: proof?.notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Status updated: ${nextStep.replace(/_/g, " ")}`);
        setShowPodModal(false);
        setPodCode("");
        setPodNotes("");
        await fetchDashboardData();
      } else {
        toast.error(data.message || "Failed to advance delivery step");
      }
    } catch {
      toast.error("Network error updating status");
    } finally {
      setCompletingStep(false);
    }
  };

  // 7. Request Payout
  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount < 100) {
      toast.error("Minimum payout is KES 100");
      return;
    }
    if (earnings && amount > earnings.availableBalance) {
      toast.error("Amount exceeds available balance");
      return;
    }

    setSubmittingPayout(true);
    try {
      const res = await fetch("/api/rider/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          phone: payoutPhone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Payout request submitted! Processing via M-Pesa.");
        setShowPayoutModal(false);
        setPayoutAmount("");
        fetchDashboardData();
      } else {
        toast.error(data.message || "Payout request failed");
      }
    } catch {
      toast.error("Network error requesting payout");
    } finally {
      setSubmittingPayout(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <ArrowPathIcon className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-sm font-medium text-slate-400">Loading Rider Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <Toaster position="top-right" />

      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <TruckIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base md:text-lg text-white">
                  {profile?.fullName || "Rider Portal"}
                </h1>
                {profile?.verificationStatus === "APPROVED" ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <ShieldCheckIcon className="w-3 h-3" /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <ClockIcon className="w-3 h-3" /> {profile?.verificationStatus || "Pending"}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {profile?.operatingCity}, {profile?.operatingCounty} • {profile?.vehicle?.plateNumber || "Bicycle"}
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchDashboardData()}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Refresh feed"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Verification Notice if not approved */}
      {profile && profile.verificationStatus !== "APPROVED" && (
        <div className="max-w-4xl mx-auto px-4 mt-4">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <p className="font-semibold text-sm text-amber-200">Account Under Review</p>
              Your documents and vehicle verification are currently being reviewed by administrators. Once approved, you can toggle online and receive deliveries.
            </div>
          </div>
        </div>
      )}

      {/* Availability & GPS Broadcast Status Card */}
      <section className="max-w-4xl mx-auto px-4 mt-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  isOnline
                    ? "bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/50"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                <SignalIcon className={`w-6 h-6 ${isOnline ? "animate-pulse" : ""}`} />
              </div>
              {isOnline && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900 animate-ping" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Dispatch Status</p>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {isOnline ? "ONLINE - Ready for Jobs" : "OFFLINE"}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                <span>
                  GPS:{" "}
                  <strong className={gpsStatus === "ACTIVE" ? "text-emerald-400" : "text-amber-400"}>
                    {gpsStatus}
                  </strong>
                </span>
                {lastPingTime && <span>• Ping: {lastPingTime}</span>}
              </div>
            </div>
          </div>

          <button
            onClick={handleToggleOnline}
            disabled={togglingOnline || profile?.verificationStatus !== "APPROVED"}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition flex items-center justify-center gap-2 ${
              isOnline
                ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
            } disabled:opacity-50`}
          >
            {togglingOnline ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
            ) : isOnline ? (
              "Go Offline"
            ) : (
              "Go Online"
            )}
          </button>
        </div>
      </section>

      {/* Tabs */}
      <section className="max-w-4xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab("ACTIVE")}
            className={`py-2 text-xs font-bold rounded-lg transition relative ${
              activeTab === "ACTIVE" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Active Job
            {activeDelivery && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("NEARBY")}
            className={`py-2 text-xs font-bold rounded-lg transition ${
              activeTab === "NEARBY" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Nearby ({availableDeliveries.length})
          </button>
          <button
            onClick={() => setActiveTab("EARNINGS")}
            className={`py-2 text-xs font-bold rounded-lg transition ${
              activeTab === "EARNINGS" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Wallet
          </button>
          <button
            onClick={() => setActiveTab("SETTINGS")}
            className={`py-2 text-xs font-bold rounded-lg transition ${
              activeTab === "SETTINGS" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Profile
          </button>
        </div>
      </section>

      {/* Tab 1: Active Delivery */}
      {activeTab === "ACTIVE" && (
        <section className="max-w-4xl mx-auto px-4 mt-6 space-y-4">
          {activeDelivery ? (
            <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                    Assigned Job
                  </span>
                  <h3 className="text-base font-bold text-white">Order #{activeDelivery.orderNumber}</h3>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Net Payout</p>
                  <p className="text-lg font-extrabold text-emerald-400">
                    KES {(activeDelivery.financials?.netEarnings ?? (activeDelivery.riderFee * 0.96)).toLocaleString()}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Gross Fee: KES {activeDelivery.riderFee?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment & Escrow Guarantee Notice */}
              {(() => {
                const payType = activeDelivery.financials?.paymentType || activeDelivery.paymentType || "GHUBA_ESCROW";
                const escStatus = activeDelivery.financials?.escrowStatus || activeDelivery.escrowStatus || "DEPOSITED";
                const escAmount = activeDelivery.financials?.escrowAmount ?? activeDelivery.escrowAmount ?? activeDelivery.riderFee;
                const netPayout = activeDelivery.financials?.netEarnings ?? (activeDelivery.riderFee * 0.96);
                const platformFee = activeDelivery.financials?.platformCommission ?? (activeDelivery.riderFee * 0.04);

                if (payType === "GHUBA_ESCROW") {
                  return (
                    <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheckIcon className="w-5 h-5 text-emerald-400" />
                          <span className="font-black text-xs uppercase tracking-wider text-emerald-300">
                            Ghuba Escrow Secured: KES {escAmount.toLocaleString()} Deposited
                          </span>
                        </div>
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {escStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                        Payment was deposited into Ghuba Escrow by the store before dispatch. Ghuba takes a 4% platform transaction fee (KES {platformFee.toFixed(2)}). Upon OTP handover to the customer, your guaranteed payout of <strong>KES {netPayout.toLocaleString()}</strong> will be automatically credited to your Ghuba wallet for immediate M-Pesa withdrawal.
                      </p>
                    </div>
                  );
                } else if (payType === "CASH_ON_PICKUP") {
                  return (
                    <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BanknotesIcon className="w-5 h-5 text-amber-400" />
                          <span className="font-black text-xs uppercase tracking-wider text-amber-300">
                            Cash On Pickup: Collect KES {activeDelivery.riderFee.toLocaleString()} From Store
                          </span>
                        </div>
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Cash Settlement
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-200/90 leading-relaxed">
                        Collect your full delivery fee of <strong>KES {activeDelivery.riderFee.toLocaleString()} in cash</strong> directly from the store at pickup. Ghuba's 4% platform transaction fee (KES {platformFee.toFixed(2)}) will be debited from your Ghuba wallet balance upon trip completion.
                      </p>
                    </div>
                  );
                } else {
                  return (
                    <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BanknotesIcon className="w-5 h-5 text-blue-400" />
                          <span className="font-black text-xs uppercase tracking-wider text-blue-300">
                            Cash On Delivery: Collect KES {activeDelivery.riderFee.toLocaleString()} From Customer
                          </span>
                        </div>
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          Cash Settlement
                        </span>
                      </div>
                      <p className="text-[11px] text-blue-200/90 leading-relaxed">
                        Collect your delivery fee of <strong>KES {activeDelivery.riderFee.toLocaleString()} in cash</strong> directly from the customer at dropoff. Ghuba's 4% platform transaction fee (KES {platformFee.toFixed(2)}) will be debited from your Ghuba wallet balance upon trip completion.
                      </p>
                    </div>
                  );
                }
              })()}

              {/* Status Banner */}
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
                <span className="text-slate-400">Current Phase:</span>
                <span className="font-bold text-emerald-400 uppercase tracking-wide">
                  {activeDelivery.status.replace(/_/g, " ")}
                </span>
              </div>

              {/* Waypoint details */}
              <div className="space-y-4 text-xs">
                {/* Pickup */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
                    <MapPinIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                      Step 1: Pick Up from Store
                    </p>
                    <p className="text-sm font-bold text-white mt-0.5">
                      {activeDelivery.storeName || "Store Partner"}
                    </p>
                    <p className="text-slate-300 mt-0.5">{activeDelivery.pickupAddress}</p>
                    {activeDelivery.pickupLat && activeDelivery.pickupLng && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${activeDelivery.pickupLat},${activeDelivery.pickupLng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-400 font-semibold mt-2 hover:underline"
                      >
                        Navigate to Store <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Dropoff */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5">
                    <MapPinIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                      Step 2: Deliver to Customer
                    </p>
                    <p className="text-sm font-bold text-white mt-0.5">{activeDelivery.customerName}</p>
                    <p className="text-slate-300 mt-0.5">{activeDelivery.dropoffAddress}</p>
                    {activeDelivery.customerPhone && (
                      <div className="flex items-center gap-3 mt-2">
                        <a
                          href={`tel:${activeDelivery.customerPhone}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold"
                        >
                          <PhoneIcon className="w-3.5 h-3.5" /> Call Customer ({activeDelivery.customerPhone})
                        </a>
                      </div>
                    )}
                    {activeDelivery.dropoffLat && activeDelivery.dropoffLng && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${activeDelivery.dropoffLat},${activeDelivery.dropoffLng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-amber-400 font-semibold mt-2 hover:underline block"
                      >
                        Navigate to Customer <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons mapped to state */}
              <div className="pt-2">
                {activeDelivery.status === "RIDER_ASSIGNED" && (
                  <button
                    onClick={() => handleAdvanceStep("RIDER_EN_ROUTE_TO_PICKUP")}
                    disabled={completingStep}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                  >
                    {completingStep ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : "I Am En Route to Store"}
                  </button>
                )}

                {activeDelivery.status === "RIDER_EN_ROUTE_TO_PICKUP" && (
                  <button
                    onClick={() => handleAdvanceStep("ARRIVED_AT_PICKUP")}
                    disabled={completingStep}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                  >
                    {completingStep ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : "I Have Arrived at Store"}
                  </button>
                )}

                {activeDelivery.status === "ARRIVED_AT_PICKUP" && (
                  <button
                    onClick={() => handleAdvanceStep("ORDER_COLLECTED")}
                    disabled={completingStep}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                  >
                    {completingStep ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : "Confirm Package Collected"}
                  </button>
                )}

                {activeDelivery.status === "ORDER_COLLECTED" && (
                  <button
                    onClick={() => handleAdvanceStep("IN_TRANSIT")}
                    disabled={completingStep}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                  >
                    {completingStep ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : "Start Trip to Customer"}
                  </button>
                )}

                {activeDelivery.status === "IN_TRANSIT" && (
                  <button
                    onClick={() => handleAdvanceStep("ARRIVED_AT_DROPOFF")}
                    disabled={completingStep}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                  >
                    {completingStep ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : "I Have Arrived at Customer"}
                  </button>
                )}

                {activeDelivery.status === "ARRIVED_AT_DROPOFF" && (
                  <button
                    onClick={() => setShowPodModal(true)}
                    className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircleIcon className="w-5 h-5" /> Complete Delivery & Claim Earnings
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <TruckIcon className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="font-bold text-base text-white">No Active Delivery</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You are currently free for new jobs. Check the Nearby tab for open store delivery requests.
              </p>
              <button
                onClick={() => setActiveTab("NEARBY")}
                className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition inline-flex items-center gap-1.5"
              >
                Browse Nearby Deliveries <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>
      )}

      {/* Tab 2: Nearby Deliveries Marketplace */}
      {activeTab === "NEARBY" && (
        <section className="max-w-4xl mx-auto px-4 mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Available Opportunities</h2>
            <span className="text-xs text-slate-400">Within {profile?.maxDeliveryRadiusKm || 15} km</span>
          </div>

          {availableDeliveries.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <ClockIcon className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="font-semibold text-sm text-slate-300">No active delivery requests nearby</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Stay online and keep GPS enabled. When stores near you create delivery requests, they will appear here instantly.
              </p>
            </div>
          ) : (
            availableDeliveries.map((job) => (
              <div
                key={job.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                        {job.packageType || "Standard Parcel"}
                      </span>
                      {job.paymentType === "GHUBA_ESCROW" || !job.paymentType ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          🛡️ Escrow Deposited
                        </span>
                      ) : job.paymentType === "CASH_ON_PICKUP" ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          💵 Cash on Pickup
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                          📦 Cash on Delivery
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-white mt-1">{job.storeName}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Net Payout</p>
                    <p className="text-base font-extrabold text-emerald-400">
                      KES {(job.netRiderPayout || (job.offeredFee * 0.96)).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Gross: KES {job.offeredFee.toLocaleString()} ({job.transactionFeePercent || 4}% fee)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase">Pickup Area</p>
                    <p className="font-semibold text-slate-200 truncate">{job.pickupAddress}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase">Delivery Area</p>
                    <p className="font-semibold text-slate-200 truncate">{job.approxDropoffAddress}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-400 font-medium">
                    Distance: <strong>{job.distanceKm} km</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    {job.allowBidding && (
                      <button
                        onClick={() => {
                          setBiddingDelivery(job);
                          setBidAmount(job.offeredFee.toString());
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                      >
                        Place Bid
                      </button>
                    )}
                    <button
                      onClick={() => handleAcceptDelivery(job.id)}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition"
                    >
                      Accept Job
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {/* Tab 3: Wallet & Earnings */}
      {activeTab === "EARNINGS" && (
        <section className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
          {/* Escrow Deposit & Payout Explainer Banner */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/30 shadow-xl space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-indigo-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Ghuba Escrow Deposits & M-Pesa Withdrawal Guarantee
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              When a store requests a delivery or accepts your bid with <strong>Ghuba Escrow</strong>, the payment is deposited and locked in escrow up front. Once you complete the delivery with recipient confirmation, your net earnings (after the 4% platform transaction fee) are instantly credited to your <strong>Available Balance</strong>. You can request to withdraw your deposits anytime directly to your registered M-Pesa phone number.
            </p>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-xl">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Available Balance</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">
                KES {(earnings?.availableBalance || 0).toLocaleString()}
              </h3>
              <button
                onClick={() => setShowPayoutModal(true)}
                disabled={(earnings?.availableBalance || 0) < 100}
                className="mt-3 w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <BanknotesIcon className="w-4 h-4" /> Withdraw via M-Pesa
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Earned</p>
              <h3 className="text-2xl font-black text-white mt-1">
                KES {(earnings?.totalEarned || 0).toLocaleString()}
              </h3>
              <p className="text-xs text-slate-500 mt-3">From {earnings?.completedDeliveriesCount || 0} completed trips</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Pending Payouts</p>
              <h3 className="text-2xl font-black text-amber-400 mt-1">
                KES {(earnings?.pendingPayouts || 0).toLocaleString()}
              </h3>
              <p className="text-xs text-slate-500 mt-3">M-Pesa processing queue</p>
            </div>
          </div>

          {/* Transactions Ledger */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Transaction Ledger</h3>
            {!earnings?.recentLedger || earnings.recentLedger.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No transaction records yet</p>
            ) : (
              <div className="divide-y divide-slate-800 text-xs">
                {earnings.recentLedger.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-200">{item.description}</p>
                      <p className="text-[11px] text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold text-sm ${
                          item.type === "CREDIT" ? "text-emerald-400" : "text-amber-400"
                        }`}
                      >
                        {item.type === "CREDIT" ? "+" : "-"}KES {item.amount.toLocaleString()}
                      </p>
                      <span className="text-[10px] text-slate-400 uppercase">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Tab 4: Profile & Operating Settings */}
      {activeTab === "SETTINGS" && (
        <section className="max-w-4xl mx-auto px-4 mt-6 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <UserCircleIcon className="w-12 h-12 text-slate-400" />
              <div>
                <h3 className="font-bold text-base text-white">{profile?.fullName}</h3>
                <p className="text-xs text-slate-400">{profile?.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-800">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase">Registered Vehicle</span>
                <p className="font-bold text-white mt-0.5">
                  {profile?.vehicle?.make} {profile?.vehicle?.model} ({profile?.vehicle?.vehicleType})
                </p>
                <p className="text-slate-400">{profile?.vehicle?.plateNumber}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase">Operating Area</span>
                <p className="font-bold text-white mt-0.5">
                  {profile?.operatingCity}, {profile?.operatingCounty}
                </p>
                <p className="text-slate-400">Max Delivery Radius: {profile?.maxDeliveryRadiusKm} km</p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/ghuba/rider/onboarding"
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center justify-center gap-2"
              >
                Update Verification Documents
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Modal: Bidding */}
      {biddingDelivery && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Place Delivery Bid</h3>
              <button
                onClick={() => setBiddingDelivery(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <p>Store: <strong>{biddingDelivery.storeName}</strong></p>
              <p>Store Offer: <strong>KES {biddingDelivery.offeredFee.toLocaleString()}</strong></p>
            </div>

            <form onSubmit={handleSubmitBid} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Your Proposed Fee (KES)</label>
                <input
                  type="number"
                  required
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Estimated Pickup Time (Minutes)</label>
                <input
                  type="number"
                  required
                  value={bidEta}
                  onChange={(e) => setBidEta(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBiddingDelivery(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold transition hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBid}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-1.5"
                >
                  {submittingBid ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : "Send Bid"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Proof of Delivery */}
      {showPodModal && activeDelivery && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Complete Delivery Proof</h3>
              <button
                onClick={() => setShowPodModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Provide recipient confirmation details or the customer OTP verification code to confirm handover.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Delivery OTP / Confirmation Code</label>
                <input
                  type="text"
                  placeholder="e.g. 4-digit code if supplied"
                  value={podCode}
                  onChange={(e) => setPodCode(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Recipient Notes / Name</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Received by customer at front door"
                  value={podNotes}
                  onChange={(e) => setPodNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPodModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold transition hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleAdvanceStep("DELIVERED", { code: podCode, notes: podNotes })}
                  disabled={completingStep}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-1.5"
                >
                  {completingStep ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : "Confirm Handover"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Payout */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">M-Pesa Payout Request</h3>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Amount (KES) - Max: KES {(earnings?.availableBalance || 0).toLocaleString()}
                </label>
                <input
                  type="number"
                  required
                  min={100}
                  max={earnings?.availableBalance || 0}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="Min KES 100"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">M-Pesa Phone Number</label>
                <input
                  type="tel"
                  required
                  value={payoutPhone}
                  onChange={(e) => setPayoutPhone(e.target.value)}
                  placeholder="07XXXXXXXX or 2547XXXXXXXX"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold transition hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayout}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-1.5"
                >
                  {submittingPayout ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : "Confirm Payout"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
