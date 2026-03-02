import React from 'react';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';

// --- MOCK for useStoreContext to make the file self-contained ---
// const useStoreContext = () => {
  const storeFormDatas = {
    name: "CapitalEdge",
    description: "Your partner in navigating the complexities of modern business with unparalleled legal and financial expertise.",
    contactEmail: "info@capitaledge.com",
    contactPhone: "+254 (123) 456-7890",
    address: "123 Lumina Tower, Suite 500, Strategic Avenue, Nairobi, Kenya",
    socialLinks: [
      { channel: "Facebook", url: "https://www.facebook.com/capitaledge" },
      { channel: "Twitter", url: "https://www.twitter.com/capitaledge" },
      { channel: "LinkedIn", url: "https://www.linkedin.com/company/capitaledge" },
    ],
    themeSettings: {
      primaryColor: "#004085",
      darkBackground: "#0A192F",
    },
  };
//   return { storeFormData };
// };

// SVG Icons to replace external libraries
const PhoneIcon = ({ className }:{className: string}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h15a3 3 0 013 3v15a3 3 0 01-3 3H4.5a3 3 0 01-3-3V4.5zM8.25 6a1.5 1.5 0 00-1.5 1.5v9a1.5 1.5 0 001.5 1.5h7.5a1.5 1.5 0 001.5-1.5v-9a1.5 1.5 0 00-1.5-1.5h-7.5z" clipRule="evenodd" /></svg>;
const EnvelopeIcon = ({ className }:{className: string}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M19.5 22.5c-2.25 0-4.5-1.5-4.5-3.75s2.25-3.75 4.5-3.75 4.5 1.5 4.5 3.75-2.25 3.75-4.5 3.75zM4.5 9.75c-2.25 0-4.5-1.5-4.5-3.75s2.25-3.75 4.5-3.75 4.5 1.5 4.5 3.75-2.25 3.75-4.5 3.75z" /><path fillRule="evenodd" d="M12 2.25A1.5 1.5 0 0113.5 1h9A1.5 1.5 0 0124 2.5v18a1.5 1.5 0 01-1.5 1.5H1.5A1.5 1.5 0 010 20.5V2.5A1.5 1.5 0 011.5 1h9A1.5 1.5 0 0112 2.25zM21.5 4.5H2.5v16.5h19V4.5z" clipRule="evenodd" /></svg>;

type SocialChannel = "Facebook" | "Twitter" | "LinkedIn";

const SocialIcons: Record<SocialChannel, ({ className }: { className: string }) => JSX.Element> = {
  Facebook: ({ className }) => <div className={className}>FB</div>, // example
  Twitter: ({ className }) => <div className={className}>TW</div>,
  LinkedIn: ({ className }) => <div className={className}>IN</div>,
};

// const SocialIcons = {
//   Facebook: ({ className }:{className: string}) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}><path d="M12 2C6.477 2 2 6.477 2 12c0 5.006 3.659 9.176 8.438 9.873v-6.985H7.75v-2.888h2.688V9.726c0-2.658 1.623-4.103 3.987-4.103 1.133 0 2.103.203 2.38.293v2.66h-1.571c-1.383 0-1.65.658-1.65 1.621v2.127h2.955l-.48 2.915h-2.475v6.985C18.341 21.176 22 17.006 22 12c0-5.523-4.477-10-10-10z" /></svg>,
//   Twitter: ({ className }:{className: string}) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}><path d="M22.46 6.13c-.62.28-1.28.47-1.97.55.72-.43 1.28-1.11 1.54-1.92-.68.4-1.4.68-2.18.83C19.12 4.41 18.28 4 17.3 4c-1.81 0-3.28 1.47-3.28 3.28 0 .26.03.5.08.73-2.73-.14-5.14-1.44-6.75-3.4-.28.48-.44 1.04-.44 1.63 0 1.14.58 2.14 1.47 2.72-.54-.02-1.04-.17-1.48-.41v.04c0 1.59 1.13 2.92 2.63 3.22-.27.07-.54.1-.82.1-.2 0-.39-.02-.58-.06.42 1.3 1.63 2.25 3.07 2.28-1.12.88-2.54 1.4-4.08 1.4-.26 0-.52-.01-.78-.04 1.45.93 3.17 1.47 5.02 1.47 6.02 0 9.32-4.99 9.32-9.32 0-.14-.01-.28-.01-.42.64-.46 1.19-1.04 1.63-1.7z" /></svg>,
//   LinkedIn: ({ className }:{className: string}) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>,
// };


export default function App() {
  const { storeFormData } = useStoreContext();
  const {
    name,
    description,
    contactEmail,
    contactPhone,
    address,
    socialLinks,
    themeSettings,
  } = storeFormData || storeFormDatas;
  
  const year = new Date().getFullYear();
  const primaryColor = themeSettings?.primaryColor || '#004085';
  const darkBackground = themeSettings?.darkBackground || '#0A192F';

  return (
    <footer className="py-12 sm:py-16 md:py-20 px-6 font-sans relative overflow-hidden" style={{ backgroundColor: darkBackground }}>
      {/* Dynamic gradient background */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: [0.5, 1, 0.7], opacity: [0, 0.5, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl"
          style={{ backgroundColor: primaryColor }}
        ></motion.div>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: [0.5, 1.2, 0.6], opacity: [0, 0.5, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl"
          style={{ backgroundColor: '#2B83D8' }} // Complementary blue shade
        ></motion.div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-16 text-gray-300">
        {/* About Section */}
        <div>
          <h3 className="text-2xl font-bold mb-4 text-white">
            {name}
          </h3>
          <p className="text-sm leading-relaxed max-w-sm">
            {description}
          </p>
        </div>

        {/* Contact Information */}
        <div className="md:col-span-1">
          <h3 className="text-lg font-semibold text-white mb-4">Get in Touch</h3>
          <ul className="space-y-4 text-sm">
            {contactPhone && (
              <li className="flex items-center">
                <PhoneIcon className="h-5 w-5 mr-3 flex-shrink-0" 
                // style={{ color: primaryColor }} 
                />
                <a href={`tel:${contactPhone}`} className="hover:text-white transition-colors duration-200">
                  {contactPhone}
                </a>
              </li>
            )}
            {contactEmail && (
              <li className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 mr-3 flex-shrink-0" 
                // style={{ color: primaryColor }} 
                />
                <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors duration-200">
                  {contactEmail}
                </a>
              </li>
            )}
            {address && (
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 mr-3 flex-shrink-0" style={{ color: primaryColor }}><path fillRule="evenodd" d="M11.54 22.351A10.533 10.533 0 011.85 12.016 10.533 10.533 0 0112.186 1.51a10.533 10.533 0 0110.534 10.505 10.533 10.533 0 01-10.535 10.336zM12.186 19a8.533 8.533 0 008.533-8.533A8.533 8.533 0 0012.186 2a8.533 8.533 0 00-8.533 8.533A8.533 8.533 0 0012.186 19z" clipRule="evenodd" /><path d="M15.42 12.016a3.25 3.25 0 11-6.5 0 3.25 3.25 0 016.5 0z" /></svg>
                <span>{address}</span>
              </li>
            )}
          </ul>
        </div>
        
        {/* Quick Links Section (can be replaced with other dynamic data) */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white transition-colors duration-200">About Us</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-200">Services</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-200">Testimonials</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-200">Contact</a></li>
          </ul>
        </div>

        {/* Social Media Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            {socialLinks.map((s, idx) => {
              // const Icon = SocialIcons[s.channel];
              const Icon = SocialIcons[s.channel as SocialChannel];

              return (
                <motion.a
                  key={idx}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.channel}
                  whileHover={{ scale: 1.2, color: '#fff' }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {Icon && <Icon className="w-8 h-8" />}
                </motion.a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-12 text-center text-sm text-gray-500 border-t border-gray-700/50 pt-8">
        &copy; {year} {name}. All Rights Reserved.
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
}
