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
  XMarkIcon,
  SunIcon,
  MoonIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
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
  
  preferredTypes: string[];
  budgetRange?: string;
  budgetMin?: number;
  budgetMax?: number;

  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastPurchaseAt?: string;

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
/* STYLING HELPERS                                                            */
/* -------------------------------------------------------------------------- */

const getStatusBadge = (status: ClientStatus) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    case 'EXPIRED':
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
    case 'FROZEN':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
    case 'PENDING':
      return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30';
    default:
      return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30';
  }
};

const getStageBadge = (stage: ConsumerStage) => {
  switch (stage) {
    case 'converted':
      return 'bg-emerald-600 text-white dark:bg-emerald-500';
    case 'negotiation':
      return 'bg-indigo-600 text-white dark:bg-indigo-500';
    case 'qualified':
      return 'bg-purple-600 text-white dark:bg-purple-500';
    case 'contacted':
      return 'bg-sky-600 text-white dark:bg-sky-500';
    case 'new':
      return 'bg-blue-600 text-white';
    case 'lost':
      return 'bg-slate-500 text-white';
  }
};

/* -------------------------------------------------------------------------- */
/* CONSUMER CARD COMPONENT (GRID VIEW)                                        */
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
    <div className="group relative bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl dark:hover:shadow-indigo-500/5 transition-all duration-300 hover:border-indigo-400 dark:hover:border-indigo-500/40 flex flex-col justify-between overflow-hidden backdrop-blur-md">
      {/* Background Radial Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none transition-all group-hover:bg-indigo-500/20" />

      <div>
        {/* Header Avatar & Identity */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {consumer.photoUrl || consumer.user.image ? (
              <img 
                src={consumer.photoUrl || consumer.user.image} 
                alt={consumer.user.name} 
                className="h-14 w-14 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 group-hover:ring-indigo-500/40 transition-all flex-shrink-0"
              />
            ) : (
              <div className="h-14 w-14 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center rounded-2xl flex-shrink-0 shadow-inner">
                <UserIcon className="h-7 w-7" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg tracking-tight truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {consumer.user.name}
                </h3>
                <span className={`text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadge(consumer.membershipStatus)}`}>
                  {consumer.membershipStatus}
                </span>
              </div>
              <a 
                href={`mailto:${consumer.user.email}`}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 mt-1 truncate"
              >
                <EnvelopeIcon className="h-3.5 w-3.5 flex-shrink-0 text-slate-400 dark:text-slate-500" />
                <span className="truncate">{consumer.user.email}</span>
              </a>
            </div>
          </div>

          {/* Activity Score */}
          <div className="flex-shrink-0">
            <div 
              title="Engagement Score"
              className={`p-1.5 px-2.5 rounded-xl flex items-center gap-1 text-xs font-black shadow-xs ${
                consumer.activityScore > 70 
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <FireIcon className="h-4 w-4" />
              <span>{consumer.activityScore}</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {consumer.bio && (
          <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-3 mt-4 italic line-clamp-2">
            "{consumer.bio}"
          </p>
        )}

        {/* Stage & Type Category Pills */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg uppercase tracking-wider border border-slate-200/60 dark:border-slate-700/50">
            {consumer.type}
          </span>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${getStageBadge(consumer.stage)}`}>
            {consumer.stage}
          </span>
          {consumer.membershipType && (
            <span className="text-[10px] font-bold px-2.5 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 rounded-lg">
              👑 {consumer.membershipType}
            </span>
          )}
        </div>

        {/* Deal Intelligence Group */}
        <div className="mt-4 grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3.5">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-extrabold block">
              Deal Capacity
            </span>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1 truncate">
              <WalletIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <span className="truncate">
                {consumer.budgetRange || (consumer.totalSpent > 0 ? `$${consumer.totalSpent.toLocaleString()}` : 'Unset')}
              </span>
            </p>
          </div>
          <div className="space-y-0.5 border-l border-slate-200 dark:border-slate-800 pl-3">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-extrabold block">
              Preference
            </span>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-semibold truncate">
              {consumer.preferredTypes.length > 0 ? consumer.preferredTypes.join(', ') : 'None'}
            </p>
          </div>
        </div>

        {/* Activity Counter Stats */}
        <div className="mt-4 space-y-1 text-xs text-slate-500 dark:text-slate-400 px-1">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5"><ClipboardDocumentListIcon className="h-3.5 w-3.5 text-slate-400" /> Pipeline Orders:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{consumer.totalOrders} Orders / {consumer.inquiryCount || 0} Inquiries</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5"><CalendarDaysIcon className="h-3.5 w-3.5 text-slate-400" /> Last Active:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{consumer.lastActivity ? new Date(consumer.lastActivity).toLocaleDateString() : 'Never'}</span>
          </div>
        </div>

        {/* Tags */}
        {consumer.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            {consumer.tags.map((tag, index) => (
              <span key={index} className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-md flex items-center gap-1">
                <TagIcon className="h-2.5 w-2.5 text-slate-400" /> {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <button
          onClick={onEdit}
          className="px-3.5 py-2 text-xs font-bold bg-slate-100 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-200 rounded-xl transition-all duration-200 flex items-center gap-1.5 active:scale-95"
        >
          <PencilSquareIcon className="h-3.5 w-3.5" /> Edit
        </button>
        <button
          onClick={onDelete}
          className="px-3.5 py-2 text-xs font-bold bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white dark:bg-slate-800 dark:hover:bg-rose-600 dark:text-rose-400 rounded-xl transition-all duration-200 flex items-center gap-1.5 active:scale-95"
        >
          <TrashIcon className="h-3.5 w-3.5" /> Remove
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* CONSUMER ROW COMPONENT (LIST VIEW)                                         */
/* -------------------------------------------------------------------------- */

const ConsumerListItem = ({
  consumer,
  onEdit,
  onDelete,
}: {
  consumer: ConsumerProfile;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  return (
    <div className="group bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 transition-all duration-200 hover:border-indigo-400 dark:hover:border-indigo-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
      <div className="flex items-center gap-4 min-w-0">
        {consumer.photoUrl || consumer.user.image ? (
          <img 
            src={consumer.photoUrl || consumer.user.image} 
            alt={consumer.user.name} 
            className="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-800 flex-shrink-0"
          />
        ) : (
          <div className="h-12 w-12 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center rounded-xl flex-shrink-0">
            <UserIcon className="h-6 w-6" />
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base truncate">
              {consumer.user.name}
            </h3>
            <span className={`text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadge(consumer.membershipStatus)}`}>
              {consumer.membershipStatus}
            </span>
            <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-md ${getStageBadge(consumer.stage)}`}>
              {consumer.stage}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 mt-1 flex-wrap">
            <span className="flex items-center gap-1"><EnvelopeIcon className="h-3.5 w-3.5 text-slate-400" /> {consumer.user.email}</span>
            {consumer.user.phone && <span className="flex items-center gap-1"><PhoneIcon className="h-3.5 w-3.5 text-slate-400" /> {consumer.user.phone}</span>}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800">
        <div className="text-left md:text-right">
          <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 block">Deal Capacity</span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {consumer.budgetRange || (consumer.totalSpent > 0 ? `$${consumer.totalSpent.toLocaleString()}` : 'Unset')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 bg-slate-100 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 dark:hover:bg-indigo-600 text-slate-600 dark:text-slate-300 rounded-xl transition-all"
            title="Edit Consumer"
          >
            <PencilSquareIcon className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white dark:bg-slate-800 dark:hover:bg-rose-600 dark:text-rose-400 rounded-xl transition-all"
            title="Remove Consumer"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* CREATE / UPDATE MODAL                                                      */
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 transition-colors p-1"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-200 dark:border-indigo-800">
            <SparklesIcon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              {consumer?.id ? 'Edit Consumer Profile' : 'Register New Consumer'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update client parameters and classification attributes
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Identity Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                Full Legal Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-slate-100 text-sm outline-none focus:border-indigo-500 transition-all font-medium"
                  placeholder="Brenden Odhiambo"
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                Email Address
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  required
                  type="email"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-slate-100 text-sm outline-none focus:border-indigo-500 transition-all font-medium"
                  placeholder="brenden@salesmanpro.io"
                  value={form.email || ''}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                Phone Number
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-slate-100 text-sm outline-none focus:border-indigo-500 transition-all font-medium"
                  placeholder="+254 700 000000"
                  value={form.phone || ''}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                Photo URL
              </label>
              <input
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-slate-100 text-sm outline-none focus:border-indigo-500 transition-all font-medium"
                placeholder="https://images.unsplash.com/..."
                value={form.photoUrl || ''}
                onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
              />
            </div>
          </div>

          {/* CRM Internal Workflow Flags */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-950/60 p-4 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                Core Type
              </label>
              <select
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 font-bold outline-none focus:border-indigo-500"
                value={form.type || 'lead'}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="lead">Lead</option>
                <option value="buyer">Direct Buyer</option>
                <option value="hybrid">Hybrid Relationship</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                Pipeline Stage
              </label>
              <select
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 font-bold outline-none focus:border-indigo-500"
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
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                Membership State
              </label>
              <select
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 font-bold outline-none focus:border-indigo-500"
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

          {/* Bio */}
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
              Biography / Brief
            </label>
            <div className="relative">
              <DocumentTextIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <textarea
                rows={2}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-slate-100 text-sm outline-none focus:border-indigo-500 transition-all font-medium"
                placeholder="Brief summary notes..."
                value={form.bio || ''}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>
          </div>

          {/* Preferences & Budget */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                Preferred Types (Comma Separated)
              </label>
              <input
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-slate-100 text-sm outline-none focus:border-indigo-500 transition-all font-medium"
                placeholder="Apartment, Townhouse, Warehouse"
                value={form.preferredTypes ? form.preferredTypes.join(', ') : ''}
                onChange={(e) => setForm({ ...form, preferredTypes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                Capital / Budget Range
              </label>
              <input
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-slate-100 text-sm outline-none focus:border-indigo-500 transition-all font-medium"
                placeholder="e.g. $50,000 - $120,000"
                value={form.budgetRange || ''}
                onChange={(e) => setForm({ ...form, budgetRange: e.target.value })}
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md disabled:opacity-50 transition-all active:scale-95"
            >
              {loading ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CheckIcon className="h-4 w-4" />}
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* MAIN DASHBOARD PAGE                                                        */
/* -------------------------------------------------------------------------- */

export default function ConsumersClientPage({ 
  adminSlug, 
  initialConsumers 
}: { 
  adminSlug: string; 
  initialConsumers: any[] 
}) {
  const [consumers, setConsumers] = useState<ConsumerProfile[]>(initialConsumers || []);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'all' | 'lead' | 'buyer' | 'hybrid'>('all');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [editing, setEditing] = useState<Partial<ConsumerProfile> | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('consumers-theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('consumers-theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  // Dynamic Metrics Analytics
  const stats = useMemo(() => {
    const total = consumers.length;
    const leads = consumers.filter(c => c.type === 'lead').length;
    const buyers = consumers.filter(c => c.type === 'buyer').length;
    const totalSpent = consumers.reduce((acc, curr) => acc + (curr.totalSpent || 0), 0);
    const avgScore = total > 0 ? Math.round(consumers.reduce((acc, curr) => acc + (curr.activityScore || 0), 0) / total) : 0;
    
    return { total, leads, buyers, totalSpent, avgScore };
  }, [consumers]);

  // Filter Logic
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
        const savedItem = resData.data;
        if (isEdit) {
          setConsumers(prev => prev.map(c => c.id === savedItem.id ? savedItem : c));
          toast.success('Consumer profile updated.');
        } else {
          setConsumers(prev => [savedItem, ...prev]);
          toast.success('New consumer registered.');
        }
        setEditing(null);
      } else {
        toast.error(resData.message || 'Operation failed.');
      }
    } catch {
      toast.error('Network connectivity issue.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConsumer = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this consumer record?")) return;
    
    try {
      const response = await fetch(`/api/admin/consumers/${id}`, { method: 'DELETE' });
      const resData = await response.json();
      
      if (response.ok && resData.success) {
        setConsumers(prev => prev.filter(c => c.id !== id));
        toast.success('Consumer removed from directory.');
      } else {
        toast.error(resData.message || 'Deletion failed.');
      }
    } catch {
      toast.error('Could not complete request.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-10 font-sans transition-colors duration-500 relative overflow-x-hidden">
      <Toaster position="top-right" />

      {/* Background Ambient Lights */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-1/3 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-500/5 blur-[160px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Navigation & Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-indigo-600 dark:text-indigo-400 text-[11px] font-black uppercase tracking-[0.2em]">
                Consumer Portfolio Management
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Client <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Intelligence.</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
              Monitor customer lifecycles, lead conversions, deal capacity, and engagements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              aria-label="Toggle visual theme"
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-indigo-500/30 text-slate-600 dark:text-slate-300 shadow-xs transition-all active:scale-95"
            >
              {mounted && theme === 'dark' ? (
                <SunIcon className="h-5 w-5 text-amber-400" />
              ) : (
                <MoonIcon className="h-5 w-5 text-indigo-600" />
              )}
            </button>

            {/* Add Consumer Button */}
            <button
              onClick={() => setEditing({})}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-md transition-all active:scale-95"
            >
              <PlusIcon className="h-4 w-4 stroke-[3]" />
              <span>Add Consumer</span>
            </button>
          </div>
        </header>

        {/* Dashboard Analytics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-xs backdrop-blur-md flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Clients</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{stats.total}</p>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <UserGroupIcon className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-xs backdrop-blur-md flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Active Leads</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{stats.leads}</p>
            </div>
            <div className="p-3 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-2xl">
              <ArrowTrendingUpIcon className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-xs backdrop-blur-md flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Direct Buyers</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{stats.buyers}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <BriefcaseIcon className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-xs backdrop-blur-md flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Avg. Score</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{stats.avgScore}</p>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl">
              <ChartBarIcon className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Search, Layout Switcher & Filter Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full md:w-96 group">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone..."
              className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-2xl py-3 pl-12 pr-10 text-sm outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-white shadow-xs"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl shadow-xs overflow-x-auto">
              {(['all', 'lead', 'buyer', 'hybrid'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setView(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    view === tab
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Layout Toggle (Grid / List) */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl shadow-xs">
              <button
                onClick={() => setLayoutMode('grid')}
                className={`p-2 rounded-xl transition-all ${
                  layoutMode === 'grid'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Grid View"
              >
                <Squares2X2Icon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setLayoutMode('list')}
                className={`p-2 rounded-xl transition-all ${
                  layoutMode === 'list'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="List View"
              >
                <ListBulletIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Consumers Grid/List Display */}
        {filteredConsumers.length > 0 ? (
          layoutMode === 'grid' ? (
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
            <div className="space-y-3">
              {filteredConsumers.map((c) => (
                <ConsumerListItem
                  key={c.id}
                  consumer={c}
                  onEdit={() => setEditing(c)}
                  onDelete={() => handleDeleteConsumer(c.id)}
                />
              ))}
            </div>
          )
        ) : (
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-16 flex flex-col items-center justify-center text-center bg-white/40 dark:bg-slate-900/20">
            <FunnelIcon className="h-10 w-10 text-slate-400 dark:text-slate-600 mb-3" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">No Consumer Profiles Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
              Try modifying your search filter, type selection, or add a new consumer record.
            </p>
          </div>
        )}

        {/* Modal Overlay */}
        <AddEditModal
          open={!!editing}
          consumer={editing}
          onClose={() => setEditing(null)}
          onSave={handleSaveConsumer}
          loading={loading}
        />

      </div>
    </main>
  );
}