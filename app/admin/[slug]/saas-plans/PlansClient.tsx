"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  EllipsisVerticalIcon,
  CheckIcon,
  XMarkIcon,
  CalendarDaysIcon,
  BuildingOffice2Icon
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { toast, Toaster } from "react-hot-toast";
import { PlanItem } from "./page"; // Assuming PlanItem is imported correctly
import { SITE_TYPES } from "@/constant/SITE_TYPES"; // Assuming SITE_TYPES is an array of strings

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// =================================================================================================
// TYPE DEFINITIONS (kept the same for brevity)
// =================================================================================================
// ... (Your existing type definitions)
interface SubscriptionItem {
    id: string;
    userId: string;
    user: { id: string; name: string; email: string; };
    planId: string;
    plan: { id: string; name: string; };
    startDate: string;
    endDate: string | null;
    status: "ACTIVE" | "CANCELLED" | "EXPIRED" | "TRIALING";
    billingCycle: "MONTHLY" | "ANNUALLY";
    amount: number;
    paymentMethod: string | null;
    lastPaymentDate: string | null;
    createdAt: string;
    updatedAt: string;
}

interface PaymentHistoryItem {
    id: string;
    subscriptionId: string;
    amount: number;
    method: string;
    status: string;
    currency: string;
    paidAt: string;
}

interface PlansClientProps {
    companyId: string;
    plans: PlanItem[];
    initialSubscriptions: SubscriptionItem[];
    initialTotalSubscriptionItems: number;
    initialTotalSubscriptionPages: number;
    initialCurrentSubscriptionPage: number;
    subscriptionsPerPage: number;
}
// ...

// =================================================================================================
// STYLED COMPONENTS & HELPERS (New/Improved)
// =================================================================================================

// Centralized style for all inputs and selects
const InputStyle = "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150";

// Centralized style for all primary buttons
const ButtonPrimary = "px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition duration-150 flex items-center justify-center";

// Centralized style for secondary buttons
const ButtonSecondary = "px-4 py-2 font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition duration-150 flex items-center justify-center border border-gray-300 dark:border-gray-600";

// Status Badge Component
const StatusBadge = ({ status }: { status: SubscriptionItem["status"] }) => {
    let baseClass = "inline-flex items-center px-3 py-1 text-xs font-medium rounded-full";
    let colorClass = "";

    switch (status) {
        case "ACTIVE":
            colorClass = "bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-100";
            break;
        case "CANCELLED":
            colorClass = "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100";
            break;
        case "EXPIRED":
            colorClass = "bg-orange-100 text-orange-700 dark:bg-orange-800 dark:text-orange-100";
            break;
        case "TRIALING":
            colorClass = "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-100";
            break;
        default:
            colorClass = "bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300";
    }

    return (
        <span className={`${baseClass} ${colorClass}`}>
            <span className="w-2 h-2 mr-1 rounded-full bg-current" />
            {status}
        </span>
    );
};

// =================================================================================================
// MODAL WRAPPER (Improved with darker backdrop, better sizing)
// =================================================================================================

const Modal = ({ isOpen, onClose, children }: any) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-start pt-16 md:items-center p-4 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-xl w-full relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                    aria-label="Close modal"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>
                {children}
            </motion.div>
        </div>
    );
};

// =================================================================================================
// ADD / EDIT PLAN MODAL (Improved Form Layout and Styling)
// =================================================================================================

const AddEditPlanModal = ({ show, onClose, onSave, plan }: any) => {
    // ... (State initialization is the same)
    const [name, setName] = useState(plan?.name || "");
    const [description, setDescription] = useState(plan?.description || "");
    const [priceMonthly, setPriceMonthly] = useState(plan?.priceMonthly || 0);
    const [priceAnnually, setPriceAnnually] = useState(plan?.priceAnnually || 0);
    const [siteTypePrices, setSiteTypePrices] = useState(plan?.siteTypePrices || {});
    // ... (updateSiteTypePrice function is the same)
    const updateSiteTypePrice = (type: string, field: string, value: number) => {
        setSiteTypePrices((prev: any) => ({
          ...prev,
          [type]: {
            ...prev[type],
            [field]: value,
          },
        }));
      };
    // ... (handleSubmit function is the same)
    const handleSubmit = (e: any) => {
        e.preventDefault();
        const newPlanData = {
          name,
          description,
          priceMonthly,
          priceAnnually,
          price: priceMonthly,
          currency: "KES",
          features: { main: ["Feature 1", "Feature 2"] },
          isPopular: false,
          siteTypePrices,
        };
        onSave(newPlanData);
      };


    return (
        <Modal isOpen={show} onClose={onClose}>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white pt-4">
                {plan ? "Edit Pricing Plan" : "Create New Pricing Plan"}
            </h2>

            <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                    {/* Basic Plan Info */}
                    <div className="space-y-3">
                        <input
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={InputStyle}
                            placeholder="Plan Name (e.g., Premium, Basic)"
                        />
                        <textarea
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={InputStyle}
                            rows={3}
                            placeholder="Short Description of the plan benefits"
                        />
                    </div>

                    {/* Base Pricing */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <h3 className="font-semibold text-lg mb-3 flex items-center text-gray-900 dark:text-white">
                            <CurrencyDollarIcon className="w-5 h-5 mr-2 text-indigo-500" />
                            Base Pricing (KES)
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Price</label>
                                <input
                                    type="number"
                                    value={priceMonthly}
                                    onChange={(e) => setPriceMonthly(+e.target.value)}
                                    className={InputStyle}
                                    placeholder="e.g., 5000"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Annual Price</label>
                                <input
                                    type="number"
                                    value={priceAnnually}
                                    onChange={(e) => setPriceAnnually(+e.target.value)}
                                    className={InputStyle}
                                    placeholder="e.g., 50000"
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>


                    {/* Site Type Pricing */}
                    <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center text-gray-900 dark:text-white">
                            <BuildingOffice2Icon className="w-5 h-5 mr-2 text-indigo-500" />
                            Site Type-Specific Pricing
                        </h3>
                        <div className="space-y-4 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                            {SITE_TYPES.map((type) => (
                                <div key={type} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-indigo-200 dark:border-indigo-700 shadow-sm">
                                    <p className="font-bold mb-3 text-indigo-600 dark:text-indigo-400">{type}</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="number"
                                            placeholder="Monthly KES"
                                            className={InputStyle}
                                            value={siteTypePrices[type]?.monthly || ""}
                                            onChange={(e) => updateSiteTypePrice(type, "monthly", +e.target.value)}
                                            min="0"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Yearly KES"
                                            className={InputStyle}
                                            value={siteTypePrices[type]?.yearly || ""}
                                            onChange={(e) => updateSiteTypePrice(type, "yearly", +e.target.value)}
                                            min="0"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>


                    <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
                        <button type="button" onClick={onClose} className={ButtonSecondary}>
                            Cancel
                        </button>
                        <button type="submit" className={ButtonPrimary}>
                            <CheckIcon className="w-5 h-5 mr-2" />
                            Save Plan
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

// =================================================================================================
// CHANGE SUBSCRIPTION MODAL (Improved clarity)
// =================================================================================================

const ChangeSubscriptionModal = ({ show, onClose, onSave, subscription, plans }: any) => {
    // ... (State initialization is the same)
    const [planId, setPlanId] = useState(subscription?.planId);
    const [status, setStatus] = useState(subscription?.status);
    const [billing, setBilling] = useState(subscription?.billingCycle);

    const handleSubmit = (e: any) => {
      e.preventDefault();
      onSave({ planId, status, billingCycle: billing });
    };

    return (
        <Modal isOpen={show} onClose={onClose}>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white pt-4">
                Manage Subscription
            </h2>

            <form onSubmit={handleSubmit}>
                <div className="space-y-4">

                    {/* User Info Card */}
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900 rounded-lg border border-indigo-200 dark:border-indigo-700 flex items-center">
                        <UsersIcon className="w-8 h-8 mr-3 text-indigo-600 dark:text-indigo-300" />
                        <div>
                            <p className="font-semibold text-lg text-gray-900 dark:text-white">{subscription?.user?.name}</p>
                            <p className="text-sm text-indigo-600 dark:text-indigo-300">{subscription?.user?.email}</p>
                        </div>
                    </div>

                    {/* Plan Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Plan</label>
                        <select
                            className={InputStyle}
                            value={planId}
                            onChange={(e) => setPlanId(e.target.value)}
                        >
                            {plans.map((p: any) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subscription Status</label>
                        <select
                            className={InputStyle}
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="EXPIRED">Expired</option>
                            <option value="TRIALING">Trialing</option>
                        </select>
                    </div>

                    {/* Billing Cycle Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Billing Cycle</label>
                        <select
                            className={InputStyle}
                            value={billing}
                            onChange={(e) => setBilling(e.target.value)}
                        >
                            <option value="MONTHLY">Monthly</option>
                            <option value="ANNUALLY">Annually</option>
                        </select>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
                        <button type="button" className={ButtonSecondary} onClick={onClose}>
                            Cancel
                        </button>
                        <button className={ButtonPrimary} type="submit">
                            <PencilSquareIcon className="w-5 h-5 mr-2" />
                            Update
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

// =================================================================================================
// PAYMENT HISTORY MODAL (Improved display of payments)
// =================================================================================================

const PaymentHistoryModal = ({ show, onClose, payments, subscription }: any) => {
    if (!show) return null;

    return (
        <Modal isOpen={show} onClose={onClose}>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white pt-4">
                Payment History
            </h2>

            <div className="flex justify-between items-start mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{subscription?.user?.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{subscription?.user?.email}</p>
                </div>
                <div className="text-right">
                    <p className="font-medium text-sm text-gray-600 dark:text-gray-300">Plan:</p>
                    <p className="font-bold text-indigo-600 dark:text-indigo-400">{subscription?.plan?.name}</p>
                </div>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {payments.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-6">
                        <ClipboardDocumentListIcon className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                        No payments found for this subscription.
                    </p>
                )}

                {payments.map((p: PaymentHistoryItem) => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.15, delay: 0.05 }}
                        className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex justify-between items-center hover:shadow-md transition duration-150 bg-white dark:bg-gray-800"
                    >
                        <div className="flex items-center">
                            <CreditCardIcon className="w-6 h-6 mr-3 text-indigo-500" />
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {p.currency} {p.amount}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Method: {p.method || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    p.status === "SUCCESS"
                                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
                                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                }`}
                            >
                                {p.status}
                            </span>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                                {format(new Date(p.paidAt), "MMM d, yyyy")}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t dark:border-gray-700">
                <button onClick={onClose} className={ButtonSecondary}>
                    Close
                </button>
            </div>
        </Modal>
    );
};

// =================================================================================================
// PLAN CARD COMPONENT (New and improved)
// =================================================================================================

const PlanCard = ({ p, setEditPlan, setShowPlanModal, deletePlan }: { p: PlanItem, setEditPlan: any, setShowPlanModal: any, deletePlan: () => void }) => {
    return (
        <div key={p.id} className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition duration-300 flex flex-col justify-between bg-white dark:bg-gray-800">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{p.name}</h3>
                    {p.isPopular && (
                        <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-yellow-400 text-yellow-900 rounded-full shadow-md">
                            Popular
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 min-h-[40px]">{p.description}</p>

                <div className="mb-6">
                    <p className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                        <CurrencyDollarIcon className="w-5 h-5 mr-1 text-gray-400" />
                        KES {p.priceMonthly} <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">/ month</span>
                    </p>
                    <p className="text-md font-medium text-gray-600 dark:text-gray-300 mt-1">
                        KES {p.priceAnnually} / year
                    </p>
                </div>
            </div>

            <div className="flex space-x-3 border-t pt-4 border-gray-100 dark:border-gray-700">
                <button
                    className={`${ButtonSecondary} w-full`}
                    onClick={() => {
                        setEditPlan(p);
                        setShowPlanModal(true);
                    }}
                >
                    <PencilSquareIcon className="w-5 h-5 mr-1" />
                    Edit
                </button>
                <button
                    className="px-4 py-2 font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md transition duration-150 flex items-center justify-center w-full"
                    onClick={() => {
                        setEditPlan(p);
                        if (window.confirm(`Are you sure you want to delete plan "${p.name}"?`)) {
                            deletePlan();
                        }
                    }}
                >
                    <TrashIcon className="w-5 h-5 mr-1" />
                    Delete
                </button>
            </div>
        </div>
    );
};

// =================================================================================================
// SUBSCRIPTION ROW COMPONENT (New and improved for table/list view)
// =================================================================================================

const SubscriptionRow = ({ s, openPaymentHistory, setSelectedSub, setShowSubModal }: { s: SubscriptionItem, openPaymentHistory: any, setSelectedSub: any, setShowSubModal: any }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            key={s.id}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl flex justify-between items-center hover:shadow-lg transition duration-300 bg-white dark:bg-gray-800"
        >
            <div className="flex items-center min-w-0">
                {/* User Avatar Placeholder */}
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-4 flex-shrink-0">
                    <UsersIcon className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{s.user.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{s.user.email}</p>
                </div>
            </div>

            <div className="flex-1 min-w-0 mx-4 hidden sm:block">
                <p className="font-medium text-gray-700 dark:text-gray-300 truncate">{s.plan.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{s.billingCycle}</p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
                <StatusBadge status={s.status} />

                <button
                    className={ButtonSecondary}
                    onClick={() => {
                        setSelectedSub(s);
                        setShowSubModal(true);
                    }}
                    title="Manage Subscription"
                >
                    <PencilSquareIcon className="w-5 h-5" />
                </button>

                <button
                    className={ButtonSecondary}
                    onClick={() => openPaymentHistory(s)}
                    title="View Payment History"
                >
                    <CreditCardIcon className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );
}

// =================================================================================================
// MAIN COMPONENT (Refactored to use new components)
// =================================================================================================

export function PlansClient({
    companyId,
    plans: initialPlans,
    initialSubscriptions,
    initialTotalSubscriptionPages,
    initialCurrentSubscriptionPage,
    subscriptionsPerPage,
}: PlansClientProps) {
    // ... (State and useEffect hooks are the same)
    const [plans, setPlans] = useState(initialPlans);
    const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
    const [totalSubscriptionPages, setTotalPages] = useState(initialTotalSubscriptionPages);
    const [currentPage, setCurrentPage] = useState(initialCurrentSubscriptionPage);

    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState("");
    const [filterPlanId, setFilterPlanId] = useState("");

    const [activeTab, setActiveTab] = useState("plans");

    // MODALS
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [editPlan, setEditPlan] = useState<PlanItem | null>(null);

    const [showSubModal, setShowSubModal] = useState(false);
    const [selectedSub, setSelectedSub] = useState<SubscriptionItem | null>(null);

    const [showPaymentsModal, setShowPaymentsModal] = useState(false);
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);

    // ... (All fetch/CRUD functions are the same, just using the new helpers in the render)
    const fetchSubscriptions = useCallback( // ...
        async (page: number = currentPage) => {
            try {
              setLoading(true);
      
              const params = new URLSearchParams({
                companyId,
                page: String(page),
                perPage: String(subscriptionsPerPage),
              });
      
              if (filterStatus) params.append("status", filterStatus);
              if (filterPlanId) params.append("planId", filterPlanId);
      
              const res = await fetch(`${apiBaseUrl}/admin/subscriptions-companies?${params.toString()}`, {
                cache: "no-store",
              });
      
              const data = await res.json();
              
            //   console.log("Fetched subscriptions data:", data.data);
              setSubscriptions(data.data.subscriptions);
              setCurrentPage(data.data.page);
              setTotalPages(data.data.totalPages);
            } catch (error) {
              toast.error("Failed to fetch subscriptions.");
            } finally {
              setLoading(false);
            }
          },
          [companyId, subscriptionsPerPage, filterStatus, filterPlanId, currentPage]
    );

    useEffect(() => {
        if (activeTab === "subscriptions") fetchSubscriptions(1);
    }, [activeTab, filterStatus, filterPlanId, fetchSubscriptions]);

    const savePlan = async (plan: any) => { /* ... */
        try {
            setLoading(true);
      
            if (editPlan) {
              const res = await fetch(`${apiBaseUrl}/plans/${editPlan.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...plan, companyId }),
              });
      
              if (!res.ok) throw new Error();
      
              // Update the specific plan in the state
              setPlans(plans.map(p => p.id === editPlan.id ? {...p, ...plan} : p));

              toast.success("Plan updated!");
            } else {
              const res = await fetch(`${apiBaseUrl}/plans`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...plan, companyId }),
              });
      
              const created = await res.json();
              setPlans([...plans, created]);
              toast.success("Plan created!");
            }
          } catch {
            toast.error("Failed to save plan.");
          } finally {
            setLoading(false);
            setShowPlanModal(false);
            setEditPlan(null);
          }
    };

    const deletePlan = async () => { /* ... */
        if (!editPlan) return;
    
        try {
          setLoading(true);
          await fetch(`${apiBaseUrl}/plans/${editPlan.id}`, { method: "DELETE" });
    
          setPlans(plans.filter((p) => p.id !== editPlan.id));
          toast.success("Plan deleted!");
        } catch {
          toast.error("Failed to delete plan.");
        } finally {
          setEditPlan(null);
          setLoading(false);
        }
    };

    const updateSubscription = async (data: any) => { /* ... */
        if (!selectedSub) return;
    
        try {
          setLoading(true);
          await fetch(`${apiBaseUrl}/admin/subscriptions-companies/${selectedSub.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
    
          toast.success("Subscription updated!");
          fetchSubscriptions(currentPage); // Refresh current page
        } catch {
          toast.error("Failed to update subscription.");
        } finally {
          setShowSubModal(false);
          setSelectedSub(null);
          setLoading(false);
        }
    };

    const openPaymentHistory = async (subscription: SubscriptionItem) => { /* ... */
        setSelectedSub(subscription);
        setShowPaymentsModal(true);
        setPaymentHistory([]);
    
        try {
          const params = new URLSearchParams({ subscriptionId: subscription.id });
          const res = await fetch(`${apiBaseUrl}/admin/payments-companies?${params}`);
    
          const data = await res.json();
          setPaymentHistory(data.items || []);
        } catch {
          toast.error("Failed to load payments.");
        }
    };

    // ... (statusClass is now replaced by StatusBadge component)

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 md:p-8">
            <Toaster />
            
            <h1 className="text-3xl font-extrabold mb-8 text-indigo-700 dark:text-indigo-400">Company Billing Management</h1>

            {/* TABS (Improved visual feedback) */}
            <div className="flex space-x-8 border-b border-gray-200 dark:border-gray-700 mb-8">
                <button
                    className={`pb-3 text-lg font-medium transition duration-200 ${
                        activeTab === "plans" 
                            ? "border-b-4 border-indigo-600 text-indigo-600 dark:text-indigo-400" 
                            : "text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                    }`}
                    onClick={() => setActiveTab("plans")}
                >
                    <ClipboardDocumentListIcon className="w-6 h-6 inline-block mr-2" />
                    Pricing Plans
                </button>

                <button
                    className={`pb-3 text-lg font-medium transition duration-200 ${
                        activeTab === "subscriptions" 
                            ? "border-b-4 border-indigo-600 text-indigo-600 dark:text-indigo-400" 
                            : "text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                    }`}
                    onClick={() => setActiveTab("subscriptions")}
                >
                    <UsersIcon className="w-6 h-6 inline-block mr-2" />
                    Active Subscriptions
                </button>
            </div>

            {loading && (
                <div className="flex justify-center items-center py-8">
                    <ArrowPathIcon className="w-8 h-8 animate-spin text-indigo-500" />
                    <span className="ml-3 text-lg">Loading data...</span>
                </div>
            )}

            {/* ========================= PLANS TAB ========================= */}
            {!loading && activeTab === "plans" && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold">Current Plans ({plans.length})</h2>
                        <button
                            className={ButtonPrimary}
                            onClick={() => {
                                setEditPlan(null);
                                setShowPlanModal(true);
                            }}
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Create New Plan
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                        <AnimatePresence>
                            {plans.map((p) => (
                                <PlanCard 
                                    key={p.id} 
                                    p={p} 
                                    setEditPlan={setEditPlan} 
                                    setShowPlanModal={setShowPlanModal} 
                                    deletePlan={deletePlan} 
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* ========================= SUBSCRIPTIONS TAB ========================= */}
            {!loading && activeTab === "subscriptions" && (
                <div>
                    {/* Filters & Refresh */}
                    <div className="flex gap-4 mb-8 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                        <select
                            className={InputStyle + " flex-1"}
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setCurrentPage(1); // Reset page on filter change
                            }}
                        >
                            <option value="">All Statuses</option>
                            <option value="ACTIVE">Active</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="EXPIRED">Expired</option>
                            <option value="TRIALING">Trialing</option>
                        </select>

                        <select
                            className={InputStyle + " flex-1"}
                            value={filterPlanId}
                            onChange={(e) => {
                                setFilterPlanId(e.target.value);
                                setCurrentPage(1); // Reset page on filter change
                            }}
                        >
                            <option value="">All Plans</option>
                            {plans.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>

                        <button
                            className={ButtonSecondary + " flex-shrink-0 w-12 h-12"}
                            onClick={() => fetchSubscriptions(currentPage)}
                            title="Refresh Subscriptions"
                        >
                            <ArrowPathIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Subscription List */}
                    <div className="space-y-4">
                        {subscriptions && subscriptions.length > 0 ? (
                            subscriptions.map((s) => (
                                <SubscriptionRow 
                                    key={s.id} 
                                    s={s} 
                                    openPaymentHistory={openPaymentHistory} 
                                    setSelectedSub={setSelectedSub} 
                                    setShowSubModal={setShowSubModal} 
                                />
                            ))
                        ) : (
                            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                <UsersIcon className="w-12 h-12 mx-auto mb-4 text-indigo-500" />
                                <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">No Subscriptions Found</p>
                                <p className="text-gray-500 dark:text-gray-400">Adjust your filters or add a new subscription.</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalSubscriptionPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-8">
                            <button
                                disabled={currentPage <= 1}
                                className={ButtonSecondary}
                                onClick={() => fetchSubscriptions(currentPage - 1)}
                            >
                                <ChevronLeftIcon className="w-5 h-5" />
                                <span className="ml-1 hidden sm:inline">Previous</span>
                            </button>

                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Page {currentPage} of {totalSubscriptionPages}
                            </span>

                            <button
                                disabled={currentPage >= totalSubscriptionPages}
                                className={ButtonSecondary}
                                onClick={() => fetchSubscriptions(currentPage + 1)}
                            >
                                <span className="mr-1 hidden sm:inline">Next</span>
                                <ChevronRightIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ========================= MODALS ========================= */}
            <AnimatePresence>
                {showPlanModal && (
                    <AddEditPlanModal
                        show={showPlanModal}
                        plan={editPlan}
                        onClose={() => setShowPlanModal(false)}
                        onSave={savePlan}
                    />
                )}
                {showSubModal && (
                    <ChangeSubscriptionModal
                        show={showSubModal}
                        subscription={selectedSub}
                        plans={plans}
                        onClose={() => setShowSubModal(false)}
                        onSave={updateSubscription}
                    />
                )}
                {showPaymentsModal && (
                    <PaymentHistoryModal
                        show={showPaymentsModal}
                        onClose={() => setShowPaymentsModal(false)}
                        payments={paymentHistory}
                        subscription={selectedSub}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// Note: To implement the custom-scrollbar class, you would typically add this to your global CSS:
/*
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #cbd5e1; // gray-300
    border-radius: 3px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #4b5563; // gray-600
}
*/