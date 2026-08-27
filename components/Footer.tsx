import React from "react";
import Link from "next/link";
import Logo from '../assets/fit1.png'; // Assuming this is the company logo
import { motion as Motion } from "framer-motion";

// Using SVG icons instead of raster images for better quality and styling
const socialIcons = [
  {
    name: "Instagram",
    url: "https://www.instagram.com/salesmanpro_site/",
    icon: (
      <svg className="w-6 h-6 text-gray-500 hover:text-purple-600 transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.003 0-5.441 2.441-5.441 5.443 0 .426.048.835.138 1.225-4.526-.225-8.53-2.39-11.218-5.688-.467.804-.732 1.73-.732 2.738 0 1.884.965 3.553 2.441 4.542-.897-.027-1.743-.276-2.481-.685v.068c0 2.642 1.88 4.842 4.364 5.341-.459.123-.941\.189-1.432.189-.35 0-.69-.033-1.02-.095.692 2.164 2.71 3.744 5.092 3.791-1.921 1.503-4.341 2.404-6.979 2.404-.456 0-.903-.024-1.343-.075 2.485 1.574 5.426 2.481 8.566 2.481 10.275 0 15.937-8.529 15.937-15.945 0-.243-.005-.487-.013-.73-.89-.64-1.996-1.282-3.264-1.696z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/company/110900048",
    icon: (
      <svg className="w-6 h-6 text-gray-500 hover:text-purple-600 transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@salesmanpro.site",
    icon: (
      <svg className="w-6 h-6 text-gray-500 hover:text-purple-600 transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12h-2c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10v2c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8h2c0 6.627-5.373 12-12 12z" />
      </svg>
    ),
  },
];

const footerLinks = [
  {
    title: "Product",
    links: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#pricing" },
      { name: "Testimonials", href: "#testimonials" },
      { name: "Case Studies", href: "#case-studies" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Blog", href: "/blog" },
      { name: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Help Center", href: "/help-center" },
      // { name: "API", href: "/api" },
      { name: "Terms of Service", href: "/terms-of-service" },
      { name: "Privacy Policy", href: "/privacy-policy" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="relative bg-white pt-24 pb-12 overflow-hidden">
      {/* Decorative Background Blurs */}
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute w-[300px] h-[300px] bg-gradient-to-r from-purple-300 to-pink-200 rounded-full blur-3xl opacity-30 top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-[200px] h-[200px] bg-gradient-to-l from-yellow-200 to-orange-100 rounded-full blur-3xl opacity-20 bottom-1/2 right-1/4 translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Top Section: Logo, Description, and Socials */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-gray-200 pb-12">
          {/* Logo and Description */}
          <div className="col-span-1 lg:col-span-1">
            <Link href="/" aria-label="Home" className="inline-block mb-4">
              <img src={Logo.src} alt="Company Logo" className="w-16 h-16 object-contain" />
            </Link>
            <p className="text-gray-600 text-sm max-w-sm">
              SalesmanPro is the ultimate platform for sales professionals to streamline their workflow, boost productivity, and close deals faster.
            </p>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section) => (
            <div key={section.title} className="col-span-1">
              <h3 className="font-bold text-gray-900 text-lg mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-purple-600 transition-colors text-base"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social Media Links */}
          <div className="col-span-1">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Follow Us</h3>
            <div className="flex gap-4">
              {socialIcons.map((social) => (
                <Link key={social.name} href={social.url} aria-label={social.name}>
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section: Copyright */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} SalesmanPro. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;