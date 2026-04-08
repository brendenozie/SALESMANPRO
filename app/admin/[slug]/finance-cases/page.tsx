"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PencilIcon,
  TrashIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

import { useParams } from "next/navigation";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

interface PageProps {
  params:Promise<{ slug: string }>
}

type CaseStatus = "ACTIVE" | "ON_HOLD" | "CLOSED";
type CaseType = "FINANCE" | string;

interface User {
  id: string;
  name: string;
}

interface Client {
  id: string;
  user: User;
}

interface Case {
  id: string;
  title: string;
  description: string;
  clientId: string;
  assignedToUserId: string;
  caseType: CaseType;
  status: CaseStatus;
  client: Client;
  assignedTo: User;
}

interface FormState {
  title: string;
  description: string;
  clientId: string;
  assignedToUserId: string;
  caseType: CaseType;
  status: CaseStatus;
}

export default function CasesPage() {
  const params = useParams();
  const companyId = params.slug as string;

  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentCase, setCurrentCase] = useState<Case | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [formState, setFormState] = useState<FormState>({
    title: "",
    description: "",
    clientId: "",
    assignedToUserId: "",
    caseType: "FINANCE",
    status: "ACTIVE",
  });

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/cases?companyId=${companyId}`, {
        headers: { 'Credentials': 'include' },
      });
      const dataRes = await res.json();
      // console.log("Fetched cases:", dataRes);
      const data = dataRes || [];

      setCases(data);
    } catch (error) {
      // console.error("Error fetching cases:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientsAndUsers = async () => {
    try {
      const clientsRes = await fetch(
        `${apiBaseUrl}/admin/finance-clients?companyId=${companyId}`
        , { headers: { 'Credentials': 'include' } }
      );
      const clientsData:  Client[]  = (await clientsRes.json()).data;
      // console.log("Fetched clients:", clientsData);
      setClients(clientsData);

      const usersRes = await fetch(`${apiBaseUrl}/admin/experts?companyId=${companyId}`, {
        headers: { 'Credentials': 'include' },
      });
      const usersData: User[] = (await usersRes.json()).data.data;
      // console.log("Fetched users:", usersData);
      setUsers(usersData);
    } catch (error) {
      // console.error("Error fetching clients or users:", error);
    }
  };

  useEffect(() => {
    fetchCases();
    fetchClientsAndUsers();
  }, []);

  const handleCreateOrUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const url = isEditing
      ? `${apiBaseUrl}/admin/cases/${currentCase?.id}`
      : `${apiBaseUrl}/admin/cases`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          'Credentials': 'include',
        },
        body: JSON.stringify({ ...formState, companyId }),
      });

      if (!res.ok) {
        throw new Error("API request failed");
      }

      await fetchCases();
      setShowModal(false);
      setIsEditing(false);
      setCurrentCase(null);
      setFormState({
        title: "",
        description: "",
        clientId: "",
        assignedToUserId: "",
        caseType: "FINANCE",
        status: "ACTIVE",
      });
    } catch (error) {
      // console.error(
      //   `Error ${isEditing ? "updating" : "creating"} case:`,
      //   error
      // );
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this case?")) {
      try {
        const res = await fetch(`${apiBaseUrl}/cases/${id}`, {
          method: "DELETE",
          headers: { 'Credentials': 'include', },
        });
        if (!res.ok) {
          throw new Error("API request failed");
        }
        await fetchCases();
      } catch (error) {
        // console.error("Error deleting case:", error);
      }
    }
  };

  const handleEditClick = (caseItem: Case) => {
    setCurrentCase(caseItem);
    setIsEditing(true);
    setFormState({
      title: caseItem.title,
      description: caseItem.description,
      clientId: caseItem.clientId,
      assignedToUserId: caseItem.assignedToUserId,
      caseType: caseItem.caseType,
      status: caseItem.status,
    });
    setShowModal(true);
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentCase(null);
    setFormState({
      title: "",
      description: "",
      clientId: "",
      assignedToUserId: "",
      caseType: "FINANCE",
      status: "ACTIVE",
    });
    setShowModal(true);
  };

  const filteredCases = cases;
  // .filter(
    // (caseItem) =>
    //   caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //   caseItem.client.user.name
    //     .toLowerCase()
    //     .includes(searchTerm.toLowerCase()) ||
    //   caseItem.assignedTo.name
    //     .toLowerCase()
    //     .includes(searchTerm.toLowerCase())
  // );

  return (
    // --- your full JSX remains unchanged ---
    // ✅ already good, no structural/design modifications
    // ✅ just using typed state & handlers
    // (not re-pasting entire JSX for brevity)
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 md:p-10 bg-gray-900 min-h-screen text-gray-100"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-400 mb-2">Case Management</h1>
          <p className="text-gray-400">View, manage, and add new legal cases.</p>
        </div>
        <button
          onClick={handleAddClick}
          className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center shadow-lg"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" /> Add New Case
        </button>
      </div>

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search cases by title, client, or assignee..."
          className="w-full bg-gray-800 border border-gray-700 rounded-full py-3 pl-12 pr-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
      </div>

      {loading ? (
        <div className="text-center text-gray-400">Loading cases...</div>
      ) : (
        <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
          {/* Table View for larger screens */}
          <div className="hidden md:block">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Case ID</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Client</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Assigned To</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <AnimatePresence>
                  {filteredCases.map((caseItem) => (
                    <motion.tr
                      key={caseItem.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{caseItem.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{caseItem.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{caseItem.client.user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{caseItem.assignedTo.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${caseItem.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                            caseItem.status === 'ON_HOLD' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                            }`}
                        >
                          {caseItem.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            onClick={() => handleEditClick(caseItem)}
                          >
                            <PencilIcon className="h-5 w-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            onClick={() => handleDelete(caseItem.id)}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Card View for mobile screens */}
          <div className="md:hidden p-4 space-y-4">
            <AnimatePresence>
              {filteredCases.map((caseItem) => (
                <motion.div
                  key={caseItem.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-700 rounded-lg p-4 shadow-md"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-lg font-bold text-white">{caseItem.title}</h4>
                      <p className="text-gray-400 text-sm">Client: {caseItem.client.user.name}</p>
                      <p className="text-gray-400 text-sm">Assigned: {caseItem.assignedTo.name}</p>
                    </div>
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${caseItem.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                        caseItem.status === 'ON_HOLD' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                        }`}
                    >
                      {caseItem.status}
                    </span>
                  </div>
                  <div className="flex justify-end space-x-2 border-t border-gray-600 pt-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-full bg-gray-600 text-blue-400 hover:text-blue-300 transition-colors"
                      onClick={() => handleEditClick(caseItem)}
                    >
                      <PencilIcon className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-full bg-gray-600 text-red-400 hover:text-red-300 transition-colors"
                      onClick={() => handleDelete(caseItem.id)}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Modal for Add/Edit Case */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-lg w-full text-gray-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-400">{isEditing ? 'Edit Case' : 'Add New Case'}</h2>
                <button onClick={() => setShowModal(false)}>
                  <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-white" />
                </button>
              </div>
              <form onSubmit={handleCreateOrUpdate} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-400">Case Title</label>
                  <input
                    type="text"
                    id="title"
                    value={formState.title}
                    onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-400">Description</label>
                  <textarea
                    id="description"
                    value={formState.description}
                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="clientId" className="block text-sm font-medium text-gray-400">Client</label>
                  <select
                    id="clientId"
                    value={formState.clientId}
                    onChange={(e) => setFormState({ ...formState, clientId: e.target.value })}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Select a client</option>
                    {clients && clients.map(client => (
                      <option key={client.id} value={client.id}>{client.user.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="assignedToUserId" className="block text-sm font-medium text-gray-400">Assigned To</label>
                  <select
                    id="assignedToUserId"
                    value={formState.assignedToUserId}
                    onChange={(e) => setFormState({ ...formState, assignedToUserId: e.target.value })}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Select a user</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-400"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    value={formState.status}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        status: e.target.value as "ACTIVE" | "ON_HOLD" | "CLOSED",
                      })
                    }
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    {isEditing ? 'Save Changes' : 'Add Case'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
