'use client';

import React, { useState } from 'react';
import {
  CalendarDaysIcon, // For date
  DocumentTextIcon, // For general materials
  ArrowUpOnSquareIcon, // For upload
  PencilIcon, // For edit
  MagnifyingGlassIcon, // For search
  DocumentIcon, // For PDF/Docs
  PlayCircleIcon, // For Videos
  LinkIcon, // For External Links
  PhotoIcon, // For Images
  AcademicCapIcon, // For subject/class association
  TrashIcon,
  EyeIcon, // For delete
} from '@heroicons/react/24/outline';

// Sample Data for the Teacher's Teaching Materials Page
const teacherName = "Mr. John Doe"; // Placeholder for logged-in teacher's name

const sampleClassesForMaterials = [ // Simplified list of classes for filtering
    { id: 'CL101', name: 'Grade 7 Mathematics' },
    { id: 'CL102', name: 'Grade 8 English Language' },
    { id: 'CL103', name: 'Grade 9 Algebra' },
    { id: 'CL104', name: 'Grade 10 Geometry' },
];

const sampleTeachingMaterials = [
  {
    id: 'M001',
    name: 'Algebra Chapter 3 Notes',
    type: 'PDF',
    subject: 'Mathematics',
    classId: 'CL103',
    className: 'Grade 9 Algebra',
    description: 'Comprehensive notes covering algebraic expressions and equations.',
    uploadedDate: '2025-06-20',
    url: '/materials/algebra_ch3_notes.pdf', // Placeholder URL
  },
  {
    id: 'M002',
    name: 'Literary Devices Video Series',
    type: 'Video',
    subject: 'English',
    classId: 'CL102',
    className: 'Grade 8 English Language',
    description: 'Short video lessons explaining literary devices like metaphor, simile, etc.',
    uploadedDate: '2025-06-18',
    url: 'https://youtube.com/literary_devices_series', // Placeholder URL
  },
  {
    id: 'M003',
    name: 'Geometry Practice Problems (External)',
    type: 'Link',
    subject: 'Mathematics',
    classId: 'CL104',
    className: 'Grade 10 Geometry',
    description: 'Link to an interactive online platform for geometry practice.',
    uploadedDate: '2025-06-15',
    url: 'https://geometrypractice.com', // Placeholder URL
  },
  {
    id: 'M004',
    name: 'Photosynthesis Diagram',
    type: 'Image',
    subject: 'Science',
    classId: 'CL101', // Example: Could be used for cross-grade intro
    className: 'Grade 7 Mathematics', // Example of mismatch, normally tied to a science class
    description: 'High-resolution diagram illustrating the photosynthesis process.',
    uploadedDate: '2025-06-10',
    url: '/materials/photosynthesis.png', // Placeholder URL
  },
  {
    id: 'M005',
    name: 'English Grammar Workbook',
    type: 'PDF',
    subject: 'English',
    classId: 'CL102',
    className: 'Grade 8 English Language',
    description: 'Workbook for reinforcing grammar rules, printable.',
    uploadedDate: '2025-06-05',
    url: '/materials/grammar_workbook.pdf', // Placeholder URL
  },
];

export default function TeachersTeachingMaterialsPage() {
  const [materials, setMaterials] = useState(sampleTeachingMaterials);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [showFormModal, setShowFormModal] = useState(false);
  type Material = {
    id: string;
    name: string;
    type: string;
    subject: string;
    classId: string;
    className: string;
    description: string;
    uploadedDate: string;
    url: string;
  };
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <DocumentIcon className="h-5 w-5 text-red-500" />;
      case 'Video': return <PlayCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'Link': return <LinkIcon className="h-5 w-5 text-purple-500" />;
      case 'Image': return <PhotoIcon className="h-5 w-5 text-green-500" />;
      default: return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          material.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          material.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'All' || material.classId === filterClass;
    const matchesType = filterType === 'All' || material.type === filterType;
    return matchesSearch && matchesClass && matchesType;
  }).sort((a, b) => new Date(b.uploadedDate).getTime() - new Date(a.uploadedDate).getTime()); // Sort by most recent

  const totalMaterials = materials.length;
  const uniqueMaterialTypes = Array.from(new Set(materials.map(m => m.type)));

  // Placeholder functions for modal interactions
  type MaterialData = {
    name: string;
    type: string;
    subject: string;
    classId: string;
    className?: string;
    description: string;
    url: string;
  };

  const handleAddNewMaterial = (newMaterialData: MaterialData) => {
    const newId = `M${String(materials.length + 1).padStart(3, '0')}`; // Simple ID generation
    setMaterials([
      ...materials,
      {
        id: newId,
        ...newMaterialData,
        className: newMaterialData.className ?? '',
        uploadedDate: new Date().toISOString().split('T')[0],
      }
    ]);
    setShowFormModal(false);
  };

  const handleEditMaterial = (updatedMaterialData: MaterialData & { id: string }) => {
    setMaterials(materials.map(m =>
      m.id === updatedMaterialData.id
        ? { ...m, ...updatedMaterialData, uploadedDate: m.uploadedDate }
        : m
    ));
    setShowFormModal(false);
    setEditingMaterial(null);
  };

  const handleDeleteMaterial = (materialId: string) => {
    if (confirm("Are you sure you want to delete this material?")) { // Use custom modal in real app
      setMaterials(materials.filter(m => m.id !== materialId));
    }
  };

  const handleViewMaterial = (url: string) => {
    if (url) {
      window.open(url, '_blank'); // Open in new tab
    } else {
      alert("Material URL is not available.");
    }
  };


  // --- Material Form Modal ---
  type MaterialFormModalProps = {
    materialData: any;
    onClose: () => void;
    onSave: (data: any) => void;
    isEdit?: boolean;
  };

  const MaterialFormModal: React.FC<MaterialFormModalProps> = ({ materialData, onClose, onSave, isEdit = false }) => {
    const [formData, setFormData] = useState(materialData || {
      name: '',
      type: uniqueMaterialTypes[0] || 'PDF', // Default to first type or PDF
      subject: '',
      classId: '',
      description: '',
      url: '',
    });

    // Set default class if available and not in edit mode
    React.useEffect(() => {
        if (!isEdit && sampleClassesForMaterials.length > 0 && !formData.classId) {
            setFormData((prev: typeof formData) => ({ ...prev, classId: sampleClassesForMaterials[0].id }));
        }
    }, [isEdit, formData.classId]);

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target;
      setFormData((prev: typeof formData) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      // Add className before saving
      const selectedClass = sampleClassesForMaterials.find(c => c.id === formData.classId);
      onSave({ ...formData, className: selectedClass ? selectedClass.name : '' });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">{isEdit ? `Edit Material: ${formData.name}` : 'Upload New Material'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Material Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">Material Type</label>
              <select name="type" id="type" value={formData.type} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                <option value="PDF">PDF Document</option>
                <option value="Video">Video Link</option>
                <option value="Link">External Link</option>
                <option value="Image">Image</option>
              </select>
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
              <input type="text" name="subject" id="subject" value={formData.subject} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="classId" className="block text-sm font-medium text-gray-700">Associated Class (Optional)</label>
              <select name="classId" id="classId" value={formData.classId} onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                <option value="">-- Select Class --</option>
                {sampleClassesForMaterials.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"></textarea>
            </div>
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">File/Link URL</label>
              <input type="text" name="url" id="url" value={formData.url} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
              {/* In a real app, this would be a file upload input */}
              <p className="mt-1 text-xs text-gray-500">For file types (PDF, Image), input a direct link to the file. For Video/Link, input the URL.</p>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Cancel
              </button>
              <button type="submit"
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {isEdit ? 'Save Changes' : 'Upload Material'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  // --- End Modal Component ---

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Teaching Materials
            <span className="ml-2 text-green-600 text-base sm:text-xl">📚</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Organize and access all your teaching resources.</p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-blue-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <DocumentTextIcon className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Materials</p>
              <h2 className="text-3xl font-bold text-gray-800">{totalMaterials}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-green-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <AcademicCapIcon className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Materials by Type</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                {uniqueMaterialTypes.map(type => (
                  <span key={type} className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-purple-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <CalendarDaysIcon className="h-7 w-7 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Recently Added</p>
              <h2 className="text-3xl font-bold text-gray-800">
                {materials.length > 0 ? new Date(materials[0].uploadedDate).toLocaleDateString() : 'N/A'}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Materials List Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-indigo-500" /> All Teaching Materials
          </h3>
          <button
            onClick={() => { setEditingMaterial(null); setShowFormModal(true); }} // Clear editing state for new
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm
                       hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowUpOnSquareIcon className="h-5 w-5" /> Upload New Material
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, subject, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Classes</option>
              {sampleClassesForMaterials.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Types</option>
              {uniqueMaterialTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Materials Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded On</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMaterials.length > 0 ? (
                filteredMaterials.map((material) => (
                  <tr key={material.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{material.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-2">
                      {getMaterialIcon(material.type)} {material.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.className || 'General'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(material.uploadedDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewMaterial(material.url)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                          title="View Material"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { setEditingMaterial(material); setShowFormModal(true); }}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          title="Edit Material"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMaterial(material.id)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                          title="Delete Material"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No teaching materials found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showFormModal && <MaterialFormModal materialData={editingMaterial} onClose={() => setShowFormModal(false)} onSave={editingMaterial ? handleEditMaterial : handleAddNewMaterial} isEdit={!!editingMaterial} />}
    </div>
  );
}
