"use client";
import React from "react";
import { BanknotesIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

const FeeRecordRow = ({ record, onLogPayment, onEditRecord, onDeleteRecord }: any) => {
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'partially paid': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
  };

  const name = `${record.student?.firstName} ${record.student?.lastName}`;

  return (
    <tr className="group hover:bg-white/[0.02] transition-colors border-b border-slate-800/50">
      <td className="py-5 px-8">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-black text-white shadow-lg">
            {record.student?.firstName?.[0]}{record.student?.lastName?.[0]}
          </div>
          <div>
            <div className="font-bold text-white">{name}</div>
            <div className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">{record.studentId}</div>
          </div>
        </div>
      </td>
      <td className="py-5 px-8">
        <div className="text-xs font-bold text-slate-300">{record.term}</div>
        <div className="text-[10px] text-slate-500 uppercase tracking-widest">{record.academicYear}</div>
      </td>
      <td className="py-5 px-8">
        <div className="text-sm font-black text-white">${record.calculatedTotalFeesDue.toLocaleString()}</div>
      </td>
      <td className="py-5 px-8 text-center">
        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusStyle(record.paymentStatus)}`}>
          {record.paymentStatus}
        </span>
      </td>
      <td className="py-5 px-8 text-right">
        <div className={`text-sm font-black ${record.calculatedBalanceDue > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
          {record.calculatedBalanceDue > 0 ? `-$${record.calculatedBalanceDue.toLocaleString()}` : 'Settled'}
        </div>
      </td>
      <td className="py-5 px-8">
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onLogPayment(record)} className="p-2 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-colors"><BanknotesIcon className="h-4 w-4" /></button>
          <button onClick={() => onEditRecord(record)} className="p-2 hover:bg-indigo-500/20 text-indigo-400 rounded-xl transition-colors"><PencilSquareIcon className="h-4 w-4" /></button>
          <button onClick={() => onDeleteRecord(record.id, name)} className="p-2 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors"><TrashIcon className="h-4 w-4" /></button>
        </div>
      </td>
    </tr>
  );
};

export default FeeRecordRow;