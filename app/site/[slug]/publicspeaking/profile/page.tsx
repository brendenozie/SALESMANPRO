'use client';

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useParams } from "next/navigation";
import {
  HomeIcon,
  CreditCardIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentCheckIcon,
  ArrowDownTrayIcon,
  UserCircleIcon,
  StarIcon,
  ClockIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import { MarketListingForm } from "@/types/typings";

// Animations
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const staggerContainer = {
  visible: { transition: { staggerChildren: 0.1 } },
};

// Types
interface UserProgram extends MarketListingForm {
  progress: number;
  nextSession: string;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const { slug } = useParams() as { slug: string };

  const [programs, setPrograms] = useState<UserProgram[]>([]);
  const [ebooks, setEbooks] = useState<MarketListingForm[]>([]);
  const [loading, setLoading] = useState(true);

  const userName = session?.user?.name || "Guest";
  const userEmail = session?.user?.email || "N/A";

  // Fetch enrolled programs & ebooks
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
      const [programRes, ebookRes] = await Promise.all([
        fetch(`${apiBaseUrl}/site/${slug}/me/engagements`),
        fetch(`${apiBaseUrl}/site/${slug}/me/resources`),
      ]);
      
      if (programRes.ok) {
        const programData = await programRes.json();
        setPrograms((programData.items || []).map((item: any) => ({
          ...item,
          id: item.id,
          name: item.notes || 'Program',
          description: `Scheduled for ${new Date(item.startDate).toLocaleDateString()}`,
          progress: Math.floor(Math.random() * 100),
          nextSession: item.startDate ? new Date(item.startDate).toLocaleDateString() : 'TBD',
        })));
      }
      
      if (ebookRes.ok) {
        const ebookData = await ebookRes.json();
        setEbooks((ebookData.items || []).map((item: any) => ({
          ...item,
          id: item.id,
          name: item.name || 'Resource',
          images: item.images || [],
          downloadUrl: item.downloadUrl,
          author: item.author,
        })));
      }
    } catch (error) {
      console.error("Failed to load user dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <section className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="animate-pulse text-xl text-gray-600 dark:text-gray-400">Loading...</div>
      </section>
    );
  }

  if (status === 'unauthenticated' || !session?.user) {
    return (
      <section className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <UserCircleIcon className="w-20 h-20 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Please sign in to access your dashboard.
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

  return (
    <section className="min-h-screen mt-10 bg-gray-50 dark:bg-gray-950 py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <motion.div
          className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
            Welcome Back,{" "}
            <span className="text-blue-600 dark:text-blue-400">
              {userName.split(" ")[0]}
            </span>
            !
          </h1>
          <Link href={`/site/${slug}`} passHref>
            <span className="mt-4 sm:mt-0 text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 transition-colors cursor-pointer">
              <HomeIcon className="w-5 h-5" /> Back to Home
            </span>
          </Link>
        </motion.div>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT COLUMN: Profile */}
          <motion.div
            className="lg:col-span-4 space-y-8"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div
              variants={fadeIn}
              className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl border border-blue-100 dark:border-gray-700 text-center"
            >
              <UserCircleIcon className="w-20 h-20 text-blue-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {userName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {userEmail}
              </p>

              <div className="mt-6 space-y-3">
                <DashboardNavLink
                  icon={UserCircleIcon}
                  label="Edit Profile"
                  href={`/account/profile`}
                />
                <DashboardNavLink
                  icon={CreditCardIcon}
                  label="Billing & Payments"
                  href={`/account/billing`}
                />
              </div>

              <button
                onClick={() => signOut({ callbackUrl: `/site/${slug}` })}
                className="mt-6 w-full py-3 text-sm font-bold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors dark:border-red-800 dark:text-red-400 dark:hover:bg-gray-700"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 inline mr-2" />
                Logout
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeIn}
              className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-orange-100 dark:border-gray-700"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <StarIcon className="w-5 h-5 text-orange-500" /> Your
                Achievements
              </h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <StatBox value={programs.length} label="Programs" color="blue" />
                <StatBox value={ebooks.length} label="Resources" color="orange" />
                <StatBox value="3" label="Modules Done" color="green" />
                <StatBox value="A+" label="Rating" color="purple" />
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT COLUMN: Programs + Resources */}
          <motion.div
            className="lg:col-span-8 space-y-10"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {loading ? (
              <div className="text-center py-20 text-gray-500 dark:text-gray-400 animate-pulse">
                Loading your dashboard...
              </div>
            ) : (
              <>
                {/* Programs */}
                <motion.div variants={fadeIn}>
                  <DashboardSectionHeader
                    title="Your Active Programs"
                    icon={ClipboardDocumentCheckIcon}
                    linkLabel="View All"
                    href={`/my-programs`}
                  />
                  <div className="space-y-4">
                    {programs.length > 0 ? (
                      programs.map((p) => (
                        <DashboardProgramCard
                          key={p.id}
                          program={p}
                          slug={slug}
                        />
                      ))
                    ) : (
                      <NoContentCard
                        message="You are not currently enrolled in any programs."
                        cta="Explore Programs"
                        ctaHref={`/programs`}
                      />
                    )}
                  </div>
                </motion.div>

                {/* Ebooks */}
                <motion.div variants={fadeIn}>
                  <DashboardSectionHeader
                    title="Your Ebooks & Resources"
                    icon={ArrowDownTrayIcon}
                    linkLabel="View All"
                    href={`/my-resources`}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {ebooks.length > 0 ? (
                      ebooks.map((e) => (
                        <DashboardEbookCard key={e.id} ebook={e} />
                      ))
                    ) : (
                      <NoContentCard
                        message="You have not acquired any resources yet."
                        cta="Find Resources"
                        ctaHref={`/resources`}
                        className="sm:col-span-2"
                      />
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Helper Components (same as yours, cleaned up) ---------- */

const DashboardNavLink = ({ icon: Icon, label, href } : { icon: React.ElementType; label: string; href: string; }) => (
  <Link href={href} passHref>
    <div className="flex items-center p-3 rounded-lg text-left text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
      <Icon className="w-5 h-5 text-blue-500 mr-3" />
      <span className="font-semibold text-base flex-grow">{label}</span>
      <ArrowRightOnRectangleIcon className="w-4 h-4 text-gray-400 transform rotate-180" />
    </div>
  </Link>
);

type StatColor = 'blue' | 'orange' | 'green' | 'purple';

const STATBOX_COLORS = {
  blue: "bg-blue-100 text-blue-600",
  orange: "bg-orange-100 text-orange-600",
  green: "bg-green-100 text-green-600",
  purple: "bg-purple-100 text-purple-600",
} as const;

const StatBox = ({ value, label, color } : { value: string | number; label: string; color: StatColor; }) => {
  return (
    <div className="p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
      <p className={`text-3xl font-extrabold ${STATBOX_COLORS[color]} inline-block px-3 py-1 rounded-lg`}>
        {value}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">{label}</p>
    </div>
  );
};

const DashboardSectionHeader = ({ title, icon: Icon, linkLabel, href } : { title: string; icon: React.ElementType; linkLabel: string; href: string; }) => (
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
      <Icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
      {title}
    </h2>
    <Link href={href} passHref>
      <span className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center cursor-pointer">
        {linkLabel} <ArrowRightOnRectangleIcon className="w-4 h-4 ml-1 transform rotate-180" />
      </span>
    </Link>
  </div>
);

const DashboardProgramCard = ({ program, slug } : { program: any; slug: string; }) => (
  <motion.div
    variants={fadeIn}
    className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300 flex flex-col space-y-3"
  >
    <div className="flex items-center space-x-3">
      <ClipboardDocumentCheckIcon className="w-6 h-6 text-blue-500 flex-shrink-0" />
      <h4 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
        {program.name}
      </h4>
    </div>

    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
      {program.description}
    </p>

    {/* Progress */}
    <div className="space-y-1 pt-2">
      <div className="flex justify-between items-center text-xs font-semibold">
        <span className="text-blue-600 dark:text-blue-400">Progress</span>
        <span className="text-gray-800 dark:text-gray-200">
          {program.progress}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div
          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full"
          style={{ width: `${program.progress}%` }}
        />
      </div>
    </div>

    <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400">
        <ClockIcon className="w-4 h-4 text-blue-500" />
        <span>{program.nextSession}</span>
      </div>
      <Link href={`/my-programs/${program.id}`} passHref>
        <span className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1 transition-colors cursor-pointer">
          Go to Program <ArrowRightOnRectangleIcon className="w-4 h-4 rotate-180" />
        </span>
      </Link>
    </div>
  </motion.div>
);

const DashboardEbookCard = ({ ebook } : { ebook: any; }) => (
  <motion.div
    variants={fadeIn}
    className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300"
  >
    <div className="relative w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden shadow-md">
      <Image
        src={ebook.images?.[0] || "https://placehold.co/100x120/EEE/31343C?text=Cover"}
        alt={ebook.name}
        fill
        className="object-cover"
      />
    </div>
    <div className="ml-4 flex-grow space-y-1">
      <h4 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1">
        {ebook.name}
      </h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
        By {ebook.author || "Coach"}
      </p>
    </div>
    <button
      className="ml-4 p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors shadow-md"
      onClick={() => window.open(ebook.downloadUrl || "#", "_blank")}
    >
      <ArrowDownTrayIcon className="w-5 h-5" />
    </button>
  </motion.div>
);

const NoContentCard = ({ message, cta, ctaHref, className = "" } : { message: string; cta: string; ctaHref: string; className?: string; }) => (
  <div
    className={`text-center p-10 bg-gray-100 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 ${className}`}
  >
    <SparklesIcon className="w-10 h-10 text-gray-400 mx-auto mb-4" />
    <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
      {message}
    </p>
    <Link href={ctaHref} passHref>
      <motion.a
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer"
      >
        {cta}
      </motion.a>
    </Link>
  </div>
);



// import React from 'react';
// import { 
//   StarIcon, 
//   MapPinIcon, 
//   CalendarDaysIcon, 
//   MegaphoneIcon, 
//   PhotoIcon,
//   ChartBarIcon,
//   ClockIcon,
//   UserGroupIcon,
//   EnvelopeIcon,
//   ChevronRightIcon
// } from '@heroicons/react/24/solid';

// const DownloadIcon = (props) => (
//   <svg 
//     xmlns="http://www.w3.org/2000/svg" 
//     fill="none" 
//     viewBox="0 0 24 24" 
//     strokeWidth={2} 
//     stroke="currentColor" 
//     {...props}
//   >
//     <path 
//       strokeLinecap="round" 
//       strokeLinejoin="round" 
//       d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7-10l5 5m0 0l5-5m-5 5V4" 
//     />
//   </svg>
// );

// const SpeakerDashboard = () => {
//   return (
//     <div className="min-h-screen bg-gray-950 text-gray-200 font-sans selection:bg-fuchsia-800 selection:text-white">
      
//       {/* --- SPEAKER BRANDING & RATING --- */}
//       <div className="bg-gray-900 border-b border-fuchsia-900/50 pt-8 pb-12 shadow-2xl shadow-black/50">
//         <div className="max-w-7xl mx-auto px-6 lg:px-8">
//           <div className="flex items-start gap-8">
            
//             {/* Avatar & Spotlight Effect */}
//             <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-fuchsia-500 to-purple-600 relative flex-shrink-0">
//               <div className="absolute inset-0 rounded-full bg-fuchsia-500/10 blur-xl opacity-70"></div>
//               <img 
//                 src="https://images.unsplash.com/photo-1581456492476-c290e2f54a8e?q=80&w=2000&auto=format&fit=crop" 
//                 alt="Speaker Avatar" 
//                 className="w-full h-full object-cover rounded-full border-4 border-gray-900"
//               />
//             </div>
            
//             {/* Info & Tagline */}
//             <div>
//               <p className="text-sm font-mono text-fuchsia-400 uppercase tracking-widest mb-1">Impact Speaker</p>
//               <h1 className="text-4xl font-extrabold text-white">DR. SERAPHINA VANCE</h1>
//               <p className="text-xl font-light text-gray-400 mt-2">
//                 "Strategy, Innovation, and the Future of Human-AI Collaboration."
//               </p>
              
//               {/* Rating */}
//               <div className="flex items-center gap-2 mt-4">
//                 <StarRating rating={4.9} />
//                 <span className="text-sm text-gray-500">· 124 Verified Bookings</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       {/* --- MAIN DASHBOARD CONTENT --- */}
//       <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
//           {/* LEFT COLUMN: Upcoming Engagements (The Schedule Focus) */}
//           <div className="lg:col-span-2 space-y-8">
//             <h2 className="text-2xl font-bold text-white uppercase tracking-wide border-l-4 border-fuchsia-500 pl-3">
//               <CalendarDaysIcon className="w-6 h-6 inline-block mr-2 text-fuchsia-400" /> 
//               Upcoming Engagements
//             </h2>

//             <div className="bg-gray-900 rounded-xl shadow-xl shadow-black/30 border border-gray-800 divide-y divide-gray-800">
//               <EngagementItem 
//                 date="05 DEC" 
//                 time="14:00 GMT" 
//                 client="Tech Horizons Summit" 
//                 topic="The Trust Deficit in AI"
//                 location="London, UK"
//                 status="Confirmed"
//               />
//               <EngagementItem 
//                 date="18 JAN" 
//                 time="10:30 PST" 
//                 client="Global Leadership Retreat" 
//                 topic="Leading in the Age of Acceleration"
//                 location="San Francisco, USA"
//                 status="Confirmed"
//               />
//               <EngagementItem 
//                 date="22 FEB" 
//                 time="19:00 EST" 
//                 client="Fortune 500 Board Meeting" 
//                 topic="Private Briefing on Cyber Risk"
//                 location="New York, USA"
//                 status="Pending Contract"
//               />
//             </div>

//             {/* Quick Actions Panel */}
//             <div className="grid grid-cols-2 gap-4">
//               <QuickActionCard 
//                 icon={<MegaphoneIcon />} 
//                 title="New Booking Request" 
//                 subtitle="Review 2 new leads" 
//                 color="fuchsia"
//               />
//               <QuickActionCard 
//                 icon={<EnvelopeIcon />} 
//                 title="Client Messages" 
//                 subtitle="3 unread communications" 
//                 color="cyan"
//               />
//             </div>
//           </div>
          
//           {/* RIGHT COLUMN: Assets & Metrics */}
//           <div className="lg:col-span-1 space-y-8">
            
//             {/* Media Kit & Downloads */}
//             <div className="bg-gray-900 p-6 rounded-xl shadow-xl shadow-black/30 border border-gray-800">
//               <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
//                  <PhotoIcon className="w-5 h-5 text-gray-500" /> Media & Assets
//               </h3>
//               <div className="space-y-3">
//                 <MediaDownloadItem name="Official Speaker Bio (PDF)" type="PDF" />
//                 <MediaDownloadItem name="High-Res Headshots" type="ZIP" />
//                 <MediaDownloadItem name="Keynote Deck Template" type="PPTX" />
//               </div>
//             </div>

//             {/* Performance Metrics */}
//             <div className="bg-gray-900 p-6 rounded-xl shadow-xl shadow-black/30 border border-gray-800">
//                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
//                  <ChartBarIcon className="w-5 h-5 text-gray-500" /> Impact Metrics
//                </h3>
//                <MetricDisplay title="Total Talks Given" value="38" color="fuchsia" />
//                <MetricDisplay title="Avg. Audience Size" value="550" color="cyan" />
//                <MetricDisplay title="Client Re-Book Rate" value="85%" color="green" />
//             </div>

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- SUB COMPONENTS ---

// const StarRating = ({ rating }) => (
//   <div className="flex items-center">
//     {[...Array(5)].map((_, i) => (
//       <StarIcon 
//         key={i} 
//         className={`w-5 h-5 ${
//           rating > i ? 'text-yellow-400' : 'text-gray-700'
//         }`} 
//       />
//     ))}
//     <span className="ml-2 font-bold text-lg text-white">{rating}</span>
//   </div>
// );

// const EngagementItem = ({ date, time, client, topic, location, status }) => {
//   const statusColor = status.includes('Confirmed') ? 'border-green-500' : 'border-amber-500';
//   const statusText = status.includes('Confirmed') ? 'text-green-400' : 'text-amber-400';
  
//   return (
//     <div className={`p-4 flex items-center justify-between border-l-4 ${statusColor} hover:bg-gray-800/70 transition-colors cursor-pointer group`}>
//       <div className="flex items-start gap-4">
//         {/* Date Block */}
//         <div className="text-center w-12 flex-shrink-0">
//           <p className="text-xs font-mono text-gray-500 leading-none">{date.split(' ')[1]}</p>
//           <p className="text-xl font-bold text-white leading-none">{date.split(' ')[0]}</p>
//         </div>
//         {/* Details */}
//         <div>
//           <p className="font-semibold text-white group-hover:text-fuchsia-400 transition-colors">{client}</p>
//           <p className="text-sm text-gray-400 italic">"{topic}"</p>
//           <div className="flex items-center text-xs text-gray-500 mt-1 gap-3">
//             <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3"/> {time}</span>
//             <span className="flex items-center gap-1"><MapPinIcon className="w-3 h-3"/> {location}</span>
//           </div>
//         </div>
//       </div>
      
//       <div className="text-right flex items-center gap-2">
//         <span className={`text-xs font-mono font-bold uppercase ${statusText}`}>{status}</span>
//         <ChevronRightIcon className="w-4 h-4 text-gray-600 group-hover:text-fuchsia-400 transition-colors" />
//       </div>
//     </div>
//   );
// };

// const MediaDownloadItem = ({ name, type }) => (
//   <div className="flex justify-between items-center py-2 group cursor-pointer border-b border-gray-800 last:border-b-0">
//     <div className="flex items-center gap-3">
//       <DownloadIcon className="w-5 h-5 text-gray-600 group-hover:text-fuchsia-400 transition-colors" />
//       <p className="text-sm text-white group-hover:text-fuchsia-400">{name}</p>
//     </div>
//     <span className="text-xs font-mono text-gray-500">{type}</span>
//   </div>
// );

// const MetricDisplay = ({ title, value, color }) => (
//   <div className="flex justify-between items-center py-3 border-b border-gray-800 last:border-b-0">
//     <p className="text-sm text-gray-400">{title}</p>
//     <p className={`text-lg font-bold text-white text-${color}-400`}>{value}</p>
//   </div>
// );

// const QuickActionCard = ({ icon, title, subtitle, color }) => (
//   <div className={`p-4 bg-gray-900 rounded-xl border border-gray-800 flex items-center gap-4 group cursor-pointer hover:border-${color}-500 transition-colors`}>
//     <div className={`w-10 h-10 rounded-full bg-${color}-500/20 flex items-center justify-center text-${color}-400`}>
//       {icon}
//     </div>
//     <div>
//       <p className="font-bold text-sm text-white">{title}</p>
//       <p className="text-xs text-gray-500">{subtitle}</p>
//     </div>
//     <ChevronRightIcon className="w-4 h-4 ml-auto text-gray-600 group-hover:text-white transition-colors" />
//   </div>
// );

// export default SpeakerDashboard;