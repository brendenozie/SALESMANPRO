'use client';

import React from "react";
// Replaced "next/link" with standard anchor tag functionality to resolve compilation error
// import Link from "next/link"; 
import { motion } from "framer-motion";
import { useStoreContext } from "@/contexts/StoreContext";
import { FaceFrownIcon } from "@heroicons/react/24/solid";

// --- Interfaces for type consistency ---
interface Category {
    id: number;
    name: string; // Using 'name' since 'displayName' is not in the provided interface
    slug: string;
}

interface SocialLink {
    channel: string;
    url: string;
}

interface StoreFormData {
    name: string;
    slug: string;
    description?: string;
    categories: Category[]; // Assuming this is the correct property, not 'StoreCategory'
    socialLinks: SocialLink[];
}

// Mocking the context hook for a runnable component
const mockStoreData: StoreFormData = {
    name: "CorpTech Solutions",
    slug: "corptech-solutions",
    description: "Driving digital transformation through expert consulting, innovative technology, and actionable insights for global enterprises.",
    categories: [
        { id: 1, name: "Cloud Strategy", slug: "cloud-strategy" },
        { id: 2, name: "Data Analytics", slug: "data-analytics" },
        { id: 3, name: "Cybersecurity", slug: "cybersecurity" },
        { id: 4, name: "Managed Services", slug: "managed-services" },
    ],
    socialLinks: [
        { channel: "Facebook", url: "#" },
        { channel: "Twitter", url: "#" },
        { channel: "LinkedIn", url: "#" },
        { channel: "Youtube", url: "#" },
    ],
};
// const useStoreContext = () => ({ storeFormData: mockStoreData });

// --- Component Start ---

const Footer: React.FC = () => {
    const year = new Date().getFullYear();
    const { storeFormData  } = useStoreContext();

    // Helper function to render a sleek social media icon using inline SVG
        const renderSocialIcon = (channel: unknown) => {
            const size = "w-5 h-5";
            const normalized = String(channel).toLowerCase();
    
            switch (normalized) {
                case "facebook":
                    return (
                        <svg className={size} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path
                                fillRule="evenodd"
                                d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33V22C17.343 21.128 22 16.991 22 12z"
                                clipRule="evenodd"
                            />
                        </svg>
                    );
                case "twitter":
                    // Using 'X' icon for consistency with modern platforms
                case "x":
                    return (
                        <svg className={size} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M18.901 1.153h3.682l-8.337 9.851L24 22.842h-8.086l-6.071-7.234-5.617 7.234H.092l8.59-10.138L.092 1.153h8.336l5.357 6.417 4.216-6.417zM16.945 20.843h2.396L6.501 3.25H4.07z" />
                        </svg>
                    );
                case "instagram":
                    return (
                        <svg className={size} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path
                                fillRule="evenodd"
                                d="M12.315 2c2.43 0 2.685.007 3.62.052.836.042 1.464.184 1.965.378.52.204.996.48 1.41.894.414.414.69.89.893 1.41.194.5.336 1.13.378 1.965.045.935.051 1.19.051 3.62 0 2.43-.006 2.685-.051 3.62-.042.836-.184 1.464-.378 1.965-.204.52-.48 1.002-.894 1.415-.414.414-.89.69-1.41.893-.5.194-1.13.336-1.965.378-.935.045-1.19.051-3.62.051-2.43 0-2.685-.006-3.62-.051-.836-.042-1.464-.184-1.965-.378-.52-.204-.996-.48-1.41-.894-.414-.414-.69-.89-.893-1.41-.194-.5-.336-1.13-.378-1.965-.045-.935-.051-1.19-.051-3.62 0-2.43.006-2.685.051-3.62.042-.836.184-1.464.378-1.965.204-.52.48-.996.894-1.41.414-.414.89-.69 1.41-.893.5-.194 1.13-.336 1.965-.378.935-.045 1.19-.051 3.62-.051zm0-2c-2.727 0-3.071.01-4.125.06-1.07.05-1.79.215-2.42.465-.675.275-1.22.6-1.85.83-.5.23-1.17.43-1.61.875-.44.445-.645 1.115-.875 1.61-.23.63-.395 1.35-.465 2.42-.05 1.054-.06 1.398-.06 4.125 0 2.727.01 3.071.06 4.125.05 1.07.215 1.79.465 2.42.275.675.6 1.22.83 1.85.23.5.43 1.17.875 1.61.445.44.75 1.015 1.01 1.61.26.6.435 1.22.465 2.01.03.79.06 1.49.06 4.125h-2c-2.6 0-2.95-.01-4-.06-1-.05-1.65-.2-2.32-.45-.7-.3-1.3-.65-1.98-1.04-.68-.4-1.3-.85-1.74-1.45-.44-.6-.79-1.3-.92-1.98-.13-.68-.2-1.37-.2-4.125h-2c0-2.6.01-2.95.06-4 .05-1 .2-1.65.45-2.32.3-.7.65-1.3 1.04-1.98.4-.68.85-1.3 1.45-1.74.6-.44 1.3-.79 1.98-.92.68-.13 1.37-.2 4.125-.2h2c2.6 0 2.95.01 4 .06 1 .05 1.65.2 2.32.45.7.3 1.3.65 1.98 1.04.68.4 1.3.85 1.74 1.45.44.6.79 1.3.92 1.98.13.68.2 1.37.2 4.125h2c0-2.6-.01-2.95-.06-4-.05-1-.2-1.65-.45-2.32-.3-.7-.65-1.3-1.04-1.98-.4-.68-.85-1.3-1.45-1.74-.6-.44-1.3-.79-1.98-.92-.68-.13-1.37-.2-4.125-.2zM12 9a3 3 0 100 6 3 3 0 000-6zm0 2a1 1 0 110 2 1 1 0 010-2z"
                            />
                        </svg>
                    );
                case "linkedin":
                    return (
                        <svg className={size} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.567-4 0v5.604h-3v-11h3v1.765c1.396-2.423 7-2.215 7 3.515v5.72z" />
                        </svg>
                    );
                case "youtube":
                    return (
                        <svg className={size} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M21.583 7.179c-.232-.862-1.066-1.25-2.147-1.317C17.781 5.768 12 5.768 12 5.768s-5.781 0-7.436.094c-1.08.067-1.916.455-2.147 1.317C2.188 8.871 2.062 12 2.062 12s.126 3.129.357 4.821c.231.862 1.066 1.25 2.147 1.317C6.219 18.232 12 18.232 12 18.232s5.781 0 7.436-.094c1.08-.067 1.916-.455 2.147-1.317.231-1.692.357-4.821.357-4.821s-.126-3.129-.357-4.821zm-11.233 7.821V9.018l4.434 3.091-4.434 3.091z" />
                        </svg>
                    );
                default:
                    // Fallback to the text initial if the channel is unknown
                    return <div className={`p-1 border border-current rounded-full ${size} flex items-center justify-center text-xs font-bold uppercase`}>{String(channel).charAt(0)}</div>;
            }
        };

    // Helper component to replace Next.js Link
    const NavLink: React.FC<{ href: string; className: string; children: React.ReactNode }> = ({ href, className, children }) => (
        <a href={href} className={className}>
            {children}
        </a>
    );


    return (
        <footer className="bg-white text-gray-700 pt-16 border-t border-gray-100 shadow-inner">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-10 border-b border-gray-200 pb-12">
                {/* About */}
                <div className="col-span-2 lg:col-span-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        {storeFormData?.name || "CorpTech"}
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-600">
                        {storeFormData?.description ||
                            "Driving digital transformation through expert consulting, innovative technology, and actionable insights for global enterprises."}
                    </p>
                </div>

                {/* Industries (Categories) */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Industries
                    </h3>
                    <ul className="space-y-3 text-sm">
                        {/* Corrected property access to 'categories' and used 'name' */}
                        {storeFormData?.StoreCategory.slice(0, 5).map((cat) => (
                            <li key={cat.id}>
                                <NavLink
                                    href={`/industries/${cat.categoryId}`}
                                    className="text-gray-600 hover:text-indigo-600 transition-colors"
                                >
                                    {cat.displayName}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Quick Links (Corporate Focus) */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Quick Links
                    </h3>
                    <ul className="space-y-3 text-sm">
                        <li>
                            <NavLink
                                href={`/`}
                                className="text-gray-600 hover:text-indigo-600 transition-colors"
                            >
                                Home
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                href={`/solutions`}
                                className="text-gray-600 hover:text-indigo-600 transition-colors"
                            >
                                Solutions
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                href={`/insights`}
                                className="text-gray-600 hover:text-indigo-600 transition-colors"
                            >
                                Insights
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                href={`/about`}
                                className="text-gray-600 hover:text-indigo-600 transition-colors"
                            >
                                About Us
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                href={`/contact`}
                                className="text-gray-600 hover:text-indigo-600 transition-colors"
                            >
                                Contact
                            </NavLink>
                        </li>
                    </ul>
                </div>

                {/* Follow & Legal */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Connect
                    </h3>
                    <div className="flex space-x-5 mb-8">
                        {storeFormData?.socialLinks.map((s) => (
                            <motion.a
                                key={s.channel}
                                href={s.url}
                                target="_blank"
                                rel="noreferrer"
                                whileHover={{ scale: 1.2, color: "#4F46E5" }} // Indigo-600 hex
                                transition={{ type: "spring", stiffness: 400 }}
                                // Icon color in light mode: subtle gray, hover is indigo
                                className="text-gray-500 hover:text-indigo-600 transition-colors"
                                aria-label={`Follow us on ${s.channel}`}
                            >
                                {renderSocialIcon(s.channel)}
                            </motion.a>
                        ))}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Legal
                    </h3>
                    <ul className="space-y-3 text-sm">
                        <li>
                            <NavLink
                                href={`/privacy`}
                                className="text-gray-600 hover:text-indigo-600 transition-colors"
                            >
                                Privacy Policy
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                href={`/terms`}
                                className="text-gray-600 hover:text-indigo-600 transition-colors"
                            >
                                Terms of Service
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500 pb-8">
                &copy; {year} {storeFormData?.name}. All rights reserved.
            </div>
      <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 shadow-sm">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Powered by</span>
        <a 
          href="https://salesmanpro.site" 
          className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 transition-colors"
        >
          SalesmanPro.site
        </a>
    </div>

        </footer>
    );
};

export default Footer;