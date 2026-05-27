// app/[slug]/dashboard/page.tsx
"use client";

import React, { useState, useEffect, useCallback, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCircleIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  CreditCardIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  EyeIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// --- Reusable Premium Modal Component ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <motion.div
        className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-8 w-full max-w-lg relative max-h-[85vh] overflow-y-auto shadow-2xl z-10"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-black uppercase italic tracking-tight text-zinc-900 dark:text-white mb-6">
          {title}
        </h2>
        {children}
      </motion.div>
    </div>
  );
};

// --- Data Interfaces ---
interface MemberProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

interface TrainingSession {
  id: string;
  memberName: string;
  coachName: string;
  service: string;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'COMPLETED';
  notes?: string;
  createdAt: string;
}

interface WorkoutPlan {
  id: string;
  memberId: string;
  memberName: string;
  coachName: string;
  programTitle: string;
  targetFocus: string;
  issuedDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
  notes?: string;
  createdAt: string;
}

interface Invoice {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: string;
  dueDate?: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELED';
  items: string[];
  notes?: string;
  createdAt: string;
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function PatientDashboardPage({ params }: PageProps) {
  // Safe unwrap of async params inside Next.js 15 client component via React.use()
  const resolvedParams = use(params);
  const currentMemberId = resolvedParams.slug;

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Data States ---
  const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null);
  const [sessionsList, setSessionsList] = useState<TrainingSession[]>([]);
  const [plansList, setPlansList] = useState<WorkoutPlan[]>([]);
  const [invoicesList, setInvoicesList] = useState<Invoice[]>([]);

  // --- Modal States ---
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [editProfileData, setEditProfileData] = useState<Partial<MemberProfile>>({});

  const [isEditSessionModalOpen, setIsEditSessionModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
  const [editSessionData, setEditSessionData] = useState<Partial<TrainingSession>>({});

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewedItem, setViewedItem] = useState<any>(null);
  const [viewModalTitle, setViewModalTitle] = useState('');

  // --- Filter States ---
  const [sessionStartDate, setSessionStartDate] = useState('');
  const [sessionEndDate, setSessionEndDate] = useState('');
  const [sessionStatusFilter, setSessionStatusFilter] = useState('All');
  
  const [planSearchTerm, setPlanSearchTerm] = useState('');
  const [planStatusFilter, setPlanStatusFilter] = useState('All');
  
  const [invoiceSearchTerm, setInvoiceSearchTerm] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('All');

  // --- API Fetchers ---
  const fetchMemberProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/patient/profile?patientId=${currentMemberId}`);
      if (!response.ok) throw new Error('Failed to fetch profile settings.');
      const data: MemberProfile = await response.json();
      setMemberProfile(data);
    } catch (e: any) {
      setError(e.message || "Failed to load member profile.");
    } finally {
      setLoading(false);
    }
  }, [currentMemberId]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/patient/profile?patientId=${currentMemberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProfileData),
      });
      if (!response.ok) throw new Error('Profile update execution failed.');
      setIsEditProfileModalOpen(false);
      fetchMemberProfile();
    } catch (e: any) {
      setError(e.message || "Failed to sync profiles.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({ patientId: currentMemberId });
      if (sessionStartDate) query.append('startDate', sessionStartDate);
      if (sessionEndDate) query.append('endDate', sessionEndDate);
      if (sessionStatusFilter !== 'All') query.append('status', sessionStatusFilter);

      const response = await fetch(`${apiBaseUrl}/patient/appointments?${query.toString()}`);
      if (!response.ok) throw new Error('Failed to synchronize schedule analytics.');
      const data: TrainingSession[] = await response.json();
      setSessionsList(data);
    } catch (e: any) {
      setError(e.message || "Failed to load schedules.");
    } finally {
      setLoading(false);
    }
  }, [currentMemberId, sessionStartDate, sessionEndDate, sessionStatusFilter]);

  const handleUpdateSession = async () => {
    if (!selectedSession) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/patient/appointments/${selectedSession.id}?patientId=${currentMemberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editSessionData.status, notes: editSessionData.notes }),
      });
      if (!response.ok) throw new Error('Could not verify state transition.');
      setIsEditSessionModalOpen(false);
      fetchSessions();
    } catch (e: any) {
      setError(e.message || "Failed to update session.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({ patientId: currentMemberId });
      if (planSearchTerm) query.append('searchTerm', planSearchTerm);
      if (planStatusFilter !== 'All') query.append('status', planStatusFilter);

      const response = await fetch(`${apiBaseUrl}/patient/prescriptions?${query.toString()}`);
      if (!response.ok) throw new Error('Assigned regimen loading failure.');
      const data: WorkoutPlan[] = await response.json();
      setPlansList(data);
    } catch (e: any) {
      setError(e.message || "Failed to fetch schedules.");
    } finally {
      setLoading(false);
    }
  }, [currentMemberId, planSearchTerm, planStatusFilter]);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({ patientId: currentMemberId });
      if (invoiceSearchTerm) query.append('searchTerm', invoiceSearchTerm);
      if (invoiceStatusFilter !== 'All') query.append('status', invoiceStatusFilter);

      const response = await fetch(`${apiBaseUrl}/patient/invoices?${query.toString()}`);
      if (!response.ok) throw new Error('Ledger processing error.');
      const data: Invoice[] = await response.json();
      setInvoicesList(data);
    } catch (e: any) {
      setError(e.message || "Failed to sync transactions.");
    } finally {
      setLoading(false);
    }
  }, [currentMemberId, invoiceSearchTerm, invoiceStatusFilter]);

  useEffect(() => {
    if (activeTab === 'profile') fetchMemberProfile();
    if (activeTab === 'sessions') fetchSessions();
    if (activeTab === 'plans') fetchPlans();
    if (activeTab === 'invoices') fetchInvoices();
  }, [activeTab, fetchMemberProfile, fetchSessions, fetchPlans, fetchInvoices]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'COMPLETED':
      case 'PAID':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'PENDING':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'OVERDUE':
      case 'CANCELED':
      case 'EXPIRED':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'CONFIRMED':
        return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      default:
        return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const handleViewDetails = (item: any, title: string) => {
    setViewedItem(item);
    setViewModalTitle(title);
    setIsViewModalOpen(true);
  };

  // --- Rendering Sections ---
  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="p-8 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
        {memberProfile ? (
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-orange-500 shadow-xl bg-zinc-800">
              <img
                className="w-full h-full object-cover"
                src={memberProfile.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${memberProfile.name}`}
                alt={memberProfile.name}
              />
            </div>
            <div className="flex-grow text-center md:text-left space-y-2">
              <h3 className="text-3xl font-black tracking-tight uppercase italic">{memberProfile.name}</h3>
              <div className="space-y-1 text-zinc-500 text-sm font-medium">
                <p className="flex items-center justify-center md:justify-start gap-2">
                  <EnvelopeIcon className="w-4 h-4 text-orange-500" /> {memberProfile.email}
                </p>
                <p className="flex items-center justify-center md:justify-start gap-2">
                  <PhoneIcon className="w-4 h-4 text-orange-500" /> {memberProfile.phone || 'No Linked Phone Record'}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditProfileData({ ...memberProfile });
                  setIsEditProfileModalOpen(true);
                }}
                className="mt-4 inline-flex items-center px-6 h-12 bg-black dark:bg-white text-white dark:text-black rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all"
              >
                <PencilIcon className="w-4 h-4 mr-2" /> Modify Configurations
              </button>
            </div>
          </div>
        ) : (
          <p className="text-zinc-500 text-center py-6">No account profiles matched initialization context.</p>
        )}
      </div>

      <AnimatePresence>
        <Modal isOpen={isEditProfileModalOpen} onClose={() => setIsEditProfileModalOpen(false)} title="Update Performance Identity">
          <form onSubmit={(e) => { e.preventDefault(); handleUpdateProfile(); }} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-widest font-black text-zinc-400 mb-2">Display Name</label>
              <input type="text" value={editProfileData.name || ''} onChange={(e) => setEditProfileData({ ...editProfileData, name: e.target.value })} className="w-full h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm font-bold focus:outline-none focus:border-orange-500" required />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-black text-zinc-400 mb-2">Primary Email Address</label>
              <input type="email" value={editProfileData.email || ''} onChange={(e) => setEditProfileData({ ...editProfileData, email: e.target.value })} className="w-full h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm font-bold focus:outline-none focus:border-orange-500" required />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-black text-zinc-400 mb-2">Telephone Routing Channel</label>
              <input type="tel" value={editProfileData.phone || ''} onChange={(e) => setEditProfileData({ ...editProfileData, phone: e.target.value })} className="w-full h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm font-bold focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-black text-zinc-400 mb-2">Profile Avatar Asset Matrix URL</label>
              <input type="url" value={editProfileData.profilePicture || ''} onChange={(e) => setEditProfileData({ ...editProfileData, profilePicture: e.target.value })} className="w-full h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm font-bold focus:outline-none focus:border-orange-500" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setIsEditProfileModalOpen(false)} className="h-12 px-6 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-black uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-800">Cancel</button>
              <button type="submit" className="h-12 px-6 rounded-xl bg-orange-500 text-white text-xs font-black uppercase tracking-widest hover:scale-105 transition-all">Save Matrix</button>
            </div>
          </form>
        </Modal>
      </AnimatePresence>
    </div>
  );

  const renderSessionsSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800">
        <div>
          <label className="block text-xs uppercase tracking-widest font-black text-zinc-400 mb-2">Window From</label>
          <input type="date" value={sessionStartDate} onChange={(e) => setSessionStartDate(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs font-bold focus:outline-none focus:border-orange-500" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest font-black text-zinc-400 mb-2">Window Terminus</label>
          <input type="date" value={sessionEndDate} onChange={(e) => setSessionEndDate(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs font-bold focus:outline-none focus:border-orange-500" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest font-black text-zinc-400 mb-2">Status Flag</label>
          <select value={sessionStatusFilter} onChange={(e) => setSessionStatusFilter(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold focus:outline-none focus:border-orange-500">
            <option value="All">All Intervals</option>
            <option value="PENDING">Pending Approval</option>
            <option value="CONFIRMED">Confirmed Slots</option>
            <option value="COMPLETED">Completed Drills</option>
            <option value="CANCELED">Canceled Sessions</option>
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={fetchSessions} className="w-full h-12 bg-black dark:bg-white text-white dark:text-black font-black uppercase text-xs tracking-widest rounded-xl hover:scale-[1.02] transition-all">
            Query Schedule
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2rem] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 text-xs uppercase tracking-widest font-black text-zinc-400">
                <th className="p-6">Elite Instructor</th>
                <th className="p-6">Performance Service</th>
                <th className="p-6">Timestamp Window</th>
                <th className="p-6">Routing Registry</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-sm font-medium">
              {sessionsList.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-zinc-500">No scheduled sessions mapped within the active parameters.</td></tr>
              ) : (
                sessionsList.map(session => (
                  <tr key={session.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="p-6 font-black">{session.coachName}</td>
                    <td className="p-6 text-zinc-500">{session.service}</td>
                    <td className="p-6 font-mono text-xs">{session.date} @ {session.timeSlot}</td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider border uppercase ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleViewDetails(session, `Session Blueprint Analysis`)} className="p-2 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-blue-500">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        {(session.status === 'PENDING' || session.status === 'CONFIRMED') && (
                          <button onClick={() => { setSelectedSession(session); setEditSessionData({ status: 'CANCELED', notes: '' }); setIsEditSessionModalOpen(true); }} className="p-2 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-red-500/10 transition-all text-red-500">
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        <Modal isOpen={isEditSessionModalOpen} onClose={() => setIsEditSessionModalOpen(false)} title="Revoke Allocated Reservation">
          <form onSubmit={(e) => { e.preventDefault(); handleUpdateSession(); }} className="space-y-4">
            <p className="text-zinc-500 text-sm leading-relaxed">Are you certain you want to cancel your session block with <span className="font-bold text-black dark:text-white">{selectedSession?.coachName}</span>?</p>
            <div>
              <label className="block text-xs uppercase tracking-widest font-black text-zinc-400 mb-2">Cancellation Logic Notes</label>
              <textarea rows={3} value={editSessionData.notes || ''} onChange={(e) => setEditSessionData({ ...editSessionData, notes: e.target.value })} className="w-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:border-orange-500" placeholder="State operational justification context..." />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsEditSessionModalOpen(false)} className="h-12 px-6 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-black uppercase tracking-widest">Abort</button>
              <button type="submit" className="h-12 px-6 rounded-xl bg-red-600 text-white text-xs font-black uppercase tracking-widest hover:bg-red-700">Confirm Termination</button>
            </div>
          </form>
        </Modal>
      </AnimatePresence>
    </div>
  );

  const renderPlansSection = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 rounded-2xl">
        <div className="relative flex-grow">
          <input type="text" placeholder="Filter target focus vectors or instructors..." className="w-full h-12 pl-12 pr-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:border-orange-500" value={planSearchTerm} onChange={(e) => setPlanSearchTerm(e.target.value)} onKeyUp={(e) => e.key === 'Enter' && fetchPlans()} />
          <MagnifyingGlassIcon className="absolute left-4 top-1.2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        </div>
        <select value={planStatusFilter} onChange={(e) => setPlanStatusFilter(e.target.value)} className="h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold focus:outline-none focus:border-orange-500">
          <option value="All">All Lifecycle Phases</option>
          <option value="ACTIVE">Active Modules</option>
          <option value="COMPLETED">Completed Blueprints</option>
          <option value="EXPIRED">Outdated Pipelines</option>
        </select>
        <button onClick={fetchPlans} className="h-12 px-6 bg-black dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-widest rounded-xl">Apply Parameters</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plansList.length === 0 ? (
          <div className="md:col-span-2 p-12 text-center text-zinc-500 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2rem]">No specialized training modules synced.</div>
        ) : (
          plansList.map(plan => (
            <div key={plan.id} className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-orange-500">Regimen Protocol</span>
                    <h4 className="text-xl font-black mt-1">{plan.programTitle}</h4>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border ${getStatusColor(plan.status)}`}>{plan.status}</span>
                </div>
                <div className="space-y-2 py-4 border-y border-zinc-50 dark:border-zinc-800 text-sm text-zinc-500">
                  <p><span className="font-bold text-zinc-400 uppercase text-xs tracking-wider mr-2">Focus Architecture:</span> {plan.targetFocus}</p>
                  <p><span className="font-bold text-zinc-400 uppercase text-xs tracking-wider mr-2">Assigned Coach:</span> {plan.coachName}</p>
                  <p><span className="font-bold text-zinc-400 uppercase text-xs tracking-wider mr-2">Deployment Date:</span> {plan.issuedDate}</p>
                </div>
              </div>
              <button onClick={() => handleViewDetails(plan, plan.programTitle)} className="w-full h-11 mt-6 border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                Inspect Blueprint Details
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderInvoicesSection = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 rounded-2xl">
        <div className="relative flex-grow">
          <input type="text" placeholder="Query ledger transactional allocations..." className="w-full h-12 pl-12 pr-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:border-orange-500" value={invoiceSearchTerm} onChange={(e) => setInvoiceSearchTerm(e.target.value)} onKeyUp={(e) => e.key === 'Enter' && fetchInvoices()} />
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        </div>
        <select value={invoiceStatusFilter} onChange={(e) => setInvoiceStatusFilter(e.target.value)} className="h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold focus:outline-none focus:border-orange-500">
          <option value="All">All Statements</option>
          <option value="PAID">Settled Clearances</option>
          <option value="PENDING">Pending Processing</option>
          <option value="OVERDUE">Delinquent Arrears</option>
        </select>
        <button onClick={fetchInvoices} className="h-12 px-6 bg-black dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-widest rounded-xl">Execute Scan</button>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2rem] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 text-xs uppercase tracking-widest font-black text-zinc-400">
                <th className="p-6">Statement Reference</th>
                <th className="p-6">Issuance Date</th>
                <th className="p-6">Financial Volume</th>
                <th className="p-6">Status Registry</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-sm font-medium">
              {invoicesList.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-zinc-500">No accounting events compiled.</td></tr>
              ) : (
                invoicesList.map(invoice => (
                  <tr key={invoice.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="p-6 font-mono text-xs font-bold">#INV-{invoice.id.slice(-6).toUpperCase()}</td>
                    <td className="p-6 text-zinc-500">{invoice.date}</td>
                    <td className="p-6 font-black text-zinc-900 dark:text-white">KSh {invoice.amount.toLocaleString()}</td>
                    <td className="p-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button onClick={() => handleViewDetails(invoice, `Statement Allocation Breakdown`)} className="p-2 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                        <EyeIcon className="w-4 h-4" /> View Layout
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-black dark:text-white pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        
        {/* Header Layout */}
        <div className="mb-12">
          <p className="uppercase text-xs tracking-[0.4em] text-zinc-400 font-black mb-3">Operational Terminal</p>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tight uppercase italic leading-[0.9]">Member Dashboard</h1>
        </div>

        {/* Dynamic Global Notifications */}
        {error && (
          <div className="p-5 mb-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            System Notice: {error}
          </div>
        )}

        {/* Premium Tab Navigation Architecture */}
        <div className="flex flex-wrap gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-10">
          {[
            { id: 'profile', label: 'Identity Matrix', icon: UserCircleIcon },
            { id: 'sessions', label: 'Coaching Intervals', icon: CalendarDaysIcon },
            { id: 'plans', label: 'Workout Regimen', icon: DocumentTextIcon },
            { id: 'invoices', label: 'Financial Ledger', icon: CreditCardIcon },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`h-12 px-6 rounded-xl flex items-center gap-3 text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/10'
                  : 'text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Segment Output Rendering Container */}
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 z-10 bg-white/60 dark:bg-[#050505]/60 backdrop-blur-[2px] flex items-center justify-center min-h-[300px]">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <div className="min-h-[300px]">
            {activeTab === 'profile' && renderProfileSection()}
            {activeTab === 'sessions' && renderSessionsSection()}
            {activeTab === 'plans' && renderPlansSection()}
            {activeTab === 'invoices' && renderInvoicesSection()}
          </div>
        </div>
      </div>

      {/* Global Inspectors/Information Modals */}
      <AnimatePresence>
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={viewModalTitle}>
          {viewedItem && (
            <div className="space-y-6 font-medium text-sm text-zinc-600 dark:text-zinc-400">
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 space-y-3">
                {Object.entries(viewedItem).map(([key, val]) => {
                  if (typeof val === 'object' || key === 'id' || key === 'memberId') return null;
                  return (
                    <div key={key} className="flex justify-between items-start gap-4 py-1.5 border-b border-zinc-100/50 dark:border-zinc-800/30 last:border-0">
                      <span className="text-xs uppercase font-black text-zinc-400 tracking-wider">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-black dark:text-zinc-200 font-bold text-right max-w-[65%] break-words">{String(val)}</span>
                    </div>
                  );
                })}
              </div>
              {viewedItem.items && (
                <div>
                  <h4 className="text-xs uppercase font-black tracking-widest text-zinc-400 mb-3">Allocated Allocation Items</h4>
                  <ul className="space-y-2">
                    {viewedItem.items.map((entry: string, i: number) => (
                      <li key={i} className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 text-black dark:text-white font-bold flex items-center gap-3">
                        <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" /> {entry}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {viewedItem.notes && (
                <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                  <h4 className="text-xs uppercase font-black tracking-widest text-orange-500 mb-2">Internal Strategist Notation</h4>
                  <p className="text-zinc-500 dark:text-zinc-400 italic leading-relaxed">{viewedItem.notes}</p>
                </div>
              )}
              <div className="pt-4">
                <button type="button" onClick={() => setIsViewModalOpen(false)} className="w-full h-12 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-black dark:text-white text-xs font-black uppercase tracking-widest rounded-xl transition-colors">
                  Dismiss Overlay Panel
                </button>
              </div>
            </div>
          )}
        </Modal>
      </AnimatePresence>
    </div>
  );
}