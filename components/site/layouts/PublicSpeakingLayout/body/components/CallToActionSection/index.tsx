"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PaperAirplaneIcon, 
  CalendarIcon, 
  CheckIcon, 
  ExclamationTriangleIcon 
} from "@heroicons/react/24/outline";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Framer Motion variants for subtle interactive polish
const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.02, y: -2, transition: { duration: 0.2 } },
  tap: { scale: 0.98, y: 0 },
};

interface CallToActionSectionProps {
  companyId?: string;
  schedulingLink?: string; 
}

export default function CallToActionSection({ 
  companyId, 
  schedulingLink 
}: CallToActionSectionProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !email.trim()) return;
    setStatus("sending");

    // Clear and clean formatting for your admin panel conversations
    const formattedContent = `Sender Name: ${name || "Not provided"}\nContact Email: ${email}\n\nMessage:\n${message}`;

    try {
      const res = await fetch(`${apiBaseUrl}/conversations/send-to-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: companyId,
          content: formattedContent, // Fallback for plain-text layouts
          email: email.trim(),       // Crucial for Guest Auto-Upsert
          name: name.trim(),         // Links to automatic user creation
        }),
      });

      if (res.ok) {
        setStatus("sent");
        setMessage("");
        setEmail("");
        setName("");
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setStatus("error");
    }
  };

  return (
    <section
      id="contact"
      className="relative py-24 md:py-32 bg-gray-950 text-white overflow-hidden"
    >
      {/* Background Gradient Layer for 'Power' */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900 via-red-900 to-amber-950 opacity-95" />

      {/* Ambient Glow Accents */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-[5%] w-96 h-96 bg-orange-500 rounded-full mix-blend-lighten filter blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-[5%] w-[450px] h-[450px] bg-red-600 rounded-full mix-blend-lighten filter blur-[150px] animate-pulse" />
      </div>

      <div className="relative container mx-auto px-6 z-10 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Direct Call-to-Action & Scheduling */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tight uppercase">
              Ready to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400">
                Ignite
              </span> Your Success?
            </h2>
            
            <p className="text-lg text-orange-100 font-light leading-relaxed">
              Stop planning and start doing. Drop us a message, or jump right into our calendar to book a free 15-minute discovery session to map out your strategic next steps.
            </p>

            {schedulingLink && (
              <div className="pt-4">
                <motion.a
                  href={schedulingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={buttonVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 font-bold text-base text-zinc-950 bg-white hover:bg-orange-50 rounded-xl shadow-xl transition-colors duration-300"
                >
                  <CalendarIcon className="w-5 h-5 mr-3 text-orange-600" />
                  Book Free Discovery Call
                </motion.a>
              </div>
            )}
          </div>

          {/* Right Column: Premium Inline Contact Card */}
          <div className="lg:col-span-7">
            <div className="bg-black/30 border border-white/10 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl relative">
              
              {/* Form Label Corner Details */}
              <div className="absolute top-4 left-6 text-[10px] font-mono tracking-widest text-orange-400/70 uppercase">
                
              </div>
              <div className="absolute top-4 right-6 flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500/50" />
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
              </div>

              <form onSubmit={handleSendMessage} className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name Input */}
                  <div className="bg-black/40 border border-white/5 rounded-xl p-3 focus-within:border-orange-500/50 transition-colors duration-200">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-orange-300/80 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-700 focus:outline-none focus:ring-0 border-0 p-0"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="bg-black/40 border border-white/5 rounded-xl p-3 focus-within:border-orange-500/50 transition-colors duration-200">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-orange-300/80 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-700 focus:outline-none focus:ring-0 border-0 p-0"
                    />
                  </div>
                </div>

                {/* Message Textarea */}
                <div className="bg-black/40 border border-white/5 rounded-xl p-3 focus-within:border-orange-500/50 transition-colors duration-200">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-orange-300/80 mb-1">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tell us about your goals or current bottlenecks..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-700 focus:outline-none focus:ring-0 border-0 p-0 resize-none"
                  />
                </div>

                {/* Submission Action */}
                <div className="pt-2">
                  <motion.button
                    type="submit"
                    disabled={status === "sending" || !message.trim() || !email.trim()}
                    variants={buttonVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-4 rounded-xl font-bold text-base tracking-wider uppercase shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-300"
                  >
                    {status === "sending" ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Tuning engine...
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                        Launch Message
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Inline Status Messages */}
                <AnimatePresence mode="wait">
                  {status === "sent" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-start gap-3 text-xs font-mono text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 p-4 rounded-xl"
                    >
                      <CheckIcon className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                      <div>
                        <p className="font-bold">Transmission Successful!</p>
                        <p className="text-emerald-400/80 mt-0.5">Your message has landed. Expect a reply within one business day.</p>
                      </div>
                    </motion.div>
                  )}

                  {status === "error" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-start gap-3 text-xs font-mono text-rose-400 border border-rose-500/20 bg-rose-500/5 p-4 rounded-xl"
                    >
                      <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 text-rose-400" />
                      <div>
                        <p className="font-bold">Transmission Interrupted</p>
                        <p className="text-rose-400/80 mt-0.5">We ran into an issue dispatching your request. Please check your network and try again.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}