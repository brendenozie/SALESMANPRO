'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon,
  EnvelopeOpenIcon,
  IdentificationIcon,
  ArrowUpRightIcon,
  UserGroupIcon,
  SparklesIcon,
  EllipsisVerticalIcon,
  XMarkIcon,
  SquaresPlusIcon,
  CheckIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from "next/navigation";

// --- Types remain same as original ---
export type StudentRosterStudent = {
  id: string;
  userId: string;
  name: string;
  email: string;
  profilePicture: string | null;
  parentId: string | null;
  parentEmail: string | null;
  studentGrade: string | null;
};

interface StudentRosterPageProps {
  students: StudentRosterStudent[];
  companyId: string;
}

export default function StudentRosterPage({ students, companyId }: StudentRosterPageProps) {
  const router = useRouter();
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = useMemo(() => {
    return students?.filter((s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  // --- Selection Logic ---
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filteredStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map(s => s.id));
    }
  };

  const cancelSelection = () => {
    setSelectedIds([]);
    setIsSelectionMode(false);
  };

  const primaryColor = "#fd2121"; // Red
  const accentColor = "#FFC107";  // Gold


  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20">
      {/* 1. Glassmorphism Header */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => router.back()}
              className="p-2.5 bg-white shadow-sm border border-gray-100 rounded-xl text-gray-500 hover:text-red-500 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                Student Roster
                <SparklesIcon className="h-5 w-5 text-amber-400" />
              </h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {selectedIds.length > 0 ? `${selectedIds.length} Selected` : `${students.length} Total`}
              </p>
            </div>
            <button 
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                if (isSelectionMode) setSelectedIds([]);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all
                ${isSelectionMode ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {isSelectionMode ? <XMarkIcon className="h-4 w-4" /> : <SquaresPlusIcon className="h-4 w-4" />}
              {isSelectionMode ? 'Cancel' : 'Select Multiple'}
            </button>
          </div>
          
          <div className="hidden md:flex items-center gap-3">
            <div className="flex -space-x-3">
              {students.slice(0, 5).map((s, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
              ))}
              {students.length > 5 && (
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-800 text-[10px] text-white flex items-center justify-center font-bold">
                  +{students.length - 5}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        {/* Bulk Action: Select All (Visible only in Selection Mode) */}
        <AnimatePresence>
          {isSelectionMode && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex justify-between items-center mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100"
            >
              <span className="text-sm font-bold text-slate-600">Quick Actions</span>
              <button onClick={selectAll} className="text-sm font-black text-red-500 hover:text-red-600">
                {selectedIds.length === filteredStudents.length ? 'Deselect All' : 'Select All Filtered'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. Floating Modern Search */}
        <div className="relative max-w-2xl mx-auto mb-16">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by student name, ID or grade..."
            className="w-full pl-14 pr-6 py-5 bg-white shadow-2xl shadow-slate-200/50 border-none rounded-[2rem] text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-red-500/20 transition-all text-lg font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 3. Student Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          <AnimatePresence mode='popLayout'>
            {filteredStudents?.map((student, idx) => {
              const isSelected = selectedIds.includes(student.id);

              return (
              <motion.div
                key={student.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => isSelectionMode && toggleSelection(student.id)}
                className={`relative bg-white rounded-[2.5rem] border transition-all duration-300 overflow-hidden
                    ${isSelected ? 'border-red-500 ring-4 ring-red-500/10 shadow-xl shadow-red-500/10' : 'border-slate-100 shadow-sm'}
                    ${isSelectionMode ? 'cursor-pointer active:scale-95' : ''}`}
                // className="group relative bg-white rounded-[2.5rem] border border-slate-100 p-6 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-500"
              >
                {/* Selection Overlay Checkmark */}
                {isSelectionMode && (
                  <div className="absolute top-4 right-4 z-20">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                      ${isSelected ? 'bg-red-500 border-red-500' : 'bg-white border-slate-200'}`}>
                      {isSelected && <CheckIcon className="h-4 w-4 text-white stroke-[4]" />}
                    </div>
                  </div>
                )}

                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <EllipsisVerticalIcon className="h-6 w-6 text-slate-300" />
                </div>
                

                {/* Profile Section */}
                <div className={`p-6 ${isSelectionMode ? 'pointer-events-none' : ''}`}>
                  <div className="flex flex-col items-center" >
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-0 group-hover:opacity-20 transition-opacity" />
                      <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-slate-50 relative z-10 shadow-inner">
                        {student.profilePicture ? (
                          <img src={student.profilePicture} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <span className="text-2xl font-black">{student.name.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-slate-50">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                      </div>
                    </div>

                    <h3 className="text-lg font-black text-slate-800 text-center leading-tight">
                      {student.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                      <IdentificationIcon className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-500 tracking-tight">
                        {student.studentGrade || 'N/A'} • {student.id.slice(0, 8)}
                      </span>
                    </div>
                  </div>

                  {/* 4. Action Hub (Redesigned) */}
                  <div className="mt-8 space-y-2">
                    <button
                      onClick={() => router.push(`/admin/${companyId}/students/${student.id}/profile`)}
                      className="w-full py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 group/btn"
                    >
                      View Insights
                      <ArrowUpRightIcon className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </button>

                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <ActionButton 
                        icon={<ChatBubbleLeftRightIcon className="h-5 w-5" />} 
                        onClick={() => alert(`Message ${student.name}`)}
                        label="Chat"
                      />
                      <ActionButton 
                        icon={<EnvelopeOpenIcon className="h-5 w-5" />} 
                        onClick={() => alert(`Parent: ${student.parentEmail}`)}
                        label="Parent"
                        disabled={!student.parentEmail}
                      />
                      <ActionButton 
                        icon={<PencilSquareIcon className="h-5 w-5" />} 
                        onClick={() => alert(`Notes for ${student.name}`)}
                        label="Note"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )})}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredStudents.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-40"
          >
            <div className="p-10 bg-slate-50 rounded-full mb-6">
              <UserGroupIcon className="h-20 w-20 text-slate-200" />
            </div>
            <h2 className="text-2xl font-bold text-slate-400">No students matching "{searchTerm}"</h2>
            <p className="text-slate-400 mt-1">Try searching by ID or grade level</p>
          </motion.div>
        )}
      </main>
       {/* --- FLOATING ACTION DOCK --- */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ y: 100, x: '-50%', opacity: 0 }}
              animate={{ y: 0, x: '-50%', opacity: 1 }}
              exit={{ y: 100, x: '-50%', opacity: 0 }}
              className="fixed bottom-8 left-1/2 z-50 w-[90%] max-w-2xl"
            >
              <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-[2rem] shadow-2xl flex items-center justify-between">
                <div className="pl-4">
                  <p className="text-white font-black text-lg leading-none">{selectedIds.length}</p>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">Students Selected</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <DockButton 
                    icon={<ChatBubbleLeftRightIcon className="h-5 w-5" />} 
                    label="Message" 
                    onClick={() => alert('Bulk Message Sent')}
                  />
                  <DockButton 
                    icon={<DocumentArrowDownIcon className="h-5 w-5" />} 
                    label="PDF Export" 
                    onClick={() => alert('Generating PDF Report...')}
                  />
                  <div className="w-px h-8 bg-white/10 mx-2" />
                  <button 
                    onClick={cancelSelection}
                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}

// Sub-component for small icon buttons
function ActionButton({ icon, onClick, label, disabled = false }: { icon: any, onClick: () => void, label: string, disabled?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        disabled={disabled}
        onClick={onClick}
        className={`w-full aspect-square rounded-2xl flex items-center justify-center transition-all
          ${disabled 
            ? 'bg-slate-50 text-slate-200 cursor-not-allowed' 
            : 'bg-white border border-slate-100 text-slate-600 hover:text-red-500 hover:border-red-100 hover:shadow-md'
          }`}
      >
        {icon}
      </button>
      <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">{label}</span>
    </div>
  );
}


function DockButton({ icon, label, onClick }: { icon: any, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-red-50 text-slate-900 hover:text-red-600 rounded-2xl transition-all font-bold text-sm"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}