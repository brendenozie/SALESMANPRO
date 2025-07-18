'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCircleIcon,
  KeyIcon,
  BellAlertIcon,
  TrashIcon,
  PhotoIcon, // For avatar upload
  EnvelopeIcon, // For email input
  PhoneIcon, // For phone input
  CheckCircleIcon, // For success message
  ExclamationCircleIcon, // For error message
  ArrowRightOnRectangleIcon,
  GlobeAltIcon, // For Logout button
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

import { useSession, signOut } from 'next-auth/react';

// Mocking context data for demonstration purposes
const useMockStoreContext = () => ({
  storeFormData: {
    category:"test",
    themeSettings: {
      primaryColor: "#fd2121", // Red from your sample
      accentColor: "#FFC107", // Amber Yellow, for consistency
    },
  },
});

// Mock User Context for logged-in user data
const useMockUserContext = () => {
  const [userData, setUserData] = useState({
    id: 'USR001',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '123-456-7890',
    avatarUrl: 'https://placehold.co/100x100/fd2121/FFFFFF?text=JD', // Example avatar
    notifications: {
      emailAlerts: true,
      smsAlerts: false,
      inAppNotifications: true,
    },
  });

  // Simulate updating user data (in a real app, this would be an API call)
  const updateUserProfile = (newProfileData: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setUserData((prev) => ({ ...prev, ...newProfileData }));
        resolve({ success: true, message: 'Profile updated successfully!' });
      }, 500);
    });
  };

  const changePassword = (oldPass: string, newPass: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (oldPass === 'password123') { // Mock old password check
          resolve({ success: true, message: 'Password changed successfully!' });
        } else {
          reject({ success: false, message: 'Incorrect old password.' });
        }
      }, 500);
    });
  };

  const updateNotificationPreferences = (newPrefs: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setUserData((prev) => ({ ...prev, notifications: { ...prev.notifications, ...newPrefs } }));
        resolve({ success: true, message: 'Notification preferences updated!' });
      }, 500);
    });
  };

  const deactivateAccount = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        alert('Account Deactivation Initiated. Further steps would be emailed.');
        resolve({ success: true, message: 'Account deactivation process started.' });
      }, 500);
    });
  };

  const logoutUser = (path:string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        alert('Logged out successfully!');
        // In a real app, this would clear session, redirect to login page etc.
          signOut({ callbackUrl: `/${path}` });
        resolve({ success: true, message: 'Logged out.' });
      }, 500);
    });
  };

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

export default function UserSettingsPage() {
  const { storeFormData } = useMockStoreContext();
  const { user, updateUserProfile, changePassword, updateNotificationPreferences, deactivateAccount, logoutUser } = useMockUserContext();

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121';
  const accentColor = storeFormData?.themeSettings?.accentColor || "#FFC107";

  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'security', 'notifications', 'account'
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states for Profile
  const [profileName, setProfileName] = useState(user.name);
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [profilePhone, setProfilePhone] = useState(user.phone);
  const [profileAvatar, setProfileAvatar] = useState(user.avatarUrl);

  // Form states for Security
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Form states for Notifications
  const [emailAlerts, setEmailAlerts] = useState(user.notifications.emailAlerts);
  const [smsAlerts, setSmsAlerts] = useState(user.notifications.smsAlerts);
  const [inAppNotifications, setInAppNotifications] = useState(user.notifications.inAppNotifications);

  // Custom Domain
  const [customDomain, setCustomDomain] = useState('');
  const [domainStatus, setDomainStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null); // success | error

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Update local form states when user data from context changes
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
    setTimeout(() => setStatusMessage(null), 3000); // Clear after 3 seconds
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await updateUserProfile({
        name: profileName,
        email: profileEmail, // Email might be read-only in some systems
        phone: profilePhone,
        avatarUrl: profileAvatar,
      });
      showStatus('success', (result as { message: string }).message);
    } catch (error: any) {
      showStatus('error', error.message || 'Failed to update profile.');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      showStatus('error', 'New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) { // Basic validation
      showStatus('error', 'New password must be at least 6 characters long.');
      return;
    }
    try {
      const result = await changePassword(oldPassword, newPassword);
      showStatus('success', (result as { message: string }).message);
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      showStatus('error', error.message || 'Failed to change password.');
    }
  };

  const handleNotificationUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await updateNotificationPreferences({
        emailAlerts,
        smsAlerts,
        inAppNotifications,
      });
      showStatus('success', (result as { message: string }).message);
    } catch (error: any) {
      showStatus('error', error.message || 'Failed to update notification preferences.');
    }
  };

  const handleDeactivateAccount = async () => {
    if (window.confirm('Are you sure you want to deactivate your account? This action cannot be easily undone.')) {
      try {
        const result = await deactivateAccount();
        showStatus('success', (result as { message: string }).message);
        // Redirect user or log them out after deactivation
      } catch (error: any) {
        showStatus('error', error.message || 'Failed to deactivate account.');
      }
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      try {
        await logoutUser(storeFormData.category);
        // In a real application, you would redirect to the login page
        // window.location.href = '/login';
      } catch (error: any) {
        showStatus('error', error.message || 'Failed to log out.');
      }
    }
  };

  const handleDomainSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    setDomainStatus(null);

    if (loading) return
    setLoading(true)

    try {
      const res = await fetch('/api/custom-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: customDomain }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Unknown error');

      setDomainStatus({ type: 'success', message: data.message });
      setCustomDomain('');
      setLoading(false);
    } catch (err: any) {
      setDomainStatus({ type: 'error', message: err.message });
      setLoading(false);
    }
  };


  // Variants for tab content transition
  const contentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } },
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8">
        {/* Page Header */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 text-center pb-4 border-b border-gray-200">
          User <span style={{ color: primaryColor }}>Settings</span>
        </h1>

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

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <nav className="w-full lg:w-1/4 flex lg:flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200 flex-shrink-0 overflow-x-auto lg:overflow-x-visible">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-colors duration-200
                          ${activeTab === 'profile' ? `bg-[${primaryColor}] text-white shadow-md` : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <UserCircleIcon className={`h-6 w-6 ${activeTab === 'profile' ? 'text-white' : `text-[${accentColor}]`}`} />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-colors duration-200
                          ${activeTab === 'security' ? `bg-[${primaryColor}] text-white shadow-md` : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <KeyIcon className={`h-6 w-6 ${activeTab === 'security' ? 'text-white' : `text-[${accentColor}]`}`} />
              Security
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-colors duration-200
                          ${activeTab === 'notifications' ? `bg-[${primaryColor}] text-white shadow-md` : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <BellAlertIcon className={`h-6 w-6 ${activeTab === 'notifications' ? 'text-white' : `text-[${accentColor}]`}`} />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-colors duration-200
                          ${activeTab === 'account' ? `bg-red-500 text-white shadow-md` : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <TrashIcon className={`h-6 w-6 ${activeTab === 'account' ? 'text-white' : 'text-red-500'}`} />
              Account
            </button>

            <button 
              onClick={()=>setActiveTab('domain')} 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-colors duration-200
                          ${activeTab === 'account' ? `bg-red-500 text-white shadow-md` : 'text-gray-700 hover:bg-gray-100'}`}>
                <GlobeAltIcon className={`h-6 w-6 ${activeTab === 'account' ? 'text-white' : 'text-red-500'}`} />
                Custom Domain
            </button>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-colors duration-200 mt-4 border border-gray-200
                          text-gray-700 hover:bg-gray-100 hover:text-red-600`}
            >
              <ArrowRightOnRectangleIcon className={`h-6 w-6 text-gray-500 group-hover:text-red-600`} />
              Log Out
            </button>
          </nav>

          {/* Content Area */}
          <div className="flex-grow p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={contentVariants}
              >
                {activeTab === 'profile' && (
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
                    <div className="flex flex-col items-center mb-6">
                      {profileAvatar ? (
                        <img
                          src={customLoader({ src: profileAvatar, width: 150 })}
                          alt="User Avatar"
                          className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow-md mb-4"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `https://placehold.co/150x150/${primaryColor.replace('#', '')}/FFFFFF?text=${user.name.split(' ').map((n: string) => n[0]).join('')}`;
                          }}
                        />
                      ) : (
                        <UserCircleIcon className="w-32 h-32 text-gray-300 mb-4" />
                      )}
                      <button
                        type="button"
                        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700
                                    hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]`}
                        onClick={() => alert('Functionality: Upload new avatar (Not implemented)')}
                      >
                        <PhotoIcon className="h-5 w-5" /> Change Avatar
                      </button>
                    </div>

                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <div className="relative">
                        <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          id="email"
                          className="w-full p-3 pl-10 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed"
                          value={profileEmail}
                          readOnly // Often email is not directly editable by user
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Contact support to change your email address.</p>
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <div className="relative">
                        <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          id="phone"
                          className="w-full p-3 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <button
                        type="submit"
                        className={`w-full px-6 py-3 bg-[${primaryColor}] text-white font-semibold rounded-md shadow-md
                                    hover:bg-[${primaryColor}D0] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${primaryColor}]`}
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}

                {activeTab === 'security' && (
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h2>
                    <div>
                      <label htmlFor="old-password" className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <input
                        type="password"
                        id="old-password"
                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input
                        type="password"
                        id="new-password"
                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        id="confirm-new-password"
                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <button
                        type="submit"
                        className={`w-full px-6 py-3 bg-[${primaryColor}] text-white font-semibold rounded-md shadow-md
                                    hover:bg-[${primaryColor}D0] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${primaryColor}]`}
                      >
                        Change Password
                      </button>
                    </div>
                  </form>
                )}

                {activeTab === 'notifications' && (
                  <form onSubmit={handleNotificationUpdate} className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <label htmlFor="email-alerts" className="text-gray-700 font-medium">Email Alerts</label>
                      <input
                        type="checkbox"
                        id="email-alerts"
                        className={`h-5 w-5 rounded border-gray-300 text-[${primaryColor}] focus:ring-[${primaryColor}]`}
                        checked={emailAlerts}
                        onChange={(e) => setEmailAlerts(e.target.checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <label htmlFor="sms-alerts" className="text-gray-700 font-medium">SMS Alerts</label>
                      <input
                        type="checkbox"
                        id="sms-alerts"
                        className={`h-5 w-5 rounded border-gray-300 text-[${primaryColor}] focus:ring-[${primaryColor}]`}
                        checked={smsAlerts}
                        onChange={(e) => setSmsAlerts(e.target.checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <label htmlFor="in-app-notifications" className="text-gray-700 font-medium">In-App Notifications</label>
                      <input
                        type="checkbox"
                        id="in-app-notifications"
                        className={`h-5 w-5 rounded border-gray-300 text-[${primaryColor}] focus:ring-[${primaryColor}]`}
                        checked={inAppNotifications}
                        onChange={(e) => setInAppNotifications(e.target.checked)}
                      />
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <button
                        type="submit"
                        className={`w-full px-6 py-3 bg-[${primaryColor}] text-white font-semibold rounded-md shadow-md
                                    hover:bg-[${primaryColor}D0] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${primaryColor}]`}
                      >
                        Save Preferences
                      </button>
                    </div>
                  </form>
                )}

                {activeTab==='domain' && (
                  <form onSubmit={handleDomainSubmit} className="space-y-4">
                    <h2 className="text-2xl font-bold">Custom Domain</h2>
                    <input type="text" value={customDomain} onChange={e=>setCustomDomain(e.target.value)} placeholder="yourdomain.com" className="w-full p-2 border rounded" />
                    <button type="submit" className="px-4 py-2 bg-[${primaryColor}] text-white rounded">Connect Domain</button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-[${primaryColor}] text-white rounded disabled:opacity-50"
                    >
                      {loading ? 'Connecting…' : 'Connect Domain'}
                    </button>
                    {domainStatus && (
                      <p className={`${domainStatus.type==='success'?'text-green-600':'text-red-600'}`}>{domainStatus.message}</p>
                    )}
                    <p className="text-sm text-gray-500">Add a CNAME record pointing to <code>yourapp.example.com</code> in your DNS settings.</p>
                      {/* Deploy your Next.js app so it’s live at e.g. app.your-production-domain.com.

                        Advise your customers to add a CNAME (or ALIAS/TXT) record:

                        makefile
                        Copy
                        Edit
                        Host:    www (or @ for root)
                        Type:    CNAME
                        Value:   app.your-production-domain.com
                        Once DNS propagates, they hit Connect Domain and your API will verify & save it.

                        Most hosts (Vercel, Netlify) then auto‑issue HTTPS certificates behind the scenes. */}
                        
                  </form>
                )}

                {activeTab === 'account' && (
                  <div className="space-y-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Actions</h2>
                    <p className="text-gray-700 leading-relaxed">
                      Here you can manage actions related to your account. Be careful, some actions are irreversible.
                    </p>
                    <div className="pt-4 border-t border-gray-100">
                      <button
                        onClick={handleDeactivateAccount}
                        className="w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-md shadow-md
                                    hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Deactivate Account
                      </button>
                      <p className="mt-4 text-sm text-gray-500">
                        Deactivating your account will temporarily disable your profile. You can reactivate it later.
                      </p>
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
