// auth.salesmanpro.site

"use client";
import { authOptions } from "@/lib/auth";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

// Placeholder for an actual Google Icon component
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3" />
    <path d="M16 12h5" />
    <path d="M8 12H3" />
    <path d="M12 16v5" />
    <path d="M12 8V3" />
  </svg>
);

// Placeholder for a loading spinner component (like from lucide-react)
const Loader2 = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);


export default function SignInPage() {
  const params = useSearchParams();
  // Ensure the callback URL is secure, if not from the query parameter
  const callbackUrl = params.get("callbackUrl") || "https://salesmanpro.site";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      localStorage.setItem("callbackUrl", callbackUrl);
      await signIn("google", {
        redirect: true,
        callbackUrl: callbackUrl,
      });
    } catch (err) {
      console.error(err);
      setError("Sign-In failed. Please check your connection and try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    const auto = params.get("auto") || params.get("provider");
    const error = params.get("error");
    if (auto === "google" && !error && !loading) {
      handleGoogleSignIn();
    }
  }, [params]);

  return (
    // 1. **Background**: Richer, more professional gradient. Added background patterns for visual interest.
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 overflow-hidden relative">
      {/* Optional: Add decorative background shapes for a modern look */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob dark:bg-yellow-600"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 dark:bg-indigo-600"></div>
      
      {/* 2. **Login Card**: Larger, rounded, professional shadow, and a subtle glass-like effect on dark mode. */}
      <div className="relative z-10 bg-white dark:bg-gray-800 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-80 rounded-3xl shadow-2xl transition-all duration-300 p-10 max-w-sm w-full text-center border border-gray-100 dark:border-gray-700">
        
        {/* 3. **Branding/Header** */}
        <div className="mb-8">
          {/* Logo Placeholder (use an actual SVG or Image here) */}
          <div className="w-16 h-16 mx-auto mb-4 p-2 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
            {/* Replace with a SalesmanPro specific icon */}
            <GoogleIcon className="w-8 h-8 text-white" /> 
          </div>          
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Powered by
          </p>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white transition-colors duration-300">
            SalesmanPro<span className="text-sm">.site</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            The future of sales management.
          </p>
        </div>

        <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Welcome Back!
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                Securely sign in using your Google account.
            </p>
        </div>

        {/* 4. **Sign In Button**: Clearer intent, dedicated Google branding, better hover/active states. */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-3 
                     bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 
                     py-3 border border-gray-300 dark:border-gray-600 rounded-xl 
                     font-medium shadow-md hover:shadow-lg hover:border-yellow-500 dark:hover:border-yellow-400
                     transition-all duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed
                     transform hover:-translate-y-0.5"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 text-yellow-500" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              {/* Actual Google Logo/Icon should be here */}
              <GoogleIcon className="w-5 h-5 text-yellow-500" />
              <span>Sign in with Google</span>
            </>
          )}
        </button>

        {/* 5. **Error/Footer** */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm font-medium">
              🚨 {error}
            </p>
          </div>
        )}
        
        <p className="mt-8 text-xs text-gray-400 dark:text-gray-500">
            By signing in, you agree to our Terms of Service.
        </p>

      </div>
      
      {/* Add Tailwind animation utility classes for the decorative blobs (requires configuration or manual styling) 
          If you use a global CSS file, you can define these:
          @keyframes blob {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
      */}

    </div>
  );
}