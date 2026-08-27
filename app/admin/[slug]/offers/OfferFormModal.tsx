'use client';

import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  DocumentTextIcon,
  HomeIcon,
  UserIcon,
  BriefcaseIcon,
  BanknotesIcon,
  ClockIcon,
  InformationCircleIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  LinkIcon, // For contract URL
} from '@heroicons/react/24/outline';
import { OfferContract } from './page'; // Adjust path as needed

type OfferFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<OfferContract>) => Promise<void>;
  offer?: OfferContract; // Optional: if provided, it's edit mode
  isLoading: boolean;
  error: string | null;
  adminSlug: string; // To potentially fetch company-specific data if needed (e.g., properties, clients, agents)
};

export const OfferFormModal: React.FC<OfferFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  offer,
  isLoading,
  error,
  adminSlug,
}) => {
  const isEditMode = !!offer;
  const modalTitle = isEditMode ? 'Edit Property Offer' : 'Create New Offer';
  const submitButtonText = isEditMode ? 'Save Changes' : 'Create Offer';

  const [propertyId, setPropertyId] = useState(offer?.propertyId || '');
  const [propertyName, setPropertyName] = useState(offer?.propertyName || '');
  const [clientId, setClientId] = useState(offer?.clientId || '');
  const [clientName, setClientName] = useState(offer?.clientName || '');
  const [agentId, setAgentId] = useState(offer?.agentId || '');
  const [agentName, setAgentName] = useState(offer?.agentName || '');
  const [offerAmount, setOfferAmount] = useState(offer?.offerAmount || 0);
  const [status, setStatus] = useState<OfferContract['status']>(offer?.status || 'Pending');
  const [offerDate, setOfferDate] = useState(
    offer?.offerDate ? new Date(offer.offerDate).toISOString().slice(0, 10) : '' // Format for date input
  );
  const [closureDate, setClosureDate] = useState(
    offer?.closureDate ? new Date(offer.closureDate).toISOString().slice(0, 10) : ''
  );
  const [notes, setNotes] = useState(offer?.notes || '');
  const [contractUrl, setContractUrl] = useState(offer?.contractUrl || '');

  // Reset form fields when modal opens or 'offer' prop changes
  useEffect(() => {
    if (isOpen) {
      setPropertyId(offer?.propertyId || '');
      setPropertyName(offer?.propertyName || '');
      setClientId(offer?.clientId || '');
      setClientName(offer?.clientName || '');
      setAgentId(offer?.agentId || '');
      setAgentName(offer?.agentName || '');
      setOfferAmount(offer?.offerAmount || 0);
      setStatus(offer?.status || 'Pending');
      setOfferDate(
        offer?.offerDate ? new Date(offer.offerDate).toISOString().slice(0, 10) : ''
      );
      setClosureDate(
        offer?.closureDate ? new Date(offer.closureDate).toISOString().slice(0, 10) : ''
      );
      setNotes(offer?.notes || '');
      setContractUrl(offer?.contractUrl || '');
    }
  }, [isOpen, offer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic client-side validation
    if (!propertyId || !propertyName || !clientId || !clientName || !agentId || !agentName || !offerAmount || !offerDate) {
      alert('Please fill in all required fields: Property, Client, Agent, Offer Amount, and Offer Date.');
      return;
    }

    const offerData: Partial<OfferContract> = {
      propertyId,
      propertyName,
      clientId,
      clientName,
      agentId,
      agentName,
      offerAmount: parseFloat(offerAmount.toString()), // Ensure number
      status,
      offerDate: new Date(offerDate).toISOString(), // Ensure ISO string for backend
      closureDate: closureDate ? new Date(closureDate).toISOString() : undefined,
      notes,
      contractUrl: contractUrl || undefined, // Send undefined if empty
      // For create mode, we would also add companyId here if applicable to the API
      ...(isEditMode ? {} : { companyId: adminSlug }),
    };

    await onSubmit(offerData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl transform transition-all duration-300 scale-100 opacity-100 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <DocumentTextIcon className="h-7 w-7 text-indigo-600 mr-3" />
            {modalTitle}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Property Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="propertyId" className="block text-sm font-medium text-gray-700 mb-1">
                <HomeIcon className="inline-block h-4 w-4 mr-1 text-gray-500" /> Property ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="propertyId"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="propertyName" className="block text-sm font-medium text-gray-700 mb-1">
                <HomeIcon className="inline-block h-4 w-4 mr-1 text-gray-500" /> Property Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="propertyName"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
          </div>

          {/* Client Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">
                <UserIcon className="inline-block h-4 w-4 mr-1 text-gray-500" /> Client ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="clientId"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">
                <UserIcon className="inline-block h-4 w-4 mr-1 text-gray-500" /> Client Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
          </div>

          {/* Agent Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="agentId" className="block text-sm font-medium text-gray-700 mb-1">
                <BriefcaseIcon className="inline-block h-4 w-4 mr-1 text-gray-500" /> Agent ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="agentId"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="agentName" className="block text-sm font-medium text-gray-700 mb-1">
                <BriefcaseIcon className="inline-block h-4 w-4 mr-1 text-gray-500" /> Agent Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="agentName"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
          </div>

          {/* Offer Amount & Offer Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="offerAmount" className="block text-sm font-medium text-gray-700 mb-1">
                <BanknotesIcon className="inline-block h-4 w-4 mr-1 text-gray-500" /> Offer Amount (KES) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="offerAmount"
                value={offerAmount}
                onChange={(e) => setOfferAmount(parseFloat(e.target.value) || 0)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
                min="0"
              />
            </div>
            <div>
              <label htmlFor="offerDate" className="block text-sm font-medium text-gray-700 mb-1">
                <CalendarDaysIcon className="inline-block h-4 w-4 mr-1 text-gray-500" /> Offer Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="offerDate"
                value={offerDate}
                onChange={(e) => setOfferDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
          </div>

          {/* Status & Closure Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                <InformationCircleIcon className="inline-block h-4 w-4 mr-1 text-gray-500" /> Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as OfferContract['status'])}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div>
              <label htmlFor="closureDate" className="block text-sm font-medium text-gray-700 mb-1">
                <ClockIcon className="inline-block h-4 w-4 mr-1 text-gray-500" /> Closure Date (Optional)
              </label>
              <input
                type="date"
                id="closureDate"
                value={closureDate}
                onChange={(e) => setClosureDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                disabled={status !== 'Closed' && status !== 'Accepted'} // Only enable if accepted/closed
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              <ClipboardDocumentListIcon className="inline-block h-4 w-4 mr-1 text-gray-500" /> Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            ></textarea>
          </div>

          {/* Contract URL */}
          <div>
            <label htmlFor="contractUrl" className="block text-sm font-medium text-gray-700 mb-1">
              <LinkIcon className="inline-block h-4 w-4 mr-1 text-gray-500" /> Contract URL (Optional)
            </label>
            <input
              type="url"
              id="contractUrl"
              value={contractUrl}
              onChange={(e) => setContractUrl(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., https://example.com/contract-doc.pdf"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <DocumentTextIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
              )}
              {submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};