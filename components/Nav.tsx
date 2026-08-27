import React, { useState, useEffect, useRef } from "react";
import { Bars4Icon } from "@heroicons/react/24/solid";
import { Navdata } from "@/constant/Data";
import NavHor from "./NavHor";
import NavVer from "./NavVer";
import { useOnClickOutside } from "usehooks-ts";
import { useSession } from "next-auth/react";

const Nav = () => {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(navRef, () => setMenuOpen(false));

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleScroll = () => {
    setIsDark(window.scrollY >= window.innerHeight - 80);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative order-3 lg:order-2 lg:px-0 w-1/4 lg:w-fit" ref={navRef}>
      {/* Mobile Menu Toggle */}
      <div className="flex justify-end pr-6 lmd:pr-14 w-full">
        <button
          aria-expanded={menuOpen}
          aria-label="Toggle navigation menu"
          className={`lg:hidden rounded-full text-black transition-transform transform hover:scale-110`}
          onClick={toggleMenu}
        >
          <Bars4Icon className="h-6" />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav
          id="mobile-nav-menu"
          className="lg:hidden absolute top-[4.5rem] right-4 w-56 py-4 px-5 bg-gradient-to-r from-gray-800 to-gray-900 text-black rounded-lg shadow-xl z-50"
        >
          <ul className="flex flex-col gap-4">
            {Navdata.map((item) => (
              <NavVer
                key={item.reference}
                title={item.title}
                href={item.href}
                reference={item.reference}
              />
            ))}
            {session && (
              <NavVer
                key="dashboard"
                title="Dashboard"
                href="/dashboard2"
                reference="My Dashboard"
              />
            )}
          </ul>
        </nav>
      )}

      {/* Desktop Navigation */}
      <nav id="desktop-nav-menu" className="hidden lg:block">
        <ul className="flex items-center gap-8 font-semibold text-lg">
          {Navdata.map((item) => (
            <NavHor
              key={item.reference}
              title={item.title}
              href={item.href}
              reference={item.reference}
            />
          ))}
          {session && (
            <NavHor
              key="dashboard"
              title="Dashboard"
              href="/dashboard2"
              reference="My Dashboard"
            />
          )}
        </ul>
      </nav>
    </div>
  );
};

export default Nav;
