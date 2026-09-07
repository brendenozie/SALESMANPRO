"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon, LockClosedIcon, ShieldCheckIcon, EnvelopeIcon, KeyIcon,
  ExclamationCircleIcon, CheckCircleIcon, ArrowPathIcon,
  XMarkIcon
} from '@heroicons/react/24/solid';


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";;//process.env.NEXT_PUBLIC_API_URL || "/api";

// Animation variants for the main container and form
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } }
};

const formVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { delay: 0.3, duration: 0.7, ease: "easeOut" } }
};

// Custom Message Box Component (replaces alert/confirm)
interface MessageProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
}

const MessageBox: React.FC<MessageProps> = ({ type, message, onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  const Icon = type === 'success' ? CheckCircleIcon : type === 'error' ? ExclamationCircleIcon : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={`fixed top-5 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-xl text-white flex items-center space-x-3 z-50 ${bgColor}`}
    >
      {Icon && <Icon className="h-6 w-6" />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white opacity-75 hover:opacity-100">
        <XMarkIcon className="h-5 w-5" />
      </button>
    </motion.div>
  );
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // This will be used for both password and login code
  const [role, setRole] = useState<'patient' | 'doctor' | 'staff' | 'admin'>('patient');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // In a real application, you would send the email, password, and role to your backend.
    // The backend would then validate based on the role (e.g., check 'loginCode' for doctor/staff/admin).
    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, { // This endpoint needs to be implemented
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: `Login successful! Welcome, ${data.user?.name || email}. Redirecting...` });
        // Simulate redirection
        setTimeout(() => {
          // Redirect based on role or data from backend
          // Example: window.location.href = `/${role}-dashboard`;
          // console.log(`Successfully logged in as ${role}. User ID: ${data.user?.id}`);
          setMessage(null); // Clear message after "redirection"
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Login failed. Please check your credentials.' });
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordLabel = () => {
    if (role === 'patient') {
      return 'Password';
    }
    return 'Login Code';
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-600 p-4 font-inter"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <AnimatePresence>
        {message && (
          <MessageBox
            type={message.type}
            message={message.text}
            onClose={() => setMessage(null)}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 relative overflow-hidden"
        variants={formVariants}
      >
        {/* Decorative background elements */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-200 dark:bg-blue-900 rounded-full opacity-30 blur-xl"></div>
        <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-purple-200 dark:bg-purple-900 rounded-full opacity-30 blur-xl"></div>

        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6 text-center z-10 relative">
          Welcome Back!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-center z-10 relative">
          Sign in to access your dashboard.
        </p>

        <form onSubmit={handleLogin} className="space-y-6 z-10 relative">
          {/* Role Selection */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Your Role
            </label>
            <div className="relative">
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="block w-full pl-4 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
            </div>
          </div>

          {/* Email/Username Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address / Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="email"
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password / Login Code Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {getPasswordLabel()}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {role === 'patient' ? <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" /> : <KeyIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />}
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={role === 'patient' ? 'current-password' : 'off'} // Disable autocomplete for login code
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder={role === 'patient' ? "Your password" : "Your login code"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-full shadow-lg text-base font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
              disabled={loading}
            >
              {loading ? (
                <ArrowPathIcon className="animate-spin h-5 w-5 mr-3" />
              ) : (
                <ShieldCheckIcon className="h-5 w-5 mr-3" />
              )}
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400 z-10 relative">
          Forgot your {getPasswordLabel().toLowerCase()}?{' '}
          <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
            Reset it here
          </a>
        </p>
      </motion.div>
    </motion.div>
  );
}
