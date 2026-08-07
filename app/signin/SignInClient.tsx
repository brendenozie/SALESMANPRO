"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.0001 12.5714C22.0001 11.7857 21.9287 11.0001 21.7858 10.2857H12.0001V14.1429H17.4287C17.2144 15.2857 16.5001 16.2143 15.5001 16.8572L15.5715 17.3572L18.7858 19.7857L19.0001 19.8572C20.8572 18.2857 22.0001 15.9286 22.0001 12.5714Z" fill="#4285F4"/>
    <path d="M12 22C14.7143 22 17.0715 21.0714 18.7858 19.7857L15.5001 16.8572C14.5001 17.5 13.2144 17.9286 12 17.9286C9.35721 17.9286 7.14289 16.1429 6.35721 13.6429L6.28578 13.7143L3.07146 16.0714L3.00003 16.1429C4.64289 19.4286 8.00003 22 12 22Z" fill="#34A853"/>
    <path d="M6.35721 13.6429C6.00007 12.7143 6.00007 11.6429 6.35721 10.7143L6.35721 10.6429L3.07146 8.28571L3.00003 8.35714C1.85718 10.5714 1.85718 13.1429 3.00003 15.3572L6.35721 13.6429Z" fill="#FBBC05"/>
    <path d="M12 6.14286C13.8572 6.14286 15.0715 6.92857 15.8572 7.71429L19 4.5C17.0715 2.85714 14.7143 2 12 2C8.00003 2 4.64289 4.57143 3.00003 7.85714L6.35721 10.2143C7.14289 7.71429 9.35721 5.92857 12 5.92857V6.14286Z" fill="#EA4335"/>
  </svg>
);

const SpinnerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} className="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="0.75" />
  </svg>
);

export type Provider = { id: string; name: string };

export default function SignInClient() {
  const params = useSearchParams();
  const rawCallback = params.get("callbackUrl") || "https://salesmanpro.site";

  const [callbackUrl, setCallbackUrl] = useState(rawCallback);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setCallbackUrl(decodeURIComponent(rawCallback));
    } catch {
      setCallbackUrl(rawCallback);
    }
  }, [rawCallback]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Do NOT double-encode callbackUrl here. NextAuth handles encoding internally.
      await signIn("google", {
        redirect: true,
        callbackUrl,
      });
    } catch (err) {
      console.error("SIGN_IN_ERROR:", err);
      setError("Sign-In failed. Please check your connection and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 relative">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sign In</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Access your account on SalesmanPro
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <button
          disabled={loading}
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <SpinnerIcon className="w-5 h-5 text-yellow-500" />
          ) : (
            <GoogleIcon className="w-5 h-5" />
          )}
          <span>{loading ? "Connecting..." : "Sign in with Google"}</span>
        </button>
      </div>
    </div>
  );
}
// "use client";

// import { getProviders } from "next-auth/react";
// import { useEffect, useState } from "react";
// import ProvidersSection from "./ProvidersSection";
// import Skeleton from "./Skeleton";

// export type Provider = { id: string; name: string };

// export default function SignInClient() {
//   const [providers, setProviders] = useState<Provider[] | null>(null);

//   useEffect(() => {
//     let mounted = true;

//     getProviders().then((res) => {
//       if (!mounted) return;
//       setProviders(res ? Object.values(res) : []);
//     });

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   if (!providers) {
//     return <Skeleton />;
//   }

//   return <ProvidersSection providers={providers} />;
// }