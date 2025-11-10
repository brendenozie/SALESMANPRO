'use client';

import React from 'react';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
    CalendarDaysIcon, 
    ArrowRightIcon,
    ShieldCheckIcon, // New icon for security assessment
    BoltIcon,       // New icon for rapid action/crisis
} from '@heroicons/react/24/solid'; // Using solid icons for punch

// Define the shape of discoveryCall data and other props for clarity
interface DiscoveryCallContent {
    headline?: string;
    description?: string;
    ctaText?: string;
    ctaLink?: string;
}

interface ThemeSettings {
    primaryColor?: string; // Teal/Green (Safety)
    secondaryColor?: string; // Blue (Trust/Cyber)
    accentColor?: string; 
}

interface StoreFormData {
    name?: string;
    slug?: string;
    themeSettings?: ThemeSettings;
    contactEmail?: string;
    contactPhone?: string;
    discoveryCall?: DiscoveryCallContent;
}

// Fallback Data for Security Firm
const defaultFirmData = {
    name: 'CyberShield',
    primaryColor: '#00A880', 
    secondaryColor: '#3B82F6', 
    accentColor: '#FFC107', 
};


export default function SecurityReadinessSection() {
    // Assuming context returns proper security firm data
    const { storeFormData } = useStoreContext() as { storeFormData: StoreFormData };

    const {
        name,
        slug,
        themeSettings = {},
        contactEmail,
        contactPhone,
        discoveryCall = {},
    } = storeFormData;

    // Theme colors - using security defaults for visual integrity
    const primaryColor = themeSettings.primaryColor || defaultFirmData.primaryColor;
    const secondaryColor = themeSettings.secondaryColor || defaultFirmData.secondaryColor;
    const accentColor = themeSettings.accentColor || defaultFirmData.accentColor;

    // --- SECURITY-FOCUSED CONTENT ---
    const defaultHeadline = `Stop Guessing. Get a Real-Time {accent} Threat Assessment {accent} Now.`;
    const defaultDescription =
        'Your security posture demands immediate clarity. Schedule a personalized, no-cost audit with our elite analysts to identify hidden vulnerabilities before they escalate into a crisis.';
    const defaultCtaText = 'Request Your Security Readiness Audit';

    // Replace default content placeholders
    const title = discoveryCall.headline || defaultHeadline.replace('{accent}', defaultFirmData.accentColor);
    const subtitle = discoveryCall.description || defaultDescription;
    const ctaText = discoveryCall.ctaText || defaultCtaText;
    
    // --- CTA LINK LOGIC (UNCHANGED) ---
    let ctaLink = discoveryCall.ctaLink || '';
    if (!ctaLink) {
        if (slug) {
            ctaLink = `/${slug}/contact`; 
        } else if (contactEmail) {
            ctaLink = `mailto:${contactEmail}`; 
        } else if (contactPhone) {
            ctaLink = `tel:${contactPhone}`; 
        } else {
            ctaLink = '#'; 
        }
    }

    // Framer Motion variants (unchanged, as they are effective)
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                damping: 10,
                stiffness: 100,
                delayChildren: 0.2,
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    // Helper to handle the new {accent} placeholder for flexible highlighting
    const renderTitleWithAccent = (fullTitle: string, accentColor: string) => {
        if (fullTitle.includes('{accent}')) {
            const parts = fullTitle.split(/\{accent\}(.*?)\{\/accent\}/g);
            return parts.map((part, idx) => (
                idx % 2 === 1 ? (
                    <span key={idx} style={{ color: accentColor }}>{part}</span>
                ) : (
                    <React.Fragment key={idx}>{part}</React.Fragment>
                )
            ));
        }

        // Default fallback logic (highlighting the last word)
        const words = fullTitle.split(' ');
        if (words.length > 1) {
            const lastWord = words[words.length - 1];
            const rest = words.slice(0, -1).join(' ');
            return (
                <>
                    {rest}{' '}
                    <span style={{ color: accentColor }}>
                        {lastWord.replace(/[?!.,]$/, '')}
                    </span>
                    {lastWord.match(/[?!.,]$/) && lastWord.match(/[?!.,]$/)?.[0]}
                </>
            );
        }
        return fullTitle;
    };


    return (
        <motion.section
            className="relative py-16 md:py-24 px-6 lg:px-12 rounded-3xl text-center mx-auto max-w-7xl my-24 overflow-hidden shadow-2xl"
            style={{
                // Dark, high-impact gradient for security urgency
                background: `linear-gradient(135deg, ${primaryColor} 20%, #1e293b 80%)`, 
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
        >
            {/* Background pattern and radial glow for a high-tech/urgent feel */}
            <div
                className="absolute inset-0 opacity-20 z-0"
                style={{
                    background: `radial-gradient(circle at 10% 20%, #ffffff33 0%, transparent 20%),
                                 radial-gradient(circle at 90% 80%, ${secondaryColor}66 0%, transparent 20%)`,
                }}
            />
            {/* Binary code/circuitry overlay for a high-tech look */}
             <div className="absolute inset-0 z-0 opacity-[0.1]" style={{ 
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'10\' height=\'10\' viewBox=\'0 0 10 10\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23FFFFFF\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'2\' cy=\'2\' r=\'1\'/%3E%3C/g%3E%3C/svg%3E")', 
                backgroundSize: '30px 30px' 
            }}></div>

            <div className="relative z-10">
                <motion.h2
                    className="text-4xl md:text-6xl font-extrabold leading-tight text-white mb-6 drop-shadow-lg"
                    variants={itemVariants}
                >
                    {renderTitleWithAccent(title, accentColor)}
                </motion.h2>

                {subtitle && (
                    <motion.p
                        className="mt-4 text-white/90 max-w-4xl mx-auto text-lg md:text-2xl leading-relaxed opacity-90"
                        variants={itemVariants}
                    >
                        {subtitle}
                    </motion.p>
                )}

                <motion.div variants={itemVariants}>
                    {ctaLink ? (
                        <Link
                            href={ctaLink}
                            className="mt-10 inline-flex items-center justify-center px-10 py-4 rounded-full text-xl font-bold bg-white text-gray-900 shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:ring-4 focus:outline-none focus:ring-4"
                            // Custom styling for the hover ring to match the primary color
                            style={{ 
                                boxShadow: `0 0 40px ${primaryColor}44`,
                                color: primaryColor, // Make text the primary color
                                backgroundColor: 'white',
                                borderColor: primaryColor,
                                textShadow: 'none',
                            }}
                        >
                            <ShieldCheckIcon className="w-6 h-6 mr-3" />
                            {ctaText}
                            <BoltIcon className="w-5 h-5 ml-3" />
                        </Link>
                    ) : (
                        <div className="mt-10 text-white/70 text-lg">
                            Contact us directly: {contactEmail && <a href={`mailto:${contactEmail}`} className="underline hover:text-white">{contactEmail}</a>}
                            {contactEmail && contactPhone && ' or '}
                            {contactPhone && <a href={`tel:${contactPhone}`} className="underline hover:text-white">{contactPhone}</a>}
                            {!contactEmail && !contactPhone && 'Please configure a contact method.'}
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.section>
    );
}