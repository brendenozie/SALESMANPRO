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
} from "@heroicons/react/24/outline";
import { format } from 'date-fns';
import { toast, Toaster } from "react-hot-toast";

const apiBaserUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// =================================================================================================
// TYPE DEFINITIONS
// This section defines the data structures used throughout the application.
// =================================================================================================

interface PlanItem {
  id: string;
  companyId: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnually: number;
  features: string[];
  isPopular: boolean;
  status: "ACTIVE" | "ARCHIVED";
  createdAt: Date;
  updatedAt: Date;
}

interface SubscriptionItem {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  planId: string;
  plan: {
    id: string;
    name: string;
  };
  startDate: Date;
  endDate: Date | null;
  status: "ACTIVE" | "CANCELLED" | "EXPIRED" | "TRIALING";
  billingCycle: "MONTHLY" | "ANNUALLY";
  amount: number;
  paymentMethod: string | null;
  lastPaymentDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
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

// =================================================================================================
// COMPONENTS (Tabs & Modals)
// Simple, reusable UI components for the dashboard.
// =================================================================================================

const TabComponent = ({ tabs, activeTab, onChange }:any) => (
  <div className="flex justify-center border-b border-gray-200 dark:border-gray-700 mb-8">
    {tabs.map((tab:any) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`px-4 py-2 -mb-px font-semibold text-lg transition-colors duration-200 ${
          activeTab === tab.id
            ? "border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

const Modal = ({ isOpen, onClose, children }:any) => {
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-75 backdrop-blur-sm">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-auto"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AddEditPlanModal = ({ show, onClose, onSave, plan }:any) => {
  const [name, setName] = useState(plan?.name || "");
  const [description, setDescription] = useState(plan?.description || "");
  const [priceMonthly, setPriceMonthly] = useState(plan?.priceMonthly || 0);
  const [priceAnnually, setPriceAnnually] = useState(plan?.priceAnnually || 0);

  const handleSubmit = (e:any) => {
    e.preventDefault();
    const newPlanData = { name, description, priceMonthly, priceAnnually };
    onSave(newPlanData);
  };

  return (
    <Modal isOpen={show} onClose={onClose}>
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        {plan ? "Edit Plan" : "Add New Plan"}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Price ($)</label>
            <input type="number" value={priceMonthly} onChange={(e) => setPriceMonthly(Number(e.target.value))} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Annual Price ($)</label>
            <input type="number" value={priceAnnually} onChange={(e) => setPriceAnnually(Number(e.target.value))} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancel</button>
          <button type="submit" className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors">Save Plan</button>
        </div>
      </form>
    </Modal>
  );
};

const ChangeSubscriptionModal = ({ show, onClose, onSave, subscription, plans }:any) => {
  const [selectedPlan, setSelectedPlan] = useState(subscription?.planId || "");
  const [status, setStatus] = useState(subscription?.status || "ACTIVE");
  const [billingCycle, setBillingCycle] = useState(subscription?.billingCycle || "MONTHLY");

  const handleSubmit = (e:any) => {
    e.preventDefault();
    onSave({ planId: selectedPlan, status, billingCycle });
  };

  return (
    <Modal isOpen={show} onClose={onClose}>
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Change Subscription</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">User</label>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{subscription?.user?.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{subscription?.user?.email}</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Plan</label>
          <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
            {plans.map((plan:any) => (
              <option key={plan.id} value={plan.id}>{plan.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
              <option value="ACTIVE">Active</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="EXPIRED">Expired</option>
              <option value="TRIALING">Trialing</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Billing Cycle</label>
            <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
              <option value="MONTHLY">Monthly</option>
              <option value="ANNUALLY">Annually</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancel</button>
          <button type="submit" className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors">Update Subscription</button>
        </div>
      </form>
    </Modal>
  );
};

const ConfirmationModal = ({ show, onClose, onConfirm, title, message }:any) => (
  <Modal isOpen={show} onClose={onClose}>
    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300">{message}</p>
    <div className="flex justify-end space-x-2 mt-6">
      <button onClick={onClose} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancel</button>
      <button onClick={onConfirm} className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">Confirm</button>
    </div>
  </Modal>
);

// =================================================================================================
// MAIN CLIENT COMPONENT
// This is the core of the application, now fully functional with client-side logic.
// =================================================================================================

export function PlansClient({
  companyId,
  plans: initialPlans,
  initialSubscriptions,
  initialTotalSubscriptionItems,
  initialTotalSubscriptionPages,
  initialCurrentSubscriptionPage,
  subscriptionsPerPage,
}: PlansClientProps) {
  // Local state for subscriptions and pagination
  const [plans, setPlans] = useState<PlanItem[]>(initialPlans);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>(initialSubscriptions);
  const [totalSubscriptionItems, setTotalSubscriptionItems] = useState(initialTotalSubscriptionItems);
  const [totalSubscriptionPages, setTotalSubscriptionPages] = useState(initialTotalSubscriptionPages);
  const [currentSubscriptionPage, setCurrentSubscriptionPage] = useState(initialCurrentSubscriptionPage);

  const [activeTab, setActiveTab] = useState("plans");
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPlanId, setFilterPlanId] = useState("");

  const [showAddEditPlanModal, setShowAddEditPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);
  const [showDeletePlanConfirm, setShowDeletePlanConfirm] = useState(false);

  const [showChangeSubscriptionModal, setShowChangeSubscriptionModal] = useState(false);
  const [showCancelSubscriptionConfirm, setShowCancelSubscriptionConfirm] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionItem | null>(null);

  // Function to fetch subscriptions from the API
  const handleRefetchSubscriptions = useCallback(async (pageToFetch: number = currentSubscriptionPage) => {
    setLoading(true);
    try {
      const url = new URL(`${apiBaserUrl}/admin/subscriptions`);
      url.searchParams.append('companyId', companyId);
      url.searchParams.append('page', String(pageToFetch));
      url.searchParams.append('perPage', String(subscriptionsPerPage));
      if (filterStatus) url.searchParams.append('status', filterStatus);
      if (filterPlanId) url.searchParams.append('planId', filterPlanId);

      const res = await fetch(url.toString(), { cache: 'no-store' });

      if (!res.ok) {
        throw new Error("Failed to fetch subscriptions");
      }

      const data = await res.json();
      setSubscriptions(data.subscriptions);
      setTotalSubscriptionItems(data.totalItems);
      setTotalSubscriptionPages(data.totalPages);
      setCurrentSubscriptionPage(pageToFetch);
    } catch (error) {
      console.error("Failed to refetch subscriptions:", error);
      toast.error("Failed to load subscriptions.");
    } finally {
      setLoading(false);
    }
  }, [companyId, subscriptionsPerPage, filterStatus, filterPlanId, currentSubscriptionPage]);

  // Effect to re-fetch subscriptions when filters or page change
  useEffect(() => {
    if (activeTab === "subscriptions") {
      handleRefetchSubscriptions(1); // Reset to page 1 when filters change
    }
  }, [activeTab, filterStatus, filterPlanId, handleRefetchSubscriptions]);

  // Handle plan updates
  const handlePlanSave = async (newPlanData:any) => {
    setLoading(true);
    try {
      if (selectedPlan) {
        // Update existing plan
        const res = await fetch(`${apiBaserUrl}/admin/plan/${selectedPlan.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newPlanData, companyId }),
        });
        if (!res.ok) throw new Error("Failed to update plan");
        toast.success("Plan updated successfully!");
        setPlans(plans.map(p => p.id === selectedPlan.id ? { ...p, ...newPlanData } : p));
      } else {
        // Create new plan
        const res = await fetch(`${apiBaserUrl}/admin/plan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newPlanData, companyId, features: ["Feature 1", "Feature 2"], isPopular: false }),
        });
        if (!res.ok) throw new Error("Failed to create plan");
        const createdPlan = await res.json();
        toast.success("Plan created successfully!");
        setPlans([...plans, createdPlan]);
      }
    } catch (error) {
      console.error("Failed to save plan:", error);
      toast.error("Failed to save plan.");
    } finally {
      setLoading(false);
      setShowAddEditPlanModal(false);
      setSelectedPlan(null);
    }
  };

  // Handle plan deletion
  const handleDeletePlan = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiBaserUrl}/admin/plan/${selectedPlan.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete plan");
      }
      toast.success(`Plan "${selectedPlan.name}" deleted successfully!`);
      setPlans(plans.filter(p => p.id !== selectedPlan.id));
    } catch (error:any) {
      console.error("Failed to delete plan:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
      setShowDeletePlanConfirm(false);
      setSelectedPlan(null);
    }
  };

  // Handle subscription update
  const handleUpdateSubscription = async (updateData: any) => {
    if (!selectedSubscription) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiBaserUrl}/admin/subscriptions/${selectedSubscription.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) throw new Error("Failed to update subscription");

      toast.success("Subscription updated successfully!");
      handleRefetchSubscriptions(); // Re-fetch data to show the updated list
    } catch (error) {
      console.error("Failed to update subscription:", error);
      toast.error("Failed to update subscription.");
    } finally {
      setLoading(false);
      setShowChangeSubscriptionModal(false);
      setSelectedSubscription(null);
    }
  };

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    if (!selectedSubscription) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiBaserUrl}/admin/subscriptions/${selectedSubscription.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      if (!res.ok) throw new Error("Failed to cancel subscription");

      toast.success(`Subscription for ${selectedSubscription.user.name} cancelled!`);
      handleRefetchSubscriptions();
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      toast.error("Failed to cancel subscription.");
    } finally {
      setLoading(false);
      setShowCancelSubscriptionConfirm(false);
      setSelectedSubscription(null);
    }
  };

  const getSubscriptionStatusClasses = (status: SubscriptionItem['status']) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'EXPIRED': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'TRIALING': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getBillingCycleLabel = (cycle: "MONTHLY" | "ANNUALLY") => {
    return cycle === "MONTHLY" ? "Monthly" : "Annually";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6 md:p-10">
      <Toaster />
      <motion.div
        className="mb-10 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-700 dark:text-indigo-400 mb-2">
          Plans & Subscriptions
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Manage your pricing plans and customer subscriptions.
        </p>
      </motion.div>

      <TabComponent
        tabs={[
          { id: "plans", label: "Pricing Plans" },
          { id: "subscriptions", label: "Customer Subscriptions" },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "plans" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mt-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <ClipboardDocumentListIcon className="h-6 w-6 text-indigo-500" /> Defined Plans
            </h2>
            <motion.button
              onClick={() => { setSelectedPlan(null); setShowAddEditPlanModal(true); }}
              className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-200 transform hover:-translate-y-0.5"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <PlusIcon className="h-5 w-5" /> Add New Plan
            </motion.button>
          </div>

          {loading ? (
            <div className="text-center py-10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center gap-2">
              <ArrowPathIcon className="h-6 w-6 animate-spin" /> Loading plans...
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">No pricing plans defined yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {plans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-600 relative group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    {plan.isPopular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">Popular</span>
                    )}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{plan.description}</p>
                    <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-4">
                      ${plan.priceMonthly} <span className="text-lg text-gray-500 dark:text-gray-400">/mo</span>
                      {plan.priceAnnually > 0 && <span className="block text-base text-gray-500 dark:text-gray-400"> (${plan.priceAnnually / 12}/mo billed annually)</span>}
                    </div>
                    <ul className="text-sm text-gray-700 dark:text-gray-200 space-y-2 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center">
                          <CheckCircleIcon className="h-4 w-4 text-emerald-500 mr-2 flex-shrink-0" /> {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-end space-x-2 border-t border-gray-200 dark:border-gray-600 pt-4">
                      <motion.button
                        onClick={() => { setSelectedPlan(plan); setShowAddEditPlanModal(true); }}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => { setSelectedPlan(plan); setShowDeletePlanConfirm(true); }}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === "subscriptions" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <UsersIcon className="h-6 w-6 text-indigo-500" /> Customer Subscriptions
            </h2>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full md:w-auto items-center">
              <select
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100 w-full sm:w-auto"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="EXPIRED">Expired</option>
                <option value="TRIALING">Trialing</option>
              </select>
              <select
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100 w-full sm:w-auto"
                value={filterPlanId}
                onChange={(e) => setFilterPlanId(e.target.value)}
              >
                <option value="">All Plans</option>
                {plans.map(plan => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
              </select>
              <motion.button
                onClick={() => handleRefetchSubscriptions(1)}
                className="bg-indigo-500 text-white p-2 rounded-md hover:bg-indigo-600 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
              >
                <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                Apply Filters
              </motion.button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center gap-2">
              <ArrowPathIcon className="h-6 w-6 animate-spin" /> Loading subscriptions...
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">No subscriptions found with the current filters.</div>
          ) : (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 text-center">
                <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
                  Displaying <span className="font-bold">{subscriptions.length}</span> of{" "}
                  <span className="font-bold">{totalSubscriptionItems}</span> subscriptions.
                </p>
              </div>
              <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Plan
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Billing Cycle
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        End Date
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <AnimatePresence>
                      {subscriptions.map((sub) => (
                        <motion.tr
                          key={sub.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{sub.user.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{sub.user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1">
                            <ClipboardDocumentListIcon className="h-4 w-4 text-indigo-500" /> {sub.plan.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSubscriptionStatusClasses(sub.status)}`}>
                              {sub.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{getBillingCycleLabel(sub.billingCycle)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${sub.amount.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {format(new Date(sub.startDate), 'MMM dd, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {sub.endDate ? format(new Date(sub.endDate), 'MMM dd, yyyy') : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <motion.button
                                onClick={() => { setSelectedSubscription(sub); setShowChangeSubscriptionModal(true); }}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Change Plan"
                              >
                                <PencilSquareIcon className="h-5 w-5" />
                              </motion.button>
                              {sub.status === 'ACTIVE' && (
                                <motion.button
                                  onClick={() => { setSelectedSubscription(sub); setShowCancelSubscriptionConfirm(true); }}
                                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="Cancel Subscription"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </motion.button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {totalSubscriptionPages > 1 && (
                <div className="mt-12 flex justify-center items-center space-x-4">
                  <motion.button
                    onClick={() => setCurrentSubscriptionPage(prev => prev - 1)}
                    disabled={currentSubscriptionPage === 1 || loading}
                    className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronLeftIcon className="h-6 w-6" />
                  </motion.button>
                  <div className="flex space-x-2">
                    {Array.from({ length: totalSubscriptionPages }).map((_, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => setCurrentSubscriptionPage(idx + 1)}
                        disabled={currentSubscriptionPage === idx + 1 || loading}
                        className={`px-4 py-2 rounded-full font-semibold ${
                          currentSubscriptionPage === idx + 1
                            ? "bg-indigo-600 text-white shadow-lg"
                            : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                        } disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {idx + 1}
                      </motion.button>
                    ))}
                  </div>
                  <motion.button
                    onClick={() => setCurrentSubscriptionPage(prev => prev + 1)}
                    disabled={currentSubscriptionPage === totalSubscriptionPages || loading}
                    className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronRightIcon className="h-6 w-6" />
                  </motion.button>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}

      <AddEditPlanModal
        show={showAddEditPlanModal}
        onClose={() => { setShowAddEditPlanModal(false); setSelectedPlan(null); }}
        onSave={handlePlanSave}
        plan={selectedPlan}
      />

      <ChangeSubscriptionModal
        show={showChangeSubscriptionModal}
        onClose={() => { setShowChangeSubscriptionModal(false); setSelectedSubscription(null); }}
        onSave={handleUpdateSubscription}
        subscription={selectedSubscription}
        plans={plans}
      />

      <ConfirmationModal
        show={showDeletePlanConfirm}
        onClose={() => setShowDeletePlanConfirm(false)}
        onConfirm={handleDeletePlan}
        title="Delete Plan"
        message={`Are you sure you want to delete the plan "${selectedPlan?.name}"? This action cannot be undone.`}
      />

      <ConfirmationModal
        show={showCancelSubscriptionConfirm}
        onClose={() => setShowCancelSubscriptionConfirm(false)}
        onConfirm={handleCancelSubscription}
        title="Cancel Subscription"
        message={`Are you sure you want to cancel the subscription for ${selectedSubscription?.user?.name} (${selectedSubscription?.plan?.name})?`}
      />
    </div>
  );
}
