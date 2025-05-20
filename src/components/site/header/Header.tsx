import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MagnifyingGlassCircleIcon, UserIcon, ShoppingBagIcon, Bars3BottomLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useStateContext } from "../../../contexts/ContextProvider";

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const Header: React.FC = () => {
  const { cart } = useStateContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const languages = [
    { code: "en", label: "English" },
    { code: "de", label: "Deutsch" },
  ];
  const [lang, setLang] = useState(languages[0]);

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-50">
        {/* Top Bar */}
        <div className="bg-orange-50 text-orange-800 text-sm font-medium py-2 px-4 flex justify-between items-center">
          <span>🎉 Super Value Deals </span>
          {/* <div className="flex items-center gap-4">
            <select
              value={lang.code}
              onChange={(e) =>
                setLang(languages.find((l) => l.code === e.target.value)!)
              }
              className="border border-gray-300 rounded px-2 py-1 bg-white focus:ring-orange-500 focus:border-orange-500"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
            <Link href="/login"  className="text-orange-600 hover:underline">Login
            </Link>
            <Link href="/register"  className="text-orange-600 hover:underline">Register
            </Link>
            <Link href="/cart" className="text-orange-600 hover:underline">Cart
            </Link>
          </div> */}
        </div>

        {/* Main Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center gap-6">
              <Link href="/">
                  <Image
                    src="/logo.svg"
                    alt="logo"
                    width={120}
                    height={40}
                    loader={loader}
                  />
              </Link>
              <nav className="hidden lg:flex items-center gap-6 font-medium text-gray-700">
                <Link href="/"  className="hover:text-orange-600 transition">Home
                </Link>
                <Link href="/shop"  className="hover:text-orange-600 transition">Shop
                </Link>
                <Link href="/categories"  className="hover:text-orange-600 transition">Categories
                </Link>
              </nav>
            </div>

            {/* Center Search */}
            <div className="flex-1 mx-6 hidden lg:block">
              <div className="relative w-full">
                <input
                  type="search"
                  placeholder="Search products..."
                  className="w-full border border-gray-300 rounded-full pl-4 pr-10 py-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <MagnifyingGlassCircleIcon className="h-5 w-5 text-gray-500 hover:text-orange-600" />
                </button>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <button className="relative text-gray-600 hover:text-orange-600">
                <UserIcon className="h-6 w-6" />
              </button>
              <button className="relative text-gray-600 hover:text-orange-600">
                <ShoppingBagIcon className="h-6 w-6" />
                <span className="absolute -top-1 -right-2 bg-orange-600 text-white rounded-full text-xs px-1">
                  {cart.length}
                </span>
              </button>
              <button
                className="lg:hidden text-gray-600 hover:text-orange-600"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3BottomLeftIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 shadow-md">
            <div className="px-4 py-4 space-y-2 text-sm font-medium text-gray-700">
              <Link href="/" className="block hover:text-orange-600">Home
              </Link>
              <Link href="/shop"  className="block hover:text-orange-600">Shop
              </Link>
              <Link href="/categories"  className="block hover:text-orange-600">Categories
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;