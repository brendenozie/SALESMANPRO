"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, EnvelopeIcon, PhoneIcon, BellIcon, ChatBubbleLeftRightIcon, CheckCircleIcon, ExclamationCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';


const apiBaseUrl = "/api";//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';


// Define interfaces for data fetched by the modal
interface ClientOption {
  id: string;
  name: string;
  email: string;
}

// Define the CommunicationData interface to match the expected API response
export interface CommunicationData {
  id?: string; // Optional for new communications
  subject: string;
  content: string;
  communicationType: 'EMAIL' | 'SMS' | 'NOTIFICATION' | 'IN_APP_MESSAGE';
  status: 'DRAFT' | 'SCHEDULED' | 'SENT';
  recipients: string[]; // Array of client IDs or special keywords like "all_clients"
  sentDate: string | null;
  scheduledDate: string | null;
}

interface CommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (comm: CommunicationData) => void;
  communication?: CommunicationData | null; // Communication data for editing, null for composing new
  slug: string;
}

const COMMUNICATION_TYPES = [
  { value: 'EMAIL', label: 'Email', icon: EnvelopeIcon },
  { value: 'SMS', label: 'SMS', icon: PhoneIcon },
  { value: 'NOTIFICATION', label: 'Notification', icon: BellIcon },
  { value: 'IN_APP_MESSAGE', label: 'In-App', icon: ChatBubbleLeftRightIcon },
];

const COMMUNICATION_STATUSES = [
  { value: 'DRAFT', label: 'Draft', icon: ExclamationCircleIcon },
  { value: 'SCHEDULED', label: 'Scheduled', icon: ClockIcon },
  { value: 'SENT', label: 'Sent Now', icon: CheckCircleIcon },
];

const CommunicationModal: React.FC<CommunicationModalProps> = ({ isOpen, onClose, onSave, communication, slug }) => {
  const [subject, setSubject] = useState(communication?.subject || '');
  const [content, setContent] = useState(communication?.content || '');
  const [communicationType, setCommunicationType] = useState<'EMAIL' | 'SMS' | 'NOTIFICATION' | 'IN_APP_MESSAGE'>(communication?.communicationType || 'EMAIL');
  const [status, setStatus] = useState<'DRAFT' | 'SCHEDULED' | 'SENT'>(communication?.status as any || 'DRAFT');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>(communication?.recipients || []);
  const [scheduledDateTime, setScheduledDateTime] = useState(communication?.scheduledDate || '');

  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loadingForm, setLoadingForm] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch clients for recipient selection
  useEffect(() => {
    const fetchClients = async () => {
      setLoadingForm(true);
      try {
        const response = await fetch(`${apiBaseUrl}/admin/fitness-clients?companyId=${slug}`
          , { credentials: 'include' }
        );
        const data = (  await response.json()).data || [];
        if (!response.ok) throw new Error(data.message || 'Failed to fetch clients.');
        setClients(data.map((c: any) => ({ id: c.id, name: c.name, email: c.email })));
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoadingForm(false);
      }
    };

    if (isOpen) {
      fetchClients();
    }
  }, [isOpen, slug]);

  // Update form fields when communication prop changes (for edit mode)
  useEffect(() => {
    if (communication) {
      setSubject(communication.subject);
      setContent(communication.content);
      setCommunicationType(communication.communicationType);
      setStatus(communication.status as any); // Type assertion for status
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
    setIsSubmitting(true);
    const toastId = toast.loading(communication ? 'Saving changes...' : 'Sending message...');

    if (!subject || !content || selectedRecipients.length === 0) {
      toast.error('Subject, content, and at least one recipient are required.', { id: toastId });
      setIsSubmitting(false);
      return;
    }

    if (status === 'SCHEDULED' && !scheduledDateTime) {
      toast.error('Scheduled date and time are required for scheduled messages.', { id: toastId });
      setIsSubmitting(false);
      return;
    }

    const method = communication ? 'PUT' : 'POST';
    const url = communication ? `${apiBaseUrl}/admin/communications/${communication.id}` : `${apiBaseUrl}/admin/communications?companyId=${slug}`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        // Include credentials for authentication (cookies, etc.)
        body: JSON.stringify({
          subject,
          content,
          communicationType,
          status,
          recipients: selectedRecipients,
          scheduledDate: scheduledDateTime || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${communication ? 'update' : 'create'} communication.`);
      }

      const savedCommunication: CommunicationData = await response.json();
      onSave(savedCommunication);
      toast.success(`Message "${savedCommunication.subject}" ${communication ? 'updated' : 'sent/scheduled'} successfully!`, { id: toastId });
      onClose();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
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
        onClick={onClose}
      >
        <motion.div
          className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative text-white border border-gray-700"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          onClick={(e:any) => e.stopPropagation()} // Prevent closing modal when clicking inside
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-7 h-7" />
          </button>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-600 mb-6 text-center">
            {communication ? 'Edit Message' : 'Compose New Message'}
          </h2>

          <div className="overflow-y-auto max-h-[80vh] pr-2">
            {loadingForm ? (
              <div className="text-center py-12">
                <svg className="animate-spin h-10 w-10 text-indigo-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-sm text-gray-400 mt-2">Loading form data...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Communication Type Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Communication Type</label>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {COMMUNICATION_TYPES.map((type) => {
                      const Icon = type.icon;
                      return (
                        <motion.button
                          key={type.value}
                          type="button"
                          onClick={() => setCommunicationType(type.value as any)}
                          className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 transform border ${
                            communicationType === type.value
                              ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white border-indigo-500 shadow-lg scale-105'
                              : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Icon className="w-7 h-7 mb-2" />
                          <span className="text-xs font-bold">{type.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Status Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Message Status</label>
                  <div className="grid grid-cols-3 gap-3">
                    {COMMUNICATION_STATUSES.map((s) => {
                      const Icon = s.icon;
                      return (
                        <motion.button
                          key={s.value}
                          type="button"
                          onClick={() => setStatus(s.value as any)}
                          className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-all duration-300 transform border ${
                            status === s.value
                              ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-purple-500 shadow-lg scale-105'
                              : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-sm font-bold">{s.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-300 mb-1">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter message subject"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="content" className="block text-sm font-semibold text-gray-300 mb-1">Message Content</label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                    placeholder="Type your message content here..."
                    required
                  ></textarea>
                </div>
                
                {status === 'SCHEDULED' && (
                  <div>
                    <label htmlFor="scheduledDateTime" className="block text-sm font-semibold text-gray-300 mb-1">Schedule Date & Time</label>
                    <input
                      type="datetime-local"
                      id="scheduledDateTime"
                      value={scheduledDateTime}
                      onChange={(e) => setScheduledDateTime(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                      required={status === 'SCHEDULED'}
                    />
                  </div>
                )}
                
                <div>
                  <label htmlFor="recipients" className="block text-sm font-semibold text-gray-300 mb-1">Recipients</label>
                  <select
                    id="recipients"
                    multiple
                    value={selectedRecipients}
                    onChange={handleRecipientChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 h-40"
                    required
                  >
                    <option value="all_clients" className="font-bold">All Clients</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id} className="p-2">{client.name} ({client.email})</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple recipients.</p>
                </div>

                <div className="flex justify-end space-x-3 mt-8">
                  <motion.button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 rounded-md font-bold text-gray-400 border border-gray-700 hover:bg-gray-700 hover:text-white transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="px-6 py-3 rounded-md font-bold text-white bg-gradient-to-r from-teal-500 to-cyan-600 shadow-md hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>{communication ? 'Saving...' : 'Sending...'}</span>
                      </>
                    ) : (
                      <span>{communication ? 'Save Changes' : 'Send Message'}</span>
                    )}
                  </motion.button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CommunicationModal;