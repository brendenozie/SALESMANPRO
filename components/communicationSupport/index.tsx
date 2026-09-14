import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  LifebuoyIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

interface CommunicationSupportProps {
  slug?: string;
}

const faqs = [
  {
    q: "How long does Ghuba delivery take across Kenya?",
    a: "Standard delivery takes between 24 to 48 hours for Nairobi and major towns, and 2-3 business days for upcountry locations. Orders can be tracked live in your Orders tab.",
  },
  {
    q: "What payment methods are supported?",
    a: "Ghuba supports instant M-Pesa STK push, debit/credit cards, and cash on delivery for verified physical items.",
  },
  {
    q: "How do returns and refunds work?",
    a: "If an item does not match its description or arrives damaged, you can request a return within 48 hours of delivery directly through customer support.",
  },
  {
    q: "How do I become a seller on Ghuba?",
    a: "Click 'Sell' in the bottom navigation bar or visit /stores to register your storefront and start listing items.",
  },
];

const CommunicationSupport: React.FC<CommunicationSupportProps> = ({ slug = "ghuba" }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketSent, setTicketSent] = useState(false);

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;

    // Simulate ticket submission or open WhatsApp support with prefilled message
    const supportMessage = encodeURIComponent(
      `[Support Request]\nSubject: ${ticketSubject}\nMessage: ${ticketMessage}`
    );
    window.open(`https://wa.me/254700000000?text=${supportMessage}`, "_blank");

    setTicketSent(true);
    setTicketSubject("");
    setTicketMessage("");
    setTimeout(() => setTicketSent(false), 5000);
  };

  return (
    <div className="p-6 w-full max-w-3xl mx-auto shadow-xl rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60">
      <div className="mb-6 pb-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <span>💬</span> Help & Customer Support
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Get assistance with orders, refunds, delivery, and account inquiries
        </p>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <a
          href="https://wa.me/254700000000?text=Hello%20Ghuba%20Support%2C%20I%20need%20assistance"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/60 rounded-2xl flex items-center gap-3 hover:scale-102 transition-transform group"
        >
          <div className="p-2.5 bg-green-500 text-white rounded-xl group-hover:scale-110 transition-transform">
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">WhatsApp Chat</h4>
            <p className="text-xs text-green-700 dark:text-green-400">Live Agent Help</p>
          </div>
        </a>

        <a
          href="tel:+254700000000"
          className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-2xl flex items-center gap-3 hover:scale-102 transition-transform group"
        >
          <div className="p-2.5 bg-blue-500 text-white rounded-xl group-hover:scale-110 transition-transform">
            <PhoneIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Phone Line</h4>
            <p className="text-xs text-blue-700 dark:text-blue-400">Direct Support</p>
          </div>
        </a>

        <Link
          href={`/site/${slug}/ghuba/help-center`}
          className="p-4 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800/60 rounded-2xl flex items-center gap-3 hover:scale-102 transition-transform group"
        >
          <div className="p-2.5 bg-yellow-500 text-white rounded-xl group-hover:scale-110 transition-transform">
            <LifebuoyIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Help Center</h4>
            <p className="text-xs text-yellow-700 dark:text-yellow-400">Knowledgebase</p>
          </div>
        </Link>
      </div>

      {/* Support Ticket Section */}
      <div className="mb-8 p-5 bg-gray-50 dark:bg-gray-700/40 rounded-2xl border border-gray-100 dark:border-gray-700/60">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <ChatBubbleLeftRightIcon className="w-5 h-5 text-yellow-500" />
          Send a Message to Support
        </h3>
        {ticketSent ? (
          <div className="p-4 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-xl text-sm font-medium">
            Thank you! Your message has been routed to our WhatsApp and email support channel.
          </div>
        ) : (
          <form onSubmit={handleTicketSubmit} className="space-y-3 mt-3">
            <input
              type="text"
              placeholder="What do you need help with? (e.g. Order #1234 delivery)"
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              className="w-full p-3 text-sm border rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
            <textarea
              rows={3}
              placeholder="Describe your issue or question in detail..."
              value={ticketMessage}
              onChange={(e) => setTicketMessage(e.target.value)}
              className="w-full p-3 text-sm border rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-yellow-400"
              required
            ></textarea>
            <button
              type="submit"
              className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <span>Submit to Support</span>
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Frequently Asked Questions */}
      <div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <QuestionMarkCircleIcon className="w-5 h-5 text-yellow-500" />
          Frequently Asked Questions
        </h3>
        <div className="space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-gray-100 dark:border-gray-700/60 rounded-xl overflow-hidden bg-gray-50/50 dark:bg-gray-700/20"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-3.5 text-left flex justify-between items-center text-sm font-bold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isOpen ? "transform rotate-180 text-yellow-500" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-3.5 pb-3.5 text-xs text-gray-600 dark:text-gray-300 leading-relaxed"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CommunicationSupport;
