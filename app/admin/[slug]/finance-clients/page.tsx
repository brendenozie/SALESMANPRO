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


const apiBaseUrl = "/api";//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

interface PageProps {
  params:Promise<{ slug: string }>
}

type ClientStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: ClientStatus;
}

interface Client {
  id: string;
  user: User;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  status: ClientStatus;
}

export default function ClientsPage() {
  const { slug : companyId } = useParams();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [formState, setFormState] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    status: "ACTIVE",
  });



  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${apiBaseUrl}/admin/finance-clients?companyId=${companyId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data: { data: Client[] } = (await res.json()).data || [];
      setClients(data.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreateOrUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const url = isEditing
      ? `${apiBaseUrl}/admin/finance-clients/${currentClient?.id}`
      : `${apiBaseUrl}/admin/finance-clients?companyId=${companyId}`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Credentials": "include",
        },
        body: JSON.stringify(formState),
      });

      if (!res.ok) {
        throw new Error("API request failed");
      }

      await fetchClients();
      setShowModal(false);
      setIsEditing(false);
      setCurrentClient(null);
      setFormState({ name: "", email: "", phone: "", status: "ACTIVE" });
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "creating"} client:`,
        error
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        const res = await fetch(`${apiBaseUrl}/admin/finance-clients/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          throw new Error("API request failed");
        }
        await fetchClients();
      } catch (error) {
        console.error("Error deleting client:", error);
      }
    }
  };

  const handleEditClick = (client: Client) => {
    setCurrentClient(client);
    setIsEditing(true);
    setFormState({
      name: client.user.name,
      email: client.user.email,
      phone: client.user.phone,
      status: client.user.status,
    });
    setShowModal(true);
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentClient(null);
    setFormState({ name: "", email: "", phone: "", status: "ACTIVE" });
    setShowModal(true);
  };

  const filteredClients =
    clients.length > 0
      ? clients.filter(
          (client) =>
            client.user?.name
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            client.user?.email
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        )
      : [];

  return (
    // ✅ your full JSX stays the same, no design changes
    // (not trimming because JSX is already provided)
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 md:p-10 bg-gray-900 min-h-screen text-gray-100"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-400 mb-2">Client Management</h1>
          <p className="text-gray-400">View, manage, and add new clients to your account.</p>
        </div>
        <button
          onClick={handleAddClick}
          className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center shadow-lg"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" /> Add New Client
        </button>
      </div>

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search clients by name or email..."
          className="w-full bg-gray-800 border border-gray-700 rounded-full py-3 pl-12 pr-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
      </div>

      {loading ? (
        <div className="text-center text-gray-400">Loading clients...</div>
      ) : (
        <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
          {/* Table View for larger screens */}
          <div className="hidden md:block">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <AnimatePresence>
                  {filteredClients.length > 0 && filteredClients.map((client) => (
                    <motion.tr
                      key={client.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{client.user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{client.user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{client.user.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${client.user.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}
                        >
                          {client.user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            onClick={() => handleEditClick(client)}
                          >
                            <PencilIcon className="h-5 w-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            onClick={() => handleDelete(client.id)}
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
              {filteredClients.length > 0 && filteredClients.map((client) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-700 rounded-lg p-4 shadow-md flex justify-between items-center"
                >
                  <div>
                    <h4 className="text-lg font-bold text-white">{client.user.name}</h4>
                    <p className="text-gray-400 text-sm">{client.user.email}</p>
                    <p className="text-gray-400 text-sm">{client.user.phone}</p>
                    <span
                      className={`mt-2 px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${client.user.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}
                    >
                      {client.user.status}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-full bg-gray-600 text-blue-400 hover:text-blue-300 transition-colors"
                      onClick={() => handleEditClick(client)}
                    >
                      <PencilIcon className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-full bg-gray-600 text-red-400 hover:text-red-300 transition-colors"
                      onClick={() => handleDelete(client.id)}
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

      {/* Modal for Add/Edit Client */}
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
                <h2 className="text-2xl font-bold text-blue-400">{isEditing ? 'Edit Client' : 'Add New Client'}</h2>
                <button onClick={() => setShowModal(false)}>
                  <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-white" />
                </button>
              </div>
              <form onSubmit={handleCreateOrUpdate} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-400">Name</label>
                  <input
                    type="text"
                    id="name"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-400">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-400">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    value={formState.phone}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-400">Status</label>
                  <select
                    id="status"
                    value={formState.status}
                    onChange={(e) => setFormState({ ...formState, status: e.target.value  as "ACTIVE" | "INACTIVE" | "SUSPENDED", })}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
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
                    {isEditing ? 'Save Changes' : 'Add Client'}
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
