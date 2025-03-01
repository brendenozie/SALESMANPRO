import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { XMarkIcon, ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import { signIn, useSession } from "next-auth/react";

export default function SignInModal({ isOpen, onClose }: { isOpen: boolean; onClose: (modalState: boolean) => void }) {
  const { data: session, status } = useSession();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    onClose(isOpen); // Sync with parent state
  }, [isOpen, onClose]);

  useEffect(() => {
    if (status === "authenticated") {
      onClose(false); // Ensure the parent state also closes
    }
  }, [status, onClose]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoadingProvider("google");
    setError(null);

    try {
      const result = await signIn("google", { callbackUrl: "/" });
      if (result?.error) throw new Error(result.error);
    } catch (err) {
      setError("Failed to sign in. Please try again.");
      setLoadingProvider(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-900 bg-opacity-90 dark:bg-opacity-80 p-8 rounded-3xl shadow-2xl w-96 max-w-full relative border border-gray-200 dark:border-gray-700"
      >
        {/* Close Button */}
        <button
          onClick={() => onClose(false)}
          className="absolute top-4 right-4 bg-gray-100 dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Modal Title */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Sign in to Ghuba
        </h2>

        {/* Error Message */}
        {error && <p className="text-red-500 text-center mb-2 font-medium">{error}</p>}

        {/* Google Sign-In */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center bg-gradient-to-r from-yellow-500 to-yellow-700 text-white py-3 rounded-xl font-semibold text-lg shadow-lg transform hover:scale-105 transition-all"
          disabled={loadingProvider === "google"}
        >
          {loadingProvider === "google" ? (
            <ArrowsUpDownIcon className="animate-spin w-6 h-6" />
          ) : (
            "Continue with Google"
          )}
        </button>
      </motion.div>
    </div>
  );
}
