'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  WalletIcon,
  ArrowPathIcon,
  CheckIcon,
  DocumentTextIcon,
  TagIcon,
  BriefcaseIcon,
  FireIcon,
  SparklesIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

// const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/* -------------------------------------------------------------------------- */
/* TYPES                                    */
/* -------------------------------------------------------------------------- */

export type ClientStatus = 'ACTIVE' | 'EXPIRED' | 'FROZEN' | 'PENDING';
export type ConsumerType = 'lead' | 'buyer' | 'hybrid';
export type ConsumerStage = 'new' | 'contacted' | 'qualified' | 'negotiation' | 'converted' | 'lost';
export type ConsumerStatus = 'active' | 'suspended' | 'archived';

export type ConsumerProfile = {
  id: string;
  userId: string;
  loginCode?: string;
  companyId?: string;
  
  // Nested from Prisma include
  user: {
    name: string;
    email: string;
    phone?: string;
    image?: string;
  };

  bio?: string;
  type: ConsumerType;
  stage: ConsumerStage;
  source?: string;
  assignedAgent?: string;
  interest: string[];
  
  // Real Estate / Vehicle Intelligence
  preferredTypes: string[];
  budgetRange?: string;
  budgetMin?: number;
  budgetMax?: number;

  // Buyer metrics
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastPurchaseAt?: string;

  // System tracking
  activityScore: number;
  lastActivity?: string;
  lastLogin?: string;

  tags: string[];
  notes?: string;
  status: ConsumerStatus;
  
  membershipType?: string;
  membershipStatus: ClientStatus;
  joinDate?: string;
  photoUrl?: string;
  inquiryCount?: number;
  dealStatus?: string;
};

/* -------------------------------------------------------------------------- */
/* UI HELPERS                                   */
/* -------------------------------------------------------------------------- */

const getStatusStyles = (status: ClientStatus) => {
  switch (status) {
    case 'ACTIVE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'EXPIRED': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    case 'FROZEN': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'PENDING': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
};

const getStageStyles = (stage: ConsumerStage) => {
  switch (stage) {
    case 'converted': return 'bg-emerald-500 text-white';
    case 'negotiation': return 'bg-indigo-500 text-white';
    case 'qualified': return 'bg-purple-500 text-white';
    case 'contacted': return 'bg-sky-500 text-white';
    case 'new': return 'bg-blue-600 text-white';
    case 'lost': return 'bg-slate-500 text-white';
  }
};

/* -------------------------------------------------------------------------- */
/* CONSUMER CARD                                */
/* -------------------------------------------------------------------------- */

const ConsumerCard = ({
  consumer,
  onEdit,
  onDelete,
}: {
  consumer: ConsumerProfile;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  return (
    <div className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:border-indigo-500/50 hover:shadow-indigo-500/5 flex flex-col justify-between overflow-hidden">
      {/* Background Decorative Gradient Radial Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none transition-all group-hover:bg-indigo-500/10" />

      <div>
        {/* Top Header Group */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {consumer.photoUrl || consumer.user.image ? (
              <img 
                src={consumer.photoUrl || consumer.user.image} 
                alt={consumer.user.name} 
                className="h-14 w-14 rounded-xl object-cover ring-2 ring-slate-800 group-hover:ring-indigo-500/30 transition-all"
              />
            ) : (
              <div className="h-14 w-14 text-indigo-400 bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center rounded-xl shadow-inner">
                <UserIcon className="h-6 w-6" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-100 text-lg tracking-tight group-hover:text-white transition-colors">{consumer.user.name}</h3>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getStatusStyles(consumer.membershipStatus)}`}>
                  {consumer.membershipStatus}
                </span>
              </div>
              <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
                <EnvelopeIcon className="h-3.5 w-3.5 text-slate-500" /> {consumer.user.email}
              </p>
            </div>
          </div>

          {/* Activity Score Ring Badge */}
          <div className="flex flex-col items-center">
            <div className={`p-1.5 rounded-lg flex items-center gap-1 text-xs font-bold ${
              consumer.activityScore > 70 ? 'bg-orange-500/10 text-orange-400' : 'bg-slate-800 text-slate-400'
            }`}>
              <FireIcon className="h-4 w-4" />
              <span>{consumer.activityScore}</span>
            </div>
          </div>
        </div>

        {/* Bio / Meta Info Snippet */}
        {consumer.bio && (
          <p className="text-xs text-slate-400 bg-slate-950/40 border border-slate-800/60 rounded-xl p-3 mt-4 italic line-clamp-2">
            "{consumer.bio}"
          </p>
        )}

        {/* Category Classifications Pills */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          <span className="text-[11px] font-medium px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700/50 uppercase tracking-wider">
            {consumer.type}
          </span>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg uppercase tracking-wider ${getStageStyles(consumer.stage)}`}>
            {consumer.stage}
          </span>
          {consumer.membershipType && (
            <span className="text-[11px] font-medium px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">
              👑 {consumer.membershipType}
            </span>
          )}
        </div>

        {/* Commercial Insights Intelligence Group */}
        <div className="mt-5 grid grid-cols-2 gap-3 bg-slate-950/30 border border-slate-800/80 rounded-xl p-3.5">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Deal Intent</span>
            <p className="text-sm text-slate-200 font-semibold flex items-center gap-1">
              <WalletIcon className="h-4 w-4 text-slate-400" />
              {consumer.budgetRange || (consumer.totalSpent > 0 ? `KES ${consumer.totalSpent.toLocaleString()}` : 'No Budget Set')}
            </p>
          </div>
          <div className="space-y-1 border-l border-slate-800 pl-3">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Preference</span>
            <p className="text-sm text-slate-200 font-medium truncate">
              {consumer.preferredTypes.length > 0 ? consumer.preferredTypes.join(', ') : 'Not Configured'}
            </p>
          </div>
        </div>

        {/* Additional Commercial Stats Counter */}
        <div className="mt-4 space-y-1.5 text-xs text-slate-400 pl-1">
          <div className="flex justify-between">
            <span className="flex items-center gap-1.5 text-slate-500"><ClipboardDocumentListIcon className="h-3.5 w-3.5" /> Order Pipeline:</span>
            <span className="font-medium text-slate-300">{consumer.totalOrders} items / {consumer.inquiryCount || 0} Inquiries</span>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center gap-1.5 text-slate-500"><CalendarDaysIcon className="h-3.5 w-3.5" /> Last Activity Connection:</span>
            <span className="font-medium text-slate-300">{consumer.lastActivity ? new Date(consumer.lastActivity).toLocaleDateString() : 'Never'}</span>
          </div>
        </div>

        {/* Dynamic Tags Engine Grid */}
        {consumer.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4 pt-3 border-t border-slate-800/60">
            {consumer.tags.map((tag, index) => (
              <span key={index} className="text-[10px] px-2 py-0.5 bg-slate-950 text-slate-400 border border-slate-800 rounded flex items-center gap-1">
                <TagIcon className="h-2.5 w-2.5 text-slate-600" /> {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Action Controls Row */}
      <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-slate-800/80">
        <button
          onClick={onEdit}
          className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-indigo-600 hover:text-white border border-slate-700/60 text-slate-300 rounded-xl transition-all duration-200 flex items-center gap-1"
        >
          <PencilSquareIcon className="h-3.5 w-3.5" /> Edit Profile
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-rose-600/20 hover:border-rose-500/40 hover:text-rose-400 border border-slate-700/60 text-slate-400 rounded-xl transition-all duration-200 flex items-center gap-1"
        >
          <TrashIcon className="h-3.5 w-3.5" /> Remove
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* CREATE / UPDATE SLIDE-OVER MODAL                  */
/* -------------------------------------------------------------------------- */

const AddEditModal = ({ open, onClose, consumer, onSave, loading }: any) => {
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (consumer && consumer.id) {
      setForm({
        ...consumer,
        name: consumer.user?.name || '',
        email: consumer.user?.email || '',
        phone: consumer.user?.phone || '',
      });
    } else {
      setForm({
        type: 'lead',
        stage: 'new',
        status: 'active',
        membershipStatus: 'PENDING',
        totalOrders: 0,
        totalSpent: 0,
        activityScore: 40,
        interest: [],
        preferredTypes: [],
        tags: [],
        budgetRange: '',
      });
    }
  }, [consumer, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 transition-colors">
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-indigo-400" />
          {consumer?.id ? 'Modify Enterprise Profile' : 'Register New Consumer Profile'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Main User Identity Account Blocks */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Legal Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Brenden Odhiambo"
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Primary Communication Email</label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  required
                  type="email"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="brenden@salesmanpro.io"
                  value={form.email || ''}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mobile Contact Vector</label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="+254 700 000000"
                  value={form.phone || ''}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Avatar Image Web Address URL</label>
              <input
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="https://images.unsplash.com/..."
                value={form.photoUrl || ''}
                onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
              />
            </div>
          </div>

          {/* CRM Internal Workflow Classification Flags */}
          <div className="grid grid-cols-3 gap-4 bg-slate-950/40 p-4 border border-slate-800 rounded-xl">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">CRM Core Group</label>
              <select
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                value={form.type || 'lead'}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="lead">Lead Intelligence</option>
                <option value="buyer">Direct Buyer</option>
                <option value="hybrid">Hybrid Relationship</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Lifecycle Pipeline Stage</label>
              <select
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                value={form.stage || 'new'}
                onChange={(e) => setForm({ ...form, stage: e.target.value })}
              >
                <option value="new">New Opportunity</option>
                <option value="contacted">In Communication</option>
                <option value="qualified">Qualified Verified</option>
                <option value="negotiation">Active Negotiation</option>
                <option value="converted">Closed Won / Converted</option>
                <option value="lost">Closed Lost</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Membership State</label>
              <select
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                value={form.membershipStatus || 'PENDING'}
                onChange={(e) => setForm({ ...form, membershipStatus: e.target.value })}
              >
                <option value="PENDING">Pending Setup</option>
                <option value="ACTIVE">Active Account</option>
                <option value="FROZEN">Account Frozen</option>
                <option value="EXPIRED">Terminated / Expired</option>
              </select>
            </div>
          </div>

          {/* Core Textareas */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Biography Note</label>
            <div className="relative">
              <DocumentTextIcon className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <textarea
                rows={2}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="Brief corporate status metadata bio points..."
                value={form.bio || ''}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>
          </div>

          {/* Segment Targeting Requirements */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Target Scope Assets Preference (Comma Separated)</label>
              <input
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="Apartment, Townhouse, Commercial Warehouse"
                value={form.preferredTypes ? form.preferredTypes.join(', ') : ''}
                onChange={(e) => setForm({ ...form, preferredTypes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Verified Capital Resource Budget Range</label>
              <input
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="e.g., 10M - 25M KES"
                value={form.budgetRange || ''}
                onChange={(e) => setForm({ ...form, budgetRange: e.target.value })}
              />
            </div>
          </div>

          {/* CRM Internal Log Text block */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Internal System Timeline Log Notes</label>
            <textarea
              rows={2}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="Private transactional timeline records..."
              value={form.notes || ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          {/* Global Action Grid Submit Block */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 text-sm transition-colors"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all"
            >
              {loading ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CheckIcon className="h-4 w-4" />}
              Save Client Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* MAIN DASHBOARD                               */
/* -------------------------------------------------------------------------- */

export default function ConsumersClientPage({ adminSlug, initialConsumers }: { adminSlug: string; initialConsumers: any[] }) {
  const [consumers, setConsumers] = useState<ConsumerProfile[]>(initialConsumers || []);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'all' | 'lead' | 'buyer' | 'hybrid'>('all');
  const [editing, setEditing] = useState<Partial<ConsumerProfile> | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredConsumers = useMemo(() => {
    return consumers.filter((c) => {
      const targetString = `${c.user?.name || ''} ${c.user?.email || ''} ${c.user?.phone || ''}`.toLowerCase();
      const matchSearch = targetString.includes(search.toLowerCase());
      const matchView = view === 'all' ? true : c.type === view;
      return matchSearch && matchView;
    });
  }, [consumers, search, view]);

  const handleSaveConsumer = async (formData: any) => {
    setLoading(true);
    const isEdit = !!editing?.id;
    
    try {
      const url = isEdit 
        ? `/api/admin/consumers/${editing.id}` 
        : `/api/admin/consumers?companyId=${adminSlug}`;
        
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, companyId: adminSlug }),
      });
      
      const resData = await response.json();
      
      if (response.ok && resData.success) {
        // Build formatted consumer matching schema payloads
        const savedItem = resData.data;
        if (isEdit) {
          setConsumers(prev => prev.map(c => c.id === savedItem.id ? savedItem : c));
          toast.success('Consumer portfolio ledger updated successfully.');
        } else {
          setConsumers(prev => [savedItem, ...prev]);
          toast.success('New platform customer profiling deployed.');
        }
        setEditing(null);
      } else {
        toast.error(resData.message || 'Verification rejected application payload.');
      }
    } catch (err) {
      toast.error('Connection timeout or protocol structural drop.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConsumer = async (id: string) => {
    if (!window.confirm("Confirm permanent removal from directory database registers?")) return;
    
    try {
      const response = await fetch(`/api/admin/consumers/${id}`, { method: 'DELETE' });
      const resData = await response.json();
      
      if (response.ok && resData.success) {
        setConsumers(prev => prev.filter(c => c.id !== id));
        toast.success('Portfolio database reference wiped.');
      } else {
        toast.error(resData.message || 'Wipe operation dropped by target node.');
      }
    } catch (err) {
      toast.error('Could not complete pipeline cleanup cycle.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-8 selection:bg-indigo-500/30">
      <Toaster position="top-right" toastOptions={{ style: { background: '#0f172a', color: '#f8fafc', border: '1px solid #1e293b' } }} />

      {/* Modern Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-indigo-400 bg-clip-text text-transparent">
            Consumer Portfolio Intelligence
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your African digital commerce ecosystem pipeline, analyze intent metrics, and monitor lifecycles.
          </p>
        </div>

        <button
          onClick={() => setEditing({})}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        >
          <PlusIcon className="h-4 w-4 stroke-[3]" /> Add New Consumer
        </button>
      </div>

      {/* Controls Container (Search + Filter Tabs) */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Modern Unified Search Input Wrapper */}
        <div className="relative w-full md:w-96">
          <MagnifyingGlassIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
          <input
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="Search credentials, designations, arrays..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Tab Selection Filter Engine Row */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full md:w-auto overflow-x-auto">
          {(['all', 'lead', 'buyer', 'hybrid'] as const).map((tabView) => (
            <button
              key={tabView}
              onClick={() => setView(tabView)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 shrink-0 ${
                view === tabView
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {tabView}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Display Render Area */}
      {filteredConsumers.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConsumers.map((c) => (
            <ConsumerCard
              key={c.id}
              consumer={c}
              onEdit={() => setEditing(c)}
              onDelete={() => handleDeleteConsumer(c.id)}
            />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-slate-800 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
          <FunnelIcon className="h-10 w-10 text-slate-600 mb-3" />
          <h3 className="font-semibold text-slate-300 text-base">No Matching Pipelines Found</h3>
          <p className="text-xs text-slate-500 max-w-xs mt-1">
            Try adjusting your search query, matching tabs parameters or register a new customer entry profile.
          </p>
        </div>
      )}

      {/* Slide Modal Component Block */}
      <AddEditModal
        open={!!editing}
        consumer={editing}
        onClose={() => setEditing(null)}
        onSave={handleSaveConsumer}
        loading={loading}
      />
    </div>
  );
}