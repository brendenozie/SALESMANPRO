'use client';

import React, { useState } from 'react';

const faqs = [
  {
    question: 'What services are included in the package?',
    answer:
      'Our cleaning package includes carpet cleaning, bathroom cleaning, floor cleaning, and bedroom cleaning.',
  },
  {
    question: 'Can I schedule a recurring service?',
    answer:
      'Yes, you can choose between one-time or recurring (monthly/yearly) services at checkout.',
  },
  {
    question: 'Do you bring your own cleaning supplies?',
    answer:
      'Yes, our team arrives fully equipped with eco-friendly cleaning supplies and tools.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-gray-50 py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-semibold mb-4">Frequently Asked Questions</h2>
        <p className="text-gray-600 mb-12">
          Everything you need to know about our cleaning services
        </p>

        <div className="space-y-6 text-left">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md">
              <button
                className="flex justify-between items-center w-full text-left text-lg font-medium"
                onClick={() => toggle(index)}
              >
                {faq.question}
                <span className="text-orange-500 text-xl">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              {openIndex === index && (
                <p className="mt-4 text-gray-600">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


 {/* FAQs + Children */}
//  {faqs && faqs.length > 0 && (
//   <section className="py-24 bg-gray-50">
//     <div className="container mx-auto px-6 max-w-3xl">
//       <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
//         Frequently Asked Questions
//       </h2>
//       {faqs.map((q, idx) => (
//         <details key={idx} className="mb-4 bg-white rounded-xl p-6 shadow">
//           <summary className="cursor-pointer font-semibold text-gray-900">
//             {q.question}
//           </summary>
//           <p className="mt-3 text-gray-600">{q.answer}</p>
//         </details>
//       ))}
//     </div>
//   </section>
// )}