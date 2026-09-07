"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  EnvelopeIcon, 
  CalendarIcon, 
  PaperAirplaneIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface CallToActionSectionProps {
  companyId?: string;
  schedulingLink?: string; 
  pagedata?: any;
}

export default function CallToActionSection({ 
  companyId, 
  schedulingLink, 
  pagedata 
}: CallToActionSectionProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  // Dynamic system color matching the FAQ Section
  const systemAccent = pagedata?.themeSettings?.primaryColor || '#F59E0B'; 

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !email.trim()) return;
    setStatus("sending");

    // Clean formatting for the message sent to your admin panel
    const formattedContent = `Sender Name: ${name || "Not provided"}\nContact Email: ${email}\n\nMessage:\n${message}`;

    try {
      const res = await fetch(`${apiBaseUrl}/conversations/send-to-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: companyId,
          email: email,
          name: name,
          content: formattedContent,
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
      className="relative py-24 md:py-36 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-sans overflow-hidden border-t border-zinc-200 dark:border-zinc-900 transition-colors duration-300"
    >
      {/* Background Accent Grid Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#09090b_1px,transparent_1px),linear-gradient(to_bottom,#09090b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none transition-colors" />

      {/* Programmatic Subtle Glow mapped to Accent Theme */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-[0.05] dark:opacity-[0.03] blur-[120px] pointer-events-none transition-all duration-1000"
        style={{ backgroundColor: systemAccent }}
      />

      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Core Positioning & Context */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 border border-zinc-200 dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-900/20 px-3 py-1.5 rounded-md text-[10px] font-mono tracking-[0.15em] uppercase text-zinc-600 dark:text-zinc-500 select-none transition-colors">
              <EnvelopeIcon className="w-3.5 h-3.5" style={{ color: systemAccent }} />
              Get In Touch
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight uppercase leading-none transition-colors">
              Let&apos;s Engage <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 dark:from-zinc-100 dark:via-zinc-300 dark:to-zinc-500">
                Start a Conversation
              </span>
            </h2>

            <p className="text-zinc-600 dark:text-zinc-400 font-light text-sm sm:text-base leading-relaxed text-justify transition-colors">
              Have a question, or you want to get off the ground? Drop us a message using the form, or book a quick intro call. We would love to learn more about your goals and see how we can help.
            </p>

            <div className="pt-4 space-y-4">
              {schedulingLink && (
                <motion.a
                  href={schedulingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                  className="flex items-center justify-between w-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/10 hover:bg-zinc-100/80 dark:hover:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-800 transition-all duration-300 shadow-sm dark:shadow-none group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-lg group-hover:border-zinc-300 dark:group-hover:border-zinc-800 transition-colors">
                      <CalendarIcon className="w-5 h-5 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">Online Scheduler</p>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-200">Book a Free 15-Min Call</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold tracking-widest transition-colors" style={{ color: systemAccent }}>
                    Book Call &rarr;
                  </span>
                </motion.a>
              )}

              <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-900/50 bg-zinc-100/80 dark:bg-zinc-950/20 text-xs font-mono text-zinc-500 space-y-2 transition-colors">
                <div className="flex justify-between">
                  <span>Typical response time:</span>
                  <span className="text-zinc-700 dark:text-zinc-400">Under 24 hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Current availability:</span>
                  <span className="text-zinc-700 dark:text-zinc-400">Accepting new clients</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: High-Fidelity Contact Panel */}
          <div className="lg:col-span-7">
            <div className="border border-zinc-200 dark:border-zinc-900 bg-white/80 dark:bg-zinc-900/10 rounded-2xl p-6 md:p-8 backdrop-blur-md relative shadow-xl dark:shadow-none transition-colors duration-300">
              {/* Outer Edge Corner Indicators */}
              <div className="absolute top-3 left-3 font-mono text-[9px] text-zinc-400 dark:text-zinc-700 select-none">Quick Message</div>
              <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: systemAccent }} />

              <form onSubmit={handleSendMessage} className="space-y-4 mt-4">
                
                {/* Dual Inputs Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name field */}
                  <div className="border border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 rounded-lg p-3 focus-within:border-zinc-400 dark:focus-within:border-zinc-800 transition-colors duration-200">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent text-sm text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-700 focus:outline-none focus:ring-0 border-0 p-0"
                    />
                  </div>

                  {/* Email field */}
                  <div className="border border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 rounded-lg p-3 focus-within:border-zinc-400 dark:focus-within:border-zinc-800 transition-colors duration-200">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent text-sm text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-700 focus:outline-none focus:ring-0 border-0 p-0"
                    />
                  </div>
                </div>

                {/* Message Text Area */}
                <div className="border border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 rounded-lg p-3 focus-within:border-zinc-400 dark:focus-within:border-zinc-800 transition-colors duration-200">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tell us a little bit about what you are looking to build or ask..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-transparent text-sm text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-700 focus:outline-none focus:ring-0 border-0 p-0 resize-none"
                  />
                </div>

                {/* Action Trigger Node */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={status === "sending" || !message.trim() || !email.trim()}
                    className="w-full group/btn text-sm py-4 px-6 rounded-xl font-mono font-bold uppercase tracking-wider text-zinc-950 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:brightness-105"
                    style={{ backgroundColor: systemAccent }}
                  >
                    {status === "sending" ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-zinc-950" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>

                {/* Feedback State Matrix */}
                <AnimatePresence mode="wait">
                  {status === "sent" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-xs font-mono text-emerald-800 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-950 bg-emerald-50 dark:bg-emerald-950/10 p-3 rounded-lg"
                    >
                      <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                      <span>Thank you! Your message was sent successfully. We will get back to you shortly.</span>
                    </motion.div>
                  )}

                  {status === "error" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-xs font-mono text-rose-800 dark:text-rose-500 border border-rose-200 dark:border-rose-950 bg-rose-50 dark:bg-rose-950/10 p-3 rounded-lg"
                    >
                      <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
                      <span>Something went wrong. Please check your connection and try again.</span>
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