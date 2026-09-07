'use client';

import React, { useState, ChangeEvent, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Section from '@/components/site/Section/Section';
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';
import { useStore } from '@/contexts/StoreContext';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  avatar: string | null;
}

interface Order {
  id: string;
  total: number;
  status: string;
  date: string;
  items: {
    id: string;
    name: string;
    qty: number;
    thumbnail?: string;
  }[];
}

export default function ProfilePage() {
  const store = useStore();
  const { data: session, status } = useSession();
  const { slug } = useParams() as { slug: string };

  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('/default-avatar.png');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchUserData();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status, session, slug]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [profileRes, ordersRes] = await Promise.all([
        fetch(`${apiBaseUrl}/site/${slug}/me/profile`),
        fetch(`${apiBaseUrl}/site/${slug}/me/orders`),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUser(profileData);
        setName(profileData.name || '');
        setEmail(profileData.email || '');
        setPhone(profileData.phone || '');
        setAvatarPreview(profileData.avatar || '/default-avatar.png');
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.items?.map((o: any) => ({
          id: o.id,
          total: o.total,
          status: o.status,
          date: o.date,
          items: o.items?.map((item: any) => ({
            id: item.id,
            name: item.product?.name || 'Item',
            qty: item.quantity,
            thumbnail: item.product?.image,
          })) || [],
        })) || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch(`${apiBaseUrl}/site/${slug}/me/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });
      setMessage(res.ok ? 'Profile updated!' : 'Update failed.');
    } catch {
      setMessage('Error updating profile');
    }
  };

  // Show sign-in prompt if not authenticated
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse text-xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <section className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <UserCircleIcon className="w-20 h-20 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Please sign in to access your profile.
          </h2>
          <Link href={`/auth/signin`}>
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg">
              Sign In
            </button>
          </Link>
        </div>
      </section>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Store not found</p>
      </div>
    );
  }

  const displayUser = {
    name: user?.name || session?.user?.name || 'User',
    email: user?.email || session?.user?.email || 'N/A',
    avatar: user?.avatar || session?.user?.image || avatarPreview,
  };

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
                <h2 className="text-2xl font-bold">{displayUser.name}</h2>
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