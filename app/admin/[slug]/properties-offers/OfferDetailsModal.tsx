// app/admin/[slug]/offers/OfferDetailsModal.tsx
'use client';

import React from 'react';
import {
  XMarkIcon,
  HomeIcon,
  UserIcon,
  BriefcaseIcon,
  BanknotesIcon,
  ClockIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  LinkIcon, // For contract URL
} from '@heroicons/react/24/outline';
import { OfferContract } from './OffersClientPage'; // UPDATED: Adjust path to new client component

type OfferDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  offer: OfferContract | null; // The offer to display
};

export const OfferDetailsModal: React.FC<OfferDetailsModalProps> = ({ isOpen, onClose, offer }) => {
  if (!isOpen || !offer) return null;

  // Helper to get status badge class
  const getStatusBadgeClass = (status: OfferContract['status']) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 ring-yellow-600/20';
      case 'Accepted': return 'bg-green-100 text-green-800 ring-green-600/20';
      case 'Rejected': return 'bg-red-100 text-red-800 ring-red-600/20';
      case 'Closed': return 'bg-purple-100 text-purple-800 ring-purple-600/20';
      default: return 'bg-gray-100 text-gray-800 ring-gray-600/20';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg transform transition-all duration-300 scale-100 opacity-100 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <DocumentTextIcon className="h-7 w-7 text-green-600 mr-3" />
            Offer Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4 text-gray-700">
          {/* Status Badge */}
          <div className="mb-4">
            <span className={`px-3.5 py-1.5 inline-flex text-sm leading-5 font-bold rounded-full shadow-sm ring-1 ring-inset ${getStatusBadgeClass(offer.status)}`}>
              {offer.status}
            </span>
          </div>

          {/* Property */}
          <div className="flex items-center">
            <HomeIcon className="h-5 w-5 text-gray-500 mr-3" />
            <p><strong className="font-semibold">Property:</strong> {offer.propertyName} (ID: {offer.propertyId})</p>
          </div>

          {/* Client */}
          <div className="flex items-center">
            <UserIcon className="h-5 w-5 text-gray-500 mr-3" />
            <p><strong className="font-semibold">Client:</strong> {offer.clientName} (ID: {offer.clientId})</p>
          </div>

          {/* Agent */}
          <div className="flex items-center">
            <BriefcaseIcon className="h-5 w-5 text-gray-500 mr-3" />
            <p><strong className="font-semibold">Agent:</strong> {offer.agentName} (ID: {offer.agentId})</p>
          </div>

          {/* Offer Amount */}
          <div className="flex items-center">
            <BanknotesIcon className="h-5 w-5 text-gray-500 mr-3" />
            <p><strong className="font-semibold">Offer Amount:</strong> {formatPrice(offer.offerAmount)}</p>
          </div>

          {/* Offer Date */}
          <div className="flex items-center">
            <CalendarDaysIcon className="h-5 w-5 text-gray-500 mr-3" />
            <p><strong className="font-semibold">Offer Date:</strong> {new Date(offer.offerDate).toLocaleDateString()}</p>
          </div>

          {/* Closure Date */}
          {offer.closureDate && (
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-gray-500 mr-3" />
              <p><strong className="font-semibold">Closure Date:</strong> {new Date(offer.closureDate).toLocaleDateString()}</p>
            </div>
          )}

          {/* Contract URL */}
          {offer.contractUrl && (
            <div className="flex items-center">
              <LinkIcon className="h-5 w-5 text-gray-500 mr-3" />
              <p>
                <strong className="font-semibold">Contract:</strong>{' '}
                <a href={offer.contractUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                  View Contract
                </a>
              </p>
            </div>
          )}

          {/* Notes */}
          <div>
            <div className="flex items-start">
              <ClipboardDocumentListIcon className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0 mt-1" />
              <p><strong className="font-semibold">Notes:</strong> {offer.notes || 'No notes provided.'}</p>
            </div>
          </div>

          {/* Timestamps */}
          <div className="text-xs text-gray-500 pt-4 border-t border-gray-100 mt-4">
            <p><strong>Offer ID:</strong> {offer.id}</p>
             <p><strong>Created At:</strong> {new Date(offer.createdAt).toLocaleString()}</p>
             <p><strong>Last Updated:</strong> {new Date(offer.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};