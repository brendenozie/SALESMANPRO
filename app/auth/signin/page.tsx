"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SignInPage() {
  const params = useSearchParams();
  const callback = params.get("callback") || "https://salesmanpro.site";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signIn("google", {
        redirect: true,
        callbackUrl: callback,
      });
    } catch (err) {
      console.error(err);
      setError("Google Sign-In failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Welcome to SalesmanPro
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Sign in with your Google account to continue.
        </p>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center bg-gradient-to-r from-yellow-500 to-yellow-700 text-white py-3 rounded-lg font-semibold hover:scale-105 transition-all"
        >
          {loading ? "Signing in..." : "Continue with Google"}
        </button>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </div>
    </div>
  );
}
