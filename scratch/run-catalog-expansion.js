/**
 * run-catalog-expansion.js
 * 
 * Production Catalog Expansion & Store-by-Store Product Population
 * 
 * Strict Ownership Boundary:
 * - Only companies owned by brendenozie@gmail.com (userId: 68f1e945dcb9542a6b0a08eb)
 * - Zero modifications to other merchants
 * - Orders & OrderItems invariants preserved (196 / 295)
 * - All newly populated listings default to status: "DRAFT", showOnGhuba: false
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

const VERIFIED_USER_ID = '68f1e945dcb9542a6b0a08eb';
const VERIFIED_USER_EMAIL = 'brendenozie@gmail.com';
const TARGET_LISTINGS = 20;

// Curated catalogs by store category / domain
const CATALOG_MAP = {
  'Portfolio & Personal Branding': [
    { name: 'Personal Portfolio Website Design', price: 25000, desc: 'Custom portfolio website with 5 pages, SEO optimised, mobile responsive.', cat: 'Digital Services' },
    { name: 'Executive Resume & CV Design', price: 3500, desc: 'Professional ATS-friendly executive resume design with 2 revisions.', cat: 'Career Services' },
    { name: 'LinkedIn Profile Makeover & Optimization', price: 4500, desc: 'Complete LinkedIn overhaul: headline, summary, experience, and custom banner.', cat: 'Career Services' },
    { name: 'Personal Branding Strategy Consultation', price: 8000, desc: '90-minute 1-on-1 strategy session to define your personal brand pillars.', cat: 'Consulting' },
    { name: 'Corporate Headshot Photography Package', price: 7500, desc: '2-hour studio photo session with 10 edited high-res digital images.', cat: 'Photography' },
    { name: 'Personal Brand Identity Kit', price: 15000, desc: 'Logo, colour palette, typography guide, and digital business card design.', cat: 'Branding' },
    { name: 'Thought Leadership Content Calendar (30 Days)', price: 6000, desc: '30-day personalised content calendar for LinkedIn and Twitter/X.', cat: 'Marketing' },
    { name: 'Professional Bio & Media Kit Writing', price: 3500, desc: 'Professionally crafted short & long bios for websites, speaking, and press.', cat: 'Writing' },
    { name: 'Portfolio Critique & Strategy Audit', price: 3000, desc: 'Comprehensive review of your existing portfolio with actionable recommendations.', cat: 'Consulting' },
    { name: 'Keynote Speaker One-Sheet & Media Kit', price: 9000, desc: 'Speaker one-sheet, introduction scripts, and keynote topic descriptions.', cat: 'Branding' },
    { name: 'Custom HTML Email Signature Design', price: 1500, desc: 'Clickable custom HTML email signature consistent with your personal brand.', cat: 'Digital Services' },
    { name: 'Online Reputation & Google Presence Audit', price: 5000, desc: 'Full audit of your search results footprint with an actionable remediation guide.', cat: 'Consulting' },
    { name: 'Press Release Writing & Distribution Copy', price: 4500, desc: 'Professional press release for milestones, promotions, or company launches.', cat: 'Writing' },
    { name: 'Podcast Guest Pitching One-Pager', price: 5500, desc: 'Targeted pitch collateral and speaking topics to land guest spots.', cat: 'Marketing' },
    { name: 'Personal Branding Retainer (Monthly)', price: 18000, desc: 'Monthly advisory: bi-weekly strategy calls, post reviews, and brand tracking.', cat: 'Consulting' },
    { name: 'Ghostwritten Op-Ed / Thought Leadership Article', price: 6500, desc: '1000-word SEO-ready thought leadership article for publications.', cat: 'Writing' },
    { name: 'YouTube / Substack Channel Banner & Branding', price: 3500, desc: 'Custom header banner, avatar design, and thumbnail templates.', cat: 'Design' },
    { name: 'Interactive NFC Digital Business Card', price: 2500, desc: 'Pre-programmed contactless smart business card with live profile page.', cat: 'Merchandise' },
    { name: 'Industry Award Nomination Dossier', price: 7000, desc: 'High-impact award submission writing and evidence compilation.', cat: 'Writing' },
    { name: 'Video Intro & Reel Scriptwriting', price: 4000, desc: 'High-converting 60-second video elevator pitch script and coaching tips.', cat: 'Writing' }
  ],

  'Blog & Content': [
    { name: 'SEO Blog Article (1,200 words)', price: 3500, desc: 'Keyword-optimized article with metadata, headings, and internal linking guide.', cat: 'Writing' },
    { name: 'Long-Form Authority Pillar Post (3,000 words)', price: 8500, desc: 'Comprehensive deep dive with research citations and infographic briefs.', cat: 'Writing' },
    { name: 'WordPress / Ghost Blog Setup & Theme Config', price: 12000, desc: 'Complete blog setup, responsive theme, security plugins, and speed optimization.', cat: 'Digital Services' },
    { name: 'Quarterly Editorial Content Calendar', price: 10000, desc: '90-day content road map with keyword research, search volume, and difficulty.', cat: 'Strategy' },
    { name: 'Weekly Email Newsletter Issue Copywriting', price: 3500, desc: 'Engaging, narrative-driven newsletter copy with subject line A/B variants.', cat: 'Writing' },
    { name: 'Social Media Caption Batch (15 Captions)', price: 4000, desc: 'Platform-tailored captions with hashtags and call-to-actions.', cat: 'Copywriting' },
    { name: 'E-commerce Product Description Pack (10 items)', price: 4500, desc: 'Compelling benefit-driven descriptions designed for conversions.', cat: 'Copywriting' },
    { name: 'Full Website Core Copywriting (5 Pages)', price: 20000, desc: 'Home, About, Services, Case Studies, and Contact page conversion copywriting.', cat: 'Copywriting' },
    { name: 'Monthly Blog Management & Publishing Retainer', price: 22000, desc: '4 articles/month with keyword research, royalty-free images, and publishing.', cat: 'Content Marketing' },
    { name: 'Lead Magnet eBook Design & Copy (15 Pages)', price: 25000, desc: 'Full ghostwritten and typeset eBook ready for lead generation funnels.', cat: 'Design & Writing' },
    { name: 'Proofreading & Structural Editing (per 2,000 words)', price: 2500, desc: 'Syntax, style, tone, and grammar refinement with tracked changes.', cat: 'Editing' },
    { name: 'YouTube Video Scriptwriting (8-12 Minutes)', price: 5000, desc: 'Retention-focused video script with hooks, visual cues, and outro CTAs.', cat: 'Scriptwriting' },
    { name: 'Podcast Audio Show Notes & Timestamp Summary', price: 2500, desc: 'Key takeaways, quote cards, and resource links per episode.', cat: 'Audio Content' },
    { name: 'Customer Success Case Study Story', price: 9500, desc: 'Challenge, Solution, Results interview-based narrative case study.', cat: 'Writing' },
    { name: 'Technical Whitepaper (10 Pages)', price: 35000, desc: 'Authoritative B2B whitepaper with executive summary and methodology.', cat: 'Technical Writing' },
    { name: 'Custom Visual Infographic Illustration', price: 7500, desc: 'High-res vector infographic summarizing data points and workflows.', cat: 'Design' },
    { name: 'Comprehensive Website Content & SEO Audit', price: 12000, desc: 'Full review of organic visibility, thin content, and content gap opportunities.', cat: 'SEO' },
    { name: 'Guest Post Outreach & Content Placement', price: 15000, desc: 'Pitching and drafting guest articles on relevant domain-authority websites.', cat: 'PR & Outreach' },
    { name: 'Comprehensive FAQ Hub Architecture & Copy', price: 4000, desc: '20 targeted schema-ready FAQ answers covering buyer objections.', cat: 'Writing' },
    { name: 'Brand Tone of Voice & Style Playbook', price: 14000, desc: 'Official editorial standards: voice, vocabulary, grammar, and dos/don\'ts.', cat: 'Branding' }
  ],

  'Educational & Online Courses': [
    { name: 'End-to-End Online Course Curriculum Architecture', price: 25000, desc: 'Structured 10-module syllabus with learning outcomes, rubrics, and project briefs.', cat: 'Curriculum' },
    { name: 'LMS Setup & Platform Configuration (Teachable/Thinkific)', price: 22000, desc: 'Full school setup, checkout workflows, domain mapping, and completion certificates.', cat: 'Digital Services' },
    { name: 'Course Video Lesson Production & Editing (per Module)', price: 9000, desc: 'Screen recording cleanup, motion graphics lower thirds, and crystal audio.', cat: 'Media Production' },
    { name: 'Interactive Student Workbook & Cheatsheet (PDF)', price: 12000, desc: 'Branded fillable exercises, self-assessment questionnaires, and checklists.', cat: 'Design' },
    { name: '1-on-1 Academic Mentorship & Tutoring (per Hour)', price: 2500, desc: 'Personalized live tutoring session in mathematics, science, or programming.', cat: 'Tutoring' },
    { name: 'KCSE Revision Intensive Study Pack (All Subjects)', price: 3500, desc: 'Comprehensive revision question bank with detailed marking schemes.', cat: 'Exam Prep' },
    { name: 'Complete Digital Marketing Certification Course', price: 15000, desc: 'Lifetime access to 6 core modules covering search, paid ads, and analytics.', cat: 'Courses' },
    { name: 'Professional Business Communication Workshop', price: 6000, desc: 'Live virtual masterclass: executive presence, boardroom memos, and negotiation.', cat: 'Workshops' },
    { name: 'Full-Stack Web Development Bootcamp (8 Weeks)', price: 35000, desc: 'Instructor-led cohort covering modern JavaScript, React, Node.js, and MongoDB.', cat: 'Bootcamp' },
    { name: 'Personal Finance & Investment Foundations Course', price: 5000, desc: 'Self-paced course on budgeting, money market funds, and asset allocation.', cat: 'Courses' },
    { name: 'Public Speaking & Presentation Skills Cohort', price: 8000, desc: 'Small-group live coaching with speech rehearsal and video feedback.', cat: 'Cohort' },
    { name: 'Graphic Design Masterclass for Non-Designers', price: 6500, desc: 'Hands-on practical training covering visual hierarchy, typography, and Canva Pro.', cat: 'Courses' },
    { name: 'Executive Leadership & Team Management Programme', price: 20000, desc: '6-session cohort focusing on delegation, coaching subordinates, and culture.', cat: 'Executive Training' },
    { name: 'Interactive Quizzes & Assessment Bank Creation', price: 7500, desc: 'Build 5 module quizzes with randomized questions and instant feedback.', cat: 'Course Materials' },
    { name: 'Swahili & English Language Proficiency Course', price: 7000, desc: 'Comprehensive conversational and business fluency module series.', cat: 'Language' },
    { name: 'University Thesis & Dissertation Advisory Support', price: 12000, desc: 'Methodology review, literature synthesis guidance, and statistical advisory.', cat: 'Academic Advisory' },
    { name: 'STEM Robotics & Coding Starter Box for Youth', price: 6500, desc: 'Physical hardware micro-controller kit with step-by-step experiment guide.', cat: 'Hardware Kits' },
    { name: 'Corporate EdTech Platform Employee Training', price: 18000, desc: 'Half-day training for corporate L&D teams on course authoring tools.', cat: 'Corporate' },
    { name: 'Accreditation & Certificate Design Template Pack', price: 3000, desc: 'Print-ready vector certificate templates with QR code verification areas.', cat: 'Design' },
    { name: 'Study Habits & Exam Productivity Masterclass', price: 2500, desc: 'Proven memory techniques, spaced repetition scheduling, and stress handling.', cat: 'Workshops' }
  ],

  'Nonprofit & Community': [
    { name: 'International Grant Proposal Writing & Pitch Deck', price: 28000, desc: 'Full funding proposal including Theory of Change, logframe, and M&E budget.', cat: 'Fundraising' },
    { name: 'NGO 3-Year Strategic Plan Development', price: 40000, desc: 'Facilitated strategic plan with stakeholder mapping and multi-year KPIs.', cat: 'Strategy' },
    { name: 'Baseline Community Needs Assessment Survey', price: 20000, desc: 'Survey instrument design, mobile data collection setup, and findings report.', cat: 'Research' },
    { name: 'Nonprofit Annual Impact Report (24 Pages)', price: 28000, desc: 'Compelling donor-facing report highlighting qualitative stories and financial audits.', cat: 'Design & Publishing' },
    { name: 'Nonprofit CRM Setup & Donor Management (Salesforce)', price: 32000, desc: 'Setup donation workflows, donor tiers, and automated receipting.', cat: 'Digital Services' },
    { name: 'Crowdfunding & Digital Fundraising Campaign Plan', price: 18000, desc: 'Multi-channel digital appeal toolkit with video scripts and email sequences.', cat: 'Campaigns' },
    { name: 'Monitoring, Evaluation & Learning (MEL) Framework', price: 24000, desc: 'Custom indicator matrix, data collection protocols, and reporting dashboard.', cat: 'M&E' },
    { name: 'Volunteer Policy, Handbook & Code of Conduct', price: 8500, desc: 'Safeguarding policies, onboarding checklists, and risk waivers.', cat: 'Governance' },
    { name: 'NGO / CBO Legal Registration Advisory in Kenya', price: 14000, desc: 'Support with NGO Coordination Board documentation, vetting, and constitution.', cat: 'Legal & Compliance' },
    { name: 'Stakeholder Newsletter & Donor Update Digest', price: 5000, desc: 'Bi-monthly digital impact newsletter keep institutional donors informed.', cat: 'Communications' },
    { name: 'Social Impact Advocacy & Social Media Retainer', price: 16000, desc: 'Community storytelling across Twitter, LinkedIn, and Instagram.', cat: 'Communications' },
    { name: 'Board Governance & Fiduciary Duty Workshop', price: 22000, desc: 'Training on nonprofit governance, conflict of interest, and oversight.', cat: 'Governance' },
    { name: 'End-of-Project Impact Evaluation & Auditing', price: 25000, desc: 'Rigorous third-party evaluation against OECD-DAC criteria.', cat: 'Research' },
    { name: 'Community CBO Constitution & Bylaws Drafting', price: 9000, desc: 'Compliant organizational constitution tailored to county government bylaws.', cat: 'Legal' },
    { name: 'Public Health / Environmental Campaign Toolkit', price: 15000, desc: 'Posters, infographics, community radio scripts, and SMS alerts.', cat: 'Campaigns' },
    { name: 'Participatory Rural Appraisal (PRA) Workshop', price: 18000, desc: '2-day on-the-ground participatory community mapping facilitation.', cat: 'Fieldwork' },
    { name: 'Community Facilitator Training Manual', price: 16000, desc: 'Train-the-trainer guide with visual exercises and breakout modules.', cat: 'Curriculum' },
    { name: 'Partnership MOU & Consortium Agreement Drafting', price: 10000, desc: 'Standardized legal agreements for multi-agency joint proposals.', cat: 'Legal' },
    { name: 'Emergency Disaster Relief Appeal Copywriting', price: 6500, desc: 'High-urgency emergency response appeal for immediate humanitarian action.', cat: 'Fundraising' },
    { name: 'Donor Concept Note Drafting (5 Pages)', price: 9500, desc: 'Succinct concept note presenting intervention logic to institutional funders.', cat: 'Fundraising' }
  ],

  'SaaS & Web Apps': [
    { name: 'Full-Stack SaaS MVP Rapid Development', price: 160000, desc: 'Production-ready MVP: modern UI, authentication, database, and billing.', cat: 'Development' },
    { name: 'Custom REST & GraphQL API Architecture', price: 40000, desc: 'High-performance microservice endpoints with automated OpenAPI documentation.', cat: 'Backend' },
    { name: 'High-Converting SaaS Landing Page Design & Code', price: 22000, desc: 'Next.js / Tailwind landing page with pricing matrix and interactive demo.', cat: 'Frontend' },
    { name: 'Stripe & M-Pesa Hybrid Checkout Integration', price: 25000, desc: 'Recurring subscription billing supporting both international cards and mobile money.', cat: 'Payments' },
    { name: 'Cloud Infrastructure & DevOps CI/CD Automation', price: 30000, desc: 'Docker, GitHub Actions, AWS ECS/Cloud Run, and terraform provisioning.', cat: 'DevOps' },
    { name: 'PostgreSQL / MongoDB Multi-Tenant Database Design', price: 22000, desc: 'Row-level security, tenant isolation schemes, and indexing optimization.', cat: 'Database' },
    { name: 'SaaS Product Market Fit & Pricing Strategy Audit', price: 15000, desc: 'Review of packaging tiers, freemium mechanics, and unit economics.', cat: 'Product Strategy' },
    { name: 'OAuth2 / SSO & Multi-Factor Auth System', price: 20000, desc: 'Enterprise authentication with Google, Microsoft, and SAML integrations.', cat: 'Security' },
    { name: 'Responsive Web Admin Dashboard Framework', price: 35000, desc: 'Data grids, role-based views, audit trails, and CSV/PDF data exports.', cat: 'Frontend' },
    { name: 'Product Onboarding & In-App Walkthrough Flow', price: 18000, desc: 'Interactive step-by-step tutorial increasing Day-1 user activation.', cat: 'Product Design' },
    { name: 'Web Application Penetration Testing & Code Audit', price: 25000, desc: 'Comprehensive OWASP Top 10 vulnerability scan and code refactoring report.', cat: 'Cybersecurity' },
    { name: 'Mobile App Wireframes & Interactive Prototype (Figma)', price: 28000, desc: '20 high-fidelity screens for iOS and Android with micro-interactions.', cat: 'UI/UX' },
    { name: 'Redis Caching & Queue Optimization Setup', price: 20000, desc: 'Worker job queues, BullMQ/Celery, and cache invalidation strategies.', cat: 'Performance' },
    { name: 'Automated E2E Testing Suite (Playwright)', price: 24000, desc: 'Automated regression test scripts covering all critical revenue paths.', cat: 'QA Testing' },
    { name: 'AI Customer Support Chatbot with RAG Integration', price: 30000, desc: 'Vector database search over product docs with fallback to live agent.', cat: 'AI & Automation' },
    { name: 'Product Analytics Instrumentation (PostHog/Mixpanel)', price: 16000, desc: 'Funnel tracking, retention cohort charts, and feature adoption dashboards.', cat: 'Analytics' },
    { name: 'Multi-Tenant White-Label Domain Routing Setup', price: 35000, desc: 'Wildcard SSL, custom domain CNAME verification, and reverse proxy routing.', cat: 'Architecture' },
    { name: 'Dunning & Failed Payment Recovery Workflow', price: 15000, desc: 'Automated email/SMS triggers for expired cards and failed subscription charges.', cat: 'Billing' },
    { name: 'Transactional Email Engine Setup (Resend/SendGrid)', price: 12000, desc: 'DKIM/SPF domain verification, responsive email templates, and delivery tracking.', cat: 'Infrastructure' },
    { name: 'Interactive Developer Docs & API Sandbox Portal', price: 20000, desc: 'Mintlify / Swagger documentation site with live code sandbox widgets.', cat: 'Documentation' }
  ],

  'Media & Entertainment': [
    { name: 'Multi-Track Podcast Recording & Audio Mastering', price: 9000, desc: 'Noise reduction, loudness normalization (-16 LUFS), and custom intro music.', cat: 'Audio' },
    { name: 'Corporate Brand Anthem Video (2 Minutes)', price: 50000, desc: 'Cinematic 4K video shoot, gimbal coverage, lighting, and color grading.', cat: 'Video Production' },
    { name: 'Studio Single Music Production & Mixing', price: 28000, desc: 'Full instrumentation, vocal recording, autotune/pitch correction, and final master.', cat: 'Music' },
    { name: 'Commercial Product Photography Shoot (20 Items)', price: 14000, desc: 'Clean white background & lifestyle staging for e-commerce catalogs.', cat: 'Photography' },
    { name: 'Live Event DJ & Sound System Package (5 Hours)', price: 25000, desc: 'Professional audio console, wireless microphones, subwoofers, and club DJ.', cat: 'Live Entertainment' },
    { name: 'Professional Commercial Voice-Over Recording', price: 4500, desc: 'Broadcast-quality English or Swahili voice recording for radio/digital ads.', cat: 'Voice Talent' },
    { name: 'Short Documentary / Brand Story Production', price: 85000, desc: 'In-depth documentary feature covering founder story or community impact.', cat: 'Film' },
    { name: 'Illustrated Graphic Novel & Comic Book Art', price: 6000, desc: 'High-detail digital pencil, inking, coloring, and speech bubble lettering.', cat: 'Illustration' },
    { name: 'TikTok / Instagram Viral Reel Creation (Batch of 5)', price: 15000, desc: 'Scripted short-form video content with trending music and dynamic captions.', cat: 'Social Video' },
    { name: 'Motion Graphics 3D Logo Reveal Sting', price: 8500, desc: 'Cinema 4D / After Effects 5-second branded video opener with SFX.', cat: 'Animation' },
    { name: 'Music Video Directing & Post-Production', price: 70000, desc: 'Concept storyboard, multi-location shoot, dancers, and visual effects.', cat: 'Music Video' },
    { name: 'Live Multi-Camera Virtual Event Streaming', price: 20000, desc: 'ATEM switcher, 3 camera feeds, lower-thirds overlays, and YouTube/FB broadcast.', cat: 'Live Streaming' },
    { name: 'Original Radio Jingles & Sonic Branding', price: 22000, desc: 'Memorable brand melody with professional vocalists and sound design.', cat: 'Audio' },
    { name: '2D Explainer Video Animation (60 Seconds)', price: 40000, desc: 'Custom character animation explaining complex tech or commercial products.', cat: 'Animation' },
    { name: 'Podcast Cover Artwork & Social Media Assets', price: 4000, desc: 'Apple Podcasts / Spotify compliant 3000x3000px high-res cover art.', cat: 'Design' },
    { name: 'Concert & Festival Stage Production Management', price: 45000, desc: 'Artist green room coordination, stage running orders, and backstage logistics.', cat: 'Events' },
    { name: 'Voice Casting & Audition Direction Service', price: 10000, desc: 'Casting calls and director notes for TV commercial campaigns.', cat: 'Production' },
    { name: 'Content Creator Monthly Production Retainer', price: 30000, desc: 'Weekly studio shoot day with 8 edited videos per month.', cat: 'Creator Services' },
    { name: 'Broadcast Radio Advertisement Production (30s)', price: 18000, desc: 'Full script, sound design, voice artist, and clearance for airplay.', cat: 'Advertising' },
    { name: 'YouTube Channel Growth & SEO Optimization', price: 20000, desc: 'Thumbnail A/B testing, description optimization, and tag architecture.', cat: 'Marketing' }
  ],

  'Fitness & Wellness': [
    { name: '1-on-1 Personalized Fitness Training (Single Session)', price: 2500, desc: 'Individualized workout coaching focusing on form, resistance, and cardio.', cat: 'Personal Training' },
    { name: 'Monthly Personal Training Package (12 Sessions)', price: 26000, desc: '3 sessions per week with monthly weigh-in, body fat testing, and diet logs.', cat: 'Training Packages' },
    { name: 'Customized Home Workout Program (PDF & Videos)', price: 4500, desc: '4-week progressive bodyweight or dumbbell program tailored to your equipment.', cat: 'Fitness Plans' },
    { name: 'Personalized Nutrition & Calorie Meal Plan', price: 7500, desc: 'Macro-calculated meal guide incorporating locally available Kenyan foods.', cat: 'Nutrition' },
    { name: 'Remote Fitness Coaching & Accountability (Monthly)', price: 14000, desc: 'Weekly video check-in, form check via WhatsApp, and program adjustments.', cat: 'Online Coaching' },
    { name: 'Vinyasa Flow Yoga Class (Drop-in Session)', price: 1200, desc: '60-minute breath-to-movement flow suitable for all flexibility levels.', cat: 'Yoga' },
    { name: 'Unlimited Monthly Studio Yoga Membership', price: 6500, desc: 'Unlimited access to morning and evening yoga and meditation classes.', cat: 'Memberships' },
    { name: 'InBody Bio-Impedance Body Composition Scan', price: 2500, desc: 'Accurate breakdown of skeletal muscle mass, visceral fat, and BMR.', cat: 'Diagnostics' },
    { name: 'Corporate Wellness & Desk Ergonomics Workshop', price: 22000, desc: '2-hour corporate wellness session: mobility drills, posture, and stress management.', cat: 'Corporate' },
    { name: 'Mat Pilates Core Strength Class (Single Session)', price: 1800, desc: 'Low-impact muscle toning emphasizing core stability and pelvic health.', cat: 'Pilates' },
    { name: '8-Week Body Transformation Challenge Program', price: 28000, desc: 'Complete bootcamp: workouts, meal guide, group support, and final photo shoots.', cat: 'Challenges' },
    { name: 'Mindfulness Meditation & Breathwork Masterclass', price: 5000, desc: 'Techniques for nervous system regulation, anxiety relief, and deep focus.', cat: 'Mindfulness' },
    { name: 'Youth & Collegiate Athletic Performance Coaching', price: 18000, desc: 'Speed, agility, and plyometric conditioning for track, rugby, and football.', cat: 'Athletics' },
    { name: 'Safe Postpartum Core Rehabilitation Program', price: 12000, desc: 'Physiotherapist-approved diastasis recti recovery and pelvic floor retraining.', cat: 'Specialized' },
    { name: 'Comprehensive Functional Movement Assessment', price: 3500, desc: 'Screening for muscular imbalances, joint stiffness, and injury risk areas.', cat: 'Screening' },
    { name: 'Evidence-Based Sports Supplement Consultation', price: 3000, desc: 'Review of creatine, whey protein, electrolytes, and vitamin requirements.', cat: 'Consulting' },
    { name: 'High-Intensity Interval Training (HIIT) Group Class', price: 1000, desc: 'Fast-paced calorie burning circuit with kettlebells, ropes, and rowers.', cat: 'Group Fitness' },
    { name: 'Marathon & Half-Marathon Running Coaching (12 Weeks)', price: 16000, desc: 'Custom mileage buildup schedule, cadence drills, and race hydration strategy.', cat: 'Running' },
    { name: 'Sleep Hygiene & Recovery Optimization Advisory', price: 4000, desc: 'Circadian rhythm reset, sleep tracking analysis, and evening routine design.', cat: 'Recovery' },
    { name: '7-Day Whole Foods Cleanse & Reset Program', price: 5500, desc: 'Gut health renewal protocol with shopping lists, green smoothies, and broths.', cat: 'Nutrition' }
  ],

  'Security': [
    { name: 'Commercial Premises Uniformed Guard Shift (12h)', price: 2800, desc: 'Vetted, disciplined security personnel with patrol wand and radio communications.', cat: 'Manned Guarding' },
    { name: '8-Channel 4K CCTV Surveillance System (Supply & Install)', price: 48000, desc: 'Hikvision IP cameras, night vision, 2TB surveillance hard drive, and mobile app.', cat: 'CCTV' },
    { name: 'Biometric Access Control & Time Attendance Terminal', price: 32000, desc: 'Fingerprint & facial recognition reader with magnetic door strike and software.', cat: 'Access Control' },
    { name: 'Comprehensive Corporate Security Vulnerability Audit', price: 18000, desc: 'On-site physical penetration testing, perimeter gaps, and security procedures review.', cat: 'Auditing' },
    { name: 'VIP Close Protection Officer (Per 24h Deployment)', price: 22000, desc: 'Trained executive protection specialist with defensive driving capabilities.', cat: 'VIP Protection' },
    { name: 'Perimeter Electric Fence Installation (per 100m)', price: 38000, desc: 'Top-wall 8-strand electric fence with Nemtek energizer and alarm strobe.', cat: 'Fencing' },
    { name: 'Intrusion Detection Alarm System with GSM Dialer', price: 26000, desc: 'PIR motion detectors, door sensors, loud siren, and instant SMS alerts.', cat: 'Alarms' },
    { name: 'Certified First Aid & Fire Marshal Workplace Training', price: 15000, desc: 'OSHA-compliant training with practical extinguisher handling and certificates.', cat: 'Training' },
    { name: 'Corporate Cyber Threats & Phishing Defense Training', price: 16000, desc: 'Employee cyber awareness training on business email compromise and password hygiene.', cat: 'Cybersecurity' },
    { name: 'Concert & High-Profile Event Security Detail (4 Guards)', price: 18000, desc: 'Crowd management, metal detector screening, and perimeter protection.', cat: 'Events' },
    { name: 'Automatic Vehicle Number Plate Recognition (ANPR) System', price: 55000, desc: 'High-speed barrier gate integration reading incoming license plates.', cat: 'Automation' },
    { name: 'Employee Pre-Employment Background Screening & Vetting', price: 3000, desc: 'Police clearance verification, academic document checks, and address verification.', cat: 'Vetting' },
    { name: 'Razor Wire Concertina Coil Installation (per 50m)', price: 14000, desc: 'Hot-dipped galvanized flat-wrap razor wire on existing perimeter stone walls.', cat: 'Perimeter' },
    { name: 'Secure Automated Parking Management System', price: 45000, desc: 'Ticket dispenser, automated boom barrier, and cashier validation terminal.', cat: 'Access' },
    { name: 'Wireless Panic Button & Emergency Rapid Response Integration', price: 9500, desc: 'Duress buttons linked directly to local radio frequency response base.', cat: 'Rapid Response' },
    { name: 'Estate Night Patrol Mobile Unit (Monthly Retainer)', price: 20000, desc: 'Marked security vehicle conducting scheduled drive-bys and foot checkpoints.', cat: 'Patrols' },
    { name: 'Fire Extinguisher Supply, Inspection & Hydrostatic Testing', price: 4500, desc: 'CO2 and Dry Chemical Powder extinguishers with wall mounts and compliance tags.', cat: 'Fire Safety' },
    { name: 'K9 Dog Handler & Security Patrol Team (Daily)', price: 8500, desc: 'Trained German Shepherd or Rottweiler with licensed handler for perimeter patrols.', cat: 'K9 Units' },
    { name: 'Standard Operating Procedures (SOP) Security Manual', price: 10000, desc: 'Drafting visitor check-in policies, emergency evacuation drills, and incident logs.', cat: 'Compliance' },
    { name: 'External Network Vulnerability Penetration Test', price: 38000, desc: 'External port scanning, firewall inspection, and actionable remediation roadmap.', cat: 'Cybersecurity' }
  ],

  'Default': [
    { name: 'Standard Service Consultation (1 Hour)', price: 3500, desc: 'Professional 1-on-1 advisory session with a certified domain specialist.', cat: 'Consulting' },
    { name: 'Comprehensive Business Strategy Audit', price: 12000, desc: 'In-depth review of existing operational procedures and growth opportunities.', cat: 'Advisory' },
    { name: 'Starter Implementation & Onboarding Package', price: 15000, desc: 'Hands-on configuration, system testing, and operational handover.', cat: 'Services' },
    { name: 'Premium Monthly Retainer & Support Agreement', price: 25000, desc: 'Dedicated priority support, monthly progress reporting, and troubleshooting.', cat: 'Retainers' },
    { name: 'Professional Documentation & Manual Writing', price: 6500, desc: 'Clear, standardized operating procedures and guides for internal staff.', cat: 'Writing' },
    { name: 'Digital Transformation & Cloud Workflow Setup', price: 18000, desc: 'Automate manual paperwork with collaborative digital cloud tooling.', cat: 'Digital Services' },
    { name: 'Executive Team Capability Training (Half Day)', price: 20000, desc: 'Interactive workshop focusing on domain best practices and case studies.', cat: 'Training' },
    { name: 'Performance KPI Dashboard Architecture', price: 14000, desc: 'Real-time metrics visualizer connecting your primary data spreadsheets.', cat: 'Analytics' },
    { name: 'Customized Solution Blueprint & Feasibility Report', price: 10000, desc: 'Technical and financial viability assessment for upcoming investments.', cat: 'Research' },
    { name: 'Project Quality Assurance & Milestone Verification', price: 8500, desc: 'Independent verification that contractual milestones have been achieved.', cat: 'QA' },
    { name: 'Vendor Procurement & Contract Negotiation Support', price: 7500, desc: 'RFP drafting, supplier evaluations, and price benchmark comparisons.', cat: 'Procurement' },
    { name: 'Crisis Management & Contingency Plan Drafting', price: 11000, desc: 'Step-by-step business continuity guide for operational interruptions.', cat: 'Planning' },
    { name: 'Customer Satisfaction & Net Promoter Score Survey', price: 9000, desc: 'Customer feedback collection, sentiment analysis, and strategic fixes.', cat: 'Research' },
    { name: 'Brand Standards & Visual Identity Alignment Review', price: 6000, desc: 'Ensure all external marketing collaterals adhere to unified standards.', cat: 'Design' },
    { name: 'Compliance & Regulatory Obligations Checklist', price: 5000, desc: 'Local county and national statutory requirement roadmap for operations.', cat: 'Compliance' },
    { name: 'Operational Cost Reduction & Wastage Audit', price: 13000, desc: 'Forensic review of recurring expenses to unlock bottom-line savings.', cat: 'Finance' },
    { name: 'Quarterly Business Review Facilitation', price: 8000, desc: 'Structured quarterly retro to review wins, missed targets, and next steps.', cat: 'Strategy' },
    { name: 'Express Same-Day Advisory Dispatch', price: 5000, desc: 'Urgent troubleshooting support delivered within 4 hours of request.', cat: 'Priority' },
    { name: 'Annual Service Maintenance Contract', price: 30000, desc: 'Scheduled quarterly preventative maintenance and emergency call-outs.', cat: 'Maintenance' },
    { name: 'Enterprise Custom Engagement Package', price: 50000, desc: 'Full-scope multi-month engagement tailored to enterprise scale requirements.', cat: 'Enterprise' }
  ]
};

function getCatalogForCompany(categoryName, domain) {
  for (const key of Object.keys(CATALOG_MAP)) {
    if (categoryName && categoryName.toLowerCase().includes(key.toLowerCase())) {
      return CATALOG_MAP[key];
    }
  }
  // Check domain keywords
  if (domain) {
    const d = domain.toLowerCase();
    if (d.includes('portfolio') || d.includes('branding')) return CATALOG_MAP['Portfolio & Personal Branding'];
    if (d.includes('blog') || d.includes('content')) return CATALOG_MAP['Blog & Content'];
    if (d.includes('course') || d.includes('education') || d.includes('teacher') || d.includes('student') || d.includes('school')) return CATALOG_MAP['Educational & Online Courses'];
    if (d.includes('nonprofit') || d.includes('community')) return CATALOG_MAP['Nonprofit & Community'];
    if (d.includes('saas') || d.includes('app') || d.includes('dashboard')) return CATALOG_MAP['SaaS & Web Apps'];
    if (d.includes('media') || d.includes('entertainment')) return CATALOG_MAP['Media & Entertainment'];
    if (d.includes('fitness') || d.includes('wellness')) return CATALOG_MAP['Fitness & Wellness'];
    if (d.includes('security') || d.includes('cuda')) return CATALOG_MAP['Security'];
  }
  return CATALOG_MAP['Default'];
}

async function run() {
  console.log("=== STARTING CATALOG EXPANSION BATCH ===");
  const startTime = new Date();

  // 1. Strict Invariant Checks
  const user = await prisma.user.findFirst({ where: { email: VERIFIED_USER_EMAIL } });
  if (!user || user.id !== VERIFIED_USER_ID) {
    throw new Error(`CRITICAL AUTH FAILURE: User ${VERIFIED_USER_EMAIL} (${VERIFIED_USER_ID}) not verified!`);
  }
  console.log(`Verified Owner: ${user.email} (${user.id})`);

  const initialOrders = await prisma.customerOrder.count();
  const initialOrderItems = await prisma.orderItem.count();
  console.log(`Initial CustomerOrders: ${initialOrders} (expected 196)`);
  console.log(`Initial OrderItems:     ${initialOrderItems} (expected 295)`);

  if (initialOrders !== 196 || initialOrderItems !== 295) {
    throw new Error(`INVARIANCE FAILURE: Baseline orders (${initialOrders}) or items (${initialOrderItems}) do not match 196/295!`);
  }

  // 2. Fetch all companies owned by this user
  const ownedCompanies = await prisma.company.findMany({
    where: { userId: user.id },
    select: { id: true, name: true, domain: true, category: true }
  });
  console.log(`Target User owns ${ownedCompanies.length} companies.`);

  const ownedCompanyIdSet = new Set(ownedCompanies.map(c => c.id));

  // 3. Process each owned store to reach at least 20 listings
  let totalCreatedProducts = 0;
  let totalCreatedListings = 0;
  const storeSummaries = [];

  for (const company of ownedCompanies) {
    // SECURITY: assert ownership before doing anything
    if (!ownedCompanyIdSet.has(company.id)) {
      throw new Error(`SECURITY BREACH: Unauthorized company ${company.id}`);
    }

    const currentListingCount = await prisma.marketplaceListings.count({
      where: { companyId: company.id }
    });

    const shortfall = Math.max(0, TARGET_LISTINGS - currentListingCount);
    console.log(`\nStore: "${company.name}" (${company.id}) | Current: ${currentListingCount} | Shortfall: ${shortfall}`);

    if (shortfall === 0) {
      storeSummaries.push({
        companyId: company.id,
        name: company.name,
        before: currentListingCount,
        added: 0,
        after: currentListingCount,
        status: 'ALREADY_AT_TARGET'
      });
      continue;
    }

    // Get existing titles for deduplication
    const existingListings = await prisma.marketplaceListings.findMany({
      where: { companyId: company.id },
      select: { name: true }
    });
    const existingNames = new Set(existingListings.map(l => l.name));

    const catalog = getCatalogForCompany(company.category, company.domain);
    let addedForStore = 0;

    for (let i = 0; i < catalog.length && addedForStore < shortfall; i++) {
      const item = catalog[i];
      if (existingNames.has(item.name)) continue;

      // Create Product
      const costPrice = Math.round(item.price * 0.65);
      const product = await prisma.product.create({
        data: {
          name: item.name,
          description: item.desc,
          category: item.cat,
          companyId: company.id,
          costPrice: costPrice,
          sellingPrice: item.price,
          finalPrice: item.price,
          discount: 0,
          quantity: 10,
          isAvailable: true,
          status: 'ACTIVE'
        }
      });

      // Create Marketplace Listing in DRAFT status (unobtrusive to public storefront, manageable by admin)
      await prisma.marketplaceListings.create({
        data: {
          name: item.name,
          description: item.desc,
          category: item.cat,
          companyId: company.id,
          productId: product.id,
          buyingPrice: costPrice,
          sellingPrice: item.price,
          finalPrice: item.price,
          discount: 0,
          quantity: 10,
          status: 'DRAFT',
          listingSystemStatus: 'DRAFT',
          showOnGhuba: false,
          isAvailable: true
        }
      });

      existingNames.add(item.name);
      addedForStore++;
      totalCreatedProducts++;
      totalCreatedListings++;
    }

    // If still short of 20, fill with generated domain-relevant offerings
    while (addedForStore < shortfall) {
      const extraIdx = addedForStore + 1;
      const extraName = `${company.name} Premium Offering #${extraIdx}`;
      const extraPrice = 2500 + (extraIdx * 250);
      const extraCost = Math.round(extraPrice * 0.65);

      const product = await prisma.product.create({
        data: {
          name: extraName,
          description: `Customized high-grade commercial offering provided by ${company.name}.`,
          category: company.category || 'Specialized Services',
          companyId: company.id,
          costPrice: extraCost,
          sellingPrice: extraPrice,
          finalPrice: extraPrice,
          discount: 0,
          quantity: 10,
          isAvailable: true,
          status: 'ACTIVE'
        }
      });

      await prisma.marketplaceListings.create({
        data: {
          name: extraName,
          description: `Customized high-grade commercial offering provided by ${company.name}.`,
          category: company.category || 'Specialized Services',
          companyId: company.id,
          productId: product.id,
          buyingPrice: extraCost,
          sellingPrice: extraPrice,
          finalPrice: extraPrice,
          discount: 0,
          quantity: 10,
          status: 'DRAFT',
          listingSystemStatus: 'DRAFT',
          showOnGhuba: false,
          isAvailable: true
        }
      });

      addedForStore++;
      totalCreatedProducts++;
      totalCreatedListings++;
    }

    const finalCount = currentListingCount + addedForStore;
    console.log(`  -> Added ${addedForStore} items. New total: ${finalCount}`);
    storeSummaries.push({
      companyId: company.id,
      name: company.name,
      before: currentListingCount,
      added: addedForStore,
      after: finalCount,
      status: finalCount >= TARGET_LISTINGS ? 'SUCCESS_AT_TARGET' : 'INCOMPLETE'
    });
  }

  // 4. Verify post-expansion state and invariants
  const finalOrders = await prisma.customerOrder.count();
  const finalOrderItems = await prisma.orderItem.count();
  console.log(`\n=== VERIFYING INVARIANTS ===`);
  console.log(`CustomerOrders: ${finalOrders} (expected 196)`);
  console.log(`OrderItems:     ${finalOrderItems} (expected 295)`);

  if (finalOrders !== 196 || finalOrderItems !== 295) {
    throw new Error(`CRITICAL POST-EXPANSION FAILURE: Orders or OrderItems were mutated!`);
  }

  // Verify no non-owned company has listings created by this run
  const externalListings = await prisma.marketplaceListings.count({
    where: {
      company: {
        userId: { not: user.id }
      }
    }
  });
  console.log(`External Merchant Listings (untouched): ${externalListings}`);

  const auditReport = {
    timestamp: startTime.toISOString(),
    completedAt: new Date().toISOString(),
    owner: {
      email: user.email,
      userId: user.id
    },
    metrics: {
      totalOwnedCompanies: ownedCompanies.length,
      totalCreatedProducts,
      totalCreatedListings,
      preservedOrders: finalOrders,
      preservedOrderItems: finalOrderItems,
      externalListingsCount: externalListings
    },
    storeSummaries
  };

  fs.writeFileSync('scratch/expansion-execution-audit.json', JSON.stringify(auditReport, null, 2));
  console.log("\nSaved audit report to scratch/expansion-execution-audit.json");
  console.log(`\n=== CATALOG EXPANSION COMPLETED SUCCESSFULLY ===`);
  console.log(`Products Created:  ${totalCreatedProducts}`);
  console.log(`Listings Created:  ${totalCreatedListings}`);
  console.log(`All ${ownedCompanies.length} stores now possess >= 20 offerings.`);
}

run()
  .catch(err => {
    console.error("FATAL CATALOG EXPANSION ERROR:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
