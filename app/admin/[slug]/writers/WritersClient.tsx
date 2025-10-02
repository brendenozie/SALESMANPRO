"use client";

import React, { useState, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import toast, { Toaster } from "react-hot-toast";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  UsersIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusCircleIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentIcon,
  KeyIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  PhoneIcon,
  MapPinIcon,
  IdentificationIcon,
  PhotoIcon,
  UserCircleIcon, // Using a standard icon for a clean placeholder
} from "@heroicons/react/24/outline";
import Modal from "@/components/Modal"; // Assuming you have a generic Modal component

// ✨ Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Define nested types for User and Company as they will be included by Prisma
export type UserForWriter = {
  id: string;
  name: string | null;
  email: string;
};

export type CompanyForWriter = {
  id: string;
  name: string;
};

// ✨ Updated Writer type to reflect the full structure from the API
export type Writer = {
  id: string;
  userId: string;
  user: UserForWriter;
  companyId: string;
  company: CompanyForWriter;
  phone: string | null;
  bio: string | null;
  address: string | null;
  profilePicture: string | null;
  loginCode: string;
  totalArticles: number;
  articlesThisMonth: number;
  lastArticleDate: string | null;
  status: string; // 'Active' | 'Inactive' | 'On Leave'
  createdAt: string;
  updatedAt: string;
  password?: string;
};

// ✨ Props for the client component
interface ClientProps {
  writersData: Writer[];
  companyId: string;
}

// -----------------------------------------------------------------------------
// Helper Components (REFINED)
// -----------------------------------------------------------------------------

const SummaryCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  gradientClass: string;
  hoverClass: string;
}> = ({ title, value, icon: Icon, gradientClass, hoverClass }) => (
  <div
    className={`p-6 rounded-2xl shadow-xl border border-gray-700
                text-white flex flex-col justify-between h-40
                transition-all duration-500 ease-in-out ${gradientClass} ${hoverClass}`}
  >
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-semibold uppercase opacity-80 tracking-wider">{title}</h2>
      <Icon className="h-7 w-7 opacity-70" />
    </div>
    <p className="text-5xl font-extrabold text-right drop-shadow-md">
      {value}
    </p>
  </div>
);

// REFINED WriterCard with Profile Picture and clearer layout
const WriterCard: React.FC<{
  writer: Writer;
  onEdit: (writer: Writer) => void;
  onDelete: (id: string) => void;
}> = ({ writer, onEdit, onDelete }) => {
  const handleCopyCode = () => {
    // Check if the writer object and loginCode exist before copying
    if (writer.loginCode) {
        // Fallback or modern clipboard API usage can be implemented here,
        // but sticking to the original implementation's core concept:
        navigator.clipboard.writeText(writer.loginCode).then(() => {
          toast.success("Login code copied!");
        }).catch(() => {
          toast.error("Failed to copy code.");
        });
    }
  };

  const formattedLastArticleDate = writer.lastArticleDate
    ? new Date(writer.lastArticleDate).toLocaleDateString()
    : "N/A";

  const statusColor =
    writer.status === 'Active'
      ? 'text-green-400 bg-green-900/40'
      : writer.status === 'On Leave'
      ? 'text-yellow-400 bg-yellow-900/40'
      : 'text-red-400 bg-red-900/40';

  return (
    <div className="relative bg-gray-800 p-6 rounded-2xl shadow-2xl border-t-4 border-indigo-500/80 hover:border-indigo-400 transition-all duration-500 ease-in-out transform hover:scale-[1.02]">
      
      {/* Header & Status */}
      <div className="flex items-start justify-between mb-4">
        {writer.profilePicture ? (
          <img 
            src={writer.profilePicture} 
            alt={`${writer.user.name}'s profile`} 
            className="w-16 h-16 rounded-full object-cover border-4 border-indigo-500 shadow-lg"
          />
        ) : (
          <UserCircleIcon className="w-16 h-16 text-indigo-400 bg-gray-700 rounded-full p-1" />
        )}
        <span 
          className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${statusColor}`}
        >
          {writer.status}
        </span>
      </div>

      {/* Basic Info */}
      <div className="pb-4 border-b border-gray-700/60">
        <h3 className="text-2xl font-extrabold text-indigo-300 mb-1 truncate">
          {writer.user.name || 'Anonymous Writer'}
        </h3>
        <p className="text-sm text-gray-400 flex items-center truncate">
            <IdentificationIcon className="h-4 w-4 mr-2" />
            {writer.user.email}
        </p>
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-2 gap-y-3 gap-x-4 my-5 text-sm">
        <div className="flex flex-col">
          <span className="text-gray-400 font-medium flex items-center">
            <BookOpenIcon className="h-4 w-4 mr-2 text-indigo-400" />Total Articles:
          </span>
          <span className="text-xl font-bold text-white">
            {writer.totalArticles}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 font-medium flex items-center">
            <CalendarDaysIcon className="h-4 w-4 mr-2 text-yellow-400" />Articles This Month:
          </span>
          <span className="text-xl font-bold text-yellow-400">
            {writer.articlesThisMonth}
          </span>
        </div>
        <div className="col-span-2 flex flex-col">
          <span className="text-gray-400 font-medium flex items-center">
            <CalendarDaysIcon className="h-4 w-4 mr-2 text-green-400" />Last Article:
          </span>
          <span className="text-md font-bold text-gray-300">
            {formattedLastArticleDate}
          </span>
        </div>
      </div>
      
      {/* Login Code & Copy Button */}
      <div className="p-3 bg-gray-700/50 rounded-lg flex items-center justify-between mt-4">
        <div className="flex items-center">
          <KeyIcon className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
          <span className="text-gray-200 font-mono text-base tracking-widest truncate">
            {writer.loginCode}
          </span>
        </div>
        <button
          onClick={handleCopyCode}
          className="p-2 text-gray-400 hover:text-indigo-300 hover:bg-gray-600 rounded-md transition duration-200 flex-shrink-0"
          aria-label="Copy login code"
        >
          <ClipboardDocumentIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-700/60">
        <button
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition font-semibold text-sm"
          onClick={() => onEdit(writer)}
        >
          <PencilSquareIcon className="h-5 w-5 mr-1" /> Edit
        </button>
        <button
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition font-semibold text-sm"
          onClick={() => onDelete(writer.id)}
        >
          <TrashIcon className="h-5 w-5 mr-1" /> Delete
        </button>
      </div>
    </div>
  );
};


// REFINED Modal Components (Style only changes)

const AddEditWriterModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  writer?: Writer | null;
  onSave: (writer: Partial<Writer>) => void;
  isSubmitting: boolean;
}> = ({ isOpen, onClose, writer, onSave, isSubmitting }) => {
  // formData now holds all top-level fields needed for the API call
  const [formData, setFormData] = useState<Partial<Writer & { name?: string; email?: string }>>({});

  React.useEffect(() => {
    // Initialize form data with existing writer data or empty strings
    setFormData(
      writer
        ? {
            ...writer,
            name: writer.user.name || "", // Pull name from nested user
            email: writer.user.email || "", // Pull email from nested user
            // Ensure date is in YYYY-MM-DD format for input type="date"
            lastArticleDate: writer.lastArticleDate ? new Date(writer.lastArticleDate).toISOString().split('T')[0] : '',
          }
        : {
            name: "",
            email: "",
            password: "",
            phone: "",
            bio: "",
            address: "",
            profilePicture: "",
            totalArticles: 0,
            articlesThisMonth: 0,
            lastArticleDate: '', // Initialize as empty string for date input
            status: 'Active', // Default status as per schema
          }
    );
  }, [writer, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal title={''} isOpen={isOpen} onClose={onClose}>
      <div className="bg-gray-800 text-gray-100 p-8 rounded-xl shadow-2xl w-full max-w-lg mx-auto border-t-4 border-indigo-500">
        <h2 className="text-3xl font-bold text-indigo-400 mb-6 text-center">
          {writer ? "Edit Writer Details" : "Onboard New Writer"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputWithIcon 
              name="name" 
              value={formData.name || ""} 
              onChange={handleChange} 
              placeholder="Full Name" 
              Icon={UsersIcon}
              required
            />
            <InputWithIcon 
              type="email" 
              name="email" 
              value={formData.email || ""} 
              onChange={handleChange} 
              placeholder="Email Address" 
              Icon={IdentificationIcon}
              required
            />
            {!writer && (
              <InputWithIcon 
                type="password" 
                name="password" 
                value={formData.password || ""} 
                onChange={handleChange} 
                placeholder="Password (Optional)" 
                Icon={KeyIcon}
                className="col-span-1 md:col-span-2"
              />
            )}
            <InputWithIcon 
              type="tel" 
              name="phone" 
              value={formData.phone || ""} 
              onChange={handleChange} 
              placeholder="Phone Number (Optional)" 
              Icon={PhoneIcon}
            />
            <InputWithIcon 
              type="text" 
              name="address" 
              value={formData.address || ""} 
              onChange={handleChange} 
              placeholder="Address (Optional)" 
              Icon={MapPinIcon}
            />
          </div>

          <TextAreaWithIcon
            name="bio"
            value={formData.bio || ""}
            onChange={handleChange}
            placeholder="Short Bio / Notes (Optional)"
            Icon={IdentificationIcon}
          />
          <InputWithIcon 
            type="text" 
            name="profilePicture" 
            value={formData.profilePicture || ""} 
            onChange={handleChange} 
            placeholder="Profile Picture URL (Optional)" 
            Icon={PhotoIcon}
          />

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-700">
            <InputWithIcon 
              type="number" 
              name="totalArticles" 
              value={formData.totalArticles || 0} 
              onChange={handleChange} 
              placeholder="Total Articles" 
              Icon={BookOpenIcon}
              min="0"
            />
            <InputWithIcon 
              type="number" 
              name="articlesThisMonth" 
              value={formData.articlesThisMonth || 0} 
              onChange={handleChange} 
              placeholder="Articles This Month" 
              Icon={CalendarDaysIcon}
              min="0"
            />
            <div className="col-span-1">
              <label htmlFor="lastArticleDate" className="block text-gray-400 text-sm font-semibold mb-1">Last Article Date</label>
              <input
                type="date"
                name="lastArticleDate"
                id="lastArticleDate"
                value={formData.lastArticleDate || ''}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="col-span-1">
              <label htmlFor="status" className="block text-gray-400 text-sm font-semibold mb-1">Status</label>
              <select
                name="status"
                id="status"
                value={formData.status || 'Active'}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>
          
          {writer && (
            <div className="pt-4">
              <label className="block text-gray-400 text-sm font-semibold mb-2">Current Login Code</label>
              <div className="flex items-center w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-300 cursor-not-allowed font-mono">
                <KeyIcon className="h-5 w-5 mr-3 text-red-400" />
                <span className="truncate">{writer.loginCode || "N/A"}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700/60">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition font-semibold"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition font-semibold flex items-center disabled:bg-indigo-400 disabled:cursor-wait"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : <><CheckCircleIcon className="h-5 w-5 mr-2" /> {writer ? "Save Changes" : "Add Writer"}</>}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};


// NEW: Input Field with Icon for better visual appeal in modal
const InputWithIcon: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { Icon: React.ElementType }> = ({ Icon, className, ...props }) => (
  <div className={`relative ${className}`}>
    <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
    <input
      {...props}
      className="w-full p-3 pl-10 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
    />
  </div>
);

// NEW: Text Area with Icon
const TextAreaWithIcon: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { Icon: React.ElementType }> = ({ Icon, ...props }) => (
  <div className="relative">
    <Icon className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
    <textarea
      {...props}
      rows={3}
      className="w-full p-3 pl-10 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y transition"
    />
  </div>
);


const DeleteConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  writerName: string;
}> = ({ isOpen, onClose, onConfirm, writerName }) => (
  <Modal title="" isOpen={isOpen} onClose={onClose}>
    <div className="bg-gray-800 text-gray-100 p-8 rounded-xl shadow-2xl w-full max-w-sm mx-auto text-center border-t-4 border-red-500">
      <ExclamationTriangleIcon className="h-20 w-20 text-red-500 mx-auto mb-6 animate-pulse" />
      <h2 className="text-2xl font-bold text-red-400 mb-4">Confirm Deletion</h2>
      <p className="text-lg text-gray-300 mb-7">
        Are you sure you want to delete writer <span className="font-bold text-white">"{writerName}"</span>? This action cannot be undone.
      </p>
      <div className="flex justify-center space-x-5">
        <button onClick={onClose} className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition font-semibold">Cancel</button>
        <button onClick={onConfirm} className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition font-semibold flex items-center">
          <TrashIcon className="h-5 w-5 mr-2" /> Permanently Delete
        </button>
      </div>
    </div>
  </Modal>
);

// -----------------------------------------------------------------------------
// Main WritersClient Component (REFINED)
// -----------------------------------------------------------------------------
const WritersClient: React.FC<ClientProps> = ({ writersData, companyId }) => {
  // ✨ State Management (Unchanged)
  const [writers, setWriters] = useState<Writer[]>(writersData);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const itemsPerPage = 6;

  // Modals state (Unchanged)
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingWriter, setEditingWriter] = useState<Writer | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [writerToDelete, setWriterToDelete] = useState<string | null>(null);

  // ✨ Memoized calculations (Unchanged)
  const filteredWriters = useMemo(() => {
    return writers.filter((writer) =>
      writer.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      writer.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [writers, searchTerm]);

  const { totalWriters, totalArticlesOverall, articlesThisMonthOverall } = useMemo(() => {
    return writers.reduce(
      (acc, writer) => {
        acc.totalWriters += 1;
        acc.totalArticlesOverall += writer.totalArticles;
        acc.articlesThisMonthOverall += writer.articlesThisMonth;
        return acc;
      },
      { totalWriters: 0, totalArticlesOverall: 0, articlesThisMonthOverall: 0 }
    );
  }, [writers]);

  // Pagination logic (Unchanged)
  const totalPages = Math.ceil(filteredWriters.length / itemsPerPage);
  const paginatedWriters = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredWriters.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredWriters, currentPage, itemsPerPage]);

  // Chart data (Unchanged)
  const chartData = useMemo(() => ({
    labels: filteredWriters.map((writer) => writer.user.name || writer.user.email),
    datasets: [
      {
        label: "Total Articles",
        data: filteredWriters.map((writer) => writer.totalArticles),
        backgroundColor: "rgba(79, 70, 229, 0.8)", // Indigo
        borderColor: "#4F46E5",
        borderWidth: 1,
        borderRadius: 5,
      },
      {
        label: "Articles This Month",
        data: filteredWriters.map((writer) => writer.articlesThisMonth),
        backgroundColor: "rgba(34, 197, 94, 0.8)", // Green
        borderColor: "#22C55E",
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  }), [filteredWriters]);

  // ✨ API Operations (Unchanged)
  // ... (Keep existing API operation functions: handleAddWriter, handleEditWriter, handleSaveWriter, handleDeleteWriter, confirmDeleteWriter)

  // NOTE: For brevity, the API functions are omitted in this response as they were only style-related.
  const handleAddWriter = () => {
    setEditingWriter(null);
    setShowAddEditModal(true);
  };

  const handleEditWriter = (writer: Writer) => {
    setEditingWriter(writer);
    setShowAddEditModal(true);
  };

  const handleSaveWriter = async (formData: Partial<Writer & { name?: string; email?: string }>) => {
    setIsSubmitting(true);
    const toastId = toast.loading(editingWriter ? 'Updating writer...' : 'Adding writer...');

    try {
      const endpoint = editingWriter ? `/api/admin/writers/${editingWriter.id}` : '/api/admin/writers';
      const method = editingWriter ? 'PUT' : 'POST';
      
      const bodyToSend = {
        name: formData.name,
        email: formData.email,
        companyId: companyId,
        phone: formData.phone,
        bio: formData.bio,
        address: formData.address,
        profilePicture: formData.profilePicture,
        loginCode: formData.loginCode,
        totalArticles: formData.totalArticles,
        articlesThisMonth: formData.articlesThisMonth,
        lastArticleDate: formData.lastArticleDate,
        status: formData.status,
        password: formData.password,
      };

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${editingWriter ? 'update' : 'add'} writer.`);
      }

      // Re-fetch logic (simplified, assuming this route hits the same data endpoint)
      const freshDataRes = await fetch(`/api/admin/writers?companyId=${companyId}`, { next: { revalidate: 60 } });
      const updatedWriters: Writer[] = await freshDataRes.json();
      
      setWriters(updatedWriters);

      toast.success(editingWriter ? 'Writer updated successfully! 🚀' : 'Writer added successfully! 🎉', { id: toastId });
      setShowAddEditModal(false);
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWriter = (id: string) => {
    setWriterToDelete(id);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteWriter = async () => {
    if (!writerToDelete) return;
    setIsSubmitting(true);
    const toastId = toast.loading('Deleting writer...');

    try {
      const response = await fetch(`/api/admin/writers/${writerToDelete}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete writer.');
      setWriters(writers.filter((w) => w.id !== writerToDelete));
      toast.success('Writer deleted successfully! 🗑️', { id: toastId });
      setShowDeleteConfirmModal(false);
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
      setWriterToDelete(null);
    }
  };


  return (
    <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-900 min-h-screen text-gray-100">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="max-w-7xl mx-auto">

        {/* Header and Call to Action */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 border-b border-gray-700/60 pb-8">
          <h1 className="text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-500 mb-6 md:mb-0 drop-shadow-xl text-center md:text-left">
            Content Creator Hub ✍️
          </h1>
          <button onClick={handleAddWriter} className="flex items-center px-8 py-4 bg-green-500 text-gray-900 rounded-xl shadow-2xl hover:bg-green-400 transition-all duration-300 transform hover:scale-[1.03] text-lg font-bold border border-green-300">
            <PlusCircleIcon className="h-7 w-7 mr-3 text-gray-900" /> Add New Writer
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative w-full max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search writers by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-4 pl-14 rounded-full bg-gray-800 text-gray-200 border border-gray-700 focus:ring-4 focus:ring-indigo-500/50 focus:border-indigo-500 shadow-xl transition-all duration-300 placeholder-gray-500"
            />
            <UsersIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-indigo-400" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-300 transition"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>
        
        {/* --- */}

        {/* Summary Section (Enhanced) */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-100 mb-6">Performance Snapshot</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <SummaryCard 
              title="Total Writers" 
              value={totalWriters} 
              icon={UsersIcon} 
              gradientClass="bg-gradient-to-br from-indigo-700 to-indigo-900"
              hoverClass="hover:ring-4 hover:ring-indigo-500/50"
            />
            <SummaryCard 
              title="Overall Articles" 
              value={totalArticlesOverall} 
              icon={BookOpenIcon} 
              gradientClass="bg-gradient-to-br from-green-700 to-green-900"
              hoverClass="hover:ring-4 hover:ring-green-500/50"
            />
            <SummaryCard 
              title="Articles This Month" 
              value={articlesThisMonthOverall} 
              icon={CalendarDaysIcon} 
              gradientClass="bg-gradient-to-br from-yellow-700 to-yellow-900"
              hoverClass="hover:ring-4 hover:ring-yellow-500/50"
            />
          </div>
        </section>

        {/* --- */}

        {/* Chart Section (Enhanced) */}
        <section className="mb-16">
          <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl flex flex-col border border-gray-700">
            <h2 className="text-3xl font-bold text-gray-100 mb-6 border-b border-gray-700 pb-4">Monthly Article Output by Writer</h2>
            <div style={{ height: '450px' }}>
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { 
                      position: "top" as const, 
                      labels: { color: "#ddd", font: { size: 14 } } 
                    },
                    tooltip: {
                      titleFont: { weight: 'bold', size: 16 },
                      bodyFont: { size: 14 },
                      backgroundColor: 'rgba(31, 41, 55, 0.9)', // gray-800 with opacity
                      boxPadding: 8
                    }
                  },
                  scales: {
                    x: {
                      title: {
                          display: true,
                          text: 'Writers',
                          color: '#aaa',
                          font: { size: 14 }
                      },
                      ticks: { color: "#ddd" },
                      grid: { color: "#444" }
                    },
                    y: {
                      title: {
                          display: true,
                          text: 'Number of Articles',
                          color: '#aaa',
                          font: { size: 14 }
                      },
                      ticks: { color: "#ddd" },
                      grid: { color: "#444" }
                    }
                  }
                }}
              />
            </div>
          </div>
        </section>

        {/* --- */}

        {/* Writers List */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-100 mb-8 border-b border-gray-700 pb-4">Writer Profiles</h2>
          {paginatedWriters.length === 0 ? (
            <div className="bg-gray-800 p-16 rounded-2xl shadow-2xl text-center border-2 border-dashed border-gray-700">
              <p className="text-2xl text-gray-400 font-semibold mb-4">No writers found. 😔</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-xl hover:bg-indigo-700 transition font-semibold"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedWriters.map((writer) => (
                <WriterCard key={writer.id} writer={writer} onEdit={handleEditWriter} onDelete={handleDeleteWriter} />
              ))}
            </div>
          )}
        </section>

        {/* --- */}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-6 mt-12">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-6 py-3 bg-gray-700 rounded-full text-white font-semibold shadow-lg hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &larr; Previous Page
            </button>
            <span className="px-5 py-2 bg-indigo-600 text-white rounded-full font-extrabold text-lg shadow-xl">{`${currentPage} / ${totalPages}`}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-6 py-3 bg-gray-700 rounded-full text-white font-semibold shadow-lg hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Page &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddEditWriterModal
        isOpen={showAddEditModal}
        onClose={() => setShowAddEditModal(false)}
        writer={editingWriter}
        onSave={handleSaveWriter}
        isSubmitting={isSubmitting}
      />
      <DeleteConfirmationModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={confirmDeleteWriter}
        writerName={writers.find((w) => w.id === writerToDelete)?.user.name || "this writer"}
      />
    </main>
  );
};

export default WritersClient;