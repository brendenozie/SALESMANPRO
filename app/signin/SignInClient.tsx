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

// We define a simple icon mapping for common providers.
const ProviderIcons: Record<string, (props: React.SVGProps<SVGSVGElement>) => JSX.Element> = {
    google: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22.0001 12.5714C22.0001 11.7857 21.9287 11.0001 21.7858 10.2857H12.0001V14.1429H17.4287C17.2144 15.2857 16.5001 16.2143 15.5001 16.8572L15.5715 17.3572L18.7858 19.7857L19.0001 19.8572C20.8572 18.2857 22.0001 15.9286 22.0001 12.5714Z" fill="#4285F4"/><path d="M12 22C14.7143 22 17.0715 21.0714 18.7858 19.7857L15.5001 16.8572C14.5001 17.5 13.2144 17.9286 12 17.9286C9.35721 17.9286 7.14289 16.1429 6.35721 13.6429L6.28578 13.7143L3.07146 16.0714L3.00003 16.1429C4.64289 19.4286 8.00003 22 12 22Z" fill="#34A853"/><path d="M6.35721 13.6429C6.00007 12.7143 6.00007 11.6429 6.35721 10.7143L6.35721 10.6429L3.07146 8.28571L3.00003 8.35714C1.85718 10.5714 1.85718 13.1429 3.00003 15.3572L6.35721 13.6429Z" fill="#FBBC05"/><path d="M12 6.14286C13.8572 6.14286 15.0715 6.92857 15.8572 7.71429L19 4.5C17.0715 2.85714 14.7143 2 12 2C8.00003 2 4.64289 4.57143 3.00003 7.85714L6.35721 10.2143C7.14289 7.71429 9.35721 5.92857 12 5.92857V6.14286Z" fill="#EA4335"/></svg>
    ),
    github: (props: React.SVGProps<SVGSVGElement>) => (
      <svg {...props} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.2-1 3.2-4.2 3.2-5.7 0-.7-.2-1.2-.5-1.7 1.5-.2 1.5-1 1.5-3s-.9-2.7-1.7-3.2c-.3-.2-.7-.3-1.1-.3-1.6 0-3.3 1-4.2 2.7-.4.6-.6 1.3-.6 2.2 0 1.5.5 3.5 1 5.4 1 2 2.5 3.7 4.2 4.5v3.2"/></svg>
    ),
    // Add more providers as needed
};

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
    const registerUrl = new URL("https://auth.salesmanpro.site/signup");
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

        {socialProviders.length > 0 && (
          <>

            {socialProviders
              .filter((p) => p.id === "google")
              .map((prov) => {
                const IconComponent = ProviderIcons[prov.id.toLowerCase()] || UserIcon;

                return (
                  <button
                    key={prov.id}
                    className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 dark:border-gray-700 
                              rounded-xl shadow-md font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 
                              hover:shadow-lg transition duration-300 ease-in-out transform hover:bg-gray-50 dark:hover:bg-gray-600"
                    onClick={() => handleSocialSignIn(prov.id)}
                  >
                    <IconComponent className="mr-3 h-5 w-5" />
                    Sign in with {prov.name}
                  </button>
                );
              })}
              
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
