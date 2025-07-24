"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { CalendarIcon, UserCircleIcon } from "@heroicons/react/24/solid"; // Added UserCircleIcon
// Assuming useStoreContext is available and provides storeFormData
// import { useStoreContext } from '@/contexts/StoreContext';

// Define the structure of a single blog post as it comes from StoreForm
export type Blog = {
  id: string;
  title: string;
  slug: string;
  content: string; // Full content might not be used here, but part of the type
  coverImage: string | null;
  categories: string[]; // Assuming array of strings
  tags: string[]; // Assuming array of strings
  author?: { // Author is optional and includes name and profileImage
    name: string | null;
    profileImage: string | null;
  };
  status: string; // e.g., "Published", "Draft"
  publishedAt: string | null; // ISO string date
};

// Define the relevant parts of StoreForm that LatestNewsSection uses
export type StoreForm = {
  blogs?: Blog[]; // Array of Blog objects
  themeSettings?: {
    primaryColor?: string;
    // Add other theme settings if needed
  };
};

// Placeholder for useStoreContext to make the component runnable independently
// In a real application, you would uncomment the actual import and ensure
// your StoreContext provides data conforming to the StoreForm type.
const useStoreContext = () => ({
  storeFormData: {
    blogs: [
      {
        id: 'blog1',
        title: 'Global leaders unite to address climate crisis at COP26',
        publishedAt: '2023-04-21T10:00:00Z',
        coverImage: 'https://placehold.co/600x400/22C55E/FFFFFF?text=Climate+Crisis',
        slug: 'climate-crisis-cop26',
        content: 'Long content for blog 1...',
        categories: ['Politics', 'Environment'],
        tags: ['COP26', 'Climate'],
        author: { name: 'Alice Smith', profileImage: 'https://placehold.co/50x50/FFD700/000000?text=AS' },
        status: 'Published',
      },
      {
        id: 'blog2',
        title: 'Cybersecurity experts warn of increased threats in digital age',
        publishedAt: '2023-04-20T11:30:00Z',
        coverImage: 'https://placehold.co/600x400/0EA5E9/FFFFFF?text=Cybersecurity+Threats',
        slug: 'cybersecurity-threats',
        content: 'Long content for blog 2...',
        categories: ['Technology', 'Security'],
        tags: ['Cybersecurity', 'Digital'],
        author: { name: 'Bob Johnson', profileImage: 'https://placehold.co/50x50/ADD8E6/000000?text=BJ' },
        status: 'Published',
      },
      {
        id: 'blog3',
        title: 'Athlete achieves historic win at world championships breaking records',
        publishedAt: '2023-04-19T09:00:00Z',
        coverImage: 'https://placehold.co/600x400/EC4899/FFFFFF?text=Historic+Win',
        slug: 'historic-win-athlete',
        content: 'Long content for blog 3...',
        categories: ['Sports'],
        tags: ['Athletics', 'Championships'],
        author: { name: 'Charlie Brown', profileImage: 'https://placehold.co/50x50/90EE90/000000?text=CB' },
        status: 'Published',
      },
      {
        id: 'blog4',
        title: 'Chemical currents: Breaking news in chemistry and materials science',
        publishedAt: '2023-04-18T14:00:00Z',
        coverImage: 'https://placehold.co/600x400/F97316/FFFFFF?text=Chemistry+News',
        slug: 'chemistry-materials-science',
        content: 'Long content for blog 4...',
        categories: ['Science'],
        tags: ['Chemistry', 'Materials'],
        author: { name: 'Diana Prince', profileImage: 'https://placehold.co/50x50/FFB6C1/000000?text=DP' },
        status: 'Published',
      },
      {
        id: 'blog5',
        title: 'New breakthroughs in space exploration excite scientists',
        publishedAt: '2023-04-17T16:00:00Z',
        coverImage: 'https://placehold.co/600x400/8B5CF6/FFFFFF?text=Space+Exploration',
        slug: 'space-exploration-breakthroughs',
        content: 'Long content for blog 5...',
        categories: ['Science', 'Space'],
        tags: ['Astronomy', 'Exploration'],
        author: { name: 'Eve Adams', profileImage: 'https://placehold.co/50x50/DDA0DD/000000?text=EA' },
        status: 'Published',
      },
      {
        id: 'blog6',
        title: 'The rise of sustainable fashion: Trends and future outlook',
        publishedAt: '2023-04-16T10:00:00Z',
        coverImage: 'https://placehold.co/600x400/10B981/FFFFFF?text=Sustainable+Fashion',
        slug: 'sustainable-fashion-trends',
        content: 'Long content for blog 6...',
        categories: ['Fashion', 'Environment'],
        tags: ['Sustainability', 'Trends'],
        author: { name: 'Frank Green', profileImage: 'https://placehold.co/50x50/B0E0E6/000000?text=FG' },
        status: 'Published',
      },
    ],
    themeSettings: { primaryColor: '#0EA5E9' }, // Tailwind 'sky-500'
  } as StoreForm, // Cast to StoreForm for type safety in mock
});


// Local loader for next/image (required for external URLs with next/image)
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

// Static fallback data, used if dynamic data from useStoreContext is not available
const fallbackNews = [
  { 
    title: 'Global leaders unite to address climate crisis at COP26', 
    date: 'April 21, 2023', 
    img: 'https://placehold.co/600x400/22C55E/FFFFFF?text=Climate+Crisis', 
    link: '#',
    authorName: 'Guest Author',
    authorImage: null,
  },
  { 
    title: 'Cybersecurity experts warn of increased threats', 
    date: 'April 20, 2023', 
    img: 'https://placehold.co/600x400/0EA5E9/FFFFFF?text=Cybersecurity+Threats', 
    link: '#',
    authorName: 'Guest Author',
    authorImage: null,
  },
  { 
    title: 'Athlete achieves historic win at world championships', 
    date: 'April 19, 2023', 
    img: 'https://placehold.co/600x400/EC4899/FFFFFF?text=Historic+Win', 
    link: '#',
    authorName: 'Guest Author',
    authorImage: null,
  },
  { 
    title: 'Chemical currents breaking news in chemistry and materials science', 
    date: 'April 18, 2023', 
    img: 'https://placehold.co/600x400/F97316/FFFFFF?text=Chemistry+News', 
    link: '#',
    authorName: 'Guest Author',
    authorImage: null,
  },
  { 
    title: 'New breakthroughs in space exploration excite scientists', 
    date: 'April 17, 2023', 
    img: 'https://placehold.co/600x400/8B5CF6/FFFFFF?text=Space+Exploration', 
    link: '#',
    authorName: 'Guest Author',
    authorImage: null,
  },
  { 
    title: 'The rise of sustainable fashion: Trends and future outlook', 
    date: 'April 16, 2023', 
    img: 'https://placehold.co/600x400/10B981/FFFFFF?text=Sustainable+Fashion', 
    link: '#',
    authorName: 'Guest Author',
    authorImage: null,
  },
];

export default function LatestNewsSection() {
  // Destructure storeFormData from context, providing a fallback for when context is not available
  const { storeFormData } = useStoreContext() || {};
  const { blogs: dynamicNews, themeSettings: { primaryColor = '#0EA5E9' } = {} } = storeFormData || {}; // Default primary color (Tailwind sky-500)

  // Map dynamic blog posts to our news item shape, or use fallback data
  const newsItems = Array.isArray(dynamicNews) && dynamicNews.length > 0
    ? dynamicNews.slice(0, 6).map(post => ({
        title: post.title,
        date: post.publishedAt
          ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          : 'Unknown date',
        img: post.coverImage || 'https://placehold.co/600x400/CCCCCC/333333?text=No+Image', // Fallback for missing coverImage
        link: post.slug ? `/blogs/${post.slug}` : '#', // Fallback for missing slug
        authorName: post.author?.name || 'Guest Author', // Access author name
        authorImage: post.author?.profileImage || null, // Access author profile image
      }))
    : fallbackNews;

  // Function to handle image loading errors, replacing with a generic placeholder
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null; // Prevents infinite loop if placeholder also fails
    e.currentTarget.src = 'https://placehold.co/600x400/CCCCCC/333333?text=Image+Not+Found'; // Generic placeholder
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
        Latest News & Articles
      </motion.h2>

      {/* Grid of News Articles */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {newsItems.map((item, idx) => (
          <motion.article
            key={idx}
            className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ scale: 1.01 }} // Subtle scale on hover
          >
            <a href={item.link} className="block"> {/* Wrap entire card with link */}
              {/* Article Image */}
              <div className="w-full h-48 overflow-hidden">
                <Image
                  loader={loader}
                  src={item.img}
                  alt={item.title}
                  width={600} // Increased width for better quality on larger screens
                  height={320} // Adjusted height for a consistent aspect ratio
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={handleImageError} // Image error fallback
                />
              </div>
              
              {/* Article Content */}
              <div className="p-5 flex flex-col justify-between h-auto">
                {/* Title */}
                <h3 className="font-bold text-xl mb-3 text-gray-800 leading-snug">
                  {item.title}
                </h3>
                {/* Date */}
                <p className="text-gray-500 text-sm flex items-center mb-2">
                  <CalendarIcon className="h-4 w-4 mr-2" style={{ color: primaryColor }} /> {item.date}
                </p>
                {/* Author */}
                <div className="flex items-center text-gray-600 text-sm mb-4">
                  {item.authorImage ? (
                    <Image
                      loader={loader}
                      src={item.authorImage}
                      alt={item.authorName || 'Author'}
                      width={24}
                      height={24}
                      className="rounded-full mr-2 object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <UserCircleIcon className="h-6 w-6 mr-2 text-gray-400" />
                  )}
                  <span>{item.authorName}</span>
                </div>
                {/* Read More Link/Button */}
                <span // Changed from <a> to <span> as the entire card is now a link
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
                </span>
              </div>
            </a>
          </motion.article>
        ))}
      </div>

      {/* View All Articles Button */}
      <motion.div
        className="text-center mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: newsItems.length * 0.1 + 0.2 }}
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
          View All Articles
        </a>
      </motion.div>
    </section>
  );
}
