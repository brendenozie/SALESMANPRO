"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AcademicCapIcon, // For general education theme
  UserIcon, // For general user profile
  BookOpenIcon, // For student/learning
  BriefcaseIcon, // For educator/professional
  EnvelopeIcon,
  LockClosedIcon,
  SparklesIcon, // For confirmation/success
  BuildingOfficeIcon // For institution name
} from '@heroicons/react/24/outline';

export default function SignupPage() {
  const [userRole, setUserRole] = useState<'student' | 'educator' | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [institutionName, setInstitutionName] = useState(''); // Educator specific
  const [studentGrade, setStudentGrade] = useState(''); // Student specific

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 10,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      setLoading(false);
      return;
    }

    // Mock API call simulation based on role
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

      let signupData: any = {
        fullName,
        email,
        password,
        role: userRole,
      };

      if (userRole === 'educator') {
        signupData = { ...signupData, institutionName };
      } else if (userRole === 'student') {
        signupData = { ...signupData, studentGrade };
      }

      console.log('Attempting signup with data:', signupData);

      // Simulate successful signup
      if (email.includes('@')) { // Basic email validation
        setMessage({ type: 'success', text: 'Registration successful! Please check your email for verification.' });
        // Reset form fields after successful signup (optional)
        setFullName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setInstitutionName('');
        setStudentGrade('');
        setUserRole(null); // Go back to role selection
      } else {
        setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      }

    } catch (error) {
      console.error("Signup error:", error);
      setMessage({ type: 'error', text: 'An unexpected error occurred during registration. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 flex items-center justify-center p-4 font-sans">
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 sm:p-10 w-full max-w-md
                   flex flex-col items-center text-center relative overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Abstract background blobs for visual interest */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>

        <motion.div variants={itemVariants} className="relative z-10">
          <AcademicCapIcon className="w-20 h-20 text-indigo-600 dark:text-purple-400 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
            Join Our Community!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
            Choose your role to get started with your learning journey.
          </p>
        </motion.div>

        {!userRole ? (
          <motion.div
            className="flex flex-col sm:flex-row gap-4 w-full relative z-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 100, damping: 10 }}
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(79, 70, 229, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setUserRole('student')}
              className={`flex-1 p-6 border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 rounded-2xl flex flex-col items-center justify-center
                         hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all duration-200 font-bold`}
            >
              <BookOpenIcon className="w-12 h-12 mb-3 text-indigo-500" />
              I'm a Student
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(139, 92, 246, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setUserRole('educator')}
              className="flex-1 p-6 border-2 border-purple-500 text-purple-600 dark:text-purple-400 rounded-2xl flex flex-col items-center justify-center
                         hover:bg-purple-50 dark:hover:bg-gray-700 transition-all duration-200 font-bold"
            >
              <BriefcaseIcon className="w-12 h-12 mb-3 text-purple-500" />
              I'm an Educator
            </motion.button>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSignup}
            className="w-full relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}  
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 100, damping: 10 }}
          >
            {/* Display selected role */}
            <div className="mb-6 text-sm text-gray-700 dark:text-gray-300">
              Signing up as: <span className="font-semibold text-indigo-600 dark:text-purple-400 capitalize">{userRole}</span>
              <button
                type="button"
                onClick={() => setUserRole(null)}
                className="ml-3 text-indigo-400 hover:underline focus:outline-none"
              >
                (Change Role)
              </button>
            </div>

            <div className="mb-4">
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Full Name"
                  className={`w-full p-4 pl-12 rounded-xl border border-gray-300 dark:border-gray-700
                             bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all`}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="relative">
                <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  placeholder="Email address"
                  className={`w-full p-4 pl-12 rounded-xl border border-gray-300 dark:border-gray-700
                             bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="relative">
                <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="password"
                  placeholder="Password"
                  className={`w-full p-4 pl-12 rounded-xl border border-gray-300 dark:border-gray-700
                             bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="relative">
                <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className={`w-full p-4 pl-12 rounded-xl border border-gray-300 dark:border-gray-700
                             bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {userRole === 'educator' && (
              <motion.div className="mb-6" variants={itemVariants}>
                <div className="relative">
                  <BuildingOfficeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Institution Name (Optional)"
                    className={`w-full p-4 pl-12 rounded-xl border border-gray-300 dark:border-gray-700
                               bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                               focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all`}
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                  />
                </div>
              </motion.div>
            )}

            {userRole === 'student' && (
              <motion.div className="mb-6" variants={itemVariants}>
                <div className="relative">
                  <AcademicCapIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <select
                    className={`w-full p-4 pl-12 rounded-xl border border-gray-300 dark:border-gray-700
                               bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white appearance-none pr-10
                               focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all`}
                    value={studentGrade}
                    onChange={(e) => setStudentGrade(e.target.value)}
                    required
                  >
                    <option value="">Select Grade/Level</option>
                    <option value="high-school">High School</option>
                    <option value="undergraduate">Undergraduate</option>
                    <option value="graduate">Graduate</option>
                    <option value="other">Other</option>
                  </select>
                  {/* Custom arrow for select */}
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15 9.707V7.586L13.293 6.293l-1.414 1.414L10 9.586 7.707 7.293l-1.414 1.414L8.293 12.95z"/></svg>
                  </div>
                </div>
              </motion.div>
            )}


            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg text-sm mb-6 ${
                  message.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100' : 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100'
                }`}
              >
                {message.text}
              </motion.div>
            )}

            <motion.button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-xl
                         shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300
                         focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-75 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              variants={itemVariants}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  Sign Up
                  <SparklesIcon className="w-5 h-5 ml-2" />
                </>
              )}
            </motion.button>
          </motion.form>
        )}

        <motion.div className="mt-8 text-sm relative z-10" variants={itemVariants}>
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            Already have an account?{' '}
            <a
              href="#login"
              className="text-indigo-600 dark:text-purple-400 font-semibold hover:underline transition-colors"
              onClick={(e) => { e.preventDefault(); console.log('Login clicked!'); }}
            >
              Login
            </a>
          </p>
        </motion.div>
      </motion.div>

      {/* Tailwind CSS keyframe animation for the blob effect */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0, 0) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite cubic-bezier(0.68, -0.55, 0.27, 1.55);
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
