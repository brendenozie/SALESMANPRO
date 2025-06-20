// app/admin/[slug]/blogs/BlogsClient.tsx

"use client";

import AddEditBlogModal from "@/components/AddBlogModal";
import React, { useState } from "react";

export type BlogItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  categories: string[];
  tags: string[];
  author: { name: string; profileImage?: string } | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt: string | null;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
};

type Category = {
  id: string;
  name: string;
  image: string;
  tags: string[];
  status: string;
};

interface BlogsClientProps {
  companyId: string;
  blogs: BlogItem[];
  categoriesData: Category[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
}

export default function BlogsClient({
  companyId,
  categoriesData,
  blogs,
  totalItems,
  totalPages,
  currentPage,
  perPage,
}: BlogsClientProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [selectedBlog, setSelectedBlog] = useState<BlogItem | null>(null);

  return (
    <div className="container mx-auto p-10">
      <h1 className="text-5xl font-extrabold text-center text-gray-900 mb-8 tracking-tight">
        
      </h1>
      <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">My Blogs</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Add New Blog Post
              </button>
            </div>
      {blogs && blogs.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8 mb-8">
          <p className="text-gray-600">
            Showing {blogs.length} of {totalItems} blogs
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.length === 0 && (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500 text-xl">
              No blogs available.
            </p>
          </div>
        )}

        {blogs.map((blog) => (
          <div
            key={blog.id}
            className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition"
          >
            {blog.coverImage && (
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="w-full h-40 object-cover rounded-md mb-4"
              />
            )}
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {blog.title}
            </h3>
            {blog.excerpt && (
              <p className="text-sm text-gray-600 mb-3">
                {blog.excerpt}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.categories.map((c) => (
                <span
                  key={c}
                  className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded"
                >
                  {c}
                </span>
              ))}
            </div>
            <div className="text-xs text-gray-500 mb-4">
              {blog.status} •{" "}
              {blog.publishedAt
                ? new Date(blog.publishedAt).toLocaleDateString()
                : new Date(blog.createdAt).toLocaleDateString()}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedBlog(blog);
                  setShowEditModal(true);
                }}
                className="px-3 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  setSelectedBlog(blog);
                  
                }}
                className="px-3 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination (simple) */}
      <div className="mt-8 flex justify-center space-x-4">
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            disabled={currentPage === idx + 1}
            className={`px-4 py-2 rounded ${
              currentPage === idx + 1
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      {/* ========== Modals ========== */}
      {showEditModal && selectedBlog && (
        <AddEditBlogModal
          show={showEditModal}
          categoriesData={categoriesData}
          onClose={() => setShowEditModal(false)}
          initialData={selectedBlog}
        />
      )}
      {showAddModal && (
        <AddEditBlogModal
          show={showAddModal}          
          categoriesData={categoriesData}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
