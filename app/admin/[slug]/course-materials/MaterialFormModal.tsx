import React, { useState, useEffect, useRef } from 'react';
import {
  XMarkIcon,
  DocumentTextIcon,
  PlayCircleIcon,
  LinkIcon,
  PhotoIcon,
  MusicalNoteIcon,
  FolderIcon,
  UserIcon,
  Bars3BottomLeftIcon,
  HashtagIcon,
  BookOpenIcon,
  CloudArrowUpIcon, // New icon for course selection
} from '@heroicons/react/24/outline';

// Assuming types are imported from MaterialsGlobalClient.tsx
export type CourseMaterialType = {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description?: string | null;
  fileUrl?: string | null;
  linkUrl?: string | null;
  type: 'DOCUMENT' | 'VIDEO' | 'LINK' | 'IMAGE' | 'AUDIO' | 'OTHER';
  uploadedById: string;
  uploadedByName?: string;
  uploadedByEmail?: string;
  createdAt: string;
  updatedAt: string;
};

export type EducatorOption = {
  id: string;
  name: string;
  email: string;
};

export type CourseOption = { // New type for course selection in modal
  id: string;
  title: string;
  instructorName?: string;
  academicLevels: { id: string; name: string }[];
};

interface MaterialFormModalProps {
  apiBaseUrl: string;
  materialData?: CourseMaterialType | null;
  onClose: () => void;
  onSave: (data: Omit<CourseMaterialType, 'id' | 'courseTitle' | 'uploadedByName' | 'uploadedByEmail' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<void>;
  isLoading: boolean;
  courseId: string; // The ID of the course this material belongs to (pre-filled for edit, or empty for new)
  allEducators: EducatorOption[];
  allCourses: CourseOption[]; // NEW: All available courses for selection
}

////////////////////////////////////////////////////////////////////////////////
// Upload helper for getting signed URLs and uploading files
////////////////////////////////////////////////////////////////////////////////
// utils/uploadFiles.ts
export async function uploadFiles(
  apiBaseUrl: string,
  files: File[],
  type: "image" | "video" | "book",
  onProgress?: (progress: number, file: File) => void
): Promise<{ url: string; key: string; contentType: string }[]> {
  if (!files?.length) return [];

  const uploads = files.map(async (file) => {
    try {
      // ✅ Step 1: Request a signed upload URL from your API
      const res = await fetch(
        `${apiBaseUrl}/upload-url?filename=${encodeURIComponent(file.name)}&type=${type}&contentType=${encodeURIComponent(file.type)}`
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to get signed URL: ${text}`);
      }

      const { uploadUrl, publicUrl, key, contentType } = await res.json();

      // ✅ Step 2: Upload directly to S3
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress, file);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) resolve();
          else reject(new Error(`Upload failed for ${file.name}: ${xhr.status}`));
        };

        xhr.onerror = () => reject(new Error(`Network error during upload for ${file.name}`));
        xhr.send(file);
      });

      // console.log(`✅ Uploaded: ${file.name} (${contentType}) → ${publicUrl}`);
      return { url: publicUrl, key, contentType };
    } catch (err) {
      // console.error("❌ Upload error:", err);
      throw err;
    }
  });

  return Promise.all(uploads);
}

const MaterialFormModal: React.FC<MaterialFormModalProps> = ({ apiBaseUrl, materialData, onClose, onSave, isLoading, courseId, allEducators, allCourses }) => {
  const [formData, setFormData] = useState({
    id: materialData?.id || '',
    courseId: materialData?.courseId || courseId || '', // Use materialData.courseId first, then prop courseId
    title: materialData?.title || '',
    description: materialData?.description || '',
    fileUrl: materialData?.fileUrl || '',
    linkUrl: materialData?.linkUrl || '',
    type: materialData?.type || 'DOCUMENT',
    uploadedById: materialData?.uploadedById || '',
    });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (materialData) {
      setFormData({
        id: materialData.id,
        courseId: materialData.courseId,
        title: materialData.title,
        description: materialData.description || '',
        fileUrl: materialData.fileUrl || '',
        linkUrl: materialData.linkUrl || '',
        type: materialData.type,
        uploadedById: materialData.uploadedById,
      });
    } else {
      setFormData({
        id: '', courseId: courseId || '', title: '', description: '', fileUrl: '', linkUrl: '', type: 'DOCUMENT', uploadedById: ''
      });
    }
  }, [materialData, courseId]); // Depend on courseId prop as well

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setFormData(prev => ({ ...prev, linkUrl: '' })); // Clear link if file is chosen
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadProgress(0);

    try {

      let finalFileUrl = formData.fileUrl;

      // 1. Handle File Upload if a file was selected
      if (selectedFile) {
        // Map Material Type to Upload Helper Type
        const uploadType = 
          formData.type === 'IMAGE' ? 'image' : 
          formData.type === 'VIDEO' ? 'video' : 'book';

        const uploadResults = await uploadFiles(
          apiBaseUrl, 
          [selectedFile], 
          uploadType, 
          (progress) => setUploadProgress(progress)
        );
        
        if (uploadResults.length > 0) {
          finalFileUrl = uploadResults[0].url;
        }
      }

      // 2. Validation
      if (!formData.linkUrl && !finalFileUrl) {
        alert("Please provide either a Link URL or upload a File.");
        return;
      }

    // Basic validation for fileUrl/linkUrl based on type
    // if (formData.type === 'DOCUMENT' || formData.type === 'IMAGE' || formData.type === 'AUDIO') {
    //   if (!formData.fileUrl && !formData.linkUrl) {
    //     alert("For selected material type, either File URL or Link URL is required.");
    //     return;
    //   }
    //   if (formData.fileUrl && formData.linkUrl) {
    //     alert("Cannot provide both File URL and Link URL for this material type.");
    //     return;
    //   }
    // } else if (formData.type === 'VIDEO' || formData.type === 'LINK') {
    //   if (!formData.linkUrl && !formData.fileUrl) {
    //     alert("For selected material type, Link URL is typically required.");
    //     return;
    //   }
    //   if (formData.fileUrl && formData.linkUrl) {
    //     alert("Cannot provide both File URL and Link URL for this material type.");
    //     return;
    //   }
    // }

    // Ensure courseId is selected for new materials
      if (!formData.courseId) {
        alert("Please select a Course for this material.");
        return;
      }
      if (!formData.uploadedById) {
        alert("Please select an Uploader for this material.");
        return;
      }      

      // 3. Save to Parent
      await onSave({ 
        ...formData, 
        fileUrl: finalFileUrl 
      });

    } catch (err) {
      alert("Error during upload/save. Please try again.");
      //  console.error(err);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const materialTypeOptions = [
    { value: 'DOCUMENT', label: 'Document', icon: <DocumentTextIcon className="h-5 w-5 text-blue-500" /> },
    { value: 'VIDEO', label: 'Video', icon: <PlayCircleIcon className="h-5 w-5 text-red-500" /> },
    { value: 'LINK', label: 'Link', icon: <LinkIcon className="h-5 w-5 text-green-500" /> },
    { value: 'IMAGE', label: 'Image', icon: <PhotoIcon className="h-5 w-5 text-purple-500" /> },
    { value: 'AUDIO', label: 'Audio', icon: <MusicalNoteIcon className="h-5 w-5 text-orange-500" /> },
    { value: 'OTHER', label: 'Other', icon: <FolderIcon className="h-5 w-5 text-gray-500" /> },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl transform transition-all duration-300 scale-100 opacity-100 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full transition-colors duration-200"
          title="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4 border-gray-200">
          {materialData ? `Edit Material: ${materialData.title}` : 'Add New Course Material'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Material Details */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <HashtagIcon className="h-6 w-6 text-indigo-500" /> Material Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"></textarea>
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Material Type <span className="text-red-500">*</span></label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {materialTypeOptions.find(opt => opt.value === formData.type)?.icon || <FolderIcon className="h-5 w-5 text-gray-400" />}
                  </div>
                  <select name="type" id="type" value={formData.type} onChange={handleChange} required
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white">
                    {materialTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="uploadedById" className="block text-sm font-medium text-gray-700 mb-1">Uploaded By <span className="text-red-500">*</span></label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select name="uploadedById" id="uploadedById" value={formData.uploadedById} onChange={handleChange} required
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white">
                    <option value="">-- Select Uploader --</option>
                    {allEducators.map(educator => (
                      <option key={educator.id} value={educator.id}>{educator.name} ({educator.email})</option>
                    ))}
                  </select>
                </div>
              </div>
 
              <div className="space-y-4">
                {/* File Upload Logic */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-indigo-500 transition-colors"
                  >
                    <div className="space-y-1 text-center">
                      <CloudArrowUpIcon className="mx-auto h-10 w-10 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <span className="text-indigo-600 font-medium">Click to upload</span>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {selectedFile ? `Selected: ${selectedFile.name}` : "Images, Videos, PDFs up to 50MB"}
                      </p>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept={formData.type === 'IMAGE' ? 'image/*' : formData.type === 'VIDEO' ? 'video/*' : '*/*'}
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-300"></span></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-blue-50 px-2 text-gray-500 font-bold">OR</span></div>
                </div>

                {/* External Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">External URL</label>
                  <input 
                    type="url" 
                    name="linkUrl" 
                    value={formData.linkUrl} 
                    onChange={handleChange}
                    placeholder="https://..."
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
              </div>

              {/* Progress Bar */}
              {(isUploading && uploadProgress  > 0 || isLoading) && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              {/* <div className="md:col-span-2">
                <label htmlFor="fileUrl" className="block text-sm font-medium text-gray-700 mb-1">File URL (for Documents, Images, Audio)</label>
                <input type="url" name="fileUrl" id="fileUrl" value={formData.fileUrl} onChange={handleChange}
                  placeholder="https://example.com/document.pdf"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-700 mb-1">Link URL (for Videos, External Links)</label>
                <input type="url" name="linkUrl" id="linkUrl" value={formData.linkUrl} onChange={handleChange}
                  placeholder="https://www.youtube.com/watch?v=example"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
              </div> */}
            </div>
          </div>

          {/* Course Assignment (Only for new materials or if allowed to change) */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpenIcon className="h-6 w-6 text-green-500" /> Assign to Course <span className="text-red-500">*</span>
            </h3>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BookOpenIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select name="courseId" id="courseId" value={formData.courseId} onChange={handleChange} required
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-base bg-white">
                <option value="">-- Select Course --</option>
                {allCourses.map(course => (
                  <option key={course.id} value={course.id}>{course.title} (Instructor: {course.instructorName || 'N/A'})</option>
                ))}
              </select>
            </div>
            {!materialData && (
              <p className="mt-2 text-sm text-gray-600">
                This material will be added to the selected course.
              </p>
            )}
          </div>


          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 border border-transparent rounded-lg text-base font-medium text-white shadow-md hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center gap-2"
              disabled={isLoading || isUploading}
            >
              {(isUploading || isLoading) ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (materialData ? 'Save Changes' : 'Add Material')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaterialFormModal;
