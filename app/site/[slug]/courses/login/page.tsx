"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AcademicCapIcon, ArrowRightIcon, KeyIcon, LockClosedIcon } from '@heroicons/react/24/outline'; // Replaced EnvelopeIcon with KeyIcon
import { useRouter } from 'next/navigation'; // Import useRouter for redirection

export default function LoginPage() {
  const [loginCode, setLoginCode] = useState(''); // Changed from email
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const router = useRouter(); // Initialize useRouter

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

    try {
      // In a real application, you would make a fetch or axios call to your backend here
      // This will call your NextAuth credentials provider
      const response = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ loginCode, password, redirect: false }), // Send loginCode, disable default redirect
      });

      const data = await response.json();

      if (response.ok && data.url) { // NextAuth will return a URL for successful login
        setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
        
        // Determine redirection based on role (which you'll get from the session/token eventually)
        // For now, we'll make a direct assumption or fetch user role after successful login.
        // A more robust approach involves passing the role in the login response or fetching the session.
        // For this example, let's assume `data.user.role` is available in the response from your /shop/login endpoint
        // or we can fetch the session after successful login.
        
        // Simulating role-based redirection based on the provided URLs
        // You'll likely need to fetch the session or have the backend provide the role
        // in the successful login response for accurate redirection.
        // For a true NextAuth flow, you'd typically rely on the `jwt` and `session` callbacks
        // to put the role into the session and then use `useSession` on the client side.

        // For immediate redirection based on your provided structure:
        // After successful NextAuth login, the user's session is established.
        // We need to know the role to redirect correctly.
        // Let's assume your backend /shop/login endpoint returns the user's role.
        // Or, more accurately with NextAuth, after a successful credential login,
        // you would typically redirect to a dashboard, and then inside the dashboard,
        // check the session to determine the user's specific role and redirect internally if needed.

        // For this example, let's hardcode for demonstration based on a mock response.
        // In a real scenario, after a successful credential login, you'd be redirected to `/dashboard`
        // or a default protected route, and then use `useSession` to get the user's role.
        
        // To make this work directly after credential login, your backend response
        // in the `authorize` callback should include the user's role.
        // Let's modify the `authorize` callback to return the role.

        // Placeholder for actual redirection logic:
        // If your backend gives you the role:
        // const { user } = data; // Assuming data contains user info including role
        // if (user.role === 'EDUCATOR') {
        //   router.push('/admin/685018d708b38f9635fb3a03'); // Teacher dashboard
        // } else if (user.role === 'STUDENT') {
        //   router.push('/admin/685084cc4da288b5c3156e4a'); // Student dashboard
        // } else {
        //   router.push('/dashboard'); // Default fallback
        // }

        // For now, let's simulate by checking if a mock `loginCode` is for a teacher or student.
        // This is not how it would work in production, but demonstrates the client-side decision.
        setTimeout(() => {
          if (loginCode.startsWith('teacher')) { // Example: If teacher codes start with 'teacher'
            router.push('/admin/685018d708b38f9635fb3a03');
          } else if (loginCode.startsWith('student')) { // Example: If student codes start with 'student'
            router.push('/admin/685084cc4da288b5c3156e4a');
          } else {
            router.push('/dashboard'); // Fallback
          }
        }, 1000);

      } else {
        setMessage({ type: 'error', text: data.error || 'Invalid login code or password. Please try again.' });
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
            Sign in to your account using your school login code.
          </p>
        </motion.div>

        <motion.form onSubmit={handleLogin} className="w-full relative z-10" variants={itemVariants}>
          <div className="mb-6">
            <div className="relative">
              <KeyIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" /> {/* Changed icon */}
              <input
                type="text" // Changed type to text for login code
                placeholder="School Login Code" // Changed placeholder
                className={`w-full p-4 pl-12 rounded-xl border border-gray-300 dark:border-gray-700
                           bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all`}
                value={loginCode} // Changed value and onChange
                onChange={(e) => setLoginCode(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="mb-6">
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
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </>
            )}
          </motion.button>
        </motion.form>

        <motion.div className="mt-8 text-sm relative z-10" variants={itemVariants}>
          <a
            href="#forgot-password"
            className="text-indigo-400 dark:text-purple-300 hover:underline transition-colors"
            onClick={(e) => { e.preventDefault(); console.log('Forgot password clicked!'); }}
          >
            Forgot password?
          </a>
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
        </motion.div>
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