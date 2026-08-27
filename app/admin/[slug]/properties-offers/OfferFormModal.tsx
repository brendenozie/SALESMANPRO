// app/admin/[slug]/offers/OfferFormModal.tsx
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
  LinkIcon, 
} from '@heroicons/react/24/outline';
// Import types from the new client page component
import { OfferContract, SelectOption } from './OffersClientPage'; 

type OfferFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<OfferContract>) => Promise<void>;
  offer?: OfferContract; 
  isLoading: boolean;
  error: string | null;
  adminSlug: string; 
  // NEW PROPS FOR SELECT OPTIONS
  allProperties: SelectOption[];
  allClients: SelectOption[];
  allAgents: SelectOption[];
};

// Helper component for Select Field (Re-used for consistency)
const SelectField: React.FC<{
    label: string;
    Icon: React.ElementType;
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder: string;
    disabled: boolean;
}> = ({ label, Icon, value, onChange, options, placeholder, disabled }) => (
    <div>
        <label htmlFor={label} className="block text-sm font-medium text-gray-700 mb-1">
            <Icon className="inline-block h-4 w-4 mr-1 text-gray-500" /> {label} <span className="text-red-500">*</span>
        </label>
        <select
            id={label}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
            required
            disabled={disabled || options.length === 0}
        >
            <option value="" disabled>{options.length === 0 ? `Loading ${label} list failed.` : placeholder}</option>
            {options.length > 0 && options.map((option) => (
                <option key={option.id} value={option.id}>
                    {option.name} (ID: {option.id})
                </option>
            ))}
        </select>
    </div>
);


export const OfferFormModal: React.FC<OfferFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  offer,
  isLoading,
  error,
  adminSlug,
  allProperties, 
  allClients,    
  allAgents,     
}) => {
  const isEditMode = !!offer;
  const modalTitle = isEditMode ? 'Edit Property Offer' : 'Create New Offer';
  const submitButtonText = isEditMode ? 'Save Changes' : 'Create Offer';

  // State now tracks IDs only for select fields
  const [selectedPropertyId, setSelectedPropertyId] = useState(offer?.propertyId || '');
  const [selectedClientId, setSelectedClientId] = useState(offer?.clientId || '');
  const [selectedAgentId, setSelectedAgentId] = useState(offer?.agentId || '');
  
  const [offerAmount, setOfferAmount] = useState(offer?.offerAmount || 0);
  const [status, setStatus] = useState<OfferContract['status']>(offer?.status || 'Pending');
  const [offerDate, setOfferDate] = useState(
    offer?.offerDate ? new Date(offer.offerDate).toISOString().slice(0, 10) : ''
  );
  const [closureDate, setClosureDate] = useState(
    offer?.closureDate ? new Date(offer.closureDate).toISOString().slice(0, 10) : ''
  );
  const [notes, setNotes] = useState(offer?.notes || '');
  const [contractUrl, setContractUrl] = useState(offer?.contractUrl || '');

  // Reset form fields when modal opens or 'offer' prop changes
  useEffect(() => {
    if (isOpen) {
      setSelectedPropertyId(offer?.propertyId || '');
      setSelectedClientId(offer?.clientId || '');
      setSelectedAgentId(offer?.agentId || '');
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

    // Look up names based on selected IDs (MANDATORY STEP)
    const property = allProperties.find(p => p.id === selectedPropertyId);
    const client = allClients.find(c => c.id === selectedClientId);
    const agent = allAgents.find(a => a.id === selectedAgentId);

    // Client-side validation for required fields
    if (!property || !client || !agent || !offerAmount || !offerDate) {
      alert('Please select a Property, Client, Agent, set the Offer Amount, and Offer Date.');
      return;
    }

    const offerData: Partial<OfferContract> = {
      propertyId: property.id,
      propertyName: property.name, // Use looked-up name
      clientId: client.id,
      clientName: client.name,     // Use looked-up name
      agentId: agent.id,
      agentName: agent.name,       // Use looked-up name
      offerAmount: parseFloat(offerAmount.toString()), 
      status,
      offerDate: new Date(offerDate).toISOString(),
      closureDate: closureDate ? new Date(closureDate).toISOString() : undefined,
      notes,
      contractUrl: contractUrl || undefined, 
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
          
          {/* Property Selection */}
          <SelectField
            label="Property"
            Icon={HomeIcon}
            value={selectedPropertyId}
            onChange={setSelectedPropertyId}
            options={allProperties}
            placeholder="Select a property"
            disabled={isLoading}
          />

          {/* Client Selection */}
          <SelectField
            label="Client"
            Icon={UserIcon}
            value={selectedClientId}
            onChange={setSelectedClientId}
            options={allClients}
            placeholder="Select a client"
            disabled={isLoading}
          />

          {/* Agent Selection */}
          <SelectField
            label="Agent"
            Icon={BriefcaseIcon}
            value={selectedAgentId}
            onChange={setSelectedAgentId}
            options={allAgents}
            placeholder="Select an agent"
            disabled={isLoading}
          />

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
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading || (status !== 'Closed' && status !== 'Accepted')}
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
              disabled={isLoading}
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
              disabled={isLoading}
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