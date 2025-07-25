// app/admin/fees/FeesClient.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import toast, { Toaster } from "react-hot-toast";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import {
  BookOpenIcon,
  CreditCardIcon,
  BanknotesIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusCircleIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  UserGroupIcon, // For total students
  ClipboardDocumentCheckIcon, // For total fee records
  CalendarDaysIcon, // For due date
} from "@heroicons/react/24/outline";
import Modal from "@/components/Modal"; // Assuming you have a generic Modal component

// ✨ Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Import types from lib/data.ts
import {
  Student,
  FeeItem,
  StudentFeeRecord as PrismaStudentFeeRecord,
} from "@/lib/data";

// Define the extended StudentFeeRecord type for the frontend, including calculated fields
export type StudentFeeRecord = Omit<PrismaStudentFeeRecord, 'appliedFeeItems' | 'payments'> & {
  calculatedTotalFeesDue: number;
  calculatedBalanceDue: number;
  appliedFeeItems: Array<{
    feeItemId: string;
    name: string;
    amount: number;
    description?: string;
    isMandatory?: boolean;
  }>;
  payments: Array<{
    paymentId: string;
    amount: number;
    date: string;
    method: string;
    receiptNumber?: string;
  }>;
  student?: Student; // Optionally include student details for display
};

// Props for the client component
interface FeesClientProps {
  initialFeeRecordsData: StudentFeeRecord[];
  initialStudentsData: Student[];
  initialFeeItemsData: FeeItem[]; // For reference, though not directly used in this specific UI
  schoolId: string; // Passed from server component
}

// -----------------------------------------------------------------------------
// Helper Components
// -----------------------------------------------------------------------------

const SummaryCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  gradientClass: string;
}> = ({ title, value, icon: Icon, gradientClass }) => (
  <div
    className={`p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105
               text-white flex flex-col items-center justify-center text-center ${gradientClass}`}
  >
    <Icon className="h-10 w-10 mb-3 text-white opacity-90" />
    <h2 className="text-xl font-semibold mb-1">{title}</h2>
    <p className="text-4xl font-extrabold">{value}</p>
  </div>
);

const FeeRecordRow: React.FC<{
  record: StudentFeeRecord;
  onLogPayment: (record: StudentFeeRecord) => void;
  onEditRecord: (record: StudentFeeRecord) => void;
  onDeleteRecord: (id: string, studentName: string) => void;
}> = ({ record, onLogPayment, onEditRecord, onDeleteRecord }) => {
  const getStatusColor = (status: StudentFeeRecord['paymentStatus']) => {
    switch (status) {
      case 'Paid': return 'bg-green-600';
      case 'Partially Paid': return 'bg-yellow-600';
      case 'Unpaid': return 'bg-red-600';
      case 'Overpaid': return 'bg-blue-600';
      default: return 'bg-gray-500';
    }
  };

  const studentName = record.student?.firstName && record.student?.lastName
    ? `${record.student.firstName} ${record.student.lastName}`
    : record.studentId || 'N/A Student'; // Fallback if student object isn't populated

  return (
    <tr className="border-b border-gray-700 hover:bg-gray-700 transition-colors duration-200">
      <td className="py-4 px-6 font-medium text-white">{studentName}</td>
      <td className="py-4 px-6">{record.student?.currentClass || record.academicYear || 'N/A'}</td> {/* record.studentClass Use student.currentClass if available */}
      <td className="py-4 px-6">{record.academicYear}</td>
      <td className="py-4 px-6">{record.term}</td>
      <td className="py-4 px-6">${record.calculatedTotalFeesDue.toFixed(2)}</td>
      <td className="py-4 px-6 text-green-400 font-semibold">${record.amountPaid.toFixed(2)}</td>
      <td className="py-4 px-6 text-red-400 font-semibold">${record.calculatedBalanceDue.toFixed(2)}</td>
      <td className="py-4 px-6">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.paymentStatus)} text-white`}>
          {record.paymentStatus}
        </span>
      </td>
      <td className="py-4 px-6">{record.lastPaymentDate || 'N/A'}</td>
      <td className="py-4 px-6 text-right">
        <div className="flex space-x-2 justify-end">
          <button
            onClick={() => onLogPayment(record)}
            className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            title="Log New Payment"
          >
            <CreditCardIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onEditRecord(record)}
            className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            title="Edit Fee Record Details"
          >
            <PencilSquareIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDeleteRecord(record.id, studentName)}
            className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            title="Delete Fee Record"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

const AddEditFeeRecordModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  feeRecord?: StudentFeeRecord | null; // Null for add, object for edit
  students: Student[]; // List of students to select from for new records
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
        // Editing existing record
        setSelectedStudentId(feeRecord.studentId);
        setAcademicYear(feeRecord.academicYear);
        setTerm(feeRecord.term);
        setDueDate(feeRecord.dueDate || '');
        setInvoiceNumber(feeRecord.invoiceNumber || '');
      } else {
        // Adding new record - reset form
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
      // Editing existing record: only dueDate and invoiceNumber are editable via this modal
      onSave({ dueDate: dueDate || null, invoiceNumber: invoiceNumber || null });
    } else {
      // Adding new record: studentId, academicYear, term
      if (!selectedStudentId || !academicYear || !term) {
        toast.error("Please fill all required fields for a new fee record.");
        return;
      }
      onSave({ studentId: selectedStudentId, academicYear, term });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
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
              {/* Display read-only info for existing record */}
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
      setPaymentAmount(0); // Reset on open
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
    <Modal isOpen={isOpen} onClose={onClose}>
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


const DeleteConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  recordName: string;
}> = ({ isOpen, onClose, onConfirm, recordName }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <div className="bg-gray-800 text-gray-100 p-8 rounded-xl shadow-2xl w-full max-w-sm mx-auto text-center">
      <ExclamationTriangleIcon className="h-20 w-20 text-red-500 mx-auto mb-6" />
      <h2 className="text-2xl font-bold text-red-400 mb-4">Confirm Deletion</h2>
      <p className="text-lg text-gray-300 mb-7">
        Are you sure you want to delete the fee record for <span className="font-bold text-white">"{recordName}"</span>? This action cannot be undone.
      </p>
      <div className="flex justify-center space-x-5">
        <button onClick={onClose} className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition font-semibold">Cancel</button>
        <button onClick={onConfirm} className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition font-semibold flex items-center">
          <TrashIcon className="h-5 w-5 mr-2" /> Delete
        </button>
      </div>
    </div>
  </Modal>
);

// -----------------------------------------------------------------------------
// Main FeesClient Component
// -----------------------------------------------------------------------------
const FeesClient: React.FC<FeesClientProps> = ({ initialFeeRecordsData, initialStudentsData, initialFeeItemsData, schoolId }) => {
  // ✨ State Management
  const [feeRecords, setFeeRecords] = useState<StudentFeeRecord[]>(initialFeeRecordsData);
  const [students, setStudents] = useState<Student[]>(initialStudentsData);
  const [feeItems, setFeeItems] = useState<FeeItem[]>(initialFeeItemsData); // Keep for reference, even if not directly displayed
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterClass, setFilterClass] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const itemsPerPage = 8;

  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingFeeRecord, setEditingFeeRecord] = useState<StudentFeeRecord | null>(null);
  const [showLogPaymentModal, setShowLogPaymentModal] = useState(false);
  const [loggingPaymentFor, setLoggingPaymentFor] = useState<StudentFeeRecord | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<{ id: string; name: string } | null>(null);

  // Extract unique classes and academic years for filters
  const uniqueClasses = useMemo(() => {
    const classes = new Set(students.map(s => s.currentClass).filter(Boolean) as string[]);
    return Array.from(classes).sort();
  }, [students]);

  const uniqueAcademicYears = useMemo(() => {
    const years = new Set(feeRecords.map(record => record.academicYear));
    return Array.from(years).sort();
  }, [feeRecords]);

  // ✨ Memoized calculations for performance
  const filteredRecords = useMemo(() => {
    return feeRecords.filter((record) => {
      const studentName = record.student?.firstName && record.student?.lastName
        ? `${record.student.firstName} ${record.student.lastName}`
        : ''; // Get full name for search
      const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            record.studentId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = filterClass === "" || record.student?.currentClass === filterClass; // Filter by student's currentClass
      const matchesStatus = filterStatus === "" || record.paymentStatus === filterStatus;
      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [feeRecords, searchTerm, filterClass, filterStatus]);

  const { totalFeesDue, totalAmountPaid, totalOutstandingBalance, paidCount, partiallyPaidCount, unpaidCount, overpaidCount } = useMemo(() => {
    return feeRecords.reduce(
      (acc, record) => {
        acc.totalFeesDue += record.calculatedTotalFeesDue;
        acc.totalAmountPaid += record.amountPaid;
        acc.totalOutstandingBalance += record.calculatedBalanceDue;
        if (record.paymentStatus === 'Paid') acc.paidCount++;
        if (record.paymentStatus === 'Partially Paid') acc.partiallyPaidCount++;
        if (record.paymentStatus === 'Unpaid') acc.unpaidCount++;
        if (record.paymentStatus === 'Overpaid') acc.overpaidCount++;
        return acc;
      },
      { totalFeesDue: 0, totalAmountPaid: 0, totalOutstandingBalance: 0, paidCount: 0, partiallyPaidCount: 0, unpaidCount: 0, overpaidCount: 0 }
    );
  }, [feeRecords]);

  // Pagination logic
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredRecords, currentPage, itemsPerPage]);

  // Chart data for Total Fees vs. Amount Paid by Academic Year
  const feesChartData = useMemo(() => {
    const years = Array.from(new Set(feeRecords.map(r => r.academicYear))).sort();
    return {
      labels: years.length > 0 ? years : ['No Data'],
      datasets: [
        {
          label: "Total Fees Due",
          data: years.map(year => feeRecords.filter(r => r.academicYear === year).reduce((sum, r) => sum + r.calculatedTotalFeesDue, 0)),
          backgroundColor: "rgba(79, 70, 229, 0.8)", // Indigo
          borderColor: "#4F46E5",
          borderWidth: 1,
          borderRadius: 5,
        },
        {
          label: "Total Amount Paid",
          data: years.map(year => feeRecords.filter(r => r.academicYear === year).reduce((sum, r) => sum + r.amountPaid, 0)),
          backgroundColor: "rgba(16, 185, 129, 0.8)", // Green (for paid amounts)
          borderColor: "#10B981",
          borderWidth: 1,
          borderRadius: 5,
        },
      ],
    };
  }, [feeRecords]);

  // Chart data for Payment Status Distribution (Pie Chart)
  const statusChartData = useMemo(() => {
    const totalRecords = feeRecords.length;
    if (totalRecords === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          data: [1], // Placeholder for no data
          backgroundColor: ['#4A5568'],
          borderColor: '#2D3748',
          borderWidth: 1,
        }],
      };
    }
    return {
      labels: ['Paid', 'Partially Paid', 'Unpaid', 'Overpaid'],
      datasets: [{
        data: [paidCount, partiallyPaidCount, unpaidCount, overpaidCount],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)', // Green for Paid
          'rgba(251, 191, 36, 0.8)', // Yellow for Partially Paid
          'rgba(239, 68, 68, 0.8)',  // Red for Unpaid
          'rgba(99, 102, 241, 0.8)', // Blue for Overpaid
        ],
        borderColor: [
          '#10B981', '#F59E0B', '#EF4444', '#6366F1'
        ],
        borderWidth: 1,
      }],
    };
  }, [paidCount, partiallyPaidCount, unpaidCount, overpaidCount, feeRecords.length]);


  // ✨ API Operations
  const refreshData = async () => {
    setIsSubmitting(true); // Set submitting state during refresh
    try {
      // Fetch fee records
      const feesRes = await fetch(`/api/admin/student-fee-records`, { cache: "no-store" });
      if (feesRes.ok) {
        const updatedFees: StudentFeeRecord[] = await feesRes.json();
        setFeeRecords(updatedFees);
      } else {
        console.error("[FeesClient] Failed to re-fetch fee records.");
      }

      // Fetch students (in case new students were added elsewhere)
      const studentsRes = await fetch(`/api/admin/students`, { cache: "no-store" });
      if (studentsRes.ok) {
        const updatedStudents: Student[] = await studentsRes.json();
        setStudents(updatedStudents);
      } else {
        console.error("[FeesClient] Failed to re-fetch students.");
      }

      // Fetch fee items (in case new fee items were added elsewhere)
      const feeItemsRes = await fetch(`/api/admin/fee-items`, { cache: "no-store" });
      if (feeItemsRes.ok) {
        const updatedFeeItems: FeeItem[] = await feeItemsRes.json();
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

  const handleAddFeeRecord = () => {
    setEditingFeeRecord(null); // Clear any previous editing context
    setShowAddEditModal(true);
  };

  const handleEditFeeRecord = (record: StudentFeeRecord) => {
    setEditingFeeRecord(record);
    setShowAddEditModal(true);
  };

  const handleSaveFeeRecord = async (formData: { studentId?: string; academicYear?: string; term?: string; dueDate?: string | null; invoiceNumber?: string | null }) => {
    setIsSubmitting(true);
    const toastId = toast.loading(editingFeeRecord ? 'Updating fee record...' : 'Creating new fee record...');

    try {
      let response;
      if (editingFeeRecord) {
        // Editing: Only dueDate and invoiceNumber are updated via this PUT
        response = await fetch(`/api/admin/student-fee-records/${editingFeeRecord.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dueDate: formData.dueDate, invoiceNumber: formData.invoiceNumber }),
        });
      } else {
        // Creating new record: studentId, academicYear, term
        response = await fetch(`/api/admin/student-fee-records`, {
          method: 'POST',
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

      await refreshData(); // Re-fetch to get the latest data including calculated fields
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
      const response = await fetch(`/api/admin/student-fee-records/${recordId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to log payment.');
      }

      await refreshData(); // Re-fetch to update amounts and status
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
      const response = await fetch(`/api/admin/student-fee-records/${recordToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete fee record.');
      await refreshData(); // Re-fetch to ensure data consistency
      toast.success('Fee record deleted successfully!', { id: toastId });
      setShowDeleteConfirmModal(false);
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
      setRecordToDelete(null);
    }
  };

  return (
    <main className="flex-grow container mx-auto px-6 py-12 bg-gray-900 min-h-screen text-gray-100 font-inter">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <h1 className="text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600 mb-6 md:mb-0 drop-shadow-lg text-center md:text-left">
            Student Fee Dashboard
          </h1>
          <button onClick={handleAddFeeRecord} className="flex items-center px-8 py-4 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 text-lg font-semibold">
            <PlusCircleIcon className="h-7 w-7 mr-3" /> Create New Fee Record
          </button>
        </div>

        {/* Search & Filters */}
        <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search by student name or ID..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full p-4 pl-12 rounded-full bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-xl transition-all duration-300"
            />
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
            {searchTerm && (<button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"><XMarkIcon className="h-6 w-6" /></button>)}
          </div>

          <select
            value={filterClass}
            onChange={(e) => { setFilterClass(e.target.value); setCurrentPage(1); }}
            className="w-full p-4 rounded-full bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-xl transition-all duration-300"
          >
            <option value="">All Classes</option>
            {uniqueClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="w-full p-4 rounded-full bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-xl transition-all duration-300"
          >
            <option value="">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Overpaid">Overpaid</option>
          </select>
        </div>


        {/* Summary Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <SummaryCard title="Total Students" value={students.length} icon={UserGroupIcon} gradientClass="from-blue-600 to-cyan-700" />
          <SummaryCard title="Total Fee Records" value={feeRecords.length} icon={ClipboardDocumentCheckIcon} gradientClass="from-indigo-600 to-purple-700" />
          <SummaryCard title="Total Fees Due" value={`$${totalFeesDue.toFixed(2)}`} icon={BanknotesIcon} gradientClass="from-yellow-600 to-orange-700" />
          <SummaryCard title="Outstanding Balance" value={`$${totalOutstandingBalance.toFixed(2)}`} icon={ExclamationTriangleIcon} gradientClass="from-red-600 to-pink-700" />
        </div>

        {/* Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl flex flex-col border border-gray-700">
            <h2 className="text-3xl font-bold text-gray-100 mb-6 border-b border-gray-700 pb-4">Fees Overview by Academic Year</h2>
            <div style={{ height: '400px' }}>
              <Bar data={feesChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "top", labels: { color: "#ddd" } } }, scales: { x: { ticks: { color: "#ddd" } }, y: { ticks: { color: "#ddd" } } } }} />
            </div>
          </div>
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl flex flex-col border border-gray-700">
            <h2 className="text-3xl font-bold text-gray-100 mb-6 border-b border-gray-700 pb-4">Payment Status Distribution</h2>
            <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {feeRecords.length > 0 ? (
                  <Pie data={statusChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "right", labels: { color: "#ddd" } } } }} />
                ) : (
                  <p className="text-xl text-gray-400">No data to display chart.</p>
                )}
            </div>
          </div>
        </div>


        {/* Student Fee Records List (Table) */}
        <section>
          <h2 className="text-3xl font-bold text-gray-100 mb-8 border-b border-gray-700 pb-4">All Student Fee Records</h2>
          {isSubmitting && paginatedRecords.length === 0 ? (
            <div className="bg-gray-800 p-16 rounded-xl shadow-2xl text-center text-xl text-gray-400 font-semibold">
              Loading fee records...
            </div>
          ) : paginatedRecords.length === 0 ? (
            <div className="bg-gray-800 p-16 rounded-xl shadow-2xl text-center">
              <p className="text-2xl text-gray-400 font-semibold">No fee records found matching your criteria. 😞</p>
              {(searchTerm || filterClass || filterStatus) && (<button onClick={() => { setSearchTerm(""); setFilterClass(""); setFilterStatus(""); }} className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition">Clear Filters</button>)}
            </div>
          ) : (
            <div className="overflow-x-auto bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
              <table className="min-w-full divide-y divide-gray-700 text-gray-300">
                <thead className="bg-gray-700">
                  <tr>
                    <th scope="col" className="py-3.5 px-6 text-left text-sm font-semibold text-gray-100">Student Name</th>
                    <th scope="col" className="py-3.5 px-6 text-left text-sm font-semibold text-gray-100">Class</th>
                    <th scope="col" className="py-3.5 px-6 text-left text-sm font-semibold text-gray-100">Year</th>
                    <th scope="col" className="py-3.5 px-6 text-left text-sm font-semibold text-gray-100">Term</th>
                    <th scope="col" className="py-3.5 px-6 text-left text-sm font-semibold text-gray-100">Fees Due</th>
                    <th scope="col" className="py-3.5 px-6 text-left text-sm font-semibold text-gray-100">Amount Paid</th>
                    <th scope="col" className="py-3.5 px-6 text-left text-sm font-semibold text-gray-100">Balance Due</th>
                    <th scope="col" className="py-3.5 px-6 text-left text-sm font-semibold text-gray-100">Status</th>
                    <th scope="col" className="py-3.5 px-6 text-left text-sm font-semibold text-gray-100">Last Payment</th>
                    <th scope="col" className="relative py-3.5 px-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {paginatedRecords.map((record) => (
                    <FeeRecordRow
                      key={record.id}
                      record={record}
                      onLogPayment={handleLogPayment}
                      onEditRecord={handleEditFeeRecord}
                      onDeleteRecord={handleDeleteFeeRecord}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-12">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="px-5 py-2 bg-gray-700 rounded-lg text-white font-semibold shadow-md hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
            <span className="px-4 py-2 bg-indigo-600 text-white rounded-md font-bold">{`Page ${currentPage} of ${totalPages}`}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="px-5 py-2 bg-gray-700 rounded-lg text-white font-semibold shadow-md hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddEditFeeRecordModal
        isOpen={showAddEditModal}
        onClose={() => setShowAddEditModal(false)}
        feeRecord={editingFeeRecord}
        students={students} // Pass the list of students
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
    </main>
  );
};

export default FeesClient;
