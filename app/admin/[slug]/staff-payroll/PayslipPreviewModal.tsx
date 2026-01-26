"use client";

import React from "react";
import { 
  XMarkIcon, 
  PrinterIcon, 
  ArrowDownTrayIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";

interface PayslipPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    staff: string;
    id: string;
    base: number;
    bonus: number;
    tax: number;
    net: number;
  } | null;
}

const PayslipPreviewModal = ({ isOpen, onClose, data }: PayslipPreviewProps) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-lg rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        {/* Header - Light Mode for Print Feel */}
        <div className="p-8 bg-slate-50 border-b border-slate-200 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckBadgeIcon className="h-5 w-5 text-amber-600" />
              <span className="text-amber-600 text-[10px] font-black uppercase tracking-widest">Official Payroll Document</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Earnings Statement</h2>
            <p className="text-xs text-slate-500 font-medium">Period: January 2026</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Payslip Content */}
        <div className="p-10">
          <div className="flex justify-between items-end mb-10 pb-6 border-b border-dashed border-slate-200">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Employee Details</p>
              <h3 className="text-lg font-bold text-slate-900">{data.staff}</h3>
              <p className="text-xs font-mono text-slate-500">{data.id}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Status</p>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Validated</span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Earnings Section */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Earnings</p>
              <div className="flex justify-between text-sm py-2">
                <span className="text-slate-600">Base Monthly Salary</span>
                <span className="font-mono font-bold text-slate-900">${data.base.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm py-2">
                <span className="text-slate-600">Performance Bonus</span>
                <span className="font-mono font-bold text-emerald-600">+${data.bonus.toLocaleString()}</span>
              </div>
            </div>

            {/* Deductions Section */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Statutory Deductions</p>
              <div className="flex justify-between text-sm py-2">
                <span className="text-slate-600">Income Tax withholding (15%)</span>
                <span className="font-mono font-bold text-rose-600">-${data.tax.toLocaleString()}</span>
              </div>
            </div>

            {/* Total Section */}
            <div className="mt-10 p-6 bg-slate-900 rounded-2xl flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Net Payable Amount</p>
                <p className="text-xs text-slate-400 italic">Disbursing via Bank Transfer</p>
              </div>
              <div className="text-right">
                <h4 className="text-2xl font-black text-white">${data.net.toLocaleString()}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-8 bg-slate-50 border-t border-slate-200 flex gap-4">
          <button className="flex-1 flex items-center justify-center gap-2 py-4 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-100 transition-all">
            <PrinterIcon className="h-4 w-4" /> Print PDF
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-all">
            <ArrowDownTrayIcon className="h-4 w-4" /> Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayslipPreviewModal;