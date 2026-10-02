"use client";

import React, { useState, useEffect, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  TruckIcon,
  ShieldCheckIcon,
  ClockIcon,
  XCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  MapPinIcon,
  SignalIcon,
  BanknotesIcon,
  UserCircleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

interface RiderItem {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  isOnline: boolean;
  operatingCounty: string;
  operatingCity: string;
  rejectionReason?: string;
  createdAt: string;
  vehicles?: Array<{
    id: string;
    make: string;
    model: string;
    plateNumber: string;
    vehicleType: string;
    color: string;
    insuranceNumber?: string;
    insuranceExpiry?: string;
  }>;
  verifications?: Array<{
    idType: string;
    idNumber: string;
    idFrontUrl?: string;
    idBackUrl?: string;
    drivingLicenseNo?: string;
    drivingLicenseUrl?: string;
    selfieUrl?: string;
  }>;
}

interface OperationMetrics {
  totalRiders: number;
  onlineRiders: number;
  pendingVerifications: number;
  activeDeliveries: number;
  completedDeliveries: number;
  totalPlatformCommission: number;
  recentDeliveries: any[];
}

export default function SuperAdminDeliveriesPage() {
  const [activeTab, setActiveTab] = useState<"VERIFICATION" | "RIDERS" | "OPERATIONS" | "DISPUTES">("VERIFICATION");
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<OperationMetrics | null>(null);
  const [riders, setRiders] = useState<RiderItem[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Inspection & Review Modal
  const [selectedRider, setSelectedRider] = useState<RiderItem | null>(null);
  const [reviewAction, setReviewAction] = useState<"APPROVE" | "REJECT" | "SUSPEND" | null>(null);
  const [reviewReason, setReviewReason] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Disputes
  const [disputes, setDisputes] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [metRes, ridRes, disRes] = await Promise.all([
        fetch("/api/super-admin/deliveries/operations"),
        fetch("/api/super-admin/riders"),
        fetch("/api/super-admin/deliveries/disputes"),
      ]);

      const metJson = await metRes.json();
      const ridJson = await ridRes.json();
      const disJson = await disRes.json();

      if (metJson.success) setMetrics(metJson.data);
      if (ridJson.success) setRiders(ridJson.data || []);
      if (disJson.success) setDisputes(disJson.data || []);
    } catch (err) {
      toast.error("Failed to load operations data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Review Submission
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRider || !reviewAction) return;

    setSubmittingReview(true);
    try {
      const statusMap = {
        APPROVE: "APPROVED",
        REJECT: "REJECTED",
        SUSPEND: "SUSPENDED",
      };

      const res = await fetch(`/api/super-admin/riders/${selectedRider.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: statusMap[reviewAction],
          reason: reviewReason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Rider status updated to ${statusMap[reviewAction]}`);
        setSelectedRider(null);
        setReviewAction(null);
        setReviewReason("");
        fetchData();
      } else {
        toast.error(data.message || "Failed to update rider status");
      }
    } catch {
      toast.error("Network error submitting review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredRiders = riders.filter((r) => {
    const matchesSearch =
      r.fullName.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.toLowerCase().includes(search.toLowerCase()) ||
      r.operatingCity.toLowerCase().includes(search.toLowerCase()) ||
      (r.vehicles?.[0]?.plateNumber || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ? true : r.verificationStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingVerificationQueue = riders.filter(
    (r) => r.verificationStatus === "PENDING"
  );

  return (
    <div className="p-6 lg:p-10 space-y-8 font-sans">
      <Toaster position="top-right" />

      {/* Top Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-500">
            <ShieldCheckIcon className="w-4 h-4" /> Platform Authority
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight mt-1">
            Rider Network & Logistics Ops
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Centralized rider verification, real-time dispatch tracking, and dispute management.
          </p>
        </div>

        <button
          onClick={() => fetchData()}
          className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center gap-2 transition"
        >
          <ArrowPathIcon className="w-4 h-4" /> Refresh Ops
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Registered</p>
          <p className="text-2xl font-black text-white mt-1">{metrics?.totalRiders || riders.length}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 shadow-xl">
          <p className="text-[10px] uppercase font-bold text-amber-400">Verification Queue</p>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {metrics?.pendingVerifications ?? pendingVerificationQueue.length}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-xl">
          <p className="text-[10px] uppercase font-bold text-emerald-400">Online Fleet</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{metrics?.onlineRiders || 0}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-blue-500/30 shadow-xl">
          <p className="text-[10px] uppercase font-bold text-blue-400">Active Deliveries</p>
          <p className="text-2xl font-black text-blue-400 mt-1">{metrics?.activeDeliveries || 0}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <p className="text-[10px] uppercase font-bold text-slate-400">Completed Trips</p>
          <p className="text-2xl font-black text-white mt-1">{metrics?.completedDeliveries || 0}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <p className="text-[10px] uppercase font-bold text-slate-400">Commission Vol</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            KES {(metrics?.totalPlatformCommission || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("VERIFICATION")}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 ${
            activeTab === "VERIFICATION"
              ? "bg-amber-500 text-slate-950 font-black shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ShieldCheckIcon className="w-4 h-4" />
          Verification Queue ({pendingVerificationQueue.length})
        </button>

        <button
          onClick={() => setActiveTab("RIDERS")}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 ${
            activeTab === "RIDERS"
              ? "bg-white text-slate-950 font-black shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <UserCircleIcon className="w-4 h-4" />
          Rider Directory ({riders.length})
        </button>

        <button
          onClick={() => setActiveTab("OPERATIONS")}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 ${
            activeTab === "OPERATIONS"
              ? "bg-emerald-600 text-white font-black shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <SignalIcon className="w-4 h-4" />
          Live Network Dispatches
        </button>

        <button
          onClick={() => setActiveTab("DISPUTES")}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 ${
            activeTab === "DISPUTES"
              ? "bg-rose-600 text-white font-black shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ExclamationTriangleIcon className="w-4 h-4" />
          Disputes ({disputes.length})
        </button>
      </div>

      {/* Tab 1: Verification Queue */}
      {activeTab === "VERIFICATION" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Pending Rider Applications</h3>
            <span className="text-xs text-slate-400">Requires identity & vehicle document approval</span>
          </div>

          {pendingVerificationQueue.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <CheckCircleIcon className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="text-base font-bold text-white">Verification Queue is Clear</h4>
              <p className="text-xs text-slate-400">All submitted rider applications have been processed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingVerificationQueue.map((r) => {
                const vehicle = r.vehicles?.[0];
                const doc = r.verifications?.[0];

                return (
                  <div
                    key={r.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-amber-500/20 shadow-xl space-y-4 hover:border-amber-500/40 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Pending Review
                        </span>
                        <h4 className="text-base font-bold text-white mt-1.5">{r.fullName}</h4>
                        <p className="text-xs text-slate-400">{r.phone}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
                        <TruckIcon className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Operating Area:</span>
                        <span className="font-semibold text-slate-300">
                          {r.operatingCity}, {r.operatingCounty}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Vehicle Type:</span>
                        <span className="font-semibold text-slate-300">
                          {vehicle?.vehicleType || "MOTORBIKE"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Plate Number:</span>
                        <span className="font-mono font-bold text-amber-400">
                          {vehicle?.plateNumber || "Pending"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">ID / License:</span>
                        <span className="font-mono text-slate-300">
                          {doc?.idNumber || "Submitted"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedRider(r);
                        setReviewAction(null);
                      }}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5"
                    >
                      <EyeIcon className="w-4 h-4" /> Inspect Documents & Review
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: All Riders Directory */}
      {activeTab === "RIDERS" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-80">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search rider name, phone, plate..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              {["ALL", "APPROVED", "PENDING", "SUSPENDED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    statusFilter === st ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Rider Name</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Live Dispatch</th>
                    <th className="px-5 py-3.5">Vehicle</th>
                    <th className="px-5 py-3.5">Service Region</th>
                    <th className="px-5 py-3.5">Registered</th>
                    <th className="px-5 py-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredRiders.map((r) => {
                    const vehicle = r.vehicles?.[0];
                    return (
                      <tr key={r.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-5 py-4">
                          <p className="font-bold text-white text-sm">{r.fullName}</p>
                          <p className="text-slate-400">{r.phone}</p>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              r.verificationStatus === "APPROVED"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : r.verificationStatus === "SUSPENDED"
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {r.verificationStatus}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {r.isOnline ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> ONLINE
                            </span>
                          ) : (
                            <span className="text-slate-500">Offline</span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-200">
                            {vehicle?.make} {vehicle?.model || "Motorbike"}
                          </p>
                          <p className="font-mono text-slate-400">{vehicle?.plateNumber || "—"}</p>
                        </td>

                        <td className="px-5 py-4 text-slate-300">
                          {r.operatingCity}, {r.operatingCounty}
                        </td>

                        <td className="px-5 py-4 text-slate-500">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>

                        <td className="px-5 py-4">
                          <button
                            onClick={() => {
                              setSelectedRider(r);
                              setReviewAction(null);
                            }}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            title="Inspect Profile"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {!filteredRiders.length && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-500">
                        No riders found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Operations & Active Deliveries */}
      {activeTab === "OPERATIONS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Live Dispatches Across Stores</h3>
            <span className="text-xs text-slate-400">All external marketplace deliveries</span>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Order Ref</th>
                    <th className="px-5 py-3.5">Store</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Route</th>
                    <th className="px-5 py-3.5">Assigned Rider</th>
                    <th className="px-5 py-3.5">Rider Fee</th>
                    <th className="px-5 py-3.5">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(metrics?.recentDeliveries || []).map((del) => (
                    <tr key={del.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4 font-black text-white">
                        #{del.id.slice(-6).toUpperCase()}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-200">
                        {del.company?.name || "Partner Store"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {del.status?.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <p className="text-slate-400 truncate max-w-xs">{del.pickupAddress}</p>
                          <p className="font-semibold text-slate-200 truncate max-w-xs">{del.dropoffAddress}</p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {del.assignment?.rider ? (
                          <div>
                            <p className="font-bold text-white">{del.assignment.rider.fullName}</p>
                            <p className="text-slate-400">{del.assignment.rider.phone}</p>
                          </div>
                        ) : (
                          <span className="text-amber-400 italic">Searching...</span>
                        )}
                      </td>

                      <td className="px-5 py-4 font-black text-emerald-400">
                        KES {del.offeredFee?.toLocaleString()}
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {new Date(del.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}

                  {(!metrics?.recentDeliveries || metrics.recentDeliveries.length === 0) && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-500">
                        No active dispatches right now.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Disputes */}
      {activeTab === "DISPUTES" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Delivery Disputes & Escalations</h3>
            <span className="text-xs text-slate-400">Reported issues from stores or riders</span>
          </div>

          {disputes.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <CheckCircleIcon className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="text-base font-bold text-white">No Open Disputes</h4>
              <p className="text-xs text-slate-400">All deliveries have proceeded without unresolved disputes.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {disputes.map((dsp) => (
                <div
                  key={dsp.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-rose-500/20 flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase text-rose-400">
                      Dispute #{dsp.id.slice(-6)}
                    </span>
                    <h4 className="font-bold text-white text-sm mt-0.5">{dsp.reason}</h4>
                    <p className="text-xs text-slate-400">{dsp.details}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-slate-800 text-slate-300">
                    {dsp.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: Inspection & Verification Review */}
      {selectedRider && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                  Rider Application Dossier
                </span>
                <h3 className="text-xl font-black text-white mt-0.5">{selectedRider.fullName}</h3>
                <p className="text-xs text-slate-400">
                  {selectedRider.phone} • {selectedRider.operatingCity}, {selectedRider.operatingCounty}
                </p>
              </div>
              <button
                onClick={() => setSelectedRider(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Document Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <p className="font-bold text-amber-400 uppercase text-[10px]">Identity Credentials</p>
                <p>
                  ID Type: <strong className="text-white">{selectedRider.verifications?.[0]?.idType || "NATIONAL_ID"}</strong>
                </p>
                <p>
                  ID Number: <strong className="text-white font-mono">{selectedRider.verifications?.[0]?.idNumber || "—"}</strong>
                </p>
                <p>
                  Driving License: <strong className="text-white font-mono">{selectedRider.verifications?.[0]?.drivingLicenseNo || "N/A"}</strong>
                </p>
                {selectedRider.verifications?.[0]?.idFrontUrl && (
                  <div className="pt-2">
                    <a
                      href={selectedRider.verifications[0].idFrontUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-400 underline font-semibold flex items-center gap-1"
                    >
                      <DocumentTextIcon className="w-4 h-4" /> View ID Document Photo
                    </a>
                  </div>
                )}
                {selectedRider.verifications?.[0]?.selfieUrl && (
                  <div>
                    <a
                      href={selectedRider.verifications[0].selfieUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-400 underline font-semibold flex items-center gap-1"
                    >
                      <UserCircleIcon className="w-4 h-4" /> View Verification Selfie
                    </a>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <p className="font-bold text-amber-400 uppercase text-[10px]">Vehicle Verification</p>
                <p>
                  Type: <strong className="text-white">{selectedRider.vehicles?.[0]?.vehicleType || "MOTORBIKE"}</strong>
                </p>
                <p>
                  Make & Model: <strong className="text-white">{selectedRider.vehicles?.[0]?.make} {selectedRider.vehicles?.[0]?.model}</strong>
                </p>
                <p>
                  Plate: <strong className="text-white font-mono">{selectedRider.vehicles?.[0]?.plateNumber || "—"}</strong>
                </p>
                <p>
                  Insurance Policy: <strong className="text-white font-mono">{selectedRider.vehicles?.[0]?.insuranceNumber || "Active"}</strong>
                </p>
              </div>
            </div>

            {/* Current Status & Action Choices */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Current Status:</span>
                <span className="font-bold text-white uppercase">{selectedRider.verificationStatus}</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReviewAction("APPROVE")}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
                    reviewAction === "APPROVE"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  Approve Rider
                </button>
                <button
                  type="button"
                  onClick={() => setReviewAction("REJECT")}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
                    reviewAction === "REJECT"
                      ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  Reject Application
                </button>
                <button
                  type="button"
                  onClick={() => setReviewAction("SUSPEND")}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
                    reviewAction === "SUSPEND"
                      ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  Suspend Account
                </button>
              </div>

              {reviewAction && (
                <form onSubmit={handleReviewSubmit} className="space-y-3 pt-2 border-t border-slate-800">
                  <label className="block text-xs font-semibold text-slate-400">
                    Audit Note / Reason for {reviewAction}:
                  </label>
                  <input
                    type="text"
                    required={reviewAction !== "APPROVE"}
                    placeholder={
                      reviewAction === "APPROVE"
                        ? "Optional approval note"
                        : "Reason required for audit trail"
                    }
                    value={reviewReason}
                    onChange={(e) => setReviewReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                  />

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setReviewAction(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition flex items-center gap-1.5"
                    >
                      {submittingReview ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : "Confirm Action"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
