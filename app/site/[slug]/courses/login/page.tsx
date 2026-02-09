"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AcademicCapIcon, KeyIcon, ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useStoreContext } from '@/contexts/StoreContext';

export default function LoginPage() {

  const { storeFormData } = useStoreContext();

  const { themeSettings } = storeFormData || {};
  const primaryColor = themeSettings?.primaryColor || '#fd2121';
  const accentColor = themeSettings?.secondaryColor || '#FFC107';
  
  const [loginCode, setLoginCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (loginCode.length !== 6) return;
    
    setLoading(true);
    setMessage(null);

    try {
      const result = await signIn('school-code-login', {
        loginCode,
        redirect: false,
      });

      if (result?.error) {
        setMessage({ type: 'error', text: "Invalid code. Please try again." });
        setLoginCode('');
      } else if (result?.ok) {
        setMessage({ type: 'success', text: 'Identity verified. Entering portal...' });
        
        setTimeout(() => {
          if (loginCode.startsWith('1')) {
            router.push('/admin/685018d708b38f9635fb3a03');
          } else {
            router.push('/admin/685084cc4da288b5c3156e4a');
          }
        }, 1200);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Connection failed. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loginCode.length === 6) {
      handleLogin();
    }
  }, [loginCode]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 overflow-hidden bg-[#040d08]">
      {/* Updated Mesh Background: Emerald & Forest Tones */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-700/20 blur-[130px] animate-pulse" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-green-900/30 blur-[130px] animate-pulse [animation-delay:1s]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="backdrop-blur-3xl bg-emerald-950/10 border border-emerald-500/20 rounded-[3rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
          
          {/* Top Section */}
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-green-700 shadow-[0_10px_20px_rgba(16,185,129,0.3)] mb-6`}
              style={{ background: `linear-gradient(to bottom right, ${primaryColor}, ${accentColor})` }}
            >
              <AcademicCapIcon className="w-12 h-12 text-emerald-50" />
            </motion.div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-2 italic">
              {storeFormData?.name || "EduLearn Academy"}
            </h1>
            <p className="text-emerald-200/50 font-medium tracking-widest uppercase text-xs">
              Secure Digital Gateway
            </p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-10">
            <div className="relative group">
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={loginCode}
                onChange={(e) => setLoginCode(e.target.value.replace(/\D/g, ''))}
                className="absolute inset-0 opacity-0 cursor-default"
                disabled={loading}
              />

              {/* Gold-Themed Digit Boxes */}
              <div className="flex justify-between gap-3">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-12 h-16 sm:w-14 sm:h-20 flex items-center justify-center text-3xl font-bold rounded-2xl border-2 transition-all duration-500 ${
                      loginCode[i] 
                        ? 'border-amber-400 bg-amber-400/10 text-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.2)]' 
                        : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-800'
                    } ${
                      loginCode.length === i && !loading ? 'border-emerald-400 animate-pulse' : ''
                    }`}
                  >
                    {loginCode[i] || ""}
                  </div>
                ))}
              </div>
            </div>

            {/* Status Messages */}
            <AnimatePresence mode="wait">
              {message && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`flex items-center gap-3 text-sm font-semibold p-4 rounded-2xl ${
                    message.type === 'success' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  <SparklesIcon className="w-5 h-5 flex-shrink-0" />
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Area: Metallic Gold Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => handleLogin()}
                disabled={loading || loginCode.length < 6}
                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-amber-300 via-amber-500 to-amber-600 p-[2px] transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-30"
              >
                <div className="bg-[#040d08] group-hover:bg-transparent transition-colors rounded-[14px] p-4 font-black text-amber-400 group-hover:text-emerald-950 uppercase tracking-widest text-sm flex items-center justify-center gap-3">
                  {loading ? (
                    <div className="flex gap-2">
                      <span className="w-2 h-2 bg-current rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  ) : (
                    <>
                      Enter Portal
                      <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>

          <div className="mt-10 text-center">
             <button className="text-emerald-600 hover:text-amber-400 text-xs font-bold uppercase tracking-widest transition-colors duration-300">
               Forgot Access Code?
             </button>
          </div>
        </div>
      </motion.div>

      {/* Footer Details */}
      <div className="absolute bottom-8 flex gap-6 text-[10px] uppercase tracking-[0.2em] text-emerald-800 font-bold">
        <span>© 2026 {storeFormData?.name || "EduLearn Academy"}</span>
        <span className="text-emerald-900">•</span>
        <span>Secure Session</span>
      </div>
    </div>
  );
}