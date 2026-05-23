'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
    Bars3Icon,
    XMarkIcon,
    MagnifyingGlassIcon,
    BellIcon,
    UserIcon,
} from "@heroicons/react/24/outline";
import { useStateContext } from "@/contexts/ContextProvider"; 
import { useStoreContext } from "@/contexts/StoreContext"; 
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

// Mocking external hooks/context data to ensure the component is runnable
// const useStoreContext = () => ({ storeFormData: { logoUrl: '', name: 'CorpTech' } });
// const useStateContext = () => ({ cart: [] });
// const useSession = () => ({ data: null });
// const signOut = (options: { callbackUrl: string }) => console.log('Signing out to:', options.callbackUrl);
// const useRouter = () => ({ push: (path: string) => console.log('Navigating to:', path) });


export default function EnhancedMediaHeader() {
    const router = useRouter();
    const { storeFormData } = useStoreContext();
    const { cart } = useStateContext();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    /** AUTH (Mocked for runnable example) */
    const { data: session } = useSession();
    const user = session?.user as { name?: string; role?: string } | undefined;

    /** LOGIN / REGISTER (Kept original logic/URLs) */
    const handleGoogleSignIn = () => {
        const authUrl = new URL("https://auth.salesmanpro.site/signin");
        authUrl.searchParams.set("callbackUrl", window.location.origin);
        window.location.href = authUrl.toString();
    };

    const handleGoogleSignUp = () => {
        const authUrl = new URL("https://auth.salesmanpro.site/signup");
        authUrl.searchParams.set("callbackUrl", window.location.origin);
        window.location.href = authUrl.toString();
    };

    /** PROFILE ROUTE */
    const handleProfileClick = () => {
        if (!user) return handleGoogleSignIn();

        if (user.role?.toLowerCase() === "admin") {
            router.push("/dashboards");
        } else {
            router.push("/media/profile");
        }
    };

    /** Scroll behavior */
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    /** Close dropdown when clicking outside */
    useEffect(() => {
        const close = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest(".profile-dropdown-trigger") &&
                !(e.target as HTMLElement).closest(".profile-dropdown")) {
                setDropdownOpen(false);
            }
        };
        window.addEventListener("click", close);
        return () => window.removeEventListener("click", close);
    }, []);

    /** Navigation */
    const navItems = [
        { label: "Home", href: `/` },
        { label: "Solutions", href: `/#solutions` }, // Renamed Articles to Solutions
        { label: "Insights", href: `/#insights` }, // Renamed Videos to Insights
        { label: "Industries", href: `/#industries` }, // Renamed Categories to Industries
        { label: "About Us", href: `/#about` },
    ];

    /** Logo loader */
    const loader = ({
        src,
        width,
        quality,
    }: {
        src: string;
        width: number;
        quality?: number;
    }) => `${src}?w=${width}&q=${quality || 75}`;

    return (
        <header
            className={`fixed inset-x-0 top-0 z-50 transition-all border-b border-transparent ${
                // Light mode background transition
                scrolled 
                    ? "bg-white/95 backdrop-blur-lg shadow-xl border-gray-100" 
                    : "bg-white/10 backdrop-blur-sm" // Slightly transparent when at the top
            }`}
        >
            {/* MAIN NAV */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href={`/`} className="flex-shrink-0 flex items-center">
                        {storeFormData?.logoUrl ? (
                            <Image
                                loader={loader}
                                src={storeFormData.logoUrl}
                                alt={storeFormData.name}
                                width={140}
                                height={48}
                                className="object-contain w-32 h-20"
                                priority
                            />
                        ) : (
                            // Text color changed to primary dark gray
                            <span className="text-2xl font-extrabold text-gray-900">
                                {storeFormData?.name}
                            </span>
                        )}
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex space-x-8">
                        {navItems.map((item) => (
                            <motion.div
                                key={item.label}
                                whileHover={{ y: -2, scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <Link
                                    href={item.href}
                                    // Text color changed to dark, hover changed to indigo
                                    className="text-gray-700 font-medium hover:text-indigo-600 transition-colors"
                                >
                                    {item.label}
                                </Link>
                            </motion.div>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center space-x-4">
                        {/* Search */}
                        <div className="relative hidden md:block">
                            <input
                                type="search"
                                placeholder="Search..."
                                // Light mode search bar
                                className="pl-10 pr-4 py-2 rounded-full bg-gray-100 text-sm text-gray-800 placeholder-gray-500 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                            />
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                        </div>

                        {/* Notifications */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            // Light mode icon hover
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <BellIcon className="h-6 w-6 text-gray-700" />
                        </motion.button>

                        {/* AUTH SECTION */}
                        <div className="relative">
                            {user ? (
                                <>
                                    {/* Profile Button */}
                                    <motion.button
                                        onClick={() => setDropdownOpen((prev) => !prev)}
                                        whileHover={{ scale: 1.05 }}
                                        // Light mode profile button
                                        className="profile-dropdown-trigger flex items-center gap-2 px-3 py-1 rounded-full hover:bg-gray-100 transition"
                                    >
                                        <UserIcon className="h-6 w-6 text-gray-700" />
                                        <span className="hidden md:block text-gray-700 font-medium">
                                            {user.name || "Profile"}
                                        </span>
                                    </motion.button>

                                    {/* Dropdown */}
                                    <AnimatePresence>
                                        {dropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                                // Light mode dropdown style
                                                className="profile-dropdown absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-2xl border border-gray-200 p-2 z-50"
                                            >
                                                <button
                                                    onClick={handleProfileClick}
                                                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-indigo-50 text-gray-800"
                                                >
                                                    Profile
                                                </button>

                                                {user.role?.toLowerCase() === "admin" && (
                                                    <button
                                                        onClick={() => router.push("/dashboards")}
                                                        className="w-full text-left px-4 py-2 rounded-lg hover:bg-indigo-50 text-gray-800"
                                                    >
                                                        Admin Dashboard
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => signOut({ redirect: true, callbackUrl: `${window.location.origin || window.location.href || "/"}` })}
                                                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-red-50 text-red-600"
                                                >
                                                    Logout
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={handleGoogleSignIn}
                                        // Light mode primary button (Indigo)
                                        className="px-4 py-2 rounded-full text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition"
                                    >
                                        Login
                                    </button>
                                    <button
                                        onClick={handleGoogleSignUp}
                                        // Light mode secondary button (Outlined Indigo)
                                        className="hidden sm:block px-4 py-2 rounded-full text-sm font-medium border border-indigo-500 text-indigo-600 hover:bg-indigo-50 transition"
                                    >
                                        Register
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Toggle menu"
                        >
                            {/* Icon colors changed to dark */}
                            {mobileOpen ? (
                                <XMarkIcon className="h-6 w-6 text-gray-700" />
                            ) : (
                                <Bars3Icon className="h-6 w-6 text-gray-700" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.nav
                        // Light mode mobile menu background
                        className="lg:hidden bg-white shadow-xl border-t border-gray-200"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="px-4 py-4 space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    // Mobile link styling
                                    className="block text-gray-700 px-3 py-2 rounded-lg font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}

                            {/* Auth for mobile */}
                            <div className="pt-4 mt-2 border-t border-gray-200 space-y-1">
                                {user ? (
                                    <>
                                        <button
                                            onClick={handleProfileClick}
                                            className="block text-left w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                                        >
                                            Profile
                                        </button>

                                        <button
                                            onClick={() => signOut({ redirect: true, callbackUrl: `${window.location.origin || window.location.href || "/"}` })}
                                            className="block text-left w-full px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {/* Login as primary color */}
                                        <button
                                            onClick={handleGoogleSignIn}
                                            className="block text-left w-full px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                                        >
                                            Login
                                        </button>

                                        {/* Register as secondary/outlined */}
                                        <button
                                            onClick={handleGoogleSignUp}
                                            className="block text-left w-full px-3 py-2 rounded-lg text-indigo-600 border border-indigo-500 hover:bg-indigo-50"
                                        >
                                            Register
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>
        </header>
    );
}