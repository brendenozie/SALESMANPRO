// app/admin/[adminSlug]/articles/page.tsx
"use client";

import React from 'react';
import AdminLayout from '@/components/AdminLayout'; // Adjust path as needed
import { motion } from 'framer-motion';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const sampleArticles = [
  { id: "art1", title: "The Future of AI in Media", author: "Dr. Anya Sharma", status: "Published", date: "2025-07-10", imageUrl: "/images/articles/ai.jpg" },
  { id: "art2", title: "Travel Trends 2025: Beyond the Horizon", author: "Mark Davison", status: "Published", date: "2025-07-05", imageUrl: "/images/articles/travel.jpg" },
  { id: "art3", title: "Esports: From Niche to Mainstream", author: "Chloe Park", status: "Draft", date: "2025-06-28", imageUrl: "/images/articles/gaming.jpg" },
  { id: "art4", title: "The Impact of Streaming on Traditional Cinema", author: "Lena Khan", status: "Published", date: "2025-06-20", imageUrl: "/images/articles/streaming.jpg" },
];

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticleManagementPage({ params }: PageProps) {

  
    const { slug } = await params;
  
    const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    const identifier = slug || session?.user?.id || '';
  
    // 2. Retrieve the memoized company data (no extra DB cost)
    const company = await findCompanyCached(identifier, "page");
  
    if (!company) {
      return <div>Company not found</div>;
    }
  
    // Use the actual database ID for your API calls, ensuring consistency
    const companyId = company.id;

  const handleEdit = (id: string) => alert(`Edit article ${id}`);
  const handleDelete = (id: string) => {
    if (confirm(`Are you sure you want to delete article ${id}?`)) {
      alert(`Article ${id} deleted.`);
    }
  };
  const handleAddArticle = () => alert("Add new article form will open.");

  return (
    <div>
      <div className="flex justify-end mb-6">
        <motion.button
          onClick={handleAddArticle}
          className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full shadow-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <PlusIcon className="h-5 w-5 mr-2" /> Add New Article
        </motion.button>
      </div>

      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Thumbnail
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Author
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {sampleArticles.map((article, index) => (
              <motion.tr
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-700 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-16 w-16 relative rounded-md overflow-hidden">
                      <Image src={article.imageUrl} alt={article.title} fill className="object-cover" loader={loader}/>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-lg font-medium text-white">{article.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-400">{article.author}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    article.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {article.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                  {article.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <motion.button
                    onClick={() => handleEdit(article.id)}
                    className="text-indigo-400 hover:text-indigo-300 mr-4"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Edit ${article.title}`}
                  >
                    <PencilIcon className="h-5 w-5 inline" />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(article.id)}
                    className="text-red-400 hover:text-red-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Delete ${article.title}`}
                  >
                    <TrashIcon className="h-5 w-5 inline" />
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}