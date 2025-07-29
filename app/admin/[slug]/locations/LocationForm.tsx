"use client";

import { CodeBracketIcon, HomeIcon, InformationCircleIcon, LinkIcon, MagnifyingGlassCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useState, useEffect, useMemo, useCallback } from 'react';


// --- Helper Functions ---
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove special chars
    .replace(/\s+/g, '-')         // replace spaces with hyphens
    .replace(/-+/g, '-');          // remove consecutive hyphens
};

// --- Type Definitions ---
interface Location {
  id: string;
  name: string;
  slug: string;
  // ... other properties from your Location model
  [key: string]: any;
}

interface LocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  location: Location | null;     // The location to edit
  parent: Location | null;       // The parent for a new location
  allLocations: Location[];      // For the parent dropdown
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
  localization: {},
  attributes: {},
};


// --- The Enhanced Location Form Modal Component ---
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

  const isEditMode = !!location;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        // Populate form for editing
        setFormData({
          ...initialFormData,
          ...location,
          parentId: location.parentId || '',
          metaKeywords: location.metaKeywords?.join(', ') || '',
          localization: location.localization || {},
          attributes: location.attributes || {},
        });
        setIsSlugManuallyEdited(true); // Assume slug is final in edit mode
      } else {
        // Reset for creating, potentially with a parent
        setFormData({
          ...initialFormData,
          parentId: parent?.id || '',
        });
        setIsSlugManuallyEdited(false);
      }
      setActiveTab('general');
      setError(null);
    }
  }, [isOpen, location, parent, isEditMode]);

  // Auto-slug generation
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
      const url = isEditMode ? `/api/admin/locations/${location.id}` : '/api/admin/locations';
      const method = isEditMode ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'An unknown error occurred.');
      }

      onSuccess(); // Trigger parent to refetch and close
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const title = isEditMode ? `Editing: ${location.name}` : 'Create New Location';
  const parentContext = !isEditMode && parent ? `Adding to: ${parent.name}` : null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <header className="flex justify-between items-center p-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
            {parentContext && <p className="text-sm text-slate-500">{parentContext}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100">
            <XMarkIcon className='w-5 h-5' />
          </button>
        </header>

        {/* Tab Navigation */}
        <nav className="flex border-b border-slate-200 px-4">
          <TabButton icon={InformationCircleIcon} label="General" isActive={activeTab === 'general'} onClick={() => setActiveTab('general')} />
          <TabButton icon={HomeIcon} label="Address" isActive={activeTab === 'address'} onClick={() => setActiveTab('address')} />
          <TabButton icon={MagnifyingGlassCircleIcon} label="SEO" isActive={activeTab === 'seo'} onClick={() => setActiveTab('seo')} />
          <TabButton icon={CodeBracketIcon} label="Advanced" isActive={activeTab === 'advanced'} onClick={() => setActiveTab('advanced')} />
        </nav>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto">
          <div className="p-6 space-y-6">
            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">{error}</div>}

            {activeTab === 'general' && (
              <div className="space-y-4 animate-fade-in">
                <Input name="name" label="Name" value={formData.name} onChange={handleFormChange} required />
                <Input name="slug" label="Slug" value={formData.slug} onChange={handleFormChange} required icon={LinkIcon} />
                <Select name="parentId" label="Parent Location" value={formData.parentId} onChange={handleFormChange}>
                  <option value="">-- No Parent --</option>
                  {allLocations.filter(loc => loc.id !== location?.id).map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </Select>
                <Textarea name="description" label="Description" value={formData.description} onChange={handleFormChange} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <Select name="status" label="Status" value={formData.status} onChange={handleFormChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </Select>
                  <Switch name="visible" label="Visible" checked={formData.visible} onChange={handleFormChange} />
                </div>
              </div>
            )}
            {activeTab === 'address' && (
              <div className="space-y-4 animate-fade-in">
                 <Input name="addressLine1" label="Address Line 1" value={formData.addressLine1} onChange={handleFormChange} />
                 <Input name="addressLine2" label="Address Line 2" value={formData.addressLine2} onChange={handleFormChange} />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input name="city" label="City" value={formData.city} onChange={handleFormChange} />
                    <Input name="state" label="State / Province" value={formData.state} onChange={handleFormChange} />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input name="postalCode" label="Postal Code" value={formData.postalCode} onChange={handleFormChange} />
                    <Input name="country" label="Country" value={formData.country} onChange={handleFormChange} />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                    <Input name="latitude" label="Latitude" type="number" value={formData.latitude} onChange={handleFormChange} />
                    <Input name="longitude" label="Longitude" type="number" value={formData.longitude} onChange={handleFormChange} />
                 </div>
              </div>
            )}
            {activeTab === 'seo' && (
              <div className="space-y-4 animate-fade-in">
                  <Input name="seoTitle" label="SEO Title" value={formData.seoTitle} onChange={handleFormChange} />
                  <Textarea name="seoDescription" label="SEO Description" value={formData.seoDescription} onChange={handleFormChange} />
                  <Input name="metaKeywords" label="Meta Keywords (comma-separated)" value={formData.metaKeywords} onChange={handleFormChange} />
              </div>
            )}
            {activeTab === 'advanced' && (
              <div className="space-y-4 animate-fade-in">
                  <JsonTextarea name="localization" label="Localization" value={formData.localization} onChange={handleFormChange} />
                  <JsonTextarea name="attributes" label="Attributes" value={formData.attributes} onChange={handleFormChange} />
                  <Input name="sortOrder" label="Sort Order" type="number" value={formData.sortOrder} onChange={handleFormChange} />
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <footer className="flex justify-end items-center gap-3 p-4 border-t border-slate-200 bg-slate-50/50">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed">
              {loading ? 'Saving...' : (isEditMode ? 'Update Location' : 'Create Location')}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

// --- Reusable Form Field Sub-Components ---

const TabButton = ({ icon: Icon, label, isActive, ...props }: any) => (
  <button type="button" {...props} className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${isActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}>
    <Icon  className='w-5 h-5' />
    {label}
  </button>
);

const Input = ({ label, name, icon: Icon, ...props }: any) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-600 mb-1">{label}{props.required && <span className="text-red-500 ml-1">*</span>}</label>
    <div className="relative">
      {Icon && <Icon  className='w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' />}
      <input id={name} name={name} {...props} className={`block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${Icon ? 'pl-9' : ''}`} />
    </div>
  </div>
);

const Select = ({ label, name, children, ...props }: any) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    <select id={name} name={name} {...props} className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
      {children}
    </select>
  </div>
);

const Textarea = ({ label, name, ...props }: any) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    <textarea id={name} name={name} rows={3} {...props} className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
  </div>
);

const JsonTextarea = ({ label, name, value, onChange }: any) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    <textarea
      id={name}
      name={name}
      value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
      onChange={onChange}
      rows={5}
      className="block w-full p-3 font-mono text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    ></textarea>
  </div>
);

const Switch = ({ label, name, checked, onChange }: any) => (
  <div className="flex items-center justify-between h-full pt-2">
    <label htmlFor={name} className="text-sm font-medium text-slate-600">{label}</label>
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange({ target: { name, type: 'checkbox', checked: !checked } })} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${checked ? 'bg-blue-600' : 'bg-slate-300'}`}>
      <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);