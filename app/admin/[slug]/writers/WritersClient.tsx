"use client";

import React, { useState, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
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
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Modal from "@/components/Modal"; // Assuming you have a generic Modal component

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export type UserForWriter = {
  id: string;
  name: string | null;
  email: string;
};

export type CompanyForWriter = {
  id: string;
  name: string;
};

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

interface ClientProps {
  writersData: Writer[];
  companyId: string;
}

// -----------------------------------------------------------------------------
// Helper Components
// -----------------------------------------------------------------------------

const SummaryCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  gradientClass: string;
  hoverClass: string;
}> = ({ title, value, icon: Icon, gradientClass, hoverClass }) => (
  <div
    className={`p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50
                text-white flex flex-col justify-between h-36
                transition-all duration-300 ease-in-out ${gradientClass} ${hoverClass}`}
  >
    <div className="flex items-center justify-between">
      <h2 className="text-xs font-bold uppercase opacity-90 tracking-wider">{title}</h2>
      <Icon className="h-6 w-6 opacity-80" />
    </div>
    <p className="text-4xl font-extrabold text-right drop-shadow-sm">
      {value}
    </p>
  </div>
);

const WriterCard: React.FC<{
  writer: Writer;
  onEdit: (writer: Writer) => void;
  onDelete: (id: string) => void;
}> = ({ writer, onEdit, onDelete }) => {
  const handleCopyCode = () => {
    if (writer.loginCode) {
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
      ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
      : writer.status === 'On Leave'
      ? 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800'
      : 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30 border border-red-200 dark:border-red-800';

  return (
    <div className="relative bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm dark:shadow-xl border border-gray-100 dark:border-gray-700/80 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-md dark:hover:shadow-2xl">
      
      {/* Header & Status */}
      <div className="flex items-start justify-between mb-4">
        {writer.profilePicture ? (
          <img 
            src={writer.profilePicture} 
            alt={`${writer.user.name}'s profile`} 
            className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500 shadow-sm"
          />
        ) : (
          <UserCircleIcon className="w-14 h-14 text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-700 rounded-full p-1" />
        )}
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${statusColor}`}>
          {writer.status}
        </span>
      </div>

      {/* Basic Info */}
      <div className="pb-3 border-b border-gray-100 dark:border-gray-700/60">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-0.5 truncate">
          {writer.user.name || 'Anonymous Writer'}
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-400 flex items-center truncate">
          <IdentificationIcon className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
          {writer.user.email}
        </p>
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-2 gap-y-3 gap-x-4 my-4 text-xs">
        <div className="flex flex-col">
          <span className="text-gray-400 dark:text-gray-400 font-medium flex items-center mb-0.5">
            <BookOpenIcon className="h-3.5 w-3.5 mr-1 text-indigo-500 dark:text-indigo-400" />Total Articles
          </span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {writer.totalArticles}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 dark:text-gray-400 font-medium flex items-center mb-0.5">
            <CalendarDaysIcon className="h-3.5 w-3.5 mr-1 text-emerald-500 dark:text-emerald-400" />This Month
          </span>
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {writer.articlesThisMonth}
          </span>
        </div>
        <div className="col-span-2 flex flex-col">
          <span className="text-gray-400 dark:text-gray-400 font-medium flex items-center mb-0.5">
            <CalendarDaysIcon className="h-3.5 w-3.5 mr-1 text-gray-400" />Last Contribution
          </span>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {formattedLastArticleDate}
          </span>
        </div>
      </div>
      
      {/* Login Code Container */}
      <div className="p-2.5 bg-gray-50 dark:bg-gray-700/40 rounded-xl flex items-center justify-between mt-4 border border-gray-100 dark:border-transparent">
        <div className="flex items-center min-w-0">
          <KeyIcon className="h-4 w-4 text-rose-500 dark:text-rose-400 mr-2.5 flex-shrink-0" />
          <span className="text-gray-700 dark:text-gray-300 font-mono text-sm tracking-wider truncate">
            {writer.loginCode}
          </span>
        </div>
        <button
          onClick={handleCopyCode}
          className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-white dark:hover:bg-gray-600 rounded-md transition duration-150 flex-shrink-0 shadow-sm border border-transparent dark:border-none"
          aria-label="Copy login code"
        >
          <ClipboardDocumentIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Form Action Controls */}
      <div className="flex justify-end space-x-2 mt-5 pt-3 border-t border-gray-100 dark:border-gray-700/60">
        <button
          className="flex items-center px-3.5 py-1.5 bg-gray-50 dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 hover:text-indigo-600 rounded-lg transition font-medium text-xs border border-gray-200 dark:border-transparent"
          onClick={() => onEdit(writer)}
        >
          <PencilSquareIcon className="h-3.5 w-3.5 mr-1" /> Edit
        </button>
        <button
          className="flex items-center px-3.5 py-1.5 bg-rose-50 dark:bg-red-950/40 hover:bg-rose-100 text-rose-600 dark:text-red-400 rounded-lg transition font-medium text-xs border border-rose-100 dark:border-transparent"
          onClick={() => onDelete(writer.id)}
        >
          <TrashIcon className="h-3.5 w-3.5 mr-1" /> Delete
        </button>
      </div>
    </div>
  );
};

const AddEditWriterModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  writer?: Writer | null;
  onSave: (writer: Partial<Writer>) => void;
  isSubmitting: boolean;
}> = ({ isOpen, onClose, writer, onSave, isSubmitting }) => {
  const [formData, setFormData] = useState<Partial<Writer & { name?: string; email?: string }>>({});

  React.useEffect(() => {
    setFormData(
      writer
        ? {
            ...writer,
            name: writer.user.name || "",
            email: writer.user.email || "",
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
            lastArticleDate: '',
            status: 'Active',
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
      <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-8 rounded-2xl shadow-2xl w-full max-w-lg mx-auto border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
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
              placeholder="Phone Number" 
              Icon={PhoneIcon}
            />
            <InputWithIcon 
              type="text" 
              name="address" 
              value={formData.address || ""} 
              onChange={handleChange} 
              placeholder="Address" 
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
            placeholder="Profile Picture URL" 
            Icon={PhotoIcon}
          />

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
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
              <label htmlFor="lastArticleDate" className="block text-gray-400 text-xs font-semibold mb-1">Last Article Date</label>
              <input
                type="date"
                name="lastArticleDate"
                id="lastArticleDate"
                value={formData.lastArticleDate || ''}
                onChange={handleChange}
                className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm outline-none"
              />
            </div>
            <div className="col-span-1">
              <label htmlFor="status" className="block text-gray-400 text-xs font-semibold mb-1">Status</label>
              <select
                name="status"
                id="status"
                value={formData.status || 'Active'}
                onChange={handleChange}
                className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm outline-none"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-250 text-gray-700 dark:text-white rounded-xl transition font-semibold text-sm"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition font-semibold text-sm flex items-center disabled:bg-indigo-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : <><CheckCircleIcon className="h-4 w-4 mr-1.5" /> {writer ? "Save Changes" : "Add Writer"}</>}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

const InputWithIcon: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { Icon: React.ElementType }> = ({ Icon, className, ...props }) => (
  <div className={`relative ${className}`}>
    <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
    <input
      {...props}
      className="w-full p-2.5 pl-9 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 text-sm outline-none transition focus:border-indigo-500 dark:focus:border-indigo-500"
    />
  </div>
);

const TextAreaWithIcon: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { Icon: React.ElementType }> = ({ Icon, ...props }) => (
  <div className="relative">
    <Icon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
    <textarea
      {...props}
      rows={3}
      className="w-full p-2.5 pl-9 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 text-sm outline-none resize-none transition focus:border-indigo-500 dark:focus:border-indigo-500"
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
    <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-6 rounded-2xl shadow-2xl w-full max-w-sm mx-auto text-center border border-gray-100 dark:border-gray-700">
      <ExclamationTriangleIcon className="h-14 w-14 text-rose-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-gray-950 dark:text-white mb-2">Remove Content Creator</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Are you sure you want to drop <span className="font-semibold text-gray-900 dark:text-white">"{writerName}"</span>? This step is permanent.
      </p>
      <div className="flex justify-center space-x-3">
        <button onClick={onClose} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-xl transition font-medium text-sm">Cancel</button>
        <button onClick={onConfirm} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition font-medium text-sm flex items-center">
          <TrashIcon className="h-4 w-4 mr-1.5" /> Delete Account
        </button>
      </div>
    </div>
  </Modal>
);

// -----------------------------------------------------------------------------
// Main WritersClient Component
// -----------------------------------------------------------------------------
const WritersClient: React.FC<ClientProps> = ({ writersData, companyId }) => {
  const [writers, setWriters] = useState<Writer[]>(writersData);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const itemsPerPage = 6;

  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingWriter, setEditingWriter] = useState<Writer | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [writerToDelete, setWriterToDelete] = useState<string | null>(null);

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

  const totalPages = Math.ceil(filteredWriters.length / itemsPerPage);
  const paginatedWriters = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredWriters.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredWriters, currentPage, itemsPerPage]);

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
    const toastId = toast.loading(editingWriter ? 'Updating roster...' : 'Onboarding creator...');

    try {
      const endpoint = editingWriter ? `${apiBaseUrl}/admin/writers/${editingWriter.id}` : `${apiBaseUrl}/admin/writers`;
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
        throw new Error(errorData.message || 'Roster update failed.');
      }

      const freshDataRes = await fetch(`${apiBaseUrl}/admin/writers?companyId=${companyId}`, { next: { revalidate: 60 } });
      const updatedWriters: Writer[] = await freshDataRes.json();
      
      setWriters(updatedWriters);
      toast.success(editingWriter ? 'Writer detailed altered.' : 'New talent synced! 🚀', { id: toastId });
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
    const toastId = toast.loading('Removing credentials...');

    try {
      const response = await fetch(`${apiBaseUrl}/admin/writers/${writerToDelete}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Could not detach writer identity.');
      setWriters(writers.filter((w) => w.id !== writerToDelete));
      toast.success('Roster profile removed.', { id: toastId });
      setShowDeleteConfirmModal(false);
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
      setWriterToDelete(null);
    }
  };

  return (
    <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="max-w-6xl mx-auto">

        {/* Header Element */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 border-b border-gray-200/60 dark:border-gray-700/60 pb-6 gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Writers & Roster Management
          </h1>
          <button onClick={handleAddWriter} className="flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition-all font-semibold text-sm">
            <PlusCircleIcon className="h-5 w-5 mr-1.5" /> Onboard Creator
          </button>
        </div>

        {/* Filter Input UI */}
        <div className="mb-10">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-3 pl-11 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm shadow-sm outline-none"
            />
            <UsersIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Overview Row */}
        <section className="mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <SummaryCard 
              title="Active Rosters" 
              value={totalWriters} 
              icon={UsersIcon} 
              gradientClass="bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-900/60 dark:to-indigo-950/40"
              hoverClass="hover:shadow-indigo-500/5 dark:hover:shadow-none"
            />
            <SummaryCard 
              title="Combined Ledger" 
              value={totalArticlesOverall} 
              icon={BookOpenIcon} 
              gradientClass="bg-gradient-to-br from-slate-700 to-slate-800 dark:from-gray-800 dark:to-gray-800/50"
              hoverClass="hover:shadow-slate-500/5 dark:hover:shadow-none"
            />
            <SummaryCard 
              title="Volume This Month" 
              value={articlesThisMonthOverall} 
              icon={CalendarDaysIcon} 
              gradientClass="bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-950/40 dark:to-emerald-950/20"
              hoverClass="hover:shadow-emerald-500/5 dark:hover:shadow-none"
            />
          </div>
        </section>

        {/* Core Profile Profiles UI Matrix */}
        <section className="mb-10">
          {paginatedWriters.length === 0 ? (
            <div className="bg-white dark:bg-gray-800/50 p-12 rounded-2xl text-center border border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-lg text-gray-400 dark:text-gray-500 font-medium">No results match your lookup logic.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedWriters.map((writer) => (
                <WriterCard key={writer.id} writer={writer} onEdit={handleEditWriter} onDelete={handleDeleteWriter} />
              ))}
            </div>
          )}
        </section>

        {/* Dynamic Pager Components */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-3 mt-10">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition disabled:opacity-40 text-xs shadow-sm"
            >
              Back
            </button>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{`Page ${currentPage} of ${totalPages}`}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition disabled:opacity-40 text-xs shadow-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>

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