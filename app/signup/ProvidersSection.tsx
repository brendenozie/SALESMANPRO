"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { classifyHost, signupCopy } from "@/lib/auth/domain";
import { authLog, generateCorrelationId } from "@/lib/auth/telemetry";

// --- Heroicons ---
const MailIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
  </svg>
);

const LockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
);

const LoaderIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

const AlertTriangle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" />
  </svg>
);

const ProviderIcons: Record<string, (props: React.SVGProps<SVGSVGElement>) => JSX.Element> = {
  google: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.0001 12.5714C22.0001 11.7857 21.9287 11.0001 21.7858 10.2857H12.0001V14.1429H17.4287C17.2144 15.2857 16.5001 16.2143 15.5001 16.8572L15.5715 17.3572L18.7858 19.7857L19.0001 19.8572C20.8572 18.2857 22.0001 15.9286 22.0001 12.5714Z" fill="#4285F4"/>
      <path d="M12 22C14.7143 22 17.0715 21.0714 18.7858 19.7857L15.5001 16.8572C14.5001 17.5 13.2144 17.9286 12 17.9286C9.35721 17.9286 7.14289 16.1429 6.35721 13.6429L6.28578 13.7143L3.07146 16.0714L3.00003 16.1429C4.64289 19.4286 8.00003 22 12 22Z" fill="#34A853"/>
      <path d="M6.35721 13.6429C6.00007 12.7143 6.00007 11.6429 6.35721 10.7143L6.35721 10.6429L3.07146 8.28571L3.00003 8.35714C1.85718 10.5714 1.85718 13.1429 3.00003 15.3572L6.35721 13.6429Z" fill="#FBBC05"/>
      <path d="M12 6.14286C13.8572 6.14286 15.0715 6.92857 15.8572 7.71429L19 4.5C17.0715 2.85714 14.7143 2 12 2C8.00003 2 4.64289 4.57143 3.00003 7.85714L6.35721 10.2143C7.14289 7.71429 9.35721 5.92857 12 5.92857V6.14286Z" fill="#EA4335"/>
    </svg>
  ),
};

export type Provider = { id: string; name: string };

const InputField = ({
  label,
  name,
  type,
  icon: Icon,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  name: string;
  type: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
      </div>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition duration-150 ease-in-out"
      />
    </div>
  </div>
);

export default function SignUpClient({ providers }: { providers: Provider[] }) {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "https://salesmanpro.site";

  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState<boolean>(false);
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const isSubmittingRef = useRef<boolean>(false);
  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  const originKind = useMemo(() => {
    try {
      return classifyHost(new URL(callbackUrl).hostname).kind;
    } catch {
      return "hub" as const;
    }
  }, [callbackUrl]);

  const copy = signupCopy(originKind);

  const googleProvider = useMemo(() => {
    return providers.find((p) => p.id === "google") || { id: "google", name: "Google" };
  }, [providers]);

  const clearTimeoutTimer = useCallback(() => {
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimeoutTimer();
  }, [clearTimeoutTimer]);

  const registerUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;

    setError(null);
    setShowTimeoutWarning(false);

    if (!data.name || !data.email || !data.password || !data.confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match. Please check them.");
      return;
    }

    isSubmittingRef.current = true;
    setLoadingProvider("credentials");

    const cId = generateCorrelationId();
    authLog(cId, "button_click", 0, { provider: "credentials_register", email: data.email });

    try {
      const res = await fetch(`/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, callbackUrl }),
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || json.message || "Registration failed");

      window.location.href = `/verify-email?email=${encodeURIComponent(data.email)}&callbackUrl=${encodeURIComponent(callbackUrl)}`;
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      isSubmittingRef.current = false;
      setLoadingProvider(null);
    }
  };

  const handleSocialSignUp = async (providerId: string) => {
    if (isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setError(null);
    setShowTimeoutWarning(false);
    setLoadingProvider(providerId);

    const cId = generateCorrelationId();
    authLog(cId, "button_click", 0, { provider: providerId, target: callbackUrl, mode: "signup" });

    timeoutTimerRef.current = setTimeout(() => {
      setShowTimeoutWarning(true);
      authLog(cId, "oauth_url_generation", 5000, { status: "slow_connection_warning" });
    }, 5000);

    const startTime = Date.now();
    try {
      localStorage.setItem("callbackUrl", callbackUrl);
      authLog(cId, "signin_invocation", Date.now() - startTime, { provider: providerId });

      await signIn(providerId, { redirect: true, callbackUrl });
    } catch (err) {
      clearTimeoutTimer();
      console.error(err);
      setError("Sign-Up failed. Please check your connection and try again.");
      isSubmittingRef.current = false;
      setLoadingProvider(null);
      setShowTimeoutWarning(false);
    }
  };

  const handleCancelOrRetry = () => {
    clearTimeoutTimer();
    isSubmittingRef.current = false;
    setLoadingProvider(null);
    setShowTimeoutWarning(false);
  };

  useEffect(() => {
    // Warm up the auth endpoint and prefetch CSRF cookie in the background
    fetch("/api/auth/csrf", { credentials: "include" }).catch(() => null);

    // Auto-initiate Google sign-up if navigated with ?auto=google or ?provider=google
    const auto = params.get("auto") || params.get("provider");
    if (auto === "google" && !isSubmittingRef.current) {
      handleSocialSignUp("google");
    }
  }, []);

  const updateData = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setData((d) => ({ ...d, [field]: e.target.value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 overflow-auto py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-indigo-900/10 dark:bg-indigo-900/60 backdrop-blur-sm"></div>

      <div className="max-w-md w-full space-y-8 relative z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-10 sm:p-12 rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] dark:shadow-[0_20px_50px_rgba(0,_0,_0,_0.3)] border border-white/20 dark:border-gray-700/50 transition-all duration-300">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mb-4 shadow-xl">
            <UserIcon className="h-6 w-6 text-white" />
          </div>

          <h2 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {copy.title}
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {copy.subtitle}
            <br />
            <span className="text-xs text-yellow-500 font-medium">powered by salesmanpro</span>
          </p>
        </div>

        {/* Social Providers with Instant Feedback */}
        <div className="space-y-3">
          <button
            id="google-signup-btn"
            type="button"
            disabled={loadingProvider !== null}
            className={`w-full flex items-center justify-center py-3 px-4 border border-gray-300 dark:border-gray-700 
                      rounded-xl shadow-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 
                      transition duration-200 ease-in-out transform 
                      ${
                        loadingProvider !== null
                          ? "opacity-60 cursor-not-allowed"
                          : "hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-[0.98]"
                      }`}
            onClick={() => handleSocialSignUp(googleProvider.id)}
          >
            {loadingProvider === googleProvider.id ? (
              <>
                <LoaderIcon className="mr-3 h-5 w-5 animate-spin text-yellow-500" />
                <span className="font-semibold">Connecting to Google…</span>
              </>
            ) : (
              <>
                <ProviderIcons.google className="mr-3 h-5 w-5" />
                <span>Sign up with Google</span>
              </>
            )}
          </button>

          {/* Timeout feedback and retry */}
          {showTimeoutWarning && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-xl text-amber-800 dark:text-amber-200 text-xs flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                <span>Connecting is taking longer than usual on your network.</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <button
                  onClick={() => handleSocialSignUp(googleProvider.id)}
                  className="font-bold underline hover:text-amber-600"
                >
                  Retry Google Sign-Up
                </button>
                <span>•</span>
                <button
                  onClick={handleCancelOrRetry}
                  className="font-medium underline hover:text-amber-600"
                >
                  Use Form Below
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative pt-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              Or sign up with email
            </span>
          </div>
        </div>

        {/* Error Message Display */}
        {error && (
          <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm font-medium">
            <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={registerUser} className="space-y-5">
          <InputField
            label="Full Name"
            name="name"
            type="text"
            icon={UserIcon}
            value={data.name}
            placeholder="John Doe"
            onChange={updateData("name")}
          />

          <InputField
            label="Email Address"
            name="email"
            type="email"
            icon={MailIcon}
            value={data.email}
            placeholder="you@company.com"
            onChange={updateData("email")}
          />

          <InputField
            label="Password"
            name="password"
            type="password"
            icon={LockIcon}
            value={data.password}
            placeholder="••••••••"
            onChange={updateData("password")}
          />

          <InputField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            icon={LockIcon}
            value={data.confirmPassword}
            placeholder="••••••••"
            onChange={updateData("confirmPassword")}
          />

          <button
            id="credentials-signup-btn"
            type="submit"
            disabled={loadingProvider !== null}
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg 
                        text-base font-semibold text-white transition duration-200 ease-in-out transform
                        ${
                          loadingProvider === "credentials"
                            ? "bg-yellow-400 cursor-wait opacity-80"
                            : loadingProvider !== null
                              ? "bg-yellow-500 opacity-60 cursor-not-allowed"
                              : "bg-yellow-500 hover:bg-yellow-600 hover:scale-[1.01] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-yellow-300 dark:focus:ring-yellow-800"
                        }`}
          >
            {loadingProvider === "credentials" ? (
              <>
                <LoaderIcon className="h-5 w-5 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="text-sm text-center text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <a
            href={`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="font-medium text-yellow-500 hover:text-yellow-600 underline"
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}