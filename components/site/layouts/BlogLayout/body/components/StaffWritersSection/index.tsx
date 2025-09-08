import React from 'react';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';

// A placeholder for the StoreContext hook, mirroring the provided structure
// const useStoreContext = () => ({
//   storeFormData: {
//     writers: [
//       {
//         id: 'writer1',
//         userId: 'user1',
//         user: { name: 'Kristin Watson', email: 'kristin@example.com', role: 'EDUCATOR' },
//         profilePicture: 'https://placehold.co/200x200/F59E0B/FFFFFF?text=Kristin',
//         bio: 'Senior Writer',
//         companyId: 'comp1',
//         loginCode: '12345',
//         totalArticles: 150,
//         articlesThisMonth: 10,
//         lastArticleDate: '2024-07-20T00:00:00Z',
//         status: 'Active',
//         createdAt: '2023-01-01T00:00:00Z',
//         updatedAt: '2024-07-23T00:00:00Z',
//       },
//       {
//         id: 'writer2',
//         userId: 'user2',
//         user: { name: 'Marvin Roy', email: 'marvin@example.com', role: 'EDUCATOR' },
//         profilePicture: 'https://placehold.co/200x200/EF4444/FFFFFF?text=Marvin',
//         bio: 'Journalist',
//         companyId: 'comp1',
//         loginCode: '67890',
//         totalArticles: 80,
//         articlesThisMonth: 5,
//         lastArticleDate: '2024-07-18T00:00:00Z',
//         status: 'Active',
//         createdAt: '2023-03-15T00:00:00Z',
//         updatedAt: '2024-07-22T00:00:00Z',
//       },
//       {
//         id: 'writer3',
//         userId: 'user3',
//         user: { name: 'Leslie Aria', email: 'leslie@example.com', role: 'EDUCATOR' },
//         profilePicture: 'https://placehold.co/200x200/0EA5E9/FFFFFF?text=Leslie',
//         bio: 'Publisher',
//         companyId: 'comp1',
//         loginCode: '11223',
//         totalArticles: 200,
//         articlesThisMonth: 12,
//         lastArticleDate: '2024-07-21T00:00:00Z',
//         status: 'Active',
//         createdAt: '2022-11-01T00:00:00Z',
//         updatedAt: '2024-07-23T00:00:00Z',
//       },
//       {
//         id: 'writer4',
//         userId: 'user4',
//         user: { name: 'Hawkins Alex', email: 'hawkins@example.com', role: 'EDUCATOR' },
//         profilePicture: 'https://placehold.co/200x200/10B981/FFFFFF?text=Hawkins',
//         bio: 'Content Writer',
//         companyId: 'comp1',
//         loginCode: '44556',
//         totalArticles: 90,
//         articlesThisMonth: 7,
//         lastArticleDate: '2024-07-19T00:00:00Z',
//         status: 'Active',
//         createdAt: '2023-05-20T00:00:00Z',
//         updatedAt: '2024-07-22T00:00:00Z',
//       },
//     ],
//     themeSettings: { primaryColor: '#F59E0B' },
//   },
// });

// Static fallback data for staff writers
const fallbackStaffWriters = [
  { name: 'Kristin Watson', role: 'Senior Writer', img: 'https://placehold.co/200x200/F59E0B/FFFFFF?text=Kristin' },
  { name: 'Marvin Roy', role: 'Journalist', img: 'https://placehold.co/200x200/EF4444/FFFFFF?text=Marvin' },
  { name: 'Leslie Aria', role: 'Publisher', img: 'https://placehold.co/200x200/0EA5E9/FFFFFF?text=Leslie' },
  { name: 'Hawkins Alex', role: 'Content Writer', img: 'https://placehold.co/200x200/10B981/FFFFFF?text=Hawkins' },
];

const StaffWritersSection = () => {
  // Destructure storeFormData from context, providing a fallback for when context is not available
  const { storeFormData } = useStoreContext() || {};
  const dynamicWriters = storeFormData?.Writer;

  // Map dynamic writer data to our display shape, or use fallback data
  const writersToDisplay = Array.isArray(dynamicWriters) && dynamicWriters.length > 0
    ? dynamicWriters.map(writer => ({
        name: writer.name || 'Unknown Writer',
        role: writer.bio || 'Writer',
        img: writer.profilePicture || 'https://placehold.co/200x200/CCCCCC/333333?text=User',
      }))
    : fallbackStaffWriters;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = 'https://placehold.co/200x200/CCCCCC/333333?text=User';
  };

  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="bg-slate-950 py-20 font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10">
          <motion.h2
            className="text-4xl sm:text-5xl font-extrabold text-center sm:text-left text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-sky-400 to-indigo-500 mb-4 sm:mb-0"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
            variants={variants}
          >
            Meet Our Talented Writers
          </motion.h2>
          <motion.a
            href="/writers" // Link to your main writers archive page
            className="inline-block px-6 py-3 rounded-full font-semibold text-base shadow-lg transition-all duration-300 transform hover:scale-105"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            variants={variants}
            style={{
              background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
              color: 'white',
            }}
          >
            View All Writers &rarr;
          </motion.a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {writersToDisplay.map((writer, idx) => (
            <motion.div
              key={idx}
              className="bg-slate-800 rounded-2xl p-6 text-center shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer flex flex-col items-center border border-transparent hover:border-violet-500"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              variants={variants}
            >
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-slate-700 group-hover:border-violet-500 transition-colors duration-300">
                <img
                  src={writer.img}
                  alt={writer.name}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={handleImageError}
                />
              </div>

              <h4 className="mt-2 font-bold text-lg text-white">{writer.name}</h4>
              <p className="text-slate-400 text-sm mt-1">{writer.role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StaffWritersSection;
