"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AcademicCapIcon, ArrowRightIcon, SparklesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useStoreContext } from '@/contexts/StoreContext';

export default function LoginPage() {
  const { storeFormData } = useStoreContext();
  const router = useRouter();

  // Theme Settings
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121';
  const accentColor = storeFormData?.themeSettings?.secondaryColor || '#FFC107';

  // State
  const [loginCode, setLoginCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorShake, setErrorShake] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleLogin = async (codeToSubmit: string) => {
    if (codeToSubmit.length !== 6) return;

    setLoading(true);
    setMessage(null);
    setErrorShake(false);

    try {
      const result = await signIn('school-code-login', {
        loginCode: codeToSubmit,
        redirect: false,
      });

      if (result?.error) {
        setErrorShake(true);
        setMessage({ type: 'error', text: "Invalid access code. Please verify and try again." });
        setLoginCode('');
        inputRef.current?.focus();
        // Reset shake after animation
        setTimeout(() => setErrorShake(false), 500);
      } else if (result?.ok) {
        setMessage({ type: 'success', text: 'Identity verified. entering portal...' });
        
        setTimeout(() => {
          const destination = codeToSubmit.startsWith('1') 
            ? '/admin/685018d708b38f9635fb3a03' 
            : '/admin/685084cc4da288b5c3156e4a';
          router.push(destination);
        }, 1000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Connection lost. Please check your internet.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setLoginCode(val);
    if (val.length === 6) {
      handleLogin(val);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 overflow-hidden bg-[#040d08] selection:bg-emerald-500/30">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-700/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-green-900/20 blur-[120px] animate-pulse [animation-delay:2s]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          x: errorShake ? [-10, 10, -10, 10, 0] : 0 
        }}
        transition={{ duration: errorShake ? 0.4 : 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="backdrop-blur-3xl bg-emerald-950/10 border border-emerald-500/20 rounded-[3rem] p-8 sm:p-12 shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden">
          
          {/* Brand Header */}
          <div className="text-center mb-10">
            <motion.div 
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
            >
              {storeFormData.logoUrl ? (
                <img src={storeFormData.logoUrl} alt="Logo" className="w-14 h-14 object-contain" />
              ) : (
                <AcademicCapIcon className="w-12 h-12 text-white/90" />
              )}
            </motion.div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
              {storeFormData?.name || "EduLearn Academy"}
            </h1>
            <p className="text-emerald-400/60 font-bold tracking-[0.2em] uppercase text-[10px]">
              Secure Digital Gateway
            </p>
          </div>

          {/* Input Section */}
          <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
            <div 
              className="relative cursor-text" 
              onClick={() => inputRef.current?.focus()}
            >
              {/* The "Brain" of the input - invisible but functional */}
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                value={loginCode}
                onChange={handleChange}
                disabled={loading}
                className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-text"
              />

              {/* The "Face" of the input - Visual Slots */}
              <div className="flex justify-between gap-2 sm:gap-3">
                {[...Array(6)].map((_, i) => {
                  const char = loginCode[i];
                  const isCurrent = loginCode.length === i;
                  
                  return (
                    <div
                      key={i}
                      className={`relative w-12 h-16 sm:w-14 sm:h-20 flex items-center justify-center text-3xl font-black rounded-2xl border-2 transition-all duration-300
                        ${char 
                          ? 'border-amber-400 bg-amber-400/10 text-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.15)]' 
                          : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-900/30'}
                        ${isCurrent && !loading ? 'border-emerald-400 ring-4 ring-emerald-400/10' : ''}
                      `}
                    >
                      {char || ""}
                      {isCurrent && !loading && (
                        <motion.div 
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8 }}
                          className="absolute bottom-4 w-6 h-1 bg-emerald-400 rounded-full"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notifications */}
            <div className="min-h-[60px]">
              <AnimatePresence mode="wait">
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`flex items-center gap-3 text-sm font-bold p-4 rounded-2xl border ${
                      message.type === 'success' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {message.type === 'success' ? (
                      <SparklesIcon className="w-5 h-5 shrink-0" />
                    ) : (
                      <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
                    )}
                    {message.text}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={() => handleLogin(loginCode)}
              disabled={loading || loginCode.length < 6}
              className="group relative w-full rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 p-[1px] transition-all hover:shadow-[0_0_30px_rgba(251,191,36,0.3)] disabled:opacity-30 disabled:hover:shadow-none"
            >
              <div className="bg-[#040d08] group-hover:bg-transparent transition-all rounded-[15px] py-4 px-6 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-sm text-amber-400 group-hover:text-[#040d08]">
                {loading ? (
                   <span className="flex gap-1">
                     <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
                     <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
                     <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" />
                   </span>
                ) : (
                  <>
                    Enter Portal
                    <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="mt-8 text-center">
            <button className="text-emerald-700 hover:text-amber-500 text-[10px] font-bold uppercase tracking-widest transition-colors">
              Request New Access Code
            </button>
          </div>
        </div>
      </motion.div>

      {/* Persistent Footer */}
      <div className="absolute bottom-8 flex gap-4 text-[9px] uppercase tracking-[0.3em] text-emerald-900/60 font-bold">
        <span>© 2026 {storeFormData?.name || "EduLearn"}</span>
        <span>•</span>
        <span>End-to-End Encrypted</span>
      </div>
    </div>
  );
}