"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

/* ================= HERO ICONS (INLINE SVG) ================= */

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
    <svg {...props} width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22.0001 12.5714C22.0001 11.7857 21.9287 11.0001 21.7858 10.2857H12.0001V14.1429H17.4287C17.2144 15.2857 16.5001 16.2143 15.5001 16.8572L15.5715 17.3572L18.7858 19.7857L19.0001 19.8572C20.8572 18.2857 22.0001 15.9286 22.0001 12.5714Z" fill="#4285F4"/><path d="M12 22C14.7143 22 17.0715 21.0714 18.7858 19.7857L15.5001 16.8572C14.5001 17.5 13.2144 17.9286 12 17.9286C9.35721 17.9286 7.14289 16.1429 6.35721 13.6429L6.28578 13.7143L3.07146 16.0714L3.00003 16.1429C4.64289 19.4286 8.00003 22 12 22Z" fill="#34A853"/><path d="M6.35721 13.6429C6.00007 12.7143 6.00007 11.6429 6.35721 10.7143L6.35721 10.6429L3.07146 8.28571L3.00003 8.35714C1.85718 10.5714 1.85718 13.1429 3.00003 15.3572L6.35721 13.6429Z" fill="#FBBC05"/><path d="M12 6.14286C13.8572 6.14286 15.0715 6.92857 15.8572 7.71429L19 4.5C17.0715 2.85714 14.7143 2 12 2C8.00003 2 4.64289 4.57143 3.00003 7.85714L6.35721 10.2143C7.14289 7.71429 9.35721 5.92857 12 5.92857V6.14286Z" fill="#EA4335"/></svg>
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

export default function SignInClient({ providers }: { providers: Provider[] }) {
  const params = useSearchParams();
  const rawCallback = params.get("callbackUrl");

  // Determine standard callback target without double encoding
  const callbackUrl = rawCallback
    ? decodeURIComponent(rawCallback)
    : "https://salesmanpro.site/dashboards";

  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState({ email: "", password: "" });
  const [credentialProvider, setCredentialProvider] = useState<Provider | null>(null);
  const [googleProvider, setGoogleProvider] = useState<Provider | null>(null);

  useEffect(() => {
    if (providers && providers.length > 0) {
      setCredentialProvider(
        providers.find((p) => p.id === "credentials-email-password") || null
      );
      setGoogleProvider(providers.find((p) => p.id === "google") || null);
    }
  }, [providers]);

  const handleRegister = () => {
    const registerUrl = new URL("https://auth.salesmanpro.site/signup");
    registerUrl.searchParams.set("callbackUrl", window.location.origin);
    window.location.href = registerUrl.toString();
  };

  const loginUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoadingProvider("credentials");

    if (!data.email || !data.password) {
      setError("Please enter your email and password/code.");
      setLoadingProvider(null);
      return;
    }

    localStorage.setItem("callbackUrl", callbackUrl);

    await signIn("credentials-email-password", {
      email: data.email,
      password: data.password,
      redirect: true,
      callbackUrl,
    });

    setLoadingProvider(null);
  };

  const handleSocialSignIn = async (providerId: string) => {
    try {
      setLoadingProvider(providerId);
      setError(null);
      localStorage.setItem("callbackUrl", callbackUrl);

      // Pass callbackUrl directly without calling encodeURIComponent()
      await signIn(providerId, {
        redirect: true,
        callbackUrl,
      });
    } catch (err) {
      console.error(err);
      setError("Sign-In failed. Please check your connection and try again.");
      setLoadingProvider(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 overflow-auto py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-indigo-900/10 dark:bg-indigo-900/40 backdrop-blur-sm"></div>

      <div className="max-w-md w-full space-y-8 relative z-10 bg-white dark:bg-gray-800 p-10 sm:p-12 rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] dark:shadow-[0_20px_50px_rgba(255,_255,_255,_0.1)] transition-all duration-300">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mb-4 shadow-xl">
            <UserIcon className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">Log In</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Your sales success starts here.
            <br />
            <span className="text-xs text-yellow-500">powered by salesmanpro</span>
          </p>
        </div>

        {googleProvider && (
          <>
            <button
              disabled={loadingProvider !== null}
              className={`w-full flex items-center justify-center py-3 px-4 border border-gray-300 dark:border-gray-700 
                        rounded-xl shadow-md font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 
                        transition duration-300 ease-in-out transform 
                        ${
                          loadingProvider !== null
                            ? "opacity-60 cursor-not-allowed"
                            : "hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                        }`}
              onClick={() => handleSocialSignIn(googleProvider.id)}
            >
              {loadingProvider === googleProvider.id ? (
                <LoaderIcon className="mr-3 h-5 w-5 animate-spin" />
              ) : (
                <ProviderIcons.google className="mr-3 h-5 w-5" />
              )}
              {loadingProvider === googleProvider.id
                ? `Signing in with ${googleProvider.name}...`
                : `Sign in with ${googleProvider.name}`}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm font-medium">
            <AlertTriangle className="h-5 w-5 mr-3" />
            {error}
          </div>
        )}

        {credentialProvider && (
          <form onSubmit={loginUser} className="space-y-6">
            <InputField
              label="Email Address"
              name="email"
              type="text"
              icon={MailIcon}
              value={data.email}
              placeholder="you@company.com"
              onChange={(e) => setData({ ...data, email: e.target.value })}
            />
            <InputField
              label="Password or Code"
              name="password"
              type="password"
              icon={LockIcon}
              value={data.password}
              placeholder="••••••••"
              onChange={(e) => setData({ ...data, password: e.target.value })}
            />

            <button
              type="submit"
              disabled={loadingProvider !== null}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white transition duration-300 ease-in-out transform hover:scale-[1.01]
                ${
                  loadingProvider === "credentials"
                    ? "bg-yellow-400 cursor-wait opacity-80"
                    : loadingProvider !== null
                    ? "bg-yellow-500 opacity-60 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-4 focus:ring-yellow-300 dark:focus:ring-yellow-700"
                }`}
            >
              {loadingProvider === "credentials" ? (
                <>
                  <LoaderIcon className="h-5 w-5 mr-2 animate-spin" /> Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        )}

        <div className="text-sm text-center text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <button
            onClick={handleRegister}
            disabled={loadingProvider !== null}
            className={`font-medium text-yellow-500 hover:text-yellow-600 ${
              loadingProvider !== null && "opacity-60 cursor-not-allowed"
            }`}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}