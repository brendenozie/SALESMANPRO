"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
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

// Animation variants for tab content
const tabVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.2, ease: "easeIn" } },
};

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
        router.push("/ghuba/rider/onboarding");
        return;
      }

      const activeRes = await fetch("/api/rider/deliveries/active");
      const activeData = await activeRes.json();
      if (activeData?.success && (activeData?.data || activeData?.delivery)) {
        setActiveDelivery(activeData.data || activeData.delivery);
      } else {
        setActiveDelivery(null);
      }

      const availRes = await fetch("/api/rider/deliveries/available");
      const availData = await availRes.json();
      if (availData?.success && availData?.data) {
        setAvailableDeliveries(availData.data);
      }

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
    const interval = setInterval(fetchDashboardData, 20000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // 2. GPS Beacon
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

    navigator.geolocation.getCurrentPosition(
      (pos) => sendLocationUpdate(pos.coords),
      () => setGpsStatus("DENIED"),
      { enableHighAccuracy: true, timeout: 10000 }
    );

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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <ArrowPathIcon className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading Rider Dashboard...</p>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: "ACTIVE", label: "Active Job", showBadge: !!activeDelivery },
    { id: "NEARBY", label: `Nearby (${availableDeliveries.length})`, showBadge: false },
    { id: "EARNINGS", label: "Wallet", showBadge: false },
    { id: "SETTINGS", label: "Profile", showBadge: false },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-300 font-sans">
      <Toaster position="top-right" />

      {/* Top Bar - Glassmorphism */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-3 transition-colors duration-300">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
              <TruckIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base md:text-lg text-slate-900 dark:text-white">
                  {profile?.fullName || "Rider Portal"}
                </h1>
                {profile?.verificationStatus === "APPROVED" ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                    <ShieldCheckIcon className="w-3 h-3" /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                    <ClockIcon className="w-3 h-3" /> {profile?.verificationStatus || "Pending"}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {profile?.operatingCity}, {profile?.operatingCounty} • {profile?.vehicle?.plateNumber || "Bicycle"}
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchDashboardData()}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Refresh feed"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </motion.button>
        </div>
      </header>

      {/* Verification Notice */}
      {profile && profile.verificationStatus !== "APPROVED" && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto px-4 mt-5">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-start gap-3 shadow-sm">
            <ExclamationTriangleIcon className="w-6 h-6 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div className="text-sm leading-relaxed">
              <p className="font-bold text-amber-900 dark:text-amber-200 mb-1">Account Under Review</p>
              Your documents and vehicle verification are currently being reviewed by administrators. Once approved, you can toggle online and receive deliveries.
            </div>
          </div>
        </motion.div>
      )}

      {/* Availability & GPS Broadcast Status Card */}
      <section className="max-w-4xl mx-auto px-4 mt-5">
        <motion.div
          layout
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition-colors duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  isOnline
                    ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 ring-4 ring-emerald-100 dark:ring-emerald-500/30"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                }`}
              >
                <SignalIcon className={`w-7 h-7 ${isOnline ? "animate-pulse" : ""}`} />
              </div>
              {isOnline && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 animate-ping" />
              )}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Dispatch Status</p>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                {isOnline ? "ONLINE - Ready for Jobs" : "OFFLINE"}
              </h2>
              <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  GPS:{" "}
                  <strong className={gpsStatus === "ACTIVE" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
                    {gpsStatus}
                  </strong>
                </span>
                {lastPingTime && <span>• Ping: {lastPingTime}</span>}
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleToggleOnline}
            disabled={togglingOnline || profile?.verificationStatus !== "APPROVED"}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
              isOnline
                ? "bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 dark:shadow-emerald-600/30"
            } disabled:opacity-50`}
          >
            {togglingOnline ? (
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
            ) : isOnline ? (
              "Go Offline"
            ) : (
              "Go Online"
            )}
          </motion.button>
        </motion.div>
      </section>

      {/* Tabs */}
      <section className="max-w-4xl mx-auto px-4 mt-8">
        <div className="flex p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative flex-1 py-2.5 px-4 text-xs sm:text-sm font-bold rounded-xl transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-emerald-600 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                {tab.label}
                {tab.showBadge && (
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                )}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Tab Content with Framer Motion AnimatePresence */}
      <section className="max-w-4xl mx-auto px-4 mt-6">
        <AnimatePresence mode="wait">
          {/* Tab 1: Active Delivery */}
          {activeTab === "ACTIVE" && (
            <motion.div key="ACTIVE" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
              {activeDelivery ? (
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/30 shadow-2xl shadow-emerald-900/5 dark:shadow-none space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                        Assigned Job
                      </span>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">Order #{activeDelivery.orderNumber}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Net Payout</p>
                      <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                        KES {(activeDelivery.financials?.netEarnings ?? (activeDelivery.riderFee * 0.96)).toLocaleString()}
                      </p>
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
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
                         <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/40 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <ShieldCheckIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                              <span className="font-bold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                                Escrow Secured: KES {escAmount.toLocaleString()}
                              </span>
                            </div>
                            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-200/50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                              {escStatus}
                            </span>
                          </div>
                          <p className="text-[11px] sm:text-xs text-emerald-700 dark:text-emerald-200/90 leading-relaxed font-medium">
                            Payment was deposited into Ghuba Escrow by the store before dispatch. Ghuba takes a 4% platform transaction fee (KES {platformFee.toFixed(2)}). Upon OTP handover to the customer, your guaranteed payout of <strong>KES {netPayout.toLocaleString()}</strong> will be automatically credited to your wallet for immediate withdrawal.
                          </p>
                        </div>
                      );
                    } else if (payType === "CASH_ON_PICKUP") {
                      return (
                        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/40 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <BanknotesIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                              <span className="font-bold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300">
                                Cash On Pickup: Collect KES {activeDelivery.riderFee.toLocaleString()} From Store
                              </span>
                            </div>
                            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-200/50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
                              Cash Settlement
                            </span>
                          </div>
                          <p className="text-[11px] sm:text-xs text-amber-700 dark:text-amber-200/90 leading-relaxed font-medium">
                            Collect your full delivery fee of <strong>KES {activeDelivery.riderFee.toLocaleString()} in cash</strong> directly from the store at pickup. Ghuba's 4% platform transaction fee (KES {platformFee.toFixed(2)}) will be debited from your balance upon trip completion.
                          </p>
                        </div>
                      );
                    } else {
                      return (
                        <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/40 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <BanknotesIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              <span className="font-bold text-xs uppercase tracking-wider text-blue-800 dark:text-blue-300">
                                Cash On Delivery: Collect KES {activeDelivery.riderFee.toLocaleString()} From Customer
                              </span>
                            </div>
                            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-200/50 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30">
                              Cash Settlement
                            </span>
                          </div>
                          <p className="text-[11px] sm:text-xs text-blue-700 dark:text-blue-200/90 leading-relaxed font-medium">
                            Collect your delivery fee of <strong>KES {activeDelivery.riderFee.toLocaleString()} in cash</strong> directly from the customer at dropoff. Ghuba's 4% platform transaction fee (KES {platformFee.toFixed(2)}) will be debited from your balance upon trip completion.
                          </p>
                        </div>
                      );
                    }
                  })()}

                  {/* Status Banner */}
                  <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">Current Phase:</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                      {activeDelivery.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  {/* Waypoint details with timeline line */}
                  <div className="relative space-y-4 text-sm">
                    {/* Visual Line */}
                    <div className="absolute top-10 bottom-10 left-[21px] w-0.5 bg-slate-200 dark:bg-slate-800 rounded-full hidden sm:block z-0" />

                    {/* Pickup */}
                    <div className="relative z-10 flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-inner">
                        <MapPinIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">
                          Step 1: Pick Up from Store
                        </p>
                        <p className="text-base font-black text-slate-900 dark:text-white mt-1">
                          {activeDelivery.storeName || "Store Partner"}
                        </p>
                        <p className="text-slate-600 dark:text-slate-300 font-medium text-sm mt-1">{activeDelivery.pickupAddress}</p>
                        {activeDelivery.pickupLat && activeDelivery.pickupLng && (
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${activeDelivery.pickupLat},${activeDelivery.pickupLng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold mt-3 hover:underline"
                          >
                            Navigate to Store <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Dropoff */}
                    <div className="relative z-10 flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-inner">
                        <MapPinIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">
                          Step 2: Deliver to Customer
                        </p>
                        <p className="text-base font-black text-slate-900 dark:text-white mt-1">{activeDelivery.customerName}</p>
                        <p className="text-slate-600 dark:text-slate-300 font-medium text-sm mt-1">{activeDelivery.dropoffAddress}</p>
                        {activeDelivery.customerPhone && (
                          <div className="flex items-center gap-3 mt-3">
                            <a
                              href={`tel:${activeDelivery.customerPhone}`}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold transition-colors"
                            >
                              <PhoneIcon className="w-4 h-4 text-emerald-500" /> Call ({activeDelivery.customerPhone})
                            </a>
                          </div>
                        )}
                        {activeDelivery.dropoffLat && activeDelivery.dropoffLng && (
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${activeDelivery.dropoffLat},${activeDelivery.dropoffLng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold mt-4 hover:underline block"
                          >
                            Navigate to Customer <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => {
                        if (activeDelivery.status === "RIDER_ASSIGNED") handleAdvanceStep("RIDER_EN_ROUTE_TO_PICKUP");
                        else if (activeDelivery.status === "RIDER_EN_ROUTE_TO_PICKUP") handleAdvanceStep("ARRIVED_AT_PICKUP");
                        else if (activeDelivery.status === "ARRIVED_AT_PICKUP") handleAdvanceStep("ORDER_COLLECTED");
                        else if (activeDelivery.status === "ORDER_COLLECTED") handleAdvanceStep("IN_TRANSIT");
                        else if (activeDelivery.status === "IN_TRANSIT") handleAdvanceStep("ARRIVED_AT_DROPOFF");
                        else if (activeDelivery.status === "ARRIVED_AT_DROPOFF") setShowPodModal(true);
                      }}
                      disabled={completingStep}
                      className={`w-full py-4 rounded-2xl font-black text-sm md:text-base shadow-lg transition flex items-center justify-center gap-2 ${
                        activeDelivery.status === "ARRIVED_AT_DROPOFF"
                          ? "bg-emerald-500 hover:bg-emerald-400 text-slate-900 shadow-emerald-500/30"
                          : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
                      }`}
                    >
                      {completingStep ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : 
                       activeDelivery.status === "RIDER_ASSIGNED" ? "I Am En Route to Store" :
                       activeDelivery.status === "RIDER_EN_ROUTE_TO_PICKUP" ? "I Have Arrived at Store" :
                       activeDelivery.status === "ARRIVED_AT_PICKUP" ? "Confirm Package Collected" :
                       activeDelivery.status === "ORDER_COLLECTED" ? "Start Trip to Customer" :
                       activeDelivery.status === "IN_TRANSIT" ? "I Have Arrived at Customer" :
                       <><CheckCircleIcon className="w-6 h-6" /> Complete Delivery & Claim Earnings</>}
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2">
                     <TruckIcon className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="font-black text-xl text-slate-900 dark:text-white">No Active Delivery</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium leading-relaxed">
                    You are currently free for new jobs. Check the Nearby tab for open store delivery requests.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab("NEARBY")}
                    className="mt-4 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-md transition inline-flex items-center gap-2"
                  >
                    Browse Nearby Deliveries <ChevronRightIcon className="w-4 h-4 font-bold" />
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {/* Tab 2: Nearby Deliveries */}
          {activeTab === "NEARBY" && (
            <motion.div key="NEARBY" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-5">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Available Opportunities</h2>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full">
                  Within {profile?.maxDeliveryRadiusKm || 15} km
                </span>
              </div>

              {availableDeliveries.length === 0 ? (
                <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none text-center space-y-4">
                  <ClockIcon className="w-14 h-14 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="font-bold text-lg text-slate-800 dark:text-slate-300">No active requests nearby</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Stay online and keep GPS enabled. When stores near you create delivery requests, they will appear here instantly.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {availableDeliveries.map((job) => (
                    <motion.div
                      whileHover={{ y: -4 }}
                      key={job.id}
                      className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-slate-700 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                {job.packageType || "Standard Parcel"}
                              </span>
                              {job.paymentType === "GHUBA_ESCROW" || !job.paymentType ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                                  🛡️ Escrow Deposited
                                </span>
                              ) : job.paymentType === "CASH_ON_PICKUP" ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                                  💵 Cash on Pickup
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
                                  📦 Cash on Delivery
                                </span>
                              )}
                            </div>
                            <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight">{job.storeName}</h3>
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Net Payout</p>
                            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                              KES {(job.netRiderPayout || (job.offeredFee * 0.96)).toLocaleString()}
                            </p>
                            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                              Gross: KES {job.offeredFee.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                          <div>
                            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Pickup Area</p>
                            <p className="font-bold text-slate-700 dark:text-slate-200 truncate">{job.pickupAddress}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Delivery Area</p>
                            <p className="font-bold text-slate-700 dark:text-slate-200 truncate">{job.approxDropoffAddress}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-5 mt-auto">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          Distance: <strong className="text-slate-800 dark:text-slate-200">{job.distanceKm} km</strong>
                        </span>
                        <div className="flex items-center gap-2">
                          {job.allowBidding && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setBiddingDelivery(job);
                                setBidAmount(job.offeredFee.toString());
                              }}
                              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition"
                            >
                              Bid
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAcceptDelivery(job.id)}
                            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition"
                          >
                            Accept
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Tab 3: Wallet & Earnings */}
          {activeTab === "EARNINGS" && (
            <motion.div key="EARNINGS" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
              {/* Escrow Banner */}
              <div className="p-5 rounded-3xl bg-indigo-50 dark:bg-slate-900 border border-indigo-200 dark:border-indigo-500/30 shadow-xl shadow-indigo-100/50 dark:shadow-none space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
                     <ShieldCheckIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-indigo-900 dark:text-indigo-300">
                    M-Pesa Withdrawal Guarantee
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-indigo-800/80 dark:text-slate-300 leading-relaxed font-medium">
                  When a store uses <strong>Ghuba Escrow</strong>, payment is locked up front. Upon successful delivery, net earnings are credited instantly to your <strong>Available Balance</strong> for direct M-Pesa withdrawal.
                </p>
              </div>

              {/* Balance Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/30 shadow-xl shadow-emerald-100/50 dark:shadow-none flex flex-col justify-between">
                  <div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-extrabold">Available Balance</p>
                    <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2 tracking-tight">
                      KES {(earnings?.availableBalance || 0).toLocaleString()}
                    </h3>
                  </div>
                  <motion.button
                    whileHover={{ scale: (earnings?.availableBalance || 0) >= 100 ? 1.02 : 1 }}
                    whileTap={{ scale: (earnings?.availableBalance || 0) >= 100 ? 0.98 : 1 }}
                    onClick={() => setShowPayoutModal(true)}
                    disabled={(earnings?.availableBalance || 0) < 100}
                    className="mt-5 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-bold transition flex items-center justify-center gap-2"
                  >
                    <BanknotesIcon className="w-5 h-5" /> Withdraw to M-Pesa
                  </motion.button>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-extrabold">Total Earned</p>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
                    KES {(earnings?.totalEarned || 0).toLocaleString()}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-500 mt-3">From {earnings?.completedDeliveriesCount || 0} trips</p>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-extrabold">Pending Payouts</p>
                  <h3 className="text-3xl font-black text-amber-500 dark:text-amber-400 mt-2 tracking-tight">
                    KES {(earnings?.pendingPayouts || 0).toLocaleString()}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-500 mt-3">M-Pesa processing queue</p>
                </div>
              </div>

              {/* Transactions Ledger */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Transaction Ledger</h3>
                {!earnings?.recentLedger || earnings.recentLedger.length === 0 ? (
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-500 py-6 text-center">No transaction records yet</p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                    {earnings.recentLedger.map((item) => (
                      <div key={item.id} className="py-4 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{item.description}</p>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-500 mt-0.5">{new Date(item.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-black text-base ${
                              item.type === "CREDIT" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {item.type === "CREDIT" ? "+" : "-"}KES {item.amount.toLocaleString()}
                          </p>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{item.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Tab 4: Profile & Operating Settings */}
          {activeTab === "SETTINGS" && (
            <motion.div key="SETTINGS" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                     <UserCircleIcon className="w-16 h-16 text-slate-400 dark:text-slate-500" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-slate-900 dark:text-white">{profile?.fullName}</h3>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{profile?.phone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest">Registered Vehicle</span>
                    <p className="font-black text-slate-900 dark:text-white mt-1">
                      {profile?.vehicle?.make} {profile?.vehicle?.model} ({profile?.vehicle?.vehicleType})
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 font-medium text-xs mt-1">{profile?.vehicle?.plateNumber}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest">Operating Area</span>
                    <p className="font-black text-slate-900 dark:text-white mt-1">
                      {profile?.operatingCity}, {profile?.operatingCounty}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 font-medium text-xs mt-1">Max Delivery Radius: {profile?.maxDeliveryRadiusKm} km</p>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    href="/ghuba/rider/onboarding"
                    className="w-full py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-sm font-bold transition flex items-center justify-center gap-2"
                  >
                    Update Verification Documents
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Modals using Framer Motion */}
      <AnimatePresence>
        {/* Modal: Bidding */}
        {biddingDelivery && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-black text-lg text-slate-900 dark:text-white">Place Delivery Bid</h3>
                <button
                  onClick={() => setBiddingDelivery(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="text-sm font-medium text-slate-600 dark:text-slate-300 space-y-1.5 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <p>Store: <strong className="text-slate-900 dark:text-white">{biddingDelivery.storeName}</strong></p>
                <p>Store Offer: <strong className="text-emerald-600 dark:text-emerald-400">KES {biddingDelivery.offeredFee.toLocaleString()}</strong></p>
              </div>

              <form onSubmit={handleSubmitBid} className="space-y-4 text-sm">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1.5 font-bold text-xs uppercase tracking-wider">Your Proposed Fee (KES)</label>
                  <input
                    type="number"
                    required
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-black focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1.5 font-bold text-xs uppercase tracking-wider">Estimated Pickup Time (Mins)</label>
                  <input
                    type="number"
                    required
                    value={bidEta}
                    onChange={(e) => setBidEta(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-black focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setBiddingDelivery(null)}
                    className="flex-1 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold transition hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingBid}
                    className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                  >
                    {submittingBid ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : "Send Bid"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Modal: Proof of Delivery */}
        {showPodModal && activeDelivery && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-black text-lg text-slate-900 dark:text-white">Complete Delivery</h3>
                <button
                  onClick={() => setShowPodModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Provide recipient confirmation details or the customer OTP verification code to confirm handover.
              </p>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1.5 font-bold text-xs uppercase tracking-wider">Delivery OTP (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 4-digit code"
                    value={podCode}
                    onChange={(e) => setPodCode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-black focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition placeholder-slate-300 dark:placeholder-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1.5 font-bold text-xs uppercase tracking-wider">Recipient Notes</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Received by John at reception"
                    value={podNotes}
                    onChange={(e) => setPodNotes(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition placeholder-slate-300 dark:placeholder-slate-600"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowPodModal(false)}
                    className="flex-1 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold transition hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdvanceStep("DELIVERED", { code: podCode, notes: podNotes })}
                    disabled={completingStep}
                    className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                  >
                    {completingStep ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : "Confirm"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Modal: Payout */}
        {showPayoutModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-black text-lg text-slate-900 dark:text-white">M-Pesa Payout</h3>
                <button
                  onClick={() => setShowPayoutModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleRequestPayout} className="space-y-4 text-sm">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1.5 font-bold text-xs uppercase tracking-wider">
                    Amount (Max: KES {(earnings?.availableBalance || 0).toLocaleString()})
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    max={earnings?.availableBalance || 0}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder="Min KES 100"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-black focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition placeholder-slate-300 dark:placeholder-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1.5 font-bold text-xs uppercase tracking-wider">M-Pesa Number</label>
                  <input
                    type="tel"
                    required
                    value={payoutPhone}
                    onChange={(e) => setPayoutPhone(e.target.value)}
                    placeholder="07XXXXXXXX"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-black focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition placeholder-slate-300 dark:placeholder-slate-600"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowPayoutModal(false)}
                    className="flex-1 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold transition hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPayout}
                    className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                  >
                    {submittingPayout ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : "Confirm Payout"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}