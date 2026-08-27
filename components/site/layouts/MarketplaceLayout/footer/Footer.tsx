import React from 'react';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  BuildingOfficeIcon, 
  GlobeAltIcon 
} from '@heroicons/react/24/outline';

// Type definitions
interface Promo { id: string; title: string; subtitle: string; imageUrl: string; }
interface Category { id: string; name: string; imageUrl: string; }
interface StoreCategoryUI { id: string; name: string; imageUrl: string; slug: string; icon?: string }
interface SocialLink { channel: string; url: string }
interface Policy { type: string; title?: string; content: string }
interface FAQ { question: string; answer: string }
interface Testimonial { author: string; quote: string; avatarUrl?: string; rating?: number }
interface Banner { imageUrl: string; headline?: string; subline?: string; ctaText?: string; ctaLink?: string }
interface Promotion { code?: string; title: string; description?: string; startsAt?: string; endsAt?: string; bannerUrl?: string }
interface Product { id: string; name: string; price: number; imageUrl: string; slug?: string }

export interface AddressItem {
  label?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  contactPhone?: string;
  contactEmail?: string;
}

interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  logoUrl?: string;
  bannerUrl?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  addresses?: AddressItem[];
  StoreCategory: StoreCategoryUI[];
  socialLinks: SocialLink[];
  policies: Policy[];
  faqs: FAQ[];
  testimonials: Testimonial[];
  heroSlides: Banner[];
  promotions: Promotion[];
  products: Product[];
}

interface FooterProps {
  storeFormData: Store;
}

const Footer: React.FC<FooterProps> = ({ storeFormData }) => {
  const {
    contactEmail,
    contactPhone,
    address: legacyAddress,
    addresses = [],
    socialLinks = [],
  } = storeFormData || {};

  // Extract up to 3 addresses for the regional showcase. 
  // Fallback to legacy data if the addresses array is empty.
  const regionalAddresses: AddressItem[] = addresses?.length > 0 
    ? addresses.slice(0, 3) 
    : [{
        label: "Global Headquarters",
        address: legacyAddress || "Lusingeti Road, Number 31, Industrial Area, Nairobi",
        contactPhone: contactPhone,
        contactEmail: contactEmail
      }];

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Footer Links & Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-gray-800 pb-12">
          {/* About Us */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">About Us</h3>
            <p className="text-sm leading-relaxed text-gray-400">
              {storeFormData?.description || "Discover everything you need from our trusted marketplace. Fast delivery, great deals, and top-notch service—trusted by thousands every day."}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/marketplace/about" className="hover:text-white transition-colors">About</a></li>
              <li><a href="/marketplace/contact" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="/marketplace/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/marketplace/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Customer Care</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/marketplace/help" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="/marketplace/returns" className="hover:text-white transition-colors">Returns</a></li>
              <li><a href="/marketplace/shipping" className="hover:text-white transition-colors">Shipping</a></li>
              <li><a href="/marketplace/track" className="hover:text-white transition-colors">Track Order</a></li>
            </ul>
          </div>

          {/* Connect & Social Links */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Follow Us</h3>
            {socialLinks && socialLinks.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((s, idx) => (
                  <a
                    key={idx}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center"
                    title={s.channel}
                  >
                    <GlobeAltIcon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">Stay connected through our official channels.</p>
            )}
          </div>
        </div>

        {/* Dynamic Multi-Location Section */}
        {regionalAddresses.length > 0 && (
          <div className="border-b border-gray-800 pb-12">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6 flex items-center gap-2">
              <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
              Our Locations & Support Hubs
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regionalAddresses.map((loc, idx) => {
                const formattedAddress = [loc.address, loc.city, loc.state, loc.zip, loc.country]
                  .filter(Boolean)
                  .join(', ');

                return (
                  <div 
                    key={idx} 
                    className="p-5 bg-gray-800/50 border border-gray-800 rounded-xl space-y-3 hover:border-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                        {loc.label || `Branch ${idx + 1}`}
                      </span>
                      {formattedAddress && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formattedAddress)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                        >
                          <MapPinIcon className="h-3.5 w-3.5" />
                          Directions
                        </a>
                      )}
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed">
                      {formattedAddress || "Address details pending"}
                    </p>

                    {(loc.contactPhone || loc.contactEmail) && (
                      <div className="pt-2 border-t border-gray-700/60 space-y-1 text-xs text-gray-400">
                        {loc.contactPhone && (
                          <div className="flex items-center space-x-2">
                            <PhoneIcon className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                            <a href={`tel:${loc.contactPhone}`} className="hover:text-white transition-colors">
                              {loc.contactPhone}
                            </a>
                          </div>
                        )}
                        {loc.contactEmail && (
                          <div className="flex items-center space-x-2">
                            <EnvelopeIcon className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                            <a href={`mailto:${loc.contactEmail}`} className="hover:text-white transition-colors break-all">
                              {loc.contactEmail}
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Bottom / Branding */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div>
            &copy; {new Date().getFullYear()} {storeFormData?.name || 'Marketplace'}. All rights reserved.
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-800/60 rounded-lg border border-gray-800">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Powered by</span>
            <a 
              href="https://salesmanpro.site" 
              className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-500 transition-colors"
            >
              SalesmanPro.site
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;