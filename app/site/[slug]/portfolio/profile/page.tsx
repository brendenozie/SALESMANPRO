'use client';

import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCircleIcon,
  ScissorsIcon,
  SparklesIcon,
  ClockIcon,
  CreditCardIcon,
  MapPinIcon,
  BellIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  FingerPrintIcon,
  ShieldCheckIcon,
  WalletIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";

/**
 * Full integrated frontend for Services Profile Page
 * - SWR data fetching from /api/site/* endpoints
 * - Optimistic bookings
 * - Add / Remove payment methods (optimistic)
 * - Minimal UI changes (keeps your design)
 */

/* -------------------------
   utility: fetcher
   ------------------------- */
const fetcher = (url: string) =>
  fetch(url).then(async (res) => {
    if (!res.ok) {
      const txt = await res.text().catch(() => "Fetch error");
      throw new Error(txt || "Fetch error");
    }
    return res.json();
  });

/* -------------------------
   small mocks as fallback
   ------------------------- */
const FALLBACK = {
  user: {
    name: "Alex Sterling",
    email: "alex.sterling@example.com",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80",
    memberSince: "Jan 2023",
    membership: "Gold Tier",
  },
  services: [
    { id: "s1", name: "Premium Haircut", price: 45, duration: "45m", icon: ScissorsIcon },
    { id: "s2", name: "Dry Cleaning", price: 30, duration: "24h", icon: SparklesIcon },
    { id: "s3", name: "House Keeping", price: 120, duration: "3h", icon: UserCircleIcon },
    { id: "s4", name: "Shoe Repair", price: 35, duration: "48h", icon: ClockIcon },
  ],
  timeSlots: ["09:00 AM", "10:30 AM", "01:00 PM", "03:30 PM", "05:00 PM"],
  stats: [
    { label: "Total Orders", value: "24", icon: SparklesIcon, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Pending", value: "2", icon: ClockIcon, color: "text-amber-600", bg: "bg-amber-100" },
    { label: "Spent this Mo.", value: "$340", icon: CreditCardIcon, color: "text-emerald-600", bg: "bg-emerald-100" },
  ],
};

/* -------------------------
   animation variants
   ------------------------- */
const fadeVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", duration: 0.45 } },
  exit: { opacity: 0, scale: 0.95 },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

/* -------------------------
   Booking Modal (integrated)
   accepts:
     - isOpen, onClose
     - services array
     - timeSlots
     - createBookingOptimistic(payload) -> Promise<boolean>
   ------------------------- */
type ServiceType = any;
const BookingModal = ({
  isOpen,
  onClose,
  services,
  timeSlots,
  createBookingOptimistic,
}: {
  isOpen: boolean;
  onClose: () => void;
  services: ServiceType[] | undefined;
  timeSlots: string[] | undefined;
  createBookingOptimistic: (payload: { serviceId: string; date: string; time: string; price?: number | null }) => Promise<boolean>;
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1);
        setSelectedService(null);
        setSelectedDate(null);
        setSelectedTime(null);
        setLoading(false);
      }, 300);
    }
  }, [isOpen]);

  const dates = [...Array(5)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return { day: d.toLocaleDateString("en-US", { weekday: "short" }), date: d.getDate(), full: d.toISOString().split("T")[0] };
  });

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const handleConfirm = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;
    setLoading(true);
    const payload = { serviceId: selectedService.id, date: selectedDate, time: selectedTime, price: selectedService.finalPrice ?? selectedService.sellingPrice ?? selectedService.price };
    const ok = await createBookingOptimistic(payload);
    if (ok) setStep(3);
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{step === 3 ? "Booking Confirmed!" : "Book a Service"}</h3>
                {step < 3 && <p className="text-sm text-slate-500">Step {step} of 3</p>}
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <XMarkIcon className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-8 min-h-[400px]">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                    <h4 className="font-semibold text-slate-700 mb-4">Choose a Service</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {(services ?? FALLBACK.services).map((s: any) => {
                        const Icon = s.icon ?? ScissorsIcon;
                        return (
                          <div
                            key={s.id}
                            onClick={() => setSelectedService(s)}
                            className={`cursor-pointer p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center text-center gap-3 ${
                              selectedService?.id === s.id ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md" : "border-slate-100 hover:border-indigo-200 hover:bg-slate-50 text-slate-600"
                            }`}
                          >
                            <Icon className="w-8 h-8" />
                            <div>
                              <div className="font-bold text-sm">{s.name}</div>
                              <div className="text-xs opacity-70">{(s.finalPrice ?? s.sellingPrice ?? s.price) + ""} • {s.duration ?? "—"}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-3">Select Date</h4>
                      <div className="flex justify-between gap-2">
                        {dates.map((d, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedDate(d.full)}
                            className={`flex-1 py-3 rounded-xl border flex flex-col items-center transition-all ${
                              selectedDate === d.full ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200" : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50"
                            }`}
                          >
                            <span className="text-xs uppercase font-medium opacity-80">{d.day}</span>
                            <span className="text-lg font-bold">{d.date}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-700 mb-3">Available Time</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {(timeSlots ?? FALLBACK.timeSlots).map((t) => (
                          <button
                            key={t}
                            onClick={() => setSelectedTime(t)}
                            className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${selectedTime === t ? "bg-indigo-100 text-indigo-700 border-indigo-300" : "border-slate-200 text-slate-600 hover:border-indigo-300"}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step3" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center justify-center text-center h-full pt-4">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                      <CheckCircleIcon className="w-10 h-10 text-green-600" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">You're All Set!</h2>
                    <p className="text-slate-500 max-w-xs mx-auto mb-6">
                      Your <strong>{selectedService?.name}</strong> has been scheduled for <strong>{selectedTime}</strong>. A confirmation email has been sent.
                    </p>
                    <div className="w-full bg-slate-50 rounded-xl p-4 border border-slate-200 text-left text-sm text-slate-600">
                      <div className="flex justify-between mb-2"><span>Service</span><span className="font-semibold">{selectedService?.name}</span></div>
                      <div className="flex justify-between mb-2"><span>Total</span><span className="font-semibold">{selectedService?.finalPrice ?? selectedService?.sellingPrice ?? selectedService?.price}</span></div>
                      <div className="flex justify-between"><span>Provider</span><span className="font-semibold">{selectedService?.providerName ?? "Sparkle Inc."}</span></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-between">
              {step === 1 && <button onClick={onClose} className="text-slate-500 font-medium hover:text-slate-800">Cancel</button>}
              {step === 2 && (
                <button onClick={handleBack} className="flex items-center text-slate-500 font-medium hover:text-slate-800">
                  <ChevronLeftIcon className="w-4 h-4 mr-1" /> Back
                </button>
              )}

              {step < 3 ? (
                <button
                  onClick={step === 2 ? handleConfirm : handleNext}
                  disabled={(step === 1 && !selectedService) || (step === 2 && (!selectedDate || !selectedTime)) || loading}
                  className="ml-auto bg-indigo-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg shadow-indigo-300 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? "Booking..." : "Continue"}
                </button>
              ) : (
                <button onClick={onClose} className="w-full bg-green-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg shadow-green-300 hover:bg-green-700 transition-all">Done</button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

/* -------------------------
   Tabs (overview/bookings/payments/settings)
   These accept props from the main component
   ------------------------- */

const OverviewTab = ({ onBook, stats, activeOrder, history }: { onBook: () => void; stats: any[]; activeOrder: any; history: any[] }) => (
  <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {(stats?.length ? stats : FALLBACK.stats).map((stat: any, idx: number) => (
        <div key={idx} className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <span className="text-slate-400 text-sm font-medium">Last 30 days</span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
            <p className="text-slate-500 font-medium">{stat.label}</p>
          </div>
        </div>
      ))}
    </motion.div>

    <motion.div variants={itemVariants} className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur opacity-20 translate-y-2"></div>
      <div className="relative bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wide mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              {activeOrder?.status ?? "In Progress"}
            </span>
            <h2 className="text-2xl font-bold text-slate-800">{activeOrder?.service ?? "—"}</h2>
            <p className="text-slate-500 flex items-center gap-2 mt-1">
              <MapPinIcon className="w-4 h-4" /> {activeOrder?.provider ?? "—"}
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <p className="text-sm text-slate-400">Estimated Completion</p>
            <p className="text-xl font-semibold text-slate-700">{activeOrder?.eta ?? "—"}</p>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-slate-600">Progress</span>
            <span className="text-blue-600">{activeOrder?.progress ?? 0}%</span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${activeOrder?.progress ?? 0}%` }} transition={{ duration: 1.2, ease: "easeOut" }} className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {(activeOrder?.items ?? []).map((item: any, i: number) => (
            <span key={i} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600">
              {item}
            </span>
          ))}
        </div>
      </div>
    </motion.div>

    <motion.div variants={itemVariants}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-800">Recent Activity</h3>
        <button className="text-indigo-600 font-semibold text-sm hover:underline">View All</button>
      </div>

      <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-white/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                <th className="p-6 font-semibold">Service</th>
                <th className="p-6 font-semibold">Date</th>
                <th className="p-6 font-semibold">Amount</th>
                <th className="p-6 font-semibold">Status</th>
                <th className="p-6 font-semibold text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {(history ?? []).map((item: any) => (
                <tr key={item.id} className="group hover:bg-white/50 transition-colors border-b border-slate-50 last:border-0">
                  <td className="p-6">
                    <div className="font-bold text-slate-700">{item.service}</div>
                    <div className="text-slate-400 text-xs mt-1">{item.provider}</div>
                  </td>
                  <td className="p-6 text-slate-500">{item.date}</td>
                  <td className="p-6 font-mono font-medium text-slate-700">{item.price}</td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === "Completed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{item.status}</span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-1">
                      {[...Array(5)].map((_, i) => (<StarIcon key={i} className={`w-4 h-4 ${i < (item.rating ?? 0) ? "text-amber-400" : "text-slate-200"}`} />))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

const BookingsTab = ({ bookings, onCancel }: { bookings: any[]; onCancel: (id: string) => Promise<void> }) => (
  <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-2xl font-bold text-slate-800">My Bookings</h3>
      <div className="flex gap-2">
        {["All", "Active", "Completed"].map((f) => (
          <button key={f} className={`px-4 py-2 rounded-full text-sm font-medium ${f === "All" ? "bg-slate-800 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>{f}</button>
        ))}
      </div>
    </div>

    <div className="space-y-4">
      {(bookings ?? []).map((item: any, i: number) => (
        <div key={item.id ?? i} className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 group hover:shadow-md transition-all">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform"><CheckCircleIcon className="w-6 h-6" /></div>
            <div>
              <h4 className="font-bold text-slate-800">{item.service?.name ?? item.service ?? item.title}</h4>
              <p className="text-sm text-slate-500">{item.provider ?? item.service?.providerName ?? ""} • {item.date ?? item.createdAt?.split?.("T")?.[0]}</p>
            </div>
          </div>
          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
            <span className="font-mono font-bold text-slate-700">{item.price ? `$${item.price}` : item.totalPrice ?? item.price ?? "—"}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === "Completed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{item.status ?? "Pending"}</span>

            {item.status !== "Completed" && item.status !== "CANCELLED" && (
              <button onClick={() => onCancel(item.id)} className="text-rose-600 text-sm font-semibold hover:underline ml-4">Cancel</button>
            )}
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

const PaymentsTab = ({ methods, onAdd, onDelete }: { methods: any[]; onAdd: (card: any) => Promise<boolean>; onDelete: (id: string) => Promise<boolean> }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [last4, setLast4] = useState("");
  const [holder, setHolder] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");

  const handleAdd = async () => {
    if (!last4 || !holder) return alert("Enter cardholder and last4 digits");
    const ok = await onAdd({ last4, holder, expMonth: Number(expMonth || 0), expYear: Number(expYear || 0), type: "card", provider: "local" });
    if (ok) {
      setShowAdd(false);
      setLast4("");
      setHolder("");
      setExpMonth("");
      setExpYear("");
    }
  };

  return (
    <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
      <h3 className="text-2xl font-bold text-slate-800">Payment Methods</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(methods ?? []).map((card: any) => (
          <div key={card.id} className={`rounded-3xl p-8 text-white shadow-xl relative overflow-hidden h-56 flex flex-col justify-between ${card.type === "card" ? "bg-gradient-to-br from-slate-800 to-slate-900" : "bg-gradient-to-br from-indigo-500 to-purple-600"}`}>
            <div className="flex justify-between items-start">
              <div className="opacity-80">{card.isDefault ? "Primary Card" : "Card"}</div>
              <CreditCardIcon className="w-8 h-8 opacity-80" />
            </div>
            <div>
              <div className="text-2xl font-mono tracking-widest mb-4">**** **** **** {card.last4 ?? "4242"}</div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs opacity-60 uppercase">Card Holder</div>
                  <div className="font-medium">{card.holder ?? "ALEX STERLING"}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-60 uppercase">Expires</div>
                  <div className="font-medium">{card.expMonth ?? "12"}/{card.expYear ?? "25"}</div>
                </div>
              </div>
            </div>

            <div className="absolute top-3 right-3 flex gap-2">
              <button onClick={() => onDelete(card.id)} className="px-3 py-1 bg-white/20 rounded-md text-white text-xs hover:bg-white/30">Remove</button>
            </div>
          </div>
        ))}
      </div>

      {!showAdd && (
        <button onClick={() => setShowAdd(true)} className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 font-medium hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
          <span className="text-2xl">+</span> Add New Payment Method
        </button>
      )}

      {showAdd && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <input value={holder} onChange={(e) => setHolder(e.target.value)} placeholder="Card Holder" className="p-3 border border-slate-200 rounded-xl" />
            <input value={last4} onChange={(e) => setLast4(e.target.value.replace(/\D/g, ""))} placeholder="Last 4 digits" maxLength={4} className="p-3 border border-slate-200 rounded-xl" />
            <input value={expMonth} onChange={(e) => setExpMonth(e.target.value.replace(/\D/g, ""))} placeholder="Exp Month (MM)" maxLength={2} className="p-3 border border-slate-200 rounded-xl" />
            <input value={expYear} onChange={(e) => setExpYear(e.target.value.replace(/\D/g, ""))} placeholder="Exp Year (YY)" maxLength={2} className="p-3 border border-slate-200 rounded-xl" />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
            <button onClick={handleAdd} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Add Card</button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const SettingsTab = ({ settings, mutateSettings }: { settings: any; mutateSettings: () => void }) => {
  const [twoFA, setTwoFA] = useState<boolean>(settings?.twoFA ?? true);
  const [faceID, setFaceID] = useState<boolean>(settings?.faceID ?? false);
  const [emailNotif, setEmailNotif] = useState<boolean>(settings?.emailNotif ?? true);

  useEffect(() => {
    setTwoFA(settings?.twoFA ?? true);
    setFaceID(settings?.faceID ?? false);
    setEmailNotif(settings?.emailNotif ?? true);
  }, [settings]);

  const save = async () => {
    try {
      const res = await fetch("/api/site/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ twoFA, faceID, emailNotif }),
      });
      if (!res.ok) throw new Error(await res.text());
      mutateSettings();
      alert("Settings saved");
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Failed to save settings");
    }
  };

  return (
    <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="max-w-2xl space-y-8">
      <h3 className="text-2xl font-bold text-slate-800">Account Settings</h3>

      <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-white shadow-sm space-y-6">
        <h4 className="font-bold text-slate-700 flex items-center gap-2">
          <FingerPrintIcon className="w-5 h-5 text-indigo-600" /> Security
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <div className="font-medium text-slate-800">Two-Factor Authentication</div>
              <div className="text-xs text-slate-500">Add an extra layer of security</div>
            </div>
            <button onClick={() => setTwoFA(!twoFA)} className={`w-12 h-6 rounded-full p-1 ${twoFA ? "bg-indigo-600 justify-end flex" : "bg-slate-200 justify-start flex"}`}>
              <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <div className="font-medium text-slate-800">Face ID Login</div>
              <div className="text-xs text-slate-500">Use biometrics to sign in</div>
            </div>
            <button onClick={() => setFaceID(!faceID)} className={`w-12 h-6 rounded-full p-1 ${faceID ? "bg-indigo-600 justify-end flex" : "bg-slate-200 justify-start flex"}`}>
              <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-white shadow-sm space-y-6">
        <h4 className="font-bold text-slate-700 flex items-center gap-2">
          <ShieldCheckIcon className="w-5 h-5 text-indigo-600" /> Notifications
        </h4>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" checked={emailNotif} onChange={() => setEmailNotif(!emailNotif)} className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300" />
            <span className="text-slate-600 group-hover:text-slate-900">Order Updates</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" checked={emailNotif} onChange={() => setEmailNotif(!emailNotif)} className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300" />
            <span className="text-slate-600 group-hover:text-slate-900">Promotions & Deals</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" checked={emailNotif} onChange={() => setEmailNotif(!emailNotif)} className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300" />
            <span className="text-slate-600 group-hover:text-slate-900">New Services</span>
          </label>
        </div>
        <div className="pt-2 flex justify-end">
          <button onClick={save} className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold">Save Settings</button>
        </div>
      </div>
    </motion.div>
  );
};

/* -------------------------
   MAIN: UserProfileDashboard
   wires SWR endpoints + optimistic handlers
   ------------------------- */

export default function UserProfileDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // SWR hooks
  const { data: profileData } = useSWR("/api/site/profile", fetcher, { fallbackData: FALLBACK.user });
  const { data: servicesData } = useSWR("/api/site/services", fetcher, { fallbackData: FALLBACK.services });
  const { data: bookingsData, mutate: mutateBookings } = useSWR("/api/site/services/bookings", fetcher, { fallbackData: [] });
  const { data: paymentsData, mutate: mutatePayments } = useSWR("/api/site/payments", fetcher, { fallbackData: [] });
  const { data: settingsData, mutate: mutateSettings } = useSWR("/api/site/user/settings", fetcher, { fallbackData: {} });
  const { data: statsData } = useSWR("/api/site/stats", fetcher, { fallbackData: FALLBACK.stats });
  const { data: activeOrderData } = useSWR("/api/site/active-order", fetcher, { fallbackData: null });
  const { data: historyData } = useSWR("/api/site/orders", fetcher, { fallbackData: [] });
  const timeSlots = FALLBACK.timeSlots; // could be extended to come from API per service

  /* -------------------------
     Optimistic create booking
     ------------------------- */
  const createBookingOptimistic = async (payload: { serviceId: string; date: string; time: string; price?: number | null }) => {
    const tempId = `temp-${Date.now()}`;
    const service = (servicesData ?? []).find((s: any) => s.id === payload.serviceId) ?? { id: payload.serviceId, name: "Service", finalPrice: payload.price };
    const tempBooking = {
      id: tempId,
      service: service,
      serviceId: payload.serviceId,
      date: payload.date,
      time: payload.time,
      price: payload.price ?? service.finalPrice ?? service.sellingPrice ?? service.price,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    // optimistic update
    mutateBookings((prev: any[] = []) => [tempBooking, ...prev], false);

    try {
      const res = await fetch("/api/site/services/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "Booking failed");
        throw new Error(txt || "Booking failed");
      }
      // replace with server data
      await mutateBookings();
      return true;
    } catch (err: any) {
      console.error("Booking error", err);
      // revert
      await mutateBookings();
      alert(err?.message || "Failed to create booking");
      return false;
    }
  };

  /* -------------------------
     Cancel booking
     ------------------------- */
  const cancelBooking = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    // optimistic remove / mark
    const previous = bookingsData ?? [];
    mutateBookings((prev: any[] = []) => prev.map((b: any) => (b.id === id ? { ...b, status: "CANCELLED" } : b)), false);

    try {
      const res = await fetch("/api/site/services/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id }),
      });
      if (!res.ok) throw new Error(await res.text());
      await mutateBookings();
      alert("Booking cancelled");
    } catch (err: any) {
      console.error(err);
      // revert
      mutateBookings(previous, false);
      alert(err?.message || "Failed to cancel booking");
    }
  };

  /* -------------------------
     Add payment method (optimistic)
     ------------------------- */
  const addPaymentMethod = async (card: any) => {
    const temp = { id: `temp-${Date.now()}`, ...card, createdAt: new Date().toISOString() };
    mutatePayments((prev: any[] = []) => [temp, ...prev], false);

    try {
      const res = await fetch("/api/site/payments/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(card),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "Add payment failed");
        throw new Error(txt || "Add payment failed");
      }
      await mutatePayments();
      return true;
    } catch (err: any) {
      console.error(err);
      await mutatePayments();
      alert(err?.message || "Failed to add card");
      return false;
    }
  };

  /* -------------------------
     Delete payment method (optimistic)
     ------------------------- */
  const deletePaymentMethod = async (id: string) => {
    const previous = paymentsData ?? [];
    mutatePayments((prev: any[] = []) => prev.filter((p: any) => p.id !== id), false);

    try {
      const res = await fetch("/api/site/payments/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error(await res.text());
      await mutatePayments();
      return true;
    } catch (err: any) {
      console.error(err);
      // revert
      mutatePayments(previous, false);
      alert(err?.message || "Failed to remove card");
      return false;
    }
  };

  /* -------------------------
     Render content router
     ------------------------- */
  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab onBook={() => setIsModalOpen(true)} stats={statsData ?? []} activeOrder={activeOrderData} history={historyData ?? []} />;
      case "bookings":
        return <BookingsTab bookings={bookingsData ?? []} onCancel={cancelBooking} />;
      case "payment methods":
      case "payments":
        return <PaymentsTab methods={paymentsData ?? []} onAdd={addPaymentMethod} onDelete={deletePaymentMethod} />;
      case "settings":
        return <SettingsTab settings={settingsData} mutateSettings={mutateSettings} />;
      default:
        return <OverviewTab onBook={() => setIsModalOpen(true)} stats={statsData ?? []} activeOrder={activeOrderData} history={historyData ?? []} />;
    }
  };

  return (
    <div className="min-h-screen mt-24 bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-700 relative overflow-hidden">
      {/* decorative blobs */}
      <div className="fixed inset-0 overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-200/40 rounded-full blur-3xl mix-blend-multiply filter opacity-70 animate-blob" />
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl mix-blend-multiply filter opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-200/40 rounded-full blur-3xl mix-blend-multiply filter opacity-70 animate-blob animation-delay-4000" />
      </div>

      {/* Booking modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        services={servicesData}
        timeSlots={timeSlots}
        createBookingOptimistic={createBookingOptimistic}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              Welcome back, {(profileData?.name ?? FALLBACK.user.name).split(" ")[0]}
            </h1>
            <p className="text-slate-500 mt-1">Manage your lifestyle services in one place.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full bg-white/60 backdrop-blur-md shadow-sm border border-slate-200 hover:bg-white transition-colors">
              <BellIcon className="w-6 h-6 text-slate-600" />
            </button>
            <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-shadow">
              <img src={profileData?.avatar ?? FALLBACK.user.avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-100" />
              <span className="font-medium text-sm text-slate-700">{profileData?.name ?? FALLBACK.user.name}</span>
            </div>
          </div>
        </header>

        {/* grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl shadow-slate-200/50 sticky top-10">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img src={profileData?.avatar ?? FALLBACK.user.avatar} alt="Large Profile" className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white shadow-lg" />
                  <span className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 border-4 border-white rounded-full" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-800">{profileData?.name ?? FALLBACK.user.name}</h2>
                <span className="inline-block mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wide rounded-full">
                  {profileData?.membership ?? FALLBACK.user.membership}
                </span>
              </div>

              <nav className="space-y-2">
                {["Overview", "Bookings", "Payment Methods", "Settings"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setActiveTab(item.toLowerCase())}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                      activeTab === item.toLowerCase() ? "bg-slate-800 text-white shadow-lg shadow-slate-800/20" : "text-slate-600 hover:bg-white hover:shadow-md"
                    }`}
                  >
                    <span className="font-medium capitalize">{item}</span>
                    {activeTab === item.toLowerCase() && <ArrowRightIcon className="w-4 h-4" />}
                  </button>
                ))}
              </nav>

              <div className="mt-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <SparklesIcon className="w-32 h-32 absolute -right-6 -bottom-6 text-white/10 rotate-12" />
                <h3 className="text-lg font-bold relative z-10">Fresh Look?</h3>
                <p className="text-indigo-100 text-sm mt-1 relative z-10 mb-4">Book a new service today.</p>
                <button onClick={() => setIsModalOpen(true)} className="relative z-10 w-full bg-white text-indigo-700 py-2 rounded-xl font-semibold text-sm hover:bg-indigo-50 transition-colors shadow-sm">
                  Book Now
                </button>
              </div>
            </div>
          </div>

          {/* content */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
