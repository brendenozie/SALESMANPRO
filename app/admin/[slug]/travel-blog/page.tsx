"use client";

import React, { useState } from 'react';
import {
  NewspaperIcon, PlusCircleIcon, PencilIcon, TrashIcon, EyeIcon, CloudArrowUpIcon
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';

// --- Type Definitions ---
interface BlogPost {
  id: string;
  title: string;
  author: string;
  date: string;
  status: 'Published' | 'Draft';
  content?: string; // Content is optional in the initial data
}

interface BlogPostForm {
  id?: string;
  title: string;
  content: string;
  status: 'Published' | 'Draft';
}

interface BlogPostModalProps {
  post: BlogPost | null;
  onSave: (formData: BlogPostForm) => void;
  onClose: () => void;
}

// Dummy Data
const initialBlogPosts: BlogPost[] = [
  { id: 'BP001', title: '10 Essential Tips for Solo Travelers', author: 'Admin', date: '2024-07-10', status: 'Published' },
  { id: 'BP002', title: 'Budgeting Your Dream European Vacation', author: 'Admin', date: '2024-07-05', status: 'Draft' },
  { id: 'BP003', title: 'Hidden Gems: Uncovering Asia\'s Best-Kept Secrets', author: 'Admin', date: '2024-06-28', status: 'Published' },
];

export default function AdminBlog() {
  const params = useParams();
  const companyId = params.slug || 'default-slug'; // Fallback slug
  // In a real app, you would fetch blog posts based on the slug (e.g., destination or category)
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(initialBlogPosts);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null); // For edit mode

  const openAddModal = () => {
    setCurrentPost(null);
    setIsModalOpen(true);
  };

  const openEditModal = (post: BlogPost) => {
    setCurrentPost(post);
    setIsModalOpen(true);
  };

  const handleSavePost = (formData: BlogPostForm) => {
    if (formData.id) {
      // Edit existing
      setBlogPosts(blogPosts.map(p => p.id === formData.id ? { ...p, ...formData } : p));
      alert(`Blog post "${formData.title}" updated.`);
    } else {
      // Add new
      const newId = `BP${String(blogPosts.length + 1).padStart(3, '0')}`;
      const newPost: BlogPost = { ...formData, id: newId, author: 'Admin', date: new Date().toISOString().slice(0, 10) };
      setBlogPosts([...blogPosts, newPost]);
      alert(`Blog post "${formData.title}" added.`);
    }
    setIsModalOpen(false);
  };

  const handleDeletePost = (id: string) => {
    if (window.confirm(`Are you sure you want to delete blog post ${id}?`)) {
      setBlogPosts(blogPosts.filter(p => p.id !== id));
      alert(`Blog post ${id} deleted.`);
    }
  };

  const getStatusColor = (status: BlogPost['status']) => {
    switch (status) {
      case 'Published': return 'bg-green-100 text-green-800';
      case 'Draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-extrabold text-gray-900 mb-8"
      >
        Manage Blog & Content
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-md p-6 mb-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">All Blog Posts</h2>
          <motion.button
            onClick={openAddModal}
            className="flex items-center space-x-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span>Create New Post</span>
          </motion.button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {blogPosts.length > 0 ? (
                blogPosts.map((post) => (
                  <tr key={post.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{post.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{post.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{post.author}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{post.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(post.status)}`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          onClick={() => alert(`Viewing post: ${post.title}`)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition"
                          title="View Post"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <EyeIcon className="h-5 w-5" />
                        </motion.button>
                        <motion.button
                          onClick={() => openEditModal(post)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition"
                          title="Edit"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <PencilIcon className="h-5 w-5" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition"
                          title="Delete"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No blog posts found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add/Edit Blog Post Modal */}
      {isModalOpen && (
        <BlogPostModal
          post={currentPost}
          onSave={handleSavePost}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

// BlogPostModal.jsx (Internal Component for Add/Edit)
const BlogPostModal: React.FC<BlogPostModalProps> = ({ post, onSave, onClose }) => {
  const [title, setTitle] = useState<string>(post?.title || '');
  const [content, setContent] = useState<string>(post?.content || ''); // Assuming content field exists
  const [status, setStatus] = useState<'Published' | 'Draft'>(post?.status || 'Draft');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: post?.id,
      title,
      content,
      status,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md"
        onClick={(e:any) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {post ? 'Edit Blog Post' : 'Create New Blog Post'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="postTitle" className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              id="postTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="postContent" className="block text-sm font-medium text-gray-700">Content</label>
            <textarea
              id="postContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="postStatus" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              id="postStatus"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'Published' | 'Draft')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {post ? 'Save Changes' : 'Create Post'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}