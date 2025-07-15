// app/admin/[slug]/plans/PlansClient.tsx
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
  TagIcon,
  CalendarDaysIcon,
  WalletIcon, // For payment
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
// import ConfirmationModal from "@/components/ConfirmationModal";
// import AddEditPlanModal from "@/components/AddEditPlanModal"; // Assume this exists
// import ChangeSubscriptionModal from "@/components/ChangeSubscriptionModal"; // Assume this exists
import { PlanItem, SubscriptionItem } from "./page"; // Import types
import TabComponent from "@/components/TabComponent"; // Generic tab component

interface PlansClientProps {
  companyId: string;
  plans: PlanItem[];
  subscriptions: SubscriptionItem[];
  totalSubscriptionItems: number;
  totalSubscriptionPages: number;
  currentSubscriptionPage: number;
  subscriptionsPerPage: number;
  refetchSubscriptions: (page: number, limit: number, status?: string, planName?: string) => Promise<{ subscriptionsData: SubscriptionItem[]; totalSubscriptionItems: number; totalSubscriptionPages: number; }>;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function PlansClient({
  companyId,
  plans: initialPlans, // Rename to initialPlans
  subscriptions: initialSubscriptions,
  totalSubscriptionItems: initialTotalSubscriptionItems,
  totalSubscriptionPages: initialTotalSubscriptionPages,
  currentSubscriptionPage: initialCurrentSubscriptionPage,
  subscriptionsPerPage: initialSubscriptionsPerPage,
  refetchSubscriptions,
}: PlansClientProps) {
  const [plans, setPlans] = useState<PlanItem[]>(initialPlans);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>(initialSubscriptions);
  const [totalSubscriptionItems, setTotalSubscriptionItems] = useState(initialTotalSubscriptionItems);
  const [totalSubscriptionPages, setTotalSubscriptionPages] = useState(initialTotalSubscriptionPages);
  const [currentSubscriptionPage, setCurrentSubscriptionPage] = useState(initialCurrentSubscriptionPage);
  const [subscriptionsPerPage, setSubscriptionsPerPage] = useState(initialSubscriptionsPerPage);

  const [activeTab, setActiveTab] = useState("plans"); // 'plans' or 'subscriptions'

  const [showAddEditPlanModal, setShowAddEditPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);
  const [showDeletePlanConfirm, setShowDeletePlanConfirm] = useState(false);

  const [showChangeSubscriptionModal, setShowChangeSubscriptionModal] = useState(false);
  const [showCancelSubscriptionConfirm, setShowCancelSubscriptionConfirm] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionItem | null>(null);

  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPlanName, setFilterPlanName] = useState("");

  const handleRefetchSubscriptions = useCallback(async (pageToFetch: number = currentSubscriptionPage) => {
    setLoading(true);
    try {
      const { subscriptionsData, totalSubscriptionItems: newTotalItems, totalSubscriptionPages: newTotalPages } = await refetchSubscriptions(pageToFetch, subscriptionsPerPage, filterStatus, filterPlanName);
      setSubscriptions(subscriptionsData);
      setTotalSubscriptionItems(newTotalItems);
      setTotalSubscriptionPages(newTotalPages);
      setCurrentSubscriptionPage(pageToFetch);
    } catch (error) {
      console.error("Failed to refetch subscriptions:", error);
      toast.error("Failed to load subscriptions.");
    } finally {
      setLoading(false);
    }
  }, [refetchSubscriptions, subscriptionsPerPage, filterStatus, filterPlanName, currentSubscriptionPage]);

  // Initial fetch/update subscriptions on mount or prop change
  useEffect(() => {
    setSubscriptions(initialSubscriptions);
    setTotalSubscriptionItems(initialTotalSubscriptionItems);
    setTotalSubscriptionPages(initialTotalSubscriptionPages);
    setCurrentSubscriptionPage(initialCurrentSubscriptionPage);
  }, [initialSubscriptions, initialTotalSubscriptionItems, initialTotalSubscriptionPages, initialCurrentSubscriptionPage]);

  useEffect(() => {
    if (activeTab === 'subscriptions') {
      handleRefetchSubscriptions(currentSubscriptionPage);
    }
  }, [activeTab, currentSubscriptionPage, handleRefetchSubscriptions]);


  const handleSubscriptionPageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalSubscriptionPages) {
      setCurrentSubscriptionPage(newPage);
    }
  };

  // --- Plan Actions ---
  const handlePlanSaveSuccess = () => {
    toast.success("Plan saved successfully!");
    setShowAddEditPlanModal(false);
    setSelectedPlan(null);
    // In a real app, you'd refetch plans here
    // For this dummy, we just close the modal
  };

  const handleDeletePlan = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    try {
      // Simulate API call: await fetch(`${apiUrl}/admin/plans/${selectedPlan.id}`, { method: 'DELETE' });
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success(`Plan "${selectedPlan.name}" deleted successfully!`);
      setShowDeletePlanConfirm(false);
      setSelectedPlan(null);
      setPlans(plans.filter(p => p.id !== selectedPlan.id)); // Optimistic UI update
    } catch (error) {
      console.error("Failed to delete plan:", error);
      toast.error("Failed to delete plan.");
    } finally {
      setLoading(false);
    }
  };

  // --- Subscription Actions ---
  const handleSubscriptionChangeSuccess = () => {
    toast.success("Subscription updated successfully!");
    setShowChangeSubscriptionModal(false);
    setSelectedSubscription(null);
    handleRefetchSubscriptions(currentSubscriptionPage);
  };

  const handleCancelSubscription = async () => {
    if (!selectedSubscription) return;
    setLoading(true);
    try {
      // Simulate API call: await fetch(`${apiUrl}/admin/subscriptions/${selectedSubscription.id}/cancel`, { method: 'POST' });
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success(`Subscription for ${selectedSubscription.userName} cancelled!`);
      setShowCancelSubscriptionConfirm(false);
      setSelectedSubscription(null);
      handleRefetchSubscriptions(currentSubscriptionPage);
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      toast.error("Failed to cancel subscription.");
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionStatusClasses = (status: SubscriptionItem['status']) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Expired': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'Trialing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6 md:p-10">
      {/* Page Header */}
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

      {/* Tabs for Plans vs Subscriptions */}
      <TabComponent
        tabs={[
          { id: "plans", label: "Pricing Plans" },
          { id: "subscriptions", label: "Customer Subscriptions" },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Plans Management */}
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

          {plans.length === 0 ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">No pricing plans defined yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {plans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-600 relative group"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
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

      {/* Subscriptions Management */}
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
            <div className="flex space-x-2 w-full md:w-auto">
              <select
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Expired">Expired</option>
                <option value="Trialing">Trialing</option>
              </select>
              <select
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                value={filterPlanName}
                onChange={(e) => setFilterPlanName(e.target.value)}
              >
                <option value="">All Plans</option>
                {plans.map(plan => <option key={plan.id} value={plan.name}>{plan.name}</option>)}
              </select>
              <button
                onClick={() => handleRefetchSubscriptions(1)}
                className="ml-2 bg-indigo-500 text-white p-2 rounded-md hover:bg-indigo-600 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10 text-indigo-500 dark:text-indigo-400">Loading subscriptions...</div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">No subscriptions found.</div>
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
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{sub.userName}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{sub.userEmail}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1">
                            <ClipboardDocumentListIcon className="h-4 w-4 text-indigo-500" /> {sub.planName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSubscriptionStatusClasses(sub.status)}`}>
                              {sub.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{sub.billingCycle}</td>
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
                              {sub.status === 'Active' && (
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

              {/* Pagination */}
              {totalSubscriptionPages > 1 && (
                <div className="mt-12 flex justify-center items-center space-x-4">
                  <motion.button
                    onClick={() => handleSubscriptionPageChange(currentSubscriptionPage - 1)}
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
                        onClick={() => handleSubscriptionPageChange(idx + 1)}
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
                    onClick={() => handleSubscriptionPageChange(currentSubscriptionPage + 1)}
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

      {/* Modals */}
      {/* <AnimatePresence>
        {showAddEditPlanModal && (
          <AddEditPlanModal
            show={showAddEditPlanModal}
            onClose={() => {setShowAddEditPlanModal(false); setSelectedPlan(null);}}
            initialData={selectedPlan}
            companyId={companyId}
            onSaveSuccess={handlePlanSaveSuccess}
          />
        )}
      </AnimatePresence> */}

      {/* <AnimatePresence>
        {showDeletePlanConfirm && selectedPlan && (
          <ConfirmationModal
            show={showDeletePlanConfirm}
            onClose={() => {setShowDeletePlanConfirm(false); setSelectedPlan(null);}}
            onConfirm={handleDeletePlan}
            title="Confirm Plan Deletion"
            message={`Are you sure you want to delete the "${selectedPlan.name}" plan? This will affect existing subscriptions!`}
            confirmButtonText="Delete Plan"
            confirmButtonColor="bg-red-600 hover:bg-red-700"
          />
        )}
      </AnimatePresence> */}

      {/* <AnimatePresence>
        {showChangeSubscriptionModal && selectedSubscription && (
          <ChangeSubscriptionModal
            show={showChangeSubscriptionModal}
            onClose={() => {setShowChangeSubscriptionModal(false); setSelectedSubscription(null);}}
            subscription={selectedSubscription}
            allPlans={plans}
            onSaveSuccess={handleSubscriptionChangeSuccess}
          />
        )}
      </AnimatePresence> */}

      {/* <AnimatePresence>
        {showCancelSubscriptionConfirm && selectedSubscription && (
          <ConfirmationModal
            show={showCancelSubscriptionConfirm}
            onClose={() => {setShowCancelSubscriptionConfirm(false); setSelectedSubscription(null);}}
            onConfirm={handleCancelSubscription}
            title="Confirm Subscription Cancellation"
            message={`Are you sure you want to cancel the subscription for "${selectedSubscription.userName}" (Plan: ${selectedSubscription.planName})?`}
            confirmButtonText="Cancel Subscription"
            confirmButtonColor="bg-red-600 hover:bg-red-700"
          />
        )}
      </AnimatePresence> */}
    </div>
  );
}

// Ensure these icons are imported in this file as well
import {
  LifebuoyIcon
} from "@heroicons/react/24/outline";
import { format } from "date-fns";


// Dummy TabComponent (create a real one in components/TabComponent.tsx)
const TabComponent: React.FC<{
    tabs: { id: string; label: string }[];
    activeTab: string;
    onChange: (tabId: string) => void;
  }> = ({ tabs, activeTab, onChange }) => (
    <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-6 py-3 text-lg font-medium transition-colors duration-200
            ${activeTab === tab.id
              ? "border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

// Dummy AddEditPlanModal (create a real one in components/AddEditPlanModal.tsx)
const AddEditPlanModal: React.FC<{
  show: boolean;
  onClose: () => void;
  initialData: PlanItem | null;
  companyId: string;
  onSaveSuccess: () => void;
}> = ({ show, onClose, initialData, companyId, onSaveSuccess }) => {
  if (!show) return null;
  const isEditing = !!initialData;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`${isEditing ? 'Updated' : 'Added'} plan!`);
    onSaveSuccess();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[200]">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-lg m-4"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">{isEditing ? 'Edit Plan' : 'Add New Plan'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Plan Name</label>
            <input type="text" id="name" defaultValue={initialData?.name || ''} className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100" required />
          </div>
          <div>
            <label htmlFor="priceMonthly" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price (Monthly)</label>
            <input type="number" id="priceMonthly" defaultValue={initialData?.priceMonthly || 0} className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100" required />
          </div>
          <div>
            <label htmlFor="priceAnnually" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price (Annually)</label>
            <input type="number" id="priceAnnually" defaultValue={initialData?.priceAnnually || 0} className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100" />
          </div>
          <div>
            <label htmlFor="features" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Features (comma separated)</label>
            <textarea id="features" defaultValue={initialData?.features.join(', ') || ''} className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"></textarea>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="isPopular" defaultChecked={initialData?.isPopular || false} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
            <label htmlFor="isPopular" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">Mark as Popular</label>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
            >
              {isEditing ? 'Save Changes' : 'Add Plan'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};


// Dummy ChangeSubscriptionModal (create a real one in components/ChangeSubscriptionModal.tsx)
const ChangeSubscriptionModal: React.FC<{
  show: boolean;
  onClose: () => void;
  subscription: SubscriptionItem;
  allPlans: PlanItem[];
  onSaveSuccess: () => void;
}> = ({ show, onClose, subscription, allPlans, onSaveSuccess }) => {
  if (!show) return null;

  const [selectedPlanId, setSelectedPlanId] = useState(subscription.planId);
  const [newEndDate, setNewEndDate] = useState(subscription.endDate ? format(new Date(subscription.endDate), 'yyyy-MM-dd') : '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Subscription for ${subscription.userName} updated!`);
    onSaveSuccess();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[200]">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-lg m-4"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Change Subscription for {subscription.userName}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Plan</label>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{subscription.planName}</p>
          </div>
          <div>
            <label htmlFor="newPlan" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select New Plan</label>
            <select
              id="newPlan"
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
            >
              {allPlans.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} (${plan.priceMonthly}/mo)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">New End Date (Optional)</label>
            <input
              type="date"
              id="endDate"
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
            >
              Update Subscription
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};