"use client";

import React, { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { 
  AcademicCapIcon, 
  CalendarIcon, 
  CheckCircleIcon, 
  ChevronRightIcon, 
  CreditCardIcon, 
  HashtagIcon, 
  UserIcon, 
  XMarkIcon,
  FunnelIcon,
  BuildingLibraryIcon
} from "@heroicons/react/24/outline";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  feeRecord?: any;
  students?: any[];
  feeItems?: any[];
  allAcademicLevels?: any[];
  allClassrooms?: any[];
  onSave: (data: any) => void;
  isSubmitting: boolean;
}

const AddEditFeeRecordModal : React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  feeRecord, 
  students = [], 
  feeItems = [],
  allAcademicLevels = [],
  allClassrooms = [],
  onSave, 
  isSubmitting,
}) => {
  // Form State
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [academicYear, setAcademicYear] = useState('2024/2025');
  const [term, setTerm] = useState('Term 1');
  const [dueDate, setDueDate] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [selectedFeeIds, setSelectedFeeIds] = useState<string[]>([]);

  // Filtering State
  const [filterLevel, setFilterLevel] = useState('');
  const [filterClass, setFilterClass] = useState('');

  // 1. Filtered Student List
  const filteredStudents = useMemo(() => {
    return students.filter((s: any) => {
      const matchLevel = filterLevel ? s.academicLevelId === filterLevel : true;
      const matchClass = filterClass ? s.classroomId === filterClass : true;
      return matchLevel && matchClass;
    });
  }, [students, filterLevel, filterClass]);

  // 2. Selected Student Detail
  const selectedStudent = useMemo(() => 
    students.find((s: any) => s.id === selectedStudentId), 
    [selectedStudentId, students]
  );

  // 3. Running Total
  const runningTotal = useMemo(() => {
    return feeItems
      .filter((item: any) => selectedFeeIds.includes(item.id))
      .reduce((sum: number, item: any) => sum + item.defaultAmount, 0);
  }, [selectedFeeIds, feeItems]);

  useEffect(() => {
    if (isOpen) {
      if (feeRecord) {
        setSelectedStudentId(feeRecord.studentId);
        setAcademicYear(feeRecord.academicYear);
        setTerm(feeRecord.term);
        setDueDate(feeRecord.dueDate || '');
        setInvoiceNumber(feeRecord.invoiceNumber || '');
      } else {
        resetForm();
      }
    }
  }, [isOpen, feeRecord]);

  const resetForm = () => {
    setSelectedStudentId('');
    setFilterLevel('');
    setFilterClass('');
    setSelectedFeeIds([]);
    setDueDate('');
  };

  const toggleFee = (id: string) => {
    setSelectedFeeIds(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeRecord && (!selectedStudentId || selectedFeeIds.length === 0)) {
      toast.error("Please select a student and at least one fee");
      return;
    }
    
    onSave({ 
      studentId: selectedStudentId, 
      academicYear, 
      term, 
      dueDate, 
      invoiceNumber,
      feeItemIds: selectedFeeIds 
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" 
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 pb-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/20">
                    <CreditCardIcon className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Invoice Generator</h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Manual Billing Entry</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              
              {/* SECTION 1: TARGET STUDENT */}
              {!feeRecord && (
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest flex items-center gap-2">
                    <FunnelIcon className="h-3 w-3" /> 1. Locate Student
                  </label>
                  
                  {/* Filter Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <select 
                      value={filterLevel} 
                      onChange={(e) => { setFilterLevel(e.target.value); setSelectedStudentId(''); }}
                      className="bg-slate-950 border border-white/5 rounded-xl p-3 text-xs text-slate-300 outline-none focus:border-indigo-500/50"
                    >
                      <option value="">All Levels</option>
                      {allAcademicLevels.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                    <select 
                      value={filterClass} 
                      onChange={(e) => { setFilterClass(e.target.value); setSelectedStudentId(''); }}
                      className="bg-slate-950 border border-white/5 rounded-xl p-3 text-xs text-slate-300 outline-none focus:border-indigo-500/50"
                    >
                      <option value="">All Classes</option>
                      {allClassrooms.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  {/* Student Search/Select */}
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" width={16} height={16} />
                    <select 
                      required
                      value={selectedStudentId} 
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none"
                    >
                      <option value="">Select Student ({filteredStudents.length} available)...</option>
                      {filteredStudents.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.firstName} {s.lastName} — {s.admissionNumber}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* SECTION 2: FEE ITEMS */}
              {!feeRecord && (
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest flex items-center gap-2">
                    <BuildingLibraryIcon className="h-3 w-3" /> 2. Select Charges
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {feeItems.map((item: any) => (
                      <button
                        key={item.id} type="button" onClick={() => toggleFee(item.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          selectedFeeIds.includes(item.id)
                          ? "bg-indigo-500/20 border-indigo-500/50 text-white shadow-inner"
                          : "bg-slate-950/40 border-white/5 text-slate-500 hover:border-white/20"
                        }`}
                      >
                        <div className="text-left truncate mr-2">
                          <p className="text-[11px] font-black uppercase tracking-tight truncate">{item.name}</p>
                          <p className="text-[10px] opacity-60">${item.defaultAmount}</p>
                        </div>
                        <div className={`h-4 w-4 rounded-full flex-shrink-0 border flex items-center justify-center ${
                          selectedFeeIds.includes(item.id) ? "bg-indigo-500 border-indigo-500" : "border-white/20"
                        }`}>
                          {selectedFeeIds.includes(item.id) && <CheckCircleIcon className="w-3 h-3 text-white" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 3: BILLING DETAILS */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Period</label>
                  <div className="flex gap-2">
                    <input value={academicYear} onChange={e => setAcademicYear(e.target.value)} className="w-full bg-slate-950/50 border border-white/5 rounded-xl p-3 text-xs text-white" placeholder="Year" />
                    <input value={term} onChange={e => setTerm(e.target.value)} className="w-full bg-slate-950/50 border border-white/5 rounded-xl p-3 text-xs text-white" placeholder="Term" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Due Date</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-slate-950/50 border border-white/5 rounded-xl p-3 text-xs text-white" />
                </div>
              </div>

              {/* SECTION 4: LIVE TOTAL & SUBMIT */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-6">
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Total Liability</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">${runningTotal.toLocaleString()}</span>
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{selectedFeeIds.length} Items</span>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="flex-[1.5] group relative py-5 px-8 rounded-[2rem] bg-white text-slate-950 text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {isSubmitting ? "Processing..." : (feeRecord ? "Sync Record" : "Confirm Invoice")}
                    <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
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