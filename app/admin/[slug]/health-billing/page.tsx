"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCardIcon, PlusCircleIcon, MagnifyingGlassIcon, EyeIcon, CheckCircleIcon, CurrencyDollarIcon } from '@heroicons/react/24/solid';

const fadeIn = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

interface Invoice {
  id: string;
  patientName: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  items: string[];
}

const sampleInvoices: Invoice[] = [
  { id: 'inv001', patientName: 'Alice Wonderland', amount: 150.00, date: '2023-07-05', status: 'Paid', items: ['General Check-up', 'Lab Tests'] },
  { id: 'inv002', patientName: 'Bob The Builder', amount: 85.50, date: '2023-07-10', status: 'Pending', items: ['Medication (Ibuprofen)', 'POS Purchase'] },
  { id: 'inv003', patientName: 'Charlie Chaplin', amount: 220.00, date: '2023-06-20', status: 'Overdue', items: ['Dermatology Consult', 'Prescription'] },
  { id: 'inv004', patientName: 'Diana Prince', amount: 60.00, date: '2023-07-12', status: 'Paid', items: ['Vaccination'] },
];

export default function AdminBillingPage({ params }: { params: { adminSlug: string } }) {
  const [invoices, setInvoices] = useState<Invoice[]>(sampleInvoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredInvoices = invoices.filter(invoice =>
    (filterStatus === 'All' || invoice.status === filterStatus) &&
    (invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
     invoice.items.some(item => item.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const updateInvoiceStatus = (id: string, newStatus: Invoice['status']) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv));
    alert(`Invoice ${id} status updated to ${newStatus}. (Mock Action)`);
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'Paid': return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900';
      case 'Pending': return 'text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900';
      case 'Overdue': return 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8">
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
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
            <button
              onClick={() => alert('Generate new invoice form (Mock Action)')}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full font-bold shadow-md hover:from-violet-600 hover:to-purple-700 transition-all duration-300"
            >
              <PlusCircleIcon className="w-5 h-5 mr-2" /> Generate New Invoice
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tl-xl">Invoice ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Patient</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th scope="col" className="relative px-6 py-3 rounded-tr-xl">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{invoice.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{invoice.patientName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        ${invoice.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {invoice.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => alert(`Viewing invoice details for: ${invoice.id}`)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                            aria-label={`View invoice ${invoice.id}`}
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          {invoice.status !== 'Paid' && (
                            <button
                              onClick={() => updateInvoiceStatus(invoice.id, 'Paid')}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200 p-2 rounded-full hover:bg-green-50 dark:hover:bg-gray-700 transition-colors"
                              aria-label={`Mark invoice ${invoice.id} as paid`}
                            >
                              <CheckCircleIcon className="w-5 h-5" />
                            </button>
                          )}
                          {/* Add other actions like 'Send Reminder' or 'Edit' */}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
