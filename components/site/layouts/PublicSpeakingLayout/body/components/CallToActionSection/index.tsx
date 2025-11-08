"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, PaperAirplaneIcon, CalendarIcon } from "@heroicons/react/24/outline";

// NOTE: I've removed unused imports (Image, loader, heroSlides) and the unused 'current' state/effect/logic, 
// as this component is purely a Call-to-Action section, not the hero carousel.

const apiBaserUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// --- Framer Motion Variants for Polish ---

// Button Hover/Tap effect
const buttonVariants = {
  rest: { scale: 1, boxShadow: "0 10px 25px rgba(0,0,0,0.25)" },
  hover: { scale: 1.05, boxShadow: "0 15px 30px rgba(0,0,0,0.35)", y: -2, transition: { duration: 0.2 } },
  tap: { scale: 0.98, boxShadow: "0 5px 15px rgba(0,0,0,0.15)", y: 1 },
};

// --- Component Definition ---

interface CallToActionSectionProps {
  companyId?: string;
  // Optional prop for direct scheduling link if the user prefers a scheduling tool
  schedulingLink?: string; 
}

const CallToActionSection: React.FC<CallToActionSectionProps> = ({ companyId, schedulingLink }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  // Send message to admin logic (kept as is)
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setStatus("sending");

    try {
      const res = await fetch(`${apiBaserUrl}/conversations/send-to-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: companyId,
          content: message,
        }),
      });

      if (res.ok) {
        setStatus("sent");
        setMessage("");
        setTimeout(() => {
          setIsModalOpen(false);
          setStatus("idle");
        }, 1500);
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };
  
  // Custom button for scheduling via a link (if provided)
  const renderSchedulingButton = () => (
    <motion.a
      href={schedulingLink}
      target="_blank" // Open in new tab for external scheduling tools
      rel="noopener noreferrer"
      variants={buttonVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      className="inline-flex items-center justify-center px-10 py-5 font-bold text-lg md:text-xl text-orange-700 bg-white rounded-full shadow-xl transition-all duration-300 transform"
    >
      <CalendarIcon className="w-6 h-6 mr-3 text-orange-600" />
      Book Your Free Discovery Call
    </motion.a>
  );

  // Custom button for opening the 'Send Message' modal (if no scheduling link)
  const renderModalButton = () => (
    <motion.button
      onClick={() => setIsModalOpen(true)}
      variants={buttonVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      className="inline-flex items-center justify-center px-10 py-5 font-bold text-lg md:text-xl text-orange-700 bg-white rounded-full shadow-xl transition-all duration-300 transform"
    >
      <PaperAirplaneIcon className="w-6 h-6 mr-3 text-orange-600" />
      Send Me a Message
    </motion.button>
  );


  return (
    <section
      id="contact"
      className="relative py-28 md:py-36 bg-gray-900 text-white overflow-hidden" // Changed to dark BG for a more premium, high-contrast look
    >
      {/* Background Gradient Layer for 'Power' */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-800 via-red-700 to-yellow-600 opacity-90"></div>

      {/* Ambient Glow Accents (Enhanced Blur and Movement) */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-[10%] w-80 h-80 bg-orange-300 rounded-full mix-blend-lighten filter blur-3xl animate-blob-1"></div>
        <div className="absolute bottom-1/4 right-[5%] w-96 h-96 bg-red-400 rounded-full mix-blend-lighten filter blur-3xl animate-blob-2"></div>
      </div>

      {/* Foreground Content */}
      <div className="relative container mx-auto px-6 text-center z-10">
        <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
          Ready to <span className="text-yellow-300">Ignite</span> Your Success?
        </h2>
        <p className="text-xl md:text-2xl max-w-4xl mx-auto text-orange-200 mb-12 font-light leading-relaxed">
          Stop planning and start doing. Let's connect for a **free 15-minute discovery session** to map out your strategic next steps.
        </p>

        {/* CTA Button Group (Conditional) */}
        <div className="flex justify-center gap-6">
          {/* Prioritize a direct scheduling link if available for better conversion */}
          {schedulingLink ? renderSchedulingButton() : renderModalButton()}
          
          {/* Secondary CTA (Added for flexibility) */}
          <motion.a
            href={schedulingLink ? "#" : "#"} // Placeholder for second link or just keep the first button
            onClick={schedulingLink ? undefined : () => alert('Provide a scheduling link or another page URL for the secondary action.')}
            className={`inline-flex items-center justify-center px-8 py-5 font-semibold text-lg md:text-xl border-2 border-white text-white rounded-full transition-colors duration-300 hover:bg-white hover:text-gray-900 ${schedulingLink ? 'hidden md:inline-flex' : 'hidden'}`}
          >
            Learn More
          </motion.a>

        </div>

        {/* Decorative Separator Line */}
        <div className="mt-16 w-3/4 md:w-1/3 h-0.5 bg-white mx-auto opacity-30 rounded-full"></div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white text-gray-800 rounded-3xl shadow-2xl p-8 md:p-10 w-full max-w-lg relative border-t-8 border-orange-600" // Added rounded-3xl and border
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 120 }}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition p-2 rounded-full hover:bg-gray-100"
              >
                <XMarkIcon className="w-7 h-7" />
              </button>

              <h3 className="text-3xl font-extrabold mb-3 text-gray-900">👋 Connect with us</h3>
              <p className="text-gray-600 mb-6 border-b pb-4">
                Tell me a little about your goals or challenges. I'll get back to you within one business day.
              </p>

              <textarea
                className="w-full border-2 border-gray-200 rounded-xl p-4 mb-4 focus:ring-4 focus:ring-orange-500 focus:border-orange-500 transition duration-150 resize-none"
                rows={6}
                placeholder="E.g., I'm looking to increase my team's efficiency and need a strategic plan. What's your process?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              <motion.button
                onClick={handleSendMessage}
                disabled={status === "sending" || !message.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {status === "sending" ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-5 h-5 mr-2 -rotate-45" />
                    Send Your Message Now
                  </>
                )}
              </motion.button>

              {status === "sent" && (
                <p className="text-green-600 mt-4 text-center font-semibold flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Message sent successfully!
                </p>
              )}
              {status === "error" && (
                <p className="text-red-600 mt-4 text-center">
                  Failed to send message. Please refresh and try again.
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default CallToActionSection;