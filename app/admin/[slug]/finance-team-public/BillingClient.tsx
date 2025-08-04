// app/admin/[slug]/billing/BillingClient.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCardIcon,
  ReceiptPercentIcon, // For Invoices
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  WalletIcon, // For payment method
  ArrowDownTrayIcon, // For download
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import ConfirmationModal from "@/components/ConfirmationModal"; // Generic confirmation modal
import TabComponent from "@/components/TabComponent"; // Generic tab component
import { TransactionItem, InvoiceItem } from "./page"; // Import types
import AddRefundModal from "@/components/AddRefundModal"; // Assume this exists

interface BillingClientProps {
  companyId: string;
  transactions: TransactionItem[];
  totalTransactionItems: number;
  totalTransactionPages: number;
  currentTransactionPage: number;
  transactionsPerPage: number;
  refetchTransactions: (page: number, limit: number, status?: string, type?: string) => Promise<{ transactionsData: TransactionItem[]; totalTransactionItems: number; totalTransactionPages: number; }>;

  invoices: InvoiceItem[];
  totalInvoiceItems: number;
  totalInvoicePages: number;
  currentInvoicePage: number;
  invoicesPerPage: number;
  refetchInvoices: (page: number, limit: number, status?: string) => Promise<{ invoicesData: InvoiceItem[]; totalInvoiceItems: number; totalInvoicePages: number; }>;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function BillingClient({
  companyId,
  transactions: initialTransactions,
  totalTransactionItems: initialTotalTransactionItems,
  totalTransactionPages: initialTotalTransactionPages,
  currentTransactionPage: initialCurrentTransactionPage,
  transactionsPerPage: initialTransactionsPerPage,
  refetchTransactions,
  invoices: initialInvoices,
  totalInvoiceItems: initialTotalInvoiceItems,
  totalInvoicePages: initialTotalInvoicePages,
  currentInvoicePage: initialCurrentInvoicePage,
  invoicesPerPage: initialInvoicesPerPage,
  refetchInvoices,
}: BillingClientProps) {
  const [transactions, setTransactions] = useState<TransactionItem[]>(initialTransactions);
  const [totalTransactionItems, setTotalTransactionItems] = useState(initialTotalTransactionItems);
  const [totalTransactionPages, setTotalTransactionPages] = useState(initialTotalTransactionPages);
  const [currentTransactionPage, setCurrentTransactionPage] = useState(initialCurrentTransactionPage);
  const [transactionsPerPage, setTransactionsPerPage] = useState(initialTransactionsPerPage);

  const [invoices, setInvoices] = useState<InvoiceItem[]>(initialInvoices);
  const [totalInvoiceItems, setTotalInvoiceItems] = useState(initialTotalInvoiceItems);
  const [totalInvoicePages, setTotalInvoicePages] = useState(initialTotalInvoicePages);
  const [currentInvoicePage, setCurrentInvoicePage] = useState(initialCurrentInvoicePage);
  const [invoicesPerPage, setInvoicesPerPage] = useState(initialInvoicesPerPage);


  const [activeTab, setActiveTab] = useState("transactions"); // 'transactions', 'invoices', 'settings'

  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [transactionStatusFilter, setTransactionStatusFilter] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("");

  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("");

  const [showAddRefundModal, setShowAddRefundModal] = useState(false);
  const [selectedTransactionForRefund, setSelectedTransactionForRefund] = useState<TransactionItem | null>(null);

  // --- Transaction Refetch ---
  const handleRefetchTransactions = useCallback(async (pageToFetch: number = currentTransactionPage) => {
    setLoadingTransactions(true);
    try {
      const { transactionsData, totalTransactionItems: newTotalItems, totalTransactionPages: newTotalPages } = await refetchTransactions(pageToFetch, transactionsPerPage, transactionStatusFilter, transactionTypeFilter);
      setTransactions(transactionsData);
      setTotalTransactionItems(newTotalItems);
      setTotalTransactionPages(newTotalPages);
      setCurrentTransactionPage(pageToFetch);
    } catch (error) {
      console.error("Failed to refetch transactions:", error);
      toast.error("Failed to load transactions.");
    } finally {
      setLoadingTransactions(false);
    }
  }, [refetchTransactions, transactionsPerPage, transactionStatusFilter, transactionTypeFilter, currentTransactionPage]);

  // --- Invoice Refetch ---
  const handleRefetchInvoices = useCallback(async (pageToFetch: number = currentInvoicePage) => {
    setLoadingInvoices(true);
    try {
      const { invoicesData, totalInvoiceItems: newTotalItems, totalInvoicePages: newTotalPages } = await refetchInvoices(pageToFetch, invoicesPerPage, invoiceStatusFilter);
      setInvoices(invoicesData);
      setTotalInvoiceItems(newTotalItems);
      setTotalInvoicePages(newTotalPages);
      setCurrentInvoicePage(pageToFetch);
    } catch (error) {
      console.error("Failed to refetch invoices:", error);
      toast.error("Failed to load invoices.");
    } finally {
      setLoadingInvoices(false);
    }
  }, [refetchInvoices, invoicesPerPage, invoiceStatusFilter, currentInvoicePage]);

  // Effect to update local state if props change (e.g., initial load or navigation)
  useEffect(() => {
    setTransactions(initialTransactions);
    setTotalTransactionItems(initialTotalTransactionItems);
    setTotalTransactionPages(initialTotalTransactionPages);
    setCurrentTransactionPage(initialCurrentTransactionPage);

    setInvoices(initialInvoices);
    setTotalInvoiceItems(initialTotalInvoiceItems);
    setTotalInvoicePages(initialTotalInvoicePages);
    setCurrentInvoicePage(initialCurrentInvoicePage);
  }, [initialTransactions, initialTotalTransactionItems, initialTotalTransactionPages, initialCurrentTransactionPage,
      initialInvoices, initialTotalInvoiceItems, initialTotalInvoicePages, initialCurrentInvoicePage]);


  // Refetch data when tabs or filters change
  useEffect(() => {
    if (activeTab === 'transactions') {
      handleRefetchTransactions(currentTransactionPage);
    } else if (activeTab === 'invoices') {
      handleRefetchInvoices(currentInvoicePage);
    }
  }, [activeTab, currentTransactionPage, currentInvoicePage, handleRefetchTransactions, handleRefetchInvoices]);


  const handleTransactionPageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalTransactionPages) {
      setCurrentTransactionPage(newPage);
    }
  };

  const handleInvoicePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalInvoicePages) {
      setCurrentInvoicePage(newPage);
    }
  };

  const handleRefundSuccess = () => {
    toast.success("Refund processed successfully!");
    setShowAddRefundModal(false);
    setSelectedTransactionForRefund(null);
    handleRefetchTransactions(currentTransactionPage); // Refresh transactions after refund
  };

  const getTransactionStatusClasses = (status: TransactionItem['status']) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Refunded': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getInvoiceStatusClasses = (status: InvoiceItem['status']) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'Unpaid': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
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
          Billing & Payments
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Manage all financial transactions, invoices, and payment settings.
        </p>
      </motion.div>

      {/* Tabs for Transactions vs Invoices */}
      <TabComponent
        tabs={[
          { id: "transactions", label: "Transactions" },
          { id: "invoices", label: "Invoices" },
          // { id: "settings", label: "Payment Settings" }, // Could add a settings tab
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Transactions Tab Content */}
      {activeTab === "transactions" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <CreditCardIcon className="h-6 w-6 text-indigo-500" /> Transaction History
            </h2>
            <div className="flex space-x-2 w-full md:w-auto">
              <select
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                value={transactionStatusFilter}
                onChange={(e) => setTransactionStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
              <select
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                value={transactionTypeFilter}
                onChange={(e) => setTransactionTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Subscription">Subscription</option>
                <option value="Refund">Refund</option>
                <option value="Add-on Purchase">Add-on Purchase</option>
              </select>
              <button
                onClick={() => handleRefetchTransactions(1)}
                className="ml-2 bg-indigo-500 text-white p-2 rounded-md hover:bg-indigo-600 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>

          {loadingTransactions ? (
            <div className="text-center py-10 text-indigo-500 dark:text-indigo-400">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">No transactions found.</div>
          ) : (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 text-center">
                <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
                  Displaying <span className="font-bold">{transactions.length}</span> of{" "}
                  <span className="font-bold">{totalTransactionItems}</span> transactions.
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
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Method
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <AnimatePresence>
                      {transactions.map((trx) => (
                        <motion.tr
                          key={trx.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{trx.userName}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{trx.userEmail}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {trx.currency} {trx.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{trx.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTransactionStatusClasses(trx.status)}`}>
                              {trx.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <WalletIcon className="h-4 w-4" /> {trx.paymentMethod}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {format(new Date(trx.transactionDate), 'MMM dd, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {trx.type !== 'Refund' && trx.status === 'Completed' && (
                                <motion.button
                                  onClick={() => {setSelectedTransactionForRefund(trx); setShowAddRefundModal(true);}}
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="Issue Refund"
                                >
                                  <ReceiptPercentIcon className="h-5 w-5" />
                                </motion.button>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {totalTransactionPages > 1 && (
                <div className="mt-12 flex justify-center items-center space-x-4">
                  <motion.button
                    onClick={() => handleTransactionPageChange(currentTransactionPage - 1)}
                    disabled={currentTransactionPage === 1 || loadingTransactions}
                    className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronLeftIcon className="h-6 w-6" />
                  </motion.button>
                  <div className="flex space-x-2">
                    {Array.from({ length: totalTransactionPages }).map((_, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => handleTransactionPageChange(idx + 1)}
                        disabled={currentTransactionPage === idx + 1 || loadingTransactions}
                        className={`px-4 py-2 rounded-full font-semibold ${
                          currentTransactionPage === idx + 1
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
                    onClick={() => handleTransactionPageChange(currentTransactionPage + 1)}
                    disabled={currentTransactionPage === totalTransactionPages || loadingTransactions}
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

      {/* Invoices Tab Content */}
      {activeTab === "invoices" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <ReceiptPercentIcon className="h-6 w-6 text-indigo-500" /> Customer Invoices
            </h2>
            <div className="flex space-x-2 w-full md:w-auto">
              <select
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                value={invoiceStatusFilter}
                onChange={(e) => setInvoiceStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Overdue">Overdue</option>
              </select>
              <button
                onClick={() => handleRefetchInvoices(1)}
                className="ml-2 bg-indigo-500 text-white p-2 rounded-md hover:bg-indigo-600 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>

          {loadingInvoices ? (
            <div className="text-center py-10 text-indigo-500 dark:text-indigo-400">Loading invoices...</div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">No invoices found.</div>
          ) : (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 text-center">
                <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
                  Displaying <span className="font-bold">{invoices.length}</span> of{" "}
                  <span className="font-bold">{totalInvoiceItems}</span> invoices.
                </p>
              </div>
              <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Invoice ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Amount Due
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Issue Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <AnimatePresence>
                      {invoices.map((inv) => (
                        <motion.tr
                          key={inv.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                            {inv.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{inv.userName}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{inv.userEmail}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {inv.currency} {inv.amountDue.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getInvoiceStatusClasses(inv.status)}`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {format(new Date(inv.issuedDate), 'MMM dd, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {format(new Date(inv.dueDate), 'MMM dd, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <motion.a
                              href={inv.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-1"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Download Invoice"
                            >
                              <ArrowDownTrayIcon className="h-5 w-5" />
                            </motion.a>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {totalInvoicePages > 1 && (
                <div className="mt-12 flex justify-center items-center space-x-4">
                  <motion.button
                    onClick={() => handleInvoicePageChange(currentInvoicePage - 1)}
                    disabled={currentInvoicePage === 1 || loadingInvoices}
                    className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronLeftIcon className="h-6 w-6" />
                  </motion.button>
                  <div className="flex space-x-2">
                    {Array.from({ length: totalInvoicePages }).map((_, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => handleInvoicePageChange(idx + 1)}
                        disabled={currentInvoicePage === idx + 1 || loadingInvoices}
                        className={`px-4 py-2 rounded-full font-semibold ${
                          currentInvoicePage === idx + 1
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
                    onClick={() => handleInvoicePageChange(currentInvoicePage + 1)}
                    disabled={currentInvoicePage === totalInvoicePages || loadingInvoices}
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
      <AnimatePresence>
        {showAddRefundModal && selectedTransactionForRefund && (
          <AddRefundModal
            show={showAddRefundModal}
            onClose={() => {setShowAddRefundModal(false); setSelectedTransactionForRefund(null);}}
            transaction={selectedTransactionForRefund}
            onSaveSuccess={handleRefundSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Dummy AddRefundModal (create a real one in components/AddRefundModal.tsx)
const AddRefundModal: React.FC<{
  show: boolean;
  onClose: () => void;
  transaction: TransactionItem;
  onSaveSuccess: () => void;
}> = ({ show, onClose, transaction, onSaveSuccess }) => {
  if (!show) return null;

  const [refundAmount, setRefundAmount] = useState(transaction.amount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (refundAmount <= 0 || refundAmount > transaction.amount) {
      toast.error("Invalid refund amount.");
      return;
    }
    toast.success(`Refund of ${transaction.currency} ${refundAmount.toFixed(2)} processed for ${transaction.userName}!`);
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Issue Refund for {transaction.userName}</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">Original Transaction: {transaction.currency} {transaction.amount.toFixed(2)} ({transaction.type}) on {format(new Date(transaction.transactionDate), 'MMM dd, yyyy')}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="refundAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Refund Amount ({transaction.currency})</label>
            <input
              type="number"
              id="refundAmount"
              value={refundAmount}
              onChange={(e) => setRefundAmount(parseFloat(e.target.value))}
              step="0.01"
              min="0.01"
              max={transaction.amount}
              className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
              required
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
              Process Refund
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};