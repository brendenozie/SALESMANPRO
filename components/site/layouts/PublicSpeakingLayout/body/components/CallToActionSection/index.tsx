"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { XMarkIcon } from "@heroicons/react/24/outline";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const heroSlides = [
  {
    type: "image",
    url: "/coach-hero.jpg",
    headline: "Unlock Your True Potential",
    subline:
      "Empowering ambitious individuals and teams to create a life of purpose, clarity, and success.",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=2670&auto=format&fit=crop",
    headline: "Transform Your Vision into Action",
    subline:
      "Through strategic coaching and tailored consultation, I help you move from ideas to impact.",
  },
  {
    type: "video",
    url: "https://cdn.pixabay.com/video/2024/02/26/200827-919106201_large.mp4",
    headline: "Lead with Confidence, Inspire with Purpose",
    subline:
      "Gain clarity, build resilience, and become the leader you were meant to be.",
  },
];

const autoAdvanceDelay = 9000; // 9 seconds

interface CallToActionSectionProps {
  companyId?: string;
}
const CallToActionSection: React.FC<CallToActionSectionProps> = ({ companyId }) => {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const advanceSlide = useCallback(
    (direction: "next" | "prev") => {
      setCurrent((prev) =>
        direction === "next"
          ? (prev + 1) % heroSlides.length
          : (prev - 1 + heroSlides.length) % heroSlides.length
      );
    },
    []
  );

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => advanceSlide("next"), autoAdvanceDelay);
    return () => clearTimeout(timeoutRef.current!);
  }, [current, advanceSlide]);

  // Send message to admin
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setStatus("sending");

    try {
      const res = await fetch(`${apiUrl}/api/conversations/send-to-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: companyId, // <-- Replace or dynamically inject
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

  return (
    <section
      id="contact"
      className="relative py-28 bg-gradient-to-br from-orange-600 via-red-500 to-orange-700 text-white overflow-hidden"
    >
      {/* Ambient Glow Accents */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-10 left-20 w-72 h-72 bg-orange-300 rounded-full mix-blend-overlay filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-red-400 rounded-full mix-blend-overlay filter blur-3xl animate-pulse-slow"></div>
      </div>

      {/* Foreground Content */}
      <div className="relative container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
          Ready to <span className="text-orange-200">Transform</span> Your Future?
        </h2>
        <p className="text-xl max-w-3xl mx-auto text-orange-100 mb-10 leading-relaxed">
          Take the bold first step toward unlocking your potential. Let’s connect for a free discovery call — 
          no pressure, just clarity, strategy, and purpose.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="relative inline-flex items-center justify-center px-12 py-6 font-bold text-lg md:text-xl text-orange-700 bg-white rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.25)] hover:bg-orange-50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-7 h-7 mr-3 text-orange-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10m-7 4h4m-5 4h6m4 0a2 2 0 002-2V7a2 2 0 00-2-2h-2V3H8v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12z"
            />
          </svg>
          Schedule Your Free Call Today
        </button>

        {/* Decorative Line */}
        <div className="mt-12 w-32 h-1 bg-gradient-to-r from-orange-200 via-white to-orange-200 mx-auto rounded-full opacity-80"></div>
      </div>

      {/* Floating Overlay Pattern */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08)_0%,transparent_70%)]"></div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white text-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-lg relative"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 120 }}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-bold mb-4 text-orange-700">Send a Message to the Admin</h3>
              <p className="text-gray-600 mb-4">
                Fill in your message below and we’ll get back to you as soon as possible.
              </p>

              <textarea
                className="w-full border border-gray-300 rounded-xl p-3 mb-4 focus:ring-2 focus:ring-orange-500"
                rows={5}
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              <button
                onClick={handleSendMessage}
                disabled={status === "sending"}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50"
              >
                {status === "sending" ? "Sending..." : "Send Message"}
              </button>

              {status === "sent" && (
                <p className="text-green-600 mt-4 text-center">Message sent successfully!</p>
              )}
              {status === "error" && (
                <p className="text-red-600 mt-4 text-center">Failed to send message. Please try again.</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default CallToActionSection;
