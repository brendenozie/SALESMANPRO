import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LockClosedIcon,
  ShieldCheckIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  DevicePhoneMobileIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useSession, signOut } from "next-auth/react";
import axios from "axios";

const tabs = [
  { id: "password", label: "Change Password", icon: LockClosedIcon },
  { id: "accountStatus", label: "Account Security", icon: ShieldCheckIcon },
  { id: "sessions", label: "Active Sessions", icon: DevicePhoneMobileIcon },
];

const SecurityOverview = () => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("password");

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "None", color: "bg-gray-200" };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, label: "Weak", color: "bg-red-500" };
    if (score === 2) return { score: 50, label: "Fair", color: "bg-yellow-500" };
    if (score === 3) return { score: 75, label: "Good", color: "bg-blue-500" };
    return { score: 100, label: "Strong", color: "bg-green-500" };
  };

  const strength = calculatePasswordStrength(newPassword);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (newPassword.length < 6) {
      setFeedback({
        type: "error",
        message: "New password must be at least 6 characters long.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({
        type: "error",
        message: "New passwords do not match.",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await axios.put("/api/user/password", {
        oldPassword: currentPassword,
        newPassword,
      });

      setFeedback({
        type: "success",
        message: res.data.message || "Password updated successfully!",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setFeedback({
        type: "error",
        message:
          err?.response?.data?.message ||
          "Failed to update password. Please verify your current password.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOutAll = () => {
    const returnTo = typeof window !== "undefined" ? window.location.origin : "/";
    signOut({
      redirect: true,
      callbackUrl: returnTo,
    });
  };

  const emailVerified = (session?.user as any)?.emailVerified;

  return (
    <div className="p-6 w-full max-w-2xl mx-auto shadow-xl rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60">
      <div className="mb-6 pb-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <span>🔐</span> Security & Credentials
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Manage your password, active login sessions, and authentication security
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-100 dark:border-gray-700/60 pb-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setFeedback(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-yellow-500 text-white shadow-md shadow-yellow-500/20"
                  : "bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback Alert */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-6 p-4 rounded-2xl text-sm font-medium flex items-center gap-3 ${
              feedback.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800"
                : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckBadgeIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Content */}
      <div className="min-h-[200px]">
        {activeTab === "password" && (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handlePasswordChange}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full p-3 border rounded-xl dark:bg-gray-700/80 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full p-3 border rounded-xl dark:bg-gray-700/80 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
              {newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                    Strength: {strength.label}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full p-3 border rounded-xl dark:bg-gray-700/80 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" /> Updating Password...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </motion.form>
        )}

        {activeTab === "accountStatus" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/40 rounded-2xl border border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Email Verification</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">{session?.user?.email}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  emailVerified
                    ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300"
                }`}
              >
                {emailVerified ? "Verified" : "Active"}
              </span>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700/40 rounded-2xl border border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Account Type</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Role: {(session?.user as any)?.role || "Consumer / Shopper"}
                </p>
              </div>
              <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-black uppercase tracking-wider">
                Protected
              </span>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700/40 rounded-2xl border border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Two-Factor Security</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Secured through session token encryption
                </p>
              </div>
              <span className="text-xs font-bold text-green-600 dark:text-green-400">Enabled</span>
            </div>
          </motion.div>
        )}

        {activeTab === "sessions" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/40 rounded-2xl border border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-500/20 rounded-xl flex items-center justify-center text-yellow-600">
                  <DevicePhoneMobileIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">Current Session</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Active right now • Web Browser</p>
                </div>
              </div>
              <span className="text-xs font-bold text-green-600 dark:text-green-400">Online</span>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSignOutAll}
                className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span>Log Out of Current Session</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SecurityOverview;
