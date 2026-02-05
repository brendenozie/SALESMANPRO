"use client";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowPathIcon, GlobeAltIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

export default function DesktopSignIn() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "https://salesmanpro.site";
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn("google", { redirect: true, callbackUrl });
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#050505] overflow-hidden font-sans">
      
      {/* --- 1. THE CAPTIVATING BACKGROUND --- */}
      {/* Animated Mesh Gradients */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, -50, 0] 
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-yellow-500/10 rounded-full blur-[120px]" 
        />
      </div>

      {/* --- 2. THE GLASS LOGIN PORTAL --- */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[420px] p-1 bg-gradient-to-b from-white/10 to-transparent rounded-[32px]"
      >
        <div className="bg-[#0A0A0A]/90 backdrop-blur-3xl rounded-[31px] p-10 shadow-2xl border border-white/5">
          
          {/* Header Section */}
          <div className="text-center mb-10">
            <motion.div 
              initial={{ rotate: -10, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              className="inline-flex p-3 bg-yellow-500 rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.3)] mb-6"
            >
              <ShieldCheckIcon className="w-8 h-8 text-black" />
            </motion.div>
            
            <h1 className="text-3xl font-black tracking-tighter text-white mb-2">
              SALESMAN<span className="text-yellow-500">PRO</span>
            </h1>
            <div className="flex items-center justify-center space-x-2">
               <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest">
                 Secure Desktop Terminal
               </span>
            </div>
          </div>

          {/* Action Section */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-medium text-gray-200">System Authentication</h2>
              <p className="text-sm text-gray-500 mt-1">Please sign in to access your dashboard</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="group relative w-full flex items-center justify-center space-x-3 bg-white text-black py-4 rounded-2xl font-bold transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50"
            >
              {loading ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Connect with Google</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Footer Info */}
          <div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-gray-600">
             <div className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
               Server Online
             </div>
             <div>v2.1.0-DESKTOP</div>
          </div>
        </div>
      </motion.div>

      {/* Decorative Bottom Bar */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-8 text-gray-700">
          <ShieldCheckIcon className="w-4 h-4 opacity-30" />
          <GlobeAltIcon className="w-4 h-4 opacity-30" />
          <ShieldCheckIcon className="w-4 h-4 opacity-30" />
      </div>
    </div>
  );
}