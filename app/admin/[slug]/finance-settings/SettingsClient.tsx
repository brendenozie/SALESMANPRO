"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CogIcon,
  UserIcon,
  BellIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XCircleIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/solid";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";

interface GeneralSettings {
  name: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
}

type UserRole = "ADMIN" | "STAFF" | "MODERATOR" | "USER";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "ACTIVE" | "INACTIVE";
}

interface UserForm {
  name: string;
  email: string;
  role: UserRole;
}

interface Notifications {
  newClientNotify: boolean;
  invoicePaidNotify: boolean;
}

const TABS = [
  { id: "general", label: "General", icon: CogIcon },
  { id: "users", label: "User Management", icon: UserIcon },
  { id: "notifications", label: "Notifications", icon: BellIcon },
];

interface SettingsClientProps {
  companyId: string;
  adminSlug: string;
  userId: string;
}

export default function SettingsClient({
  companyId,
  adminSlug,
  userId,
}: SettingsClientProps) {
  // General Settings State
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    name: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
  });
  const [generalLoading, setGeneralLoading] = useState(true);

  // User Management State
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState<UserForm>({
    name: "",
    email: "",
    role: "ADMIN",
  });

  // Notifications State
  const [notifications, setNotifications] = useState<Notifications>({
    newClientNotify: false,
    invoicePaidNotify: false,
  });
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"general" | "users" | "notifications">("general");
  const [saving, setSaving] = useState(false);

  // Fetching Data
  const fetchGeneralSettings = useCallback(async () => {
    setGeneralLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/settings/company?companyId=${adminSlug || companyId}`);
      if (res.ok) {
        const data = await res.json();
        setGeneralSettings(data);
      }
    } catch (error) {
      // Handle error gracefully
    } finally {
      setGeneralLoading(false);
    }
  }, [adminSlug, companyId]);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/settings/users?companyId=${adminSlug || companyId}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      // Handle error gracefully
    } finally {
      setUsersLoading(false);
    }
  }, [adminSlug, companyId]);

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotificationsLoading(false);
      return;
    }
    setNotificationsLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/settings/notifications/${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setNotifications(data);
        }
      }
    } catch (error) {
      // Handle error gracefully
    } finally {
      setNotificationsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchGeneralSettings();
    fetchUsers();
    fetchNotifications();
  }, [fetchGeneralSettings, fetchUsers, fetchNotifications]);

  // General Settings Handlers
  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGeneralSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`${apiBaseUrl}/settings/company?companyId=${adminSlug || companyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generalSettings),
      });
    } catch (error) {
      // Handle error gracefully
    } finally {
      setSaving(false);
    }
  };

  // User Management Handlers
  const handleUserModalOpen = (user: User | null = null) => {
    if (user) {
      setIsEditingUser(true);
      setCurrentUser(user);
      setUserForm({ name: user.name, email: user.email, role: user.role });
    } else {
      setIsEditingUser(false);
      setCurrentUser(null);
      setUserForm({ name: "", email: "", role: "ADMIN" });
    }
    setUserModalOpen(true);
  };

  const handleUserFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isEditingUser
        ? `${apiBaseUrl}/settings/users/${currentUser?.id}`
        : `${apiBaseUrl}/settings/users`;
      const method = isEditingUser ? "PUT" : "POST";
      const body = isEditingUser
        ? userForm
        : { ...userForm, companyId: adminSlug || companyId };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await fetchUsers();
        setUserModalOpen(false);
      }
    } catch (error) {
      // Handle error gracefully
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await fetch(`${apiBaseUrl}/settings/users/${id}`, { method: "DELETE" });
        await fetchUsers();
      } catch (error) {
        // Handle error gracefully
      }
    }
  };

  // Notifications Handlers
  const handleNotificationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotifications((prev) => ({ ...prev, [name]: checked }));
  };

  const handleNotificationsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`${apiBaseUrl}/settings/notifications/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifications),
      });
    } catch (error) {
      // Handle error gracefully
    } finally {
      setSaving(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <motion.div
            key="general-content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {generalLoading ? (
              <div className="flex justify-center items-center h-48 text-gray-400">
                <ArrowsUpDownIcon className="w-8 h-8 animate-spin mr-3" /> Loading...
              </div>
            ) : (
              <form onSubmit={handleGeneralSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                    Firm Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={generalSettings.name}
                    onChange={handleGeneralChange}
                    className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="e.g., CapitalEdge"
                  />
                </div>
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-300 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={generalSettings.contactEmail}
                    onChange={handleGeneralChange}
                    className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="e.g., info@firm.com"
                  />
                </div>
                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    name="contactPhone"
                    value={generalSettings.contactPhone}
                    onChange={handleGeneralChange}
                    className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="e.g., +1 (123) 456-7890"
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={generalSettings.address}
                    onChange={handleGeneralChange}
                    className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="e.g., 123 Main Street, Suite 400"
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full md:w-auto mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg transition-colors hover:bg-blue-700 focus:outline-none"
                  disabled={saving}
                >
                  {saving ? (
                    <ArrowsUpDownIcon className="w-5 h-5 inline-block mr-2 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>
        );
      case "users":
        return (
          <motion.div
            key="users-content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <motion.button
              onClick={() => handleUserModalOpen()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl shadow-lg transition-colors hover:bg-green-700 focus:outline-none flex items-center"
            >
              <PlusIcon className="w-5 h-5 mr-2" /> Add New Admin User
            </motion.button>

            {usersLoading ? (
              <div className="flex justify-center items-center h-48 text-gray-400">
                <ArrowsUpDownIcon className="w-8 h-8 animate-spin mr-3" /> Loading users...
              </div>
            ) : (
              <div className="overflow-x-auto bg-gray-800 rounded-xl shadow-xl border border-gray-700">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {users.map((user) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {user.role}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.status === "ACTIVE"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <motion.button
                              onClick={() => handleUserModalOpen(user)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="text-blue-400 hover:text-blue-500"
                              title="Edit"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </motion.button>
                            <motion.button
                              onClick={() => handleDeleteUser(user.id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="text-red-400 hover:text-red-500"
                              title="Delete"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        );
      case "notifications":
        return (
          <motion.div
            key="notifications-content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {notificationsLoading ? (
              <div className="flex justify-center items-center h-48 text-gray-400">
                <ArrowsUpDownIcon className="w-8 h-8 animate-spin mr-3" /> Loading...
              </div>
            ) : (
              <form onSubmit={handleNotificationsSubmit} className="space-y-6">
                <div className="flex items-center p-4 bg-gray-800 rounded-xl border border-gray-700">
                  <input
                    id="newClientNotify"
                    name="newClientNotify"
                    type="checkbox"
                    checked={notifications.newClientNotify}
                    onChange={handleNotificationsChange}
                    className="h-5 w-5 rounded text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                  />
                  <label htmlFor="newClientNotify" className="ml-3 text-sm text-gray-300">
                    Email me on new client sign-ups
                  </label>
                </div>
                <div className="flex items-center p-4 bg-gray-800 rounded-xl border border-gray-700">
                  <input
                    id="invoicePaidNotify"
                    name="invoicePaidNotify"
                    type="checkbox"
                    checked={notifications.invoicePaidNotify}
                    onChange={handleNotificationsChange}
                    className="h-5 w-5 rounded text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                  />
                  <label htmlFor="invoicePaidNotify" className="ml-3 text-sm text-gray-300">
                    Email me when an invoice is paid
                  </label>
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full md:w-auto mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg transition-colors hover:bg-blue-700 focus:outline-none"
                  disabled={saving}
                >
                  {saving ? (
                    <ArrowsUpDownIcon className="w-5 h-5 inline-block mr-2 animate-spin" />
                  ) : (
                    "Save Preferences"
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 md:p-10 bg-gray-900 min-h-screen text-gray-100 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-400 mb-2">Admin Settings</h1>
          <p className="text-gray-400">
            Manage your firm's core settings, user access, and notification preferences.
          </p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6 md:p-8">
        <div className="border-b border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {TABS.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "general" | "users" | "notifications")}
                className={`py-4 px-1 inline-flex items-center font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-400 hover:text-gray-200 hover:border-gray-500 border-b-2 border-transparent"
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </motion.button>
            ))}
          </nav>
        </div>
        <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
      </div>

      {/* User Management Modal */}
      <AnimatePresence>
        {userModalOpen && (
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
              className="bg-gray-800 rounded-2xl shadow-xl p-8 max-w-lg w-full text-gray-100 border border-gray-700"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-400">
                  {isEditingUser ? "Edit User" : "Add New User"}
                </h2>
                <button
                  onClick={() => setUserModalOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-700"
                >
                  <XCircleIcon className="h-6 w-6 text-gray-400 hover:text-white" />
                </button>
              </div>
              <form onSubmit={handleUserFormSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-400">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={userForm.name}
                    onChange={handleUserFormChange}
                    required
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-400">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={userForm.email}
                    onChange={handleUserFormChange}
                    required
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-400">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={userForm.role}
                    onChange={handleUserFormChange}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="STAFF">Staff</option>
                    <option value="MODERATOR">Moderator</option>
                    <option value="USER">User</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setUserModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    {saving ? (
                      <ArrowsUpDownIcon className="w-4 h-4 inline-block mr-2 animate-spin" />
                    ) : isEditingUser ? (
                      "Save Changes"
                    ) : (
                      "Add User"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}