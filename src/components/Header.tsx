import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Bars4Icon, XMarkIcon } from "@heroicons/react/24/solid";
import fit1 from "../assets/fit1.png";
import { useOnClickOutside } from "usehooks-ts";
import classNames from "classnames";

const Header = () => {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(navRef, () => setMenuOpen(false));

  useEffect(() => {
    const handleScroll = () => setDark(window.scrollY >= 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <header
      className={classNames(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300","nav-color backdrop-blur"
        // dark ? "bg-gradient-to-r from-orange-700 via-orange-800 to-gray-900 shadow-lg" : "nav-color backdrop-blur"
      )}
    >
      <div
        className={
          "flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 relative min-h-[5rem] md:min-h-[7rem]"
        }
      >
        {/* Logo */}
        <Link href="/" aria-label="Home" className="flex items-center gap-2">
          <img
            src={fit1.src}
            alt="SalesPro Logo"
            className="w-12 h-12 object-contain cursor-pointer hover:scale-110 transition-transform duration-300"
          />
          <span
            className={
              "hidden lg:block text-2xl font-extrabold tracking-tigh text-orange-500"
            }
          >
            SalesPro
          </span>
        </Link>

        {/* Navigation */}
        <nav
          ref={navRef}
          className={classNames(
            "fixed lg:static top-0 right-0 h-screen lg:h-auto w-60 lg:w-auto bg-gray-900 lg:bg-transparent flex flex-col lg:flex-row items-start lg:items-center gap-4 px-6 lg:px-0 py-6 lg:py-0",
            menuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
            "lg:translate-x-0 lg:opacity-100 transition-all duration-500 ease-in-out"
          )}
        >
          {/* Close Button (Mobile Only) */}
          <button
            aria-label="Close menu"
            onClick={toggleMenu}
            className="absolute top-4 right-4 lg:hidden text-white"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Navigation Links */}
          <ul className={classNames("flex flex-col lg:flex-row gap-6 font-medium text-lg lg:text-sm  ",
            dark ? "text-gray-500" : "lg:text-gray-500"
          )}>
            {[
              { name: "Home", href: "/" },
              { name: "Features", href: "/features" },
              { name: "About Us", href: "/aboutus" },
              { name: "Contact", href: "/contact" },
            ].map((item, index) => (
              <li key={index}>
                <Link
                  href={item.href}
                  className="hover:text-yellow-400 relative group transition-all"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 group-hover:w-full h-1 bg-yellow-400 transition-all duration-300"></span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Call-to-Action Buttons */}
          <div className="mt-6 lg:mt-0 flex flex-col lg:flex-row gap-3">
            {!session ? (
              <>
                <Link
                  href="/signin"
                  className="text-white uppercase text-sm font-medium hover:underline transition-all"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="text-yellow-500 bg-blue-900 py-2 px-4 rounded-lg text-sm font-medium hover:bg-yellow-500 hover:text-blue-900 transition-all"
                >
                  Register
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard2"
                className="text-white bg-blue-900 py-2 px-4 rounded-lg text-sm font-medium hover:bg-yellow-500 hover:text-blue-900 transition-all"
              >
                Dashboard
              </Link>
            )}
          </div>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          aria-label="Open menu"
          className="lg:hidden text-white"
          onClick={toggleMenu}
        >
          <Bars4Icon className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;
