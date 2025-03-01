import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { XMarkIcon, ArrowsUpDownIcon, UserIcon } from "@heroicons/react/24/outline";
import { signIn, useSession } from "next-auth/react";

export default function SignInPrompt() {
  const { data: session, status } = useSession();
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      setVisible(false);
    }
  }, [status]);

  if (!visible || status === "authenticated") return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signIn("google", { callbackUrl: "/" });
      if (result?.error) throw new Error(result.error);
    } catch (err) {
      setError("Failed to sign in. Please try again.");
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-6 right-6 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 w-80 flex items-center gap-4 z-10"
    >
      <UserIcon className="w-10 h-10 text-gray-500 dark:text-gray-300" />
      <div className="flex-1">
        <p className="text-sm text-gray-700 dark:text-gray-300">Sign in for a better experience.</p>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        <button
          onClick={handleGoogleSignIn}
          className="mt-2 w-full flex items-center justify-center bg-gradient-to-r from-yellow-500 to-yellow-700 text-white py-2 rounded-lg font-semibold text-sm shadow-md transform hover:scale-105 transition-all"
          disabled={loading}
        >
          {loading ? <ArrowsUpDownIcon className="animate-spin w-5 h-5" /> : "Continue with Google"}
        </button>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>
    </motion.div>
  );
}
