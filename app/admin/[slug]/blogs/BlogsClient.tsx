"use client";

import AddEditBlogModal from "@/components/AddBlogModal";
import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  EyeIcon, 
  HandThumbUpIcon, 
  CalendarIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

export type BlogItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  categories: string[];
  category: string | null;
  subCategory: string | null;
  tags: string[];
  author: { name: string; profileImage?: string } | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt: string | null;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
};

interface BlogsClientProps {
  companyId: string;
  blogs: BlogItem[];
  categoriesData: any[];
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<BlogItem | null>(null);

  const handlePageChange = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
      case "DRAFT":
        return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
      case "ARCHIVED":
        return "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Publications
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-500 dark:text-gray-400">
              Manage, create, and track the performance of your blog posts.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="group relative flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-5 rounded-xl font-medium shadow-md hover:shadow-indigo-500/30 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-white/20 scale-x-0 group-hover:scale-x-100 transform origin-left transition-transform duration-300 ease-out" />
            <PlusIcon className="h-5 w-5 relative z-10" />
            <span className="relative z-10">Create Post</span>
          </button>
        </div>

        {/* Stats / Meta Bar */}
        {blogs && blogs.length > 0 && (
          <div className="flex items-center gap-2 mb-6 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 py-3 px-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            <DocumentTextIcon className="h-5 w-5 text-indigo-500" />
            <span>
              Showing <span className="text-gray-900 dark:text-white">{blogs.length}</span> of <span className="text-gray-900 dark:text-white">{totalItems}</span> total entries
            </span>
          </div>
        )}

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
          {blogs.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
              <div className="bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-full mb-4">
                <DocumentTextIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No posts found</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                You haven't written any blog posts yet. Get started by creating your first compelling story!
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
                Create your first post
              </button>
            </div>
          )}

          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="group flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl dark:hover:shadow-indigo-900/10 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Image Section */}
              <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
                {blog.coverImage ? (
                  <img
                    src={blog.coverImage}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                    <DocumentTextIcon className="h-12 w-12 opacity-50" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  {blog.isPremium ? (
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full border backdrop-blur-md bg-amber-500/90 text-white border-amber-400/50 shadow-sm">
                      🔒 {blog.currency || "KES"} {blog.price || 0}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full border backdrop-blur-md bg-emerald-600/80 text-white border-emerald-500/50">
                      Free Access
                    </span>
                  )}
                </div>
                <div className="absolute top-3 right-3">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border backdrop-blur-md ${getStatusStyles(blog.status)}`}>
                    {blog.status}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="flex flex-col flex-grow p-5">
                <div className="flex flex-wrap gap-2 mb-3">
                  {blog.categories ? blog.categories.slice(0, 3).map((c) => (
                    <span
                      key={c}
                      className="text-[10px] uppercase tracking-wider font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 px-2 py-0.5 rounded-md"
                    >
                      {c}
                    </span>
                  )) : blog.category }
                  {blog.categories.length > 3 && (
                    <span className="text-[10px] uppercase tracking-wider font-semibold bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-md">
                      +{blog.categories.length - 3}
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {blog.title}
                </h3>
                
                {blog.excerpt && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-grow">
                    {blog.excerpt}
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex items-center gap-4 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/60 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="h-4 w-4" />
                    {blog.publishedAt
                      ? new Date(blog.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                      : new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-3 ml-auto">
                    <span className="flex items-center gap-1">
                      <EyeIcon className="h-4 w-4" /> {blog.views || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <HandThumbUpIcon className="h-4 w-4" /> {blog.likes || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700/60 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setSelectedBlog(blog);
                    setShowEditModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <PencilSquareIcon className="h-4 w-4" /> Edit
                </button>
                <button
                  onClick={() => {
                    setSelectedBlog(blog);
                    // Add delete logic here later
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-rose-100 dark:hover:bg-rose-500/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Stunning Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center items-center space-x-2">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNumber = idx + 1;
              const isActive = currentPage === pageNumber;
              return (
                <button
                  key={idx}
                  onClick={() => handlePageChange(pageNumber)}
                  disabled={isActive}
                  className={`min-w-[40px] h-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30 ring-1 ring-indigo-600"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ========== Modals ========== */}
      {showEditModal && selectedBlog && (
        <AddEditBlogModal
          show={showEditModal}
          categoriesData={categoriesData}
          onClose={() => setShowEditModal(false)}
          initialData={selectedBlog}
          companyId={companyId}
          onSuccess={() => {
            setShowEditModal(false);
            // Optionally refresh the page or update state to reflect changes
            router.refresh();
          }}
        />
      )}
      {showAddModal && (
        <AddEditBlogModal
          show={showAddModal}
          categoriesData={categoriesData}
          onClose={() => setShowAddModal(false)}
          companyId={companyId}          
          onSuccess={() => {
            setShowEditModal(false);
            // Optionally refresh the page or update state to reflect changes
            router.refresh();
          }}
        />
      )}
    </div>
  );
}