// File: app/subscription/failed/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// --- Icons ---
const AlertTriangle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="m21.73 18-9-15-9 15z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

export default function SubscriptionFailedPage() {
  const params = useSearchParams();
  const router = useRouter();

  const [message, setMessage] = useState("Your subscription could not be completed.");

  useEffect(() => {
    const msg = params.get("message");
    if (msg) setMessage(msg);
  }, [params]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-10">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl space-y-6 relative">

        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center shadow-lg">
            <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-300 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
          Subscription Failed
        </h2>

        {/* Error Message */}
        <p className="text-center text-gray-600 dark:text-gray-400">
          {message}
        </p>

        {/* Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => router.push("/pricing")}
            className="w-full py-3 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-semibold shadow-md transition transform hover:scale-[1.01]"
          >
            Try Again
          </button>

          <button
            onClick={() => router.push("/dashboards")}
            className="w-full py-3 px-4 border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium shadow-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition transform hover:scale-[1.01]"
          >
            Go to Dashboard
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
          If the issue persists, contact support.
        </p>
      </div>
    </div>
  );
}
