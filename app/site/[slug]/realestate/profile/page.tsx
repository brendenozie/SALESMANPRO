'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  HomeIcon,
  HeartIcon,
  CalendarDaysIcon,
  Squares2X2Icon,
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  TrashIcon,
  MapPinIcon,
  WrenchScrewdriverIcon,
  BanknotesIcon,
  DocumentCheckIcon,
  KeyIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { StarIcon, HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const BedIcon = (props: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493M6 17h12m-6-4v4m0 0v4m0-4H6m6 0h6m2 4v-4m0 0V5a2 2 0 00-2-2h-1.28a1 1 0 00-.948.684l-1.498 4.493M18 17H6" />
  </svg>
);

const SidebarItem = ({
  icon: Icon,
  label,
  active,
  onClick,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: string | number;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium text-sm ${
      active
        ? 'bg-indigo-600 text-white shadow-md'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
    <span>{label}</span>
    {badge !== undefined && badge !== 0 && (
      <span
        className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${
          active ? 'bg-white text-indigo-600' : 'bg-slate-700 text-slate-300'
        }`}
      >
        {badge}
      </span>
    )}
  </button>
);

const StatCard = ({
  icon: Icon,
  label,
  value,
  colorClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  colorClass: { bg: string; text: string };
}) => (
  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-0.5">
    <div className={`p-3 rounded-xl ${colorClass.bg}`}>
      <Icon className={`w-6 h-6 ${colorClass.text}`} />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{value}</h4>
    </div>
  </div>
);

export default function RealEstateDashboard() {
  const { data: session, status } = useSession();
  const { slug } = useParams() as { slug: string };
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('overview');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/site/${slug}/me/properties-dashboard`);
      if (res.ok) {
        const json = await res.json();
        setDashboardData(json);
      }
    } catch (e) {
      console.error("Failed to load dashboard data:", e);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setLoading(false);
      return;
    }
    if (status === 'authenticated') {
      loadData();
    }
  }, [status, loadData]);

  const handleRemoveBookmark = async (listingId: string) => {
    try {
      const res = await fetch(`/api/me/wishlist?listingId=${listingId}`, { method: 'DELETE' });
      if (res.ok) {
        setDashboardData((prev: any) => ({
          ...prev,
          savedProperties: prev.savedProperties.filter((p: any) => p.id !== listingId),
          stats: {
            ...prev.stats,
            savedHomes: Math.max(0, prev.stats.savedHomes - 1),
          },
        }));
      }
    } catch (e) {
      console.error("Remove bookmark error:", e);
    }
  };

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 max-w-md w-full p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-xl">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
            <UserCircleIcon className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Member Sign In Required</h2>
          <p className="text-slate-500 text-sm mb-6">
            Sign in to view your saved properties, scheduled showing appointments, offers, bookings, and tenancy requests.
          </p>
          <Link
            href={`/auth/signin?callbackUrl=/site/${slug}/realestate/profile`}
            className="block w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
          >
            Sign In to Property Account
          </Link>
        </div>
      </div>
    );
  }

  const user = dashboardData?.user || {
    name: session?.user?.name || "Client Member",
    email: session?.user?.email || "",
    avatar: session?.user?.image || null,
  };

  const stats = dashboardData?.stats || {
    savedHomes: 0,
    openInquiries: 0,
    upcomingTours: 0,
    activeOffers: 0,
    activeBookings: 0,
    activeTenancies: 0,
    openMaintenance: 0,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col md:flex-row">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-full md:w-72 bg-slate-900 text-white flex-shrink-0 flex flex-col justify-between p-6">
        <div>
          {/* User Profile Header */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-800">
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500" />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg ring-2 ring-indigo-400">
                {user.name?.charAt(0) || "U"}
              </div>
            )}
            <div className="overflow-hidden">
              <h3 className="font-bold text-base truncate">{user.name}</h3>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-1.5">
            <SidebarItem icon={Squares2X2Icon} label="Overview" active={activeNav === 'overview'} onClick={() => setActiveNav('overview')} />
            <SidebarItem icon={HeartIcon} label="Saved Properties" active={activeNav === 'saved'} onClick={() => setActiveNav('saved')} badge={stats.savedHomes} />
            <SidebarItem icon={CalendarDaysIcon} label="Scheduled Tours" active={activeNav === 'tours'} onClick={() => setActiveNav('tours')} badge={stats.upcomingTours} />
            <SidebarItem icon={BanknotesIcon} label="Offers & Bids" active={activeNav === 'offers'} onClick={() => setActiveNav('offers')} badge={stats.activeOffers} />
            <SidebarItem icon={KeyIcon} label="Stays & Bookings" active={activeNav === 'bookings'} onClick={() => setActiveNav('bookings')} badge={stats.activeBookings} />
            <SidebarItem icon={HomeIcon} label="Tenancy & Leases" active={activeNav === 'tenancies'} onClick={() => setActiveNav('tenancies')} badge={stats.activeTenancies} />
            <SidebarItem icon={WrenchScrewdriverIcon} label="Maintenance" active={activeNav === 'maintenance'} onClick={() => setActiveNav('maintenance')} badge={stats.openMaintenance} />
            <SidebarItem icon={ChatBubbleLeftRightIcon} label="My Inquiries" active={activeNav === 'inquiries'} onClick={() => setActiveNav('inquiries')} badge={stats.openInquiries} />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-slate-800 space-y-2">
          <Link
            href={`/site/${slug}/realestate`}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold transition-colors"
          >
            <ArrowRightIcon className="w-4 h-4" /> Browse Real Estate
          </Link>
          <button
            onClick={() => signOut()}
            className="flex items-center w-full gap-3 px-4 py-2.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-slate-800 text-xs font-bold transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">
              {activeNav === 'overview' && 'Property Portal Overview'}
              {activeNav === 'saved' && 'Saved Properties'}
              {activeNav === 'tours' && 'Scheduled Showing Tours'}
              {activeNav === 'offers' && 'Property Offers & Deals'}
              {activeNav === 'bookings' && 'Stay Reservations & Bookings'}
              {activeNav === 'tenancies' && 'Tenancy & Room Leases'}
              {activeNav === 'maintenance' && 'Maintenance Tickets'}
              {activeNav === 'inquiries' && 'Direct Property Inquiries'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time activity and status across your customer property lifecycle.
            </p>
          </div>
          <Link
            href={`/site/${slug}/realestate`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-colors"
          >
            <HomeIcon className="w-4 h-4" /> Explore Properties
          </Link>
        </div>

        {/* --- TAB: OVERVIEW --- */}
        {activeNav === 'overview' && (
          <div className="space-y-8">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={HeartIcon} label="Saved Homes" value={stats.savedHomes} colorClass={{ bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-600' }} />
              <StatCard icon={CalendarDaysIcon} label="Upcoming Tours" value={stats.upcomingTours} colorClass={{ bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-600' }} />
              <StatCard icon={BanknotesIcon} label="Active Offers" value={stats.activeOffers} colorClass={{ bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600' }} />
              <StatCard icon={WrenchScrewdriverIcon} label="Maintenance" value={stats.openMaintenance} colorClass={{ bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-600' }} />
            </div>

            {/* Quick Preview of Saved Homes */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Recent Saved Properties</h3>
                <button onClick={() => setActiveNav('saved')} className="text-sm font-bold text-indigo-600 hover:underline">
                  View All ({stats.savedHomes})
                </button>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  ))}
                </div>
              ) : dashboardData?.savedProperties?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {dashboardData.savedProperties.slice(0, 3).map((prop: any) => (
                    <div key={prop.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col">
                      <div className="relative aspect-[4/3]">
                        <img src={prop.images[0]} alt={prop.title} className="w-full h-full object-cover" />
                        <span className="absolute top-3 left-3 px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-full">
                          {prop.status}
                        </span>
                        <button
                          onClick={() => handleRemoveBookmark(prop.id)}
                          className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full text-rose-500 shadow-sm"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-base text-slate-900 dark:text-white truncate">{prop.title}</h4>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">{prop.address}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                          <span className="font-black text-indigo-600 dark:text-indigo-400 text-lg">
                            ${Number(prop.price).toLocaleString()}
                          </span>
                          <Link
                            href={`/site/${slug}/realestate/listings/${prop.id}`}
                            className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600"
                          >
                            View &rarr;
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <HeartIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-500">No properties saved yet.</p>
                  <Link href={`/site/${slug}/realestate`} className="mt-3 inline-block text-xs font-bold text-indigo-600 hover:underline">
                    Browse and save properties
                  </Link>
                </div>
              )}
            </div>

            {/* Upcoming Tours Preview */}
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">Upcoming Showing Tours</h3>
              {dashboardData?.showings?.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.showings.map((shw: any) => (
                    <div key={shw.id} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold">
                          <CalendarDaysIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{shw.propertyName}</h4>
                          <p className="text-xs text-slate-400">
                            {new Date(shw.dateTime).toLocaleDateString()} at {new Date(shw.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full">
                        {shw.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No scheduled showings currently.</p>
              )}
            </div>
          </div>
        )}

        {/* --- TAB: SAVED PROPERTIES --- */}
        {activeNav === 'saved' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dashboardData?.savedProperties?.length > 0 ? (
              dashboardData.savedProperties.map((prop: any) => (
                <div key={prop.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col">
                  <div className="relative aspect-[4/3]">
                    <img src={prop.images[0]} alt={prop.title} className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleRemoveBookmark(prop.id)}
                      className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full text-rose-500 shadow-sm"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">{prop.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{prop.address}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <span className="font-black text-indigo-600 text-lg">${Number(prop.price).toLocaleString()}</span>
                      <Link
                        href={`/site/${slug}/realestate/listings/${prop.id}`}
                        className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 font-bold text-xs rounded-lg hover:bg-indigo-100"
                      >
                        View Listing
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-slate-400">
                You have not bookmarked any properties yet.
              </div>
            )}
          </div>
        )}

        {/* --- TAB: TOURS & SHOWINGS --- */}
        {activeNav === 'tours' && (
          <div className="space-y-4">
            {dashboardData?.showings?.map((shw: any) => (
              <div key={shw.id} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Property Tour</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">{shw.propertyName}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Scheduled for: <strong>{new Date(shw.dateTime).toLocaleString()}</strong>
                  </p>
                  {shw.agentName && (
                    <p className="text-xs text-slate-500 mt-1">Assigned Agent: {shw.agentName}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-full">
                    {shw.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- TAB: OFFERS --- */}
        {activeNav === 'offers' && (
          <div className="space-y-4">
            {dashboardData?.offers?.map((ofr: any) => (
              <div key={ofr.id} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Purchase / Lease Offer</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">{ofr.propertyName}</h3>
                  <p className="text-xs text-slate-400 mt-1">Submitted on {new Date(ofr.offerDate).toLocaleDateString()}</p>
                  {ofr.notes && <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">{ofr.notes}</p>}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    ${Number(ofr.offerAmount).toLocaleString()}
                  </div>
                  <span className="inline-block mt-2 px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-bold rounded-full">
                    {ofr.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- TAB: BOOKINGS --- */}
        {activeNav === 'bookings' && (
          <div className="space-y-4">
            {dashboardData?.bookings?.map((bkg: any) => (
              <div key={bkg.id} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Stay Reservation</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">{bkg.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Dates: {new Date(bkg.startDate).toLocaleDateString()} &mdash; {new Date(bkg.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-emerald-600">${Number(bkg.totalPrice || bkg.price).toLocaleString()}</span>
                  <div className="mt-1">
                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full">
                      {bkg.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- TAB: TENANCIES --- */}
        {activeNav === 'tenancies' && (
          <div className="space-y-4">
            {dashboardData?.tenancies?.map((t: any) => (
              <div key={t.id} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Assigned Unit / Room</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                    Room {t.room?.roomNumber} &bull; Wing {t.room?.block?.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Resident since {new Date(t.startDate).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full">
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* --- TAB: MAINTENANCE --- */}
        {activeNav === 'maintenance' && (
          <div className="space-y-4">
            {dashboardData?.maintenanceRequests?.map((m: any) => (
              <div key={m.id} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                      {m.priority} Priority
                    </span>
                    <span className="text-xs text-slate-400">{m.category}</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mt-2">{m.description}</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Room {m.room?.roomNumber} &bull; Reported {new Date(m.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-full">
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* --- TAB: INQUIRIES --- */}
        {activeNav === 'inquiries' && (
          <div className="space-y-4">
            {dashboardData?.inquiries?.map((inq: any) => (
              <div key={inq.id} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-indigo-600">{inq.propertyName}</span>
                  <p className="text-sm text-slate-800 dark:text-slate-200 mt-1 italic">"{inq.message}"</p>
                  <p className="text-xs text-slate-400 mt-2">Sent on {new Date(inq.receivedAt).toLocaleDateString()}</p>
                </div>
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-full">
                  {inq.status}
                </span>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}