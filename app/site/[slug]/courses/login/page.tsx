"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AcademicCapIcon, ArrowRightIcon, KeyIcon } from '@heroicons/react/24/outline'; // Removed LockClosedIcon
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react'; // Import signIn function from next-auth/react

export default function LoginPage() {
  const [loginCode, setLoginCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const router = useRouter();

  // Animation variants (no changes needed here)
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Basic validation for 6 digits
    if (loginCode.length !== 6 || !/^\d+$/.test(loginCode)) {
      setMessage({ type: 'error', text: 'Please enter a valid 6-digit school login code.' });
      setLoading(false);
      return;
    }

    try {
      // Call the specific 'school-code-login' provider
      const result = await signIn('school-code-login', {
        loginCode,
        redirect: false, // Prevent NextAuth from redirecting automatically
      });

      if (result?.error) {
        // Handle errors from the signIn function (e.g., credentials mismatch)
        setMessage({ type: 'error', text: result.error });
      } else if (result?.ok) {
        setMessage({ type: 'success', text: 'Login successful! Redirecting...' });

        // A more robust redirection logic would involve fetching the session
        // and using the role from there. For immediate redirection based on
        // mock logic, we can still use the startsWith for demonstration,
        // but remember to replace this with actual session-based role checking.
        // For example, after `signIn` is successful, you could `await getSession()`
        // and then check `session.user.role`.

        // Simulating role-based redirection based on the provided URLs
        setTimeout(() => {
          // In a real app, after successful signIn, you'd typically redirect to a
          // protected route (e.g., /dashboard) and then use `useSession` to get
          // the user's role and perform the final role-based redirection.
          // For this example, we'll keep the mock logic for immediate redirection.
          if (loginCode.startsWith('1')) { // Example: Teacher codes start with '1'
            router.push('/admin/685018d708b38f9635fb3a03'); // Teacher dashboard
          } else { // Assume others are students for this mock
            router.push('/admin/685084cc4da288b5c3156e4a'); // Student dashboard
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again later.' });
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
            Welcome Back!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
            Enter your 6-digit school login code to continue.
          </p>
        </motion.div>

        <motion.form onSubmit={handleLogin} className="w-full relative z-10" variants={itemVariants}>
          <div className="mb-6">
            <div className="relative">
              <KeyIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text" // Keep as text to allow leading zeros if any, but validate length
                inputMode="numeric" // Suggest numeric keyboard on mobile
                pattern="[0-9]*" // Hint for numeric input
                maxLength={6} // Enforce 6 digits
                placeholder="6-Digit Login Code"
                className={`w-full p-4 pl-12 rounded-xl border border-gray-300 dark:border-gray-700
                           bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all`}
                value={loginCode}
                onChange={(e) => {
                  // Allow only digits and limit to 6 characters
                  const value = e.target.value.replace(/\D/g, '').substring(0, 6);
                  setLoginCode(value);
                }}
                required
              />
            </div>
          </div>
          {/* Removed the password input field entirely */}

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
                Login
              </>
            )}
          </motion.button>
        </motion.form>

        {/* <motion.div className="mt-8 text-sm relative z-10" variants={itemVariants}>
           Removed "Forgot password?" as there's no password for this flow 
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            Don't have an account?{' '}
            <a
              href="#signup"
              className="text-indigo-600 dark:text-purple-400 font-semibold hover:underline transition-colors"
              onClick={(e) => { e.preventDefault(); console.log('Sign up clicked!'); }}
            >
              Sign up
            </a>
          </p>
        </motion.div> */}
      </motion.div>

      {/* Tailwind CSS keyframe animation for the blob effect (copy-pasted from previous sections) */}
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