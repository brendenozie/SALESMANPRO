"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import toast, { Toaster } from "react-hot-toast";
import {
  BanknotesIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusCircleIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  SparklesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

import Modal from "@/components/Modal";
import { Student, FeeItem } from "@/lib/data";
import "@/lib/chartConfig";
import { AnimatePresence, motion } from "framer-motion";


const AddEditFeeRecordModal: React.FC<any> = ({ isOpen, onClose, feeRecord, students, onSave, isSubmitting }) => {
  // ... state logic remains the same ...
  
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [academicYear, setAcademicYear] = useState<string>('');
  const [term, setTerm] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (feeRecord) {
        setSelectedStudentId(feeRecord.studentId);
        setAcademicYear(feeRecord.academicYear);
        setTerm(feeRecord.term);
        setDueDate(feeRecord.dueDate || '');
        setInvoiceNumber(feeRecord.invoiceNumber || '');
      } else {
        setSelectedStudentId('');
        setAcademicYear('');
        setTerm('');
        setDueDate('');
        setInvoiceNumber('');
      }
    }
  }, [isOpen, feeRecord]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feeRecord) {
      onSave({ dueDate: dueDate || null, invoiceNumber: invoiceNumber || null });
    } else {
      if (!selectedStudentId || !academicYear || !term) {
        toast.error("Please fill all required fields for a new fee record.");
        return;
      }
      onSave({ studentId: selectedStudentId, academicYear, term });
    }
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-white/5 bg-white/5">
               <h2 className="text-2xl font-black text-white">{feeRecord ? "Modify Fee Entry" : "New Fee Generation"}</h2>
               <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Financial Registry</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {!feeRecord ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 block">Student Selection</label>
                    <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                      <option value="">Choose a student...</option>
                      {students.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.admissionNumber})</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <input value={academicYear} onChange={e => setAcademicYear(e.target.value)} placeholder="Year (2024/25)" className="bg-slate-950 border border-white/10 rounded-2xl p-4 text-sm text-white" />
                     <input value={term} onChange={e => setTerm(e.target.value)} placeholder="Term 1" className="bg-slate-950 border border-white/10 rounded-2xl p-4 text-sm text-white" />
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-3xl space-y-2">
                   <div className="flex justify-between"><span className="text-xs text-slate-500">Student</span><span className="text-xs font-bold text-white">{feeRecord.student?.firstName} {feeRecord.student?.lastName}</span></div>
                   <div className="flex justify-between"><span className="text-xs text-slate-500">Total Liability</span><span className="text-xs font-bold text-white">${feeRecord.calculatedTotalFeesDue}</span></div>
                </div>
              )}

              <div className="space-y-4">
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white" />
                <input placeholder="Invoice Number (Optional)" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={onClose} className="flex-1 py-4 px-6 rounded-2xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition-all">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 px-6 rounded-2xl bg-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all">
                  {isSubmitting ? "Processing..." : feeRecord ? "Update Record" : "Generate Invoice"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddEditFeeRecordModal;