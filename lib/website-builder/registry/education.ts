/**
 * lib/website-builder/registry/education.ts
 * Template group: education (3 templates)
 */

import {
  TemplateDefinition,
  AuthenticSectionDefinition,
} from "@/types/website-builder";
import {
  makeEcommercePages,
  makeBookingPages,
  makeCoursePages,
  makeShell,
} from "./helpers";

/* =========================================================================
   AUTHENTIC SECTION DEFINITIONS
   ========================================================================= */

export const COURSES_SECTIONS: AuthenticSectionDefinition[] = [
  {
    id: "courses-hero",
    name: "Academy Hero Showcase",
    component: "HeroSection",
    type: "hero",
    category: "hero",
    editableProps: ["headline", "subline", "buttonText"],
    defaultContent: {
      headline: "Master In-Demand Skills with Industry Leaders",
      subline: "Accredited online courses, masterclasses and live mentor workshops.",
      buttonText: "Explore Courses",
    },
  },
  {
    id: "glass-info-cards",
    name: "Learning Pillars & Value Props",
    component: "GlassInfoCardsSection",
    type: "featuresBadges",
    category: "content",
    editableProps: ["title", "subtitle"],
    defaultContent: { title: "Why Learn With Us", subtitle: "Flexible paced learning with recognized certifications" },
  },
  {
    id: "school-overview",
    name: "School & Faculty Overview",
    component: "SchoolSection",
    type: "imageWithText",
    category: "content",
    editableProps: ["title", "subtitle", "description"],
    defaultContent: { title: "About Our Academy", subtitle: "Empowering learners across Africa with practical skills." },
  },
  {
    id: "main-courses",
    name: "Course Catalog & Programs",
    component: "MainCoursesSection",
    type: "productGrid",
    category: "commerce",
    editableProps: ["title", "limit"],
    defaultContent: { title: "Featured Certificate Courses", limit: 6 },
    dataSource: { type: "products", filter: "featured", limit: 6 },
  },
  {
    id: "courses-about",
    name: "Curriculum Methodology",
    component: "AboutSection",
    type: "imageWithText",
    category: "content",
    editableProps: ["title", "description"],
    defaultContent: { title: "Hands-on Project Based Curriculum", description: "Graduate with a job-ready portfolio of real client work." },
  },
  {
    id: "courses-testimonials",
    name: "Student & Alumni Reviews",
    component: "TestimonialsSection",
    type: "testimonials",
    category: "social",
    editableProps: ["title"],
    defaultContent: { title: "What Our Alumni Say" },
    dataSource: { type: "testimonials" },
  },
  {
    id: "popular-blogs",
    name: "Learning Resources & Articles",
    component: "PopularBlogsSection",
    type: "imageWithText",
    category: "content",
    editableProps: ["title"],
    defaultContent: { title: "Latest Career & Tech Insights" },
  },
  {
    id: "courses-cta",
    name: "Enrollment Call to Action",
    component: "CtaSection",
    type: "ctaBanner",
    category: "conversion",
    editableProps: ["title", "buttonText", "buttonLink"],
    defaultContent: { title: "Start Your Learning Journey Today", buttonText: "Enroll Now", buttonLink: "/courses" },
  },
  {
    id: "courses-faqs",
    name: "Admissions & Tuition FAQs",
    component: "FAQSection",
    type: "faq",
    category: "content",
    editableProps: ["title"],
    defaultContent: { title: "Frequently Asked Questions", subtitle: "Information on payments, certificates and schedules." },
  },
];

export const COURSES_3_SECTIONS: AuthenticSectionDefinition[] = [
  {
    id: "courses-hero",
    name: "Bootcamp Hero Showcase",
    component: "HeroSection",
    type: "hero",
    category: "hero",
    editableProps: ["headline", "subline", "buttonText"],
    defaultContent: { headline: "Master Practical Skills for the Future", subline: "Intensive, mentor-led programs designed for career acceleration.", buttonText: "Browse Courses" },
  },
  {
    id: "courses-school",
    name: "Academy Overview & Vision",
    component: "SchoolSection",
    type: "imageWithText",
    category: "content",
    editableProps: ["title", "description"],
    defaultContent: { title: "About Our Academy", description: "Empowering learners through structured curricula and real-world projects." },
  },
  {
    id: "courses-main-courses",
    name: "Featured Courses Grid",
    component: "MainCoursesSection",
    type: "productGrid",
    category: "commerce",
    editableProps: ["title", "subtitle"],
    defaultContent: { title: "Featured Courses", subtitle: "Curated learning paths taught by industry veterans" },
  },
  {
    id: "courses-about",
    name: "Methodology & Mentorship",
    component: "AboutSection",
    type: "imageWithText",
    category: "content",
    editableProps: ["title", "description"],
    defaultContent: { title: "Learning Methodology", description: "Hands-on assignments, 1-on-1 code reviews, and lifelong alumni community." },
  },
  {
    id: "courses-testimonials",
    name: "Student Testimonials",
    component: "TestimonialsSection",
    type: "testimonials",
    category: "social",
    editableProps: ["title"],
    defaultContent: { title: "Success Stories from Graduates" },
  },
  {
    id: "courses-popular-blogs",
    name: "Learning Resources & Articles",
    component: "PopularBlogsSection",
    type: "custom",
    category: "content",
    editableProps: ["title"],
    defaultContent: { title: "Industry Insights & Tutorials" },
  },
  {
    id: "courses-cta",
    name: "Admissions Call-to-Action",
    component: "CtaSection",
    type: "ctaBanner",
    category: "conversion",
    editableProps: ["title", "buttonText"],
    defaultContent: { title: "Take the Next Step in Your Career", buttonText: "Apply Today" },
  },
  {
    id: "courses-faqs",
    name: "Admissions & Tuition FAQs",
    component: "FAQSection",
    type: "faq",
    category: "content",
    editableProps: ["title"],
    defaultContent: { title: "Frequently Asked Questions" },
  },
];

/* =========================================================================
   TEMPLATE DEFINITIONS
   ========================================================================= */

export const EDUCATION_TEMPLATES: Record<string, TemplateDefinition> = {
  // 23. COURSES - LAYOUT 1
  "courses@v1": {
    id: "courses@v1",
    version: "1.0.0",
    name: "Online Academy & Courses (Layout 1)",
    category: "courses",
    variant: "default",
    shellLayout: "CoursesLayout",
    bodyComponent: "CoursesSite",
    capabilities: ["courses", "cart_checkout", "reviews"],
    defaultTheme: {
      primaryColor: "#4F46E5",
      secondaryColor: "#0EA5E9",
      accentColor: "#10B981",
      headingFont: "Inter, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "lg",
      cardRadius: "xl",
    },
    defaultPages: makeCoursePages("courses"),
    authenticSections: COURSES_SECTIONS,
    shell: makeShell("Header", "Footer", [
      { id: "nav-courses", label: "Courses", url: "/courses" },
      { id: "nav-curriculum", label: "Programs", url: "/programs" },
      { id: "nav-about", label: "About", url: "/about" },
      { id: "nav-contact", label: "Contact", url: "/contact" },
    ]),
  },
  // 24. COURSES - LAYOUT 2
  "courses-2@v1": {
    id: "courses-2@v1",
    version: "1.0.0",
    name: "Modern University & Courses (Layout 2)",
    category: "courses",
    variant: "layout-2",
    shellLayout: "CoursesLayout2",
    bodyComponent: "CoursesSite2",
    capabilities: ["courses", "cart_checkout", "reviews"],
    defaultTheme: {
      primaryColor: "#0284C7",
      secondaryColor: "#F59E0B",
      accentColor: "#10B981",
      headingFont: "Montserrat, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "full",
      cardRadius: "2xl",
    },
    defaultPages: makeCoursePages("courses"),
    authenticSections: COURSES_SECTIONS,
    shell: makeShell("Header", "Footer", [
      { id: "nav-courses", label: "Courses", url: "/courses" },
      { id: "nav-about", label: "About", url: "/about" },
      { id: "nav-contact", label: "Contact", url: "/contact" },
    ]),
  },
  // 25. COURSES - LAYOUT 3
  "courses-3@v1": {
    id: "courses-3@v1",
    version: "1.0.0",
    name: "Executive Bootcamp (Layout 3)",
    category: "courses",
    variant: "layout-3",
    shellLayout: "CoursesLayout3",
    bodyComponent: "CoursesSite3",
    capabilities: ["courses", "cart_checkout", "reviews"],
    defaultTheme: {
      primaryColor: "#0F172A",
      secondaryColor: "#38BDF8",
      accentColor: "#F59E0B",
      headingFont: "Inter, sans-serif",
      bodyFont: "Inter, sans-serif",
      buttonRadius: "md",
      cardRadius: "lg",
    },
    defaultPages: makeCoursePages("courses"),
    authenticSections: COURSES_3_SECTIONS,
    shell: makeShell("Header", "Footer", [
      { id: "nav-courses", label: "Courses", url: "/courses" },
      { id: "nav-about", label: "About", url: "/about" },
      { id: "nav-contact", label: "Contact", url: "/contact" },
    ]),
  },
};
