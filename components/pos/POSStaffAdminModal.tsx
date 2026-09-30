'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  XMarkIcon,
  UserGroupIcon,
  KeyIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  PowerIcon,
} from '@heroicons/react/24/outline';

interface POSStaffAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
}

export default function POSStaffAdminModal({
  isOpen,
  onClose,
  companyId,
}: POSStaffAdminModalProps) {
  const [activeTab, setActiveTab] = useState<'staff' | 'sessions'>('staff');
  const [staffList, setStaffList] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit staff code state
  const [editingStaff, setEditingStaff] = useState<any | null>(null);
  const [newCode, setNewCode] = useState('');
  const [posRole, setPosRole] = useState('CASHIER');
  const [isPosActive, setIsPosActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchStaff = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/pos/staff?companyId=${encodeURIComponent(companyId)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setStaffList(data.data || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch staff:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const fetchSessions = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/pos/staff?companyId=${encodeURIComponent(companyId)}&view=sessions`);
      const data = await res.json();
      if (res.ok && data.success) {
        setSessions(data.data || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'staff') fetchStaff();
      else fetchSessions();
    }
  }, [isOpen, activeTab, fetchStaff, fetchSessions]);

  const handleSaveStaffCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/pos/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          staffProfileId: editingStaff.id,
          code: newCode.trim() || undefined,
          posRole,
          isPosActive,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Failed to update code');
      }

      setSuccessMsg(`POS credentials for ${editingStaff.name} updated successfully!`);
      setEditingStaff(null);
      setNewCode('');
      fetchStaff();
    } catch (err: any) {
      setError(err.message || 'Error updating staff code');
    } finally {
      setSaving(false);
    }
  };

  const handleForceCloseSession = async (sessionId: string, operatorName: string) => {
    if (!window.confirm(`Force terminate active session for ${operatorName}?`)) return;

    try {
      const res = await fetch('/api/pos/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          action: 'FORCE_CLOSE',
          sessionId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        fetchSessions();
      }
    } catch (err) {
      console.error('Failed to terminate session:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-md">
              <ShieldCheckIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Staff POS Credentials & Accountability
              </h3>
              <p className="text-xs text-slate-500">
                Generate secure login PINs, manage operator roles, and audit terminals
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-800/30">
          <button
            type="button"
            onClick={() => setActiveTab('staff')}
            className={`py-3 px-4 text-xs font-black border-b-2 transition ${
              activeTab === 'staff'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Staff Directory & PIN Codes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sessions')}
            className={`py-3 px-4 text-xs font-black border-b-2 transition ${
              activeTab === 'sessions'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Active Terminal Sessions
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 custom-scroll space-y-4">
          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2">
              <ExclamationCircleIcon className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'staff' ? (
            <div className="space-y-3">
              {loading ? (
                <p className="text-center py-8 text-sm text-slate-500">Loading staff profiles...</p>
              ) : staffList.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No staff members registered for this store.
                </div>
              ) : (
                staffList.map((st) => (
                  <div
                    key={st.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/70 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {st.name}
                        </span>
                        <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 text-[10px] font-black rounded-lg uppercase">
                          {st.posRole || 'CASHIER'}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-lg ${
                            st.isPosActive
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {st.isPosActive ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                        <span>{st.jobTitle || st.department}</span>
                        <span>•</span>
                        <span>{st.email}</span>
                        <span>•</span>
                        <span>PIN: {st.hasCode ? '•••• Code Configured' : 'None Set'}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingStaff(st);
                        setPosRole(st.posRole || 'CASHIER');
                        setIsPosActive(st.isPosActive ?? true);
                        setNewCode('');
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shrink-0 active:scale-95"
                    >
                      {st.hasCode ? 'Reset / Edit PIN' : 'Set POS PIN'}
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {loading ? (
                <p className="text-center py-8 text-sm text-slate-500">Loading active sessions...</p>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No active operator sessions on any terminals.
                </div>
              ) : (
                sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/70 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {sess.operator.name}
                        </span>
                        <span className="font-mono text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-md font-bold">
                          Terminal {sess.terminalId}
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-lg">
                          LIVE SHIFT
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Opened: {new Date(sess.openedAt).toLocaleTimeString()} | Float: {sess.openingBalance} | Total Sales: {sess.totalSales} ({sess.totalTransactions} transactions)
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleForceCloseSession(sess.id, sess.operator.name)}
                      className="px-3.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <PowerIcon className="w-4 h-4" />
                      <span>Force Logout</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Modal / Form for Editing Staff PIN */}
          {editingStaff && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-4">
              <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 dark:text-white text-base">
                    Configure POS Access: {editingStaff.name}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setEditingStaff(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveStaffCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      New 4-8 Digit PIN Code
                    </label>
                    <input
                      type="password"
                      maxLength={8}
                      placeholder={editingStaff.hasCode ? 'Leave blank to keep existing' : 'Enter new numeric PIN'}
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-base font-bold tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Securely hashed using SHA-256 before storage.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      POS Operational Role
                    </label>
                    <select
                      value={posRole}
                      onChange={(e) => setPosRole(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="CASHIER">Cashier (Sales & Orders)</option>
                      <option value="WAITER">Waiter / Server (Tables & Kitchen Orders)</option>
                      <option value="BARTENDER">Bartender (Drink orders)</option>
                      <option value="MANAGER">Manager (Discounts, Voids, Merges, Reports)</option>
                      <option value="ADMIN">Admin (Full POS System Authority)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="checkbox"
                      id="posActiveCheck"
                      checked={isPosActive}
                      onChange={(e) => setIsPosActive(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="posActiveCheck" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Enable POS Terminal Login for this Staff Member
                    </label>
                  </div>

                  <div className="pt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingStaff(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Credentials'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
