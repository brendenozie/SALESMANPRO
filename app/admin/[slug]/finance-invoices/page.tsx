// app/admin/[adminSlug]/invoices/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardDocumentListIcon,
  PlusCircleIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/solid';

// Placeholder data for clients
// In a real app, these would be fetched from your API
const mockClients = [
  { id: 'cl1', name: 'Alice Johnson' },
  { id: 'cl2', name: 'Bob Williams' },
  { id: 'cl3', name: 'Charlie Davis' },
  { id: 'cl4', name: 'Diana Miller' },
];

const InvoiceStatusBadge = ({ status }) => {
  let colorClass = '';
  let Icon = ClockIcon;

  switch (status) {
    case 'PAID':
      colorClass = 'bg-green-600 text-green-100';
      Icon = CheckCircleIcon;
      break;
    case 'PENDING':
      colorClass = 'bg-yellow-600 text-yellow-100';
      Icon = ClockIcon;
      break;
    case 'OVERDUE':
      colorClass = 'bg-red-600 text-red-100';
      Icon = ExclamationCircleIcon;
      break;
    case 'CANCELLED':
      colorClass = 'bg-gray-600 text-gray-100';
      Icon = XMarkIcon;
      break;
    default:
      colorClass = 'bg-gray-600 text-gray-100';
      Icon = ExclamationCircleIcon;
      break;
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase ${colorClass}`}>
      <Icon className="h-4 w-4 mr-1" /> {status}
    </span>
  );
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [formState, setFormState] = useState({
    clientId: '',
    invoiceNumber: '',
    amount: '',
    issueDate: '',
    dueDate: '',
    status: 'PENDING',
    notes: ''
  });

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/invoices');
      const data = await res.json();
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleOpenModal = (invoice = null) => {
    if (invoice) {
      setIsEditing(true);
      setCurrentInvoice(invoice);
      setFormState({
        clientId: invoice.clientId,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.amount.toString(),
        issueDate: new Date(invoice.issueDate).toISOString().split('T')[0],
        dueDate: new Date(invoice.dueDate).toISOString().split('T')[0],
        status: invoice.status,
        notes: invoice.notes || ''
      });
    } else {
      setIsEditing(false);
      setCurrentInvoice(null);
      setFormState({
        clientId: '',
        invoiceNumber: '',
        amount: '',
        issueDate: '',
        dueDate: '',
        status: 'PENDING',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const invoiceData = {
      ...formState,
      issueDate: formState.issueDate,
      dueDate: formState.dueDate,
    };

    try {
      const res = await fetch(isEditing ? `/api/invoices/${currentInvoice.id}` : '/api/invoices', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      });

      if (!res.ok) throw new Error('Failed to save invoice');

      await fetchInvoices();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      setLoading(true);
      try {
        const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete invoice');
        await fetchInvoices();
      } catch (error) {
        console.error('Error deleting invoice:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDownload = (invoiceId) => {
    // In a real app, this would trigger a backend endpoint
    // to generate and download a PDF.
    console.log(`Downloading invoice ${invoiceId}...`);
    // Example: window.open(`/api/invoices/download/${invoiceId}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 md:p-10 bg-gray-900 min-h-screen text-gray-100 font-sans"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-400 mb-2">Invoices</h1>
          <p className="text-gray-400">Manage all client invoices and financial records.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center shadow-lg"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" /> Create New Invoice
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-10 text-gray-400">
          <ArrowPathIcon className="h-8 w-8 animate-spin mr-3" />
          Loading invoices...
        </div>
      ) : (
        <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
          {/* Table View for larger screens */}
          <div className="hidden md:block">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Invoice ID</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Client</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Issue Date</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Due Date</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <AnimatePresence>
                  {invoices.map((invoice) => (
                    <motion.tr
                      key={invoice.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{invoice.invoiceNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{invoice.client.user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${invoice.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <InvoiceStatusBadge status={invoice.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(invoice.issueDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <motion.button
                            onClick={() => handleOpenModal(invoice)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </motion.button>
                          <motion.button
                            onClick={() => handleDownload(invoice.id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-green-400 hover:text-green-300 transition-colors"
                          >
                            <ArrowDownTrayIcon className="h-5 w-5" />
                          </motion.button>
                          <motion.button
                            onClick={() => handleDelete(invoice.id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Card View for mobile screens */}
          <div className="md:hidden p-4 space-y-4">
            <AnimatePresence>
              {invoices.map((invoice) => (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-700 rounded-lg p-4 shadow-md space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <h4 className="text-lg font-bold text-white truncate">{invoice.invoiceNumber}</h4>
                    </div>
                    <InvoiceStatusBadge status={invoice.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
                      <span>Client: {invoice.client.user.name}</span>
                    </div>
                    <div className="flex items-center col-span-2">
                      <div className="text-xl font-bold text-green-400">{`$${invoice.amount.toFixed(2)}`}</div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-2">
                    <motion.button
                      onClick={() => handleOpenModal(invoice)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-full bg-gray-600 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDownload(invoice.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-full bg-gray-600 text-green-400 hover:text-green-300 transition-colors"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(invoice.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-full bg-gray-600 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Modal for Creating/Editing an Invoice */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-800 rounded-2xl shadow-xl p-8 max-w-lg w-full text-gray-100 border border-gray-700"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-400">{isEditing ? 'Edit Invoice' : 'Create New Invoice'}</h2>
                <button onClick={() => setShowModal(false)} className="p-1 rounded-full hover:bg-gray-700">
                  <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-white" />
                </button>
              </div>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="clientId" className="block text-sm font-medium text-gray-400">Client</label>
                    <select
                      id="clientId"
                      name="clientId"
                      value={formState.clientId}
                      onChange={handleFormChange}
                      required
                      className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="">Select a client...</option>
                      {mockClients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-400">Invoice Number</label>
                    <input
                      type="text"
                      id="invoiceNumber"
                      name="invoiceNumber"
                      value={formState.invoiceNumber}
                      onChange={handleFormChange}
                      required
                      className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-400">Amount ($)</label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formState.amount}
                      onChange={handleFormChange}
                      required
                      step="0.01"
                      className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-400">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={formState.status}
                      onChange={handleFormChange}
                      className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PAID">Paid</option>
                      <option value="OVERDUE">Overdue</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="issueDate" className="block text-sm font-medium text-gray-400">Issue Date</label>
                    <input
                      type="date"
                      id="issueDate"
                      name="issueDate"
                      value={formState.issueDate}
                      onChange={handleFormChange}
                      required
                      className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-400">Due Date</label>
                    <input
                      type="date"
                      id="dueDate"
                      name="dueDate"
                      value={formState.dueDate}
                      onChange={handleFormChange}
                      required
                      className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-400">Notes (Optional)</label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows="3"
                    value={formState.notes}
                    onChange={handleFormChange}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    {isEditing ? 'Save Changes' : 'Create Invoice'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
