// components/CommunicationModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Define interfaces for data fetched by the modal
interface ClientOption {
  id: string;
  name: string;
  email: string;
}

// Define the CommunicationData interface to match the expected API response
interface CommunicationData {
  id?: string; // Optional for new communications
  subject: string;
  content: string;
  communicationType: 'EMAIL' | 'SMS' | 'NOTIFICATION' | 'IN_APP_MESSAGE';
  status: 'DRAFT' | 'SCHEDULED' | 'SENT' | 'FAILED';
  recipients: string[]; // Array of client IDs or special keywords like "all_clients"
  sentDate: string | null; // YYYY-MM-DD
  scheduledDate: string | null; // YYYY-MM-DDTHH:MM
}

interface CommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (comm: CommunicationData) => void;
  communication?: CommunicationData | null; // Communication data for editing, null for composing new
  adminSlug: string;
}

const COMMUNICATION_TYPES = ['EMAIL', 'SMS', 'NOTIFICATION', 'IN_APP_MESSAGE'];
const COMMUNICATION_STATUSES = ['DRAFT', 'SCHEDULED', 'SENT']; // 'FAILED' is usually set by backend

const CommunicationModal: React.FC<CommunicationModalProps> = ({ isOpen, onClose, onSave, communication, adminSlug }) => {
  const [subject, setSubject] = useState(communication?.subject || '');
  const [content, setContent] = useState(communication?.content || '');
  const [communicationType, setCommunicationType] = useState<'EMAIL' | 'SMS' | 'NOTIFICATION' | 'IN_APP_MESSAGE'>(communication?.communicationType || 'EMAIL');
  const [status, setStatus] = useState<'DRAFT' | 'SCHEDULED' | 'SENT'>(communication?.status || 'DRAFT');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>(communication?.recipients || []);
  const [scheduledDateTime, setScheduledDateTime] = useState(communication?.scheduledDate || '');

  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loadingForm, setLoadingForm] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch clients for recipient selection
  useEffect(() => {
    const fetchClients = async () => {
      setLoadingForm(true);
      setError(null);
      try {
        const response = await fetch(`/api/admin/${adminSlug}/clients`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch clients');
        setClients(data.map((c: any) => ({ id: c.id, name: c.name, email: c.email })));
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching clients:", err);
      } finally {
        setLoadingForm(false);
      }
    };

    if (isOpen) {
      fetchClients();
    }
  }, [isOpen, adminSlug]);

  // Update form fields when communication prop changes (for edit mode)
  useEffect(() => {
    if (communication) {
      setSubject(communication.subject);
      setContent(communication.content);
      setCommunicationType(communication.communicationType);
      setStatus(communication.status);
      setSelectedRecipients(communication.recipients);
      setScheduledDateTime(communication.scheduledDate || '');
    } else {
      // Reset form for new communication
      setSubject('');
      setContent('');
      setCommunicationType('EMAIL');
      setStatus('DRAFT');
      setSelectedRecipients([]);
      setScheduledDateTime('');
    }
  }, [communication]);

  const handleRecipientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions).map(option => option.value);
    setSelectedRecipients(options);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingForm(true);
    setError(null);

    // Basic client-side validation
    if (!subject || !content || !communicationType || !status || selectedRecipients.length === 0) {
      setError('Subject, content, type, status, and at least one recipient are required.');
      setLoadingForm(false);
      return;
    }

    if (status === 'SCHEDULED' && !scheduledDateTime) {
      setError('Scheduled date and time are required for scheduled messages.');
      setLoadingForm(false);
      return;
    }
    if (status === 'SENT' && !scheduledDateTime) { // For immediate send, use current time if not set
      setScheduledDateTime(new Date().toISOString().slice(0, 16));
    }


    const method = communication ? 'PUT' : 'POST';
    const url = communication ? `/api/admin/${adminSlug}/communications/${communication.id}` : `/api/admin/${adminSlug}/communications`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          content,
          communicationType,
          status,
          recipients: selectedRecipients,
          scheduledDate: scheduledDateTime || null, // Pass null if not scheduled
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${communication ? 'update' : 'create'} communication.`);
      }

      const savedCommunication: CommunicationData = await response.json();
      onSave(savedCommunication); // Pass the saved communication data back to the parent
      onClose(); // Close the modal
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingForm(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative text-gray-900"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-7 h-7" />
          </button>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            {communication ? 'Edit Message' : 'Compose New Message'}
          </h2>
          {loadingForm && (
            <div className="text-center py-4">
              <svg className="animate-spin h-8 w-8 text-indigo-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-sm text-gray-600 mt-2">Loading form data...</p>
            </div>
          )}
          {!loadingForm && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Message Content</label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                ></textarea>
              </div>
              <div>
                <label htmlFor="communicationType" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  id="communicationType"
                  value={communicationType}
                  onChange={(e) => setCommunicationType(e.target.value as 'EMAIL' | 'SMS' | 'NOTIFICATION' | 'IN_APP_MESSAGE')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  {COMMUNICATION_TYPES.map((type) => (
                    <option key={type} value={type}>{type.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'SCHEDULED' | 'SENT')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  {COMMUNICATION_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              {(status === 'SCHEDULED' || status === 'SENT') && (
                <div>
                  <label htmlFor="scheduledDateTime" className="block text-sm font-medium text-gray-700 mb-1">
                    {status === 'SCHEDULED' ? 'Schedule Date & Time' : 'Sent Date & Time (for logging)'}
                  </label>
                  <input
                    type="datetime-local"
                    id="scheduledDateTime"
                    value={scheduledDateTime}
                    onChange={(e) => setScheduledDateTime(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                    required={status === 'SCHEDULED'}
                  />
                </div>
              )}
              <div>
                <label htmlFor="recipients" className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
                <select
                  id="recipients"
                  multiple
                  value={selectedRecipients}
                  onChange={handleRecipientChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 h-32"
                  required
                >
                  <option value="all_clients">All Clients</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>{client.name} ({client.email})</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple recipients.</p>
              </div>

              {error && (
                <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}
              <div className="flex justify-end space-x-3 mt-6">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={loadingForm}
                >
                  {loadingForm ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    communication ? 'Save Changes' : 'Send Message'
                  )}
                </motion.button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CommunicationModal;
