import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
// Assuming you are using heroicons or a similar library. Replace with your actual icon imports.
import { MapPinIcon, HomeModernIcon, CheckBadgeIcon } from '@heroicons/react/24/outline'; 
import { VideoCameraIcon } from '@heroicons/react/24/solid';

import { useStoreContext } from '@/contexts/StoreContext';
import { resolveProductMedia } from '@/lib/product-media-resolver';

// Custom WhatsApp Icon for Real Estate Agents
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);


const PropertyCard = ({ item, key, itemVariants, customLoader }: any) => {

    const { storeFormData } = useStoreContext();
    const resolvedMedia = resolveProductMedia(item);
    // WhatsApp Agent Config
    const whatsappNumber = `${storeFormData?.contactPhone || "254732 771 353"}`;
    const message = encodeURIComponent(`Hi, I'm interested in viewing the property: "${item.name}" (ID: ${item.id?.slice(0, 6)}). Is it currently available for a site visit?`);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
  
  // 1. Calculate the starting price from tiers, fallback to finalPrice
  const startingPrice = item.pricingTiers?.length > 0 
    ? Math.min(...item.pricingTiers.map((tier: any) => tier.price))
    : item.finalPrice;

  // 2. Extract a readable location from tags if locationName is just coordinates
  const readableLocation = item.tags?.find((tag: string) => tag.toLowerCase() === 'kilimani') 
    || (item.locationName && !item.locationName.includes('-1.') ? item.locationName : 'Kilimani, Nairobi');

  // 3. Get available unit types from pricing tiers
  const availableUnits = item.pricingTiers?.map((tier: any) => tier.name.replace(' Bedroom', ' BR').replace(' Blocks', '')) || [];

  return (
    <Link key={key} href={`/propertymanagement/listings/${item._id?.$oid || item.id}`} passHref legacyBehavior>
      <motion.a
        className="group relative flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800
                   hover:shadow-xl hover:border-emerald-500/50 dark:hover:border-emerald-400/50 transition-all duration-300 ease-out cursor-pointer
                   focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 overflow-hidden"
        variants={itemVariants}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        aria-label={`View details for ${item.name}`}
      >
        {/* --- Image & Badges Area --- */}
        <div className="relative h-64 w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <Image
            src={resolvedMedia.primaryImageUrl}
            alt={item.name}
            layout="fill"
            objectFit="cover"
            className="transform transition-transform duration-700 group-hover:scale-110"
            loader={customLoader}
          />

          {resolvedMedia.hasVideo && (
            <div className="absolute bottom-5 left-5 z-20 flex items-center gap-1 bg-black/70 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md border border-white/10 uppercase tracking-wider pointer-events-none">
              <VideoCameraIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Video</span>
            </div>
          )}
          
          {/* Gradient Overlay for better badge readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {item.isFeatured && (
              <span className="bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md shadow-sm">
                Featured
              </span>
            )}
            <span className="bg-emerald-600/90 backdrop-blur-sm text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md shadow-sm">
              {item.listingTransactionType || 'RENT'}
            </span>
          </div>

          {/* Quick Contact Agent (WhatsApp Floating) */}
          <div 
            onClick={(e) => {
              e.preventDefault();
              window.open(whatsappUrl, '_blank');
            }}
            className="absolute bottom-5 right-5 z-20 p-3 bg-[#25D366] text-white rounded-2xl shadow-2xl hover:scale-110 transition-transform cursor-pointer"
            title="Chat with Agent"
          >
            <WhatsAppIcon className="w-5 h-5" />
          </div>
        </div>

        {/* --- Content Area --- */}
        <div className="p-5 flex flex-col flex-grow">
          
          {/* Price & Title */}
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Starting From
            </p>
            <p className="text-2xl font-black text-gray-900 dark:text-white mb-1">
              KES {startingPrice?.toLocaleString()} <span className="text-sm font-medium text-gray-500 dark:text-gray-400">/mo</span>
            </p>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 truncate" title={item.name}>
              {item.name}
            </h3>
          </div>
          
          {/* Location */}
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mb-4">
            <MapPinIcon className="w-4 h-4 mr-1.5 text-emerald-500 shrink-0" />
            <span className="truncate">{readableLocation}</span>
          </p>

          {/* Unit Types (Replaces standard bed/bath since this is an apartment block) */}
          {availableUnits.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {availableUnits.map((unit: string, idx: number) => (
                <span key={idx} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium px-2.5 py-1 rounded-md border border-gray-200 dark:border-gray-700">
                  {unit}
                </span>
              ))}
            </div>
          )}

          {/* Amenities Highlights (Takes top 3) */}
          {item.amenities?.length > 0 && (
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
              {item.amenities.slice(0, 3).map((amenity: string, idx: number) => (
                <span key={idx} className="flex items-center capitalize">
                  <CheckBadgeIcon className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                  {amenity.replace('_', ' ')}
                </span>
              ))}
              {item.amenities.length > 3 && (
                <span className="text-gray-400">+{item.amenities.length - 3} more</span>
              )}
            </div>
          )}

          {/* Description Snippet */}
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4 flex-grow">
            {item.description}
          </p>

          {/* Call to Action */}
          <div className="mt-auto pt-2 flex items-center justify-between text-sm font-semibold">
            <span className="text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors flex items-center">
              View Floor Plans
            </span>
            <span className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
              &rarr;
            </span>
          </div>
        </div>
      </motion.a>
    </Link>
  );
};

export default PropertyCard;