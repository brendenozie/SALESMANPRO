'use client';

import React, { useState } from 'react';
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ComputerDesktopIcon,
  ClockIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  LockClosedIcon,
  DocumentChartBarIcon,
  ArrowPathIcon,
  WifiIcon,
  PrinterIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import type { POSOperatorInfo, POSSessionInfo } from '@/types/pos';
import POSShiftModal from './POSShiftModal';
import POSStaffAdminModal from './POSStaffAdminModal';
import POSHardwareSettingsModal from './POSHardwareSettingsModal';
import POSSyncCenterDrawer from './POSSyncCenterDrawer';

export interface POSSessionHeaderProps {
  companyId?: string;
  companyName?: string;
  operator: POSOperatorInfo | null;
  posSession: POSSessionInfo | null;
  onEndSession: () => void;
  onLockTerminal?: () => void;
  heldOrdersCount?: number;
  onOpenHeldOrders?: () => void;
  currencySymbol?: string;
  isOnline?: boolean;
  pendingSyncCount?: number;
  isSyncing?: boolean;
  onSyncOffline?: () => void;
}

export default function POSSessionHeader({
  companyId,
  companyName,
  operator,
  posSession,
  onEndSession,
  onLockTerminal,
  heldOrdersCount = 0,
  onOpenHeldOrders,
  currencySymbol = 'KES',
  isOnline = true,
  pendingSyncCount = 0,
  isSyncing = false,
  onSyncOffline,
}: POSSessionHeaderProps) {
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showStaffAdmin, setShowStaffAdmin] = useState(false);
  const [showHardwareModal, setShowHardwareModal] = useState(false);
  const [showSyncDrawer, setShowSyncDrawer] = useState(false);
  const [showMobileTools, setShowMobileTools] = useState(false);

  if (!operator || !posSession) return null;

  const isManagerOrAdmin =
    operator.role?.toUpperCase().includes('ADMIN') ||
    operator.role?.toUpperCase().includes('MANAGER') ||
    operator.jobTitle?.toUpperCase().includes('ADMIN') ||
    operator.jobTitle?.toUpperCase().includes('MANAGER') ||
    operator.permissions?.includes('POS_MANAGE_STAFF_CODES');

  const startTimeStr = posSession.openedAt
    ? new Date(posSession.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <>
      <div className="w-full bg-slate-900 text-white px-3 sm:px-4 py-2 flex items-center justify-between gap-2 text-xs border-b border-slate-800 shadow-inner shrink-0 relative z-30">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Store / Module Name */}
          {companyName && (
            <div className="hidden lg:flex items-center gap-1.5 font-bold text-slate-200 truncate">
              <span className="text-indigo-400">●</span>
              <span className="truncate">{companyName}</span>
            </div>
          )}

          {/* Operator Badge */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-800/90 py-1 px-2.5 sm:px-3 rounded-full border border-slate-700 shrink-0">
            <UserCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-slate-200 max-w-[100px] sm:max-w-[160px] truncate">{operator.name}</span>
            <span className="text-[10px] bg-indigo-600 text-white font-bold uppercase px-1.5 sm:px-2 py-0.5 rounded-full hidden xs:inline-block">
              {operator.jobTitle || operator.role}
            </span>
          </div>

          {/* Terminal Info */}
          <div className="hidden md:flex items-center gap-1 text-slate-400 shrink-0">
            <ComputerDesktopIcon className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-mono font-bold text-slate-300">{posSession.terminalId || 'T01'}</span>
          </div>

          {/* Session Time */}
          {startTimeStr && (
            <div className="hidden xl:flex items-center gap-1.5 text-slate-400 shrink-0">
              <ClockIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>Started:</span>
              <span className="font-semibold text-slate-300">{startTimeStr}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Offline / Online Network Status Indicator & Sync Center Trigger */}
          <div className="flex items-center">
            {!isOnline ? (
              <button
                type="button"
                onClick={() => setShowSyncDrawer(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition hover:bg-amber-500/30"
                title="POS is offline. Click to open Sync & Print Center."
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>OFFLINE {pendingSyncCount > 0 ? `(${pendingSyncCount})` : ''}</span>
              </button>
            ) : pendingSyncCount > 0 ? (
              <button
                type="button"
                onClick={() => setShowSyncDrawer(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[11px] font-bold transition hover:bg-indigo-500/30"
                title="Open Sync & Print Center"
              >
                <ArrowPathIcon className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync ({pendingSyncCount})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowSyncDrawer(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-[11px] text-emerald-400 font-medium transition"
                title="Open Sync & Print Center (Outbox, Reprint, Offline Expenses & Stock Movements)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="hidden sm:inline">Online &amp; Sync</span>
                <span className="sm:hidden">Sync</span>
              </button>
            )}
          </div>

          {/* Held Orders Badge / Button */}
          {onOpenHeldOrders && (
            <button
              type="button"
              onClick={onOpenHeldOrders}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg border transition text-xs font-bold ${
                heldOrdersCount > 0
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500 hover:text-white animate-pulse'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <ShoppingBagIcon className="w-3.5 h-3.5" />
              <span>Held {heldOrdersCount > 0 ? `(${heldOrdersCount})` : ''}</span>
            </button>
          )}

          {/* DESKTOP TOOLBAR (Hidden on mobile < md) */}
          <div className="hidden md:flex items-center gap-1.5">
            {/* Shift Details & Drawer Settlement */}
            <button
              type="button"
              onClick={() => setShowShiftModal(true)}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 transition font-semibold text-xs"
              title="Cash drawer count and shift settlement"
            >
              <BanknotesIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline">Drawer &amp; Shift</span>
            </button>

            {/* Quick X-Report Mid-Shift Reading */}
            <button
              type="button"
              onClick={() => setShowShiftModal(true)}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 transition font-semibold text-xs"
              title="Audit register & print interim X-Report"
            >
              <DocumentChartBarIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden lg:inline">X-Report</span>
            </button>

            {/* Open Customer-Facing Display */}
            <button
              type="button"
              onClick={() => {
                const url = '/pos/cfd';
                const win = window.open(url, 'SalesmanPro_CFD_Window', 'width=1280,height=800,menubar=no,toolbar=no,location=no,status=no');
                if (win) win.focus();
              }}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 transition font-semibold text-xs"
              title="Open Customer-Facing Display on second screen"
            >
              <ComputerDesktopIcon className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden lg:inline">CFD</span>
            </button>

            {/* Thermal Receipt Printers & Hardware */}
            {companyId && (
              <button
                type="button"
                onClick={() => setShowHardwareModal(true)}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 transition font-semibold text-xs"
                title="Thermal receipt printer configuration, cash drawer & hardware routing"
              >
                <PrinterIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden lg:inline">Hardware</span>
              </button>
            )}

            {/* Staff Code Administration (Admin/Manager only) */}
            {isManagerOrAdmin && companyId && (
              <button
                type="button"
                onClick={() => setShowStaffAdmin(true)}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 transition font-semibold text-xs"
                title="Manage staff POS login PINs"
              >
                <ShieldCheckIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden lg:inline">Staff PINs</span>
              </button>
            )}
          </div>

          {/* MOBILE QUICK TOOLS BUTTON (Visible on < md) */}
          <div className="md:hidden relative">
            <button
              type="button"
              onClick={() => setShowMobileTools((prev) => !prev)}
              className={`p-1.5 rounded-lg border transition ${
                showMobileTools
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title="Quick POS Tools"
            >
              <EllipsisVerticalIcon className="w-4 h-4" />
            </button>

            {/* Mobile Dropdown Menu */}
            {showMobileTools && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
                  onClick={() => setShowMobileTools(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1 animate-in fade-in zoom-in-95">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMobileTools(false);
                      setShowShiftModal(true);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-left font-semibold text-xs text-slate-200 transition"
                  >
                    <BanknotesIcon className="w-4 h-4 text-emerald-400" />
                    <span>Drawer &amp; Shift Settlement</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowMobileTools(false);
                      setShowShiftModal(true);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-left font-semibold text-xs text-slate-200 transition"
                  >
                    <DocumentChartBarIcon className="w-4 h-4 text-indigo-400" />
                    <span>Print X-Report</span>
                  </button>

                  {companyId && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMobileTools(false);
                        setShowHardwareModal(true);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-left font-semibold text-xs text-slate-200 transition"
                    >
                      <PrinterIcon className="w-4 h-4 text-cyan-400" />
                      <span>Printer &amp; Hardware Setup</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowMobileTools(false);
                      const url = '/pos/cfd';
                      const win = window.open(url, 'SalesmanPro_CFD_Window', 'width=1280,height=800,menubar=no,toolbar=no,location=no,status=no');
                      if (win) win.focus();
                    }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-left font-semibold text-xs text-slate-200 transition"
                  >
                    <ComputerDesktopIcon className="w-4 h-4 text-teal-400" />
                    <span>Customer Display (CFD)</span>
                  </button>

                  {isManagerOrAdmin && companyId && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMobileTools(false);
                        setShowStaffAdmin(true);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-left font-semibold text-xs text-slate-200 transition"
                    >
                      <ShieldCheckIcon className="w-4 h-4 text-indigo-400" />
                      <span>Manage Staff PINs</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Lock Terminal Button */}
          {onLockTerminal && (
            <button
              type="button"
              onClick={onLockTerminal}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-700 transition font-medium text-xs"
              title="Lock POS terminal"
            >
              <LockClosedIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock</span>
            </button>
          )}

          {/* End Session Button */}
          <button
            type="button"
            onClick={() => setShowShiftModal(true)}
            className="flex items-center gap-1 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white px-2.5 sm:px-3 py-1.5 rounded-lg border border-rose-500/40 transition active:scale-95 font-semibold text-xs"
            title="End shift and settle register"
          >
            <ArrowRightOnRectangleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">End Shift</span>
          </button>
        </div>
      </div>

      {/* Cash Shift Modal */}
      {showShiftModal && companyId && (
        <POSShiftModal
          isOpen={showShiftModal}
          onClose={() => setShowShiftModal(false)}
          posSession={posSession}
          operator={operator}
          companyId={companyId}
          currencySymbol={currencySymbol}
          onShiftClosed={onEndSession}
        />
      )}

      {/* Staff Admin Modal */}
      {showStaffAdmin && companyId && (
        <POSStaffAdminModal
          isOpen={showStaffAdmin}
          onClose={() => setShowStaffAdmin(false)}
          companyId={companyId}
        />
      )}

      {/* Thermal Hardware Settings Modal */}
      {showHardwareModal && companyId && (
        <POSHardwareSettingsModal
          isOpen={showHardwareModal}
          onClose={() => setShowHardwareModal(false)}
          companyId={companyId}
          currencySymbol={currencySymbol}
        />
      )}

      {/* Offline Sync & Print Center Drawer */}
      {companyId && (
        <POSSyncCenterDrawer
          isOpen={showSyncDrawer}
          onClose={() => setShowSyncDrawer(false)}
          companyId={companyId}
          companyName={companyName}
          isOnline={isOnline}
          isSyncing={isSyncing}
          onTriggerSync={onSyncOffline || (() => {})}
          currencySymbol={currencySymbol}
        />
      )}
    </>
  );
}
