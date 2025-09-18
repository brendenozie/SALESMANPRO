"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { SunIcon, MoonIcon, Bars3CenterLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";

// Note: In a single-file component, we will use a simple prop
// or hardcoded data instead of a shared context for simplicity.
interface HeaderProps {
    storeName: string;
}

export default function Header({ storeName = "Fitness" }: HeaderProps) {
    const [darkMode, setDarkMode] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Toggle dark mode on <html> element
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [darkMode]);

    const navLinks = [
        { name: "Home", href: "#" },
        { name: "Programs", href: "#" },
        { name: "Trainers", href: "#" },
        { name: "About", href: "#" },
        { name: "Contact", href: "#" },
    ];

    const menuVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeIn" } },
    };

    return (
        <header className="absolute top-0 inset-x-0 z-50 font-sans">
            <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between h-20 bg-white/50 backdrop-blur-md transition-colors duration-300 rounded-b-2xl shadow-sm">
                {/* Logo / Site Name */}
                <a href="#" className="text-gray-800 text-3xl font-extrabold tracking-tight">
                    {storeName}
                </a>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-gray-800 hover:text-teal-600 font-medium transition-colors"
                        >
                            {link.name}
                        </a>
                    ))}

                    {/* Theme Toggle */}
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="ml-4 p-2 rounded-full bg-gray-200/50 hover:bg-gray-300/50 transition"
                        aria-label="Toggle Dark Mode"
                    >
                        {darkMode ? (
                            <SunIcon className="w-5 h-5 text-gray-800" />
                        ) : (
                            <MoonIcon className="w-5 h-5 text-gray-800" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center">
                    <button
                        onClick={() => setMobileOpen((prev) => !prev)}
                        className="p-2 rounded-full bg-gray-200/50 hover:bg-gray-300/50 transition"
                        aria-label="Toggle Menu"
                    >
                        {mobileOpen ? (
                            <XMarkIcon className="w-6 h-6 text-gray-800" />
                        ) : (
                            <Bars3CenterLeftIcon className="w-6 h-6 text-gray-800" />
                        )}
                    </button>
                </div>
            </nav>

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        className="md:hidden bg-white/90 backdrop-blur-md py-4 shadow-lg rounded-b-2xl"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={menuVariants}
                    >
                        <div className="px-6 space-y-4">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="block text-gray-800 text-lg font-medium hover:text-teal-600 transition"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    {link.name}
                                </a>
                            ))}

                            {/* Mobile Theme Toggle */}
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className="flex items-center space-x-2 mt-4 p-2 rounded-full bg-gray-200/50 hover:bg-gray-300/50 transition text-gray-800"
                                aria-label="Toggle Dark Mode"
                            >
                                {darkMode ? (
                                    <>
                                        <SunIcon className="w-5 h-5" />
                                        <span>Light Mode</span>
                                    </>
                                ) : (
                                    <>
                                        <MoonIcon className="w-5 h-5" />
                                        <span>Dark Mode</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
