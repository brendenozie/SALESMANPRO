"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { CalendarIcon } from "@heroicons/react/24/solid";
// Assuming useStoreContext is available and provides storeFormData
// import { useStoreContext } from '@/contexts/StoreContext';

// Placeholder for useStoreContext to make the component runnable independently
// In a real application, you would uncomment the actual import.
const useStoreContext = () => ({
  storeFormData: {
    blogs: [
      {
        title: 'How to build a scalable design system from scratch',
        publishedAt: '2023-04-20T10:00:00Z',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        coverImage: 'https://placehold.co/600x400/8B5CF6/FFFFFF?text=Design+System',
        slug: 'design-system-from-scratch',
        views: 1500,
      },
      {
        title: 'The art of balancing creativity and user experience in design',
        publishedAt: '2023-04-19T11:30:00Z',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        coverImage: 'https://placehold.co/600x400/EC4899/FFFFFF?text=Creativity+UX',
        slug: 'creativity-user-experience',
        views: 1200,
      },
      {
        title: 'The science behind effective call-to-action buttons',
        publishedAt: '2023-04-18T09:00:00Z',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
        coverImage: 'https://placehold.co/600x400/F97316/FFFFFF?text=CTA+Science',
        slug: 'effective-cta-buttons',
        views: 1100,
      },
      {
        title: '10 must-have features for a modern portfolio website',
        publishedAt: '2023-04-17T14:00:00Z',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        coverImage: 'https://placehold.co/600x400/22C55E/FFFFFF?text=Portfolio+Features',
        slug: 'modern-portfolio-website',
        views: 950,
      },
      {
        title: 'How to create a seamless user journey on your website',
        publishedAt: '2023-04-16T16:00:00Z',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
        coverImage: 'https://placehold.co/600x400/0EA5E9/FFFFFF?text=User+Journey',
        slug: 'seamless-user-journey',
        views: 800,
      },
      {
        title: 'Why mobile-first design is no longer optional in 2024',
        publishedAt: '2023-04-15T10:00:00Z',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.',
        coverImage: 'https://placehold.co/600x400/10B981/FFFFFF?text=Mobile+First',
        slug: 'mobile-first-design',
        views: 750,
      },
    ],
    themeSettings: { primaryColor: '#F59E0B' }, // Tailwind 'amber-500'
  },
});

// Local loader for next/image (required for external URLs with next/image)
const loader = ({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`;

// Static fallback data, used if dynamic data from useStoreContext is not available
const fallbackBlogs = [
  { title: 'How to build a scalable design system from scratch', readTime: '5 min read', date: 'April 20, 2023', img: 'https://placehold.co/600x400/8B5CF6/FFFFFF?text=Design+System', link: '#' },
  { title: 'The art of balancing creativity and user experience in design', readTime: '3 min read', date: 'April 19, 2023', img: 'https://placehold.co/600x400/EC4899/FFFFFF?text=Creativity+UX', link: '#' },
  { title: 'The science behind effective call-to-action buttons', readTime: '4 min read', date: 'April 18, 2023', img: 'https://placehold.co/600x400/F97316/FFFFFF?text=CTA+Science', link: '#' },
  { title: '10 must-have features for a modern portfolio website', readTime: '2 min read', date: 'April 17, 2023', img: 'https://placehold.co/600x400/22C55E/FFFFFF?text=Portfolio+Features', link: '#' },
  { title: 'How to create a seamless user journey on your website', readTime: '3 min read', date: 'April 16, 2023', img: 'https://placehold.co/600x400/0EA5E9/FFFFFF?text=User+Journey', link: '#' },
  { title: 'Why mobile-first design is no longer optional in 2024', readTime: '6 min read', date: 'April 15, 2023', img: 'https://placehold.co/600x400/10B981/FFFFFF?text=Mobile+First', link: '#' },
];

export default function PopularBlogsSection() {
  // Destructure storeFormData from context, providing a fallback for when context is not available
  const { storeFormData } = useStoreContext() || {};
  const { blogs: dynamicBlogs, themeSettings: { primaryColor = '#F59E0B' } = {} } = storeFormData || {}; // Default primary color (Tailwind amber-500)

  // Map dynamic blog posts to our blog item shape, sorting by views if available, then slicing to 6
  const blogItems = Array.isArray(dynamicBlogs) && dynamicBlogs.length > 0
    ? dynamicBlogs
        .sort((a, b) => (b.views || 0) - (a.views || 0)) // Sort by views descending
        .slice(0, 6) // Take top 6
        .map(post => ({
          title: post.title,
          date: post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            : 'Unknown date',
          readTime: post.content ? `${Math.ceil(post.content.length / 200)} min read` : 'N/A min read', // Calculate read time based on content length
          img: post.coverImage || 'https://placehold.co/600x400/CCCCCC/333333?text=No+Image', // Fallback for missing coverImage
          link: post.slug ? `/blogs/${post.slug}` : '#', // Fallback for missing slug
        }))
    : fallbackBlogs; // Fallback to static data if no dynamic blogs are provided

  // Function to handle image loading errors, replacing with a generic placeholder
  const handleImageError = (e) => {
    e.target.onerror = null; // Prevents infinite loop if placeholder also fails
    e.target.src = 'https://placehold.co/600x400/CCCCCC/333333?text=Image+Not+Found'; // Generic placeholder
  };

  return (
    <section className="container mx-auto px-4 sm:px-6 py-12 md:py-20 font-inter">
      {/* Section Title */}
      <motion.h2
        className="text-3xl sm:text-4xl font-extrabold text-center mb-10 text-gray-900"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Popular Reads
      </motion.h2>

      {/* Grid of Popular Blogs */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {blogItems.map((blog, idx) => (
          <motion.article
            key={idx}
            className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ scale: 1.01 }} // Subtle scale on hover
          >
            {/* Blog Image */}
            <div className="w-full h-48 overflow-hidden">
              <Image
                loader={loader}
                src={blog.img}
                alt={blog.title}
                width={600} // Increased width for better quality on larger screens
                height={320} // Adjusted height for a consistent aspect ratio
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={handleImageError} // Image error fallback
              />
            </div>
            
            {/* Blog Content */}
            <div className="p-5 flex flex-col justify-between h-auto">
              {/* Title */}
              <h3 className="font-bold text-xl mb-3 text-gray-800 leading-snug">
                {blog.title}
              </h3>
              {/* Date and Read Time */}
              <div className="flex justify-between items-center text-gray-500 text-sm mb-4">
                <span className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" style={{ color: primaryColor }} /> {blog.date}
                </span>
                <span>{blog.readTime}</span>
              </div>
              {/* Read More Link/Button */}
              {blog.link && (
                <a
                  href={blog.link}
                  className="inline-flex items-center mt-auto px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300
                             bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900" // Default styling
                  style={{
                    backgroundColor: `rgba(${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}, 0.1)`, // Light background from primary color
                    color: primaryColor, // Text color from primary color
                    borderColor: primaryColor,
                    borderWidth: '1px'
                  }}
                >
                  Read more
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                  </svg>
                </a>
              )}
            </div>
          </motion.article>
        ))}
      </div>

      {/* View All Blogs Button */}
      <motion.div
        className="text-center mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: blogItems.length * 0.1 + 0.2 }}
      >
        <a
          href="/blogs" // Link to your main blog archive page
          className="inline-block px-8 py-4 rounded-full font-bold text-lg shadow-md transition-all duration-300
                     bg-white text-gray-800 hover:bg-gray-100 hover:shadow-lg transform hover:scale-105"
          style={{
            borderColor: primaryColor,
            borderWidth: '2px',
            color: primaryColor,
          }}
        >
          View All Blogs
        </a>
      </motion.div>
    </section>
  );
}
