// AdminPromotions.jsx
"use client";

import React, { useState } from 'react';
import {
  TagIcon, PlusCircleIcon, PencilIcon, TrashIcon, CalendarDaysIcon, CurrencyDollarIcon
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

// Dummy Data
const initialPromotions = [
  { id: 'PROM001', name: 'Summer Sale 2025', code: 'SUMMER25', discount: '15% Off', type: 'Percentage', startDate: '2025-07-01', endDate: '2025-08-31', status: 'Active' },
  { id: 'PROM002', name: 'Early Bird Europe', code: 'EUROPEEB', discount: '$200 Off', type: 'Fixed Amount', startDate: '2025-09-01', endDate: '2025-10-31', status: 'Scheduled' },
  { id: 'PROM003', name: 'Last Minute Deals', code: 'LASTMIN', discount: '10% Off', type: 'Percentage', startDate: '2025-06-01', endDate: '2025-06-30', status: 'Expired' },
];

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState(initialPromotions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState(null); // For edit mode

  const openAddModal = () => {
    setCurrentPromotion(null);
    setIsModalOpen(true);
  };

  const openEditModal = (promo) => {
    setCurrentPromotion(promo);
    setIsModalOpen(true);
  };

  const handleSavePromotion = (formData) => {
    if (currentPromotion) {
      // Edit existing
      setPromotions(promotions.map(p => p.id === formData.id ? formData : p));
      alert(`Promotion "${formData.name}" updated.`);
    } else {
      // Add new
      const newId = `PROM${String(promotions.length + 1).padStart(3, '0')}`;
      setPromotions([...promotions, { ...formData, id: newId }]);
      alert(`Promotion "${formData.name}" added.`);
    }
    setIsModalOpen(false);
  };

  const handleDeletePromotion = (id) => {
    if (confirm(`Are you sure you want to delete promotion ${id}?`)) {
      setPromotions(promotions.filter(p => p.id !== id));
      alert(`Promotion ${id} deleted.`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-extrabold text-gray-900 mb-8"
      >
        Manage Promotions & Deals
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-md p-6 mb-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">All Promotions</h2>
          <motion.button
            onClick={openAddModal}
            className="flex items-center space-x-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span>Create New Promotion</span>
          </motion.button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {promotions.length > 0 ? (
                promotions.map((promo) => (
                  <tr key={promo.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{promo.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{promo.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{promo.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{promo.discount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{promo.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 flex items-center">
                      <CalendarDaysIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {promo.startDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 flex items-center">
                      <CalendarDaysIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {promo.endDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(promo.status)}`}>
                        {promo.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          onClick={() => openEditModal(promo)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition"
                          title="Edit"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <PencilIcon className="h-5 w-5" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeletePromotion(promo.id)}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition"
                          title="Delete"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-gray-500">No promotions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add/Edit Promotion Modal */}
      {isModalOpen && (
        <PromotionModal
          promotion={currentPromotion}
          onSave={handleSavePromotion}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

// PromotionModal.jsx (Internal Component for Add/Edit)
function PromotionModal({ promotion, onSave, onClose }) {
  const [name, setName] = useState(promotion?.name || '');
  const [code, setCode] = useState(promotion?.code || '');
  const [discount, setDiscount] = useState(promotion?.discount || '');
  const [type, setType] = useState(promotion?.type || 'Percentage');
  const [startDate, setStartDate] = useState(promotion?.startDate || '');
  const [endDate, setEndDate] = useState(promotion?.endDate || '');
  const [status, setStatus] = useState(promotion?.status || 'Scheduled');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: promotion?.id,
      name,
      code,
      discount,
      type,
      startDate,
      endDate,
      status,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {promotion ? 'Edit Promotion' : 'Create New Promotion'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="promoName" className="block text-sm font-medium text-gray-700">Promotion Name</label>
            <input
              type="text"
              id="promoName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="promoCode" className="block text-sm font-medium text-gray-700">Discount Code</label>
            <input
              type="text"
              id="promoCode"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="promoDiscount" className="block text-sm font-medium text-gray-700">Discount Value (e.g., "15% Off" or "$200 Off")</label>
            <input
              type="text"
              id="promoDiscount"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="promoType" className="block text-sm font-medium text-gray-700">Discount Type</label>
            <select
              id="promoType"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Percentage">Percentage</option>
              <option value="Fixed Amount">Fixed Amount</option>
            </select>
          </div>
          <div>
            <label htmlFor="promoStartDate" className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              id="promoStartDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="promoEndDate" className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              id="promoEndDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="promoStatus" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              id="promoStatus"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Active">Active</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {promotion ? 'Save Changes' : 'Create Promotion'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}