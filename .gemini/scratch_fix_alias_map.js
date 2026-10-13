const fs = require('fs');
const file = 'lib/website-builder/editable-adapters.ts';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the block of lines 128-150 that was prepended
const duplicatePrefix = `  const aliasMap: Record<string, string> = {
    "corehighlightssection": "CoreHighlightsSection",
    "core-highlights": "CoreHighlightsSection",
    "greyservicessection": "GreyServicesSection",
    "grey-services": "GreyServicesSection",
    "aboutusspotlight": "AboutUsSpotlight",
    "about-us-spotlight": "AboutUsSpotlight",
    "about-spotlight": "AboutUsSpotlight",
    "programscausessection": "ProgramsCausesSection",
    "programs-causes": "ProgramsCausesSection",
    "impactstatssection": "ImpactStatsSection",
    "impact-stats": "ImpactStatsSection",
    "newssection": "NewsSection",
    "news": "NewsSection",
    "news-section": "NewsSection",
    "testimonialsnewssection": "TestimonialsNewsSection",
    "testimonials-news": "TestimonialsNewsSection",
    "portfolio-testimonials": "TestimonialsNewsSection",
    "ctaboldsection": "CtaBoldSection",
    "cta-bold": "CtaBoldSection",
    "calltoactionsection": "CallToActionSection",
    "call-to-action": "CallToActionSection",
    "eventsupdatessection": "EventsUpdatesSection",
    "events-updates": "EventsUpdatesSection",`;

if (content.includes(duplicatePrefix)) {
  content = content.replace(duplicatePrefix, '  const aliasMap: Record<string, string> = {');
  console.log('Removed duplicate prefix block');
} else {
  console.log('Duplicate prefix block not found verbatim, checking...');
}

// 2. Now update the authentic component mappings in their original positions in aliasMap
content = content.replace('"calltoactionsection": "CtaSection",', '"calltoactionsection": "CallToActionSection",\n    "call-to-action": "CallToActionSection",');
content = content.replace('"call-to-action-section": "CtaSection",', '"call-to-action-section": "CallToActionSection",');
content = content.replace('"ctaboldsection": "CtaSection",', '"ctaboldsection": "CtaBoldSection",\n    "cta-bold": "CtaBoldSection",');
content = content.replace('"cta-bold-section": "CtaSection",', '"cta-bold-section": "CtaBoldSection",');
content = content.replace('"corehighlightssection": "FeaturesSection",', '"corehighlightssection": "CoreHighlightsSection",\n    "core-highlights": "CoreHighlightsSection",');
content = content.replace('"core-highlights-section": "FeaturesSection",', '"core-highlights-section": "CoreHighlightsSection",');
content = content.replace('"programscausessection": "FeaturesSection",', '"programscausessection": "ProgramsCausesSection",\n    "programs-causes": "ProgramsCausesSection",');
content = content.replace('"aboutusspotlight": "AboutSection",', '"aboutusspotlight": "AboutUsSpotlight",\n    "about-us-spotlight": "AboutUsSpotlight",\n    "about-spotlight": "AboutUsSpotlight",');
content = content.replace('"about-us-spotlight": "AboutSection",', '');
content = content.replace('"testimonialsnewssection": "TestimonialsSection",', '"testimonialsnewssection": "TestimonialsNewsSection",\n    "testimonials-news": "TestimonialsNewsSection",\n    "portfolio-testimonials": "TestimonialsNewsSection",');
content = content.replace('"newssection": "BlogSection",', '"newssection": "NewsSection",');
content = content.replace('"news-section": "BlogSection",', '"news-section": "NewsSection",');
content = content.replace('"eventsupdatessection": "BlogSection",', '"eventsupdatessection": "EventsUpdatesSection",\n    "events-updates": "EventsUpdatesSection",');
content = content.replace('"impactstatssection": "MetricsSection",', '"impactstatssection": "ImpactStatsSection",\n    "impact-stats": "ImpactStatsSection",');
content = content.replace('"serviceshero": "HeroSection",', '"serviceshero": "HeroSection",\n    "greyservicessection": "GreyServicesSection",\n    "grey-services": "GreyServicesSection",\n    "portfolio-services": "GreyServicesSection",');

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated aliasMap');
