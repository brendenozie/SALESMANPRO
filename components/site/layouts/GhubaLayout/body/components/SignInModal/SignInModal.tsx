"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, UserIcon } from "@heroicons/react/24/outline";
import { signIn, useSession } from "next-auth/react";
import GhubaAuthModal from "@/components/ghuba/auth/GhubaAuthModal";

export default function SignInPrompt() {
  const { data: session, status } = useSession();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      setVisible(false);
      return;
    }
    // Check if dismissed for current session
    if (typeof window !== "undefined" && sessionStorage.getItem("dismiss_ghuba_signin_prompt") === "true") {
      setVisible(false);
      return;
    }
    // Show after slight delay to not block first paint
    const timer = setTimeout(() => {
      setVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [status]);

  if (status === "authenticated") return null;

  const handleGoogleSignIn = () => {
    setLoading(true);
    const returnUrl = typeof window !== "undefined" ? window.location.href : "/";
    signIn("google", { callbackUrl: returnUrl });
  };

  const handleDismiss = () => {
    setVisible(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("dismiss_ghuba_signin_prompt", "true");
    }
  };

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-20 left-4 sm:left-6 md:bottom-8 md:left-8 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-4 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 w-80 sm:w-96 z-[80] transition-colors"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                <UserIcon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0 pr-2">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Welcome to Ghuba
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Sign in to track orders, save favorites, or manage your store.
                </p>

                <div className="mt-3 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-900 dark:text-white font-semibold text-xs shadow-sm transition-all active:scale-[0.98] disabled:opacity-60"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>{loading ? "Connecting..." : "Continue with Google"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="w-full text-center text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline py-1"
                  >
                    More sign in options
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Close notification"
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 -mr-1 -mt-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <GhubaAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        callbackUrl={typeof window !== "undefined" ? window.location.href : "/"}
      />
    </>
  );
}
