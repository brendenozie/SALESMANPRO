"use client";
import React from "react";
import {
  BanknotesIcon,
  PencilSquareIcon,
  TrashIcon,
  PrinterIcon,
  DocumentTextIcon,
  ReceiptPercentIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

interface FeeRecordRowProps {
  record: any;
  onLogPayment: (record: any) => void;
  onEditRecord: (record: any) => void;
  onDeleteRecord: (id: string, name: string) => void;
  onDownloadInvoice?: (record: any) => void;
  onPreviewInvoice?: (record: any) => void;
  onPreviewReceipt?: (record: any) => void;
}

const FeeRecordRow: React.FC<FeeRecordRowProps> = ({
  record,
  onLogPayment,
  onEditRecord,
  onDeleteRecord,
  onDownloadInvoice,
  onPreviewInvoice,
  onPreviewReceipt,
}) => {
  const getStatusStyle = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "paid":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "partially paid":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      default:
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    }
  };

  const name = `${record.student?.firstName || ""} ${record.student?.lastName || ""}`.trim() || "Student";
  const hasArrears = Number(record.calculatedBalanceDue) > 0;
  const hasPayments = Number(record.amountPaid) > 0;

  const handleInvoiceClick = () => {
    if (onPreviewInvoice) {
      onPreviewInvoice(record);
    } else if (onDownloadInvoice) {
      onDownloadInvoice(record);
    }
  };

  return (
    <tr className="group hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition-colors border-b border-slate-100 dark:border-slate-850">
      <td className="py-4 px-6 md:px-8">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-black text-white shadow-md">
            {record.student?.firstName?.[0] || "S"}{record.student?.lastName?.[0] || ""}
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
              <span>{name}</span>
              {hasArrears && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" title="Outstanding Fee Deficit">
                  <ExclamationCircleIcon className="h-3 w-3" /> Arrears
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-tight uppercase">
              {record.student?.admissionNumber || record.studentId || "NO-ADM"}
            </div>
          </div>
        </div>
      </td>
      <td className="py-4 px-6 md:px-8">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{record.term}</div>
        <div className="text-[10px] text-slate-400 uppercase tracking-widest">{record.academicYear}</div>
      </td>
      <td className="py-4 px-6 md:px-8">
        <div className="text-sm font-black text-slate-900 dark:text-white">
          KES {Number(record.calculatedTotalFeesDue || 0).toLocaleString()}
        </div>
        {hasPayments && (
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            Paid: KES {Number(record.amountPaid || 0).toLocaleString()}
          </div>
        )}
      </td>
      <td className="py-4 px-6 md:px-8 text-center">
        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusStyle(record.paymentStatus)}`}>
          {record.paymentStatus || "UNPAID"}
        </span>
      </td>
      <td className="py-4 px-6 md:px-8 text-right">
        <div className={`text-sm font-black ${hasArrears ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
          {hasArrears ? `-KES ${Number(record.calculatedBalanceDue).toLocaleString()}` : "Settled"}
        </div>
      </td>
      <td className="py-4 px-6 md:px-8">
        <div className="flex items-center justify-end gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Print Invoice / Arrears Demand Notice Button */}
          <button
            onClick={handleInvoiceClick}
            className={`p-2 rounded-xl transition-all flex items-center gap-1 text-xs font-bold ${
              hasArrears
                ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/50"
                : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-900/50"
            }`}
            title={hasArrears ? "Print / View Fee Arrears Demand Notice" : "Print / View Fee Invoice PDF"}
          >
            <PrinterIcon className="h-4 w-4" />
            <span className="hidden xl:inline text-[10px] uppercase font-black">
              {hasArrears ? "Arrears PDF" : "Invoice"}
            </span>
          </button>

          {/* Print Receipt Button (if student made payments) */}
          {hasPayments && onPreviewReceipt && (
            <button
              onClick={() => onPreviewReceipt(record)}
              className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-1"
              title="Print / View Official Fee Payment Receipt"
            >
              <ReceiptPercentIcon className="h-4 w-4" />
              <span className="hidden xl:inline text-[10px] uppercase font-black">Receipt</span>
            </button>
          )}

          {/* Record Payment Button */}
          <button
            onClick={() => onLogPayment(record)}
            className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl transition-colors"
            title="Record Fee Payment"
          >
            <BanknotesIcon className="h-4 w-4" />
          </button>

          {/* Edit Fee Record */}
          <button
            onClick={() => onEditRecord(record)}
            className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl transition-colors"
            title="Edit Fee Items & Adjustments"
          >
            <PencilSquareIcon className="h-4 w-4" />
          </button>

          {/* Delete Fee Record */}
          <button
            onClick={() => onDeleteRecord(record.id, name)}
            className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl transition-colors"
            title="Delete Record"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default FeeRecordRow;