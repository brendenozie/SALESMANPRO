"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

// --- icons ---
const MailIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const LockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const Loader2 = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const AlertTriangle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-9-15-9 15z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

// --- types ---
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
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
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
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "https://salesmanpro.site";

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState({ email: "", password: "" });
  const [credentialProvider, setCredentialProvider] = useState<Provider | null>(null);
  const [socialProviders, setSocialProviders] = useState<Provider[]>([]);

  // ✅ Initialize once on mount
  useEffect(() => {
    if (providers && providers.length > 0) {
      setCredentialProvider(
        providers.find(p => p.id === "credentials-email-password") || null
      );
      setSocialProviders(
        providers.filter(p => p.id !== "credentials-email-password" && p.id !== "email")
      );
    }
  }, [providers]);

   const handleRegister = () => {
    const registerUrl = new URL("https://salesmanpro.site/signup");
    registerUrl.searchParams.set("callbackUrl", window.location.origin);
    window.location.href = registerUrl.toString();
  }

  const loginUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!data.email || !data.password) {
      setError("Please enter both email and password.");
      setIsLoading(false);
      return;
    }

    localStorage.setItem("callbackUrl", callbackUrl);
    
    await signIn("credentials-email-password", {
      email: data.email,
      password: data.password,
      redirect: true,
      callbackUrl,
    });

    setIsLoading(false);

    // if (res?.error) {
    //   setError("Login failed. Please check your credentials.");
    //   return;
    // }

  };

  const handleSocialSignIn = async (providerId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      localStorage.setItem("callbackUrl", callbackUrl);
      await signIn(providerId, { redirect: true, callbackUrl: encodeURIComponent(callbackUrl), });
    } catch (err) {
      console.error(err);
      setError("Sign-In failed. Please check your connection and try again.");
      setIsLoading(false);
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
              label="Password"
              name="password"
              type="password"
              icon={LockIcon}
              value={data.password}
              placeholder="••••••••"
              onChange={(e) => setData({ ...data, password: e.target.value })}
            />

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white transition duration-300 ease-in-out transform hover:scale-[1.01]
                ${isLoading
                  ? "bg-yellow-400 cursor-wait"
                  : "bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-4 focus:ring-yellow-300 dark:focus:ring-yellow-700"
                }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2" /> Signing In...
                </>
              ) : (
                "Sign In with Credentials"
              )}
            </button>
          </form>
        )}

        {socialProviders.length > 0 && (
          <>
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

            {socialProviders
              .filter((p) => p.id === "google")
              .map((prov) => (
                <button
                  key={prov.id}
                  onClick={() => handleSocialSignIn(prov.id)}
                  className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 dark:border-gray-700 rounded-xl shadow-md font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:shadow-lg transition duration-300 ease-in-out transform hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Sign in with {prov.name}
                </button>
              ))}

            
          </>
        )}

        {/* //signup */}
        <div className="text-sm text-center text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <button
            onClick={handleRegister}
            className="font-medium text-yellow-500 hover:text-yellow-600"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
