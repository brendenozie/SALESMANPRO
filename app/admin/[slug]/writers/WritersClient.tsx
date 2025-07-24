// app/admin/[companyId]/writers/WritersClient.tsx
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
  PhoneIcon, // Added for phone number
  MapPinIcon, // Added for address
  IdentificationIcon, // Added for bio
  PhotoIcon, // Added for profile picture
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
  // Add other User fields from your schema if you need to display them
};

export type CompanyForWriter = {
  id: string;
  name: string;
  // Add other Company fields from your schema if you need to display them
};

// ✨ Updated Writer type to reflect the full structure from the API
export type Writer = {
  id: string;
  userId: string;
  user: UserForWriter; // User object is now included
  companyId: string;
  company: CompanyForWriter; // Company object is now included
  phone: string | null;
  bio: string | null;
  address: string | null;
  profilePicture: string | null;
  loginCode: string; // As per schema, it's not optional
  totalArticles: number;
  articlesThisMonth: number;
  lastArticleDate: string | null; // Date of their last published article (ISO string)
  status: string; // 'Active' | 'Inactive' | 'On Leave'
  createdAt: string; // DateTime returned as ISO string
  updatedAt: string; // DateTime returned as ISO string
  password?: string; // Only for client-side form for new writer creation
};

// ✨ Props for the client component
interface ClientProps {
  writersData: Writer[];
  companyId: string;
}

// -----------------------------------------------------------------------------
// Helper Components (Renamed and Adapted)
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

const WriterCard: React.FC<{
  writer: Writer;
  onEdit: (writer: Writer) => void;
  onDelete: (id: string) => void;
}> = ({ writer, onEdit, onDelete }) => {
  const handleCopyCode = () => {
    if (writer.loginCode) {
      document.execCommand('copy', false, writer.loginCode); // Use document.execCommand for clipboard in iframe
      toast.success("Login code copied to clipboard!");
    }
  };

  const formattedLastArticleDate = writer.lastArticleDate
    ? new Date(writer.lastArticleDate).toLocaleDateString()
    : "N/A";

  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100 p-7 rounded-xl shadow-xl border-b-4 border-indigo-600 hover:border-indigo-400 transition-all duration-300 flex flex-col justify-between">
      <div>
        <h3 className="text-3xl font-extrabold text-indigo-400 mb-2 truncate">
          {writer.user.name || 'N/A'} {/* Access name from nested user object */}
        </h3>
        <p className="text-sm text-gray-300 mb-1 flex items-center">
          <span className="font-semibold w-24">Email:</span>
          <span className="text-gray-200 ml-2 truncate">{writer.user.email || 'N/A'}</span> {/* Access email from nested user object */}
        </p>
        {writer.phone && (
          <p className="text-sm text-gray-300 mb-1 flex items-center">
            <span className="font-semibold w-24">Phone:</span>
            <span className="text-gray-200 ml-2">{writer.phone}</span>
          </p>
        )}
        <p className="text-sm text-gray-300 mb-1 flex items-center">
          <span className="font-semibold w-24">Status:</span>
          <span
            className={`text-gray-200 ml-2 capitalize font-bold ${
              writer.status === 'Active'
                ? 'text-green-400'
                : writer.status === 'On Leave'
                ? 'text-yellow-400'
                : 'text-red-400'
            }`}
          >
            {writer.status}
          </span>
        </p>
      </div>

      <div className="my-4 p-3 bg-gray-700/50 rounded-lg flex items-center justify-between">
        <div className="flex items-center">
          <KeyIcon className="h-5 w-5 text-yellow-400 mr-3" />
          <span className="text-gray-300 font-mono text-lg tracking-widest">
            {writer.loginCode}
          </span>
        </div>
        <button
          onClick={handleCopyCode}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-md transition"
          aria-label="Copy login code"
        >
          <ClipboardDocumentIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-4 text-sm">
        <div className="flex flex-col">
          <span className="text-gray-400 font-medium">Total Articles:</span>
          <span className="text-green-400 text-lg font-bold">
            {writer.totalArticles}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 font-medium">Articles This Month:</span>
          <span className="text-yellow-400 text-lg font-bold">
            {writer.articlesThisMonth}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 font-medium">Last Article Date:</span>
          <span className="text-blue-400 font-bold">
            {formattedLastArticleDate}
          </span>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-700">
        <button
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
          onClick={() => onEdit(writer)}
        >
          <PencilSquareIcon className="h-5 w-5 mr-1" /> Edit
        </button>
        <button
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition"
          onClick={() => onDelete(writer.id)}
        >
          <TrashIcon className="h-5 w-5 mr-1" /> Delete
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
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-gray-800 text-gray-100 p-8 rounded-xl shadow-2xl w-full max-w-md mx-auto">
        <h2 className="text-3xl font-bold text-indigo-400 mb-6 text-center">
          {writer ? "Edit Writer" : "Add New Writer"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            placeholder="Writer Name"
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            placeholder="Writer Email"
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500"
            required
          />
          {!writer && ( // Only show password field for new writer creation
            <input
              type="password"
              name="password"
              value={formData.password || ""}
              onChange={handleChange}
              placeholder="Password (optional, auto-generated if empty)"
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500"
            />
          )}
          <input
            type="tel"
            name="phone"
            value={formData.phone || ""}
            onChange={handleChange}
            placeholder="Phone Number (Optional)"
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500"
          />
          <textarea
            name="bio"
            value={formData.bio || ""}
            onChange={handleChange}
            placeholder="Bio (Optional)"
            rows={3}
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500 resize-y"
          />
          <input
            type="text"
            name="address"
            value={formData.address || ""}
            onChange={handleChange}
            placeholder="Address (Optional)"
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            name="profilePicture"
            value={formData.profilePicture || ""}
            onChange={handleChange}
            placeholder="Profile Picture URL (Optional)"
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="number"
            name="totalArticles"
            value={formData.totalArticles || 0}
            onChange={handleChange}
            placeholder="Total Articles"
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500"
            min="0"
          />
          <input
            type="number"
            name="articlesThisMonth"
            value={formData.articlesThisMonth || 0}
            onChange={handleChange}
            placeholder="Articles This Month"
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500"
            min="0"
          />
          <label htmlFor="lastArticleDate" className="block text-gray-300 text-sm font-semibold mb-1">Last Article Date:</label>
          <input
            type="date"
            name="lastArticleDate"
            id="lastArticleDate"
            value={formData.lastArticleDate || ''}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500"
          />
          <select
            name="status"
            value={formData.status || 'Active'} // Ensure default matches schema
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Leave">On Leave</option>
          </select>

          {writer && (
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">Login Code</label>
              <input
                type="text"
                value={writer.loginCode || "N/A"}
                readOnly
                className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-gray-400 cursor-not-allowed font-mono"
              />
            </div>
          )}
          <div className="flex justify-end space-x-4 mt-6">
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
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition font-semibold flex items-center disabled:bg-indigo-400"
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

const DeleteConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  writerName: string;
}> = ({ isOpen, onClose, onConfirm, writerName }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <div className="bg-gray-800 text-gray-100 p-8 rounded-xl shadow-2xl w-full max-w-sm mx-auto text-center">
      <ExclamationTriangleIcon className="h-20 w-20 text-red-500 mx-auto mb-6" />
      <h2 className="text-2xl font-bold text-red-400 mb-4">Confirm Deletion</h2>
      <p className="text-lg text-gray-300 mb-7">
        Are you sure you want to delete writer <span className="font-bold text-white">"{writerName}"</span>? This action cannot be undone.
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
// Main WritersClient Component
// -----------------------------------------------------------------------------
const WritersClient: React.FC<ClientProps> = ({ writersData, companyId }) => {
  // ✨ State Management
  const [writers, setWriters] = useState<Writer[]>(writersData);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const itemsPerPage = 6;

  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingWriter, setEditingWriter] = useState<Writer | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [writerToDelete, setWriterToDelete] = useState<string | null>(null);

  // ✨ Memoized calculations for performance
  const filteredWriters = useMemo(() => {
    return writers.filter((writer) =>
      writer.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || // Search by user's name
      writer.user.email.toLowerCase().includes(searchTerm.toLowerCase()) // Search by user's email
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

  // Pagination logic
  const totalPages = Math.ceil(filteredWriters.length / itemsPerPage);
  const paginatedWriters = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredWriters.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredWriters, currentPage, itemsPerPage]);

  // Chart data (adapted for writers)
  const chartData = useMemo(() => ({
    labels: filteredWriters.map((writer) => writer.user.name || writer.user.email), // Use user's name or email for labels
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

  // ✨ API Operations
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
      
      // Construct the body to match the API's expected structure
      const bodyToSend = {
        name: formData.name,
        email: formData.email,
        companyId: companyId, // Ensure companyId is always sent
        phone: formData.phone,
        bio: formData.bio,
        address: formData.address,
        profilePicture: formData.profilePicture,
        loginCode: formData.loginCode, // loginCode is sent for both add/edit
        totalArticles: formData.totalArticles,
        articlesThisMonth: formData.articlesThisMonth,
        lastArticleDate: formData.lastArticleDate, // Already formatted as string or null
        status: formData.status,
        password: formData.password, // Only relevant for POST, API will ignore for PUT if not needed
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

      // Refresh local data state by re-fetching
      const freshDataRes = await fetch(`/api/admin/writers?companyId=${companyId}`, { cache: "no-store" });
      const updatedWriters: Writer[] = await freshDataRes.json();
      
      setWriters(updatedWriters); // Set the state directly with the fresh, correctly typed data

      toast.success(editingWriter ? 'Writer updated successfully!' : 'Writer added successfully!', { id: toastId });
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
      toast.success('Writer deleted successfully!', { id: toastId });
      setShowDeleteConfirmModal(false);
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
      setWriterToDelete(null);
    }
  };

  return (
    <main className="flex-grow container mx-auto px-6 py-12 bg-gray-900 min-h-screen text-gray-100">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <h1 className="text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600 mb-6 md:mb-0 drop-shadow-lg text-center md:text-left">
            Writers Dashboard
          </h1>
          <button onClick={handleAddWriter} className="flex items-center px-8 py-4 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 text-lg font-semibold">
            <PlusCircleIcon className="h-7 w-7 mr-3" /> Add New Writer
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-10">
          <div className="relative w-full max-w-lg mx-auto">
            <input
              type="text"
              placeholder="Search writers by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-4 pl-12 rounded-full bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-xl transition-all duration-300"
            />
            <UsersIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>

        {/* Summary Section (Adapted for writers) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <SummaryCard title="Total Writers" value={totalWriters} icon={UsersIcon} gradientClass="from-indigo-600 to-purple-700" />
          <SummaryCard title="Overall Articles" value={totalArticlesOverall} icon={BookOpenIcon} gradientClass="from-green-600 to-teal-700" />
          <SummaryCard title="Articles This Month" value={articlesThisMonthOverall} icon={CalendarDaysIcon} gradientClass="from-yellow-600 to-orange-700" />
        </div>

        {/* Chart Section (Adapted for writers) */}
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl flex flex-col mb-12 border border-gray-700">
          <h2 className="text-3xl font-bold text-gray-100 mb-6 border-b border-gray-700 pb-4">Content Performance Overview</h2>
          <div style={{ height: '400px' }}>
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "top" as const, labels: { color: "#ddd" } } },
                scales: {
                  x: {
                    ticks: { color: "#ddd" },
                    grid: { color: "#444" }
                  },
                  y: {
                    ticks: { color: "#ddd", beginAtZero: true },
                    grid: { color: "#444" }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Writers List */}
        <section>
          <h2 className="text-3xl font-bold text-gray-100 mb-8 border-b border-gray-700 pb-4">All Writers</h2>
          {paginatedWriters.length === 0 ? (
            <div className="bg-gray-800 p-16 rounded-xl shadow-2xl text-center">
              <p className="text-2xl text-gray-400 font-semibold">No writers found matching your criteria. 😞</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition"
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-12">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-5 py-2 bg-gray-700 rounded-lg text-white font-semibold shadow-md hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-indigo-600 text-white rounded-md font-bold">{`Page ${currentPage} of ${totalPages}`}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-5 py-2 bg-gray-700 rounded-lg text-white font-semibold shadow-md hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
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
