// app/[slug]/profile/page.tsx
'use client';

import React, { useState, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import Section from '@/components/site/Section/Section';
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';
import { useStore } from '@/contexts/StoreContext';
import { useStateContext } from '@/contexts/ContextProvider';


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

export default function ProfilePage() {
  const store = useStore();
  const { user, orders: initialOrders } = useStateContext();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '/default-avatar.png');
  const [orders] = useState(initialOrders || []);
  const [message, setMessage] = useState('');

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
    // TODO: upload avatar
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch(`${apiBaseUrl}/user/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone }),
      });
      setMessage(res.ok ? 'Profile updated!' : 'Update failed.');
    } catch {
      setMessage('Error updating profile');
    }
  };

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Store not found</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">
      <Section title=''>
        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          {['profile', 'orders'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-md font-medium ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {tab === 'profile' ? 'My Profile' : 'Order History'}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Avatar & Stats */}
            <div className="flex items-center space-x-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
              <div className="relative group">
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
                />
                <label className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full transition-opacity cursor-pointer">
                  <input type="file" className="hidden" onChange={handleAvatarChange} />
                  <span className="text-white text-sm">Change</span>
                </label>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user?.name}</h2>
                <div className="mt-2 flex space-x-4 text-gray-600 dark:text-gray-300">
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold">{orders.length}</span>
                    <span>Orders</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
              {message && <p className="text-green-500 mb-4">{message}</p>}
              <form onSubmit={handleSubmit} className="space-y-4">
                {['Name', 'Email', 'Phone'].map((label, i) => {
                  const state = [name, email, phone][i];
                  const setter = [setName, setEmail, setPhone][i];
                  const type = label === 'Email' ? 'email' : label === 'Phone' ? 'tel' : 'text';
                  return (
                    <div key={label}>
                      <label className="block text-sm font-medium">{label}</label>
                      <input
                        type={type}
                        value={state}
                        onChange={e => setter(e.target.value)}
                        className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  );
                })}
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
                >
                  Save Changes
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {orders.map((o : any) => (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-lg transition"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <img src={o.items[0]?.thumbnail} className="w-16 h-16 rounded" />
                    <div>
                      <h3 className="font-semibold">Order #{o.id}</h3>
                      <p className="text-sm text-gray-500">{new Date(o.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      o.status === 'Delivered'
                        ? 'bg-green-100 text-green-800'
                        : o.status === 'In Transit'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {o.status}
                  </span>
                </div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-blue-600">View Items</summary>
                  <ul className="mt-2 space-y-1">
                    {o.items.map((item:any) => (
                      <li key={item.id} className="flex justify-between">
                        <span>{item.name}</span>
                        <span>x{item.qty}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              </motion.div>
            ))}
          </motion.div>
        )}
      </Section>
      <NewsletterSection />
    </div>
  );
}