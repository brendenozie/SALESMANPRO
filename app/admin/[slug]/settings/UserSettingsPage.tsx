'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCircleIcon,
  KeyIcon,
  BellAlertIcon,
  TrashIcon,
  PhotoIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
  ServerStackIcon, // New icon for Custom Domain
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import { useSession, signOut } from 'next-auth/react';
import clsx from 'clsx'; // Utility for conditional classes

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";

// --- MOCK CONTEXTS (Keep these for functionality) ---
const useMockStoreContext = () => ({
  storeFormData: {
    category: "test",
    themeSettings: {
      primaryColor: "#E02A50", // Changed from raw red to a slightly softer, modern crimson
      accentColor: "#FBBF24", // Tailwind amber-400 equivalent
    },
  },
});

const useMockUserContext = () => {
  const [userData, setUserData] = useState({
    id: 'USR001',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '123-456-7890',
    avatarUrl: 'https://placehold.co/100x100/E02A50/FFFFFF?text=JD', 
    notifications: {
      emailAlerts: true,
      smsAlerts: false,
      inAppNotifications: true,
    },
  });

  // Mock API functions... (omitted for brevity, assume they work as before)
  const updateUserProfile = (data: any) => new Promise((resolve) => setTimeout(() => { setUserData(prev => ({ ...prev, ...data })); resolve({ success: true, message: 'Profile updated successfully!' }); }, 500));
  const changePassword = (oldPass: string, newPass: string) => new Promise((resolve, reject) => setTimeout(() => (oldPass === 'password123' ? resolve({ success: true, message: 'Password changed successfully!' }) : reject({ success: false, message: 'Incorrect old password.' })), 500));
  const updateNotificationPreferences = (newPrefs: any) => new Promise((resolve) => setTimeout(() => { setUserData((prev) => ({ ...prev, notifications: { ...prev.notifications, ...newPrefs } })); resolve({ success: true, message: 'Notification preferences updated!' }); }, 500));
  const deactivateAccount = () => new Promise((resolve) => setTimeout(() => { alert('Account Deactivation Initiated.'); resolve({ success: true, message: 'Account deactivation process started.' }); }, 500));
  const logoutUser = (path:string) => new Promise((resolve) => { setTimeout(() => { signOut({ callbackUrl: `/${path}` }); resolve({ success: true, message: 'Logged out.' }); }, 500);});

  return {
    user: userData,
    updateUserProfile,
    changePassword,
    updateNotificationPreferences,
    deactivateAccount,
    logoutUser,
  };
};

// Simplified loader for standard <img> tag
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};
// --- END MOCK CONTEXTS ---


export default function UserSettingsPage() {
  const { storeFormData } = useMockStoreContext();
  const { user, updateUserProfile, changePassword, updateNotificationPreferences, deactivateAccount, logoutUser } = useMockUserContext();

  // Use Theme Colors and define fallback CSS variables
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#E02A50';
  const accentColor = storeFormData?.themeSettings?.accentColor || "#FBBF24";

  const [activeTab, setActiveTab] = useState('profile');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states (omitted setup for brevity - assumes previous state logic is maintained)
  const [profileName, setProfileName] = useState(user.name);
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [profilePhone, setProfilePhone] = useState(user.phone);
  const [profileAvatar, setProfileAvatar] = useState(user.avatarUrl);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [emailAlerts, setEmailAlerts] = useState(user.notifications.emailAlerts);
  const [smsAlerts, setSmsAlerts] = useState(user.notifications.smsAlerts);
  const [inAppNotifications, setInAppNotifications] = useState(user.notifications.inAppNotifications);
  const [customDomain, setCustomDomain] = useState('');
  const [domainStatus, setDomainStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setProfileName(user.name);
    setProfileEmail(user.email);
    setProfilePhone(user.phone);
    setProfileAvatar(user.avatarUrl);
    setEmailAlerts(user.notifications.emailAlerts);
    setSmsAlerts(user.notifications.smsAlerts);
    setInAppNotifications(user.notifications.inAppNotifications);
  }, [user]);

  const showStatus = (type: 'success' | 'error', message: string) => {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // --- HANDLERS (using previous logic) ---
  const handleProfileUpdate = async (e: React.FormEvent) => { e.preventDefault(); try { const result = await updateUserProfile({ name: profileName, email: profileEmail, phone: profilePhone, avatarUrl: profileAvatar }); showStatus('success', (result as { message: string }).message); } catch (error: any) { showStatus('error', error.message || 'Failed to update profile.'); } };
  const handlePasswordChange = async (e: React.FormEvent) => { e.preventDefault(); if (newPassword !== confirmNewPassword) { showStatus('error', 'New passwords do not match.'); return; } if (newPassword.length < 6) { showStatus('error', 'New password must be at least 6 characters long.'); return; } try { const result = await changePassword(oldPassword, newPassword); showStatus('success', (result as { message: string }).message); setOldPassword(''); setNewPassword(''); setConfirmNewPassword(''); } catch (error: any) { showStatus('error', error.message || 'Failed to change password.'); } };
  const handleNotificationUpdate = async (e: React.FormEvent) => { e.preventDefault(); try { const result = await updateNotificationPreferences({ emailAlerts, smsAlerts, inAppNotifications }); showStatus('success', (result as { message: string }).message); } catch (error: any) { showStatus('error', error.message || 'Failed to update notification preferences.'); } };
  const handleDeactivateAccount = async () => { if (window.confirm('Are you sure you want to deactivate your account?')) { try { const result = await deactivateAccount(); showStatus('success', (result as { message: string }).message); } catch (error: any) { showStatus('error', error.message || 'Failed to deactivate account.'); } } };
  const handleLogout = async () => { if (window.confirm('Are you sure you want to log out?')) { try { await logoutUser(storeFormData.category); } catch (error: any) { showStatus('error', error.message || 'Failed to log out.'); } } };
  const handleDomainSubmit = async (e: React.FormEvent) => { e.preventDefault(); setDomainStatus(null); if (loading) return; setLoading(true); try { const res = await fetch(`${apiBaseUrl}/custom-domain`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Credentials' : 'include' }, body: JSON.stringify({ domain: customDomain }), }); const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Unknown error'); setDomainStatus({ type: 'success', message: data.message }); setCustomDomain(''); setLoading(false); } catch (err: any) { setDomainStatus({ type: 'error', message: err.message }); setLoading(false); } };
  // --- END HANDLERS ---


  // Variants for tab content transition
  const contentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } },
  };

  // 🛑 VISUAL IMPROVEMENT: Using inline style to define CSS variables
  return (
    <div 
        className="p-4 sm:p-6 lg:p-12 bg-gray-50 min-h-screen font-sans"
        style={{
            '--primary-color': primaryColor,
            '--primary-color-hover': primaryColor + 'D0', // Slightly transparent for hover
            '--accent-color': accentColor,
        } as React.CSSProperties}
    >
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100">
        
        {/* Page Header */}
        <div className="p-8 border-b border-gray-100 bg-white rounded-t-2xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
                Account <span className="text-[var(--primary-color)]">Settings</span> ✨
            </h1>
            <p className="mt-2 text-lg text-gray-500">Manage your profile, security, and notification preferences.</p>
        </div>

        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
          
          {/* Sidebar Navigation - 🛑 VISUAL IMPROVEMENT: Cleaner sidebar styling */}
          <nav className="w-full lg:w-1/4 flex lg:flex-col p-4 flex-shrink-0 overflow-x-auto lg:overflow-x-visible">
            
            {/* Navigation Buttons */}
            {[
                { id: 'profile', label: 'Profile', Icon: UserCircleIcon, colorClass: 'text-[var(--accent-color)]' },
                { id: 'security', label: 'Security', Icon: KeyIcon, colorClass: 'text-green-500' },
                { id: 'notifications', label: 'Notifications', Icon: BellAlertIcon, colorClass: 'text-blue-500' },
                { id: 'domain', label: 'Custom Domain', Icon: ServerStackIcon, colorClass: 'text-purple-500' },
                { id: 'account', label: 'Account Actions', Icon: TrashIcon, colorClass: 'text-red-500' },
            ].map(({ id, label, Icon, colorClass }) => (
                <motion.button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={clsx(
                        "flex items-center gap-4 px-5 py-3 rounded-xl text-left font-semibold transition-all duration-200 min-w-max",
                        activeTab === id
                            ? 'bg-[var(--primary-color)] text-white shadow-lg'
                            : 'text-gray-700 hover:bg-gray-50'
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Icon className={clsx("h-6 w-6 transition-colors duration-200", activeTab === id ? 'text-white' : colorClass)} />
                    {label}
                </motion.button>
            ))}

            {/* Logout Button - 🛑 VISUAL IMPROVEMENT: Clear separation for destructive/secondary action */}
            <motion.button
                onClick={handleLogout}
                className="mt-6 flex items-center gap-4 px-5 py-3 rounded-xl text-left font-semibold text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 border border-gray-200"
                whileHover={{ scale: 1.02, x: 5 }}
            >
                <ArrowRightOnRectangleIcon className="h-6 w-6 text-gray-500 group-hover:text-red-600" />
                Log Out
            </motion.button>
          </nav>

          {/* Content Area */}
          <div className="flex-grow p-8">
            {/* Status Message */}
            <AnimatePresence>
              {statusMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={clsx(`mb-8 p-4 rounded-xl flex items-center gap-3 font-medium shadow-md`,
                    statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                  )}
                >
                  {statusMessage.type === 'success' ? <CheckCircleIcon className="h-6 w-6" /> : <ExclamationCircleIcon className="h-6 w-6" />}
                  <p>{statusMessage.message}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={contentVariants}
              >
                {/* 1. Profile Information */}
                {activeTab === 'profile' && (
                  <form onSubmit={handleProfileUpdate} className="space-y-8">
                    <h2 className="text-2xl font-bold text-gray-900 border-b pb-3 mb-6">Personal Profile</h2>
                    
                    {/* Avatar Card - 🛑 VISUAL IMPROVEMENT: Dedicated card for avatar */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative">
                            <img
                              src={customLoader({ src: profileAvatar, width: 150 })}
                              alt="User Avatar"
                              className="w-24 h-24 rounded-full object-cover border-4 border-[var(--primary-color)] shadow-xl"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = `https://placehold.co/150x150/${primaryColor.replace('#', '')}/FFFFFF?text=${user.name.split(' ').map((n: string) => n[0]).join('')}`;
                              }}
                            />
                            {/* Edit Overlay */}
                            <button
                                type="button"
                                className="absolute bottom-0 right-0 p-2 bg-white rounded-full border border-gray-300 shadow-md text-gray-600 hover:text-[var(--primary-color)] transition-colors"
                                onClick={() => alert('Functionality: Upload new avatar (Not implemented)')}
                            >
                                <PhotoIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-gray-900">{profileName}</p>
                            <p className="text-sm text-gray-500">JPG or PNG allowed. Max size of 2MB.</p>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup 
                            id="name" 
                            label="Full Name" 
                            type="text" 
                            value={profileName} 
                            onChange={(e) => setProfileName(e.target.value)} 
                            Icon={UserCircleIcon}
                        />
                        <InputGroup 
                            id="email" 
                            label="Email Address (Read-Only)" 
                            type="email" 
                            value={profileEmail} 
                            readOnly={true} 
                            Icon={EnvelopeIcon}
                        />
                        <InputGroup 
                            id="phone" 
                            label="Phone Number" 
                            type="tel" 
                            value={profilePhone} 
                            onChange={(e) => setProfilePhone(e.target.value)} 
                            Icon={PhoneIcon}
                        />
                    </div>
                    
                    <SaveButton label="Save Profile Changes" primaryColor={primaryColor} />
                  </form>
                )}

                {/* 2. Security */}
                {activeTab === 'security' && (
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 border-b pb-3 mb-6">Change Password</h2>
                    <InputGroup id="old-password" label="Current Password" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} Icon={KeyIcon} />
                    <InputGroup id="new-password" label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} Icon={KeyIcon} />
                    <InputGroup id="confirm-new-password" label="Confirm New Password" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} Icon={KeyIcon} />
                    <SaveButton label="Update Password" primaryColor={primaryColor} />
                  </form>
                )}

                {/* 3. Notifications */}
                {activeTab === 'notifications' && (
                  <form onSubmit={handleNotificationUpdate} className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 border-b pb-3 mb-6">Notification Preferences</h2>
                    <NotificationToggle 
                        id="email-alerts" 
                        label="Email Alerts" 
                        description="Receive updates, promotions, and important account information via email."
                        checked={emailAlerts}
                        onChange={(e) => setEmailAlerts(e.target.checked)}
                    />
                    <NotificationToggle 
                        id="sms-alerts" 
                        label="SMS Alerts" 
                        description="Get important, time-sensitive alerts directly to your phone."
                        checked={smsAlerts}
                        onChange={(e) => setSmsAlerts(e.target.checked)}
                    />
                    <NotificationToggle 
                        id="in-app-notifications" 
                        label="In-App Notifications" 
                        description="See notifications directly in the application when you log in."
                        checked={inAppNotifications}
                        onChange={(e) => setInAppNotifications(e.target.checked)}
                    />
                    <SaveButton label="Save Preferences" primaryColor={primaryColor} />
                  </form>
                )}

                {/* 4. Custom Domain */}
                {activeTab==='domain' && (
                  <form onSubmit={handleDomainSubmit} className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 border-b pb-3 mb-6">Custom Domain Setup</h2>
                    <p className="text-gray-600 mb-4">Connect your own domain name (e.g., **store.mydomain.com**) to your storefront for a professional look.</p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input 
                            type="text" 
                            value={customDomain} 
                            onChange={e=>setCustomDomain(e.target.value)} 
                            placeholder="store.yourcompany.com" 
                            className="flex-grow p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)]"
                        />
                        <motion.button
                            type="submit"
                            disabled={loading || customDomain.length === 0}
                            className="px-6 py-3 bg-[var(--primary-color)] text-white font-semibold rounded-lg shadow-md disabled:opacity-50 transition-colors"
                            style={{ backgroundColor: loading ? 'gray' : undefined }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {loading ? 'Connecting...' : 'Connect Domain'}
                        </motion.button>
                    </div>

                    {domainStatus && (
                        <motion.p 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={clsx('mt-2 p-3 rounded-lg font-medium', domainStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}
                        >
                            {domainStatus.message}
                        </motion.p>
                    )}

                    <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-lg">
                        <p className="font-semibold">DNS Configuration Required</p>
                        <p className="text-sm mt-1">
                            Before connecting, please add a **CNAME** record in your DNS settings: Host: `your subdomain` (e.g., `store`), Type: `CNAME`, Value: `yourapp.example.com`.
                        </p>
                    </div>
                  </form>
                )}

                {/* 5. Account Actions */}
                {activeTab === 'account' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 border-b pb-3 mb-6">Danger Zone</h2>
                    
                    {/* Deactivation Card - 🛑 VISUAL IMPROVEMENT: Red danger card */}
                    <div className="p-6 bg-red-50 border border-red-200 rounded-xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <h3 className="text-lg font-semibold text-red-700">Deactivate Account</h3>
                            <p className="text-red-600 mt-1">Temporarily disable your profile. You can reactivate it later.</p>
                        </div>
                        <motion.button
                            onClick={handleDeactivateAccount}
                            className="mt-4 sm:mt-0 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Deactivate
                        </motion.button>
                    </div>

                    {/* Deletion Card (Example of a more serious action) */}
                    <div className="p-6 bg-red-100 border border-red-300 rounded-xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <h3 className="text-lg font-semibold text-red-800">Permanently Delete Account</h3>
                            <p className="text-red-700 mt-1 font-bold">WARNING: This action is permanent and irreversible.</p>
                        </div>
                        <motion.button
                            onClick={() => alert('Account Deletion confirmation required (Not implemented)')}
                            className="mt-4 sm:mt-0 px-6 py-3 border border-red-600 text-red-600 font-semibold rounded-lg bg-white shadow-md hover:bg-red-50 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Delete Account
                        </motion.button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Reusable Components for Clarity and Consistency ---

interface InputGroupProps {
    id: string;
    label: string;
    type: string;
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    Icon: React.ElementType;
    readOnly?: boolean;
}

// 🛑 VISUAL IMPROVEMENT: Reusable Input Group with integrated Icon
const InputGroup: React.FC<InputGroupProps> = ({ id, label, type, value, onChange, Icon, readOnly = false }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative">
            <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
                type={type}
                id={id}
                className={clsx(
                    "w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] transition-all",
                    readOnly ? 'bg-gray-100 cursor-not-allowed text-gray-600' : 'bg-white'
                )}
                value={value}
                onChange={onChange}
                readOnly={readOnly}
                placeholder={readOnly ? 'Not editable' : ''}
            />
        </div>
        {readOnly && <p className="mt-1 text-xs text-gray-500">Contact support to change this field.</p>}
    </div>
);

interface NotificationToggleProps {
    id: string;
    label: string;
    description: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// 🛑 VISUAL IMPROVEMENT: Dedicated Toggle Component for better UX
const NotificationToggle: React.FC<NotificationToggleProps> = ({ id, label, description, checked, onChange }) => (
    <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm flex items-start justify-between transition-colors hover:bg-gray-50">
        <div className="mr-4">
            <label htmlFor={id} className="text-base font-semibold text-gray-900 cursor-pointer">{label}</label>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <input
            type="checkbox"
            id={id}
            className="h-6 w-6 rounded-full border-gray-300 bg-gray-200 text-[var(--primary-color)] focus:ring-[var(--primary-color)] mt-1 flex-shrink-0"
            checked={checked}
            onChange={onChange}
            style={{ color: 'var(--primary-color)' }} // For consistent checkbox color
        />
    </div>
);

// 🛑 VISUAL IMPROVEMENT: Reusable Save Button
const SaveButton: React.FC<{ label: string; primaryColor: string }> = ({ label }) => (
    <div className="pt-6 border-t border-gray-100">
        <motion.button
            type="submit"
            className="w-full px-6 py-3 bg-[var(--primary-color)] text-white font-semibold rounded-xl shadow-lg
                       transition-all duration-300 hover:bg-[var(--primary-color-hover)] focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-[var(--primary-color)]"
            whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
            whileTap={{ scale: 0.98 }}
        >
            {label}
        </motion.button>
    </div>
);