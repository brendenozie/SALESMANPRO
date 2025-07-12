"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { StarIcon } from "@heroicons/react/24/solid"; // For filled stars
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline"; // For quote icon

import { useStoreContext } from "../../../../../contexts/StoreContext"; // Adjust path as needed

// Image loader (same as elsewhere)
const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

// Define the Testimonial type
type Testimonial = {
  id: string;
  author: string;
  quote: string;
  rating: number; // 1-5
  avatar: string; // URL to avatar image
  dishMention?: string; // Optional: specific dish mentioned
};

// Sample Testimonials Data (replace with data fetched from your backend)
const sampleTestimonials: Testimonial[] = [
  {
    id: "t1",
    author: "Alice Johnson",
    quote: "The Classic Beef Burger was an absolute delight! Juicy, flavorful, and perfectly cooked. This is my new go-to spot!",
    rating: 5,
    avatar: "/images/avatars/avatar1.jpg",
    dishMention: "Classic Beef Burger",
  },
  {
    id: "t2",
    author: "Bob Williams",
    quote: "I'm usually picky with pizza, but their Pepperoni Pizza exceeded all expectations. Crispy crust and delicious toppings!",
    rating: 4,
    avatar: "/images/avatars/avatar2.jpg",
    dishMention: "Pepperoni Pizza",
  },
  {
    id: "t3",
    author: "Charlie Brown",
    quote: "The Chicken Teriyaki Subway is fantastic! Fresh ingredients and a wonderful balance of sweet and savory. Highly recommend.",
    rating: 5,
    avatar: "/images/avatars/avatar3.jpg",
    dishMention: "Chicken Teriyaki Subway",
  },
  {
    id: "t4",
    author: "Diana Prince",
    quote: "Loved the cozy ambiance and the exceptional service. Every dish was a culinary masterpiece. Can't wait to return!",
    rating: 5,
    avatar: "/images/avatars/avatar4.jpg",
  },
  {
    id: "t5",
    author: "Eve Davis",
    quote: "The Chocolate Lava Cake is a must-try! Rich, decadent, and the perfect end to a perfect meal.",
    rating: 4,
    avatar: "/images/avatars/avatar5.jpg",
    dishMention: "Chocolate Lava Cake",
  },
  {
    id: "t6",
    author: "Frank Miller",
    quote: "Quick delivery and the food was still hot and fresh. The Veggie Supreme Pizza was packed with flavor.",
    rating: 4,
    avatar: "/images/avatars/avatar6.jpg",
    dishMention: "Veggie Supreme Pizza",
  },
];

// Animation variants for staggered appearance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

interface TestimonialCardProps {
  testimonial: Testimonial;
  primaryColor: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial, primaryColor }) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ y: -8, boxShadow: "0 15px 20px -5px rgba(0, 0, 0, 0.1), 0 6px 10px -3px rgba(0, 0, 0, 0.08)" }}
    className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg flex-shrink-0 w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.33%-1.33rem)] xl:w-[calc(25%-1.5rem)] snap-center" // Responsive width and snap for scroll
  >
    <div className="flex items-center mb-4">
      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 mr-4 flex-shrink-0">
        <Image
          src={testimonial.avatar}
          alt={testimonial.author}
          fill
          className="object-cover"
          loader={loader}
        />
      </div>
      <div>
        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">{testimonial.author}</h4>
        {testimonial.dishMention && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            About: <span className="font-medium" style={{ color: primaryColor }}>{testimonial.dishMention}</span>
          </p>
        )}
      </div>
    </div>
    <div className="flex mb-3">
      {[...Array(5)].map((_, i) => (
        <StarIcon
          key={i}
          className={`h-5 w-5 ${
            i < testimonial.rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
          }`}
        />
      ))}
    </div>
    <blockquote className="italic text-gray-700 dark:text-gray-300 text-lg leading-relaxed relative pl-8">
      <ChatBubbleLeftRightIcon className="absolute top-0 left-0 h-6 w-6 text-gray-300 dark:text-gray-600 opacity-70" />
      <p>“{testimonial.quote}”</p>
    </blockquote>
  </motion.div>
);

export default function Testimonials() {
  const { storeFormData } = useStoreContext();
  const { themeSettings } = storeFormData;

  const primaryColor = themeSettings?.primaryColor || "#FF5722"; // Deep Orange

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Title */}
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.p className="text-sm uppercase tracking-widest font-semibold text-orange-600 dark:text-orange-400 mb-2" variants={itemVariants}>
            What Our Guests Say
          </motion.p>
          <motion.h2
            className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-4 drop-shadow-md"
            variants={itemVariants}
          >
            Voices of Satisfaction
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"
            variants={itemVariants}
          >
            Hear directly from our happy customers about their unforgettable dining experiences.
          </motion.p>
        </motion.div>

        {/* Testimonials Grid/Scroll */}
        <motion.div
          className="flex space-x-6 pb-4 overflow-x-auto snap-x snap-mandatory scroll-smooth custom-scrollbar" // Added custom-scrollbar class
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
        >
          {sampleTestimonials.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} primaryColor={primaryColor} />
          ))}
        </motion.div>

        {/* Optional: Add a "Write a Review" CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            Loved your experience with us? Share your story!
          </p>
          <button
            onClick={() => alert("Redirect to review submission form!")}
            className="px-8 py-4 bg-orange-500 text-white rounded-full font-bold text-lg shadow-xl hover:bg-orange-600 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Write a Review
          </button>
        </motion.div>
      </div>

      {/* Custom Scrollbar Styling (can be moved to global CSS if preferred) */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #e0e0e0; /* Light gray track */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${primaryColor}; /* Primary color thumb */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #e64a19; /* Slightly darker primary on hover */
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: #333; /* Darker track for dark mode */
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${primaryColor};
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #e64a19;
        }
      `}</style>
    </section>
  );
}
