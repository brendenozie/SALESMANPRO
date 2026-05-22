"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  BellIcon, 
  ChatBubbleLeftRightIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  ClockIcon,
  MagnifyingGlassIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

interface ClientOption {
  id: string;
  name: string;
  email: string;
}

export interface CommunicationData {
  id?: string;
  subject: string;
  content: string;
  communicationType: 'EMAIL' | 'SMS' | 'NOTIFICATION' | 'IN_APP_MESSAGE';
  status: 'DRAFT' | 'SCHEDULED' | 'SENT';
  recipients: string[];
  sentDate: string | null;
  scheduledDate: string | null;
}

interface CommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (comm: CommunicationData) => void;
  communication?: CommunicationData | null;
  slug: string;
}

const COMMUNICATION_TYPES = [
  { value: 'EMAIL', label: 'Email', icon: EnvelopeIcon, color: 'from-blue-500 to-indigo-600' },
  { value: 'SMS', label: 'SMS', icon: PhoneIcon, color: 'from-emerald-500 to-teal-600' },
  { value: 'NOTIFICATION', label: 'Notification', icon: BellIcon, color: 'from-amber-500 to-orange-600' },
  { value: 'IN_APP_MESSAGE', label: 'In-App', icon: ChatBubbleLeftRightIcon, color: 'from-purple-500 to-pink-600' },
] as const;

const COMMUNICATION_STATUSES = [
  { value: 'DRAFT', label: 'Draft', icon: ExclamationCircleIcon },
  { value: 'SCHEDULED', label: 'Schedule', icon: ClockIcon },
  { value: 'SENT', label: 'Send Now', icon: CheckCircleIcon },
] as const;

const CommunicationModal: React.FC<CommunicationModalProps> = ({ isOpen, onClose, onSave, communication, slug }) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [communicationType, setCommunicationType] = useState<CommunicationData['communicationType']>('EMAIL');
  const [status, setStatus] = useState<CommunicationData['status']>('DRAFT');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loadingForm, setLoadingForm] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      if (!isOpen) return;
      setLoadingForm(true);
      try {
        const response = await fetch(`${apiBaseUrl}/admin/fitness-clients?companyId=${slug}`, { 
          credentials: 'include' 
        });
        const resData = await response.json();
        const data = resData.data || [];
        if (!response.ok) throw new Error(resData.message || 'Failed to fetch clients.');
        setClients(data.map((c: any) => ({ id: c.id, name: c.name, email: c.email })));
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoadingForm(false);
      }
    };

    fetchClients();
  }, [isOpen, slug]);

  useEffect(() => {
    if (communication) {
      setSubject(communication.subject);
      setContent(communication.content);
      setCommunicationType(communication.communicationType);
      setStatus(communication.status);
      setSelectedRecipients(communication.recipients);
      setScheduledDateTime(communication.scheduledDate || '');
    } else {
      setSubject('');
      setContent('');
      setCommunicationType('EMAIL');
      setStatus('DRAFT');
      setSelectedRecipients([]);
      setScheduledDateTime('');
    }
    setSearchQuery('');
  }, [communication, isOpen]);

  const toggleRecipient = (id: string) => {
    if (id === 'all_clients') {
      if (selectedRecipients.includes('all_clients')) {
        setSelectedRecipients([]);
      } else {
        setSelectedRecipients(['all_clients']);
      }
    } else {
      let updated = selectedRecipients.filter(r => r !== 'all_clients');
      if (updated.includes(id)) {
        updated = updated.filter(r => r !== id);
      } else {
        updated.push(id);
      }
      setSelectedRecipients(updated);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim() || selectedRecipients.length === 0) {
      toast.error('Subject, content, and at least one recipient are required.');
      return;
    }
    if (status === 'SCHEDULED' && !scheduledDateTime) {
      toast.error('Scheduled date and time are required for scheduled messages.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(communication ? 'Saving changes...' : 'Processing message...');
    const method = communication ? 'PUT' : 'POST';
    const url = communication 
      ? `${apiBaseUrl}/admin/communications/${communication.id}` 
      : `${apiBaseUrl}/admin/communications?companyId=${slug}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          subject,
          content,
          communicationType,
          status,
          recipients: selectedRecipients,
          scheduledDate: status === 'SCHEDULED' ? scheduledDateTime : null,
        }),
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || 'Action failed.');

      onSave(resData);
      toast.success(`Message successfully ${communication ? 'updated' : 'processed'}!`, { id: toastId });
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 max-sm:p-0 max-sm:items-end">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md dark:bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            className="relative w-full max-w-2xl h-[90vh] max-sm:h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-sm:rounded-t-2xl max-sm:rounded-b-none shadow-2xl flex flex-col text-slate-900 dark:text-slate-100 overflow-hidden"
            initial={{ y: window.innerWidth < 640 ? '100%' : 30, opacity: window.innerWidth < 640 ? 1 : 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: window.innerWidth < 640 ? '100%' : 30, opacity: window.innerWidth < 640 ? 1 : 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-violet-600 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  {communication ? 'Edit Presentation' : 'Compose Hub'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Dispatched updates directly to consumer integrations.</p>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 transition-colors"
                aria-label="Close modal"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {loadingForm ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 dark:border-indigo-500/10" />
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                  </div>
                  <p className="text-sm font-medium text-slate-400 dark:text-slate-500">Synchronizing secure assets...</p>
                </div>
              ) : (
                <form id="comm-modal-form" onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Communication Type Cards */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Channel Medium</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {COMMUNICATION_TYPES.map((type) => {
                        const Icon = type.icon;
                        const isSelected = communicationType === type.value;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setCommunicationType(type.value)}
                            className={`flex flex-col items-center text-center p-3.5 rounded-xl border transition-all duration-200 relative overflow-hidden ${
                              isSelected
                                ? `bg-gradient-to-br ${type.color} text-white border-transparent shadow-md shadow-indigo-500/10 scale-[1.02]`
                                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                            <span className="text-xs font-semibold">{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dispatch Urgency Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Dispatch Paradigm</label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {COMMUNICATION_STATUSES.map((s) => {
                        const Icon = s.icon;
                        const isSelected = status === s.value;
                        return (
                          <button
                            key={s.value}
                            type="button"
                            onClick={() => setStatus(s.value)}
                            className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold border transition-all duration-200 ${
                              isSelected
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-transparent shadow-sm'
                                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{s.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Timepicker for scheduling */}
                  <AnimatePresence p-0>
                    {status === 'SCHEDULED' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-2"
                      >
                        <label htmlFor="scheduledDateTime" className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Target Pipeline Time</label>
                        <input
                          type="datetime-local"
                          id="scheduledDateTime"
                          value={scheduledDateTime}
                          onChange={(e) => setScheduledDateTime(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-sm border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-900 dark:text-white"
                          required={status === 'SCHEDULED'}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Envelope Subject */}
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Subject Blueprint</label>
                    <input
                      type="text"
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-sm border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                      placeholder="Specify critical focal subject tag..."
                      required
                    />
                  </div>

                  {/* Body Copy Area */}
                  <div className="space-y-2">
                    <label htmlFor="content" className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Payload Content Context</label>
                    <textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-sm border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none"
                      placeholder="Compose descriptive messaging execution block here..."
                      required
                    />
                  </div>

                  {/* Modern Filterable Multi-Select Recipients */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Target Audience Nodes</label>
                      <span className="text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold px-2 py-0.5 rounded-md">
                        {selectedRecipients.includes('all_clients') ? 'All' : selectedRecipients.length} Target(s) Selected
                      </span>
                    </div>

                    {/* Master Global Node */}
                    <button
                      type="button"
                      onClick={() => toggleRecipient('all_clients')}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm font-semibold transition-all ${
                        selectedRecipients.includes('all_clients')
                          ? 'bg-indigo-500/10 dark:bg-indigo-400/10 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <UsersIcon className="w-4 h-4" />
                        <span>Broad Broadcast Cluster (All System Clients)</span>
                      </div>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        selectedRecipients.includes('all_clients') ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 dark:border-slate-700'
                      }`}>
                        {selectedRecipients.includes('all_clients') && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
                      </div>
                    </button>

                    {/* Individual Client Picker Section */}
                    {!selectedRecipients.includes('all_clients') && (
                      <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/40 space-y-2 p-3">
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-600" />
                          <input
                            type="text"
                            placeholder="Filter unique client entities by structural metadata..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 bg-white dark:bg-slate-800 text-xs rounded-lg border border-slate-200 dark:border-slate-700/60 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                          />
                        </div>

                        <div className="max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                          {filteredClients.length === 0 ? (
                            <p className="text-xs text-slate-400 dark:text-slate-600 text-center py-6">No unique target signatures match criteria.</p>
                          ) : (
                            filteredClients.map((client) => {
                              const isChecked = selectedRecipients.includes(client.id);
                              return (
                                <button
                                  key={client.id}
                                  type="button"
                                  onClick={() => toggleRecipient(client.id)}
                                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                                    isChecked 
                                      ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white' 
                                      : 'hover:bg-white dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                                  }`}
                                >
                                  <div className="truncate pr-4">
                                    <p className="font-semibold truncate">{client.name}</p>
                                    <p className="text-slate-400 dark:text-slate-500 font-mono text-[10px] truncate">{client.email}</p>
                                  </div>
                                  <div className={`w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center ${
                                    isChecked ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 dark:border-slate-700'
                                  }`}>
                                    {isChecked && <div className="w-1 h-1 bg-white rounded-sm" />}
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Sticky Action Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0 bg-white dark:bg-slate-900">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all"
              >
                Abort
              </button>
              <button
                type="submit"
                form="comm-modal-form"
                disabled={isSubmitting || loadingForm}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 dark:from-indigo-500 dark:to-cyan-500 shadow-md shadow-indigo-500/10 hover:opacity-95 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing Pipeline...</span>
                  </>
                ) : (
                  <span>{communication ? 'Save Structural Changes' : 'Commit Dispatch Pipeline'}</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommunicationModal;