"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  CodeBracketIcon, 
  HomeIcon, 
  InformationCircleIcon, 
  LinkIcon, 
  MagnifyingGlassCircleIcon, 
  XMarkIcon,
  CloudArrowUpIcon,
  PhotoIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// --- S3 UPLOAD HELPER ---
async function uploadFiles(
  files: File[],
  type: "image" | "video" | "book",
  onProgress?: (progress: number, file: File) => void
): Promise<{ url: string; key: string; contentType: string }[]> {
  if (!files?.length) return [];

  const uploads = files.map(async (file) => {
    const res = await fetch(
      `${apiBaseUrl}/upload-url?filename=${encodeURIComponent(file.name)}&type=${type}&contentType=${encodeURIComponent(file.type)}`
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to get signed URL: ${text}`);
    }

    const { uploadUrl, publicUrl, key, contentType } = await res.json();

    const xhr = new XMLHttpRequest();
    await new Promise<void>((resolve, reject) => {
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100), file);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) resolve();
        else reject(new Error(`Upload failed for ${file.name}: ${xhr.status}`));
      };

      xhr.onerror = () => reject(new Error(`Network error for ${file.name}`));
      xhr.send(file);
    });

    return { url: publicUrl, key, contentType };
  });

  return Promise.all(uploads);
}

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') 
    .replace(/\s+/g, '-')         
    .replace(/-+/g, '-');          
};

interface Location {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  imageUrl?: string | null;
  metaKeywords?: string[] | null;
  localization?: any;
  attributes?: any;
  [key: string]: any;
}

interface LocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  location: Location | null;     
  parent: Location | null;       
  allLocations: Location[];      
}

const initialFormData = {
  name: '',
  slug: '',
  description: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  latitude: '',
  longitude: '',
  seoTitle: '',
  seoDescription: '',
  metaKeywords: '',
  sortOrder: 0,
  visible: true,
  status: 'active',
  parentId: '',
  imageUrl: '',
  localization: {},
  attributes: {},
};

export function LocationFormModal({
  isOpen,
  onClose,
  onSuccess,
  location,
  parent,
  allLocations
}: LocationFormModalProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [activeTab, setActiveTab] = useState<'general' | 'address' | 'seo' | 'advanced'>('general');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Media upload tracking states
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!location;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setFormData({
          ...initialFormData,
          ...location,
          parentId: location.parentId || '',
          metaKeywords: Array.isArray(location.metaKeywords) ? location.metaKeywords.join(', ') : '',
          localization: location.localization || {},
          attributes: location.attributes || {},
          imageUrl: location.imageUrl || '',
        });
        setIsSlugManuallyEdited(true);
      } else {
        setFormData({
          ...initialFormData,
          parentId: parent?.id || '',
        });
        setIsSlugManuallyEdited(false);
      }
      setActiveTab('general');
      setError(null);
      setUploadProgress(0);
      setUploading(false);
    }
  }, [isOpen, location, parent, isEditMode]);

  useEffect(() => {
    if (!isSlugManuallyEdited && !isEditMode) {
      setFormData(prev => ({ ...prev, slug: generateSlug(prev.name) }));
    }
  }, [formData.name, isSlugManuallyEdited, isEditMode]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isChecked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    if (name === 'slug') {
      setIsSlugManuallyEdited(true);
    }

    setFormData(prev => ({
      ...prev,
      [name]: isChecked !== undefined ? isChecked : value
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);
    setUploadProgress(1);

    try {
      const uploadedMedia = await uploadFiles([files[0]], "image", (progress) => {
        setUploadProgress(progress);
      });

      if (uploadedMedia && uploadedMedia.length > 0) {
        setFormData(prev => ({ ...prev, imageUrl: uploadedMedia[0].url }));
      }
    } catch (err: any) {
      setError(`Media Engine rejection: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      metaKeywords: formData.metaKeywords ? formData.metaKeywords.split(',').map((kw: string) => kw.trim()) : [],
      parentId: formData.parentId === '' ? null : formData.parentId,
      sortOrder: Number(formData.sortOrder) || 0,
    };
    
    try {
      const url = isEditMode ? `${apiBaseUrl}/admin/locations/${location.id}` : `${apiBaseUrl}/admin/locations`;
      const method = isEditMode ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Server encountered an unexpected operational failure.');
      }

      onSuccess(); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/40 dark:bg-black/70 flex items-center justify-center p-0 sm:p-4 z-50 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl h-full sm:h-auto sm:max-h-[85vh] sm:rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl flex flex-col overflow-hidden transition-all duration-300">
        
        {/* Modal Header */}
        <header className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              {isEditMode ? `Modify Coordinate: ${location.name}` : 'Establish Infrastructure Location'}
            </h2>
            {!isEditMode && parent && (
              <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">
                Nesting node inside parent: {parent.name}
              </p>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <XMarkIcon className='w-5 h-5 stroke-[2]' />
          </button>
        </header>

        {/* Dynamic Horizontal/Scrollable Navigation Tabs */}
        <nav className="flex border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap px-4">
          <TabButton icon={InformationCircleIcon} label="General Setup" isActive={activeTab === 'general'} onClick={() => setActiveTab('general')} />
          <TabButton icon={HomeIcon} label="Mailing & Address" isActive={activeTab === 'address'} onClick={() => setActiveTab('address')} />
          <TabButton icon={MagnifyingGlassCircleIcon} label="SEO Framework" isActive={activeTab === 'seo'} onClick={() => setActiveTab('seo')} />
          <TabButton icon={CodeBracketIcon} label="Localization & Data" isActive={activeTab === 'advanced'} onClick={() => setActiveTab('advanced')} />
        </nav>

        {/* Operational Frame Body */}
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto bg-slate-50/30 dark:bg-slate-950/10">
          <div className="p-5 sm:p-6 space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-4 text-xs font-medium text-red-700 dark:text-red-400">
                <span className="font-bold block mb-0.5">Operational Failure Block</span>
                {error}
              </div>
            )}

            {/* General Tab View */}
            {activeTab === 'general' && (
              <div className="space-y-5 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input name="name" label="Hub Location Name" value={formData.name} onChange={handleFormChange} placeholder="e.g. Central Dispatch Unit" required />
                  <Input name="slug" label="URL Route Slug" value={formData.slug} onChange={handleFormChange} required icon={LinkIcon} placeholder="central-dispatch-unit" />
                </div>

                <Select name="parentId" label="Hierarchical Structural Parent Node" value={formData.parentId} onChange={handleFormChange}>
                  <option value="">-- Standalone Absolute Root Level --</option>
                  {allLocations.filter(loc => loc.id !== location?.id).map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </Select>

                {/* S3 File Upload Architecture Interface Area */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Representative Node Artwork / Image</label>
                  {formData.imageUrl ? (
                    <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-w-md bg-slate-100 dark:bg-slate-800 shadow-sm transition-all">
                      <img src={formData.imageUrl} alt="Uploaded Location Frame" className="w-full h-44 object-cover object-center" />
                      <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="p-2 bg-red-600 rounded-xl text-white hover:bg-red-700 font-semibold text-xs flex items-center gap-1.5 shadow"
                        >
                          <TrashIcon className="w-4 h-4" /> Remove Media
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                        uploading 
                          ? "border-indigo-400 bg-indigo-50/10 dark:border-indigo-500/30 dark:bg-indigo-950/10" 
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                      }`}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept="image/*" 
                        className="hidden" 
                        disabled={uploading}
                      />
                      
                      {uploading ? (
                        <div className="w-full max-w-xs space-y-3">
                          <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                            <span className="animate-pulse">Uploading asset stream...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl mb-3 text-slate-400 dark:text-slate-500">
                            <CloudArrowUpIcon className="w-6 h-6" />
                          </div>
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Click or Drag image here to upload</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">PNG, JPG or WEBP formats accepted via S3 pipeline</p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <Textarea name="description" label="System Scope Description" value={formData.description} onChange={handleFormChange} placeholder="Enter clean summaries outlining boundaries and internal capacity constraints." />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <Select name="status" label="Current Node Operational Status" value={formData.status} onChange={handleFormChange}>
                    <option value="active">Active Production</option>
                    <option value="inactive">Maintenance Inactive</option>
                    <option value="draft">Structural Draft</option>
                  </Select>
                  <Switch name="visible" label="Global Platform Visibility" checked={formData.visible} onChange={handleFormChange} />
                </div>
              </div>
            )}

            {/* Address Tab View */}
            {activeTab === 'address' && (
              <div className="space-y-5 animate-fade-in">
                <Input name="addressLine1" label="Primary Line Address" value={formData.addressLine1} onChange={handleFormChange} placeholder="Suite, floor, or complex coordinates" />
                <Input name="addressLine2" label="Secondary Complementary Address" value={formData.addressLine2} onChange={handleFormChange} placeholder="Apartment, sector, block, or building info" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input name="city" label="City Hub" value={formData.city} onChange={handleFormChange} placeholder="e.g. Nairobi" />
                  <Input name="state" label="State / Province / County" value={formData.state} onChange={handleFormChange} placeholder="e.g. Nairobi County" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input name="postalCode" label="ZIP / Postal Code System" value={formData.postalCode} onChange={handleFormChange} placeholder="00100" />
                  <Input name="country" label="Nation State/Country" value={formData.country} onChange={handleFormChange} placeholder="Kenya" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <Input name="latitude" label="Precision GIS Latitude" type="number" step="any" value={formData.latitude} onChange={handleFormChange} placeholder="-1.2921" />
                  <Input name="longitude" label="Precision GIS Longitude" type="number" step="any" value={formData.longitude} onChange={handleFormChange} placeholder="36.8219" />
                </div>
              </div>
            )}

            {/* SEO Framework Tab View */}
            {activeTab === 'seo' && (
              <div className="space-y-5 animate-fade-in">
                <Input name="seoTitle" label="Custom Indexing Header SEO Title" value={formData.seoTitle} onChange={handleFormChange} placeholder="Meta target lookup overrides" />
                <Textarea name="seoDescription" label="Custom Meta SEO Snippet Description" value={formData.seoDescription} onChange={handleFormChange} placeholder="Summary configurations mapped directly into browser index records." />
                <Input name="metaKeywords" label="Target Keyword Strings (comma-separated lists)" value={formData.metaKeywords} onChange={handleFormChange} placeholder="distribution, logistics, supply-chain" />
              </div>
            )}

            {/* Advanced Tab View */}
            {activeTab === 'advanced' && (
              <div className="space-y-5 animate-fade-in">
                <JsonTextarea name="localization" label="Localization Schema Object (JSON)" value={formData.localization} onChange={handleFormChange} />
                <JsonTextarea name="attributes" label="Dynamic Attributes Properties Mapping (JSON)" value={formData.attributes} onChange={handleFormChange} />
                <Input name="sortOrder" label="Structural Render Priority Sorting Order Weight" type="number" value={formData.sortOrder} onChange={handleFormChange} />
              </div>
            )}
          </div>

          {/* Modal Action Footer Controls */}
          <footer className="sticky bottom-0 flex justify-end items-center gap-3 p-4 border-t border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2.5 bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-700/50 shadow-sm transition-all"
            >
              Abandone Sync
            </button>
            <button 
              type="submit" 
              disabled={loading || uploading} 
              className="px-5 py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold text-xs rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed shadow transition-all active:scale-95"
            >
              {loading ? 'Committing Changes...' : (isEditMode ? 'Update Infrastructure Hub' : 'Deploy Location Node')}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

// --- Reusable Modern Custom Sub-Form Input Fields ---

const TabButton = ({ icon: Icon, label, isActive, ...props }: any) => (
  <button 
    type="button" 
    {...props} 
    className={`flex items-center gap-2 px-4 py-3.5 text-xs font-bold border-b-2 transition-all relative outline-none shrink-0 ${
      isActive 
        ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white' 
        : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
    }`}
  >
    <Icon className='w-4 h-4' />
    {label}
  </button>
);

const Input = ({ label, name, icon: Icon, ...props }: any) => (
  <div className="w-full">
    <label htmlFor={name} className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
      {label}{props.required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className='w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500' />}
      <input 
        id={name} 
        name={name} 
        {...props} 
        className={`block w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 focus:border-slate-900 dark:focus:border-white transition-all shadow-sm ${Icon ? 'pl-10' : ''}`} 
      />
    </div>
  </div>
);

const Select = ({ label, name, children, ...props }: any) => (
  <div className="w-full">
    <label htmlFor={name} className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">{label}</label>
    <select 
      id={name} 
      name={name} 
      {...props} 
      className="block w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 focus:border-slate-900 dark:focus:border-white shadow-sm transition-all"
    >
      {children}
    </select>
  </div>
);

const Textarea = ({ label, name, ...props }: any) => (
  <div className="w-full">
    <label htmlFor={name} className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">{label}</label>
    <textarea 
      id={name} 
      name={name} 
      rows={3} 
      {...props} 
      className="block w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 focus:border-slate-900 dark:focus:border-white shadow-sm transition-all"
    ></textarea>
  </div>
);

const JsonTextarea = ({ label, name, value, onChange }: any) => (
  <div className="w-full">
    <label htmlFor={name} className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">{label}</label>
    <textarea
      id={name}
      name={name}
      value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
      onChange={onChange}
      rows={4}
      className="block w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 focus:border-slate-900 dark:focus:border-white shadow-inner transition-all"
    ></textarea>
  </div>
);

const Switch = ({ label, name, checked, onChange }: any) => (
  <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl w-full shadow-sm">
    <label htmlFor={name} className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</label>
    <button 
      type="button" 
      role="switch" 
      aria-checked={checked} 
      onClick={() => onChange({ target: { name, type: 'checkbox', checked: !checked } })} 
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors outline-none ${checked ? 'bg-slate-900 dark:bg-white' : 'bg-slate-200 dark:bg-slate-800'}`}
    >
      <span className={`inline-block w-4 h-4 transform rounded-full transition-transform ${checked ? 'translate-x-6 bg-white dark:bg-slate-900' : 'translate-x-1 bg-white dark:bg-slate-400'}`} />
    </button>
  </div>
);