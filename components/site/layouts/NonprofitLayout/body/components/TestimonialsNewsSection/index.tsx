"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline'; // Added for consistency
// Assuming useStoreContext is available and provides storeFormData
// import { useStoreContext } from '@/contexts/StoreContext';

// Define types based on your transformCompanyToStoreForm and Prisma schema
export type Testimonial = {
  id: string;
  author: string; // Corresponds to author name
  quote: string; // Corresponds to the testimonial text
  avatarUrl?: string; // URL for the author's image
  order: number; // For sorting
};

export type Blog = {
  id: string;
  title: string;
  excerpt?: string; // Short summary
  imageUrl?: string;
  publishedAt: string; // ISO date string
  link: string; // Link to the full blog post
  order: number; // For sorting
};

export type ThemeSettings = {
  primaryColor?: string;
  secondaryColor?: string;
};

export type StoreForm = {
  name?: string; // For section title
  slug?: string; // For constructing dynamic links
  testimonials?: Testimonial[]; // Array of Testimonial objects
  blogs?: Blog[]; // Array of Blog objects for news/updates
  themeSettings?: ThemeSettings;
  // Add other relevant StoreForm fields if needed for this section
};

// Placeholder for useStoreContext to make the component runnable independently
// In a real application, you would uncomment the actual import.
const useStoreContext = () => ({
  storeFormData: {
    name: 'Children\'s Hope Foundation',
    slug: 'childrens-hope-foundation',
    testimonials: [
      {
        id: 'test-1',
        author: 'Alex Johnson',
        quote: 'This organization truly changed the lives of many in my community. Their dedication is inspiring and their impact is undeniable!',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a86e927f643?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        order: 1,
      },
      {
        id: 'test-2',
        author: 'Emily Carter',
        quote: 'The support provided by this non-profit has been invaluable to countless families in desperate need. Their programs are well-managed and transparent. Highly recommended.',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        order: 2,
      },
      {
        id: 'test-3',
        author: 'David Lee',
        quote: 'I\'ve seen firsthand the positive change they bring. Every donation makes a real difference in the lives of children. Proud to be a supporter!',
        avatarUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        order: 3,
      },
    ],
    blogs: [
      {
        id: 'blog-1',
        title: 'New Education Program Launched in Rural Areas',
        excerpt: 'Our latest initiative aims to provide quality education to underserved communities, focusing on digital literacy and STEM skills.',
        imageUrl: 'https://images.unsplash.com/photo-1523050854805-9a84a9235777?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        publishedAt: '2024-07-20T10:00:00Z',
        link: '#blog-post-1',
        order: 1,
      },
      {
        id: 'blog-2',
        title: 'Success Story: How Clean Water Transformed a Village',
        excerpt: 'Read about the incredible impact of our recent clean water project on the health and livelihood of a remote village.',
        imageUrl: 'https://images.unsplash.com/photo-1549429168-f9d936162391?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        publishedAt: '2024-07-15T14:30:00Z',
        link: '#blog-post-2',
        order: 2,
      },
    ],
    themeSettings: {
      primaryColor: "#FF5722", // Orange for primary actions
      secondaryColor: "#FFFFFF", // White for secondary actions/text
    },
  } as StoreForm,
});

// Optimized image loader for Next.js Image component
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Helper to format date
const formatDate = (isoString: string) => {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Date N/A";
  }
};

// Mock router for demonstration (replace with actual useRouter in a Next.js app)
const mockRouterPush = (path: string) => {
  console.log(`Navigating to: ${path}`);
  // window.location.href = path; // Uncomment for actual redirection
};

export default function TestimonialsNewsSection() {
  const { storeFormData } = useStoreContext();

  // Dynamic colors from storeFormData
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#FF5722'; // Default Orange
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#FFFFFF'; // Default White

  // Determine which testimonials and blogs to render
  const testimonialsToRender = Array.isArray(storeFormData?.testimonials) && storeFormData.testimonials.length > 0
    ? storeFormData.testimonials.sort((a, b) => (a.order || 0) - (b.order || 0))
    : [ // Fallback testimonials
        { id: 'fb-test-1', author: 'Alex Johnson', quote: 'This organization truly changed the lives of many in my community. Their dedication is inspiring!', avatarUrl: 'https://placehold.co/60x60/A0A0A0/FFFFFF?text=AJ', order: 1 },
        { id: 'fb-test-2', author: 'Emily Carter', quote: 'The support provided by this non-profit has been invaluable to countless families in desperate need. Highly recommended.', avatarUrl: 'https://placehold.co/60x60/808080/FFFFFF?text=EC', order: 2 }
      ];

  const blogsToRender = Array.isArray(storeFormData?.blogs) && storeFormData.blogs.length > 0
    ? storeFormData.blogs.sort((a, b) => (a.order || 0) - (b.order || 0))
    : [ // Fallback blogs
        { id: 'fb-blog-1', title: 'Our Latest Community Outreach', excerpt: 'Details about our recent efforts to support local families.', imageUrl: 'https://placehold.co/400x250/D1D5DB/4B5563?text=Community', publishedAt: '2024-07-22T09:00:00Z', link: '#', order: 1 },
        { id: 'fb-blog-2', title: 'Volunteer Spotlight: Making a Difference', excerpt: 'Highlighting the incredible work of our dedicated volunteers.', imageUrl: 'https://placehold.co/400x250/D1D5DB/4B5563?text=Volunteer', publishedAt: '2024-07-18T11:00:00Z', link: '#', order: 2 },
      ];

  const organizationSlug = storeFormData?.slug || 'non-profit';

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://placehold.co/60x60/CCCCCC/333333?text=Avatar"; // Generic avatar placeholder
  };

  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
          Voices Sharing Our Mission Success
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          {testimonialsToRender.slice(0, 2).map((test, idx) => ( // Display top 2 testimonials
            <motion.div
              key={test.id}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: idx * 0.2, duration: 0.7, ease: "easeOut" }}
              className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-2xl shadow-lg border border-orange-100 relative group"
            >
              <svg
                className="absolute top-6 left-6 w-10 h-10 text-orange-200 opacity-75 group-hover:opacity-100 transition-opacity"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M7.17 6A4.017 4.017 0 0111 2c2.21 0 4 1.79 4 4v2h-4V6H7.17zM3 6a4.017 4.017 0 014.83-4A4.017 4.017 0 0111 2c2.21 0 4 1.79 4 4v2H3V6z" />
              </svg>
              <p className="italic text-gray-800 text-lg leading-relaxed mb-6 pl-12">
                “{test.quote}”
              </p>
              <div className="flex items-center space-x-4">
                <Image
                  src={test.avatarUrl || `https://placehold.co/60x60/${primaryColor.replace('#', '')}/FFFFFF?text=${test.author.split(' ').map(n => n[0]).join('')}`}
                  alt={test.author}
                  width={60}
                  height={60}
                  className="rounded-full border-2 border-orange-300 shadow-md"
                  loader={loader}
                  onError={handleImageError}
                />
                <h4 className="font-bold text-gray-900 text-xl">
                  {test.author}
                </h4>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Latest News / Blog Posts */}
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 mt-16 text-gray-900">
          Latest News & Updates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogsToRender.slice(0, 3).map((blog, idx) => ( // Display top 3 blog posts
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: idx * 0.15, duration: 0.6 }}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-transform duration-300 cursor-pointer flex flex-col"
              onClick={() => mockRouterPush(blog.link)}
            >
              <div className="relative h-48 overflow-hidden rounded-t-xl">
                <Image
                  src={blog.imageUrl || "https://placehold.co/400x250/D1D5DB/4B5563?text=News+Image"}
                  alt={blog.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  loader={loader}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onError={handleImageError}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 leading-tight">
                    {blog.title}
                  </h3>
                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                    {blog.excerpt || 'No excerpt available.'}
                  </p>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{formatDate(blog.publishedAt)}</span>
                  <Link
                    href={blog.link}
                    className="inline-flex items-center font-medium transition-colors"
                    style={{ color: primaryColor, '--tw-hover-text-color': `${primaryColor}D0` } as React.CSSProperties}
                  >
                    Read More <ArrowRightIcon className="ml-1 w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            href={`/${organizationSlug}/blog`}
            className="px-8 py-3 rounded-full font-semibold hover:shadow-lg transition duration-300 transform hover:scale-105"
            style={{ backgroundColor: primaryColor, color: secondaryColor }}
          >
            View All News
          </Link>
        </div>

        {/* Donation CTA - Integrated into Testimonials & News Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="bg-gradient-to-br p-10 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between mt-16 text-center md:text-left"
          style={{ background: `linear-gradient(to bottom right, ${primaryColor}, ${primaryColor}E0)`, color: secondaryColor }} // Dynamic primary color gradient
        >
          <h3 className="text-3xl font-bold mb-6 md:mb-0 max-w-2xl leading-tight">
            Your Donation Is A Gift To Them. Donate Today!
          </h3>
          <Link
            href={`/${organizationSlug}/donate`}
            className="inline-flex items-center px-8 py-3 rounded-full font-semibold hover:shadow-lg transition duration-300 transform hover:scale-105"
            style={{ backgroundColor: secondaryColor, color: primaryColor }} // Inverted colors for CTA button
          >
            Donate Now <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
