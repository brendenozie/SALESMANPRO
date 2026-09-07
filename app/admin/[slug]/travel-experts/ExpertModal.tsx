"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { BriefcaseIcon, GlobeAltIcon, EnvelopeIcon, PhoneIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import toast from 'react-hot-toast';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";;//process.env.NEXT_PUBLIC_API_URL || "/api";

// Define the ExpertData interface to match the expected API response
export interface ExpertData {
  id?: string;
  userId?: string;
  name: string | null;
  email: string;
  phone: string | null;
  specialty: string;
  experienceYears: number;
  travelsCompleted: number;
  photoUrl: string | null;
  bio: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  // Add the new expertise field
  expertise?: string[];
}

interface ExpertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expert: ExpertData) => void;
  expert?: ExpertData | null;
  slug: string;
}

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const EXPERT_STATUSES = ['ACTIVE', 'INACTIVE', 'PENDING'];
// A list of available expertise options for the multi-select dropdown.
const EXPERTISE_OPTIONS = [
  'ADVENTURE_TRAVEL',
  'FAMILY_VACATIONS',
  'LUXURY_TRAVEL',
  'ECOTOURISM',
  'CRUISES',
  'CULTURAL_TOURS',
  'HONEYMOONS',
];

const ExpertModal: React.FC<ExpertModalProps> = ({ isOpen, onClose, onSave, expert, slug }) => {
  const [name, setName] = useState(expert?.name || '');
  const [email, setEmail] = useState(expert?.email || '');
  const [phone, setPhone] = useState(expert?.phone || '');
  const [specialty, setSpecialty] = useState(expert?.specialty || '');
  const [experienceYears, setExperienceYears] = useState(expert?.experienceYears || 0);
  const [travelsCompleted, setTravelsCompleted] = useState(expert?.travelsCompleted || 0);
  const [photoUrl, setPhotoUrl] = useState(expert?.photoUrl || '');
  const [bio, setBio] = useState(expert?.bio || '');
  const [contactEmail, setContactEmail] = useState(expert?.contactEmail || '');
  const [contactPhone, setContactPhone] = useState(expert?.contactPhone || '');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'PENDING'>(expert?.status || 'ACTIVE');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Add state for expertise
  const [expertise, setExpertise] = useState<string[]>(expert?.expertise || []);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (expert) {
        setName(expert.name || '');
        setEmail(expert.email || '');
        setPhone(expert.phone || '');
        setSpecialty(expert.specialty || '');
        setExperienceYears(expert.experienceYears || 0);
        setTravelsCompleted(expert.travelsCompleted || 0);
        setPhotoUrl(expert.photoUrl || '');
        setBio(expert.bio || '');
        setContactEmail(expert.contactEmail || '');
        setContactPhone(expert.contactPhone || '');
        setStatus(expert.status || 'ACTIVE');
        setPassword('');
        setConfirmPassword('');
        setExpertise(expert.expertise || []);
      } else {
        setName('');
        setEmail('');
        setPhone('');
        setSpecialty('');
        setExperienceYears(0);
        setTravelsCompleted(0);
        setPhotoUrl('');
        setBio('');
        setContactEmail('');
        setContactPhone('');
        setStatus('ACTIVE');
        setPassword('');
        setConfirmPassword('');
        setExpertise([]);
      }
    }
  }, [isOpen, expert]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name || !email || !specialty) {
      toast.error('Name, Email, and Specialty are required fields.');
      setLoading(false);
      return;
    }
    if (!expert && (!password || password.length < 8)) {
      toast.error('Password is required and must be at least 8 characters for new experts.');
      setLoading(false);
      return;
    }
    if (!expert && password !== confirmPassword) {
      toast.error('Passwords do not match.');
      setLoading(false);
      return;
    }

    const method = expert ? 'PUT' : 'POST';
    // Note: The URL for updating an expert would typically be `${apiBaseUrl}/admin/experts/${expert.id}`,
    // but based on your POST example, this PUT route needs to be implemented separately.
    const url = expert ? `${apiBaseUrl}/admin/experts/${expert.id}` : `${apiBaseUrl}/admin/experts?companyId=${slug}`;
    const toastId = toast.loading(expert ? 'Updating expert...' : 'Adding new expert...');

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Credentials': 'include'
        },
        body: JSON.stringify({
          name, email, phone: phone || null, specialty,
          experienceYears: Number(experienceYears), travelsCompleted: Number(travelsCompleted),
          photoUrl: photoUrl || null, bio: bio || null,
          contactEmail: contactEmail || null, contactPhone: contactPhone || null, status,
          password: !expert ? password : undefined,
          // Add expertise to the body
          expertise,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${expert ? 'update' : 'create'} expert.`);
      }

      const savedExpert: ExpertData = await response.json();
      toast.success(`Expert ${name} successfully ${expert ? 'updated' : 'added'}! 🎉`, { id: toastId });
      onSave(savedExpert);
      onClose();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`, { id: toastId });
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-2xl relative text-gray-900 max-h-[90vh] overflow-y-auto"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-8 h-8" />
          </button>

          <header className="flex flex-col items-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center">
              {expert ? 'Edit Expert Profile' : 'Add a New Expert'}
            </h2>
            <p className="text-sm text-gray-500 mt-2 text-center">
              {expert ? 'Update the details for this travel expert.' : 'Fill in the details to create a new expert profile.'}
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                className="col-span-1 md:col-span-2 flex flex-col items-center gap-4 border-b border-gray-200 pb-6 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-200 shadow-lg">
                  {photoUrl ? (
                    <Image
                      src={photoUrl}
                      alt="Expert Profile"
                      layout="fill"
                      objectFit="cover"
                      loader={customLoader}
                    />
                  ) : (
                    <UserCircleIcon className="w-full h-full text-indigo-400 p-2" />
                  )}
                </div>
                <label htmlFor="photoUrl" className="block text-sm font-medium text-gray-700">Profile Photo URL</label>
                <input
                  type="url"
                  id="photoUrl"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="Paste image URL here"
                  className="w-full max-w-sm px-4 py-2 rounded-xl border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                />
              </motion.div>

              <div className="space-y-6">
                <div className="form-group">
                  <label htmlFor="name" className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                    <UserCircleIcon className="w-5 h-5 mr-2 text-indigo-500" /> Full Name
                  </label>
                  <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>
                <div className="form-group">
                  <label htmlFor="email" className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                    <EnvelopeIcon className="w-5 h-5 mr-2 text-indigo-500" /> Email
                  </label>
                  <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                    required disabled={!!expert} />
                  {expert && <p className="text-xs text-gray-500 mt-1">Email is not editable for existing experts.</p>}
                </div>
                <div className="form-group">
                  <label htmlFor="phone" className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                    <PhoneIcon className="w-5 h-5 mr-2 text-indigo-500" /> Phone (Optional)
                  </label>
                  <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                {!expert && (
                  <>
                    <div className="form-group">
                      <label htmlFor="password" className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                        Password
                      </label>
                      <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                        required={!expert} minLength={8} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="confirmPassword" className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                        required={!expert} minLength={8} />
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-6">
                <div className="form-group">
                  <label htmlFor="specialty" className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                    <BriefcaseIcon className="w-5 h-5 mr-2 text-indigo-500" /> Specialty
                  </label>
                  <input type="text" id="specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>
                <div className="form-group">
                  <label htmlFor="expertise" className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                    <GlobeAltIcon className="w-5 h-5 mr-2 text-indigo-500" /> Expertise
                  </label>
                  <select
                    id="expertise"
                    multiple
                    value={expertise}
                    onChange={(e) => {
                      const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
                      setExpertise(selectedOptions);
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 h-32"
                  >
                    {EXPERTISE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold down the Ctrl (Windows) or Cmd (Mac) key to select multiple options.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="experienceYears" className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                      Experience (Yrs)
                    </label>
                    <input type="number" id="experienceYears" value={experienceYears} onChange={(e) => setExperienceYears(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500" required min="0" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="travelsCompleted" className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                      Trips Completed
                    </label>
                    <input type="number" id="travelsCompleted" value={travelsCompleted} onChange={(e) => setTravelsCompleted(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500" required min="0" />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="bio" className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                    <ChatBubbleBottomCenterTextIcon className="w-5 h-5 mr-2 text-indigo-500" /> Bio (Optional)
                  </label>
                  <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
              <div className="form-group">
                <label htmlFor="status" className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                  Status
                </label>
                <select id="status" value={status} onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE' | 'PENDING')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500" required>
                  {EXPERT_STATUSES.map((s) => (
                    <option key={s} value={s} className="capitalize">{s.toLowerCase()}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="contactEmail" className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                  <EnvelopeIcon className="w-5 h-5 mr-2 text-indigo-500" /> Contact Email (Optional)
                </label>
                <input type="email" id="contactEmail" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div className="form-group col-span-1 md:col-span-2">
                <label htmlFor="contactPhone" className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                  <PhoneIcon className="w-5 h-5 mr-2 text-indigo-500" /> Contact Phone (Optional)
                </label>
                <input type="tel" id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
            </section>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <motion.button
                type="button" onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-xl shadow-sm text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit" disabled={loading}
                className="px-6 py-3 border border-transparent rounded-xl shadow-lg text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: loading ? 1 : 1.05 }} whileTap={{ scale: loading ? 1 : 0.95 }}
              >
                {loading ? (
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  expert ? 'Save Changes' : 'Add Expert'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExpertModal;