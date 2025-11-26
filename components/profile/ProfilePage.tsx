// components/profile/ProfilePage.tsx
// Reusable profile page component for all verticals
'use client';

import React, { useState, useEffect } from 'react';
import ProfileHeader from './ProfileHeader';
import SectionGrid, { CoreValuesSection, StatsSection } from './SectionGrid';
import { BlogCard, EventCard, ProductCard, VideoCard } from './ContentCards';
import EmptyState from './EmptyState';
import Pagination from './Pagination';
import { CompanyProfileDTO, BlogDTO, EventDTO, ProductDTO, VideoDTO, ServiceDTO, FAQDTO } from '@/types/dto';

interface ProfilePageProps {
  slug: string;
  vertical: string;
  initialProfile?: any;
}

interface ProfileData {
  profile: CompanyProfileDTO;
  team: any;
  faqs: FAQDTO[];
}

export default function ProfilePage({ slug, vertical, initialProfile }: ProfilePageProps) {
  const [profile, setProfile] = useState<ProfileData | null>(initialProfile || null);
  const [blogs, setBlogs] = useState<BlogDTO[]>([]);
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [videos, setVideos] = useState<VideoDTO[]>([]);
  const [services, setServices] = useState<ServiceDTO[]>([]);
  
  const [loading, setLoading] = useState(!initialProfile);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [blogCursor, setBlogCursor] = useState<string | undefined>();
  const [blogHasMore, setBlogHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!initialProfile) {
      fetchProfileData();
    } else {
      // Fetch additional data
      fetchAdditionalData();
    }
  }, [slug, initialProfile]);

  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/site/${slug}/profile`);
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to load profile');
        return;
      }
      
      setProfile(data.data);
      fetchAdditionalData();
    } catch (err) {
      setError('Failed to load profile data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdditionalData = async () => {
    // Determine what to fetch based on vertical
    const fetchPromises: Promise<void>[] = [];

    // All verticals can have blogs
    fetchPromises.push(fetchBlogs());

    // Events for specific verticals
    if (['events', 'nonprofit', 'publicspeaking'].includes(vertical)) {
      fetchPromises.push(fetchEvents());
    }

    // Products for e-commerce verticals
    if (['automotive', 'realestate', 'fitness', 'consultant'].includes(vertical)) {
      fetchPromises.push(fetchProducts());
    }

    // Media for media vertical
    if (['media', 'blog'].includes(vertical)) {
      fetchPromises.push(fetchMedia());
    }

    // Services for service-based verticals
    if (['fitness', 'security', 'consultant', 'finance', 'healthcare'].includes(vertical)) {
      fetchPromises.push(fetchServices());
    }

    await Promise.all(fetchPromises);
  };

  const fetchBlogs = async (cursor?: string) => {
    try {
      const url = cursor 
        ? `/api/site/${slug}/blog?limit=6&cursor=${cursor}`
        : `/api/site/${slug}/blog?limit=6`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        if (cursor) {
          setBlogs(prev => [...prev, ...data.data]);
        } else {
          setBlogs(data.data);
        }
        setBlogHasMore(data.pagination?.hasMore || false);
        setBlogCursor(data.pagination?.nextCursor);
      }
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(`/api/site/${slug}/events?limit=6`);
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/site/${slug}/products?limit=8&type=all`);
      const data = await response.json();
      
      if (data.success) {
        const allProducts = [
          ...(data.data.products || []),
          ...(data.data.listings || []).map((l: any) => ({
            ...l,
            sellingPrice: l.sellingPrice || 0,
            discount: l.discount || 0,
            tags: [],
            isNewArrival: false,
          }))
        ];
        setProducts(allProducts);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const fetchMedia = async () => {
    try {
      const response = await fetch(`/api/site/${slug}/media?type=videos&limit=6`);
      const data = await response.json();
      
      if (data.success && data.data.videos) {
        setVideos(data.data.videos);
      }
    } catch (err) {
      console.error('Failed to fetch media:', err);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch(`/api/site/${slug}/services?limit=10`);
      const data = await response.json();
      
      if (data.success && data.data.services) {
        setServices(data.data.services);
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
    }
  };

  const handleLoadMoreBlogs = async () => {
    if (!blogCursor || loadingMore) return;
    setLoadingMore(true);
    await fetchBlogs(blogCursor);
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {error || 'Profile not found'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The requested profile could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  const { profile: companyProfile, faqs } = profile;

  // Build stats for header
  const headerStats = [];
  if (blogs.length > 0) headerStats.push({ label: 'Articles', value: blogs.length });
  if (events.length > 0) headerStats.push({ label: 'Events', value: events.length });
  if (products.length > 0) headerStats.push({ label: 'Products', value: products.length });
  if (services.length > 0) headerStats.push({ label: 'Services', value: services.length });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* Profile Header */}
        <ProfileHeader
          name={companyProfile.name}
          tagline={companyProfile.tagline}
          description={companyProfile.description}
          logoUrl={companyProfile.logoUrl}
          bannerUrl={companyProfile.bannerUrl}
          contactEmail={companyProfile.contactEmail}
          contactPhone={companyProfile.contactPhone}
          address={companyProfile.address}
          category={companyProfile.category}
          socialLinks={companyProfile.socialLinks}
          stats={headerStats}
          createdAt={companyProfile.createdAt}
        />

        {/* Stats Section */}
        {companyProfile.stats && Array.isArray(companyProfile.stats) && companyProfile.stats.length > 0 && (
          <StatsSection
            stats={companyProfile.stats.map((s: any) => ({
              label: s.label || '',
              value: s.value || 0,
              prefix: s.prefix,
              suffix: s.suffix,
            }))}
          />
        )}

        {/* Core Values */}
        {companyProfile.coreValues && companyProfile.coreValues.length > 0 && (
          <CoreValuesSection values={companyProfile.coreValues} />
        )}

        {/* Blog Section */}
        {blogs.length > 0 && (
          <SectionGrid
            title="Latest Articles"
            subtitle="Stay updated with our latest news and insights"
            columns={3}
            showViewAll={blogs.length >= 6}
            viewAllHref={`/site/${slug}/${vertical}/blog`}
          >
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </SectionGrid>
        )}
        {blogs.length === 0 && vertical === 'blog' && (
          <EmptyState type="blog" />
        )}
        {blogHasMore && (
          <Pagination
            hasMore={blogHasMore}
            isLoading={loadingMore}
            onLoadMore={handleLoadMoreBlogs}
            loadMoreLabel="Load more articles"
          />
        )}

        {/* Events Section */}
        {events.length > 0 && (
          <SectionGrid
            title="Upcoming Events"
            subtitle="Join us at our upcoming events"
            columns={2}
            showViewAll={events.length >= 6}
            viewAllHref={`/site/${slug}/${vertical}/events`}
          >
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </SectionGrid>
        )}
        {events.length === 0 && vertical === 'events' && (
          <EmptyState type="event" />
        )}

        {/* Products Section */}
        {products.length > 0 && (
          <SectionGrid
            title={vertical === 'realestate' ? 'Featured Listings' : 'Featured Products'}
            subtitle={vertical === 'realestate' ? 'Browse our property listings' : 'Check out our latest offerings'}
            columns={4}
            showViewAll={products.length >= 8}
            viewAllHref={`/site/${slug}/${vertical}/products`}
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </SectionGrid>
        )}

        {/* Videos Section */}
        {videos.length > 0 && (
          <SectionGrid
            title="Featured Videos"
            subtitle="Watch our latest content"
            columns={3}
            showViewAll={videos.length >= 6}
            viewAllHref={`/site/${slug}/${vertical}/media`}
          >
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </SectionGrid>
        )}

        {/* Services Section */}
        {services.length > 0 && (
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Our Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="p-6 border border-gray-100 dark:border-gray-700 rounded-xl hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white">{service.name}</h3>
                  {service.description && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{service.description}</p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      ${service.price}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{service.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQs Section */}
        {faqs && faqs.length > 0 && (
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <details
                  key={faq.id}
                  className="group border border-gray-100 dark:border-gray-700 rounded-lg"
                >
                  <summary className="flex items-center justify-between p-4 cursor-pointer font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                    {faq.question}
                    <span className="ml-4 shrink-0 text-gray-400 group-open:rotate-180 transition-transform">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-4 pb-4 text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
