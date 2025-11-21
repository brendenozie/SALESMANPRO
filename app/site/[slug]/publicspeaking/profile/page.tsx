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

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

export default function UserDashboard() {
  const { data: session } = useSession();
  const { slug } = useParams() as { slug: string };

  const [programs, setPrograms] = useState<UserProgram[]>([]);
  const [ebooks, setEbooks] = useState<MarketListingForm[]>([]);
  const [loading, setLoading] = useState(true);

  const userName = session?.user?.name || "Guest";
  const userEmail = session?.user?.email || "N/A";

  // Fetch enrolled programs & ebooks
  useEffect(() => {
    if (!session?.user) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const [programRes, ebookRes] = await Promise.all([
          fetch(`${apiBaseUrl}/${slug}/user/enrollments`),
          fetch(`${apiBaseUrl}/${slug}/user/resources`),
        ]);
        const [programData, ebookData] = await Promise.all([
          programRes.json(),
          ebookRes.json(),
        ]);
        setPrograms(programData || []);
        setEbooks(ebookData || []);
      } catch (error) {
        console.error("Failed to load user dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session, slug]);

  if (!session?.user) {
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
