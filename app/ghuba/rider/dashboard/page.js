"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { TruckIcon, MapPinIcon, BanknotesIcon, CheckCircleIcon, XCircleIcon, ClockIcon, ArrowPathIcon, ShieldCheckIcon, ExclamationTriangleIcon, PhoneIcon, ArrowTopRightOnSquareIcon, UserCircleIcon, SignalIcon, ChevronRightIcon, } from "@heroicons/react/24/outline";
export default function RiderDashboardPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("ACTIVE");
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [activeDelivery, setActiveDelivery] = useState(null);
    const [availableDeliveries, setAvailableDeliveries] = useState([]);
    const [earnings, setEarnings] = useState(null);
    // Online / GPS Status
    const [isOnline, setIsOnline] = useState(false);
    const [togglingOnline, setTogglingOnline] = useState(false);
    const [gpsStatus, setGpsStatus] = useState("OFFLINE");
    const [lastCoords, setLastCoords] = useState(null);
    const [lastPingTime, setLastPingTime] = useState(null);
    // Modals
    const [biddingDelivery, setBiddingDelivery] = useState(null);
    const [bidAmount, setBidAmount] = useState("");
    const [bidEta, setBidEta] = useState("20");
    const [submittingBid, setSubmittingBid] = useState(false);
    const [completingStep, setCompletingStep] = useState(false);
    const [showPodModal, setShowPodModal] = useState(false);
    const [podCode, setPodCode] = useState("");
    const [podNotes, setPodNotes] = useState("");
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState("");
    const [payoutPhone, setPayoutPhone] = useState("");
    const [submittingPayout, setSubmittingPayout] = useState(false);
    const gpsWatchId = useRef(null);
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
            }
            else if (profRes.status === 404) {
                // Not registered as rider yet
                router.push("/ghuba/rider/onboarding");
                return;
            }
            // Active Delivery
            const activeRes = await fetch("/api/rider/deliveries/active");
            const activeData = await activeRes.json();
            if (activeData?.success && activeData?.data) {
                setActiveDelivery(activeData.data);
            }
            else {
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
        }
        catch (err) {
            console.error("Failed to load dashboard data:", err);
        }
        finally {
            setLoading(false);
        }
    }, [router]);
    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 20000); // Polling every 20s
        return () => clearInterval(interval);
    }, [fetchDashboardData]);
    // 2. GPS Beacon - Transmit location to server when online
    const sendLocationUpdate = useCallback(async (coords) => {
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
        }
        catch {
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
        navigator.geolocation.getCurrentPosition((pos) => sendLocationUpdate(pos.coords), () => setGpsStatus("DENIED"), { enableHighAccuracy: true, timeout: 10000 });
        // Watch position
        gpsWatchId.current = navigator.geolocation.watchPosition((pos) => sendLocationUpdate(pos.coords), (err) => {
            console.warn("GPS error:", err.message);
            if (err.code === 1)
                setGpsStatus("DENIED");
        }, { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 });
        return () => {
            if (gpsWatchId.current !== null) {
                navigator.geolocation.clearWatch(gpsWatchId.current);
                gpsWatchId.current = null;
            }
        };
    }, [isOnline, sendLocationUpdate]);
    // 3. Online/Offline Toggle
    const handleToggleOnline = async () => {
        if (!profile)
            return;
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
            }
            else {
                toast.error(data.message || "Failed to update availability");
            }
        }
        catch {
            toast.error("Network error toggling status");
        }
        finally {
            setTogglingOnline(false);
        }
    };
    // 4. Accept Delivery Request
    const handleAcceptDelivery = async (deliveryId) => {
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
            }
            else {
                toast.error(data.message || "Could not claim delivery", { id: "accept-job" });
            }
        }
        catch {
            toast.error("Failed to accept delivery", { id: "accept-job" });
        }
    };
    // 5. Submit Bid
    const handleSubmitBid = async (e) => {
        e.preventDefault();
        if (!biddingDelivery)
            return;
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
            }
            else {
                toast.error(data.message || "Failed to submit bid");
            }
        }
        catch {
            toast.error("Network error submitting bid");
        }
        finally {
            setSubmittingBid(false);
        }
    };
    // 6. Advance Delivery Lifecycle
    const handleAdvanceStep = async (nextStep, proof) => {
        if (!activeDelivery)
            return;
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
            }
            else {
                toast.error(data.message || "Failed to advance delivery step");
            }
        }
        catch {
            toast.error("Network error updating status");
        }
        finally {
            setCompletingStep(false);
        }
    };
    // 7. Request Payout
    const handleRequestPayout = async (e) => {
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
            }
            else {
                toast.error(data.message || "Payout request failed");
            }
        }
        catch {
            toast.error("Network error requesting payout");
        }
        finally {
            setSubmittingPayout(false);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4", children: _jsxs("div", { className: "flex flex-col items-center gap-3", children: [_jsx(ArrowPathIcon, { className: "w-10 h-10 text-emerald-500 animate-spin" }), _jsx("p", { className: "text-sm font-medium text-slate-400", children: "Loading Rider Dashboard..." })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 text-slate-100 pb-20", children: [_jsx(Toaster, { position: "top-right" }), _jsx("header", { className: "sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3", children: _jsxs("div", { className: "max-w-4xl mx-auto flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400", children: _jsx(TruckIcon, { className: "w-6 h-6" }) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h1", { className: "font-bold text-base md:text-lg text-white", children: profile?.fullName || "Rider Portal" }), profile?.verificationStatus === "APPROVED" ? (_jsxs("span", { className: "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", children: [_jsx(ShieldCheckIcon, { className: "w-3 h-3" }), " Verified"] })) : (_jsxs("span", { className: "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20", children: [_jsx(ClockIcon, { className: "w-3 h-3" }), " ", profile?.verificationStatus || "Pending"] }))] }), _jsxs("p", { className: "text-xs text-slate-400", children: [profile?.operatingCity, ", ", profile?.operatingCounty, " \u2022 ", profile?.vehicle?.plateNumber || "Bicycle"] })] })] }), _jsx("button", { onClick: () => fetchDashboardData(), className: "p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition", title: "Refresh feed", children: _jsx(ArrowPathIcon, { className: "w-4 h-4" }) })] }) }), profile && profile.verificationStatus !== "APPROVED" && (_jsx("div", { className: "max-w-4xl mx-auto px-4 mt-4", children: _jsxs("div", { className: "p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-3", children: [_jsx(ExclamationTriangleIcon, { className: "w-5 h-5 flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "text-xs leading-relaxed", children: [_jsx("p", { className: "font-semibold text-sm text-amber-200", children: "Account Under Review" }), "Your documents and vehicle verification are currently being reviewed by administrators. Once approved, you can toggle online and receive deliveries."] })] }) })), _jsx("section", { className: "max-w-4xl mx-auto px-4 mt-4", children: _jsxs("div", { className: "p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: `w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isOnline
                                                ? "bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/50"
                                                : "bg-slate-800 text-slate-400"}`, children: _jsx(SignalIcon, { className: `w-6 h-6 ${isOnline ? "animate-pulse" : ""}` }) }), isOnline && (_jsx("span", { className: "absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900 animate-ping" }))] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-slate-400", children: "Dispatch Status" }), _jsx("h2", { className: "text-lg font-bold text-white flex items-center gap-2", children: isOnline ? "ONLINE - Ready for Jobs" : "OFFLINE" }), _jsxs("div", { className: "flex items-center gap-3 text-xs text-slate-400 mt-0.5", children: [_jsxs("span", { children: ["GPS:", " ", _jsx("strong", { className: gpsStatus === "ACTIVE" ? "text-emerald-400" : "text-amber-400", children: gpsStatus })] }), lastPingTime && _jsxs("span", { children: ["\u2022 Ping: ", lastPingTime] })] })] })] }), _jsx("button", { onClick: handleToggleOnline, disabled: togglingOnline || profile?.verificationStatus !== "APPROVED", className: `w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition flex items-center justify-center gap-2 ${isOnline
                                ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30"
                                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"} disabled:opacity-50`, children: togglingOnline ? (_jsx(ArrowPathIcon, { className: "w-4 h-4 animate-spin" })) : isOnline ? ("Go Offline") : ("Go Online") })] }) }), _jsx("section", { className: "max-w-4xl mx-auto px-4 mt-6", children: _jsxs("div", { className: "grid grid-cols-4 gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl", children: [_jsxs("button", { onClick: () => setActiveTab("ACTIVE"), className: `py-2 text-xs font-bold rounded-lg transition relative ${activeTab === "ACTIVE" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"}`, children: ["Active Job", activeDelivery && (_jsx("span", { className: "absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" }))] }), _jsxs("button", { onClick: () => setActiveTab("NEARBY"), className: `py-2 text-xs font-bold rounded-lg transition ${activeTab === "NEARBY" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"}`, children: ["Nearby (", availableDeliveries.length, ")"] }), _jsx("button", { onClick: () => setActiveTab("EARNINGS"), className: `py-2 text-xs font-bold rounded-lg transition ${activeTab === "EARNINGS" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"}`, children: "Wallet" }), _jsx("button", { onClick: () => setActiveTab("SETTINGS"), className: `py-2 text-xs font-bold rounded-lg transition ${activeTab === "SETTINGS" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"}`, children: "Profile" })] }) }), activeTab === "ACTIVE" && (_jsx("section", { className: "max-w-4xl mx-auto px-4 mt-6 space-y-4", children: activeDelivery ? (_jsxs("div", { className: "p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-2xl space-y-5", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [_jsxs("div", { children: [_jsx("span", { className: "text-[11px] font-semibold text-emerald-400 uppercase tracking-wider", children: "Assigned Job" }), _jsxs("h3", { className: "text-base font-bold text-white", children: ["Order #", activeDelivery.orderNumber] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-xs text-slate-400", children: "Your Payout" }), _jsxs("p", { className: "text-lg font-extrabold text-emerald-400", children: ["KES ", activeDelivery.riderFee?.toLocaleString()] })] })] }), _jsxs("div", { className: "p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs", children: [_jsx("span", { className: "text-slate-400", children: "Current Phase:" }), _jsx("span", { className: "font-bold text-emerald-400 uppercase tracking-wide", children: activeDelivery.status.replace(/_/g, " ") })] }), _jsxs("div", { className: "space-y-4 text-xs", children: [_jsxs("div", { className: "flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800", children: [_jsx("div", { className: "p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5", children: _jsx(MapPinIcon, { className: "w-5 h-5" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-semibold text-slate-400 uppercase tracking-wider text-[10px]", children: "Step 1: Pick Up from Store" }), _jsx("p", { className: "text-sm font-bold text-white mt-0.5", children: activeDelivery.storeName || "Store Partner" }), _jsx("p", { className: "text-slate-300 mt-0.5", children: activeDelivery.pickupAddress }), activeDelivery.pickupLat && activeDelivery.pickupLng && (_jsxs("a", { href: `https://www.google.com/maps/dir/?api=1&destination=${activeDelivery.pickupLat},${activeDelivery.pickupLng}`, target: "_blank", rel: "noreferrer", className: "inline-flex items-center gap-1 text-emerald-400 font-semibold mt-2 hover:underline", children: ["Navigate to Store ", _jsx(ArrowTopRightOnSquareIcon, { className: "w-3.5 h-3.5" })] }))] })] }), _jsxs("div", { className: "flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800", children: [_jsx("div", { className: "p-2 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5", children: _jsx(MapPinIcon, { className: "w-5 h-5" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-semibold text-slate-400 uppercase tracking-wider text-[10px]", children: "Step 2: Deliver to Customer" }), _jsx("p", { className: "text-sm font-bold text-white mt-0.5", children: activeDelivery.customerName }), _jsx("p", { className: "text-slate-300 mt-0.5", children: activeDelivery.dropoffAddress }), activeDelivery.customerPhone && (_jsx("div", { className: "flex items-center gap-3 mt-2", children: _jsxs("a", { href: `tel:${activeDelivery.customerPhone}`, className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold", children: [_jsx(PhoneIcon, { className: "w-3.5 h-3.5" }), " Call Customer (", activeDelivery.customerPhone, ")"] }) })), activeDelivery.dropoffLat && activeDelivery.dropoffLng && (_jsxs("a", { href: `https://www.google.com/maps/dir/?api=1&destination=${activeDelivery.dropoffLat},${activeDelivery.dropoffLng}`, target: "_blank", rel: "noreferrer", className: "inline-flex items-center gap-1 text-amber-400 font-semibold mt-2 hover:underline block", children: ["Navigate to Customer ", _jsx(ArrowTopRightOnSquareIcon, { className: "w-3.5 h-3.5" })] }))] })] })] }), _jsxs("div", { className: "pt-2", children: [activeDelivery.status === "RIDER_ASSIGNED" && (_jsx("button", { onClick: () => handleAdvanceStep("RIDER_EN_ROUTE_TO_PICKUP"), disabled: completingStep, className: "w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2", children: completingStep ? _jsx(ArrowPathIcon, { className: "w-5 h-5 animate-spin" }) : "I Am En Route to Store" })), activeDelivery.status === "RIDER_EN_ROUTE_TO_PICKUP" && (_jsx("button", { onClick: () => handleAdvanceStep("ARRIVED_AT_PICKUP"), disabled: completingStep, className: "w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2", children: completingStep ? _jsx(ArrowPathIcon, { className: "w-5 h-5 animate-spin" }) : "I Have Arrived at Store" })), activeDelivery.status === "ARRIVED_AT_PICKUP" && (_jsx("button", { onClick: () => handleAdvanceStep("ORDER_COLLECTED"), disabled: completingStep, className: "w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2", children: completingStep ? _jsx(ArrowPathIcon, { className: "w-5 h-5 animate-spin" }) : "Confirm Package Collected" })), activeDelivery.status === "ORDER_COLLECTED" && (_jsx("button", { onClick: () => handleAdvanceStep("IN_TRANSIT"), disabled: completingStep, className: "w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2", children: completingStep ? _jsx(ArrowPathIcon, { className: "w-5 h-5 animate-spin" }) : "Start Trip to Customer" })), activeDelivery.status === "IN_TRANSIT" && (_jsx("button", { onClick: () => handleAdvanceStep("ARRIVED_AT_DROPOFF"), disabled: completingStep, className: "w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2", children: completingStep ? _jsx(ArrowPathIcon, { className: "w-5 h-5 animate-spin" }) : "I Have Arrived at Customer" })), activeDelivery.status === "ARRIVED_AT_DROPOFF" && (_jsxs("button", { onClick: () => setShowPodModal(true), className: "w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition flex items-center justify-center gap-2", children: [_jsx(CheckCircleIcon, { className: "w-5 h-5" }), " Complete Delivery & Claim Earnings"] }))] })] })) : (_jsxs("div", { className: "p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3", children: [_jsx(TruckIcon, { className: "w-12 h-12 text-slate-600 mx-auto" }), _jsx("h3", { className: "font-bold text-base text-white", children: "No Active Delivery" }), _jsx("p", { className: "text-xs text-slate-400 max-w-sm mx-auto", children: "You are currently free for new jobs. Check the Nearby tab for open store delivery requests." }), _jsxs("button", { onClick: () => setActiveTab("NEARBY"), className: "mt-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition inline-flex items-center gap-1.5", children: ["Browse Nearby Deliveries ", _jsx(ChevronRightIcon, { className: "w-4 h-4" })] })] })) })), activeTab === "NEARBY" && (_jsxs("section", { className: "max-w-4xl mx-auto px-4 mt-6 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-sm font-bold text-white uppercase tracking-wider", children: "Available Opportunities" }), _jsxs("span", { className: "text-xs text-slate-400", children: ["Within ", profile?.maxDeliveryRadiusKm || 15, " km"] })] }), availableDeliveries.length === 0 ? (_jsxs("div", { className: "p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3", children: [_jsx(ClockIcon, { className: "w-10 h-10 text-slate-600 mx-auto" }), _jsx("p", { className: "font-semibold text-sm text-slate-300", children: "No active delivery requests nearby" }), _jsx("p", { className: "text-xs text-slate-500 max-w-xs mx-auto", children: "Stay online and keep GPS enabled. When stores near you create delivery requests, they will appear here instantly." })] })) : (availableDeliveries.map((job) => (_jsxs("div", { className: "p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-lg space-y-3", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "text-[10px] font-semibold text-emerald-400 uppercase tracking-wider", children: job.packageType || "Standard Parcel" }), _jsx("h3", { className: "font-bold text-base text-white mt-0.5", children: job.storeName })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-xs text-slate-400", children: "Offered Fee" }), _jsxs("p", { className: "text-base font-extrabold text-emerald-400", children: ["KES ", job.offeredFee.toLocaleString()] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800/80", children: [_jsxs("div", { children: [_jsx("p", { className: "text-slate-500 text-[10px] uppercase", children: "Pickup Area" }), _jsx("p", { className: "font-semibold text-slate-200 truncate", children: job.pickupAddress })] }), _jsxs("div", { children: [_jsx("p", { className: "text-slate-500 text-[10px] uppercase", children: "Delivery Area" }), _jsx("p", { className: "font-semibold text-slate-200 truncate", children: job.approxDropoffAddress })] })] }), _jsxs("div", { className: "flex items-center justify-between pt-1", children: [_jsxs("span", { className: "text-xs text-slate-400 font-medium", children: ["Distance: ", _jsxs("strong", { children: [job.distanceKm, " km"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [job.allowBidding && (_jsx("button", { onClick: () => {
                                                    setBiddingDelivery(job);
                                                    setBidAmount(job.offeredFee.toString());
                                                }, className: "px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition", children: "Place Bid" })), _jsx("button", { onClick: () => handleAcceptDelivery(job.id), className: "px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition", children: "Accept Job" })] })] })] }, job.id))))] })), activeTab === "EARNINGS" && (_jsxs("section", { className: "max-w-4xl mx-auto px-4 mt-6 space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [_jsxs("div", { className: "p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-xl", children: [_jsx("p", { className: "text-xs text-slate-400 uppercase tracking-wider font-semibold", children: "Available Balance" }), _jsxs("h3", { className: "text-2xl font-black text-emerald-400 mt-1", children: ["KES ", (earnings?.availableBalance || 0).toLocaleString()] }), _jsxs("button", { onClick: () => setShowPayoutModal(true), disabled: (earnings?.availableBalance || 0) < 100, className: "mt-3 w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold transition flex items-center justify-center gap-1.5", children: [_jsx(BanknotesIcon, { className: "w-4 h-4" }), " Withdraw via M-Pesa"] })] }), _jsxs("div", { className: "p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl", children: [_jsx("p", { className: "text-xs text-slate-400 uppercase tracking-wider font-semibold", children: "Total Earned" }), _jsxs("h3", { className: "text-2xl font-black text-white mt-1", children: ["KES ", (earnings?.totalEarned || 0).toLocaleString()] }), _jsxs("p", { className: "text-xs text-slate-500 mt-3", children: ["From ", earnings?.completedDeliveriesCount || 0, " completed trips"] })] }), _jsxs("div", { className: "p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl", children: [_jsx("p", { className: "text-xs text-slate-400 uppercase tracking-wider font-semibold", children: "Pending Payouts" }), _jsxs("h3", { className: "text-2xl font-black text-amber-400 mt-1", children: ["KES ", (earnings?.pendingPayouts || 0).toLocaleString()] }), _jsx("p", { className: "text-xs text-slate-500 mt-3", children: "M-Pesa processing queue" })] })] }), _jsxs("div", { className: "p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4", children: [_jsx("h3", { className: "text-sm font-bold text-white uppercase tracking-wider", children: "Transaction Ledger" }), !earnings?.recentLedger || earnings.recentLedger.length === 0 ? (_jsx("p", { className: "text-xs text-slate-500 py-4 text-center", children: "No transaction records yet" })) : (_jsx("div", { className: "divide-y divide-slate-800 text-xs", children: earnings.recentLedger.map((item) => (_jsxs("div", { className: "py-3 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-slate-200", children: item.description }), _jsx("p", { className: "text-[11px] text-slate-500", children: new Date(item.createdAt).toLocaleDateString() })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: `font-bold text-sm ${item.type === "CREDIT" ? "text-emerald-400" : "text-amber-400"}`, children: [item.type === "CREDIT" ? "+" : "-", "KES ", item.amount.toLocaleString()] }), _jsx("span", { className: "text-[10px] text-slate-400 uppercase", children: item.status })] })] }, item.id))) }))] })] })), activeTab === "SETTINGS" && (_jsx("section", { className: "max-w-4xl mx-auto px-4 mt-6 space-y-4", children: _jsxs("div", { className: "p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(UserCircleIcon, { className: "w-12 h-12 text-slate-400" }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-base text-white", children: profile?.fullName }), _jsx("p", { className: "text-xs text-slate-400", children: profile?.phone })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-800", children: [_jsxs("div", { className: "p-3 rounded-xl bg-slate-950 border border-slate-800", children: [_jsx("span", { className: "text-slate-500 text-[10px] uppercase", children: "Registered Vehicle" }), _jsxs("p", { className: "font-bold text-white mt-0.5", children: [profile?.vehicle?.make, " ", profile?.vehicle?.model, " (", profile?.vehicle?.vehicleType, ")"] }), _jsx("p", { className: "text-slate-400", children: profile?.vehicle?.plateNumber })] }), _jsxs("div", { className: "p-3 rounded-xl bg-slate-950 border border-slate-800", children: [_jsx("span", { className: "text-slate-500 text-[10px] uppercase", children: "Operating Area" }), _jsxs("p", { className: "font-bold text-white mt-0.5", children: [profile?.operatingCity, ", ", profile?.operatingCounty] }), _jsxs("p", { className: "text-slate-400", children: ["Max Delivery Radius: ", profile?.maxDeliveryRadiusKm, " km"] })] })] }), _jsx("div", { className: "pt-2", children: _jsx(Link, { href: "/ghuba/rider/onboarding", className: "w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center justify-center gap-2", children: "Update Verification Documents" }) })] }) })), biddingDelivery && (_jsx("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [_jsx("h3", { className: "font-bold text-base text-white", children: "Place Delivery Bid" }), _jsx("button", { onClick: () => setBiddingDelivery(null), className: "p-1 rounded-lg text-slate-400 hover:text-white", children: _jsx(XCircleIcon, { className: "w-6 h-6" }) })] }), _jsxs("div", { className: "text-xs text-slate-300 space-y-1", children: [_jsxs("p", { children: ["Store: ", _jsx("strong", { children: biddingDelivery.storeName })] }), _jsxs("p", { children: ["Store Offer: ", _jsxs("strong", { children: ["KES ", biddingDelivery.offeredFee.toLocaleString()] })] })] }), _jsxs("form", { onSubmit: handleSubmitBid, className: "space-y-4 text-xs", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-semibold", children: "Your Proposed Fee (KES)" }), _jsx("input", { type: "number", required: true, value: bidAmount, onChange: (e) => setBidAmount(e.target.value), className: "w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:border-emerald-500 focus:outline-none" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-semibold", children: "Estimated Pickup Time (Minutes)" }), _jsx("input", { type: "number", required: true, value: bidEta, onChange: (e) => setBidEta(e.target.value), className: "w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:border-emerald-500 focus:outline-none" })] }), _jsxs("div", { className: "flex gap-2 pt-2", children: [_jsx("button", { type: "button", onClick: () => setBiddingDelivery(null), className: "flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold transition hover:bg-slate-700", children: "Cancel" }), _jsx("button", { type: "submit", disabled: submittingBid, className: "flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-1.5", children: submittingBid ? _jsx(ArrowPathIcon, { className: "w-4 h-4 animate-spin" }) : "Send Bid" })] })] })] }) })), showPodModal && activeDelivery && (_jsx("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [_jsx("h3", { className: "font-bold text-base text-white", children: "Complete Delivery Proof" }), _jsx("button", { onClick: () => setShowPodModal(false), className: "p-1 rounded-lg text-slate-400 hover:text-white", children: _jsx(XCircleIcon, { className: "w-6 h-6" }) })] }), _jsx("p", { className: "text-xs text-slate-400", children: "Provide recipient confirmation details or the customer OTP verification code to confirm handover." }), _jsxs("div", { className: "space-y-4 text-xs", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-semibold", children: "Delivery OTP / Confirmation Code" }), _jsx("input", { type: "text", placeholder: "e.g. 4-digit code if supplied", value: podCode, onChange: (e) => setPodCode(e.target.value), className: "w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:border-emerald-500 focus:outline-none" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-semibold", children: "Recipient Notes / Name" }), _jsx("textarea", { rows: 2, placeholder: "e.g. Received by customer at front door", value: podNotes, onChange: (e) => setPodNotes(e.target.value), className: "w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none" })] }), _jsxs("div", { className: "flex gap-2 pt-2", children: [_jsx("button", { type: "button", onClick: () => setShowPodModal(false), className: "flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold transition hover:bg-slate-700", children: "Cancel" }), _jsx("button", { type: "button", onClick: () => handleAdvanceStep("DELIVERED", { code: podCode, notes: podNotes }), disabled: completingStep, className: "flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-1.5", children: completingStep ? _jsx(ArrowPathIcon, { className: "w-4 h-4 animate-spin" }) : "Confirm Handover" })] })] })] }) })), showPayoutModal && (_jsx("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [_jsx("h3", { className: "font-bold text-base text-white", children: "M-Pesa Payout Request" }), _jsx("button", { onClick: () => setShowPayoutModal(false), className: "p-1 rounded-lg text-slate-400 hover:text-white", children: _jsx(XCircleIcon, { className: "w-6 h-6" }) })] }), _jsxs("form", { onSubmit: handleRequestPayout, className: "space-y-4 text-xs", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-slate-400 mb-1 font-semibold", children: ["Amount (KES) - Max: KES ", (earnings?.availableBalance || 0).toLocaleString()] }), _jsx("input", { type: "number", required: true, min: 100, max: earnings?.availableBalance || 0, value: payoutAmount, onChange: (e) => setPayoutAmount(e.target.value), placeholder: "Min KES 100", className: "w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:border-emerald-500 focus:outline-none" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-semibold", children: "M-Pesa Phone Number" }), _jsx("input", { type: "tel", required: true, value: payoutPhone, onChange: (e) => setPayoutPhone(e.target.value), placeholder: "07XXXXXXXX or 2547XXXXXXXX", className: "w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:border-emerald-500 focus:outline-none" })] }), _jsxs("div", { className: "flex gap-2 pt-2", children: [_jsx("button", { type: "button", onClick: () => setShowPayoutModal(false), className: "flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold transition hover:bg-slate-700", children: "Cancel" }), _jsx("button", { type: "submit", disabled: submittingPayout, className: "flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-1.5", children: submittingPayout ? _jsx(ArrowPathIcon, { className: "w-4 h-4 animate-spin" }) : "Confirm Payout" })] })] })] }) }))] }));
}
