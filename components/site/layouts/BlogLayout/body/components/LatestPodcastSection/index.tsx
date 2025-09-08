import React from 'react';
import { motion } from 'framer-motion';
import { PlayIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';

// Mock data for blog podcasts to make the component runnable
const fallbackPodcasts = [
  {
    id: 'podcast1',
    title: 'Social Media Power: Amplifying Your Blog’s Reach',
    description: 'Learn strategies to boost your blog\'s visibility and engagement across all social media platforms.',
    audioUrl: '#',
    coverImage: 'https://placehold.co/600x400/F59E0B/FFFFFF?text=Social+Media',
    slug: 'social-media-power',
  },
  {
    id: 'podcast2',
    title: 'SEO Mastery: How to Rank Higher on Google',
    description: 'Dive deep into search engine optimization techniques to increase your organic traffic and dominate search rankings.',
    audioUrl: '#',
    coverImage: 'https://placehold.co/600x400/EF4444/FFFFFF?text=SEO+Mastery',
    slug: 'seo-mastery',
  },
  {
    id: 'podcast3',
    title: 'Monetizing Your Blog: Turning Passion into Profit',
    description: 'Discover various ways to generate income from your content, from affiliate marketing to sponsored posts and more.',
    audioUrl: '#',
    coverImage: 'https://placehold.co/600x400/0EA5E9/FFFFFF?text=Monetizing+Blog',
    slug: 'monetizing-blog',
  },
];

const LatestPodcastSection = () => {


    // Destructure storeFormData from context, providing a fallback
    const { storeFormData } = useStoreContext() || {};
    const { Podcast : podcasts } = storeFormData || {};
  
    // Map dynamic blog posts to our news item shape, or use fallback data
    const podcastItems = Array.isArray(podcasts) && podcasts.length > 0
      ? podcasts.slice(0, 6).map(podcast => ({
          id: podcast.id,
          title: podcast.title,
          description: podcast.description,
          audioUrl: podcast.audioUrl,
          coverImage: podcast.coverImage,
          slug: podcast.slug,
        }))
      : fallbackPodcasts;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = 'https://placehold.co/600x400/CCCCCC/333333?text=Podcast+Image';
  };

  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  const cardHoverVariants = {
    initial: { scale: 1, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' },
    hover: {
      scale: 1.05,
      boxShadow: '0 20px 25px rgba(0, 0, 0, 0.2), 0 10px 10px rgba(0, 0, 0, 0.1)',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 10,
      },
    },
  };

  return (
    <section className="bg-slate-950 py-20 font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          variants={variants}
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-sky-400 to-indigo-500 mb-4">
            Latest Podcasts
          </h2>
          <p className="text-lg sm:text-xl text-center text-slate-400 max-w-2xl mx-auto mb-12">
            Tune in to our latest episodes and learn from industry experts.
          </p>
        </motion.div>

        <motion.div
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          transition={{ staggerChildren: 0.2, duration: 0.6 }}
        >
          {podcastItems.map((pc, idx) => (
            <motion.div
              key={pc.id || idx}
              className="bg-slate-800 rounded-2xl overflow-hidden shadow-lg border border-slate-700 transition-all duration-300 transform hover:scale-105 cursor-pointer group flex flex-col relative"
              initial="initial"
              whileHover="hover"
              variants={cardHoverVariants}
            >
              <a href={pc.slug ? `/podcasts/${pc.slug}` : pc.audioUrl || '#'} className="block">
                <div className="w-full h-48 overflow-hidden relative">
                  <img
                    src={pc.coverImage || 'https://placehold.co/600x400/CCCCCC/333333?text=Podcast+Image'}
                    alt={pc.title}
                    width={600}
                    height={320}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={handleImageError}
                  />
                  <motion.div
                    className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PlayIcon className="h-16 w-16 text-white" />
                  </motion.div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <h3 className="font-bold text-xl mb-4 text-white leading-snug">
                    {pc.title}
                  </h3>
                  {pc.description && (
                    <p className="text-slate-400 text-sm mb-4 line-clamp-3">
                      {pc.description}
                    </p>
                  )}
                  <span
                    className="inline-flex items-center mt-auto px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300 border"
                    style={{
                      background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                      color: 'white',
                      border: 'none',
                    }}
                  >
                    <PlayIcon className="h-4 w-4 mr-2" /> Listen Now
                  </span>
                </div>
              </a>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="text-center mt-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          variants={variants}
        >
          <a
            href="/podcasts"
            className="inline-block px-8 py-4 rounded-full font-bold text-lg shadow-md transition-all duration-300 transform hover:scale-105"
            style={{
              background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
              color: 'white',
            }}
          >
            Browse All Podcasts &rarr;
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default LatestPodcastSection;
