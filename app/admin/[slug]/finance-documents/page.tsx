"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  DocumentIcon,
} from "@heroicons/react/24/solid";

import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';


// Types
interface Uploader {
  id: string;
  name: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  createdAt: string; // ISO date string
  uploader?: Uploader | null;
  uploaderId: string;
  companyId: string;
}

interface UploadPayload {
  name: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  uploaderId: string;
  companyId: string;
}

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DocumentsPage({ params }: PageProps) {
  const { slug } = await params;

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");

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

  const fetchDocuments = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/documents`);
      const data: DocumentItem[] = await res.json();
      setDocuments(data);
    } catch (error) {
      // console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fileToUpload) return;

    const newDocumentData: UploadPayload = {
      name: fileName || fileToUpload.name,
      fileUrl: `https://placeholder-url.com/${Date.now()}/${
        fileName || fileToUpload.name
      }`,
      mimeType: fileToUpload.type,
      fileSize: fileToUpload.size,
      uploaderId: "clx0j25gq0000j212c4x11w4t", // Placeholder
      companyId: "clx0j25gq0001j212c4x11w4t", // Placeholder
    };

    try {
      const res = await fetch(`${apiBaseUrl}/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newDocumentData),
      });

      if (!res.ok) {
        throw new Error("API request failed");
      }

      await fetchDocuments();
      setShowModal(false);
      setFileToUpload(null);
      setFileName("");
    } catch (error) {
      // console.error("Error uploading document:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        const res = await fetch(`${apiBaseUrl}/documents/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          throw new Error("API request failed");
        }
        await fetchDocuments();
      } catch (error) {
        // console.error("Error deleting document:", error);
      }
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
     <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 md:p-10 bg-gray-900 min-h-screen text-gray-100"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-400 mb-2">Document Library</h1>
          <p className="text-gray-400">Manage and access all your company's documents.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center shadow-lg"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" /> Upload New Document
        </button>
      </div>

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search documents by name..."
          className="w-full bg-gray-800 border border-gray-700 rounded-full py-3 pl-12 pr-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
      </div>

      {loading ? (
        <div className="text-center text-gray-400">Loading documents...</div>
      ) : (
        <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
          {/* Table View for larger screens */}
          <div className="hidden md:block">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Size</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Upload Date</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Uploader</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <AnimatePresence>
                  {filteredDocuments.map((doc) => (
                    <motion.tr
                      key={doc.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{doc.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{doc.mimeType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatFileSize(doc.fileSize)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(doc.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{doc.uploader?.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <motion.a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </motion.a>
                          <motion.a
                            href={doc.fileUrl}
                            download
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-green-400 hover:text-green-300 transition-colors"
                          >
                            <ArrowDownTrayIcon className="h-5 w-5" />
                          </motion.a>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            onClick={() => handleDelete(doc.id)}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Card View for mobile screens */}
          <div className="md:hidden p-4 space-y-4">
            <AnimatePresence>
              {filteredDocuments.map((doc) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-700 rounded-lg p-4 shadow-md flex justify-between items-center"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-1">
                      <DocumentIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                      <h4 className="text-lg font-bold text-white truncate">{doc.name}</h4>
                    </div>
                    <p className="text-gray-400 text-sm truncate">Size: {formatFileSize(doc.fileSize)}</p>
                    <p className="text-gray-400 text-xs">Uploaded: {new Date(doc.createdAt).toLocaleDateString()}</p>
                    <p className="text-gray-400 text-xs">Uploader: {doc.uploader?.name || 'N/A'}</p>
                  </div>
                  <div className="flex-shrink-0 flex space-x-2 ml-4">
                    <motion.a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-full bg-gray-600 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </motion.a>
                    <motion.a
                      href={doc.fileUrl}
                      download
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-full bg-gray-600 text-green-400 hover:text-green-300 transition-colors"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5" />
                    </motion.a>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-full bg-gray-600 text-red-400 hover:text-red-300 transition-colors"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Modal for Uploading New Document */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-lg w-full text-gray-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-400">Upload New Document</h2>
                <button onClick={() => setShowModal(false)}>
                  <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-white" />
                </button>
              </div>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label htmlFor="file" className="block text-sm font-medium text-gray-400">Choose File</label>
                  <input
                    type="file"
                    id="file"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const file = e.target.files?.[0] ?? null;
                      setFileToUpload(file);
                    }}
                    className="mt-1 block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                </div>
                {fileToUpload && (
                  <div>
                    <label htmlFor="fileName" className="block text-sm font-medium text-gray-400">Document Name (Optional)</label>
                    <input
                      type="text"
                      id="fileName"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder={fileToUpload.name}
                      className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                )}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                    disabled={!fileToUpload}
                  >
                    Upload Document
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
