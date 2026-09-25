'use client';

import React, { useState } from 'react';
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ComputerDesktopIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import type { POSOperatorInfo, POSSessionInfo, POSOperator, POSSession } from '@/types/pos';

export type { POSOperatorInfo, POSSessionInfo, POSOperator, POSSession };

export interface POSSessionHeaderProps {
  companyId?: string;
  companyName?: string;
  operator: POSOperatorInfo | null;
  posSession: POSSessionInfo | null;
  onEndSession: () => void;
  onLockTerminal?: () => void;
}

export default function POSSessionHeader({
  companyId,
  companyName,
  operator,
  posSession,
  onEndSession,
  onLockTerminal,
}: POSSessionHeaderProps) {
  const [closing, setClosing] = useState(false);

  if (!operator || !posSession) return null;

  const handleEndSession = async () => {
    if (!window.confirm(`End active POS session for ${operator.name}? This will lock the terminal for the next operator.`)) {
      return;
    }

    setClosing(true);
    try {
      await fetch('/api/pos/session/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: posSession.id,
          companyId,
        }),
      });
    } catch (err) {
      console.error('Failed to close session on server:', err);
    } finally {
      setClosing(false);
      onEndSession();
    }
  };

  const startTimeStr = posSession.openedAt
    ? new Date(posSession.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
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
        {/* Lock Terminal Button */}
        {onLockTerminal && (
          <button
            type="button"
            onClick={onLockTerminal}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 transition-all font-medium text-xs"
            title="Lock POS terminal"
          >
            <span>Lock</span>
          </button>
        )}

        {/* End Session Button */}
        <button
          type="button"
          onClick={handleEndSession}
          disabled={closing}
          className="flex items-center gap-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white px-3 py-1.5 rounded-lg border border-rose-500/40 transition-all active:scale-95 font-semibold text-xs"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          <span>{closing ? 'Ending Shift...' : 'End Session'}</span>
        </button>
      </div>
    </div>
  );
}
