// app/admin/[slug]/showings/ShowingDetailsModal.tsx
'use client';

import React from 'react';
import {
  XMarkIcon,
  HomeIcon,
  UserIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ClockIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

import { Showing } from './ShowingsClientPage';


type ShowingDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  showing: Showing | null; // The showing to display
};

export const ShowingDetailsModal: React.FC<ShowingDetailsModalProps> = ({ isOpen, onClose, showing }) => {
  if (!isOpen || !showing) return null;

  // Helper to get status badge class
  const getStatusBadgeClass = (status: Showing['status']) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800 ring-blue-600/20';
      case 'Completed': return 'bg-green-100 text-green-800 ring-green-600/20';
      case 'Canceled': return 'bg-red-100 text-red-800 ring-red-600/20';
      default: return 'bg-gray-100 text-gray-800 ring-gray-600/20';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg transform transition-all duration-300 scale-100 opacity-100 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <CalendarDaysIcon className="h-7 w-7 text-green-600 mr-3" />
            Showing Details
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
            <span className={`px-3.5 py-1.5 inline-flex text-sm leading-5 font-bold rounded-full shadow-sm ring-1 ring-inset ${getStatusBadgeClass(showing.status)}`}>
              {showing.status}
            </span>
          </div>

          {/* Property */}
          <div className="flex items-center">
            <HomeIcon className="h-5 w-5 text-gray-500 mr-3" />
            <p><strong className="font-semibold">Property:</strong> {showing.propertyName} (ID: {showing.propertyId})</p>
          </div>

          {/* Client */}
          <div className="flex items-center">
            <UserIcon className="h-5 w-5 text-gray-500 mr-3" />
            <p><strong className="font-semibold">Client:</strong> {showing.clientName} (ID: {showing.clientId})</p>
          </div>

          {/* Agent */}
          <div className="flex items-center">
            <BriefcaseIcon className="h-5 w-5 text-gray-500 mr-3" />
            <p><strong className="font-semibold">Agent:</strong> {showing.agentName} (ID: {showing.agentId})</p>
          </div>

          {/* Date & Time */}
          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 text-gray-500 mr-3" />
            <p><strong className="font-semibold">Date & Time:</strong> {new Date(showing.dateTime).toLocaleString()}</p>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-start">
              <ClipboardDocumentListIcon className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0 mt-1" />
              <p><strong className="font-semibold">Notes:</strong> {showing.notes || 'No notes provided.'}</p>
            </div>
          </div>

          {/* Timestamps */}
          <div className="text-xs text-gray-500 pt-4 border-t border-gray-100 mt-4">
            <p><strong>Created At:</strong> {new Date(showing.createdAt).toLocaleString()}</p>
            <p><strong>Last Updated:</strong> {new Date(showing.updatedAt).toLocaleString()}</p>
          </div>

        
          {/* Action Button (Optional, e.g., link to edit) */}
          <div className="flex justify-end pt-4">
            {/* You could add an edit button here that opens the edit modal */}
            {/* <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                <PencilSquareIcon className="-ml-1 mr-2 h-4 w-4" /> Edit Showing
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};