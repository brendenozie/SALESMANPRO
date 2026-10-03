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
  ShieldCheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  EyeIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { RiderDocumentUpload } from "@/components/media/RiderDocumentUpload";

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
    logbookUrl: "",
    // Step 4: Service Area
    serviceAreas: ["Westlands", "CBD", "Kilimani", "Eastleigh"],
    maxDistanceKm: 20,
    // Step 5: Payout
    payoutMethod: "MPESA",
    mpesaPhone: "",
    // Step 6: Agreement
    termsAccepted: false,
  });

  const isMotorized = ["MOTORBIKE", "CAR", "VAN", "TRUCK"].includes(formData.riderType);

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
    "Nyeri",
    "Kakamega",
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
            emergencyContactName: p.emergencyContactName || prev.emergencyContactName,
            emergencyContactPhone: p.emergencyContactPhone || prev.emergencyContactPhone,
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
            insuranceExpiry: p.vehicles?.[0]?.insuranceExpiry
              ? new Date(p.vehicles[0].insuranceExpiry).toISOString().split("T")[0]
              : prev.insuranceExpiry,
            insuranceCertUrl: p.vehicles?.[0]?.insuranceCertUrl || prev.insuranceCertUrl,
            logbookUrl: p.vehicles?.[0]?.logbookUrl || prev.logbookUrl,
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

  // Step-by-Step Validation Logic
  const validateStep = (step: number): { valid: boolean; message?: string } => {
    switch (step) {
      case 1: {
        if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
          return { valid: false, message: "Please enter your full legal name (at least 3 characters)." };
        }
        const cleanPhone = formData.phone.replace(/[\s+-]/g, "");
        if (!cleanPhone || cleanPhone.length < 9) {
          return { valid: false, message: "Please enter a valid phone number (e.g. 0712345678 or 254712345678)." };
        }
        if (!formData.operatingCounty) {
          return { valid: false, message: "Please select your primary operating county." };
        }
        if (!formData.operatingCity.trim()) {
          return { valid: false, message: "Please enter your operating city, town, or sub-county." };
        }
        if (!formData.emergencyContactName.trim()) {
          return { valid: false, message: "Please provide an emergency contact name." };
        }
        const cleanEmergencyPhone = formData.emergencyContactPhone.replace(/[\s+-]/g, "");
        if (!cleanEmergencyPhone || cleanEmergencyPhone.length < 9) {
          return { valid: false, message: "Please provide an emergency contact phone number." };
        }
        return { valid: true };
      }

      case 2: {
        if (!formData.idNumber.trim() || formData.idNumber.trim().length < 4) {
          return { valid: false, message: "Please enter your Government ID or Document Number." };
        }
        if (!formData.idFrontUrl) {
          return { valid: false, message: "Please upload the front photo of your National ID or Passport." };
        }
        if ((formData.idType === "NATIONAL_ID" || formData.idType === "ALIEN_ID") && !formData.idBackUrl) {
          return { valid: false, message: "Please upload the back photo of your National ID." };
        }
        if (!formData.selfieUrl) {
          return { valid: false, message: "Please upload a clear selfie or passport-style portrait photo." };
        }

        if (isMotorized) {
          if (!formData.drivingLicenseNo.trim()) {
            return { valid: false, message: "Driving license number is required for motorized transport." };
          }
          if (!formData.drivingLicenseUrl) {
            return { valid: false, message: "Please upload a clear document or photo of your driving license." };
          }
          if (!formData.drivingLicenseExpiry) {
            return { valid: false, message: "Please enter your driving license expiry date." };
          }
        }
        return { valid: true };
      }

      case 3: {
        if (isMotorized) {
          if (!formData.vehiclePlate.trim()) {
            return { valid: false, message: "Please enter your vehicle registration / number plate (e.g. KMDF 123X)." };
          }
          if (!formData.vehicleMake.trim()) {
            return { valid: false, message: "Please enter your vehicle make / brand (e.g. Boxer, Bajaj, Toyota)." };
          }
          if (!formData.vehicleModel.trim()) {
            return { valid: false, message: "Please enter your vehicle model and color." };
          }
          if (!formData.insuranceNumber.trim()) {
            return { valid: false, message: "Please enter your vehicle insurance policy number." };
          }
          if (!formData.insuranceExpiry) {
            return { valid: false, message: "Please enter your insurance expiration date." };
          }
          if (!formData.vehiclePhotoUrl) {
            return { valid: false, message: "Please upload a clear photo of your vehicle showing the registration plate." };
          }
          if (!formData.insuranceCertUrl) {
            return { valid: false, message: "Please upload your vehicle insurance certificate." };
          }
        }
        return { valid: true };
      }

      case 4: {
        if (!formData.serviceAreas || formData.serviceAreas.length === 0) {
          return { valid: false, message: "Please select at least one operating service area." };
        }
        if (!formData.maxDistanceKm || formData.maxDistanceKm < 5) {
          return { valid: false, message: "Please specify your maximum delivery radius (at least 5 km)." };
        }
        return { valid: true };
      }

      case 5: {
        if (!formData.mpesaPhone.trim()) {
          return { valid: false, message: "Please enter your M-Pesa registered mobile number for payouts." };
        }
        const cleanMpesa = formData.mpesaPhone.replace(/[\s+-]/g, "");
        if (cleanMpesa.length < 9) {
          return { valid: false, message: "Please enter a valid M-Pesa phone number (e.g. 0712345678)." };
        }
        return { valid: true };
      }

      case 6: {
        if (!formData.termsAccepted) {
          return { valid: false, message: "Please review and accept the Delivery Provider Terms and Code of Conduct." };
        }
        return { valid: true };
      }

      default:
        return { valid: true };
    }
  };

  const handleNextStep = () => {
    const result = validateStep(currentStep);
    if (!result.valid) {
      toast.error(result.message || "Please complete all required fields before proceeding.");
      return;
    }
    setCurrentStep((s) => Math.min(s + 1, 6));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepJump = (targetStep: number) => {
    if (targetStep <= currentStep) {
      setCurrentStep(targetStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    for (let s = 1; s < targetStep; s++) {
      const res = validateStep(s);
      if (!res.valid) {
        toast.error(`Please complete Step ${s} first: ${res.message}`);
        setCurrentStep(s);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }
    setCurrentStep(targetStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      toast.success("Application draft saved successfully.");
    } catch (err: any) {
      toast.error(err.message || "Error saving draft");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitApplication = async () => {
    for (let s = 1; s <= 6; s++) {
      const res = validateStep(s);
      if (!res.valid) {
        toast.error(`Step ${s} Incomplete: ${res.message}`);
        setCurrentStep(s);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
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
            insuranceCertUrl: formData.insuranceCertUrl,
            logbookUrl: formData.logbookUrl,
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
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-zinc-900 dark:text-white transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin shadow-lg" />
          <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">Loading Onboarding Portal...</p>
        </div>
      </div>
    );
  }

  // If already approved, direct to dashboard
  if (existingStatus === "APPROVED") {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white flex items-center justify-center p-4 transition-colors duration-300">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 text-center space-y-5 shadow-2xl transition-colors duration-300">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-4xl shadow-inner">
            ✓
          </div>
          <h2 className="text-2xl font-black">Account Verified & Active!</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-300 leading-relaxed">
            Your rider application is fully approved. You can toggle online and receive deliveries in your service area.
          </p>
          <div className="pt-4">
            <Link
              href="/ghuba/rider/dashboard"
              className="block w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white dark:text-zinc-950 font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50"
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-sans selection:bg-amber-500 selection:text-white dark:selection:text-zinc-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <Toaster position="top-right" />

      <div className="max-w-4xl mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-200 dark:border-zinc-800/80 transition-colors duration-300">
          <Link
            href="/ghuba/rider/join"
            className="text-xs uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
          >
            ← Back to Overview
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={submitting}
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-all flex items-center gap-2 shadow-sm"
            >
              <span className="text-sm">💾</span> Save Draft
            </button>
          </div>
        </div>

        {/* Existing Status Banner if Under Review */}
        {(existingStatus === "SUBMITTED" || existingStatus === "UNDER_REVIEW") && (
          <div className="mb-8 p-5 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-800 dark:text-blue-200 text-xs flex items-center gap-4 shadow-sm">
            <ClockIcon className="w-7 h-7 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <p className="font-bold text-sm text-blue-900 dark:text-blue-300">Application Under Verification</p>
              <p className="text-blue-700 dark:text-zinc-300 mt-1 leading-relaxed">
                Our compliance team is currently reviewing your documents. You will receive an SMS and email notification upon approval. You can update details or documents below if needed.
              </p>
            </div>
          </div>
        )}

        {existingStatus === "REJECTED" && (
          <div className="mb-8 p-5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-4 shadow-sm">
            <ExclamationTriangleIcon className="w-7 h-7 text-rose-600 dark:text-rose-400 shrink-0" />
            <div>
              <p className="font-bold text-sm text-rose-900 dark:text-rose-300">Application Requires Corrections</p>
              <p className="text-rose-700 dark:text-zinc-300 mt-1 leading-relaxed">{rejectionReason || "Please review and re-upload clear photos of your ID, license, or insurance certificate."}</p>
            </div>
          </div>
        )}

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
            Rider Onboarding Wizard
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            Step {currentStep} of 6 — <span className="text-amber-500 dark:text-amber-400 font-bold">{steps[currentStep - 1].title}</span>
          </p>
        </div>

        {/* Progress Bar / Step Pills */}
        <div className="grid grid-cols-6 gap-2 sm:gap-3 mb-10">
          {steps.map((s) => {
            const isCompleted = s.num < currentStep;
            const isCurrent = s.num === currentStep;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => handleStepJump(s.num)}
                className={`py-3 rounded-2xl text-center flex flex-col items-center justify-center transition-all duration-300 ${
                  isCurrent
                    ? "bg-amber-500 text-white dark:text-zinc-950 font-black shadow-lg shadow-amber-500/30 transform scale-105"
                    : isCompleted
                    ? "bg-emerald-50 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-100 dark:hover:bg-zinc-700 border border-emerald-200 dark:border-transparent"
                    : "bg-white dark:bg-zinc-900/60 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 border border-zinc-200 dark:border-transparent shadow-sm"
                }`}
              >
                <s.icon className={`w-5 h-5 sm:w-6 sm:h-6 mb-1 ${isCurrent ? "stroke-2" : ""}`} />
                <span className="text-[10px] sm:text-xs font-semibold hidden sm:inline">{s.title.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>

        {/* WIZARD CARD */}
        <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-xl dark:shadow-2xl transition-colors duration-300">
          
          {/* STEP 1: Personal Details */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <h2 className="text-xl font-black text-amber-500 dark:text-amber-400 flex items-center gap-3">
                  <UserIcon className="w-6 h-6" /> 1. Personal & Contact Information
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                  Ensure all details match your official identification documents.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                    Full Legal Name <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Samuel Mwangi Kariuki"
                    className="w-full px-4 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all shadow-sm"
                    required
                  />
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-500 mt-1.5">Must match your National ID name.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                    Phone Number (SMS & WhatsApp) <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 0712345678 or 254712345678"
                    className="w-full px-4 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all shadow-sm"
                    required
                  />
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-500 mt-1.5">Used for order alerts and store communication.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="samuel@gmail.com"
                    className="w-full px-4 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                    Primary Operating County <span className="text-amber-500">*</span>
                  </label>
                  <select
                    name="operatingCounty"
                    value={formData.operatingCounty}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all shadow-sm appearance-none"
                  >
                    {counties.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                    City / Town / Sub-County <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="operatingCity"
                    value={formData.operatingCity}
                    onChange={handleChange}
                    placeholder="e.g. Westlands / Nairobi Central"
                    className="w-full px-4 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                    Emergency Contact Name <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    placeholder="e.g. Mary Kariuki (Spouse / Relative)"
                    className="w-full px-4 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all shadow-sm"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                    Emergency Contact Phone Number <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                    placeholder="e.g. 0722000000"
                    className="w-full px-4 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all shadow-sm"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Identity & Verification with File Uploads */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <h2 className="text-xl font-black text-amber-500 dark:text-amber-400 flex items-center gap-3">
                  <IdentificationIcon className="w-6 h-6" /> 2. Government Identification & Licenses
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                  Upload clear photos or scans (up to 5MB each). Documents are securely encrypted and reviewed exclusively by compliance officers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                    ID Document Type <span className="text-amber-500">*</span>
                  </label>
                  <select
                    name="idType"
                    value={formData.idType}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all shadow-sm appearance-none"
                  >
                    <option value="NATIONAL_ID">Kenyan National ID</option>
                    <option value="PASSPORT">Passport</option>
                    <option value="MILITARY_ID">Military / Service ID</option>
                    <option value="ALIEN_ID">Alien ID / Work Permit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                    ID / Document Number <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleChange}
                    placeholder="e.g. 31234567"
                    className="w-full px-4 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all shadow-sm"
                    required
                  />
                </div>

                {isMotorized && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                        Driving License Number <span className="text-amber-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="drivingLicenseNo"
                        value={formData.drivingLicenseNo}
                        onChange={handleChange}
                        placeholder="e.g. DL-98765432"
                        className="w-full px-4 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all shadow-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                        Driving License Expiry Date <span className="text-amber-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="drivingLicenseExpiry"
                        value={formData.drivingLicenseExpiry}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all shadow-sm"
                        required
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Document Photo Uploaders */}
              <div className="space-y-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-wider text-amber-500 dark:text-amber-400 flex items-center gap-2">
                    <ShieldCheckIcon className="w-5 h-5" /> Required Document Uploads
                  </h3>
                  <span className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full font-medium">5MB Limit</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <RiderDocumentUpload
                    label={formData.idType === "PASSPORT" ? "Passport Bio-Data Page" : "National ID (Front Side)"}
                    sublabel="Clear photo with full name, ID number, and face visible"
                    value={formData.idFrontUrl}
                    onChange={(url) => setFormData((prev) => ({ ...prev, idFrontUrl: url }))}
                    required
                    maxSizeBytes={5 * 1024 * 1024}
                  />

                  {(formData.idType === "NATIONAL_ID" || formData.idType === "ALIEN_ID") && (
                    <RiderDocumentUpload
                      label="National ID (Back Side)"
                      sublabel="Clear photo showing the barcode, serial number, and signature"
                      value={formData.idBackUrl}
                      onChange={(url) => setFormData((prev) => ({ ...prev, idBackUrl: url }))}
                      required
                      maxSizeBytes={5 * 1024 * 1024}
                    />
                  )}

                  <RiderDocumentUpload
                    label="Rider Portrait / Clear Selfie"
                    sublabel="Neutral expression, front-facing, no sunglasses or helmets"
                    value={formData.selfieUrl}
                    onChange={(url) => setFormData((prev) => ({ ...prev, selfieUrl: url }))}
                    required
                    maxSizeBytes={5 * 1024 * 1024}
                  />

                  {isMotorized && (
                    <RiderDocumentUpload
                      label="Driving License Document / Card"
                      sublabel="Valid NTSA smart or interim driving license photo"
                      value={formData.drivingLicenseUrl}
                      onChange={(url) => setFormData((prev) => ({ ...prev, drivingLicenseUrl: url }))}
                      required
                      maxSizeBytes={5 * 1024 * 1024}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Vehicle Info with File Uploads */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <h2 className="text-xl font-black text-amber-500 dark:text-amber-400 flex items-center gap-3">
                  <TruckIcon className="w-6 h-6" /> 3. Vehicle & Transport Details
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                  Specify your primary delivery vehicle and upload registration / insurance documents.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                    Vehicle Type <span className="text-amber-500">*</span>
                  </label>
                  <select
                    name="riderType"
                    value={formData.riderType}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all shadow-sm appearance-none"
                  >
                    <option value="MOTORBIKE">Motorbike (Boda Boda)</option>
                    <option value="BICYCLE">Bicycle Courier</option>
                    <option value="CAR">Car / Saloon</option>
                    <option value="VAN">Van / Pickup</option>
                    <option value="TRUCK">Light Truck</option>
                  </select>
                </div>

                {isMotorized && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                        Number Plate / Registration <span className="text-amber-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="vehiclePlate"
                        value={formData.vehiclePlate}
                        onChange={handleChange}
                        placeholder="e.g. KMDF 123X"
                        className="w-full px-4 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none uppercase transition-all shadow-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                        Make / Brand <span className="text-amber-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="vehicleMake"
                        value={formData.vehicleMake}
                        onChange={handleChange}
                        placeholder="e.g. Boxer / Bajaj / Toyota / Hero"
                        className="w-full px-4 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all shadow-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                        Model & Color <span className="text-amber-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="vehicleModel"
                        value={formData.vehicleModel}
                        onChange={handleChange}
                        placeholder="e.g. 150cc Red"
                        className="w-full px-4 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all shadow-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                        Insurance Policy Number <span className="text-amber-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="insuranceNumber"
                        value={formData.insuranceNumber}
                        onChange={handleChange}
                        placeholder="e.g. INS-2026-X89"
                        className="w-full px-4 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all shadow-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                        Insurance Expiry Date <span className="text-amber-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="insuranceExpiry"
                        value={formData.insuranceExpiry}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all shadow-sm"
                        required
                      />
                    </div>
                  </>
                )}
              </div>

              {isMotorized && (
                <div className="space-y-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-wider text-amber-500 dark:text-amber-400 flex items-center gap-2">
                      <TruckIcon className="w-5 h-5" /> Vehicle Verification Files
                    </h3>
                    <span className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full font-medium">5MB Limit</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <RiderDocumentUpload
                      label="Vehicle Photo (Showing Registration)"
                      sublabel="Clear photo of the complete vehicle with license plate readable"
                      value={formData.vehiclePhotoUrl}
                      onChange={(url) => setFormData((prev) => ({ ...prev, vehiclePhotoUrl: url }))}
                      required
                      maxSizeBytes={5 * 1024 * 1024}
                    />

                    <RiderDocumentUpload
                      label="Vehicle Insurance Certificate / Sticker"
                      sublabel="Valid commercial or third-party insurance certificate"
                      value={formData.insuranceCertUrl}
                      onChange={(url) => setFormData((prev) => ({ ...prev, insuranceCertUrl: url }))}
                      required
                      maxSizeBytes={5 * 1024 * 1024}
                    />

                    <div className="sm:col-span-2">
                      <RiderDocumentUpload
                        label="Logbook / Proof of Ownership (Optional)"
                        sublabel="Logbook copy or power of attorney if vehicle is leased"
                        value={formData.logbookUrl}
                        onChange={(url) => setFormData((prev) => ({ ...prev, logbookUrl: url }))}
                        maxSizeBytes={5 * 1024 * 1024}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Service Areas & Radius */}
          {currentStep === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <h2 className="text-xl font-black text-amber-500 dark:text-amber-400 flex items-center gap-3">
                  <MapPinIcon className="w-6 h-6" /> 4. Service Areas & Delivery Radius
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                  Choose where you prefer to pick up and drop orders in {formData.operatingCounty}.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-4">
                  Select Operating Neighborhoods / Zones <span className="text-amber-500">*</span>:
                </label>
                <div className="flex flex-wrap gap-3">
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
                    "Ngong Road",
                    "Kasarani",
                    "Langata",
                  ].map((area) => {
                    const isSelected = formData.serviceAreas.includes(area);
                    return (
                      <button
                        type="button"
                        key={area}
                        onClick={() => handleAreaToggle(area)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 border ${
                          isSelected
                            ? "bg-amber-500 text-white dark:text-zinc-950 border-amber-500 shadow-md shadow-amber-500/30 transform scale-105"
                            : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-amber-400 hover:text-amber-500 dark:hover:text-white dark:hover:bg-zinc-700"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {area}
                      </button>
                    );
                  })}
                </div>
                {formData.serviceAreas.length === 0 && (
                  <p className="text-sm text-rose-500 mt-3 font-medium">Please select at least one zone to continue.</p>
                )}
              </div>

              <div className="space-y-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">Maximum Preferred Delivery Radius:</span>
                  <span className="text-amber-500 dark:text-amber-400 font-black text-xl bg-amber-50 dark:bg-amber-500/10 px-4 py-1.5 rounded-lg border border-amber-200 dark:border-amber-500/20">
                    {formData.maxDistanceKm} km
                  </span>
                </div>
                <div className="py-4">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    name="maxDistanceKm"
                    value={formData.maxDistanceKm}
                    onChange={handleChange}
                    className="w-full accent-amber-500 cursor-pointer h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full appearance-none outline-none focus:ring-4 focus:ring-amber-500/30 transition-all"
                  />
                </div>
                <div className="flex justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  <span>5 km (Local Drops)</span>
                  <span>25 km (Metropolitan)</span>
                  <span>50 km (Cross-County)</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Payout Details */}
          {currentStep === 5 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <h2 className="text-xl font-black text-amber-500 dark:text-amber-400 flex items-center gap-3">
                  <BanknotesIcon className="w-6 h-6" /> 5. Payment & M-Pesa Withdrawal Details
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                  Your delivery earnings and customer tips are credited directly to your digital wallet upon proof-of-delivery confirmation.
                </p>
              </div>

              <div className="space-y-6 max-w-xl">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                    Preferred Payout Method <span className="text-amber-500">*</span>
                  </label>
                  <select
                    name="payoutMethod"
                    value={formData.payoutMethod}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all shadow-sm appearance-none"
                  >
                    <option value="MPESA">Safaricom M-Pesa (Instant Withdrawal)</option>
                    <option value="BANK">Direct Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                    M-Pesa Registered Mobile Number <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mpesaPhone"
                    value={formData.mpesaPhone}
                    onChange={handleChange}
                    placeholder="e.g. 0712345678 or 254712345678"
                    className="w-full px-4 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all shadow-sm"
                    required
                  />
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
                    Must be registered under your legal name matching your National ID.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Review & Submit */}
          {currentStep === 6 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <h2 className="text-xl font-black text-amber-500 dark:text-amber-400 flex items-center gap-3">
                  <CheckCircleIcon className="w-6 h-6" /> 6. Final Review & Document Verification
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                  Double check all submitted personal details, vehicle data, and uploaded document evidence before submitting.
                </p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-zinc-50 dark:bg-zinc-950/80 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 space-y-3 text-sm shadow-sm">
                  <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-2">
                    <span className="font-black text-amber-500 dark:text-amber-400 uppercase tracking-wider text-xs">Personal & Contact</span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-zinc-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1.5 text-xs font-bold transition-colors"
                    >
                      <PencilSquareIcon className="w-4 h-4" /> Edit
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">Full Name:</span>
                    <span className="font-bold text-zinc-900 dark:text-white">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">Phone:</span>
                    <span className="font-bold text-zinc-900 dark:text-white">{formData.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">Operating City:</span>
                    <span className="font-bold text-zinc-900 dark:text-white">{formData.operatingCity}, {formData.operatingCounty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">Emergency Contact:</span>
                    <span className="font-bold text-zinc-900 dark:text-white">{formData.emergencyContactName} ({formData.emergencyContactPhone})</span>
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-950/80 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 space-y-3 text-sm shadow-sm">
                  <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-2">
                    <span className="font-black text-amber-500 dark:text-amber-400 uppercase tracking-wider text-xs">Vehicle & Settlement</span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-zinc-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1.5 text-xs font-bold transition-colors"
                    >
                      <PencilSquareIcon className="w-4 h-4" /> Edit
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">Transport Mode:</span>
                    <span className="font-bold text-zinc-900 dark:text-white">{formData.riderType}</span>
                  </div>
                  {isMotorized && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-zinc-500 dark:text-zinc-400">Registration Plate:</span>
                        <span className="font-black text-amber-600 dark:text-amber-400 uppercase bg-amber-100 dark:bg-amber-500/10 px-2 py-0.5 rounded">{formData.vehiclePlate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500 dark:text-zinc-400">Make & Model:</span>
                        <span className="font-bold text-zinc-900 dark:text-white">{formData.vehicleMake} {formData.vehicleModel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500 dark:text-zinc-400">Insurance Policy:</span>
                        <span className="font-bold text-zinc-900 dark:text-white">{formData.insuranceNumber}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">M-Pesa Payout:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{formData.mpesaPhone}</span>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents Gallery */}
              <div className="bg-zinc-50 dark:bg-zinc-950/80 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
                <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-500 dark:text-amber-400 flex items-center gap-2">
                    <DocumentCheckIcon className="w-5 h-5" /> Uploaded Credentials
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-zinc-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1.5 text-xs font-bold transition-colors"
                  >
                    <PencilSquareIcon className="w-4 h-4" /> Edit Documents
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-between shadow-sm">
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-bold mb-2 truncate w-full">ID Front</p>
                    {formData.idFrontUrl ? (
                      <a href={formData.idFrontUrl} target="_blank" rel="noreferrer" className="relative group block w-16 h-16 rounded-lg overflow-hidden border border-emerald-500/40 shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={formData.idFrontUrl} alt="ID Front" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] transition-opacity duration-300">
                          <EyeIcon className="w-5 h-5" />
                        </div>
                      </a>
                    ) : (
                      <span className="text-[11px] text-rose-500 font-medium">Missing</span>
                    )}
                  </div>

                  {(formData.idType === "NATIONAL_ID" || formData.idType === "ALIEN_ID") && (
                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-between shadow-sm">
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-bold mb-2 truncate w-full">ID Back</p>
                      {formData.idBackUrl ? (
                        <a href={formData.idBackUrl} target="_blank" rel="noreferrer" className="relative group block w-16 h-16 rounded-lg overflow-hidden border border-emerald-500/40 shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={formData.idBackUrl} alt="ID Back" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] transition-opacity duration-300">
                            <EyeIcon className="w-5 h-5" />
                          </div>
                        </a>
                      ) : (
                        <span className="text-[11px] text-rose-500 font-medium">Missing</span>
                      )}
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-between shadow-sm">
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-bold mb-2 truncate w-full">Face Portrait</p>
                    {formData.selfieUrl ? (
                      <a href={formData.selfieUrl} target="_blank" rel="noreferrer" className="relative group block w-16 h-16 rounded-lg overflow-hidden border border-emerald-500/40 shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={formData.selfieUrl} alt="Selfie" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] transition-opacity duration-300">
                          <EyeIcon className="w-5 h-5" />
                        </div>
                      </a>
                    ) : (
                      <span className="text-[11px] text-rose-500 font-medium">Missing</span>
                    )}
                  </div>

                  {isMotorized && (
                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-between shadow-sm">
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-bold mb-2 truncate w-full">Driving License</p>
                      {formData.drivingLicenseUrl ? (
                        <a href={formData.drivingLicenseUrl} target="_blank" rel="noreferrer" className="relative group block w-16 h-16 rounded-lg overflow-hidden border border-emerald-500/40 shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={formData.drivingLicenseUrl} alt="License" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] transition-opacity duration-300">
                            <EyeIcon className="w-5 h-5" />
                          </div>
                        </a>
                      ) : (
                        <span className="text-[11px] text-rose-500 font-medium">Missing</span>
                      )}
                    </div>
                  )}

                  {isMotorized && (
                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-between shadow-sm">
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-bold mb-2 truncate w-full">Vehicle Photo</p>
                      {formData.vehiclePhotoUrl ? (
                        <a href={formData.vehiclePhotoUrl} target="_blank" rel="noreferrer" className="relative group block w-16 h-16 rounded-lg overflow-hidden border border-emerald-500/40 shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={formData.vehiclePhotoUrl} alt="Vehicle" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] transition-opacity duration-300">
                            <EyeIcon className="w-5 h-5" />
                          </div>
                        </a>
                      ) : (
                        <span className="text-[11px] text-rose-500 font-medium">Missing</span>
                      )}
                    </div>
                  )}

                  {isMotorized && (
                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-between shadow-sm">
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-bold mb-2 truncate w-full">Insurance Cert</p>
                      {formData.insuranceCertUrl ? (
                        <a href={formData.insuranceCertUrl} target="_blank" rel="noreferrer" className="relative group block w-16 h-16 rounded-lg overflow-hidden border border-emerald-500/40 shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={formData.insuranceCertUrl} alt="Insurance" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] transition-opacity duration-300">
                            <EyeIcon className="w-5 h-5" />
                          </div>
                        </a>
                      ) : (
                        <span className="text-[11px] text-rose-500 font-medium">Missing</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 space-y-3 shadow-inner">
                <label className="flex items-start gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 accent-amber-500 rounded border-zinc-300 dark:border-zinc-700 cursor-pointer"
                  />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    I confirm that the identification documents, driver license, and vehicle details submitted are authentic and legally registered in Kenya. I agree to adhere to the{" "}
                    <span className="text-amber-600 dark:text-amber-400 underline font-bold hover:text-amber-500 transition-colors">Ghuba Delivery Provider Code of Conduct</span>{" "}
                    and road safety standards.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Wizard Navigation Controls Bottom */}
          <div className="flex items-center justify-between pt-8 border-t border-zinc-200 dark:border-zinc-800 mt-10">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s - 1)}
                className="px-6 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 transition-all duration-300 shadow-sm"
              >
                <ArrowLeftIcon className="w-4 h-4" /> Previous
              </button>
            ) : (
              <div />
            )}

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white dark:text-zinc-950 text-sm font-black uppercase tracking-wider flex items-center gap-2 transition-all duration-300 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 active:scale-95"
              >
                Next Step <ArrowRightIcon className="w-4 h-4 stroke-[3]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitApplication}
                disabled={submitting}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white dark:text-zinc-950 text-sm font-black uppercase tracking-wider flex items-center gap-2 transition-all duration-300 shadow-xl shadow-amber-500/40 hover:shadow-amber-500/60 active:scale-95 disabled:opacity-50"
              >
                {submitting ? "Submitting Application..." : "Submit Application for Verification"}
                <ArrowRightIcon className="w-5 h-5 stroke-[3]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}