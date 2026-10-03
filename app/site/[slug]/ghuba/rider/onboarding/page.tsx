"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import {
  UserIcon,
  IdentificationIcon,
  TruckIcon,
  MapPinIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CloudArrowUpIcon,
  ShieldCheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function RiderOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal
    fullName: "",
    phone: "",
    email: "",
    operatingCounty: "Nairobi",
    operatingCity: "Nairobi Central",
    emergencyContactName: "",
    emergencyContactPhone: "",
    // Step 2: Identity
    idType: "NATIONAL_ID",
    idNumber: "",
    idFrontUrl: "",
    idBackUrl: "",
    passportUrl: "",
    drivingLicenseNo: "",
    drivingLicenseUrl: "",
    drivingLicenseExpiry: "",
    selfieUrl: "",
    // Step 3: Vehicle
    riderType: "MOTORBIKE",
    vehicleMake: "",
    vehicleModel: "",
    vehiclePlate: "",
    vehicleColor: "",
    vehiclePhotoUrl: "",
    insuranceNumber: "",
    insuranceExpiry: "",
    insuranceCertUrl: "",
    // Step 4: Service Area
    serviceAreas: ["Westlands", "CBD", "Kilimani", "Eastleigh"],
    maxDistanceKm: 20,
    // Step 5: Payout
    payoutMethod: "MPESA",
    mpesaPhone: "",
    // Step 6: Agreement
    termsAccepted: false,
  });

  // Counties in Kenya
  const counties = [
    "Nairobi",
    "Mombasa",
    "Kisumu",
    "Nakuru",
    "Kiambu",
    "Machakos",
    "Kajiado",
    "Uasin Gishu",
    "Meru",
    "Kilifi",
  ];

  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await fetch("/api/rider/onboarding");
        const data = await res.json();
        if (data.success && data.profile) {
          const p = data.profile;
          setExistingStatus(p.verificationStatus);
          setRejectionReason(p.rejectionReason);
          setFormData((prev) => ({
            ...prev,
            fullName: p.fullName || prev.fullName,
            phone: p.phone || prev.phone,
            email: p.email || prev.email,
            operatingCounty: p.operatingCounty || prev.operatingCounty,
            operatingCity: p.operatingCity || prev.operatingCity,
            idType: p.idType || prev.idType,
            idNumber: p.idNumber || prev.idNumber,
            idFrontUrl: p.idFrontUrl || prev.idFrontUrl,
            idBackUrl: p.idBackUrl || prev.idBackUrl,
            passportUrl: p.passportUrl || prev.passportUrl,
            drivingLicenseNo: p.drivingLicenseNo || prev.drivingLicenseNo,
            drivingLicenseUrl: p.drivingLicenseUrl || prev.drivingLicenseUrl,
            drivingLicenseExpiry: p.drivingLicenseExpiry
              ? new Date(p.drivingLicenseExpiry).toISOString().split("T")[0]
              : prev.drivingLicenseExpiry,
            selfieUrl: p.selfieUrl || prev.selfieUrl,
            riderType: p.riderType || prev.riderType,
            serviceAreas: p.serviceAreas?.length > 0 ? p.serviceAreas : prev.serviceAreas,
            maxDistanceKm: p.maxDistanceKm || prev.maxDistanceKm,
            payoutMethod: p.payoutMethod || prev.payoutMethod,
            mpesaPhone: p.mpesaPhone || prev.mpesaPhone,
            vehicleMake: p.vehicles?.[0]?.make || prev.vehicleMake,
            vehicleModel: p.vehicles?.[0]?.model || prev.vehicleModel,
            vehiclePlate: p.vehicles?.[0]?.plateNumber || prev.vehiclePlate,
            vehicleColor: p.vehicles?.[0]?.color || prev.vehicleColor,
            vehiclePhotoUrl: p.vehicles?.[0]?.vehiclePhoto || prev.vehiclePhotoUrl,
            insuranceNumber: p.vehicles?.[0]?.insuranceNumber || prev.insuranceNumber,
          }));
        }
      } catch (e) {
        console.error("Failed to load onboarding status", e);
      } finally {
        setLoading(false);
      }
    }
    loadStatus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAreaToggle = (area: string) => {
    setFormData((prev) => {
      const exists = prev.serviceAreas.includes(area);
      return {
        ...prev,
        serviceAreas: exists
          ? prev.serviceAreas.filter((a) => a !== area)
          : [...prev.serviceAreas, area],
      };
    });
  };

  const handleSaveDraft = async () => {
    try {
      setSubmitting(true);
      const res = await fetch("/api/rider/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, submitForReview: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save draft");
      toast.success("Draft saved successfully.");
    } catch (err: any) {
      toast.error(err.message || "Error saving draft");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitApplication = async () => {
    if (!formData.fullName || !formData.phone) {
      toast.error("Please fill in your name and phone number.");
      return;
    }
    if (!formData.termsAccepted) {
      toast.error("Please accept the delivery rider terms and conditions.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        vehicles: [
          {
            vehicleType: formData.riderType,
            make: formData.vehicleMake,
            model: formData.vehicleModel,
            plateNumber: formData.vehiclePlate,
            color: formData.vehicleColor,
            vehiclePhoto: formData.vehiclePhotoUrl,
            insuranceNumber: formData.insuranceNumber,
            insuranceExpiry: formData.insuranceExpiry,
          },
        ],
        submitForReview: true,
      };

      const res = await fetch("/api/rider/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit application");

      toast.success("Application submitted successfully for verification!");
      setExistingStatus("SUBMITTED");
      router.push("/ghuba/rider/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Submission error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-zinc-400">Loading Onboarding Portal...</p>
        </div>
      </div>
    );
  }

  // If already approved, direct to dashboard
  if (existingStatus === "APPROVED") {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto text-3xl">
            ✓
          </div>
          <h2 className="text-2xl font-black">Account Verified & Active!</h2>
          <p className="text-sm text-zinc-300">
            Your rider application is fully approved. You can toggle online and receive deliveries in your service area.
          </p>
          <div className="pt-4">
            <Link
              href="/ghuba/rider/dashboard"
              className="block w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-500/25"
            >
              Go to Rider Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { num: 1, title: "Personal Details", icon: UserIcon },
    { num: 2, title: "Identity & License", icon: IdentificationIcon },
    { num: 3, title: "Vehicle Info", icon: TruckIcon },
    { num: 4, title: "Service Area", icon: MapPinIcon },
    { num: 5, title: "Payout Details", icon: BanknotesIcon },
    { num: 6, title: "Review & Submit", icon: CheckCircleIcon },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-amber-500 selection:text-zinc-950 py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />

      <div className="max-w-3xl mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800/80">
          <Link
            href="/ghuba/rider/join"
            className="text-xs uppercase font-bold tracking-wider text-zinc-400 hover:text-amber-400 transition-colors"
          >
            ← Back to Overview
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveDraft}
              disabled={submitting}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-all"
            >
              Save Draft
            </button>
          </div>
        </div>

        {/* Existing Status Banner if Under Review */}
        {existingStatus === "SUBMITTED" || existingStatus === "UNDER_REVIEW" ? (
          <div className="mb-8 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-200 text-xs flex items-center gap-3">
            <ClockIcon className="w-6 h-6 text-blue-400 shrink-0" />
            <div>
              <p className="font-bold text-sm text-blue-300">Application Under Verification</p>
              <p className="text-zinc-300">
                Our compliance team is currently reviewing your documents. You will receive an SMS and email notification upon approval. You can update details below if needed.
              </p>
            </div>
          </div>
        ) : null}

        {existingStatus === "REJECTED" ? (
          <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <p className="font-bold text-sm text-rose-300">Application Requires Corrections</p>
              <p className="text-zinc-300">{rejectionReason || "Please review and re-upload clear photos of your ID and license."}</p>
            </div>
          </div>
        ) : null}

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            Rider Onboarding Wizard
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Step {currentStep} of 6 — {steps[currentStep - 1].title}
          </p>
        </div>

        {/* Progress Bar / Step Pills */}
        <div className="grid grid-cols-6 gap-1.5 sm:gap-2 mb-8">
          {steps.map((s) => {
            const isCompleted = s.num < currentStep;
            const isCurrent = s.num === currentStep;
            return (
              <button
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                className={`py-2 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                  isCurrent
                    ? "bg-amber-500 text-zinc-950 font-black shadow-lg shadow-amber-500/20"
                    : isCompleted
                    ? "bg-zinc-800 text-emerald-400 font-bold"
                    : "bg-zinc-900/60 text-zinc-500"
                }`}
              >
                <s.icon className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
                <span className="text-[10px] hidden sm:inline">{s.title.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>

        {/* WIZARD CARD */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
          {/* STEP 1: Personal Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-black text-amber-400 flex items-center gap-2 border-b border-zinc-800 pb-3">
                <UserIcon className="w-5 h-5" /> 1. Personal & Contact Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Samuel Mwangi Kariuki"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Phone Number (SMS & WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 0712345678 or 254712345678"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="samuel@gmail.com"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Primary Operating County *
                  </label>
                  <select
                    name="operatingCounty"
                    value={formData.operatingCounty}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-amber-500 focus:outline-none"
                  >
                    {counties.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    City / Town / Sub-County *
                  </label>
                  <input
                    type="text"
                    name="operatingCity"
                    value={formData.operatingCity}
                    onChange={handleChange}
                    placeholder="e.g. Westlands / Central"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Emergency Contact Name & Phone
                  </label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    placeholder="e.g. Mary Kariuki (0722000000)"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Identity & Verification */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-black text-amber-400 flex items-center gap-2 border-b border-zinc-800 pb-3">
                <IdentificationIcon className="w-5 h-5" /> 2. Government Identification & Licenses
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    ID Document Type *
                  </label>
                  <select
                    name="idType"
                    value={formData.idType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-amber-500 focus:outline-none"
                  >
                    <option value="NATIONAL_ID">Kenyan National ID</option>
                    <option value="PASSPORT">Passport</option>
                    <option value="MILITARY_ID">Military / Service ID</option>
                    <option value="ALIEN_ID">Alien ID / Work Permit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    ID / Document Number *
                  </label>
                  <input
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleChange}
                    placeholder="e.g. 31234567"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Driving License Number (if motorized)
                  </label>
                  <input
                    type="text"
                    name="drivingLicenseNo"
                    value={formData.drivingLicenseNo}
                    onChange={handleChange}
                    placeholder="e.g. DL-98765432"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Driving License Expiry Date
                  </label>
                  <input
                    type="date"
                    name="drivingLicenseExpiry"
                    value={formData.drivingLicenseExpiry}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Document Photo Uploads */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <p className="text-xs text-zinc-400 font-semibold">
                  Provide direct URLs or image evidence of your verification documents (encrypted and restricted to compliance reviewers):
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      National ID Front Image URL
                    </label>
                    <input
                      type="url"
                      name="idFrontUrl"
                      value={formData.idFrontUrl}
                      onChange={handleChange}
                      placeholder="https://.../id_front.jpg"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      National ID Back Image URL
                    </label>
                    <input
                      type="url"
                      name="idBackUrl"
                      value={formData.idBackUrl}
                      onChange={handleChange}
                      placeholder="https://.../id_back.jpg"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Driving License Image URL
                    </label>
                    <input
                      type="url"
                      name="drivingLicenseUrl"
                      value={formData.drivingLicenseUrl}
                      onChange={handleChange}
                      placeholder="https://.../license.jpg"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Profile Selfie URL
                    </label>
                    <input
                      type="url"
                      name="selfieUrl"
                      value={formData.selfieUrl}
                      onChange={handleChange}
                      placeholder="https://.../selfie.jpg"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Vehicle Info */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-black text-amber-400 flex items-center gap-2 border-b border-zinc-800 pb-3">
                <TruckIcon className="w-5 h-5" /> 3. Vehicle & Transport Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Vehicle Type *
                  </label>
                  <select
                    name="riderType"
                    value={formData.riderType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-amber-500 focus:outline-none"
                  >
                    <option value="MOTORBIKE">Motorbike (Boda Boda)</option>
                    <option value="BICYCLE">Bicycle Courier</option>
                    <option value="CAR">Car / Saloon</option>
                    <option value="VAN">Van / Pickup</option>
                    <option value="TRUCK">Light Truck</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Number Plate / Registration (if motorized)
                  </label>
                  <input
                    type="text"
                    name="vehiclePlate"
                    value={formData.vehiclePlate}
                    onChange={handleChange}
                    placeholder="e.g. KMDF 123X"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-amber-500 focus:outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Make / Brand
                  </label>
                  <input
                    type="text"
                    name="vehicleMake"
                    value={formData.vehicleMake}
                    onChange={handleChange}
                    placeholder="e.g. Boxer / Bajaj / Toyota / Hero"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Model & Color
                  </label>
                  <input
                    type="text"
                    name="vehicleModel"
                    value={formData.vehicleModel}
                    onChange={handleChange}
                    placeholder="e.g. 150cc Red"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Insurance Policy Number
                  </label>
                  <input
                    type="text"
                    name="insuranceNumber"
                    value={formData.insuranceNumber}
                    onChange={handleChange}
                    placeholder="e.g. INS-2026-X89"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Vehicle Photo URL
                  </label>
                  <input
                    type="url"
                    name="vehiclePhotoUrl"
                    value={formData.vehiclePhotoUrl}
                    onChange={handleChange}
                    placeholder="https://.../vehicle.jpg"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Service Areas & Radius */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-lg font-black text-amber-400 flex items-center gap-2 border-b border-zinc-800 pb-3">
                <MapPinIcon className="w-5 h-5" /> 4. Service Areas & Delivery Radius
              </h2>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-2">
                  Select Operating Areas in {formData.operatingCounty}:
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "CBD",
                    "Westlands",
                    "Kilimani",
                    "Eastleigh",
                    "Upperhill",
                    "Karen",
                    "Parklands",
                    "South B / C",
                    "Thika Road",
                    "Embakasi",
                    "Industrial Area",
                  ].map((area) => {
                    const isSelected = formData.serviceAreas.includes(area);
                    return (
                      <button
                        type="button"
                        key={area}
                        onClick={() => handleAreaToggle(area)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                          isSelected
                            ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20"
                            : "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {area}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-zinc-800">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-zinc-300">Maximum Preferred Delivery Radius:</span>
                  <span className="text-amber-400 font-black text-lg">
                    {formData.maxDistanceKm} km
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  name="maxDistanceKm"
                  value={formData.maxDistanceKm}
                  onChange={handleChange}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-zinc-500">
                  <span>5 km (Local Drops)</span>
                  <span>25 km (Metropolitan)</span>
                  <span>50 km (Cross-County)</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Payout Details */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-lg font-black text-amber-400 flex items-center gap-2 border-b border-zinc-800 pb-3">
                <BanknotesIcon className="w-5 h-5" /> 5. Payment & M-Pesa Withdrawal Details
              </h2>

              <p className="text-xs text-zinc-400">
                Your delivery fees and tips are credited directly to your digital wallet upon proof-of-delivery confirmation. Provide your withdrawal payout account:
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Preferred Payout Method *
                  </label>
                  <select
                    name="payoutMethod"
                    value={formData.payoutMethod}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-amber-500 focus:outline-none"
                  >
                    <option value="MPESA">Safaricom M-Pesa (Instant Withdrawal)</option>
                    <option value="BANK">Direct Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    M-Pesa Registered Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="mpesaPhone"
                    value={formData.mpesaPhone}
                    onChange={handleChange}
                    placeholder="e.g. 0712345678 or 254712345678"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-amber-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Must be registered under your legal name matching your National ID.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Review & Submit */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h2 className="text-lg font-black text-amber-400 flex items-center gap-2 border-b border-zinc-800 pb-3">
                <CheckCircleIcon className="w-5 h-5" /> 6. Final Review & Policy Acceptance
              </h2>

              <div className="bg-zinc-950/80 rounded-2xl p-5 border border-zinc-800 space-y-3 text-xs">
                <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                  <span className="text-zinc-400">Full Legal Name:</span>
                  <span className="font-bold text-white">{formData.fullName || "Not provided"}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                  <span className="text-zinc-400">Phone:</span>
                  <span className="font-bold text-white">{formData.phone || "Not provided"}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                  <span className="text-zinc-400">Vehicle Type:</span>
                  <span className="font-bold text-white">{formData.riderType}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                  <span className="text-zinc-400">Plate Number:</span>
                  <span className="font-bold text-white">{formData.vehiclePlate || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                  <span className="text-zinc-400">Operating County:</span>
                  <span className="font-bold text-white">{formData.operatingCounty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">M-Pesa Payout Account:</span>
                  <span className="font-bold text-amber-400">
                    {formData.mpesaPhone || formData.phone || "Not provided"}
                  </span>
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 accent-amber-500 rounded"
                  />
                  <span className="text-xs text-zinc-300 leading-relaxed">
                    I confirm that the identification documents, driver license, and vehicle details submitted are authentic and legally registered in Kenya. I agree to adhere to the{" "}
                    <span className="text-amber-400 underline">Ghuba Delivery Provider Code of Conduct</span>{" "}
                    and road safety standards.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Wizard Controls Bottom */}
          <div className="flex items-center justify-between pt-6 border-t border-zinc-800 mt-8">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s - 1)}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeftIcon className="w-3.5 h-3.5" /> Previous
              </button>
            ) : (
              <div />
            )}

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s + 1)}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-amber-500/20"
              >
                Next Step <ArrowRightIcon className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitApplication}
                disabled={submitting}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-xl shadow-amber-500/30 active:scale-95 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Application for Verification"}
                <ArrowRightIcon className="w-4 h-4 stroke-[3]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
