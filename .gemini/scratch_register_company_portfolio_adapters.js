const fs = require('fs');
const file = 'lib/website-builder/editable-adapters.ts';
let content = fs.readFileSync(file, 'utf8');

// 1. Add alias mappings
const aliasTarget = '  const aliasMap: Record<string, string> = {';
const newAliases = `  const aliasMap: Record<string, string> = {
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

content = content.replace(aliasTarget, newAliases);

// 2. Add adapter definitions before DIAGNOSTIC COMPONENT AUDIT & DISCOVERY
const auditTarget = '// DIAGNOSTIC COMPONENT AUDIT & DISCOVERY';
const newAdapters = `registerEditableComponent({
  componentKey: "CoreHighlightsSection",
  label: "Core Strategic Highlights & Pillars",
  category: "content",
  description: "Enterprise operational pillars, strategic trading architecture, and core capabilities.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation"],
  properties: {
    badge: { key: "badge", label: "Section Subtitle / Badge", type: "text", group: "content", defaultValue: "Trading Limited • Operational Architecture" },
    title: { key: "title", label: "Section Headline", type: "text", group: "content", defaultValue: "At the intersection of global demand and trusted supply." },
    description: { key: "description", label: "Strategic Overview", type: "textarea", group: "content", defaultValue: "We manage sophisticated trading channels for refined and industrial metals, combining regional sourcing access with institutional compliance." },
    "pillar0.title": { key: "pillar0.title", label: "Pillar 1 Title", type: "text", group: "content", defaultValue: "Gold Trading Made Simple" },
    "pillar0.description": { key: "pillar0.description", label: "Pillar 1 Description", type: "textarea", group: "content", defaultValue: "Direct sourcing from trusted local mines with verified laboratory testing." },
    "pillar1.title": { key: "pillar1.title", label: "Pillar 2 Title", type: "text", group: "content", defaultValue: "Quality Copper Supply" },
    "pillar1.description": { key: "pillar1.description", label: "Pillar 2 Description", type: "textarea", group: "content", defaultValue: "High-grade copper cathode supply for industrial manufacturers worldwide." },
    "pillar2.title": { key: "pillar2.title", label: "Pillar 3 Title", type: "text", group: "content", defaultValue: "Secure & Reliable Shipping" },
    "pillar2.description": { key: "pillar2.description", label: "Pillar 3 Description", type: "textarea", group: "content", defaultValue: "End-to-end protective multi-modal transit networks." },
  },
});

registerEditableComponent({
  componentKey: "GreyServicesSection",
  label: "Enterprise Solutions & Practice Areas",
  category: "commerce",
  description: "Interactive capability showcase, spot metrics, technical specs, and allocation pipelines.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation", "links"],
  properties: {
    badge: { key: "badge", label: "Badge Text", type: "text", group: "content", defaultValue: "Institutional Capabilities" },
    title: { key: "title", label: "Headline", type: "text", group: "content", defaultValue: "Reliable Enterprise Solutions" },
    description: { key: "description", label: "Description", type: "textarea", group: "content", defaultValue: "We bridge the gap between local operational capacities and global market demands." },
    ctaText: { key: "ctaText", label: "CTA Button Text", type: "text", group: "link", defaultValue: "Initialize Allocation Pipeline" },
    "service0.name": { key: "service0.name", label: "Service 1 Name", type: "text", group: "content", defaultValue: "Gold Procurement & Primary Refining Sourcing" },
    "service0.description": { key: "service0.description", label: "Service 1 Description", type: "textarea", group: "content", defaultValue: "Direct integration with verified regional extraction hubs." },
    "service0.metric": { key: "service0.metric", label: "Service 1 Metric", type: "text", group: "content", defaultValue: "99.99%" },
    "service0.metricLabel": { key: "service0.metricLabel", label: "Service 1 Metric Label", type: "text", group: "content", defaultValue: "Purity Standard" },
    "service0.imageUrl": { key: "service0.imageUrl", label: "Service 1 Image", type: "image", group: "media", defaultValue: "https://images.unsplash.com/photo-1610375228911-c4ab455981ca?q=80&w=2070&auto=format&fit=crop" },
  },
});

registerEditableComponent({
  componentKey: "AboutUsSpotlight",
  label: "Leadership & Corporate Spotlight",
  category: "content",
  description: "Executive narrative, cinematic operational window, and verified footprint metrics.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation", "media"],
  properties: {
    badge: { key: "badge", label: "Badge Text", type: "text", group: "content", defaultValue: "Corporate Infrastructure" },
    title: { key: "title", label: "Headline", type: "text", group: "content", defaultValue: "Connecting local resources to global markets." },
    description: { key: "description", label: "Narrative Overview", type: "textarea", group: "content", defaultValue: "Trusted international trading operations connecting local sources to global demand." },
    bannerUrl: { key: "bannerUrl", label: "Cinematic Media Asset", type: "image", group: "media", defaultValue: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop" },
    ctaText: { key: "ctaText", label: "Inquiry Button Text", type: "text", group: "link", defaultValue: "Inquire About Availability" },
    "metric0.value": { key: "metric0.value", label: "Metric 1 Value", type: "text", group: "content", defaultValue: "340k+ MT" },
    "metric0.label": { key: "metric0.label", label: "Metric 1 Label", type: "text", group: "content", defaultValue: "Total Metals Delivered" },
    "metric1.value": { key: "metric1.value", label: "Metric 2 Value", type: "text", group: "content", defaultValue: "12 Regional Hubs" },
    "metric1.label": { key: "metric1.label", label: "Metric 2 Label", type: "text", group: "content", defaultValue: "Trusted Sourcing Locations" },
  },
});

registerEditableComponent({
  componentKey: "ProgramsCausesSection",
  label: "Flagship Strategic Deployments",
  category: "content",
  description: "Horizontally scrollable portfolio of active corridors, infrastructure setups, and vault networks.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation", "media"],
  properties: {
    badge: { key: "badge", label: "Badge Text", type: "text", group: "content", defaultValue: "Enterprise Operations" },
    title: { key: "title", label: "Headline", type: "text", group: "content", defaultValue: "Strategic Trade Deployments" },
    "card0.name": { key: "card0.name", label: "Project 1 Title", type: "text", group: "content", defaultValue: "East African Sourcing Corridor" },
    "card0.description": { key: "card0.description", label: "Project 1 Description", type: "textarea", group: "content", defaultValue: "Establishing primary secure aggregation hubs and verified supply lines." },
    "card0.imageUrl": { key: "card0.imageUrl", label: "Project 1 Image", type: "image", group: "media", defaultValue: "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=600&q=80" },
  },
});

registerEditableComponent({
  componentKey: "ImpactStatsSection",
  label: "Audited Performance Matrix",
  category: "social_proof",
  description: "Cleared transactional values, active sovereign routes, and compliance audit metrics.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation"],
  properties: {
    badge: { key: "badge", label: "Badge Text", type: "text", group: "content", defaultValue: "Audited Capital & Performance" },
    title: { key: "title", label: "Headline", type: "text", group: "content", defaultValue: "Delivering Results at Scale" },
    description: { key: "description", label: "Description", type: "textarea", group: "content", defaultValue: "The success of our network is built on a foundation of speed, safety, and accuracy." },
    "metric0.value": { key: "metric0.value", label: "Stat 1 Value", type: "text", group: "content", defaultValue: "$480M+" },
    "metric0.label": { key: "metric0.label", label: "Stat 1 Label", type: "text", group: "content", defaultValue: "Settled Transactional Cleared Value" },
    "metric1.value": { key: "metric1.value", label: "Stat 2 Value", type: "text", group: "content", defaultValue: "14" },
    "metric1.label": { key: "metric1.label", label: "Stat 2 Label", type: "text", group: "content", defaultValue: "Active Sovereign Corridors" },
  },
});

registerEditableComponent({
  componentKey: "NewsSection",
  label: "Operational Intelligence Hub",
  category: "content",
  description: "Real-time market intelligence dispatches, logistics briefs, and risk management whitepapers.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation"],
  properties: {
    badge: { key: "badge", label: "Badge Text", type: "text", group: "content", defaultValue: "Operational Intelligence" },
    title: { key: "title", label: "Headline", type: "text", group: "content", defaultValue: "Market Updates & Analysis" },
    description: { key: "description", label: "Description", type: "textarea", group: "content", defaultValue: "Real-time dispatches, asset performance adjustments, and regulatory audits compiled straight from our global node terminals." },
    "card0.title": { key: "card0.title", label: "Article 1 Title", type: "text", group: "content", defaultValue: "Macro Physical Execution & Corridor Security: Q2 Trade Ledger Analytics" },
    "card0.excerpt": { key: "card0.excerpt", label: "Article 1 Excerpt", type: "textarea", group: "content", defaultValue: "An deep-dive inspection of logistics insulation protocols across active deepwater shipping hubs." },
  },
});

registerEditableComponent({
  componentKey: "TestimonialsNewsSection",
  label: "Partner Endorsements & Institutional Ledger",
  category: "social_proof",
  description: "Verified counterparty testimonials, institutional feedback, and partner quotes.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation"],
  properties: {
    badge: { key: "badge", label: "Badge Text", type: "text", group: "content", defaultValue: "Institutional Validation" },
    title: { key: "title", label: "Headline", type: "text", group: "content", defaultValue: "What Our Partners Say" },
    description: { key: "description", label: "Description", type: "textarea", group: "content", defaultValue: "Verified performance reports and testimonials from industry leaders." },
    bannerTitle: { key: "bannerTitle", label: "Banner Title", type: "text", group: "cta", defaultValue: "Ready to scale capital throughput safely?" },
    bannerSubtitle: { key: "bannerSubtitle", label: "Banner Subtitle", type: "textarea", group: "cta", defaultValue: "Establish your clearance endpoint today." },
    "item0.authorName": { key: "item0.authorName", label: "Author 1 Name", type: "text", group: "content", defaultValue: "Marcus Vance" },
    "item0.quote": { key: "item0.quote", label: "Author 1 Quote", type: "textarea", group: "content", defaultValue: "The company portfolio clearly showcased their expertise and successful projects." },
    "item0.role": { key: "item0.role", label: "Author 1 Role", type: "text", group: "content", defaultValue: "Managing Director, Global Liquidity Pools" },
  },
});

registerEditableComponent({
  componentKey: "CtaBoldSection",
  label: "High-Impact Partnership Call to Action",
  category: "cta",
  description: "Streamlined corporate contact prompt and liquidity acceleration trigger.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation", "links"],
  properties: {
    tag: { key: "tag", label: "Tag Text", type: "text", group: "content", defaultValue: "Fast-track your operations." },
    title: { key: "title", label: "Headline", type: "text", group: "content", defaultValue: "Optimize Your Cash Flow & Trade Speed" },
    subtitle: { key: "subtitle", label: "Subtitle", type: "textarea", group: "content", defaultValue: "Open a dedicated account with us to move your goods and capital more efficiently." },
    buttonText: { key: "buttonText", label: "Button Label", type: "text", group: "link", defaultValue: "Request a Connection" },
  },
});

registerEditableComponent({
  componentKey: "CallToActionSection",
  label: "Corporate Contact & Advisory Channel",
  category: "contact",
  description: "Executive inquiry gateway with messaging portal and scheduler integration.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation", "contact"],
  properties: {
    tag: { key: "tag", label: "Tag Text", type: "text", group: "content", defaultValue: "Get In Touch" },
    title: { key: "title", label: "Headline", type: "text", group: "content", defaultValue: "Let's Engage Start a Conversation" },
    description: { key: "description", label: "Description", type: "textarea", group: "content", defaultValue: "Have a question, or you want to get off the ground? Drop us a message using the form." },
  },
});

registerEditableComponent({
  componentKey: "EventsUpdatesSection",
  label: "Announcements & Key Milestones",
  category: "content",
  description: "Live upcoming announcements and scheduled executive events.",
  status: "FULLY_EDITABLE",
  capabilities: ["content", "presentation"],
  properties: {
    title: { key: "title", label: "Events Title", type: "text", group: "content", defaultValue: "Upcoming Events" },
    subtitle: { key: "subtitle", label: "Subtitle", type: "text", group: "content", defaultValue: "Get Involved" },
    description: { key: "description", label: "Description", type: "textarea", group: "content", defaultValue: "Join our community at an upcoming event." },
  },
});

` + auditTarget;

content = content.replace(auditTarget, newAdapters);
fs.writeFileSync(file, content, 'utf8');
console.log('Successfully registered CompanyPortfolio adapters in editable-adapters.ts');
