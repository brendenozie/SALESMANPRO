'use client';

import React from 'react';
import { PhotoIcon, UserCircleIcon, EnvelopeIcon, PhoneIcon, KeyIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { InputGroup, NotificationToggle, SaveButton } from './SharedUi';
import { motion } from 'framer-motion';

import clsx from 'clsx'; // Utility for conditional classes

// ==========================================
// PROFILE TAB
// ==========================================
export const ProfileTab = ({ user, profileName, setProfileName, profileEmail, profilePhone, setProfilePhone, profileAvatar, handleProfileUpdate, primaryColor }: any) => (
  <form onSubmit={handleProfileUpdate} className="space-y-8">
    <h2 className="text-2xl font-bold text-gray-900 border-b pb-3 mb-6">Personal Profile</h2>
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center gap-6">
      <div className="relative">
        <img
          src={`${profileAvatar}?w=150&q=75`}
          alt="User Avatar"
          className="w-24 h-24 rounded-full object-cover border-4 border-[var(--primary-color)] shadow-xl"
        />
        <button type="button" className="absolute bottom-0 right-0 p-2 bg-white rounded-full border border-gray-300 shadow-md text-gray-600" onClick={() => alert('Feature flag: Avatar upload context placeholder')}>
          <PhotoIcon className="h-5 w-5" />
        </button>
      </div>
      <div>
        <p className="text-lg font-semibold text-gray-900">{profileName}</p>
        <p className="text-sm text-gray-500">JPG or PNG allowed. Max size of 2MB.</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputGroup id="name" label="Full Name" value={profileName} onChange={(e) => setProfileName(e.target.value)} Icon={UserCircleIcon} />
      <InputGroup id="email" label="Email Address (Read-Only)" type="email" value={profileEmail} readOnly Icon={EnvelopeIcon} />
      <InputGroup id="phone" label="Phone Number" type="tel" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} Icon={PhoneIcon} />
    </div>
    <SaveButton label="Save Profile Changes" />
  </form>
);

// ==========================================
// SECURITY TAB
// ==========================================
export const SecurityTab = ({ handlePasswordChange, oldPassword, setOldPassword, newPassword, setNewPassword, confirmNewPassword, setConfirmNewPassword }: any) => (
  <form onSubmit={handlePasswordChange} className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900 border-b pb-3 mb-6">Change Password</h2>
    <InputGroup id="old-password" label="Current Password" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} Icon={KeyIcon} />
    <InputGroup id="new-password" label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} Icon={KeyIcon} />
    <InputGroup id="confirm-new-password" label="Confirm New Password" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} Icon={KeyIcon} />
    <SaveButton label="Update Password" />
  </form>
);

// ==========================================
// NOTIFICATIONS TAB
// ==========================================
export const NotificationsTab = ({ handleNotificationUpdate, emailAlerts, setEmailAlerts, smsAlerts, setSmsAlerts, inAppNotifications, setInAppNotifications }: any) => (
  <form onSubmit={handleNotificationUpdate} className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900 border-b pb-3 mb-6">Notification Preferences</h2>
    <NotificationToggle id="email-alerts" label="Email Alerts" description="Receive updates, promotions, and account configurations via email." checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} />
    <NotificationToggle id="sms-alerts" label="SMS Alerts" description="Get time-sensitive updates directly to your phone." checked={smsAlerts} onChange={(e) => setSmsAlerts(e.target.checked)} />
    <NotificationToggle id="in-app-notifications" label="In-App Notifications" description="See system alerts inside the notification dashboard." checked={inAppNotifications} onChange={(e) => setInAppNotifications(e.target.checked)} />
    <SaveButton label="Save Preferences" />
  </form>
);

// ==========================================
// CUSTOM DOMAIN SETUP
// ==========================================
export const DomainTab = ({ handleDomainSubmit, customDomain, setCustomDomain, currentDomain, domainLoading, renderDomainStatusLine, loading, domainStatus, A_RECORD_IP, slug }: any) => (
  <form onSubmit={handleDomainSubmit} className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 border-b pb-3 mb-6">Custom Domain Setup</h2>
                    <p className="text-gray-600 mb-4">Connect your own domain name (e.g., **store.mydomain.com**) to your storefront for a professional look.</p>
                    
                    {/* Current Domain Status */}
                    <div className="mb-4">
                      {currentDomain ? (
                        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <GlobeAltIcon className="h-6 w-6 text-green-600" />
                          <div>
                            <p className="font-semibold text-green-700">
                              {currentDomain}
                            </p>
                            {renderDomainStatusLine()}
                          </div>
                        </div>
                      ) : domainLoading ? (
                        <p className="text-gray-500 animate-pulse">Checking domain status...</p>
                      ) : (
                        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-lg">
                          <p className="text-gray-700">No custom domain connected yet.</p>
                        </div>
                      )}
                    </div>

                    {/* Domain Input */}
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

                    {/* NEW DNS Configuration Block */}
                    <div className="mt-6 p-6 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-lg space-y-4">
                        <p className="font-bold text-lg text-yellow-900">
                            Action Required: Update DNS Records
                        </p>
                        <p className="text-sm">
                            To activate your domain, please log in to your **domain provider's website** (e.g., GoDaddy, Cloudflare, Namecheap) and navigate to the **DNS settings**.
                        </p>
                        <p className="text-sm font-semibold">
                            ⚠️ Important: You must **delete all existing A Records** for the `@` (root) and `www` hosts before adding the new records below.
                        </p>

                        <div className="space-y-3 p-3 bg-white rounded-md border border-yellow-200">
                            <h4 className="font-bold text-base text-gray-900">Required DNS Records:</h4>

                            {/* A Record */}
                            <div className="font-mono text-sm bg-gray-100 p-2 rounded-lg border border-gray-200">
                                <span className="font-semibold text-gray-700">Type:</span> <code className="text-red-600">A</code><br/>
                                <span className="font-semibold text-gray-700">Host/Name:</span> <code className="text-red-600">@</code> (The root domain)<br/>
                                <span className="font-semibold text-gray-700">Value/IP:</span> <code className="text-red-600">{A_RECORD_IP}</code><br/>
                                <span className="font-semibold text-gray-700">TTL:</span> <code className="text-red-600">14400</code> (or default/Auto)
                            </div>

                            {/* CNAME Record */}
                            <div className="font-mono text-sm bg-gray-100 p-2 rounded-lg border border-gray-200">
                                <span className="font-semibold text-gray-700">Type:</span> <code className="text-red-600">CNAME</code><br/>
                                <span className="font-semibold text-gray-700">Host/Name:</span> <code className="text-red-600">www</code><br/>
                                <span className="font-semibold text-gray-700">Value/Target:</span> <code className="text-red-600">{`${slug}.salesmanpro.site`}</code><br/>
                                <span className="font-semibold text-gray-700">TTL:</span> <code className="text-red-600">14400</code> (or default/Auto)
                            </div>
                        </div>

                        <p className="text-sm mt-3">
                            Once you've added these records, it may take a few hours for DNS propagation. Click **Connect Domain** above after you've updated your DNS to initiate verification.
                        </p>
                    </div>
                  </form>
);

// ==========================================
// ACCOUNT ACTIONS (DANGER ZONE)
// ==========================================
export const AccountTab = ({ handleDeactivateAccount }: any) => (
  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 border-b pb-3 mb-6">Danger Zone</h2>
                    
                    {/* Deactivation Card */}
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

                    {/* Deletion Card */}
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
);