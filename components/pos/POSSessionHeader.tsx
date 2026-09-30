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
} from '@heroicons/react/24/outline';
import type { POSOperatorInfo, POSSessionInfo } from '@/types/pos';
import POSShiftModal from './POSShiftModal';
import POSStaffAdminModal from './POSStaffAdminModal';

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
}: POSSessionHeaderProps) {
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showStaffAdmin, setShowStaffAdmin] = useState(false);

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
      <div className="w-full bg-slate-900 text-white px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800 shadow-inner">
        <div className="flex items-center gap-3">
          {/* Store / Module Name */}
          {companyName && (
            <div className="hidden sm:flex items-center gap-1.5 font-bold text-slate-200">
              <span className="text-indigo-400">●</span>
              <span>{companyName}</span>
            </div>
          )}

          {/* Operator Badge */}
          <div className="flex items-center gap-2 bg-slate-800/90 py-1 px-3 rounded-full border border-slate-700">
            <UserCircleIcon className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">{operator.name}</span>
            <span className="text-[10px] bg-indigo-600 text-white font-bold uppercase px-2 py-0.5 rounded-full">
              {operator.jobTitle || operator.role}
            </span>
          </div>

          {/* Terminal Info */}
          <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
            <ComputerDesktopIcon className="w-3.5 h-3.5 text-slate-500" />
            <span>Terminal:</span>
            <span className="font-mono font-bold text-slate-300">{posSession.terminalId || 'T01'}</span>
          </div>

          {/* Session Time */}
          {startTimeStr && (
            <div className="hidden md:flex items-center gap-1.5 text-slate-400">
              <ClockIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>Shift Started:</span>
              <span className="font-semibold text-slate-300">{startTimeStr}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Held Orders Badge / Button */}
          {onOpenHeldOrders && (
            <button
              type="button"
              onClick={onOpenHeldOrders}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition text-xs font-bold ${
                heldOrdersCount > 0
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500 hover:text-white animate-pulse'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <ShoppingBagIcon className="w-3.5 h-3.5" />
              <span>Held ({heldOrdersCount})</span>
            </button>
          )}

          {/* Shift Details & Drawer Settlement */}
          <button
            type="button"
            onClick={() => setShowShiftModal(true)}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 transition-all font-semibold text-xs"
            title="Cash drawer count and shift settlement"
          >
            <BanknotesIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Drawer & Shift</span>
          </button>

          {/* Staff Code Administration (Admin/Manager only) */}
          {isManagerOrAdmin && companyId && (
            <button
              type="button"
              onClick={() => setShowStaffAdmin(true)}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 transition-all font-semibold text-xs"
              title="Manage staff POS login PINs"
            >
              <ShieldCheckIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Staff PINs</span>
            </button>
          )}

          {/* Lock Terminal Button */}
          {onLockTerminal && (
            <button
              type="button"
              onClick={onLockTerminal}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 transition-all font-medium text-xs"
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
            className="flex items-center gap-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white px-3 py-1.5 rounded-lg border border-rose-500/40 transition-all active:scale-95 font-semibold text-xs"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            <span>End Shift</span>
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
    </>
  );
}
