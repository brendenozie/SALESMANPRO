"use client";
import React from "react";
import { BanknotesIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

const FeeRecordRow = ({ record, onLogPayment, onEditRecord, onDeleteRecord, onDownloadInvoice }: any) => {
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'partially paid': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  const name = `${record.student?.firstName} ${record.student?.lastName}`;

  return (
    <tr className="group hover:bg-slate-50 transition-colors border-b border-slate-100">
      <td className="py-5 px-8">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-black text-white shadow-md">
            {record.student?.firstName?.[0]}{record.student?.lastName?.[0]}
          </div>
          <div>
            <div className="font-bold text-slate-900">{name}</div>
            <div className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">{record.studentId}</div>
          </div>
        </div>
      </td>
      <td className="py-5 px-8">
        <div className="text-xs font-bold text-slate-700">{record.term}</div>
        <div className="text-[10px] text-slate-500 uppercase tracking-widest">{record.academicYear}</div>
      </td>
      <td className="py-5 px-8">
        <div className="text-sm font-black text-slate-900">${record.calculatedTotalFeesDue.toLocaleString()}</div>
      </td>
      <td className="py-5 px-8 text-center">
        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusStyle(record.paymentStatus)}`}>
          {record.paymentStatus}
        </span>
      </td>
      <td className="py-5 px-8 text-right">
        <div className={`text-sm font-black ${record.calculatedBalanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
          {record.calculatedBalanceDue > 0 ? `-$${record.calculatedBalanceDue.toLocaleString()}` : 'Settled'}
        </div>
      </td>
      <td className="py-5 px-8">
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onLogPayment(record)} className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-colors"><BanknotesIcon className="h-4 w-4" /></button>
          <button onClick={() => onEditRecord(record)} className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-xl transition-colors"><PencilSquareIcon className="h-4 w-4" /></button>
          <button onClick={() => onDeleteRecord(record.id, name)} className="p-2 hover:bg-rose-50 text-rose-600 rounded-xl transition-colors"><TrashIcon className="h-4 w-4" /></button>
          <button
            onClick={onDownloadInvoice}
            className="text-indigo-600 hover:text-indigo-800 text-xs font-bold ml-2"
          >
            Invoice PDF
          </button>
        </div>
      </td>
    </tr>
  );
};

export default FeeRecordRow;