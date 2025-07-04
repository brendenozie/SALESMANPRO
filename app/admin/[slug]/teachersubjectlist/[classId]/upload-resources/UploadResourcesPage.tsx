'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  CloudArrowUpIcon, // Main icon for upload
  DocumentIcon, // Generic file icon
  DocumentArrowDownIcon, // PDF icon (replacement for FilePdfIcon)
  // FileWordIcon, // Word document icon (not available in outline set)
  // FileExcelIcon, // Excel icon (not available in outline set)
  // FilePowerPointIcon, // PowerPoint icon
  LinkIcon, // URL resource icon
  TrashIcon, // Delete icon
  CheckCircleIcon, // Success message icon
  ExclamationCircleIcon, // Error message icon
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

// Mocking context data for demonstration purposes
const useMockStoreContext = () => ({
  storeFormData: {
    themeSettings: {
      primaryColor: "#fd2121", // Red from your sample
      accentColor: "#FFC107", // Amber Yellow, for consistency
    },
    teacherClasses: [ // Sample classes with mock resources
      {
        id: '6863daeef4ad17d957b92403',
        name: 'Grade 7 Mathematics',
        grade: '7',
        studentsEnrolled: 35,
        resources: [
          { id: 'R001', name: 'Math Syllabus 2025', type: 'PDF', url: 'https://example.com/syllabus.pdf' },
          { id: 'R002', name: 'Algebra Homework Guide', type: 'DOCX', url: 'https://example.com/algebra_guide.docx' },
          { id: 'R003', name: 'Online Practice Quizzes', type: 'Link', url: 'https://quizlet.com/math-quizzes' },
          { id: 'R004', name: 'Geometry Formulas Cheat Sheet', type: 'PDF', url: 'https://example.com/geometry_formulas.pdf' },
        ],
      },
      {
        id: 'CL102',
        name: 'Grade 8 English Language',
        grade: '8',
        studentsEnrolled: 30,
        resources: [
          { id: 'E001', name: 'Essay Writing Rubric', type: 'PDF', url: 'https://example.com/essay_rubric.pdf' },
          { id: 'E002', name: 'Grammar Exercises', type: 'XLSX', url: 'https://example.com/grammar_exercises.xlsx' },
        ],
      },
    ]
  },
});

// Simplified loader for standard <img> tag (not directly used for resources, but kept for consistency)
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

interface UploadResourcesPageProps {
  classId: string; // The ID of the class for which to manage resources
  // onBack: () => void; // Callback to navigate back to the previous page (e.g., Class List)
}

export default function UploadResourcesPage({ classId }: UploadResourcesPageProps) {
  // IMPORTANT: In your actual application, use:
  // const { storeFormData } = useStoreContext();
  const { storeFormData } = useMockStoreContext();

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121';
  const accentColor = storeFormData?.themeSettings?.accentColor || "#FFC107";

  const [currentClass, setCurrentClass] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resourceName, setResourceName] = useState('');
  const [resourceLink, setResourceLink] = useState(''); // For URL resources
  const [resourceType, setResourceType] = useState<'File' | 'Link'>('File'); // To toggle between file upload and link input
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const foundClass = storeFormData?.teacherClasses?.find(cls => cls.id === classId);
    setCurrentClass(foundClass || null);
  }, [classId, storeFormData?.teacherClasses]);

  const showStatus = (type: 'success' | 'error', message: string) => {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage(null), 3000); // Clear after 3 seconds
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return <DocumentArrowDownIcon className="h-6 w-6 text-red-500" />;
      case 'docx':
      case 'doc': return <DocumentIcon className="h-6 w-6 text-blue-500" />;
      case 'xlsx':
      case 'xls': return <DocumentIcon className="h-6 w-6 text-green-500" />;
      case 'pptx':
      case 'ppt': return <DocumentIcon className="h-6 w-6 text-orange-500" />;
      case 'link': return <LinkIcon className={`h-6 w-6 text-[${accentColor}]`} />;
      default: return <DocumentIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setResourceName(event.target.files[0].name.split('.')[0]); // Pre-fill name
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setSelectedFile(event.dataTransfer.files[0]);
      setResourceName(event.dataTransfer.files[0].name.split('.')[0]); // Pre-fill name
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleUploadResource = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentClass) {
      showStatus('error', 'Class not loaded.');
      return;
    }

    if (resourceType === 'File' && !selectedFile) {
      showStatus('error', 'Please select a file to upload.');
      return;
    }
    if (resourceType === 'Link' && !resourceLink.trim()) {
      showStatus('error', 'Please enter a valid link.');
      return;
    }
    if (!resourceName.trim()) {
      showStatus('error', 'Please enter a resource name.');
      return;
    }

    const newResourceId = `R${Date.now()}`;
    let newResource: any;

    if (resourceType === 'File') {
      // Simulate file upload process
      console.log('Simulating file upload:', selectedFile?.name);
      newResource = {
        id: newResourceId,
        name: resourceName,
        type: selectedFile?.name.split('.').pop()?.toUpperCase() || 'FILE',
        url: `https://mock-storage.com/${classId}/${newResourceId}_${selectedFile?.name}`, // Mock URL
      };
    } else { // Resource Type is Link
      newResource = {
        id: newResourceId,
        name: resourceName,
        type: 'Link',
        url: resourceLink,
      };
    }

    const updatedResources = [...currentClass.resources, newResource];

    // In a real app, send this to your backend and storage service
    setCurrentClass((prevClass: any) => ({
      ...prevClass,
      resources: updatedResources,
    }));

    showStatus('success', `${resourceType} "${resourceName}" uploaded successfully!`);
    setSelectedFile(null);
    setResourceName('');
    setResourceLink('');
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear file input
    }
  };

  const handleDeleteResource = (resourceId: string, resourceName: string) => {
    if (window.confirm(`Are you sure you want to delete resource "${resourceName}"? This action cannot be undone.`)) {
      if (!currentClass) return;

      const updatedResources = currentClass.resources.filter((res: any) => res.id !== resourceId);

      // In a real app, send delete request to backend and storage
      setCurrentClass((prevClass: any) => ({
        ...prevClass,
        resources: updatedResources,
      }));
      showStatus('success', `Resource "${resourceName}" deleted successfully!`);
    }
  };

  const filteredResources = useMemo(() => {
    return currentClass?.resources?.filter((resource: any) =>
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.type.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a: any, b: any) => a.name.localeCompare(b.name)) || [];
  }, [currentClass, searchTerm]);

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  if (!currentClass) {
    return (
      <div className="p-8 text-center bg-gray-50 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Class Not Found</h2>
        <p className="text-gray-500 mb-6">The class with ID "{classId}" could not be loaded for resources.</p>
        <button
          onClick={() => window.history.back()}
          className={`inline-flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-md shadow-sm
                      hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400`}
        >
          <ArrowLeftIcon className="h-5 w-5" /> Back to Class List
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className={`p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]`}
            aria-label="Back to Class List"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Class Resources <span style={{ color: primaryColor }}>{currentClass.name}</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Upload and manage learning materials for your students.
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Status Message */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-3 rounded-md flex items-center gap-2 ${
              statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : (
              <ExclamationCircleIcon className="h-5 w-5" />
            )}
            {statusMessage.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload New Resource Section */}
      <motion.div
        className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6"
        variants={containerVariants}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload New Resource</h2>
        <form onSubmit={handleUploadResource} className="space-y-5">
          {/* Resource Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Resource Type</label>
            <div className="flex gap-4">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="resourceType"
                  value="File"
                  checked={resourceType === 'File'}
                  onChange={() => setResourceType('File')}
                  className={`form-radio h-5 w-5 text-[${primaryColor}] border-gray-300 focus:ring-[${primaryColor}]`}
                />
                <span className="ml-2 text-gray-700">File Upload</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="resourceType"
                  value="Link"
                  checked={resourceType === 'Link'}
                  onChange={() => setResourceType('Link')}
                  className={`form-radio h-5 w-5 text-[${primaryColor}] border-gray-300 focus:ring-[${primaryColor}]`}
                />
                <span className="ml-2 text-gray-700">External Link</span>
              </label>
            </div>
          </div>

          {resourceType === 'File' ? (
            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">Select File</label>
              <div
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-gray-400 transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="space-y-1 text-center">
                  <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <p className="pl-1">
                      {selectedFile ? selectedFile.name : 'Drag and drop or click to browse'}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, DOCX, XLSX, PPTX, etc. (Max 10MB)
                  </p>
                </div>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="resource-link" className="block text-sm font-medium text-gray-700 mb-1">Resource URL</label>
              <input
                type="url"
                id="resource-link"
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                value={resourceLink}
                onChange={(e) => setResourceLink(e.target.value)}
                placeholder="https://example.com/useful-resource"
                required={resourceType === 'Link'}
              />
            </div>
          )}

          <div>
            <label htmlFor="resource-name" className="block text-sm font-medium text-gray-700 mb-1">Resource Name</label>
            <input
              type="text"
              id="resource-name"
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
              value={resourceName}
              onChange={(e) => setResourceName(e.target.value)}
              placeholder="e.g., Chapter 1 Notes"
              required
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              className={`px-6 py-3 bg-[${primaryColor}] text-white font-semibold rounded-md shadow-md
                          hover:bg-[${primaryColor}D0] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${primaryColor}]`}
            >
              Upload Resource
            </button>
          </div>
        </form>
      </motion.div>

      {/* Search Bar for Existing Resources */}
      <motion.div variants={itemVariants} className="max-w-xl mx-auto relative mt-10">
        <input
          type="text"
          placeholder="Search existing resources..."
          className="w-full p-3 pl-10 rounded-full border border-gray-300 shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-[${accentColor}] focus:border-transparent
                     text-gray-900 placeholder-gray-500 bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      </motion.div>

      {/* Existing Resources List */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {filteredResources.length > 0 ? (
          filteredResources.map((resource: any) => (
            <motion.div
              key={resource.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex items-center justify-between
                         hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 ease-in-out"
              variants={itemVariants}
            >
              <div className="flex items-center gap-4 flex-grow">
                {getFileIcon(resource.type)}
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{resource.name}</h3>
                  <p className="text-sm text-gray-600">{resource.type} File</p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors
                              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]`}
                  aria-label={`View ${resource.name}`}
                >
                  <LinkIcon className="h-5 w-5" />
                </a>
                <button
                  onClick={() => handleDeleteResource(resource.id, resource.name)}
                  className={`p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors
                              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400`}
                  aria-label={`Delete ${resource.name}`}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            className="col-span-full p-8 text-center text-gray-500 bg-white rounded-xl shadow-md border border-gray-200"
            variants={itemVariants}
          >
            <DocumentIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No resources uploaded for this class yet.</p>
            <p className="text-sm mt-2">Use the section above to add new learning materials.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
