"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// --- Success Icon ---
const CheckCircle = (props: React.SVGProps<SVGSVGElement>) => (
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
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default function SubscriptionSuccessPage() {
  const params = useSearchParams();
  const router = useRouter();

  const subscribed = params.get("subscribed") === "true";
  const plan = params.get("plan") ?? null;

  const [message, setMessage] = useState(
    "Your subscription has been activated successfully!"
  );

  useEffect(() => {
    if (!subscribed) {
      setMessage("Subscription processed successfully.");
    }

    if (plan) {
      setMessage(`You have successfully subscribed to the ${plan} plan.`);
    }
  }, [subscribed, plan]);

  // OPTIONAL: Auto redirect after 5 seconds
  // useEffect(() => {
  //   const timer = setTimeout(() => router.push("/dashboards"), 5000);
  //   return () => clearTimeout(timer);
  // }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-10">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl space-y-6 relative">

        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-300 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
          Subscription Successful 🎉
        </h2>

        {/* Dynamic Message */}
        <p className="text-center text-gray-600 dark:text-gray-400">
          {message}
        </p>

        {/* Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => router.push("/dashboards")}
            className="w-full py-3 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-semibold shadow-md transition transform hover:scale-[1.01]"
          >
            Go to Dashboard
          </button>

          <button
            onClick={() => router.push("/")}
            className="w-full py-3 px-4 border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium shadow-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition transform hover:scale-[1.01]"
          >
            Back to Home
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
          Thank you for choosing SalesmanPro.
        </p>
      </div>
    </div>
  );
}
