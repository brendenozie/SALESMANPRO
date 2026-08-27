"use client";

import React, { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { 
  ChevronRightIcon, 
  CreditCardIcon, 
  XMarkIcon,
  FunnelIcon,
  BuildingLibraryIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  BoltIcon
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

const AddEditFeeRecordModal: React.FC<Props> = ({ 
  isOpen, onClose, feeRecord, students = [], feeItems = [],
  allAcademicLevels = [], allClassrooms = [], onSave, isSubmitting,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [academicYear, setAcademicYear] = useState('2026'); 
  const [term, setTerm] = useState('Term 1');
  const [dueDate, setDueDate] = useState('');
  const [selectedFeeIds, setSelectedFeeIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [filterLevel, setFilterLevel] = useState('');
  const [filterClass, setFilterClass] = useState('');

  const filteredStudents = useMemo(() => {
    return students.filter((s: any) => {
      const activeRecord = s.academicRecords?.find(
        (r: any) => r.year === academicYear && r.term === term
      );
      if ((filterLevel || filterClass) && !activeRecord) return false;

      const matchLevel = !filterLevel || activeRecord?.academicLevelId === filterLevel;
      const matchClass = !filterClass || activeRecord?.classRoomId === filterClass;
      const matchSearch = !searchTerm || 
        `${s.firstName} ${s.lastName} ${s.admissionNumber}`.toLowerCase().includes(searchTerm.toLowerCase());

      return matchLevel && matchClass && matchSearch;
    });
  }, [students, filterLevel, filterClass, academicYear, term, searchTerm]);
  
  const filteredClasses = useMemo(() => {
    if (!filterLevel) return allClassrooms;
    return allClassrooms.filter((c: any) => c.academicLevelId === filterLevel);
  }, [allClassrooms, filterLevel]);

  const runningTotal = useMemo(() => {
    return feeItems
      .filter((item: any) => selectedFeeIds.includes(item.id))
      .reduce((sum: number, item: any) => sum + (item.defaultAmount || 0), 0);
  }, [selectedFeeIds, feeItems]);

  const handleQuickSelect = () => {
    const mandatoryIds = feeItems
      .filter(item => item.isMandatory || item.name.toLowerCase().includes('tuition'))
      .map(item => item.id);
    setSelectedFeeIds(prev => Array.from(new Set([...prev, ...mandatoryIds])));
    toast.success("Mandatory fees added", { icon: '⚡' });
  };

  useEffect(() => {
    if (isOpen) {
      if (feeRecord) {
        setSelectedStudentId(feeRecord.studentId);
        setAcademicYear(feeRecord.academicYear);
        setTerm(feeRecord.term);
        setDueDate(feeRecord.dueDate?.split('T')[0] || '');
        setSelectedFeeIds(feeRecord.feeItems?.map((f: any) => f.id) || []);
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
    setSearchTerm('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) { toast.error("Please select a student"); return; }
    if (!selectedFeeIds.length) { toast.error("Select at least one fee item"); return; }

    onSave({
      studentId: selectedStudentId, academicYear, term,
      dueDate: dueDate || null, feeItemIds: selectedFeeIds,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Top Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-md">
                  <CreditCardIcon className="text-white w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Invoice Generator</h2>
                  <p className="text-[10px] text-indigo-600 uppercase tracking-widest font-black">Session: {academicYear} — {term}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[75vh] custom-scrollbar">
              
              {/* FILTER SECTION */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                    <FunnelIcon className="h-3 w-3" /> 01. Filter Records
                  </label>
                  <div className="flex gap-2">
                     <select value={academicYear} onChange={e => setAcademicYear(e.target.value)} className="bg-slate-100 border border-slate-200 rounded-lg text-[10px] text-slate-700 px-2 py-1 outline-none">
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                     </select>
                     <select value={term} onChange={e => setTerm(e.target.value)} className="bg-slate-100 border border-slate-200 rounded-lg text-[10px] text-slate-700 px-2 py-1 outline-none">
                        <option value="Term 1">Term 1</option>
                        <option value="Term 2">Term 2</option>
                     </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <select 
                    value={filterLevel} onChange={(e) => { setFilterLevel(e.target.value); setFilterClass(''); }}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 outline-none focus:border-indigo-500"
                  >
                    <option value="">All Levels</option>
                    {allAcademicLevels.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                  <select 
                    value={filterClass} onChange={(e) => setFilterClass(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 outline-none focus:border-indigo-500"
                  >
                    <option value="">All Classes</option>
                    {filteredClasses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {/* SEARCH & SELECTION */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" width={18} height={18} />
                  <input 
                    placeholder="Search by name or Admission No..."
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                  />
                </div>

                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-2xl bg-slate-50 p-2 space-y-1 custom-scrollbar">
                  {filteredStudents.map((s: any) => (
                    <button
                      key={s.id} type="button" onClick={() => setSelectedStudentId(s.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                        selectedStudentId === s.id ? "bg-indigo-600 shadow-md text-white" : "text-slate-700 hover:bg-white hover:shadow-sm border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold ${selectedStudentId === s.id ? "bg-indigo-700 text-white" : "bg-slate-200 text-slate-600"}`}>
                          {s.firstName[0]}{s.lastName[0]}
                        </div>
                        <div>
                          <p className="text-xs font-bold">{s.name}</p>
                          <p className={`text-[10px] ${selectedStudentId === s.id ? "opacity-80" : "text-slate-500"}`}>{s.admissionNumber}</p>
                        </div>
                      </div>
                      {selectedStudentId === s.id && <SparklesIcon className="w-4 h-4 text-indigo-200" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* CHARGE SELECTION */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                    <BuildingLibraryIcon className="h-3 w-3" /> 02. Select Charges
                  </label>
                  <button 
                    type="button" onClick={handleQuickSelect}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 text-[10px] font-black uppercase tracking-tighter hover:bg-indigo-600 hover:text-white transition-all"
                  >
                    <BoltIcon className="w-3 h-3" /> Quick Select Mandatory
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {feeItems.map((item: any) => (
                    <button
                      key={item.id} type="button" 
                      onClick={() => setSelectedFeeIds(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id])}
                      className={`p-4 rounded-2xl border transition-all text-left relative overflow-hidden ${
                        selectedFeeIds.includes(item.id) ? "bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      <p className={`text-[10px] font-black uppercase mb-1 ${selectedFeeIds.includes(item.id) ? "text-indigo-600 opacity-80" : "opacity-60"}`}>{item.name}</p>
                      <p className="text-xl font-black">${item.defaultAmount.toLocaleString()}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* DUE DATE & SUMMARY */}
              <div className="grid grid-cols-2 gap-4 items-end bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-inner">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Deadline</label>
                  <input 
                    type="date" required value={dueDate} onChange={e => setDueDate(e.target.value)} 
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Total Bill</p>
                  <p className="text-3xl font-black text-slate-900 leading-none">${runningTotal.toLocaleString()}</p>
                </div>
              </div>

              {/* SUBMIT */}
              <button 
                type="submit" disabled={isSubmitting} 
                className="w-full group py-5 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {isSubmitting ? "Generating Invoice..." : "Confirm & Send Invoice"}
                <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddEditFeeRecordModal;