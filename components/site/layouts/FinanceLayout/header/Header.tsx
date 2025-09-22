import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

// A mock version of useStoreContext for a self-contained component
const useStoreContext = () => {
  const storeFormData = {
    slug: "",
    name: "CapitalEdge",
    logoUrl: "https://placehold.co/140x48/000000/FFFFFF?text=Logo",
    themeSettings: {
      primaryColor: "#2563EB",
      secondaryColor: "#9333EA",
    },
  };
  return { storeFormData };
};

// Define a professional-looking SVG icon for the brand
const BrandIcon = ({ color }: { color: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`h-8 w-8 transition-colors duration-300 ${color}`}
  >
    <path d="M11.666 4.475a.75.75 0 0 1 .668 0l7.5 4.5a.75.75 0 0 1 0 1.25l-7.5 4.5a.75.75 0 0 1-.668 0L4.166 10.25a.75.75 0 0 1 0-1.25l7.5-4.5Z" />
    <path
      fillRule="evenodd"
      d="M19.166 10.75l-7.5 4.5a.75.75 0 0 1-.668 0L4.166 10.75V19.5a.75.75 0 0 0 .75.75h14.25a.75.75 0 0 0 .75-.75v-8.75Zm-5.352 1.332 3.144 1.886a.75.75 0 0 1 0 1.25l-3.144 1.886a.75.75 0 0 1-.668 0l-3.144-1.886a.75.75 0 0 1 0-1.25l3.144-1.886a.75.75 0 0 1 .668 0Z"
      clipRule="evenodd"
    />
  </svg>
);

const FinanceHeader = () => {
  const { storeFormData } = useStoreContext();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Fallback colors
  const primary = storeFormData?.themeSettings?.primaryColor || "#2563EB";
  const secondary = storeFormData?.themeSettings?.secondaryColor || "#9333EA";

  const navItems = [
    { label: "Home", href: `#home` },
    { label: "Services", href: `#services` },
    { label: "Why Us", href: `#whyus` },
    { label: "Testimonials", href: `#testimonials` },
    { label: "Contact", href: `#contact` },
  ];

  // Logic to change header style on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 font-sans">
      <motion.div
        className={`absolute inset-x-0 top-0 h-20 transition-all duration-300 backdrop-blur-md rounded-b-xl
          ${isScrolled ? "bg-white/80 shadow-lg" : "bg-transparent"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo / Brand */}
          <a href="#" className="flex items-center space-x-2">
            <BrandIcon color={isScrolled ? "text-blue-600" : "text-blue-400"} />
            {storeFormData?.logoUrl ? (
              <img
                src={storeFormData.logoUrl}
                alt={storeFormData.name}
                className="object-contain h-12 w-36 transition-all duration-300"
              />
            ) : (
              <span className={`text-2xl font-extrabold transition-colors duration-300 ${isScrolled ? "text-gray-900" : "text-white"}`}>
                {storeFormData?.name}
              </span>
            )}
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex space-x-8">
            {navItems.map((item) => (
              <motion.div key={item.label} whileHover={{ y: -2 }}>
                <a
                  href={item.href}
                  className={`font-medium transition-colors relative group
                    ${isScrolled ? "text-gray-700 hover:text-black" : "text-white hover:text-gray-200"}`}
                >
                  {item.label}
                  <span
                    className="absolute left-0 -bottom-1 h-[2px] bg-gradient-to-r transition-all duration-300 scale-x-0 origin-left group-hover:scale-x-100"
                    style={{
                      backgroundImage: `linear-gradient(to right, ${primary}, ${secondary})`,
                    }}
                  />
                </a>
              </motion.div>
            ))}
          </nav>

          {/* Actions + Mobile Button */}
          <div className="flex items-center space-x-4">
            {/* Search Icon */}
            <div className="relative hidden md:block group">
              <input
                type="search"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 w-0 group-hover:w-48 transition-all duration-300"
              />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-gray-700 transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>

            {/* Scroll-Down Indicator */}
            {/* <motion.button
              whileHover={{ scale: 1.1 }}
              className={`hidden md:flex items-center gap-1 transition-colors duration-300
                ${isScrolled ? "text-gray-600 hover:text-gray-900" : "text-white hover:text-gray-200"}`}
            >
              <ChevronDownIcon className="h-5 w-5 animate-bounce" />
              <span className="text-sm">Scroll</span>
            </motion.button> */}

            {/* Mobile Menu Button */}
            <button
              className={`lg:hidden p-2 rounded-full transition-colors duration-300 ${isScrolled ? "hover:bg-gray-200" : "hover:bg-white/10"}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`h-6 w-6 transition-colors duration-300 ${isScrolled ? "text-gray-700" : "text-white"}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`h-6 w-6 transition-colors duration-300 ${isScrolled ? "text-gray-700" : "text-white"}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              className="lg:hidden bg-white shadow-lg"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-4 py-6 space-y-4">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="block text-gray-700 font-medium py-2 hover:text-gray-900 transition-colors"
                    onClick={() => setMobileOpen(false)} // Close menu on click
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.div>
    </header>
  );
};

export default FinanceHeader;
