"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Bars3BottomLeftIcon,
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline";
import { useStoreContext } from "../../../../../contexts/StoreContext";
import { useRouter } from "next/navigation";

//----------------------------------------------
// Image loader (same as elsewhere)
//----------------------------------------------
const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

const navItems = ['Home', 'About', 'Causes', 'Pages', 'Contact'];

//----------------------------------------------
// Header for NonProfitSite (pulls from StoreContext)
//----------------------------------------------
export default function Header() {
  const router = useRouter();
  const { storeFormData } = useStoreContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
    name,
    slug,
    logoUrl,
    contactEmail,
    contactPhone,
    socialLinks,
    themeSettings,
  } = storeFormData;

  const primary = themeSettings?.primaryColor || "#10B981"; // green fallback
  const secondary = themeSettings?.secondaryColor || "#047857"; // darker green

  return (
          <motion.header
            initial={{ backgroundColor: 'rgba(0,0,0,0)' }}
            whileInView={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
            transition={{ duration: 0.3 }}
            className="fixed w-full z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between p-2 text-sm text-white">
              <div className="space-x-4">
                <a href="mailto:info@kindflow.org" className="hover:underline">info@kindflow.org</a>
                <span>|</span>
                <a href="tel:+1234567890" className="hover:underline">+1 (234) 567-890</a>
              </div>
              <div className="space-x-4 flex items-center">
                {/* Social icons placeholder */}
                <button className="bg-orange-500 hover:bg-orange-600 px-4 py-1 rounded-md transition">
                  Donate Now
                </button>
              </div>
            </div>
            <nav className="bg-transparent">
              <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
                <div className="text-2xl font-bold text-white cursor-pointer" onClick={() => router.push('/')}>KindFlow</div>
                <ul className="hidden md:flex space-x-8 text-white">
                  {navItems.map((item) => (
                    <li key={item} className="relative group">
                      <Link href={`#${item.toLowerCase()}`}>{item}</Link>
                      <motion.span
                        className="absolute left-0 -bottom-1 h-0.5 bg-orange-500"
                        layoutId="underline"
                        initial={{ width: 0 }}
                        whileHover={{ width: '100%' }}
                        transition={{ duration: 0.3 }}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
        </motion.header>
    // <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm transition-shadow">
    //   {/* ── Top Info Bar (desktop) ── */}
    //   <div
    //     className="hidden md:flex justify-between items-center px-6 py-2 text-sm font-medium"
    //     style={{ backgroundColor: `${primary}1A`, color: primary }}
    //   >
    //     <div className="flex items-center space-x-6">
    //       {contactEmail && (
    //         <a
    //           href={`mailto:${contactEmail}`}
    //           className="flex items-center space-x-1 uppercase hover:underline"
    //         >
    //           <MegaphoneIcon className="h-4 w-4" />
    //           <span>{contactEmail}</span>
    //         </a>
    //       )}
    //       {contactPhone && (
    //         <a
    //           href={`tel:${contactPhone}`}
    //           className="flex items-center space-x-1 hover:underline"
    //         >
    //           <PhoneIcon className="h-4 w-4" />
    //           <span>{contactPhone}</span>
    //         </a>
    //       )}
    //     </div>
    //     <div className="flex space-x-4">
    //       {socialLinks.map((s) => (
    //         <a
    //           key={s.channel}
    //           href={s.url}
    //           target="_blank"
    //           rel="noreferrer"
    //           style={{ color: primary }}
    //           onMouseEnter={(e) => (e.currentTarget.style.color = secondary)}
    //           onMouseLeave={(e) => (e.currentTarget.style.color = primary)}
    //           className="capitalize transition-colors"
    //         >
    //           {s.channel}
    //         </a>
    //       ))}
    //     </div>
    //   </div>

    //   {/* ── Main Header ── */}
    //   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    //     <div className="flex items-center justify-between h-20">
    //       {/* Logo & Navigation (desktop) */}
    //       <div className="flex items-center space-x-4">
    //         <Link href={`/${slug}`} className="flex items-center space-x-2">
    //           {logoUrl ? (
    //             <Image
    //               src={logoUrl}
    //               alt={name}
    //               width={120}
    //               height={40}
    //               className="object-contain"
    //               loader={loader}
    //             />
    //           ) : (
    //             <span className="text-xl font-bold text-gray-800 dark:text-white">
    //               {name}
    //             </span>
    //           )}
    //         </Link>

    //         <nav className="hidden lg:flex space-x-6 font-medium text-gray-700 dark:text-gray-200">
    //           <Link
    //             href={`/${slug}`}
    //             className="hover:underline"
    //             style={{ color: "#444" }}
    //             onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
    //             onMouseLeave={(e) =>
    //               (e.currentTarget.style.color = "#444")
    //             }
    //           >
    //             Home
    //           </Link>

    //           <Link
    //             href={`/${slug}/programs`}
    //             className="hover:underline"
    //             style={{ color: "#444" }}
    //             onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
    //             onMouseLeave={(e) =>
    //               (e.currentTarget.style.color = "#444")
    //             }
    //           >
    //             Programs
    //           </Link>

    //           <Link
    //             href={`/${slug}/donate`}
    //             className="hover:underline"
    //             style={{ color: "#444" }}
    //             onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
    //             onMouseLeave={(e) =>
    //               (e.currentTarget.style.color = "#444")
    //             }
    //           >
    //             Donate
    //           </Link>

    //           <Link
    //             href={`/${slug}/contact`}
    //             className="hover:underline"
    //             style={{ color: "#444" }}
    //             onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
    //             onMouseLeave={(e) =>
    //               (e.currentTarget.style.color = "#444")
    //             }
    //           >
    //             Contact
    //           </Link>
    //         </nav>
    //       </div>

    //       {/* User Icon (e.g., volunteer login) */}
    //       <div className="flex items-center space-x-4">
    //         <motion.button
    //           whileHover={{ scale: 1.1 }}
    //           onClick={() => router.push(`/${slug}/profile`)}
    //           className="text-gray-600 dark:text-gray-200"
    //         >
    //           <UserIcon className="h-6 w-6" />
    //         </motion.button>

    //         {/* Mobile menu toggle */}
    //         <button
    //           className="lg:hidden text-gray-600 dark:text-gray-200"
    //           onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
    //           aria-label="Toggle menu"
    //         >
    //           {mobileMenuOpen ? (
    //             <XMarkIcon className="h-6 w-6" />
    //           ) : (
    //             <Bars3BottomLeftIcon className="h-6 w-6" />
    //           )}
    //         </button>
    //       </div>
    //     </div>
    //   </div>

    //   {/* ── Mobile Menu ── */}
    //   {mobileMenuOpen && (
    //     <div className="lg:hidden bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 py-4 shadow-md">
    //       <div className="space-y-3">
    //         <Link
    //           href={`/${slug}`}
    //           className="block hover:underline text-gray-700 dark:text-gray-200"
    //           style={{ color: "#444" }}
    //           onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
    //           onMouseLeave={(e) =>
    //             (e.currentTarget.style.color = "#444")
    //           }
    //         >
    //           Home
    //         </Link>

    //         <Link
    //           href={`/${slug}/programs`}
    //           className="block hover:underline text-gray-700 dark:text-gray-200"
    //           style={{ color: "#444" }}
    //           onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
    //           onMouseLeave={(e) =>
    //             (e.currentTarget.style.color = "#444")
    //           }
    //         >
    //           Programs
    //         </Link>

    //         <Link
    //           href={`/${slug}/donate`}
    //           className="block hover:underline text-gray-700 dark:text-gray-200"
    //           style={{ color: "#444" }}
    //           onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
    //           onMouseLeave={(e) =>
    //             (e.currentTarget.style.color = "#444")
    //           }
    //         >
    //           Donate
    //         </Link>

    //         <Link
    //           href={`/${slug}/contact`}
    //           className="block hover:underline text-gray-700 dark:text-gray-200"
    //           style={{ color: "#444" }}
    //           onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
    //           onMouseLeave={(e) =>
    //             (e.currentTarget.style.color = "#444")
    //           }
    //         >
    //           Contact
    //         </Link>
    //       </div>
    //     </div>
    //   )}
    // </header>
  );
}
