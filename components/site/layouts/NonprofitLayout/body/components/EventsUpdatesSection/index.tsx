"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline'; // Added for consistency
// Assuming useStoreContext is available and provides storeFormData
// import { useStoreContext } from '@/contexts/StoreContext';

// Define types based on your transformCompanyToStoreForm and Prisma schema
export type Event = {
  id: string;
  title: string;
  description?: string;
  eventDate: string; // ISO date string
  eventTime?: string; // e.g., "10:00 AM PST"
  imageUrl?: string;
  link: string; // Link to event details
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
  name?: string; // For section titles
  slug?: string; // For constructing dynamic links
  events?: Event[]; // Array of Event objects
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
    events: [
      {
        id: 'event-1',
        title: 'Community Clean-Up Day',
        description: 'Join us for a day of community service, fostering cleanliness and civic responsibility in our neighborhoods.',
        eventDate: '2025-05-30T09:00:00Z', // ISO string
        eventTime: '9:00 AM - 1:00 PM',
        imageUrl: 'https://images.unsplash.com/photo-1532629391091-c247900b1713?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        link: '#event-cleanup',
        order: 1,
      },
      {
        id: 'event-2',
        title: 'Hope Gala Fundraiser Event',
        description: 'An elegant evening dedicated to raising crucial funds for children\'s education and welfare programs.',
        eventDate: '2025-06-15T18:00:00Z',
        eventTime: '6:00 PM onwards',
        imageUrl: 'https://images.unsplash.com/photo-1526367790952-0925e3170e7a?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        link: '#event-gala',
        order: 2,
      },
      {
        id: 'event-3',
        title: 'Children\'s Art Workshop',
        description: 'A creative session designed to encourage self-expression and artistic talent among young children.',
        eventDate: '2025-07-05T10:00:00Z',
        eventTime: '10:00 AM - 12:00 PM',
        imageUrl: 'https://images.unsplash.com/photo-1513360371669-4be6363c10a4?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        link: '#event-art-workshop',
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
      {
        id: 'blog-3',
        title: 'Volunteers Spotlight: Meet Our Heroes',
        excerpt: 'We shine a light on the incredible individuals dedicating their time and effort to our cause.',
        imageUrl: 'https://images.unsplash.com/photo-1518621736915-f3b160292723?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        publishedAt: '2024-07-10T11:00:00Z',
        link: '#blog-post-3',
        order: 3,
      },
    ],
    themeSettings: {
      primaryColor: "#FF5722", // Orange for primary actions
      secondaryColor: "#FFFFFF", // White for secondary actions/text
    },
  } as StoreForm,
});

// Optimized image loader
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Helper to format event date for display
const formatEventDate = (isoString: string) => {
  try {
    const date = new Date(isoString);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      day: date.toLocaleDateString('en-US', { day: 'numeric' }),
      year: date.toLocaleDateString('en-US', { year: 'numeric' }),
    };
  } catch (error) {
    console.error("Error formatting event date:", error);
    return { month: 'N/A', day: 'N/A', year: 'N/A' };
  }
};

// Helper to format blog published date
const formatBlogDate = (isoString: string) => {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (error) {
    console.error("Error formatting blog date:", error);
    return "Date N/A";
  }
};

// Mock router for demonstration (replace with actual useRouter in a Next.js app)
const mockRouterPush = (path: string) => {
  console.log(`Navigating to: ${path}`);
  // window.location.href = path; // Uncomment for actual redirection
};

// Static fallback data for events and blogs
const fallbackEvents = [
  {
    id: 'fb-event-1',
    title: 'Annual Charity Run',
    description: 'Join us for our annual charity run to support children\'s education programs.',
    eventDate: '2025-08-10T08:00:00Z',
    eventTime: '8:00 AM',
    imageUrl: 'https://placehold.co/400x250/D1D5DB/4B5563?text=Charity+Run',
    link: '#',
    order: 1,
  },
  {
    id: 'fb-event-2',
    title: 'Volunteer Appreciation Picnic',
    description: 'A day to celebrate and thank our incredible volunteers for their dedication.',
    eventDate: '2025-09-01T12:00:00Z',
    eventTime: '12:00 PM',
    imageUrl: 'https://placehold.co/400x250/D1D5DB/4B5563?text=Volunteer+Picnic',
    link: '#',
    order: 2,
  },
  {
    id: 'fb-event-3',
    title: 'Winter Coat Drive',
    description: 'Help us collect warm coats for children in need this winter season.',
    eventDate: '2025-10-20T09:00:00Z',
    eventTime: '9:00 AM - 4:00 PM',
    imageUrl: 'https://placehold.co/400x250/D1D5DB/4B5563?text=Coat+Drive',
    link: '#',
    order: 3,
  },
];

const fallbackBlogs = [
  {
    id: 'fb-blog-1',
    title: 'Impact Report 2024: A Year of Change',
    excerpt: 'Discover the significant milestones and lives touched in our latest annual impact report.',
    imageUrl: 'https://placehold.co/400x250/D1D5DB/4B5563?text=Impact+Report',
    publishedAt: '2024-07-25T09:00:00Z',
    link: '#',
    order: 1,
  },
  {
    id: 'fb-blog-2',
    title: 'Building Brighter Futures: Our School Projects',
    excerpt: 'An in-depth look at how our school construction projects are transforming communities.',
    imageUrl: 'https://placehold.co/400x250/D1D5DB/4B5563?text=School+Projects',
    publishedAt: '2024-07-10T11:00:00Z',
    link: '#',
    order: 2,
  },
  {
    id: 'fb-blog-3',
    title: 'The Power of a Single Donation',
    excerpt: 'Hear a compelling story about how one donation made a profound difference.',
    imageUrl: 'https://placehold.co/400x250/D1D5DB/4B5563?text=Donation+Impact',
    publishedAt: '2024-07-01T15:00:00Z',
    link: '#',
    order: 3,
  },
];

export default function EventsUpdatesSection() {
  const { storeFormData } = useStoreContext();

  // Dynamic colors from storeFormData
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#FF5722'; // Default Orange

  // Determine which events and blogs to render, sorted by order
  const eventsToRender = Array.isArray(storeFormData?.events) && storeFormData.events.length > 0
    ? storeFormData.events.sort((a, b) => (a.order || 0) - (b.order || 0))
    : fallbackEvents;

  const blogsToRender = Array.isArray(storeFormData?.blogs) && storeFormData.blogs.length > 0
    ? storeFormData.blogs.sort((a, b) => (a.order || 0) - (b.order || 0))
    : fallbackBlogs;

  const organizationSlug = storeFormData?.slug || 'non-profit';

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://placehold.co/112x112/CCCCCC/333333?text=Image";
  };

  return (
    <section id="events" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Upcoming Events */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
            Join Our Latest Upcoming Events
          </h2>
          {eventsToRender.slice(0, 3).map((evt, idx) => { // Display top 3 events
            const formattedDate = formatEventDate(evt.eventDate);
            return (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: idx * 0.15, duration: 0.6 }}
                className="flex items-start mb-6 bg-white rounded-xl shadow-md hover:shadow-lg p-6 transition-shadow duration-300"
                onClick={() => mockRouterPush(evt.link)}
              >
                <div
                  className="flex-shrink-0 text-white p-4 rounded-lg mr-5 text-center font-bold"
                  style={{ backgroundColor: primaryColor }}
                >
                  <div className="text-lg">{formattedDate.month}</div>
                  <div className="text-xl">{formattedDate.day}</div>
                  <div className="text-sm">{formattedDate.year}</div>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2 text-gray-900">
                    {evt.title}
                  </h3>
                  <p className="text-gray-700 text-base leading-relaxed">
                    {evt.description}
                  </p>
                  <Link
                    href={evt.link}
                    className="mt-3 inline-flex items-center font-medium transition-colors"
                    style={{ color: primaryColor, '--tw-hover-text-color': `${primaryColor}D0` } as React.CSSProperties}
                  >
                    Read More <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
          <div className="text-center mt-8">
            <Link
              href={`/${organizationSlug}/events`}
              className="px-8 py-3 rounded-full font-semibold hover:shadow-lg transition duration-300 transform hover:scale-105"
              style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
            >
              View All Events
            </Link>
          </div>
        </div>

        {/* Latest News & Blog */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
            Latest News & Stories
          </h2>
          {blogsToRender.slice(0, 3).map((newsItem, idx) => ( // Display top 3 blog posts
            <motion.div
              key={newsItem.id}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: idx * 0.15, duration: 0.6 }}
              className="flex items-center mb-6 bg-white rounded-xl shadow-md hover:shadow-lg p-5 transition-shadow duration-300"
              onClick={() => mockRouterPush(newsItem.link)}
            >
              <div className="flex-shrink-0 w-28 h-28 mr-5 rounded-lg overflow-hidden relative">
                <Image
                  src={newsItem.imageUrl || "https://placehold.co/112x112/D1D5DB/4B5563?text=News+Image"}
                  alt={newsItem.title}
                  fill
                  className="object-cover w-full h-full"
                  loader={loader}
                  sizes="112px"
                  onError={handleImageError}
                />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-1 text-gray-900">
                  {newsItem.title}
                </h3>
                <p className="text-gray-700 text-base leading-relaxed mb-2 line-clamp-2">
                  {newsItem.excerpt || 'No excerpt available.'}
                </p>
                <Link
                  href={newsItem.link}
                  className="inline-flex items-center font-medium transition-colors"
                  style={{ color: primaryColor, '--tw-hover-text-color': `${primaryColor}D0` } as React.CSSProperties}
                >
                  Read More <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </motion.div>
          ))}
          <div className="text-center mt-8">
            <Link
              href={`/${organizationSlug}/blog`}
              className="px-8 py-3 rounded-full font-semibold hover:shadow-lg transition duration-300 transform hover:scale-105"
              style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
            >
              View All News
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
