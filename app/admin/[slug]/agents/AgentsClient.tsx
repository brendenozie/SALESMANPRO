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
  CurrencyDollarIcon,
  BanknotesIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusCircleIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentIcon,
  KeyIcon,
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

// ✨ Type definition for Agent data
export type Agent = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  loginCode?: string;
  password?: string; // For the creation form
  totalSales: number;
  totalCommissions: number;
  recentTransaction: {
    amount: number;
    date: string | null;
  };
  recentCommission: {
    amount: number;
    date: string | null;
    status: string;
  };
};

// ✨ Props for the client component
interface ClientProps {
  agentsData: Agent[];
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

const AgentCard: React.FC<{
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: (id: string) => void;
}> = ({ agent, onEdit, onDelete }) => {
  const handleCopyCode = () => {
    if (agent.loginCode) {
      navigator.clipboard.writeText(agent.loginCode);
      toast.success("Login code copied to clipboard!");
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100 p-7 rounded-xl shadow-xl border-b-4 border-indigo-600 hover:border-indigo-400 transition-all duration-300 flex flex-col justify-between">
      <div>
        <h3 className="text-3xl font-extrabold text-indigo-400 mb-2 truncate">
          {agent.name}
        </h3>
        <p className="text-sm text-gray-300 mb-1 flex items-center">
          <span className="font-semibold w-24">Email:</span>
          <span className="text-gray-200 ml-2 truncate">{agent.email}</span>
        </p>
        <p className="text-sm text-gray-300 mb-1 flex items-center">
          <span className="font-semibold w-24">Phone:</span>
          <span className="text-gray-200 ml-2">{agent.phoneNumber}</span>
        </p>
      </div>

      <div className="my-4 p-3 bg-gray-700/50 rounded-lg flex items-center justify-between">
        <div className="flex items-center">
          <KeyIcon className="h-5 w-5 text-yellow-400 mr-3" />
          <span className="text-gray-300 font-mono text-lg tracking-widest">
            {agent.loginCode}
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
          <span className="text-gray-400 font-medium">Total Sales:</span>
          <span className="text-green-400 text-lg font-bold">
            ${agent.totalSales.toFixed(2)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 font-medium">Total Commissions:</span>
          <span className="text-yellow-400 text-lg font-bold">
            ${agent.totalCommissions.toFixed(2)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 font-medium">Last Txn:</span>
          <span className="text-blue-400 font-bold">
            ${agent.recentTransaction.amount.toFixed(2)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 font-medium">Last Comm. Status:</span>
          <span
            className={`font-bold ${
              agent.recentCommission.status === "Paid"
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {agent.recentCommission.status}
          </span>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-700">
        <button
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
          onClick={() => onEdit(agent)}
        >
          <PencilSquareIcon className="h-5 w-5 mr-1" /> Edit
        </button>
        <button
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition"
          onClick={() => onDelete(agent.id)}
        >
          <TrashIcon className="h-5 w-5 mr-1" /> Delete
        </button>
      </div>
    </div>
  );
};

const AddEditAgentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  agent?: Agent | null;
  onSave: (agent: Partial<Agent>) => void;
  isSubmitting: boolean;
}> = ({ isOpen, onClose, agent, onSave, isSubmitting }) => {
  const [formData, setFormData] = useState<Partial<Agent>>({});

  React.useEffect(() => {
    setFormData(agent || { name: "", email: "", phoneNumber: "", password: "" });
  }, [agent, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          {agent ? "Edit Agent" : "Add New Agent"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input name="name" value={formData.name || ""} onChange={handleChange} placeholder="Name" className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500" required />
          <input type="email" name="email" value={formData.email || ""} onChange={handleChange} placeholder="Email" className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500" required />
          <input type="tel" name="phoneNumber" value={formData.phoneNumber || ""} onChange={handleChange} placeholder="Phone Number" className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500" required />
          {!agent && (
            <input type="password" name="password" value={formData.password || ""} onChange={handleChange} placeholder="Password (optional)" className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-indigo-500" />
          )}
          {agent && (
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">Login Code</label>
              <input type="text" value={agent.loginCode || "N/A"} readOnly className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-gray-400 cursor-not-allowed font-mono" />
            </div>
          )}
          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition font-semibold" disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition font-semibold flex items-center disabled:bg-indigo-400" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : <><CheckCircleIcon className="h-5 w-5 mr-2" /> {agent ? "Save Changes" : "Add Agent"}</>}
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
  agentName: string;
}> = ({ isOpen, onClose, onConfirm, agentName }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <div className="bg-gray-800 text-gray-100 p-8 rounded-xl shadow-2xl w-full max-w-sm mx-auto text-center">
      <ExclamationTriangleIcon className="h-20 w-20 text-red-500 mx-auto mb-6" />
      <h2 className="text-2xl font-bold text-red-400 mb-4">Confirm Deletion</h2>
      <p className="text-lg text-gray-300 mb-7">
        Are you sure you want to delete agent <span className="font-bold text-white">"{agentName}"</span>? This action cannot be undone.
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
// Main AgentsClient Component
// -----------------------------------------------------------------------------
const AgentsClient: React.FC<ClientProps> = ({ agentsData, companyId }) => {
  // ✨ State Management
  const [agents, setAgents] = useState<Agent[]>(agentsData);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const itemsPerPage = 6;

  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<string | null>(null);

  // ✨ Memoized calculations for performance
  const filteredAgents = useMemo(() => {
    return agents.filter((agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [agents, searchTerm]);

  const { totalSales, totalCommissions } = useMemo(() => {
    return agents.reduce(
      (acc, agent) => {
        acc.totalSales += agent.totalSales;
        acc.totalCommissions += agent.totalCommissions;
        return acc;
      },
      { totalSales: 0, totalCommissions: 0 }
    );
  }, [agents]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);
  const paginatedAgents = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredAgents.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredAgents, currentPage, itemsPerPage]);

  // Chart data
  const chartData = useMemo(() => ({
    labels: filteredAgents.map((agent) => agent.name),
    datasets: [
      {
        label: "Total Sales",
        data: filteredAgents.map((agent) => agent.totalSales),
        backgroundColor: "rgba(79, 70, 229, 0.8)",
        borderColor: "#4F46E5",
        borderWidth: 1,
        borderRadius: 5,
      },
      {
        label: "Total Commissions",
        data: filteredAgents.map((agent) => agent.totalCommissions),
        backgroundColor: "rgba(251, 146, 60, 0.8)",
        borderColor: "#F59E0B",
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  }), [filteredAgents]);

  // ✨ API Operations
  const handleAddAgent = () => {
    setEditingAgent(null);
    setShowAddEditModal(true);
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setShowAddEditModal(true);
  };

  const handleSaveAgent = async (formData: Partial<Agent>) => {
    setIsSubmitting(true);
    const toastId = toast.loading(editingAgent ? 'Updating agent...' : 'Adding agent...');

    try {
      const endpoint = editingAgent ? `/api/admin/agents/${editingAgent.id}` : '/api/admin/agents';
      const method = editingAgent ? 'PUT' : 'POST';
      const body = editingAgent ? JSON.stringify(formData) : JSON.stringify({ ...formData, companyId });

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${editingAgent ? 'update' : 'add'} agent.`);
      }

      // Refresh local data state by re-fetching
      const freshDataRes = await fetch(`/api/admin/agents?companyId=${companyId}`, { cache: "no-store" });
      const updatedAgents = await freshDataRes.json();
      setAgents(updatedAgents);

      toast.success(editingAgent ? 'Agent updated successfully!' : 'Agent added successfully!', { id: toastId });
      setShowAddEditModal(false);
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAgent = (id: string) => {
    setAgentToDelete(id);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteAgent = async () => {
    if (!agentToDelete) return;
    setIsSubmitting(true);
    const toastId = toast.loading('Deleting agent...');

    try {
      const response = await fetch(`/api/admin/agents/${agentToDelete}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete agent.');
      setAgents(agents.filter((a) => a.id !== agentToDelete));
      toast.success('Agent deleted successfully!', { id: toastId });
      setShowDeleteConfirmModal(false);
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
      setAgentToDelete(null);
    }
  };

  return (
    <main className="flex-grow container mx-auto px-6 py-12 bg-gray-900 min-h-screen text-gray-100">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <h1 className="text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600 mb-6 md:mb-0 drop-shadow-lg text-center md:text-left">
            Agents Dashboard
          </h1>
          <button onClick={handleAddAgent} className="flex items-center px-8 py-4 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 text-lg font-semibold">
            <PlusCircleIcon className="h-7 w-7 mr-3" /> Add New Agent
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-10">
            <div className="relative w-full max-w-lg mx-auto">
                <input type="text" placeholder="Search agents by name..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full p-4 pl-12 rounded-full bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-xl transition-all duration-300" />
                <UsersIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
                {searchTerm && (<button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"><XMarkIcon className="h-6 w-6" /></button>)}
            </div>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <SummaryCard title="Total Agents" value={agents.length} icon={UsersIcon} gradientClass="from-indigo-600 to-purple-700" />
          <SummaryCard title="Total Sales" value={`$${totalSales.toFixed(2)}`} icon={CurrencyDollarIcon} gradientClass="from-green-600 to-teal-700" />
          <SummaryCard title="Total Commissions" value={`$${totalCommissions.toFixed(2)}`} icon={BanknotesIcon} gradientClass="from-yellow-600 to-orange-700" />
        </div>

        {/* Chart Section */}
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl flex flex-col mb-12 border border-gray-700">
          <h2 className="text-3xl font-bold text-gray-100 mb-6 border-b border-gray-700 pb-4">Performance Overview</h2>
          <div style={{ height: '400px' }}>
            <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "top", labels: { color: "#ddd" } } }, scales: { x: { ticks: { color: "#ddd" } }, y: { ticks: { color: "#ddd" } } } }} />
          </div>
        </div>

        {/* Agents List */}
        <section>
          <h2 className="text-3xl font-bold text-gray-100 mb-8 border-b border-gray-700 pb-4">All Agents</h2>
          {paginatedAgents.length === 0 ? (
            <div className="bg-gray-800 p-16 rounded-xl shadow-2xl text-center">
              <p className="text-2xl text-gray-400 font-semibold">No agents found matching your criteria. 😞</p>
              {searchTerm && (<button onClick={() => setSearchTerm("")} className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition">Clear Search</button>)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedAgents.map((agent) => (<AgentCard key={agent.id} agent={agent} onEdit={handleEditAgent} onDelete={handleDeleteAgent} />))}
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
      <AddEditAgentModal isOpen={showAddEditModal} onClose={() => setShowAddEditModal(false)} agent={editingAgent} onSave={handleSaveAgent} isSubmitting={isSubmitting} />
      <DeleteConfirmationModal isOpen={showDeleteConfirmModal} onClose={() => setShowDeleteConfirmModal(false)} onConfirm={confirmDeleteAgent} agentName={agents.find(a => a.id === agentToDelete)?.name || "this agent"} />
    </main>
  );
};

export default AgentsClient;