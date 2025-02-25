import { useState, useEffect  } from "react";
import { motion } from "framer-motion";
import { XMarkIcon, ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import { signIn, useSession } from "next-auth/react";

export default function SignInModal({ isOpen }:any) {
  const { data: session, status } = useSession();
  const [loadingProvider, setLoadingProvider] = useState(null);
  const [error, setError] = useState<any>(null);
  const [showModal, setShowModal] = useState(isOpen);

  useEffect(() => {
    if (status === "unauthenticated") {
      setShowModal(true);
    }
  }, [status]);

  if (!showModal || session) return null;

  const handleSignIn = async (provider :any) => {
    setLoadingProvider(provider);
    setError(null);
    try {
      await signIn(provider);
    } catch (err :any) {
      setError("Failed to sign in. Please try again.");
      setLoadingProvider(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg w-96 max-w-full relative"
      >
        <button onClick={() => setShowModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <XMarkIcon className="w-8 h-8" />
        </button>
        
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
          Sign in to Ghuba
        </h2>

        {error && <p className="text-red-500 text-center mb-2">{error}</p>}

        <button onClick={() => handleSignIn("google")} className="w-full flex items-center justify-center bg-blue-600 text-white py-2 rounded-lg mb-2 hover:bg-blue-700">
          {loadingProvider === "google" ? <ArrowsUpDownIcon className="animate-spin w-8 h-8" /> : "Continue with Google"}
        </button>
        <button onClick={() => handleSignIn("apple")} className="w-full flex items-center justify-center bg-gray-800 text-white py-2 rounded-lg mb-2 hover:bg-gray-900">
          {loadingProvider === "apple" ? <ArrowsUpDownIcon className="animate-spin w-8 h-8"  /> : "Continue with Apple"}
        </button>
        <button onClick={() => handleSignIn("facebook")} className="w-full flex items-center justify-center bg-blue-500 text-white py-2 rounded-lg mb-4 hover:bg-blue-600">
          {loadingProvider === "facebook" ? <ArrowsUpDownIcon className="animate-spin w-8 h-8" /> : "Continue with Facebook"}
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700"></div>
          <span className="text-gray-500 dark:text-gray-400 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700"></div>
        </div>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300 dark:focus:ring-blue-600 outline-none"
        />
        <button onClick={() => handleSignIn("email")} className="w-full bg-blue-600 text-white py-2 rounded-lg mt-3 hover:bg-blue-700">
          {loadingProvider === "email" ? <ArrowsUpDownIcon className="animate-spin  w-8 h-8" /> : "Continue with Email"}
        </button>

        <p className="text-center text-gray-600 dark:text-gray-400 mt-4 text-sm">
          New to Ghuba? <a href="#" className="text-blue-500 hover:underline">Create an account</a>
        </p>
      </motion.div>
    </div>
  );
}
