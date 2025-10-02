"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCardIcon, PlusCircleIcon, MagnifyingGlassIcon, EyeIcon, CheckCircleIcon,
  XMarkIcon, UserIcon, PencilIcon, TrashIcon, CurrencyDollarIcon
} from '@heroicons/react/24/solid';

// Define the Invoice interface based on the expected data from the backend
interface Invoice {
  id: string;
  patientId: string; // From PatientInvoices model
  patientName: string; // Derived from patient relation
  amount: number;
  date: string; // invoiceDate formatted as YYYY-MM-DD
  dueDate?: string; // dueDate formatted as YYYY-MM-DD
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELED'; // Matches Prisma enum
  items: string[]; // Array of strings for invoice line items
  notes?: string;
  createdAt: string; // Formatted date string
}

// Interface for Patient options in dropdowns (from /api/admin/patients)
interface PatientOption {
  id: string; // Consumer ID
  name: string;
  userId: string; // Corresponding User ID
}

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

// Custom Modal Component (re-used from previous pages)
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={modalVariants}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-lg relative"
        variants={modalVariants}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{title}</h2>
        {children}
      </motion.div>
    </motion.div>
  );
};

export default function AdminBillingPage({ params }: { params: { slug: string } }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]); // For dropdowns
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | Invoice['status']>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Mock companyId for demonstration. In a real app, this would come from auth/session.
  // IMPORTANT: Replace with a valid ObjectId from your database for testing.
  const companyId = params.slug || "654321098765432109876543";

  const [newInvoiceData, setNewInvoiceData] = useState({
    patientId: '',
    amount: 0,
    invoiceDate: new Date().toISOString().split('T')[0], // Default to today
    dueDate: '',
    items: '', // Comma-separated string for input, will be converted to array
    notes: '',
    status: 'PENDING' as Invoice['status'],
  });

  const [editInvoiceData, setEditInvoiceData] = useState<Partial<Invoice>>({});
  const [editItemsString, setEditItemsString] = useState(''); // For editing items in modal

  // Fetch invoices from the backend API
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const statusParam = filterStatus === 'All' ? '' : `&filterStatus=${filterStatus}`;
      const response = await fetch(`/api/admin/billing?companyId=${companyId}&searchTerm=${encodeURIComponent(searchTerm)}${statusParam}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch invoices');
      }
      const data: Invoice[] = await response.json();
      setInvoices(data);
    } catch (e: any) {
      console.error("Error fetching invoices:", e);
      setError(e.message || "Failed to load invoice data.");
    } finally {
      setLoading(false);
    }
  }, [companyId, searchTerm, filterStatus]);

  // Fetch list of patients (consumers) for dropdown
  const fetchPatientsList = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/patients?companyId=${companyId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch patients list');
      }
      const data: PatientOption[] = await response.json();
      setPatients(data.map(p => ({ id: p.id, name: p.name, userId: p.userId }))); // Map to PatientOption
    } catch (e: any) {
      console.error("Error fetching patients list:", e);
      // Don't set global error, just log for dropdowns
    }
  }, [companyId]);

  // Initial data fetch on component mount and when search/filter changes
  useEffect(() => {
    fetchInvoices();
    fetchPatientsList();
  }, [fetchInvoices, fetchPatientsList]);

  // Handlers for modal interactions
  const handleAddInvoiceClick = () => {
    setNewInvoiceData({
      patientId: '', amount: 0, invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: '', items: '', notes: '', status: 'PENDING',
    });
    setIsAddModalOpen(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    // Format dates for input type="date"
    const formattedInvoiceDate = invoice.date || '';
    const formattedDueDate = invoice.dueDate || '';
    setEditInvoiceData({
      ...invoice,
      date: formattedInvoiceDate,
      dueDate: formattedDueDate,
    });
    setEditItemsString(invoice.items.join(', ')); // Convert array to comma-separated string for editing
    setIsEditModalOpen(true);
  };

  const handleDelete = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDeleteConfirmOpen(true);
  };

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewModalOpen(true);
  };

  // CRUD operations via API
  const addNewInvoice = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...newInvoiceData,
        amount: parseFloat(newInvoiceData.amount.toString()), // Ensure float
        items: newInvoiceData.items.split(',').map(item => item.trim()).filter(item => item), // Convert string to array
        companyId,
      };

      const response = await fetch('/api/admin/billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate invoice');
      }

      setIsAddModalOpen(false);
      fetchInvoices(); // Refresh list
    } catch (e: any) {
      console.error("Error adding invoice:", e);
      setError(e.message || "Failed to generate new invoice.");
    } finally {
      setLoading(false);
    }
  };

  const updateInvoice = async () => {
    if (!selectedInvoice) {
      setError("No invoice selected for update.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...editInvoiceData,
        amount: editInvoiceData.amount ? parseFloat(editInvoiceData.amount.toString()) : undefined,
        items: editItemsString.split(',').map(item => item.trim()).filter(item => item), // Convert string to array
      };

      const response = await fetch(`/api/admin/billing/${selectedInvoice.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update invoice');
      }

      setIsEditModalOpen(false);
      fetchInvoices(); // Refresh list
    } catch (e: any) {
      console.error("Error updating invoice:", e);
      setError(e.message || "Failed to update invoice.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteInvoice = async () => {
    if (!selectedInvoice) {
      setError("No invoice selected for deletion.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/billing/${selectedInvoice.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete invoice');
      }

      setIsDeleteConfirmOpen(false);
      fetchInvoices(); // Refresh list
    } catch (e: any) {
      console.error("Error deleting invoice:", e);
      setError(e.message || "Failed to delete invoice.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'PAID': return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900';
      case 'PENDING': return 'text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900';
      case 'OVERDUE': return 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900';
      case 'CANCELED': return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8 font-inter">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 drop-shadow-lg"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          Billing & Invoices
        </motion.h1>
        <motion.p
          className="text-xl text-gray-700 dark:text-gray-300 mb-12"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.2 }}
        >
          Manage all financial transactions and invoices.
        </motion.p>

        <motion.div
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative flex-grow w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search invoices..."
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
            <select
              className="px-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'All' | Invoice['status'])}
            >
              <option value="All">All Statuses</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="OVERDUE">Overdue</option>
              <option value="CANCELED">Canceled</option>
            </select>
            <button
              onClick={handleAddInvoiceClick}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full font-bold shadow-md hover:from-violet-600 hover:to-purple-700 transition-all duration-300"
            >
              <PlusCircleIcon className="w-5 h-5 mr-2" /> Generate New Invoice
            </button>
          </div>

          {loading && (
            <div className="text-center py-8 text-blue-600 dark:text-blue-400">Loading invoices...</div>
          )}
          {error && (
            <div className="text-center py-8 text-red-600 dark:text-red-400">{error}</div>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 rounded-xl overflow-hidden">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tl-xl">Invoice ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Patient</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Due Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th scope="col" className="relative px-6 py-3 rounded-tr-xl">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">
                        No invoices found.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{invoice.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <UserIcon className="w-5 h-5 text-gray-500 mr-2" />
                            <div className="text-sm text-gray-900 dark:text-white">{invoice.patientName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          <CurrencyDollarIcon className="inline-block w-4 h-4 mr-1 text-green-600 dark:text-green-400" />
                          {invoice.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {invoice.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {invoice.dueDate || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleView(invoice)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                              aria-label={`View invoice ${invoice.id}`}
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleEdit(invoice)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
                              aria-label={`Edit invoice ${invoice.id}`}
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(invoice)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 p-2 rounded-full hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"
                              aria-label={`Delete invoice ${invoice.id}`}
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Add Invoice Modal */}
      <AnimatePresence>
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Generate New Invoice">
          <form onSubmit={(e) => { e.preventDefault(); addNewInvoice(); }} className="space-y-4">
            <div>
              <label htmlFor="newPatient" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Patient</label>
              <select
                id="newPatient"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newInvoiceData.patientId}
                onChange={(e) => setNewInvoiceData({ ...newInvoiceData, patientId: e.target.value })}
                required
              >
                <option value="">Select Patient</option>
                {patients.map(p => (
                  <option key={p.id} value={p.userId}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="newAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount ($)</label>
              <input
                type="number"
                id="newAmount"
                step="0.01"
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newInvoiceData.amount}
                onChange={(e) => setNewInvoiceData({ ...newInvoiceData, amount: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <label htmlFor="newInvoiceDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Invoice Date</label>
              <input
                type="date"
                id="newInvoiceDate"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newInvoiceData.invoiceDate}
                onChange={(e) => setNewInvoiceData({ ...newInvoiceData, invoiceDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="newDueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Date (Optional)</label>
              <input
                type="date"
                id="newDueDate"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newInvoiceData.dueDate}
                onChange={(e) => setNewInvoiceData({ ...newInvoiceData, dueDate: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="newItems" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Items (comma-separated)</label>
              <textarea
                id="newItems"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newInvoiceData.items}
                onChange={(e) => setNewInvoiceData({ ...newInvoiceData, items: e.target.value })}
                placeholder="e.g., General Check-up, Lab Tests, Medication"
                required
              ></textarea>
            </div>
            <div>
              <label htmlFor="newNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes (Optional)</label>
              <textarea
                id="newNotes"
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newInvoiceData.notes}
                onChange={(e) => setNewInvoiceData({ ...newInvoiceData, notes: e.target.value })}
              ></textarea>
            </div>
            <div>
              <label htmlFor="newStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                id="newStatus"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newInvoiceData.status}
                onChange={(e) => setNewInvoiceData({ ...newInvoiceData, status: e.target.value as Invoice['status'] })}
                required
              >
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
                <option value="CANCELED">Canceled</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              >
                Generate Invoice
              </button>
            </div>
          </form>
        </Modal>
      </AnimatePresence>

      {/* Edit Invoice Modal */}
      <AnimatePresence>
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Invoice: ${selectedInvoice?.id || ''}`}>
          <form onSubmit={(e) => { e.preventDefault(); updateInvoice(); }} className="space-y-4">
            <div>
              <label htmlFor="editPatient" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Patient</label>
              <select
                id="editPatient"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editInvoiceData.patientId || ''}
                onChange={(e) => setEditInvoiceData({ ...editInvoiceData, patientId: e.target.value })}
                required
              >
                <option value="">Select Patient</option>
                {patients.map(p => (
                  <option key={p.id} value={p.userId}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="editAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount ($)</label>
              <input
                type="number"
                id="editAmount"
                step="0.01"
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editInvoiceData.amount || 0}
                onChange={(e) => setEditInvoiceData({ ...editInvoiceData, amount: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <label htmlFor="editInvoiceDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Invoice Date</label>
              <input
                type="date"
                id="editInvoiceDate"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editInvoiceData.date || ''}
                onChange={(e) => setEditInvoiceData({ ...editInvoiceData, date: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="editDueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Date (Optional)</label>
              <input
                type="date"
                id="editDueDate"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editInvoiceData.dueDate || ''}
                onChange={(e) => setEditInvoiceData({ ...editInvoiceData, dueDate: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="editItems" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Items (comma-separated)</label>
              <textarea
                id="editItems"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editItemsString}
                onChange={(e) => setEditItemsString(e.target.value)}
                placeholder="e.g., General Check-up, Lab Tests, Medication"
                required
              ></textarea>
            </div>
            <div>
              <label htmlFor="editNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes (Optional)</label>
              <textarea
                id="editNotes"
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editInvoiceData.notes || ''}
                onChange={(e) => setEditInvoiceData({ ...editInvoiceData, notes: e.target.value })}
              ></textarea>
            </div>
            <div>
              <label htmlFor="editStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                id="editStatus"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editInvoiceData.status || ''}
                onChange={(e) => setEditInvoiceData({ ...editInvoiceData, status: e.target.value as Invoice['status'] })}
                required
              >
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
                <option value="CANCELED">Canceled</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="Confirm Deletion">
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Are you sure you want to delete invoice <span className="font-bold">{selectedInvoice?.id}</span> for <span className="font-bold">{selectedInvoice?.patientName}</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDeleteInvoice}
              className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </Modal>
      </AnimatePresence>

      {/* View Invoice Details Modal */}
      <AnimatePresence>
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`Invoice Details: ${selectedInvoice?.id || ''}`}>
          {selectedInvoice && (
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p><strong>Invoice ID:</strong> {selectedInvoice.id}</p>
              <p><strong>Patient:</strong> {selectedInvoice.patientName}</p>
              <p><strong>Amount:</strong> <CurrencyDollarIcon className="inline-block w-4 h-4 mr-1 text-green-600 dark:text-green-400" />{selectedInvoice.amount.toFixed(2)}</p>
              <p><strong>Invoice Date:</strong> {selectedInvoice.date}</p>
              <p><strong>Due Date:</strong> {selectedInvoice.dueDate || 'N/A'}</p>
              <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedInvoice.status)}`}>{selectedInvoice.status}</span></p>
              <div>
                <strong>Items:</strong>
                <ul className="list-disc list-inside ml-4">
                  {selectedInvoice.items.length > 0 ? (
                    selectedInvoice.items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))
                  ) : (
                    <li>No items listed.</li>
                  )}
                </ul>
              </div>
              <p><strong>Notes:</strong> {selectedInvoice.notes || 'N/A'}</p>
              <p><strong>Created At:</strong> {selectedInvoice.createdAt}</p>
            </div>
          )}
        </Modal>
      </AnimatePresence>
    </div>
  );
}
