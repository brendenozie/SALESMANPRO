// app/admin/[adminSlug]/testimonials/page.tsx
"use client";

import { motion } from 'framer-motion';
import { ChatBubbleLeftRightIcon, CheckCircleIcon, EyeSlashIcon, PlusCircleIcon, TrashIcon } from '@heroicons/react/24/solid';

const testimonialsData = [
  { id: 1, author: "Sarah M.", quote: "CapitalEdge transformed my financial outlook. Their expertise is unmatched!", status: "Approved" },
  { id: 2, author: "Dr. Alex J.", quote: "The legal clarity they provided was invaluable. Highly professional and responsive.", status: "Pending" },
  { id: 3, author: "Michael C.", quote: "Their team made complex tax planning seem effortless. Truly exceptional service.", status: "Approved" },
  { id: 4, author: "Anonymous Client", quote: "Excellent service, highly recommend for investment strategies.", status: "Hidden" },
];

export default function TestimonialsPage() {
  return (
    <div>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-blue-400">Client Testimonials</h3>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center">
            <PlusCircleIcon className="h-5 w-5 mr-2" /> Add New Testimonial
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {testimonialsData.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#0A192F] rounded-lg shadow-md border border-blue-800 p-6 flex flex-col"
            >
              <p className="text-xl italic text-blue-100 mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
              <p className="text-lg font-semibold text-white">- {testimonial.author}</p>
              <div className="flex items-center mt-3 text-sm">
                <span className={`px-3 py-1 rounded-full font-semibold ${
                  testimonial.status === 'Approved' ? 'bg-green-100 text-green-800' :
                  testimonial.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {testimonial.status}
                </span>
              </div>
              <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-blue-700/50">
                {testimonial.status !== 'Approved' && (
                  <button className="text-green-400 hover:text-green-600" title="Approve">
                    <CheckCircleIcon className="h-6 w-6" />
                  </button>
                )}
                {testimonial.status !== 'Hidden' && (
                  <button className="text-yellow-400 hover:text-yellow-600" title="Hide">
                    <EyeSlashIcon className="h-6 w-6" />
                  </button>
                )}
                <button className="text-red-400 hover:text-red-600" title="Delete">
                  <TrashIcon className="h-6 w-6" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}