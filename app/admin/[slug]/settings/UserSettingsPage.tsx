'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import {
  UserCircleIcon,
  KeyIcon,
  BellAlertIcon,
  TrashIcon,
  ArrowRightOnRectangleIcon,
  ServerStackIcon,
  DocumentCheckIcon,
  ChatBubbleLeftRightIcon, // New high-fidelity icon element for eTIMS Tax dashboard routing
} from '@heroicons/react/24/outline';

import { useStoreContext } from '@/contexts/StoreContext';
import { useSession } from 'next-auth/react';
import { changePassword, deactivateAccount, logoutUser, updateNotificationPreferences, updateUserProfile } from '@/lib/user-actions';

// Component Splits Import Linkage
import { ProfileTab, SecurityTab, NotificationsTab, DomainTab, AccountTab } from './components/StandardTabs';
import { KraTab } from './components/KraTab';
import { WhatsAppAiTab } from './components/WhatsAppAiTab';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';
const A_RECORD_IP = process.env.VPS_IP || '161.97.149.171';

export default function UserSettingsPage({ companyId }: { companyId: string }) {
  const { storeFormData } = useStoreContext() || { storeFormData: { themeSettings: { primaryColor: '#E02A50', accentColor: '#FBBF24' } } };
  const session = useSession();

  const user = session?.data?.user || { name: 'User Account', email: '', phone: '', avatarUrl: 'https://placehold.co/100x100/E02A50/FFFFFF?text=U' };
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#E02A50';
  const accentColor = storeFormData?.themeSettings?.accentColor || "#FBBF24";

  const [activeTab, setActiveTab] = useState('profile');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Profile fields bindings states
  const [profileName, setProfileName] = useState(user.name);
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [profilePhone, setProfilePhone] = useState(user.phone || '');
  const [profileAvatar, setProfileAvatar] = useState(user.avatarUrl);
  
  // Passwords states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Notifications states
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [inAppNotifications, setInAppNotifications] = useState(true);

  // Domain states
  const [customDomain, setCustomDomain] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [domainStatus, setDomainStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [currentDomain, setCurrentDomain] = useState<string | null>(null);
  const [hasWebsite, setHasWebsite] = useState<boolean | null>(null);
  const [dnsVerified, setDnsVerified] = useState<boolean | null>(null);
  const [sslStatus, setSslStatus] = useState<string | null>(null);
  const [domainLoading, setDomainLoading] = useState<boolean>(true);

  const pollRef = useRef<number | null>(null);

  const showStatus = (type: 'success' | 'error', message: string) => {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Domain Verification Lifecycle Engine
  const fetchDomainStatus = async (signal?: AbortSignal) => {
    if (!companyId) return;
    setDomainLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/custom-domain/status?companyId=${companyId}`, { signal });
      const data = await res.json();
      if (!res.ok) {
        setCurrentDomain(null); return;
      }
      setCurrentDomain(data.domain || null);
      setSlug(data.slug || '');
      setHasWebsite(!!data.hasWebsite);
      setDnsVerified(data.dnsVerified ?? null);
      setSslStatus(data.sslStatus || null);
    } catch (err) {
      console.error(err);
    } finally {
      setDomainLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'domain') {
      const controller = new AbortController();
      fetchDomainStatus(controller.signal);
      pollRef.current = window.setInterval(() => fetchDomainStatus(), 15000);
      return () => { if (pollRef.current) clearInterval(pollRef.current); controller.abort(); };
    }
  }, [activeTab, companyId]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserProfile({ name: profileName, email: profileEmail, phone: profilePhone, avatarUrl: profileAvatar });
      showStatus('success', 'Profile updated successfully.');
    } catch (err: any) { showStatus('error', err.message); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) return showStatus('error', 'Passwords do not match.');
    try {
      await changePassword(oldPassword, newPassword);
      showStatus('success', 'Security keys transformed successfully.');
      setOldPassword(''); setNewPassword(''); setConfirmNewPassword('');
    } catch (err: any) { showStatus('error', err.message); }
  };

  const renderDomainStatusLine = () => {
    if (domainLoading) return <p className="text-gray-400 animate-pulse">Running verification lookup...</p>;
    if (hasWebsite) return <p className="text-sm text-gray-500">✅ Active securely (SSL: {sslStatus})</p>;
    return <p className="text-sm text-gray-500">⚠️ Propagation processing checks incomplete.</p>;
  };

  const handleDomainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/custom-domain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: customDomain.trim(), companyId }),
      });
      if (!res.ok) throw new Error('Could not link routing network path.');
      setDomainStatus({ type: 'success', message: 'Domain assigned to processing queue safely.' });
      setCustomDomain('');
      fetchDomainStatus();
    } catch (err: any) { setDomainStatus({ type: 'error', message: err.message }); }
    finally { setLoading(false); }
  };

  return (
    <div 
      className="p-4 sm:p-6 lg:p-12 bg-gray-50 min-h-screen font-sans"
      style={{
        '--primary-color': primaryColor,
        '--primary-color-hover': primaryColor + 'D0',
        '--accent-color': accentColor,
      } as React.CSSProperties}
    >
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
        
        {/* Navigation Control Panel */}
        <nav className="w-full lg:w-1/4 flex lg:flex-col p-4 overflow-x-auto gap-2">
          {[
            { id: 'profile', label: 'Profile Settings', Icon: UserCircleIcon, text: 'text-amber-500' },
            { id: 'security', label: 'Security Context', Icon: KeyIcon, text: 'text-green-500' },
            { id: 'notifications', label: 'Alert Preferences', Icon: BellAlertIcon, text: 'text-blue-500' },
            { id: 'domain', label: 'Network Domain', Icon: ServerStackIcon, text: 'text-purple-500' },
            { id: 'whatsapp', label: 'WhatsApp AI', Icon: ChatBubbleLeftRightIcon, text: 'text-green-500' },
            { id: 'kra', label: 'KRA eTIMS Tax', Icon: DocumentCheckIcon, text: 'text-red-500' }, // Linked high fidelity tracking icon
            { id: 'account', label: 'Danger Operations', Icon: TrashIcon, text: 'text-gray-400' },
          ].map(({ id, label, Icon, text }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={clsx(
                "flex items-center gap-4 px-5 py-3 rounded-xl font-semibold text-sm text-left transition-all",
                activeTab === id ? 'bg-[var(--primary-color)] text-white shadow-md' : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <Icon className={clsx("h-5 w-5", activeTab === id ? 'text-white' : text)} />
              {label}
            </button>
          ))}
          <button onClick={() => logoutUser()} className="mt-auto flex items-center gap-4 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl">
            <ArrowRightOnRectangleIcon className="h-5 w-5" /> Log Out
          </button>
        </nav>

        {/* Dynamic Display Target View Area */}
        <div className="flex-grow p-8">
          <AnimatePresence mode="wait">
            {statusMessage && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 mb-6 rounded-xl text-sm font-medium bg-gray-50 border">
                {statusMessage.message}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
              {activeTab === 'profile' && <ProfileTab {...{ user, profileName, setProfileName, profileEmail, profilePhone, setProfilePhone, profileAvatar, handleProfileUpdate }} />}
              {activeTab === 'security' && <SecurityTab {...{ handlePasswordChange, oldPassword, setOldPassword, newPassword, setNewPassword, confirmNewPassword, setConfirmNewPassword }} />}
              {activeTab === 'notifications' && <NotificationsTab {...{ emailAlerts, setEmailAlerts, smsAlerts, setSmsAlerts, inAppNotifications, setInAppNotifications }} />}
              {activeTab === 'domain' && <DomainTab {...{ handleDomainSubmit, customDomain, setCustomDomain, currentDomain, domainLoading, renderDomainStatusLine, loading, domainStatus, A_RECORD_IP, slug }} />}
              {activeTab === 'kra' && <KraTab companyId={companyId} showStatus={showStatus} apiBaseUrl={apiBaseUrl} />}
              {activeTab === 'whatsapp' && <WhatsAppAiTab companyId={companyId} showStatus={showStatus} apiBaseUrl={apiBaseUrl} />}
              {activeTab === 'account' && <AccountTab handleDeactivateAccount={deactivateAccount} />}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
