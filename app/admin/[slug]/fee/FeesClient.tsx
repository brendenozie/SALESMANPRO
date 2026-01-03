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

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// --- Types ---
export type StudentFeeRecord = any; // Inherited from your original types

interface FeesClientProps {
  initialFeeRecordsData: StudentFeeRecord[];
  initialStudentsData: Student[];
  initialFeeItemsData: FeeItem[];
  schoolId: string;
}

// --- Sub-Components ---

const ChartContainer: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="p-6 rounded-3xl bg-gray-900/40 border border-gray-800 shadow-2xl backdrop-blur-sm">
    <h3 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-widest flex items-center">
      <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2 animate-pulse" />
      {title}
    </h3>
    <div className="h-[280px] w-full flex items-center justify-center">
      {children}
    </div>
  </div>
);

const SummaryCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  accentColor: string;
}> = ({ title, value, icon: Icon, accentColor }) => (
  <div className="relative overflow-hidden group p-6 rounded-2xl bg-gray-800/40 border border-gray-700/50 hover:border-indigo-500/50 transition-all duration-500">
    <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${accentColor}-500/10 blur-3xl rounded-full group-hover:bg-${accentColor}-500/20 transition-all duration-500`} />
    <div className="flex items-center justify-between mb-4 relative z-10">
      <div className={`p-3 rounded-xl bg-${accentColor}-500/10 text-${accentColor}-400`}>
        <Icon className="h-6 w-6" />
      </div>
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Live Stats</span>
    </div>
    <div className="relative z-10">
      <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
    </div>
  </div>
);

const FeeRecordRow: React.FC<{
  record: StudentFeeRecord;
  onLogPayment: (record: StudentFeeRecord) => void;
  onEditRecord: (record: StudentFeeRecord) => void;
  onDeleteRecord: (id: string, name: string) => void;
}> = ({ record, onLogPayment, onEditRecord, onDeleteRecord }) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Partially Paid': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Unpaid': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    }
  };

  const name = `${record.student?.firstName} ${record.student?.lastName}`;

  return (
    <tr className="group hover:bg-gray-800/40 transition-all duration-200 border-b border-gray-800/50">
      <td className="py-5 px-6">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-xs font-bold mr-3 shadow-lg text-white">
            {record.student?.firstName?.[0]}{record.student?.lastName?.[0]}
          </div>
          <div>
            <div className="font-semibold text-gray-100">{name}</div>
            <div className="text-[11px] text-gray-500 font-mono">{record.studentId}</div>
          </div>
        </div>
      </td>
      <td className="py-5 px-6">
        <div className="text-sm font-medium text-gray-300">{record.student?.currentClass || 'N/A'}</div>
        <div className="text-[10px] text-gray-500 uppercase tracking-tighter">{record.term} • {record.academicYear}</div>
      </td>
      <td className="py-5 px-6">
        <div className="text-sm font-bold text-gray-100">${record.calculatedTotalFeesDue.toLocaleString()}</div>
      </td>
      <td className="py-5 px-6">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(record.paymentStatus)}`}>
          {record.paymentStatus.toUpperCase()}
        </span>
      </td>
      <td className="py-5 px-6 text-right">
        <div className={`text-sm font-black ${record.calculatedBalanceDue > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
          {record.calculatedBalanceDue > 0 ? `-$${record.calculatedBalanceDue.toLocaleString()}` : '$0.00'}
        </div>
      </td>
      <td className="py-5 px-6 text-right">
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button onClick={() => onLogPayment(record)} className="p-2 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors" title="Log Payment">
            <BanknotesIcon className="h-5 w-5" />
          </button>
          <button onClick={() => onEditRecord(record)} className="p-2 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors" title="Edit">
            <PencilSquareIcon className="h-5 w-5" />
          </button>
          <button onClick={() => onDeleteRecord(record.id, name)} className="p-2 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors" title="Delete">
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// --- Main Client Component ---

const FeesClient: React.FC<FeesClientProps> = ({ initialFeeRecordsData, initialStudentsData, initialFeeItemsData, schoolId }) => {
  // Existing state logic remains identical
  const [feeRecords, setFeeRecords] = useState(initialFeeRecordsData);
  const [students, setStudents] = useState<Student[]>(initialStudentsData);
    const [feeItems, setFeeItems] = useState<FeeItem[]>(initialFeeItemsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingFeeRecord, setEditingFeeRecord] = useState<StudentFeeRecord | null>(null);
    const [showLogPaymentModal, setShowLogPaymentModal] = useState(false);
    const [loggingPaymentFor, setLoggingPaymentFor] = useState<StudentFeeRecord | null>(null);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState<{ id: string; name: string } | null>(null);
    const [showApplyBatchFeeModal, setShowApplyBatchFeeModal] = useState(false); // New state for batch modal
    
      const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Financial Calculations ---
  const totals = useMemo(() => {
    const paid = feeRecords.reduce((sum: number, r: any) => sum + (r.amountPaid || 0), 0);
    const due = feeRecords.reduce((sum: number, r: any) => sum + (r.calculatedBalanceDue || 0), 0);
    return { paid, due, total: paid + due };
  }, [feeRecords]);

  // --- Chart Data ---
  const chartData = {
    labels: ["Revenue Collected", "Outstanding Debt"],
    datasets: [{
      data: [totals.paid, totals.due],
      backgroundColor: ["rgba(16, 185, 129, 0.2)", "rgba(244, 63, 94, 0.2)"],
      borderColor: ["#10b981", "#f43f5e"],
      borderWidth: 2,
      hoverOffset: 15,
      borderRadius: 10,
    }]
  };

  // Extract unique classes and academic years for filters
    const uniqueClasses = useMemo(() => {
      const classes = new Set(students.map(s => s.currentClass).filter(Boolean) as string[]);
      return Array.from(classes).sort();
    }, [students]);
  
    const uniqueAcademicYears = useMemo(() => {
      const years = new Set(feeRecords.map(record => record.academicYear));
      return Array.from(years).sort();
    }, [feeRecords]);
  
    // Extract unique academic levels for batch apply modal
    const uniqueAcademicLevels = useMemo(() => {
      // StudentLevelStatus is an enum, so we get its values
      const levels = Object.values([]);//StudentLevelStatus
      return Array.from(levels).sort();
    }, []); // StudentLevelStatus is an enum, so it's static


  // Placeholder functions for logic from your original file
  const filteredRecords = useMemo(() => {
    return feeRecords.filter(r => 
      `${r.student?.firstName} ${r.student?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [feeRecords, searchTerm]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  
  const handleAddFeeRecord = () => {
    setEditingFeeRecord(null);
    setShowAddEditModal(true);
  };

  const handleEditFeeRecord = (record: StudentFeeRecord) => {
    setEditingFeeRecord(record);
    setShowAddEditModal(true);
  };

    // ✨ API Operations
  const refreshData = async () => {
    setIsSubmitting(true);
    try {
      const feesRes = await fetch(`${apiBaseUrl}/admin/student-fee-records`, { next: { revalidate: 60 }, credentials: 'include' });
      if (feesRes.ok) {
        const updatedFees: StudentFeeRecord[] = (await feesRes.json()).data;
        setFeeRecords(updatedFees);
      } else {
        console.error("[FeesClient] Failed to re-fetch fee records.");
      }

      const studentsRes = await fetch(`${apiBaseUrl}/admin/students`, { next: { revalidate: 60 }, credentials: 'include' });
      if (studentsRes.ok) {
        const updatedStudents: Student[] = (await studentsRes.json()).data;
        setStudents(updatedStudents);
      } else {
        console.error("[FeesClient] Failed to re-fetch students.");
      }

      const feeItemsRes = await fetch(`${apiBaseUrl}/admin/fee-items`, { next: { revalidate: 60 }, credentials: 'include' });
      if (feeItemsRes.ok) {
        const updatedFeeItems: FeeItem[] = (await feeItemsRes.json()).data;
        setFeeItems(updatedFeeItems);
      } else {
        console.error("[FeesClient] Failed to re-fetch fee items.");
      }

    } catch (err: any) {
      console.error("[FeesClient] Error re-fetching data:", err.message);
      toast.error("Failed to refresh data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleSaveFeeRecord = async (formData: { studentId?: string; academicYear?: string; term?: string; dueDate?: string | null; invoiceNumber?: string | null }) => {
    setIsSubmitting(true);
    const toastId = toast.loading(editingFeeRecord ? 'Updating fee record...' : 'Creating new fee record...');

    try {
      let response;
      if (editingFeeRecord) {
        response = await fetch(`${apiBaseUrl}/admin/student-fee-records/${editingFeeRecord.id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dueDate: formData.dueDate, invoiceNumber: formData.invoiceNumber }),
        });
      } else {
        response = await fetch(`${apiBaseUrl}/admin/student-fee-records`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: formData.studentId,
            academicYear: formData.academicYear,
            term: formData.term,
            // dueDate and invoiceNumber can be set later via edit if not part of creation
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${editingFeeRecord ? 'update' : 'create'} fee record.`);
      }

      await refreshData();
      toast.success(editingFeeRecord ? 'Fee record updated successfully!' : 'Fee record created successfully!', { id: toastId });
      setShowAddEditModal(false);
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  
  const handleLogPayment = (record: StudentFeeRecord) => {
    setLoggingPaymentFor(record);
    setShowLogPaymentModal(true);
  };

  const handleSavePayment = async (recordId: string, payment: { amount: number; date: string; method: string; receiptNumber?: string }) => {
    setIsSubmitting(true);
    const toastId = toast.loading('Logging payment...');

    try {
      const response = await fetch(`${apiBaseUrl}/admin/student-fee-records/${recordId}/payments`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to log payment.');
      }

      await refreshData();
      toast.success('Payment logged successfully!', { id: toastId });
      setShowLogPaymentModal(false);
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFeeRecord = (id: string, studentName: string) => {
    setRecordToDelete({ id, name: studentName });
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteFeeRecord = async () => {
    if (!recordToDelete) return;
    setIsSubmitting(true);
    const toastId = toast.loading('Deleting fee record...');

    try {
      const response = await fetch(`${apiBaseUrl}/admin/student-fee-records/${recordToDelete.id}`, { method: 'DELETE', credentials: 'include' });
      if (!response.ok) throw new Error('Failed to delete fee record.');
      await refreshData();
      toast.success('Fee record deleted successfully!', { id: toastId });
      setShowDeleteConfirmModal(false);
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
      setRecordToDelete(null);
    }
  };

  // NEW: Batch Apply Fee handler
  const handleApplyBatchFee = async (params: { academicYear: string; term: string; targetType: "CLASS" | "ACADEMIC_LEVEL" | "ALL"; targetValue?: string }) => {
    setIsSubmitting(true);
    const toastId = toast.loading('Applying fees in batch...');

    try {
      const response = await fetch(`${apiBaseUrl}/admin/fee-actions/apply-batch`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to apply fees in batch.');
      }

      const result = await response.json();
      toast.success(
        `Batch operation complete! Created: ${result.result.created}, Existing: ${result.result.existing}, Failed: ${result.result.failed}`,
        { id: toastId, duration: 5000 }
      );
      await refreshData(); // Refresh all data after batch operation
      setShowApplyBatchFeeModal(false);
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <main className="min-h-screen bg-[#0B0F1A] text-gray-100 pb-20 font-sans">
      <Toaster position="top-right" />

      {/* Sticky Header */}
      <nav className="bg-gray-900/50 border-b border-gray-800 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
              Student Fee Dashboard
            </h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Finance Management System</p>
          </div>
          
          <div className="flex gap-3">
            <button onClick={() => {}} className="flex items-center px-4 py-2 rounded-xl border border-gray-700 hover:bg-gray-800 text-xs font-bold transition-all">
               <SparklesIcon className="h-4 w-4 mr-2 text-purple-400" /> Batch Apply
            </button>
            <button onClick={() => {}} className="flex items-center px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all">
               <PlusCircleIcon className="h-4 w-4 mr-2" /> New Record
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 mt-10">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <SummaryCard title="Total Students" value={initialStudentsData.length} icon={UserGroupIcon} accentColor="blue" />
          <SummaryCard title="Revenue" value={`$${feeRecords.reduce((a,b) => a + b.amountPaid, 0).toLocaleString()}`} icon={CheckCircleIcon} accentColor="emerald" />
          <SummaryCard title="Outstanding" value={`$${feeRecords.reduce((a,b) => a + b.calculatedBalanceDue, 0).toLocaleString()}`} icon={ExclamationTriangleIcon} accentColor="rose" />
          <SummaryCard title="Total Records" value={feeRecords.length} icon={ClipboardDocumentCheckIcon} accentColor="indigo" />
        </div>

        {/* Analytics & Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <ChartContainer title="Monthly Revenue Flow">
              <Bar 
                data={chartData} 
                options={{ 
                    maintainAspectRatio: false, 
                    plugins: { legend: { display: false } },
                    scales: { y: { grid: { color: '#1f2937' }, ticks: { color: '#9ca3af' } }, x: { grid: { display: false }, ticks: { color: '#9ca3af' } } } 
                }} 
              />
            </ChartContainer>
          </div>
          <div className="lg:col-span-1">
            <ChartContainer title="Payment Distribution">
              <Pie data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af', font: { size: 10, weight: 'bold' } } } } }} />
            </ChartContainer>
          </div>
        </div>

        {/* Main Data Table Card */}
        <div className="bg-gray-900/40 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
          {/* Table Toolbar */}
          <div className="p-6 border-b border-gray-800 flex flex-wrap gap-4 items-center justify-between bg-gray-800/20">
            <div className="relative flex-grow max-w-md">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input 
                type="text"
                placeholder="Search students or IDs..."
                className="w-full bg-gray-950/50 border border-gray-700/50 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all text-gray-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <select className="bg-gray-950/50 border border-gray-700/50 rounded-xl text-[11px] font-bold px-4 py-2 focus:ring-1 focus:ring-indigo-500 text-gray-400">
                <option>All Classes</option>
              </select>
              <select className="bg-gray-950/50 border border-gray-700/50 rounded-xl text-[11px] font-bold px-4 py-2 focus:ring-1 focus:ring-indigo-500 text-gray-400">
                <option>All Statuses</option>
              </select>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="text-[10px] uppercase tracking-widest text-gray-500 bg-gray-800/40">
                <tr>
                  <th className="py-4 px-6 font-black">Student Details</th>
                  <th className="py-4 px-6 font-black">Class & Session</th>
                  <th className="py-4 px-6 font-black">Total Due</th>
                  <th className="py-4 px-6 font-black text-center">Payment Status</th>
                  <th className="py-4 px-6 font-black text-right">Balance Due</th>
                  <th className="py-4 px-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {paginatedRecords.map((record: any) => (
                  <FeeRecordRow 
                    key={record.id} 
                    record={record} 
                    onLogPayment={handleLogPayment}
                      onEditRecord={handleEditFeeRecord}
                      onDeleteRecord={handleDeleteFeeRecord}
                    // onLogPayment={() => {}} 
                    // onEditRecord={() => {}} 
                    // onDeleteRecord={() => {}} 
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-gray-800 flex items-center justify-between bg-gray-800/10">
              <p className="text-xs text-gray-500">
                Showing <span className="text-gray-300 font-bold">Page {currentPage}</span> of {totalPages}
              </p>
              <div className="flex gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 transition-colors"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddEditFeeRecordModal
        isOpen={showAddEditModal}
        onClose={() => setShowAddEditModal(false)}
        feeRecord={editingFeeRecord}
        students={students}
        onSave={handleSaveFeeRecord}
        isSubmitting={isSubmitting}
      />
      <LogPaymentModal
        isOpen={showLogPaymentModal}
        onClose={() => setShowLogPaymentModal(false)}
        feeRecord={loggingPaymentFor}
        onSavePayment={handleSavePayment}
        isSubmitting={isSubmitting}
      />
      <DeleteConfirmationModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={confirmDeleteFeeRecord}
        recordName={recordToDelete?.name || "this record"}
      />
      <ApplyBatchFeeModal
        isOpen={showApplyBatchFeeModal}
        onClose={() => setShowApplyBatchFeeModal(false)}
        onApply={handleApplyBatchFee}
        isSubmitting={isSubmitting}
        uniqueClasses={uniqueClasses}
        uniqueAcademicLevels={uniqueAcademicLevels}
      />
    </main>
  );
};

export default FeesClient;



const AddEditFeeRecordModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  feeRecord?: StudentFeeRecord | null;
  students: Student[];
  onSave: (data: { studentId?: string; academicYear?: string; term?: string; dueDate?: string | null; invoiceNumber?: string | null }) => void;
  isSubmitting: boolean;
}> = ({ isOpen, onClose, feeRecord, students, onSave, isSubmitting }) => {
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
    <Modal title={feeRecord ? "Edit Fee Record" : "New Fee Record"} isOpen={isOpen} onClose={onClose}>
      <div className="bg-gray-800 text-gray-100 p-8 rounded-xl shadow-2xl w-full max-w-md mx-auto">
        <h2 className="text-3xl font-bold text-indigo-400 mb-6 text-center">
          {feeRecord ? "Edit Fee Record Details" : "Create New Fee Record"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {!feeRecord ? (
            <>
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Select Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">-- Select a Student --</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName} ({student.admissionNumber})
                    </option>
                  ))}
                </select>
              </div>
              <input
                name="academicYear"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="Academic Year (e.g., 2024/2025)"
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500"
                required
              />
              <input
                name="term"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Term (e.g., Term 1)"
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500"
                required
              />
            </>
          ) : (
            <>
              <div className="p-3 bg-gray-700 rounded-lg">
                <p className="text-gray-300"><strong>Student:</strong> {feeRecord.student?.firstName} {feeRecord.student?.lastName}</p>
                <p className="text-gray-300"><strong>Year/Term:</strong> {feeRecord.academicYear} / {feeRecord.term}</p>
                <p className="text-gray-300"><strong>Fees Due:</strong> ${feeRecord.calculatedTotalFeesDue.toFixed(2)}</p>
                <p className="text-gray-300"><strong>Balance:</strong> ${feeRecord.calculatedBalanceDue.toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Invoice Number</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="Invoice Number (optional)"
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </>
          )}

          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition font-semibold" disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition font-semibold flex items-center disabled:bg-indigo-400" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : <><CheckCircleIcon className="h-5 w-5 mr-2" /> {feeRecord ? "Save Changes" : "Create Record"}</>}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};


const LogPaymentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  feeRecord: StudentFeeRecord | null;
  onSavePayment: (recordId: string, payment: { amount: number; date: string; method: string; receiptNumber?: string }) => void;
  isSubmitting: boolean;
}> = ({ isOpen, onClose, feeRecord, onSavePayment, isSubmitting }) => {
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [receiptNumber, setReceiptNumber] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setPaymentAmount(0);
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('');
      setReceiptNumber('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feeRecord && paymentAmount > 0 && paymentMethod) {
      onSavePayment(feeRecord.id, { amount: paymentAmount, date: paymentDate, method: paymentMethod, receiptNumber });
    } else {
      toast.error("Please enter a valid amount and method.");
    }
  };

  const studentName = feeRecord?.student?.firstName && feeRecord?.student?.lastName
    ? `${feeRecord.student.firstName} ${feeRecord.student.lastName}`
    : feeRecord?.studentId || 'N/A Student';

  return (
    <Modal title={`Log Payment for ${studentName}`} isOpen={isOpen} onClose={onClose}>
      <div className="bg-gray-800 text-gray-100 p-8 rounded-xl shadow-2xl w-full max-w-md mx-auto">
        <h2 className="text-3xl font-bold text-indigo-400 mb-6 text-center">
          Log Payment for {studentName}
        </h2>
        <div className="mb-4 p-3 bg-gray-700 rounded-lg">
          <p className="text-gray-300"><strong>Total Fees Due:</strong> ${feeRecord?.calculatedTotalFeesDue.toFixed(2) || '0.00'}</p>
          <p className="text-gray-300"><strong>Amount Paid:</strong> <span className="text-green-400">${feeRecord?.amountPaid.toFixed(2) || '0.00'}</span></p>
          <p className="text-gray-300"><strong>Balance Due:</strong> <span className="text-red-400">${feeRecord?.calculatedBalanceDue.toFixed(2) || '0.00'}</span></p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">Payment Amount</label>
            <input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(parseFloat(e.target.value))} placeholder="Amount" className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500" required step="0.01" min="0.01" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">Payment Date</label>
            <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500" required />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">Payment Method</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500" required>
              <option value="">Select Method</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="M-Pesa">M-Pesa</option>
              <option value="Card">Card</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">Receipt Number (Optional)</label>
            <input type="text" value={receiptNumber} onChange={(e) => setReceiptNumber(e.target.value)} placeholder="Receipt Number" className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition font-semibold" disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition font-semibold flex items-center disabled:bg-indigo-400" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : <><CheckCircleIcon className="h-5 w-5 mr-2" /> Log Payment</>}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};


// NEW: Apply Batch Fee Modal
const ApplyBatchFeeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onApply: (params: { academicYear: string; term: string; targetType: "CLASS" | "ACADEMIC_LEVEL" | "ALL"; targetValue?: string }) => void;
  isSubmitting: boolean;
  uniqueClasses: string[];
  uniqueAcademicLevels: string[];
}> = ({ isOpen, onClose, onApply, isSubmitting, uniqueClasses, uniqueAcademicLevels }) => {
  const [academicYear, setAcademicYear] = useState<string>('');
  const [term, setTerm] = useState<string>('');
  const [targetType, setTargetType] = useState<"CLASS" | "ACADEMIC_LEVEL" | "ALL">('ALL');
  const [targetValue, setTargetValue] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      // Reset form on open
      setAcademicYear('');
      setTerm('');
      setTargetType('ALL');
      setTargetValue('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!academicYear || !term) {
      toast.error("Academic Year and Term are required.");
      return;
    }
    if ((targetType === "CLASS" || targetType === "ACADEMIC_LEVEL") && !targetValue) {
      toast.error("Please select a specific class or academic level.");
      return;
    }

    onApply({ academicYear, term, targetType, targetValue: targetType === "ALL" ? undefined : targetValue });
  };

  return (
    <Modal title="Apply Fees in Batch" isOpen={isOpen} onClose={onClose}>
      <div className="bg-gray-800 text-gray-100 p-8 rounded-xl shadow-2xl w-full max-w-md mx-auto">
        <h2 className="text-3xl font-bold text-indigo-400 mb-6 text-center">
          Apply Fees in Batch
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="academicYear"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            placeholder="Academic Year (e.g., 2024/2025)"
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            name="term"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Term (e.g., Term 1)"
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500"
            required
          />

          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">Apply To</label>
            <select
              value={targetType}
              onChange={(e) => {
                setTargetType(e.target.value as "CLASS" | "ACADEMIC_LEVEL" | "ALL");
                setTargetValue(''); // Reset target value when type changes
              }}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Students</option>
              <option value="CLASS">Students in a Specific Class</option>
              <option value="ACADEMIC_LEVEL">Students in a Specific Academic Level</option>
            </select>
          </div>

          {(targetType === "CLASS" || targetType === "ACADEMIC_LEVEL") && (
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">Select {targetType === "CLASS" ? "Class" : "Academic Level"}</label>
              <select
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">-- Select --</option>
                {targetType === "CLASS" && uniqueClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
                {targetType === "ACADEMIC_LEVEL" && uniqueAcademicLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition font-semibold" disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition font-semibold flex items-center disabled:bg-indigo-400" disabled={isSubmitting}>
              {isSubmitting ? "Applying..." : <><SparklesIcon className="h-5 w-5 mr-2" /> Apply Fees</>}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};


const DeleteConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  recordName: string;
}> = ({ isOpen, onClose, onConfirm, recordName }) => (
  <Modal title="Confirm Deletion" isOpen={isOpen} onClose={onClose}>
    <div className="bg-gray-800 text-gray-100 p-8 rounded-xl shadow-2xl w-full max-w-sm mx-auto text-center">
      <ExclamationTriangleIcon className="h-20 w-20 text-red-500 mx-auto mb-6" />
      <h2 className="text-2xl font-bold text-red-400 mb-4">Confirm Deletion</h2>
      <p className="text-lg text-gray-300 mb-7">
        Are you sure you want to delete the fee record for <span className="font-bold text-white">"{recordName}"</span>? This action cannot be undone.
      </p>
      <div className="flex justify-center space-x-5">
        <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition font-semibold">Cancel</button>
        <button type="button" onClick={onConfirm} className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition font-semibold flex items-center">
          <TrashIcon className="h-5 w-5 mr-2" /> Delete
        </button>
      </div>
    </div>
  </Modal>
);