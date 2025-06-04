"use client"
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassCircleIcon,
  ShoppingBagIcon,
  Bars3BottomLeftIcon,
  XMarkIcon,
  BellIcon,
  MoonIcon,
  SunIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useStateContext } from "../../../../../contexts/ContextProvider";
import { useRouter } from "next/navigation";
import { useStoreContext } from "../../../../../contexts/StoreContext";

interface HeaderProps { storeFormData: any; }
const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality||75}`;

export default function Header() {
  const { storeFormData } = useStoreContext();
  
  const { cart } = useStateContext();
  const router = useRouter();
  const primary = storeFormData?.themeSettings?.primaryColor || "#6366f1";
  const secondary = storeFormData?.themeSettings?.secondaryColor || "#ec4899";

  const [hasScrolled, setHasScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setHasScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed w-full top-0 z-50 transition-shadow backdrop-blur-sm ${hasScrolled? 'shadow-xl bg-white/70 dark:bg-gray-900/70': 'bg-transparent'} py-8`}>
      <div className="container mx-auto flex items-center justify-between px-6 py-3">
        {/* Brand & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <button onClick={()=>setMobileMenu(true)} className="lg:hidden p-2 focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500">
            <Bars3BottomLeftIcon className="h-6 w-6 text-gray-800 dark:text-gray-100" />
          </button>
          <motion.div
            initial={{ scale: 0.9 }} animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            className="flex items-center cursor-pointer"
            onClick={()=>router.push("/")}
          >
            <Image src={storeFormData.logoUrl || "/logo.svg"} loader={loader} width={40} height={40} alt="Logo" />
            <span style={{ color: primary }} className="ml-2 text-2xl font-extrabold">
              {storeFormData.name}
            </span>
          </motion.div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex gap-8">
          {['Home','Categories','Deals','Contact'].map((link, i) => (
            <motion.a
              key={link}
              href={link==='Home'?'/':`#${link.toLowerCase()}`}
              className="relative text-gray-800 dark:text-gray-100 font-medium"
              whileHover={{ scale:1.05 }}
              transition={{ type:'spring', stiffness:300 }}
            >
              {link}
              <motion.span
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r"
                style={{ backgroundImage: `linear-gradient(to right, ${primary}, ${secondary})` }}
                layoutId="underline"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              />
            </motion.a>
          ))}
        </nav>

        {/* Search & Icons */}
        <div className="hidden lg:flex items-center gap-6">
          <motion.div whileFocus={{ scale:1.02 }} className="relative">
            <input
              type="search"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 w-48 focus:w-64 transition-all duration-300 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1"
            />
            <MagnifyingGlassCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
          </motion.div>

          {[
            { icon: ShoppingBagIcon, count: cart.length },
            { icon: BellIcon, count: 3 }
          ].map((item, idx) => (
            <motion.button key={idx} whileHover={{ rotate: 10 }} className="relative p-2 rounded-full bg-gray-100 dark:bg-gray-800 focus:outline-none">
              <item.icon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
              {item.count>0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">{item.count}</span>}
            </motion.button>
          ))}

          <motion.button whileHover={{ scale:1.1 }} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 focus:outline-none">
            {darkMode?
              <SunIcon className="h-6 w-6 text-gray-700 dark:text-gray-200"/>
              :<MoonIcon className="h-6 w-6 text-gray-700 dark:text-gray-200"/>
            }
          </motion.button>

          <motion.button whileHover={{ scale:1.1 }} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 focus:outline-none">
            <UserCircleIcon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.aside
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type:'tween', duration:0.3 }}
            className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 shadow-lg z-50 p-6 flex flex-col"
          >
            <button onClick={()=>setMobileMenu(false)} className="self-end mb-4 p-2">
              <XMarkIcon className="h-6 w-6 text-gray-800 dark:text-gray-100" />
            </button>
            <nav className="flex flex-col gap-4">
              {['Home','Categories','Deals','Contact'].map(link=> (
                <Link key={link} href={link==='Home'?'/':`#${link.toLowerCase()}`}>
                  <a className="text-lg font-medium text-gray-800 dark:text-gray-100 hover:text-indigo-600 transition-colors">
                    {link}
                  </a>
                </Link>
              ))}
            </nav>
            <div className="mt-auto">
              {/* Quick Actions */}
              <Link href="/profile">
                <a className="flex items-center gap-2 text-gray-800 dark:text-gray-100 py-2 hover:text-indigo-600 transition-colors">
                  <UserCircleIcon className="h-5 w-5" /> <span>Account</span>
                </a>
              </Link>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </header>
  );
}
