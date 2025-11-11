import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// --- INLINE SVG ICONS (Replacing Heroicons for self-containment) ---

// 1. PlusIcon
const PlusIcon = ({ className }:{ className :string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v7.5h7.5a.75.75 0 010 1.5h-7.5v7.5a.75.75 0 01-1.5 0v-7.5h-7.5a.75.75 0 010-1.5h7.5v-7.5a.75.75 0 01.75-.75z" clipRule="evenodd" /></svg>;
// 2. MinusIcon
const MinusIcon = ({ className }:{ className :string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M3.75 12a.75.75 0 01.75-.75h15a.75.75 0 010 1.5H4.5a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>;

// --- CONFIG & DATA ---

// Framer Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Colors for Light Mode (Consistent with previous sections)
const lightBackground = "#F9FAFB"; // Very light gray background
const cardBackground = "#FFFFFF"; // Pure white cards
const accentColor = "#007AFF"; // Bright professional blue
const primaryTextColor = "#1F2937"; // Dark text
const secondaryTextColor = "#6B7280"; // Muted gray text

// Interface for an FAQ item
interface FAQItem {
  id: string | number;
  question: string;
  answer: string;
}

// Sample data for FAQs
const sampleFAQs: FAQItem[] = [
  {
    id: 'faq1',
    question: "What types of legal services do you offer?",
    answer: "We offer a comprehensive range of legal services including corporate law, intellectual property, real estate, litigation, and dispute resolution. Our experts are equipped to handle complex cases across various sectors.",
  },
  {
    id: 'faq2',
    question: "How do your financial advisory services work?",
    answer: "Our financial advisory services cover wealth management, investment planning, tax strategy, and estate planning. We work closely with you to understand your financial goals and create tailored strategies for sustainable growth.",
  },
  {
    id: 'faq3',
    question: "What is your typical client engagement process?",
    answer: "Our process begins with an initial consultation to understand your needs, followed by strategic planning, meticulous execution of the agreed-upon strategy, and continuous support with regular reviews to ensure long-term success.",
  },
  {
    id: 'faq4',
    question: "Are your consultations confidential?",
    answer: "Absolutely. All consultations and client interactions are treated with the utmost confidentiality and discretion, adhering to the highest standards of professional ethics and legal privacy regulations.",
  },
  {
    id: 'faq5',
    question: "How do I schedule an initial consultation?",
    answer: "You can easily schedule an initial consultation through our website's contact form, by calling our office directly, or by utilizing our online booking system available on the 'Consultation Packages' page.",
  },
];

interface FAQSectionProps {
  faqs?: FAQItem[];
}

// --- MAIN COMPONENT ---

export default function FAQSection({ faqs }: FAQSectionProps) {
  const faqsToDisplay = faqs && faqs.length > 0 ? faqs : sampleFAQs;
  const [openFAQ, setOpenFAQ] = React.useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <section
      id="faqs"
      className="py-20 sm:py-28 lg:py-36 relative overflow-hidden font-inter"
      style={{ backgroundColor: lightBackground }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight drop-shadow-sm"
              style={{ color: primaryTextColor }}
          >
            Frequently Asked Questions
          </h2>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed"
             style={{ color: secondaryTextColor }}
          >
            Find quick, detailed answers to the most common questions about our services and processes.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="space-y-4"
        >
          {faqsToDisplay.map((faq, i) => (
            <motion.div
              key={faq.id}
              variants={itemVariants}
              // Card style
              className="rounded-xl shadow-lg transition-all duration-300 transform cursor-pointer"
              style={{ 
                  backgroundColor: cardBackground, 
                  border: openFAQ === i ? `2px solid ${accentColor}` : '1px solid #E5E7EB',
                  boxShadow: openFAQ === i ? '0 10px 20px -5px rgba(0, 122, 255, 0.2)' : '0 4px 12px -2px rgba(0, 0, 0, 0.05)'
              }}
              onClick={() => toggleFAQ(i)}
            >
              {/* Question Header */}
              <div className="flex justify-between items-center p-6 sm:p-7">
                <h3 className="text-xl font-semibold leading-relaxed pr-4 transition-colors duration-200"
                    style={{ color: primaryTextColor }}>
                  {faq.question}
                </h3>
                {/* Expand/Collapse Icon */}
                <span className="flex-shrink-0">
                  <motion.div 
                    animate={{ rotate: openFAQ === i ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ color: accentColor }}
                  >
                    {openFAQ === i ? (
                      <MinusIcon className="h-7 w-7 transition-colors duration-300" />
                    ) : (
                      <PlusIcon className="h-7 w-7 transition-colors duration-300" />
                    )}
                  </motion.div>
                </span>
              </div>
              
              {/* Answer Content (Animated) */}
              <AnimatePresence>
                {openFAQ === i && (
                  <motion.p
                    initial={{ opacity: 0, height: 0, paddingLeft: 24, paddingRight: 24, paddingBottom: 0 }}
                    animate={{ 
                        opacity: 1, 
                        height: 'auto', 
                        paddingTop: 0, 
                        paddingBottom: 24,
                        paddingLeft: 24, 
                        paddingRight: 24,
                    }}
                    exit={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="leading-relaxed text-base overflow-hidden"
                    style={{ color: secondaryTextColor }}
                  >
                    {faq.answer}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}