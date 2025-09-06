import React from 'react';
import { motion } from 'framer-motion';

// A placeholder for the StoreContext hook, mirroring the provided structure
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
    themeSettings: { primaryColor: '#0EA5E9' },
  },
});

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

const App = () => {
  // SVG for a calendar icon
  const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2">
      <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5H16.5V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6.75V3A.75.75 0 0 1 7.5 3zM16.5 6V4.5H7.5V6h9z" clipRule="evenodd" />
    </svg>
  );

  // SVG for a user icon
  const UserCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2">
      <path fillRule="evenodd" d="M18.685 19.03A9.75 9.75 0 0 1 12 21.75c-2.676 0-5.324-.775-7.499-2.25A15.75 15.75 0 0 1 12 2.25a15.75 15.75 0 0 1 7.499 16.78zM12 11.25a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5z" clipRule="evenodd" />
    </svg>
  );

  // Destructure storeFormData from context, providing a fallback
  const { storeFormData } = useStoreContext() || {};
  const { blogs: dynamicNews, themeSettings: { primaryColor = '#0EA5E9' } = {} } = storeFormData || {};

  // Map dynamic blog posts to our news item shape, or use fallback data
  const newsItems = Array.isArray(dynamicNews) && dynamicNews.length > 0
    ? dynamicNews.slice(0, 6).map(post => ({
        title: post.title,
        date: post.publishedAt
          ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          : 'Unknown date',
        img: post.coverImage || 'https://placehold.co/600x400/CCCCCC/333333?text=No+Image',
        link: post.slug ? `/blogs/${post.slug}` : '#',
        authorName: post.author?.name || 'Guest Author',
        authorImage: post.author?.profileImage || null,
      }))
    : fallbackNews;

  // Function to handle image loading errors
  const handleImageError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = 'https://placehold.co/600x400/CCCCCC/333333?text=Image+Not+Found';
  };

  // Variants for staggered entry animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section className="bg-slate-950 text-white py-16 font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-sky-400 to-indigo-500">
            Latest News & Articles
          </h2>
          <p className="text-lg sm:text-xl text-center text-slate-400 max-w-2xl mx-auto mb-12">
            Stay up-to-date with our most recent posts and featured content.
          </p>
        </motion.div>

        <motion.div
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {newsItems.map((item, idx) => (
            <motion.article
              key={idx}
              className="bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
              variants={itemVariants}
            >
              <a href={item.link} className="block">
                <div className="w-full h-48 overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.title}
                    width={600}
                    height={320}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={handleImageError}
                  />
                </div>
                
                <div className="p-5 flex flex-col justify-between h-auto">
                  <h3 className="font-bold text-xl mb-3 leading-snug text-white">
                    {item.title}
                  </h3>

                  <div className="flex items-center text-slate-400 text-sm mb-4">
                    <CalendarIcon />
                    <span className="mr-4">{item.date}</span>
                    <span className="flex items-center">
                      <img
                        src={item.authorImage || 'https://placehold.co/24x24/CCCCCC/333333?text=A'}
                        alt={item.authorName || 'Author'}
                        className="rounded-full w-6 h-6 object-cover mr-2"
                        onError={handleImageError}
                      />
                      <span>{item.authorName}</span>
                    </span>
                  </div>

                  <span
                    className="inline-flex items-center mt-auto px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300 transform hover:scale-105"
                    style={{
                      backgroundColor: `rgba(${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}, 0.1)`,
                      color: primaryColor,
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
        </motion.div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: newsItems.length * 0.1 + 0.2 }}
        >
          <a
            href="/blogs"
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
      </div>
    </section>
  );
}

export default App;
