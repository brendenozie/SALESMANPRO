'use client';

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ArrowUpRightIcon,
    ArrowLongRightIcon,
    StarIcon as StarIconOutline
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid, CheckCircleIcon } from "@heroicons/react/24/solid";
import BookingFormModal from "../BookingFormModal"; 
import { MarketListingForm } from "@/types/typings";

// --- UTILS ---
const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

// --- SUB-COMPONENTS ---

interface ServiceCardProps {
    service: MarketListingForm;
    primaryColor: string;
    onBook: (service: MarketListingForm) => void;
    isSpotlight: boolean;
    index: number;
}

// 1. Individual Service Card (Handles both small and large formats)
const ServiceCard = ({ service, primaryColor, onBook, isSpotlight, index }: ServiceCardProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const cardVariants = {
        rest: { 
            scale: 1, 
            boxShadow: isSpotlight ? "0 25px 50px -12px rgba(0, 0, 0, 0.4)" : "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
            transition: { type: "spring", stiffness: 300, damping: 25 }
        },
        hover: { 
            scale: 1.01, 
            boxShadow: isSpotlight ? "0 40px 80px -20px rgba(0, 0, 0, 0.6)" : "0 20px 30px -5px rgba(0, 0, 0, 0.4)",
            transition: { type: "spring", stiffness: 300, damping: 20 }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            variants={cardVariants}
            whileHover="hover"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onBook(service)}
            className={`relative rounded-3xl overflow-hidden cursor-pointer group transition-all duration-500 h-full ${isSpotlight ? 'lg:col-span-2 lg:row-span-2' : 'col-span-1'}`}
        >
            {/* Background Image */}
            <Image
                src={service.images[0] || "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80"}
                alt={service.name}
                loader={loader}
                fill
                className="object-cover transition-transform duration-[1500ms] group-hover:scale-105 opacity-60"
            />
            {/* Dark Overlay Gradient (Essential for visual appeal and text readability) */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/95 ${isSpotlight ? 'via-black/50' : 'via-black/70'} to-transparent transition-opacity duration-500`} />
            
            {/* Content Area */}
            <div className={`relative z-10 p-6 flex flex-col justify-end ${isSpotlight ? 'h-full md:p-10 lg:p-14' : 'h-[300px] lg:h-[400px]'}`}>
                
                {/* Top Tags (Hidden/Top Alignment) */}
                <div className="absolute top-6 left-6 flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/70 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">{service.category || "Service"}</span>
                </div>

                {/* Main Content (Bottom Alignment) */}
                <motion.div
                    animate={{ y: isHovered && !isSpotlight ? 0 : 0 }}
                >
                    <h3 className={`font-bold text-white mb-2 leading-tight ${isSpotlight ? 'text-4xl md:text-5xl lg:text-6xl' : 'text-2xl lg:text-3xl'}`}>
                        {service.name}
                    </h3>
                    
                    {/* Price and Rating */}
                    <div className="flex items-center gap-4 mb-4 text-white">
                        <span className={`font-serif font-medium ${isSpotlight ? 'text-3xl' : 'text-xl'}`} style={{ color: primaryColor }}>
                            {(service.finalPrice ?? 0).toFixed(0)}
                        </span>
                        <div className="flex items-center gap-1 text-sm text-yellow-400">
                            <StarIconSolid className="w-4 h-4" /> 4.9
                        </div>
                    </div>

                    {/* Description (Only for Spotlight Card, or on hover for small cards) */}
                    {(isSpotlight || isHovered) && (
                        <motion.p
                            initial={{ opacity: 0, y: isSpotlight ? 0 : 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: isSpotlight ? 0 : 10 }}
                            transition={{ duration: 0.3 }}
                            className={`text-gray-300 line-clamp-3 mb-6 ${isSpotlight ? 'text-lg max-w-lg' : 'text-base max-w-sm'}`}
                        >
                            {service.description || "A premium service designed for transformative results and guaranteed satisfaction."}
                        </motion.p>
                    )}
                    
                    {/* CTA (Visible on all cards, emphasized on hover) */}
                    <motion.div
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: isHovered ? 1 : 0.8 }}
                        className="inline-flex items-center gap-2 text-base font-bold uppercase tracking-widest text-white hover:underline underline-offset-8 decoration-2"
                        style={{ textDecorationColor: primaryColor }}
                    >
                        View Details 
                        <ArrowUpRightIcon className={`w-5 h-5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : 'translate-x-0'}`} />
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    );
};


// --- MAIN COMPONENT ---

interface ServicesSectionProps {
    marketplaceListings: MarketListingForm[];
    themeSettings: any;
    slug: string;
}

export default function ServicesSpotlightDeck({ marketplaceListings, themeSettings, slug }: ServicesSectionProps) {
    const [activeService, setActiveService] = useState<MarketListingForm | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!marketplaceListings || marketplaceListings.length === 0) return null;

    const primaryColor = themeSettings?.primaryColor ?? "#1d4ed8"; // Default blue
    const spotlightService = marketplaceListings[0];
    const secondaryServices = marketplaceListings.slice(1);

    const handleOpenModal = (service: MarketListingForm) => {
        setActiveService(service);
        setIsModalOpen(true);
    };

    return (
        <>
            <section className="relative bg-white dark:bg-gray-950 py-24 lg:py-32">
                
                {/* Header */}
                <div className="container mx-auto px-6 mb-16 md:mb-20">
                    <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
                        Discover Our <span  >Service Offerings</span>
                    </h2>
                    <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl">
                        Explore our top-tier services, highlighted by our most popular premium package. Click any card to learn more.
                    </p>
                </div>

                {/* === THE SPOTLIGHT CARD DECK === */}
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        
                        {/* 1. SPOTLIGHT CARD (Largest and most prominent) */}
                        <ServiceCard
                            service={spotlightService}
                            primaryColor={primaryColor}
                            onBook={handleOpenModal}
                            isSpotlight={true}
                            index={0}
                        />

                        {/* 2. SECONDARY CARDS (Fill the remaining 2 columns in a dynamic layout) */}
                        {secondaryServices.map((service, index) => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                primaryColor={primaryColor}
                                onBook={handleOpenModal}
                                isSpotlight={false}
                                index={index + 1}
                            />
                        ))}

                    </div>
                </div>
            </section>

            {/* --- BOOKING MODAL (Reusing the detailed split modal) --- */}
            <AnimatePresence>
                {isModalOpen && activeService && (
                    <motion.div
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div 
                            onClick={() => setIsModalOpen(false)}
                            className="fixed inset-0 bg-gray-900/80 backdrop-blur-xl transition-opacity"
                        />

                        <motion.div
                            layoutId="booking-modal"
                            initial={{ scale: 0.95, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 30 }}
                            className="relative w-full max-w-6xl bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                        >
                             {/* Close Button */}
                            <button 
                               onClick={() => setIsModalOpen(false)}
                               className="absolute top-4 right-4 z-30 p-2 bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 rounded-full transition-all"
                            >
                                <ArrowLongRightIcon className="w-6 h-6 text-gray-900 dark:text-white transform rotate-90" />
                            </button>

                            {/* Left Column: Details & Diagram */}
                            <div className="w-full md:w-7/12 p-8 md:p-12 overflow-y-auto custom-scrollbar">
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{activeService.name}</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-8">{activeService.description || "Detailed description of service."}</p>

                                {/* INSTRUCTIONAL DIAGRAM SECTION */}
                                <div className="mb-8 p-6 rounded-2xl border bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700">
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                        <ArrowLongRightIcon className="w-4 h-4" /> **The Service Workflow**
                                    </h4>
                                    <div className="relative w-full aspect-[2.5/1] bg-white dark:bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
                                        
                                        <Image
                                            src="https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80"
                                            alt="Service Workflow Diagram"
                                            loader={loader}
                                            fill
                                            className="object-contain"
                                        />


                                    </div>
                                    <p className="text-xs text-center text-gray-400 mt-2">
                                        Clear milestones: <span className="font-semibold">Consult </span>→ Plan → Execute → Review.
                                    </p>
                                </div>
                                
                                <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-700 dark:text-gray-200">
                                     {["Premium Quality", "Dedicated Team", "Satisfaction Guarantee"].map(feature => (
                                        <div key={feature} className="flex items-center gap-2">
                                            <CheckCircleIcon className="w-5 h-5 text-green-500" /> {feature}
                                        </div>
                                     ))}
                                </div>
                            </div>

                            {/* Right Column: Booking Form */}
                            <div className="w-full md:w-5/12 bg-gray-50 dark:bg-gray-800 border-l border-gray-100 dark:border-gray-700 flex flex-col">
                                <div className="p-8 md:p-12 flex-1 overflow-y-auto">
                                    <div className="mb-8">
                                        <p className="text-sm text-gray-500 font-medium">Total Estimation</p>
                                        <p className="text-4xl font-serif font-bold text-gray-900 dark:text-white" style={{ color: primaryColor }}>
                                            {(activeService.finalPrice ?? 0).toFixed(2)}
                                        </p>
                                    </div>
                                    <BookingFormModal service={activeService} />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}









// 'use client';

// import React, { useState, useRef, useEffect } from "react";
// import Image from "next/image";
// import { motion, AnimatePresence } from "framer-motion";
// import { 
//     ArrowUpRightIcon,
//     ArrowLongRightIcon,
//     StarIcon as StarIconOutline,
//     XMarkIcon,
//     ArrowLeftIcon,
//     ArrowRightIcon,
//     ClockIcon,
//     CurrencyDollarIcon,
//     LightBulbIcon // For process diagram highlight
// } from "@heroicons/react/24/outline";
// import { StarIcon as StarIconSolid, CheckCircleIcon } from "@heroicons/react/24/solid";
// import BookingFormModal from "../BookingFormModal"; 
// import { MarketListingForm } from "@/types/typings";

// // --- UTILS ---
// const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

// // --- SUB-COMPONENTS ---

// interface ServiceCardProps {
//     service: MarketListingForm;
//     primaryColor: string;
//     onClick: (service: MarketListingForm) => void;
//     isActive: boolean; // Indicates if this card is currently centered/active
//     index: number;
// }

// // 1. Individual Service Card (for the horizontal carousel)
// const CarouselServiceCard = ({ service, primaryColor, onClick, isActive, index }: ServiceCardProps) => {
//     return (
//         <motion.div
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: isActive ? 1.05 : 1 }} // Scale up when active
//             transition={{ duration: 0.4, ease: "easeOut" }}
//             onClick={() => onClick(service)}
//             className={`relative flex-none w-[calc(100vw-3rem)] sm:w-[500px] lg:w-[600px] h-[550px] rounded-3xl overflow-hidden cursor-pointer shadow-xl transition-all duration-300 transform-gpu ${isActive ? 'ring-4' : 'ring-0'}`}
//             style={{ 
//                 borderColor: isActive ? primaryColor : 'transparent',
//                 boxShadow: isActive ? `0 0 40px -5px ${primaryColor}40` : '0 10px 30px -5px rgba(0,0,0,0.4)',
//                 scrollSnapAlign: 'center' // Enable scroll snapping
//             }}
//         >
//             {/* Background Image with Dark Overlay */}
//             <Image
//                 src={service.images[0] || "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80"}
//                 alt={service.name}
//                 loader={loader}
//                 fill
//                 className="object-cover opacity-60 group-hover:opacity-70 transition-opacity duration-300"
//             />
//             <div className={`absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent`} />
            
//             {/* Content at the bottom */}
//             <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col justify-end text-white z-10">
//                 <span className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-2">{service.category || "Service"}</span>
//                 <h3 className="text-4xl font-bold mb-3 leading-tight">{service.name}</h3>
//                 <div className="flex items-center gap-4">
//                     <span className="text-2xl font-serif font-medium" style={{ color: primaryColor }}>
//                         ${(service.finalPrice ?? 0).toFixed(0)}
//                     </span>
//                     <div className="flex items-center gap-1 text-base text-yellow-400">
//                         <StarIconSolid className="w-4 h-4" /> 4.9
//                     </div>
//                 </div>
//                 <p className="text-gray-300 line-clamp-2 mt-4 text-sm">{service.description || "A transformative service designed to elevate your business outcomes."}</p>
                
//                 <motion.div
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 10 }}
//                     transition={{ delay: 0.2, duration: 0.3 }}
//                     className="mt-6 inline-flex items-center gap-2 text-base font-bold uppercase tracking-widest text-white hover:underline underline-offset-8 decoration-2"
//                     style={{ textDecorationColor: primaryColor }}
//                 >
//                     Explore Details <ArrowUpRightIcon className="w-5 h-5" />
//                 </motion.div>
//             </div>
//         </motion.div>
//     );
// };


// // 2. Expanded Detail View (slides up from bottom)
// const ExpandedServiceDetail = ({ service, primaryColor, onClose, onBook }: any) => {
//     return (
//         <motion.div
//             initial={{ y: "100%" }}
//             animate={{ y: 0 }}
//             exit={{ y: "100%" }}
//             transition={{ type: "spring", damping: 30, stiffness: 300 }}
//             className="fixed inset-0 z-[101] bg-white dark:bg-gray-950 rounded-t-[3rem] shadow-2xl overflow-hidden flex flex-col"
//         >
//             {/* Close Button */}
//             <button 
//                 onClick={onClose}
//                 className="absolute top-6 right-6 z-20 p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
//             >
//                 <XMarkIcon className="w-7 h-7 text-gray-800 dark:text-white" />
//             </button>

//             {/* Content Area */}
//             <div className="flex-1 overflow-y-auto custom-scrollbar pt-20 pb-12 px-6 md:px-12 lg:px-24">
//                 <div className="max-w-4xl mx-auto">
//                     {/* Header */}
//                     <div className="mb-10 text-center">
//                         <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
//                             {service.name}
//                         </h2>
//                         <p className="text-lg text-gray-600 dark:text-gray-400">
//                             {service.description || "In-depth details about this specialized service."}
//                         </p>
//                     </div>

//                     {/* Image / Key Visual */}
//                     <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-lg mb-12">
//                         <Image
//                             src={service.images[0] || "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80"}
//                             alt={service.name}
//                             loader={loader}
//                             fill
//                             className="object-cover"
//                         />
//                     </div>

//                     {/* Features & Price */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
//                         <div>
//                             <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What's Included?</h3>
//                             <ul className="space-y-3">
//                                 {["Comprehensive Analysis", "Strategic Planning", "Dedicated Support", "Performance Tracking", "Satisfaction Guarantee"].map((feature, idx) => (
//                                     <li key={idx} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
//                                         <CheckCircleIcon className="w-6 h-6 text-green-500" />
//                                         <span>{feature}</span>
//                                     </li>
//                                 ))}
//                             </ul>
//                         </div>
//                         <div>
//                             <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Pricing & Availability</h3>
//                             <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl flex flex-col gap-4">
//                                 <div className="flex items-center justify-between text-xl font-bold text-gray-900 dark:text-white">
//                                     <span>Base Price:</span>
//                                     <span className="font-serif" style={{ color: primaryColor }}>
//                                         ${(service.finalPrice ?? 0).toFixed(2)}
//                                     </span>
//                                 </div>
//                                 <div className="flex items-center justify-between text-base text-gray-600 dark:text-gray-400">
//                                     <span>Average Duration:</span>
//                                     <span className="flex items-center gap-1">
//                                         <ClockIcon className="w-5 h-5" /> 2-4 Weeks
//                                     </span>
//                                 </div>
//                                 <div className="flex items-center justify-between text-base text-gray-600 dark:text-gray-400">
//                                     <span>Category:</span>
//                                     <span>{service.category}</span>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* INSTRUCTIONAL DIAGRAM SECTION */}
//                     <div className="mb-12 p-8 rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 shadow-inner">
//                         <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
//                             <LightBulbIcon className="w-7 h-7" style={{ color: primaryColor }} /> Our Proven Process for Success
//                         </h4>
//                         <p className="text-gray-700 dark:text-gray-300 text-lg mb-8">
//                             Understanding our workflow helps you anticipate milestones and track progress. We follow a meticulous approach to ensure every project is a success.
//                         </p>
//                         <div className="relative w-full aspect-[2.5/1] bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-md flex items-center justify-center">
                            
                            



// [Image of business process flow chart diagram]



//                         </div>
//                         <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-4">
//                             From initial concept to final delivery, our systematic process ensures clarity and efficiency.
//                         </p>
//                     </div>

//                     {/* CTA Button */}
//                     <div className="text-center pb-12">
//                         <motion.button
//                             whileHover={{ scale: 1.02 }}
//                             whileTap={{ scale: 0.98 }}
//                             onClick={() => onBook(service)}
//                             className="inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-bold rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl"
//                             style={{ backgroundColor: primaryColor, color: 'white' }}
//                         >
//                             Book Your Consultation Today
//                             <ArrowUpRightIcon className="w-6 h-6" />
//                         </motion.button>
//                     </div>
//                 </div>
//             </div>
//         </motion.div>
//     );
// };


// // --- MAIN COMPONENT ---

// interface ServicesSectionProps {
//     marketplaceListings: MarketListingForm[];
//     themeSettings: any;
//     slug: string;
// }

// export default function ServicesCosmosCarousel({ marketplaceListings, themeSettings, slug }: ServicesSectionProps) {
//     const [activeService, setActiveService] = useState<MarketListingForm | null>(null);
//     const [expandedService, setExpandedService] = useState<MarketListingForm | null>(null);
//     const carouselRef = useRef<HTMLDivElement>(null);

//     useEffect(() => {
//         if (marketplaceListings && marketplaceListings.length > 0) {
//             setActiveService(marketplaceListings[0]); // Set first service as active initially
//         }
//     }, [marketplaceListings]);

//     // Handle carousel scroll for active state
//     const handleScroll = () => {
//         if (!carouselRef.current) return;

//         const scrollContainer = carouselRef.current;
//         const scrollLeft = scrollContainer.scrollLeft;
//         const containerWidth = scrollContainer.offsetWidth;
        
//         // Find the most centered card
//         let closestService = null;
//         let minDistance = Infinity;

//         scrollContainer.childNodes.forEach((child, index) => {
//             if (child instanceof HTMLElement) {
//                 const cardCenter = child.offsetLeft + child.offsetWidth / 2;
//                 const viewportCenter = scrollLeft + containerWidth / 2;
//                 const distance = Math.abs(cardCenter - viewportCenter);

//                 if (distance < minDistance) {
//                     minDistance = distance;
//                     closestService = marketplaceListings[index];
//                 }
//             }
//         });
//         setActiveService(closestService);
//     };

//     const scrollCarousel = (direction: 'left' | 'right') => {
//         if (carouselRef.current) {
//             const cardWidth = 600; // Approximate card width, adjust as needed
//             const scrollAmount = direction === 'right' ? cardWidth : -cardWidth;
//             carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
//         }
//     };

//     if (!marketplaceListings || marketplaceListings.length === 0) return null;

//     const primaryColor = themeSettings?.primaryColor ?? "#0d9488"; // Default teal

//     const handleOpenBookingModal = (service: MarketListingForm) => {
//         // This is a placeholder. In a real app, you'd trigger the BookingFormModal directly.
//         // For this example, we'll just log and keep it simple.
//         console.log("Opening booking modal for:", service.name);
//         // You can integrate your existing BookingFormModal here
//         // For now, setting expandedService to trigger the modal.
//         setExpandedService(service);
//     };

//     return (
//         <>
//             <section className="relative bg-gray-900 text-white py-24 lg:py-32 overflow-hidden">
//                 {/* Parallax Background Element */}
//                 <motion.div
//                     className="absolute inset-0 z-0"
//                     initial={{ opacity: 0.1 }}
//                     animate={{ opacity: 0.2 }}
//                     transition={{ duration: 1.5 }}
//                 >
//                     <Image
//                         src="https://images.unsplash.com/photo-1518655294026-c23cf75f3a09?auto=format&fit=crop&w=2000&q=80" // Cosmic background image
//                         alt="Cosmic background"
//                         loader={loader}
//                         fill
//                         className="object-cover object-center"
//                         style={{ transform: `translateX(${carouselRef.current?.scrollLeft * -0.1}px)` }} // Simple parallax
//                     />
//                      <div className="absolute inset-0 bg-gradient-to-b from-gray-950/80 to-black/90" />
//                 </motion.div>

//                 <div className="container mx-auto px-6 relative z-10">
                    
//                     {/* Header */}
//                     <div className="text-center max-w-4xl mx-auto mb-16 md:mb-20">
//                         <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
//                             Explore Our <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, #67e8f9)` }}>Galactic Services</span>
//                         </h2>
//                         <p className="text-xl text-gray-300 max-w-2xl mx-auto">
//                             Dive into a universe of bespoke solutions. Scroll through to discover unparalleled excellence.
//                         </p>
//                     </div>

//                     {/* === COSMOS CAROUSEL === */}
//                     <div className="relative">
//                         <div 
//                             ref={carouselRef}
//                             onScroll={handleScroll}
//                             className="flex overflow-x-scroll snap-x snap-mandatory gap-6 pb-6 md:pb-8 lg:pb-12 custom-scrollbar-hide"
//                             style={{ scrollPadding: '0 20px', '-webkit-overflow-scrolling': 'touch' }} // Centering with scroll-padding
//                         >
//                             {marketplaceListings.map((service, index) => (
//                                 <CarouselServiceCard
//                                     key={service.id}
//                                     index={index}
//                                     service={service}
//                                     primaryColor={primaryColor}
//                                     onClick={setExpandedService} // Click to expand
//                                     isActive={activeService?.id === service.id}
//                                 />
//                             ))}
//                         </div>
                        
//                         {/* Carousel Navigation Arrows */}
//                         <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-between px-4 md:px-0 pointer-events-none">
//                             <button 
//                                 onClick={() => scrollCarousel('left')}
//                                 className="p-3 bg-gray-800/60 hover:bg-gray-700/80 rounded-full transition-colors pointer-events-auto shadow-lg ml-[-20px] md:ml-[-40px]"
//                             >
//                                 <ArrowLeftIcon className="w-6 h-6 text-white" />
//                             </button>
//                             <button 
//                                 onClick={() => scrollCarousel('right')}
//                                 className="p-3 bg-gray-800/60 hover:bg-gray-700/80 rounded-full transition-colors pointer-events-auto shadow-lg mr-[-20px] md:mr-[-40px]"
//                             >
//                                 <ArrowRightIcon className="w-6 h-6 text-white" />
//                             </button>
//                         </div>
//                     </div>

//                 </div>
//             </section>

//             {/* --- EXPANDED DETAIL VIEW (SLIDES UP) --- */}
//             <AnimatePresence>
//                 {expandedService && (
//                     <ExpandedServiceDetail 
//                         service={expandedService} 
//                         primaryColor={primaryColor} 
//                         onClose={() => setExpandedService(null)} 
//                         onBook={handleOpenBookingModal}
//                     />
//                 )}
//             </AnimatePresence>
//         </>
//     );
// }